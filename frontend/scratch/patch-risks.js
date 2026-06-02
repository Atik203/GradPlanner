const fs = require('fs');
const path = require('path');

const filePath = 'e:/PROJECT/GradPlanner/frontend/public/countries/country-risks.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const newCountries = [
  {
    country: "Austria",
    countryCode: "AT",
    overallRiskScore: 40,
    confidenceScore: 80,
    riskLevel: "MODERATE",
    risks: {
      housingRisk: { score: 60, level: "MODERATE", summary: "Vienna housing is relatively affordable compared to Munich or London, but rising. Social housing is excellent but hard to access for new expats.", trend: "WORSENING" },
      economicRisk: { score: 35, level: "LOW-MODERATE", summary: "Stable economy heavily tied to Germany. Inflation stabilizing.", trend: "STABLE" },
      inflationRisk: { score: 45, level: "MODERATE", summary: "Has seen higher inflation than EU average, but normalizing to 3%.", trend: "IMPROVING" },
      antiImmigrationRisk: { score: 70, level: "HIGH", summary: "FPÖ (far-right) gained significant ground in 2024 elections. Anti-immigrant rhetoric increasing, though skilled migration pathways (Red-White-Red card) remain intact.", trend: "WORSENING" },
      climateRisk: { score: 20, level: "LOW", summary: "Very safe. Some risk of Alpine flooding, but minimal impact on major tech hubs.", trend: "STABLE" },
      warRisk: { score: 10, level: "VERY LOW", summary: "Neutral country outside NATO. High geopolitical stability.", trend: "STABLE" },
      jobMarketRisk: { score: 55, level: "MODERATE", summary: "Small tech market compared to Germany. Heavy reliance on German language skills makes market penetration risky for English-only speakers.", trend: "STABLE" },
      politicalRisk: { score: 65, level: "MODERATE-HIGH", summary: "Right-wing populism creates uncertainty for long-term integration policy and citizenship accessibility.", trend: "WORSENING" }
    },
    keyWarnings: ["German language is essentially mandatory", "Citizenship pathway is a grueling 10 years", "Political shift rightward may tighten PR rules"],
    evidenceSummary: "Austria is economically stable but carries high political and integration risks for non-German speakers."
  },
  {
    country: "Belgium",
    countryCode: "BE",
    overallRiskScore: 38,
    confidenceScore: 78,
    riskLevel: "LOW-MODERATE",
    risks: {
      housingRisk: { score: 50, level: "MODERATE", summary: "Brussels and Ghent are manageable but competitive. Quality of older housing stock can be poor.", trend: "STABLE" },
      economicRisk: { score: 40, level: "MODERATE", summary: "High public debt. Economic growth slow. EU institutional presence provides a solid floor.", trend: "STABLE" },
      inflationRisk: { score: 40, level: "MODERATE", summary: "Wages are automatically indexed to inflation in Belgium, significantly protecting purchasing power.", trend: "IMPROVING" },
      antiImmigrationRisk: { score: 55, level: "MODERATE", summary: "Flanders (Vlaams Belang) shows strong anti-immigrant sentiment, but skilled labor is broadly accepted.", trend: "STABLE" },
      climateRisk: { score: 30, level: "LOW-MODERATE", summary: "Risk of flooding in certain regions, but generally safe.", trend: "STABLE" },
      warRisk: { score: 5, level: "VERY LOW", summary: "Hosts NATO and EU headquarters. Highly secure.", trend: "STABLE" },
      jobMarketRisk: { score: 45, level: "MODERATE", summary: "Bilingual/Trilingual requirements (French/Dutch) limit many roles for expats. Tech market is healthy but fragmented.", trend: "STABLE" },
      politicalRisk: { score: 50, level: "MODERATE", summary: "Chronic government formation issues (long periods without federal government), but bureaucracies function well regardless.", trend: "STABLE" }
    },
    keyWarnings: ["Taxation is among the highest in the world", "Language fragmentation (Flanders vs Wallonia) restricts mobility", "Automatic wage indexation protects against inflation"],
    evidenceSummary: "Belgium's main risks are financial (high taxes) and linguistic, rather than systemic or geopolitical."
  },
  {
    country: "New Zealand",
    countryCode: "NZ",
    overallRiskScore: 45,
    confidenceScore: 82,
    riskLevel: "MODERATE",
    risks: {
      housingRisk: { score: 85, level: "VERY HIGH", summary: "Auckland housing is globally unaffordable relative to local incomes. Supply shortage persists.", trend: "WORSENING" },
      economicRisk: { score: 65, level: "MODERATE-HIGH", summary: "Recessionary pressures in 2024. Small, isolated economy highly dependent on agriculture and China trade.", trend: "WORSENING" },
      inflationRisk: { score: 50, level: "MODERATE", summary: "Reserve Bank maintaining strict policy. Inflation cooling but living costs remain structurally high.", trend: "IMPROVING" },
      antiImmigrationRisk: { score: 30, level: "LOW", summary: "Generally welcoming. Policy focuses on managing numbers rather than ideological opposition.", trend: "STABLE" },
      climateRisk: { score: 40, level: "MODERATE", summary: "Earthquake risk (Wellington). Increasing extreme weather events (cyclones).", trend: "WORSENING" },
      warRisk: { score: 5, level: "VERY LOW", summary: "Geographically isolated. Excellent geopolitical safety.", trend: "STABLE" },
      jobMarketRisk: { score: 70, level: "HIGH", summary: "Very small tech ecosystem. Career ceiling is reached quickly. Brain drain to Australia is common.", trend: "WORSENING" },
      politicalRisk: { score: 20, level: "LOW", summary: "Highly stable democracy. Policy swings are generally moderate.", trend: "STABLE" }
    },
    keyWarnings: ["Housing costs are entirely disconnected from average tech salaries", "Career progression severely limited by market size", "Cost of living is extremely high due to import reliance"],
    evidenceSummary: "New Zealand's massive geopolitical safety is offset by significant economic constraints: a tiny tech market and a severe housing crisis."
  },
  {
    country: "Singapore",
    countryCode: "SG",
    overallRiskScore: 55,
    confidenceScore: 85,
    riskLevel: "MODERATE-HIGH",
    risks: {
      housingRisk: { score: 90, level: "VERY HIGH", summary: "Rent prices surged 30-40% post-pandemic. Expats cannot easily buy public housing (HDB). Private condos are exorbitantly expensive.", trend: "WORSENING" },
      economicRisk: { score: 20, level: "LOW", summary: "Extremely strong reserves, stable currency, global financial hub.", trend: "STABLE" },
      inflationRisk: { score: 40, level: "MODERATE", summary: "Imported inflation is a risk, but strong SGD mitigates it.", trend: "STABLE" },
      antiImmigrationRisk: { score: 75, level: "HIGH", summary: "Intense local pushback against foreign workers led to the COMPASS framework. PR approval is highly restricted and quota-based (hidden).", trend: "WORSENING" },
      climateRisk: { score: 60, level: "MODERATE-HIGH", summary: "Extreme heat and humidity worsening. Sea-level rise is an existential threat, though heavily mitigated by government engineering.", trend: "WORSENING" },
      warRisk: { score: 30, level: "LOW-MODERATE", summary: "Vulnerable to US-China tensions and South China Sea disruptions. Strong military defense.", trend: "STABLE" },
      jobMarketRisk: { score: 35, level: "LOW-MODERATE", summary: "Excellent tech market, but COMPASS framework makes it harder for companies to sponsor junior expats.", trend: "WORSENING" },
      politicalRisk: { score: 10, level: "VERY LOW", summary: "PAP dominance ensures long-term policy continuity. Highly stable.", trend: "STABLE" }
    },
    keyWarnings: ["PR and Citizenship are NOT guaranteed, regardless of income", "Housing costs will consume a massive portion of salary", "COMPASS points system favors experienced hires over fresh grads"],
    evidenceSummary: "Singapore offers unmatched economic stability but carries extreme risk regarding long-term settlement (PR) and cost of living."
  },
  {
    country: "France",
    countryCode: "FR",
    overallRiskScore: 50,
    confidenceScore: 80,
    riskLevel: "MODERATE",
    risks: {
      housingRisk: { score: 70, level: "HIGH", summary: "Paris housing is highly expensive and requires extreme documentation (garants). Provincial cities are much better.", trend: "STABLE" },
      economicRisk: { score: 55, level: "MODERATE", summary: "High public debt. Economic growth sluggish, but tech/AI investment (France 2030) is heavily subsidized.", trend: "STABLE" },
      inflationRisk: { score: 45, level: "MODERATE", summary: "Energy price caps protected citizens better than Germany/UK. Normalizing.", trend: "IMPROVING" },
      antiImmigrationRisk: { score: 65, level: "MODERATE-HIGH", summary: "RN (far-right) influence growing. However, 'Passeport Talent' for tech workers remains shielded from broader anti-immigration laws.", trend: "WORSENING" },
      climateRisk: { score: 35, level: "LOW-MODERATE", summary: "Summer heatwaves intensifying. Otherwise temperate.", trend: "WORSENING" },
      warRisk: { score: 15, level: "LOW", summary: "Nuclear power, strong military, EU core. Safe.", trend: "STABLE" },
      jobMarketRisk: { score: 50, level: "MODERATE", summary: "Tech market is growing (Mistral AI), but rigid labor laws make hiring/firing difficult. French language absolutely required.", trend: "STABLE" },
      politicalRisk: { score: 75, level: "HIGH", summary: "Post-2024 snap elections left a fractured parliament. Frequent protests and strikes disrupt infrastructure.", trend: "WORSENING" }
    },
    keyWarnings: ["Political instability and frequent strikes are guaranteed", "French language fluency is required for integration and most jobs", "Bureaucracy is notoriously slow and complex"],
    evidenceSummary: "France offers excellent AI opportunities but carries high political friction and bureaucratic risks."
  },
  {
    country: "United Arab Emirates",
    countryCode: "AE",
    overallRiskScore: 65,
    confidenceScore: 85,
    riskLevel: "MODERATE-HIGH",
    risks: {
      housingRisk: { score: 80, level: "HIGH", summary: "Dubai rents surged dramatically post-2022. RERA index caps existing tenants, but new leases are very expensive.", trend: "WORSENING" },
      economicRisk: { score: 40, level: "MODERATE", summary: "Diversifying away from oil, but still vulnerable to global energy shocks. Currency pegged to USD.", trend: "STABLE" },
      inflationRisk: { score: 50, level: "MODERATE", summary: "Hidden inflation in schooling, housing, and healthcare fees.", trend: "WORSENING" },
      antiImmigrationRisk: { score: 10, level: "VERY LOW", summary: "88% of population is expat. System is designed entirely around foreign labor.", trend: "STABLE" },
      climateRisk: { score: 90, level: "VERY HIGH", summary: "Extreme heat rendering summers unlivable outdoors. 2024 flooding exposed infrastructure vulnerabilities to climate shifts.", trend: "WORSENING" },
      warRisk: { score: 50, level: "MODERATE", summary: "Geopolitically volatile region (Middle East tensions, Iran proximity), though UAE itself maintains neutrality and high internal security.", trend: "STABLE" },
      jobMarketRisk: { score: 55, level: "MODERATE", summary: "Highly competitive global talent pool. No minimum wage for expats. Visa tied strictly to employment unless Golden Visa is obtained.", trend: "STABLE" },
      politicalRisk: { score: 85, level: "VERY HIGH", summary: "Absolute monarchy. No pathway to citizenship. Your right to remain can be revoked without legal recourse.", trend: "STABLE" }
    },
    keyWarnings: ["No permanent residency or citizenship pathway exists", "Cost of living (especially children's schooling) is exorbitant", "Extreme climate risk due to rising Gulf temperatures"],
    evidenceSummary: "The UAE provides a high-income, tax-free career accelerator, but carries extreme long-term risks regarding climate and lack of permanent settlement rights."
  }
];

// Append missing countries if not already there
newCountries.forEach(nc => {
  if (!data.countryRisks.find(c => c.country === nc.country)) {
    data.countryRisks.push(nc);
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('country-risks.json updated successfully!');
