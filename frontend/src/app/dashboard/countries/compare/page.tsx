"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { 
  Loader2, 
  ArrowLeft, 
  Globe, 
  Plus, 
  X, 
  Coins, 
  FileText, 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  Users,
  AlertTriangle,
  Award,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";

interface CountryListEntry {
  id: string;
  country: string;
  countryCode: string;
  overallScore: number;
  summary: any;
}

// BDT Conversion Rates (Approximate)
const BDT_RATES: Record<string, number> = {
  USD: 125,
  EUR: 136,
  CAD: 92,
  AUD: 83,
  SEK: 11.9,
  NOK: 11.7,
  DKK: 18.2,
  CHF: 138,
  NZD: 76,
  JPY: 0.81,
  KRW: 0.091,
  SGD: 93,
  CNY: 17.3,
  AED: 34.0,
  GBP: 160
};

export default function CountryComparePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);

  const [countries, setCountries] = useState<CountryListEntry[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [comparedData, setComparedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [list, profileData] = await Promise.all([
          fetchApi("/api/v1/countries"),
          fetchApi("/api/v1/profile").catch(() => null)
        ]);
        setCountries(list || []);
        if (profileData) {
          dispatch(setProfile(profileData));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load country list.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dispatch]);

  // Fetch full details when selectedCodes changes
  useEffect(() => {
    if (selectedCodes.length === 0) {
      setComparedData([]);
      return;
    }

    async function loadComparedDetails() {
      try {
        setFetchingDetails(true);
        const details = await Promise.all(
          selectedCodes.map((code) => fetchApi(`/api/v1/countries/${code.toLowerCase()}`))
        );
        setComparedData(details);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch country comparison details.");
      } finally {
        setFetchingDetails(false);
      }
    }

    loadComparedDetails();
  }, [selectedCodes]);

  const toggleSelectCountry = (code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter((c) => c !== code));
    } else {
      if (selectedCodes.length >= 4) {
        return; // Max 4 countries
      }
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const getCurrencyRate = (currencyStr: string) => {
    const base = currencyStr?.split("/")[0]?.trim() || "USD";
    return BDT_RATES[base] || 1;
  };

  const convertToBdt = (amount: number, currencyStr: string) => {
    const rate = getCurrencyRate(currencyStr);
    const result = amount * rate;
    if (result >= 100000) {
      return `${(result / 100000).toFixed(1)}L BDT`;
    }
    return `${Math.round(result).toLocaleString()} BDT`;
  };

  const getVisaScore = (data: any) => {
    const level = data.visa?.studentVisa?.difficultyLevel || "Moderate";
    if (level.includes("Low")) return 90;
    if (level.includes("High")) return 40;
    return 70; // Moderate
  };

  const getTuitionNumeric = (data: any) => {
    const livingCosts = data.livingCosts;
    if (!livingCosts) return 0;
    const tuitionObj = livingCosts.studentPhase?.annualTuitionRange?.mscs;
    if (!tuitionObj) return 0;
    const valStr = tuitionObj.localCurrency || tuitionObj.usd || "0";
    if (typeof valStr === "number") return valStr;
    if (valStr.toLowerCase() === "free" || valStr.toLowerCase() === "0") return 0;
    const parts = valStr.split("-").map((p: string) => parseFloat(p.replace(/[^0-9.]/g, "")));
    if (parts.length === 2) {
      return (parts[0] + parts[1]) / 2;
    }
    return parts[0] || 0;
  };

  // Personalized advice generator
  const getAdvisorRecommendations = () => {
    if (!profile || comparedData.length === 0) return [];
    
    const recommendations: { type: "info" | "warning" | "success"; text: string }[] = [];
    const hasUS = comparedData.some(c => c.countryCode.toLowerCase() === "us");
    const hasCA = comparedData.some(c => c.countryCode.toLowerCase() === "ca");
    const hasAU = comparedData.some(c => c.countryCode.toLowerCase() === "au");
    const hasDE = comparedData.some(c => c.countryCode.toLowerCase() === "de");
    const hasAE = comparedData.some(c => c.countryCode.toLowerCase() === "ae");

    const prPriority = profile.prPriority ?? 3;
    const budget = profile.monthlyBudgetUSD;
    const ielts = profile.ieltsScore;
    const family = profile.familyRelocation;

    // 1. Budget Warnings
    if (budget) {
      comparedData.forEach(c => {
        const summary = c.summary || {};
        const currency = summary.averageLivingCostCurrency?.split("/")[0]?.trim() || "USD";
        const rate = BDT_RATES[currency] || 1;
        const usdRate = BDT_RATES["USD"] || 118;
        const livingCostUSD = (summary.averageLivingCost * rate) / usdRate;

        if (budget < livingCostUSD) {
          recommendations.push({
            type: "warning",
            text: `**${c.country} Budget Alert:** Average student living costs of ~${Math.round(livingCostUSD)} USD/mo exceed your specified budget of ${budget} USD/mo. You will need strong scholarship support.`
          });
        }
      });
    }

    // 2. Germany Advantage
    if (hasDE && budget && budget < 1500) {
      recommendations.push({
        type: "success",
        text: `**Germany Zero-Tuition Advantage:** Public universities have no tuition fees. This matches your budget profile since you only need to fund living expenses (~€900-1,200/mo) via a Blocked Account.`
      });
    }

    // 3. PR Priority Alerts
    if (prPriority >= 3) {
      if (hasUS) {
        recommendations.push({
          type: "warning",
          text: `**USA Green Card Backlog:** While US offers top tier salaries, Bangladeshi nationals face an estimated 70+ year backlog for EB-2/EB-3. It is not a reliable PR route compared to other options.`
        });
      }
      if (hasAE) {
        recommendations.push({
          type: "warning",
          text: `**UAE Residency Limit:** UAE does not offer a path to citizenship or permanent residency. The Golden Visa is a 10-year renewable permit but lacks immigration PR rights.`
        });
      }
      if (hasCA || hasAU) {
        const matching = [hasCA ? "Canada" : "", hasAU ? "Australia" : ""].filter(Boolean).join(" and ");
        recommendations.push({
          type: "success",
          text: `**Optimal PR Pathways:** ${matching} are exceptional matches for your high PR priority. Both offer direct skilled immigration routes for international graduates.`
        });
      }
    }

    // 4. Family Rights
    if (family) {
      comparedData.forEach(c => {
        const summary = c.summary || {};
        if (summary.allowsSpouseWork) {
          recommendations.push({
            type: "success",
            text: `**${c.country} Family-Friendly:** Spouses have full open work permit rights during your study program, helping secure dual income.`
          });
        } else if (c.countryCode.toLowerCase() === "us") {
          recommendations.push({
            type: "warning",
            text: `**USA Family Restrictions:** US F-2 dependent visas strictly prohibit spouses from working. Consider other destinations if spouse employment is a priority.`
          });
        }
      });
    }

    // 5. Canada SDS Visa Tip
    if (ielts && ielts < 6.5 && hasCA) {
      recommendations.push({
        type: "info",
        text: `**Canada SDS Visa Tip:** To unlock the faster Student Direct Stream (SDS) visa processing for Bangladesh, you need IELTS 6.0+ in each band. Try to boost your score to 6.5+ for a stronger admission profile.`
      });
    }

    return recommendations;
  };

  const matrixRows = [
    {
      name: "Funding & Scholarships",
      icon: <Coins className="h-4 w-4 text-emerald-400 font-semibold" />,
      getRawScore: (data: any) => data.summary?.scholarshipScore || 0,
      getValue: (data: any) => {
        const score = data.summary?.scholarshipScore || 0;
        const scholarships = data.scholarships || [];
        const topSch = scholarships.slice(0, 2).map((s: any) => s.scholarshipName || s.name).join(", ");
        return {
          display: `Score: ${score}/100`,
          subtext: topSch ? `Top: ${topSch}` : "General government waivers available"
        };
      }
    },
    {
      name: "Admission Chance",
      icon: <Award className="h-4 w-4 text-indigo-400 font-semibold" />,
      getRawScore: (data: any) => data.summary?.admissionScore || 0,
      getValue: (data: any) => {
        const score = data.summary?.admissionScore || 0;
        const qsAvg = data.ranking?.qsRankAvg;
        return {
          display: `Score: ${score}/100`,
          subtext: qsAvg ? `Avg QS Rank: #${qsAvg}` : "Varied entry requirements"
        };
      }
    },
    {
      name: "Job Market & Careers",
      icon: <Briefcase className="h-4 w-4 text-purple-400 font-semibold" />,
      getRawScore: (data: any) => data.summary?.jobMarketScore || 0,
      getValue: (data: any) => {
        const score = data.summary?.jobMarketScore || 0;
        const demand = data.jobMarket?.demandLevel || "High";
        const hubs = data.jobMarket?.majorHubs?.slice(0, 2).join(", ");
        return {
          display: `Score: ${score}/100 (${demand})`,
          subtext: hubs ? `Hubs: ${hubs}` : "Capital region tech cluster"
        };
      }
    },
    {
      name: "PR & Immigration Pathway",
      icon: <ShieldCheck className="h-4 w-4 text-blue-400 font-semibold" />,
      getRawScore: (data: any) => data.summary?.prScore || 0,
      getValue: (data: any) => {
        const score = data.summary?.prScore || 0;
        const timeline = data.prPathways?.estimatedYearsFromGraduation || "2-4";
        const pathway = data.prPathways?.primaryPathwayName || "Skilled Migration";
        return {
          display: `Score: ${score}/100`,
          subtext: `${timeline} yrs to PR via ${pathway}`
        };
      }
    },
    {
      name: "Family Relocation Rights",
      icon: <Users className="h-4 w-4 text-teal-400 font-semibold" />,
      getRawScore: (data: any) => data.summary?.familyScore || 0,
      getValue: (data: any) => {
        const score = data.summary?.familyScore || 0;
        const spouse = data.summary?.allowsSpouseWork ? "Spouse Work: Allowed" : "Spouse Work: Restricted";
        const children = data.summary?.allowsDependentChildren ? "Children: Allowed" : "Children: Restricted";
        return {
          display: `Score: ${score}/100`,
          subtext: `${spouse} · ${children}`
        };
      }
    },
    {
      name: "Visa Process & Risks",
      icon: <FileText className="h-4 w-4 text-amber-400 font-semibold" />,
      getRawScore: (data: any) => getVisaScore(data),
      getValue: (data: any) => {
        const level = data.visa?.studentVisa?.difficultyLevel || "Moderate";
        const wait = data.visa?.dhakaEmbassyWaitTime || "2-4 months";
        const rejection = data.visa?.studentVisa?.rejectionRiskBangladesh?.split(" ")[0] || "Moderate";
        return {
          display: `Difficulty: ${level}`,
          subtext: `Dhaka Wait: ${wait} · Risk: ${rejection}`
        };
      }
    },
    {
      name: "Median STEM Salary",
      icon: <Coins className="h-4 w-4 text-yellow-400 font-semibold" />,
      getRawScore: (data: any) => {
        const salaryVal = data.summary?.medianSalary || 0;
        const currency = data.summary?.medianSalaryCurrency || "USD";
        return salaryVal * getCurrencyRate(currency);
      },
      getValue: (data: any) => {
        const salaryVal = data.summary?.medianSalary || 0;
        const currency = data.summary?.medianSalaryCurrency || "USD";
        const bdtEquivalent = convertToBdt(salaryVal, currency);
        return {
          display: `${salaryVal.toLocaleString()} ${currency}/yr`,
          subtext: `BDT Equiv: ~${bdtEquivalent}`
        };
      }
    },
    {
      name: "Affordability / Cost",
      icon: <Coins className="h-4 w-4 text-rose-400 font-semibold" />,
      getRawScore: (data: any) => {
        const summary = data.summary || {};
        const currency = summary.averageLivingCostCurrency?.split("/")[0]?.trim() || "USD";
        const tuitionLocal = getTuitionNumeric(data);
        const livingLocal = summary.averageLivingCost || 0;
        const totalLocal = (livingLocal * 12) + tuitionLocal;
        const rate = getCurrencyRate(currency);
        return -totalLocal * rate; // Negative so that lowest cost wins
      },
      getValue: (data: any) => {
        const summary = data.summary || {};
        const currency = summary.averageLivingCostCurrency?.split("/")[0]?.trim() || "USD";
        const tuitionLocal = getTuitionNumeric(data);
        const livingLocal = summary.averageLivingCost || 0;
        const tuitionStr = data.livingCosts?.tuitionFeesRange || "Varies";
        return {
          display: `Living: ${livingLocal.toLocaleString()} ${currency}/mo`,
          subtext: `Tuition: ${tuitionStr} (Est. Total BDT: ${convertToBdt((livingLocal * 12) + tuitionLocal, currency)}/yr)`
        };
      }
    }
  ];

  const recommendations = getAdvisorRecommendations();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Compare Countries</h2>
          <p className="text-muted-foreground text-sm">Select up to 4 countries to run side-by-side admission and immigration simulations.</p>
        </div>
      </div>

      {/* Selector Grid */}
      <Card className="border-border/60 bg-card/30 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Select Countries ({selectedCodes.length}/4)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Select countries below to compare details instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => {
              const isSelected = selectedCodes.includes(c.countryCode);
              return (
                <button
                  key={c.countryCode}
                  onClick={() => toggleSelectCountry(c.countryCode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-xs"
                      : "bg-muted/30 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.country}
                  {isSelected ? (
                    <X className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Comparisons */}
      {fetchingDetails ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : comparedData.length > 0 ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Personalized Advisor Panel */}
          {recommendations.length > 0 && (
            <Card className="border-primary/20 bg-linear-to-r from-primary/5 to-emerald-500/5 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  Personalized Match Advisor
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Custom guidance generated matching your GPA, IELTS, budget, and family relocation preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-muted-foreground items-start leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/40">
                      {rec.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : rec.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      )}
                      <span>
                        {rec.text.split("**").map((part, i) => i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tabular Comparison Grid */}
          <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/25 shadow-xs">
            <table className="w-full border-collapse text-left text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="p-4 font-bold text-foreground text-xs uppercase tracking-wider w-[240px]">Dimension</th>
                  {comparedData.map((data) => (
                    <th key={data.countryCode} className="p-4 text-center border-l border-border/40 font-semibold">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                          Overall Match: {data.overallScore}%
                        </span>
                        <div className="font-black text-foreground text-base mt-1">{data.country}</div>
                        <div className="text-[9px] text-muted-foreground font-mono font-bold uppercase">{data.countryCode}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {matrixRows.map((row) => {
                  const countryScores = comparedData.map((data) => ({
                    code: data.countryCode,
                    score: row.getRawScore(data),
                  }));
                  
                  const maxScore = Math.max(...countryScores.map(cs => cs.score));
                  
                  return (
                    <tr key={row.name} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-semibold text-foreground flex items-center gap-2.5 text-xs">
                        {row.icon}
                        <span>{row.name}</span>
                      </td>
                      {comparedData.map((data) => {
                        const score = row.getRawScore(data);
                        const isWinner = score === maxScore && maxScore !== 0;
                        const cellData = row.getValue(data);
                        
                        return (
                          <td 
                            key={data.countryCode} 
                            className={`p-4 text-center border-l border-border/40 transition-all ${
                              isWinner ? "bg-emerald-500/5" : ""
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center space-y-1">
                              {isWinner && (
                                <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full mb-1 border border-emerald-500/20">
                                  ★ WINNER
                                </span>
                              )}
                              <div className="text-xs text-foreground font-extrabold">{cellData.display}</div>
                              {cellData.subtext && (
                                <div className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px]">
                                  {cellData.subtext}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Visual SVG Comparison Chart */}
          <Card className="border-border/60 bg-card/25">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">Score Visual Matrix</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Visual parameter scores compared side-by-side.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {comparedData.map((data) => {
                const summary = data.summary || {};
                return (
                  <div key={data.countryCode} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{data.country}</span>
                      <span className="text-muted-foreground">Overall Score: {data.overallScore}/100</span>
                    </div>
                    {/* Visual bar comparisons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      {/* PR Score */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>PR Ease</span>
                          <span>{summary.prScore}%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${summary.prScore}%` }} />
                        </div>
                      </div>
                      {/* Job Market */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>AI Job Market</span>
                          <span>{summary.jobMarketScore}%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${summary.jobMarketScore}%` }} />
                        </div>
                      </div>
                      {/* Living cost relative */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Living Cost Index</span>
                          <span>{summary.housingScore}%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${summary.housingScore}%` }} />
                        </div>
                      </div>
                      {/* Future proof */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Future Outlook</span>
                          <span>{summary.futureProofScore}%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${summary.futureProofScore}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>
      ) : (
        <EmptyState
          icon={Globe}
          title="Select Countries to Compare"
          description="Use the country checklist selector above to add up to 4 countries for side-by-side matrices."
          className="py-16"
        />
      )}

    </div>
  );
}
