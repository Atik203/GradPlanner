export interface CountryIntelligence {
  country: string;
  visaReality: string;
  prPathway: string;
  fundingSources: string;
  tags: { label: string; type: "success" | "warning" | "destructive" | "default" }[];
}

export function getCountryIntelligence(countryName: string): CountryIntelligence {
  const c = countryName.toLowerCase();
  
  if (c.includes("germany")) {
    return {
      country: "Germany",
      visaReality: "APS Certificate is MANDATORY for BD nationals (takes 6-8 weeks). Student visa appointment currently has a 2.5+ year wait in Dhaka. Blocked account (Fintiba/Coracle) required.",
      prPathway: "Excellent via EU Blue Card. PR possible in 21 months with B1 German, or 33 months with basic German.",
      fundingSources: "DAAD Scholarships (full funding), or public universities which often have zero/low tuition (requires living cost coverage).",
      tags: [{ label: "Low Tuition", type: "success" }, { label: "High Visa Wait", type: "warning" }, { label: "Strong PR", type: "success" }]
    };
  }
  
  if (c.includes("canada")) {
    return {
      country: "Canada",
      visaReality: "BD rejection rate is ~22%. Highly recommended to apply via SDS (Student Direct Stream) which reduces processing to ~10 days. SDS requires IELTS 6.0+, CAD 10,000 GIC, upfront medical, and 1-year tuition paid.",
      prPathway: "Fastest PR route for BD nationals. Express Entry CEC: 1 year of skilled work leads to PR typically within 6-12 months.",
      fundingSources: "Primarily thesis-based master's/PhDs provide research assistantships. Look for Vanier CGS or university-specific entrance scholarships.",
      tags: [{ label: "Fast PR", type: "success" }, { label: "SDS Route", type: "default" }, { label: "High Cost", type: "warning" }]
    };
  }

  if (c.includes("united states") || c.includes("usa")) {
    return {
      country: "United States",
      visaReality: "F-1 visa rejection rate is ~15% for BD nationals. Having a TA/RA funding letter dramatically reduces rejection risk. SEVIS fee is USD 350 (non-refundable).",
      prPathway: "AVOID for PR purposes. EB-2/EB-3 employment-based green cards have a 70-90 year backlog for BD nationals.",
      fundingSources: "Top choice for fully-funded PhDs (TA/RA stipends of USD $18k-$35k/year). Master's funding is extremely rare.",
      tags: [{ label: "Top Research", type: "success" }, { label: "High Funding (PhD)", type: "success" }, { label: "No PR Path", type: "destructive" }]
    };
  }

  if (c.includes("australia")) {
    return {
      country: "Australia",
      visaReality: "Subclass 500 (student) visa has a low ~6% rejection rate and fast online processing.",
      prPathway: "Good PR pathway. 485 post-study work visa gives graduates 4-5 years. PR achieved via 189 (skilled independent) or 190 (state nomination) in 3-5 years.",
      fundingSources: "Australia Awards (full funding) or Destination Australia (regional). Highly competitive.",
      tags: [{ label: "Good PR Path", type: "success" }, { label: "Post-Study Work", type: "success" }, { label: "High Cost", type: "warning" }]
    };
  }
  
  if (c.includes("netherlands")) {
    return {
      country: "Netherlands",
      visaReality: "MVV (entry visa) required before travel. Tuberculosis test required post-arrival at GGD. Fees are around €400 total.",
      prPathway: "Good. Requires 5 years of legal residence (study + work) and passing the NT2 Dutch language exam.",
      fundingSources: "Holland Scholarship provides a €5,000 one-time grant. Full funding is rare for master's.",
      tags: [{ label: "Good PR Path", type: "success" }, { label: "Language Required", type: "warning" }]
    };
  }
  
  if (c.includes("sweden") || c.includes("finland")) {
    return {
      country: countryName,
      visaReality: "Standard Schengen student visa processing. Straightforward if funds are shown.",
      prPathway: "Finland: 4 years continuous residence (study counts since 2022 reform). Sweden: 4 years permanent residence with practical Swedish language requirements.",
      fundingSources: "Sweden: SI Scholarship (1-3% acceptance, full funding). Finland: Aalto/UHelsinki offer 25-100% tuition waivers.",
      tags: [{ label: "Good PR Path", type: "success" }, { label: "High Quality Life", type: "success" }]
    };
  }
  
  if (c.includes("arab emirates") || c.includes("uae") || c.includes("united arab")) {
    return {
      country: "UAE",
      visaReality: "University arranges student visa, near-zero rejection. Medical test post-arrival (HIV positive = denied residency).",
      prPathway: "No traditional PR pathway exists. Only Golden Visa (10-year renewable) for exceptional talent.",
      fundingSources: "MBZUAI offers full tuition + generous monthly stipend (~USD 2,530) for AI students.",
      tags: [{ label: "High Funding (AI)", type: "success" }, { label: "No PR Path", type: "destructive" }]
    };
  }

  if (c.includes("united kingdom") || c.includes("uk") || c === "england") {
    return {
      country: "United Kingdom",
      visaReality: "Straightforward Tier 4 student visa process if CAS is secured and funds are shown for 28 days.",
      prPathway: "Moderate. 2-year Graduate Route visa after graduation. PR (ILR) requires 5 years on a Skilled Worker visa.",
      fundingSources: "Chevening and Commonwealth Scholarships (full funding). Otherwise, mostly self-funded with high tuition.",
      tags: [{ label: "High Cost", type: "warning" }, { label: "2yr Post-Study", type: "success" }]
    };
  }

  if (c.includes("ireland")) {
    return {
      country: "Ireland",
      visaReality: "High rejection rate historically for BD, but improving. Requires strong financial evidence and clean history.",
      prPathway: "Excellent PR route. 2-year post-study work visa (Stamp 1G) -> Stamp 4 -> citizenship after 5 years total residence.",
      fundingSources: "Government of Ireland International Education Scholarship (GOI-IES). Limited university funding.",
      tags: [{ label: "Strong PR", type: "success" }, { label: "High Cost", type: "warning" }]
    };
  }

  if (c.includes("japan")) {
    return {
      country: "Japan",
      visaReality: "Student visa is very straightforward once the Certificate of Eligibility (CoE) is issued by the university.",
      prPathway: "Requires 10 years of residence. Practically requires JLPT N2/N1 fluency for good integration and long-term jobs.",
      fundingSources: "MEXT Scholarship (Full tuition + ¥144,000/month). Excellent for engineering and robotics.",
      tags: [{ label: "High Funding", type: "success" }, { label: "Language Required", type: "warning" }]
    };
  }

  if (c.includes("korea")) {
    return {
      country: "South Korea",
      visaReality: "Strict financial document requirements from Korean Embassy in Dhaka. Apostille required for degree certificates.",
      prPathway: "Possible via F-5 permanent residence after 5 years of legal stay + TOPIK Level 4 proficiency.",
      fundingSources: "Global Korea Scholarship (GKS) provides full tuition + KRW 1,000,000/month stipend.",
      tags: [{ label: "High Funding", type: "success" }, { label: "Language Required", type: "warning" }]
    };
  }

  if (c.includes("china")) {
    return {
      country: "China",
      visaReality: "X1 student visa process is highly streamlined. Medical exam required before and after arrival.",
      prPathway: "No realistic PR pathway for foreign nationals.",
      fundingSources: "Chinese Government Scholarship (CSC) offers full tuition + ¥3,000/month (MSc) / ¥3,500 (PhD).",
      tags: [{ label: "High Funding", type: "success" }, { label: "No PR Path", type: "destructive" }]
    };
  }

  // Default fallback
  return {
    country: countryName,
    visaReality: "Standard student visa process applies. Requires proof of sufficient funds and university acceptance.",
    prPathway: "Standard post-study work routes may apply, but PR is not guaranteed and requires employer sponsorship.",
    fundingSources: "Check university-specific scholarships and government grants (e.g., Chevening for UK, MEXT for Japan, CSC for China).",
    tags: [{ label: "Standard Process", type: "default" }]
  };
}
