const fs = require('fs');

const taxPath = 'e:/PROJECT/GradPlanner/frontend/public/countries/taxation.json';
let taxData = JSON.parse(fs.readFileSync(taxPath, 'utf8'));

const newTaxCountries = [
  {
    country: "Austria",
    countryCode: "AT",
    currency: "EUR",
    overallTaxScore: 40,
    confidenceScore: 85,
    taxSystemType: "Progressive federal",
    studentPhase: {
      taxResidencyNote: "Resident for tax purposes if staying > 6 months",
      tuitionTaxCredit: "Tuition can be deducted as training expenses",
      stipendTaxability: "Scholarships generally tax-free; employment (TA/RA) taxable",
      effectiveTaxOnStipend: "Usually 0% as it falls under the EUR 12,816 tax-free allowance (2026)"
    },
    workingGraduatePhase: {
      federalTaxBrackets: [
        { bracket: "0-12,816", rate: "0%", currency: "EUR" },
        { bracket: "12,816-20,818", rate: "20%", currency: "EUR" },
        { bracket: "20,818-34,513", rate: "30%", currency: "EUR" },
        { bracket: "34,513-66,612", rate: "40%", currency: "EUR" },
        { bracket: "66,612+", rate: "48-55%", currency: "EUR" }
      ],
      provincialTax: "None",
      cpp: "Social Security (Pension, Health, Unemployment): ~18.12% employee share",
      ei: "Included in Social Security",
      effectiveTaxRate: {
        salary70k: "Approximately 38-42% combined tax and social security",
        salary100k: "Approximately 44-48% combined",
        salary150k: "Approximately 48-52% combined"
      },
      netMonthlySalary: {
        grossCAD80k: { netMonthly: "EUR 3,200", usd: "3,500" },
        grossCAD110k: { netMonthly: "EUR 4,200", usd: "4,600" }
      },
      albertaAdvantage: "N/A"
    },
    taxTreaty: { withBangladesh: false, note: "No DTAA." },
    gstHst: "VAT is 20% standard",
    capitalGainsTax: "27.5% flat rate on securities",
    keyDeductions: ["Commuter allowance", "Work equipment", "Union dues"],
    taxFilingDeadline: "April 30 (paper), June 30 (online)",
    recommendation: "Taxes are extremely high, similar to Germany. The 13th and 14th month salaries are taxed at a preferential rate of 6%, providing a significant boost in June and November."
  },
  {
    country: "Singapore",
    countryCode: "SG",
    currency: "SGD",
    overallTaxScore: 90,
    confidenceScore: 90,
    taxSystemType: "Progressive national",
    studentPhase: {
      taxResidencyNote: "Non-resident if < 183 days. Resident otherwise.",
      tuitionTaxCredit: "Course fees relief available if related to employment",
      stipendTaxability: "University scholarships are generally tax exempt",
      effectiveTaxOnStipend: "0%"
    },
    workingGraduatePhase: {
      federalTaxBrackets: [
        { bracket: "0-20,000", rate: "0%", currency: "SGD" },
        { bracket: "20,000-30,000", rate: "2%", currency: "SGD" },
        { bracket: "30,000-40,000", rate: "3.5%", currency: "SGD" },
        { bracket: "40,000-80,000", rate: "7%", currency: "SGD" },
        { bracket: "80,000-120,000", rate: "11.5%", currency: "SGD" },
        { bracket: "120,000-160,000", rate: "15%", currency: "SGD" },
        { bracket: "160,000+", rate: "18-24%", currency: "SGD" }
      ],
      provincialTax: "None",
      cpp: "CPF (Central Provident Fund): Only for PRs/Citizens. Foreigners pay 0% CPF.",
      ei: "None",
      effectiveTaxRate: {
        salary70k: "Approximately 4-5% (Foreigner)",
        salary100k: "Approximately 6-8% (Foreigner)",
        salary150k: "Approximately 9-11% (Foreigner)"
      },
      netMonthlySalary: {
        grossCAD80k: { netMonthly: "SGD 6,300", usd: "4,600" },
        grossCAD110k: { netMonthly: "SGD 8,500", usd: "6,200" }
      },
      albertaAdvantage: "N/A"
    },
    taxTreaty: { withBangladesh: true, note: "DTAA exists. Avoids double taxation." },
    gstHst: "GST is 9% (2024 onwards)",
    capitalGainsTax: "0% (No capital gains tax)",
    keyDeductions: ["Earned income relief", "CPF relief (for PRs)"],
    taxFilingDeadline: "April 18 (e-filing)",
    recommendation: "Singapore offers one of the lowest income tax environments globally for expats, alongside zero capital gains tax. This heavily offsets the high cost of rent."
  },
  {
    country: "United Arab Emirates",
    countryCode: "AE",
    currency: "AED",
    overallTaxScore: 98,
    confidenceScore: 95,
    taxSystemType: "Zero Income Tax",
    studentPhase: {
      taxResidencyNote: "Resident visa grants residency. No income tax to file.",
      tuitionTaxCredit: "N/A",
      stipendTaxability: "Tax free",
      effectiveTaxOnStipend: "0%"
    },
    workingGraduatePhase: {
      federalTaxBrackets: [
        { bracket: "All Income", rate: "0%", currency: "AED" }
      ],
      provincialTax: "None",
      cpp: "No pension contribution for expats",
      ei: "Mandatory unemployment insurance scheme (very low cost, ~AED 60/year)",
      effectiveTaxRate: {
        salary70k: "0%",
        salary100k: "0%",
        salary150k: "0%"
      },
      netMonthlySalary: {
        grossCAD80k: { netMonthly: "AED 22,000", usd: "6,000" },
        grossCAD110k: { netMonthly: "AED 30,000", usd: "8,100" }
      },
      albertaAdvantage: "N/A"
    },
    taxTreaty: { withBangladesh: true, note: "DTAA exists." },
    gstHst: "VAT is 5%",
    capitalGainsTax: "0%",
    keyDeductions: ["N/A"],
    taxFilingDeadline: "None for individuals",
    recommendation: "Unmatched for raw capital accumulation. 100% of your gross salary hits your bank account. Corporate tax was introduced in 2023 but individual income remains strictly tax-free."
  },
  {
    country: "France",
    countryCode: "FR",
    currency: "EUR",
    overallTaxScore: 35,
    confidenceScore: 85,
    taxSystemType: "Progressive national",
    studentPhase: {
      taxResidencyNote: "Resident if primary home or main professional activity is in France.",
      tuitionTaxCredit: "No direct credit, but student status gives discounts.",
      stipendTaxability: "Research grants (allocations de recherche) are taxable.",
      effectiveTaxOnStipend: "Very low due to the basic allowance."
    },
    workingGraduatePhase: {
      federalTaxBrackets: [
        { bracket: "0-11,294", rate: "0%", currency: "EUR" },
        { bracket: "11,294-28,797", rate: "11%", currency: "EUR" },
        { bracket: "28,797-82,341", rate: "30%", currency: "EUR" },
        { bracket: "82,341-177,106", rate: "41%", currency: "EUR" },
        { bracket: "177,106+", rate: "45%", currency: "EUR" }
      ],
      provincialTax: "None",
      cpp: "Social contributions (CSG/CRDS) + pension: ~20-23% employee share",
      ei: "Included in social charges",
      effectiveTaxRate: {
        salary70k: "Approximately 38-42% combined",
        salary100k: "Approximately 42-46% combined",
        salary150k: "Approximately 45-50% combined"
      },
      netMonthlySalary: {
        grossCAD80k: { netMonthly: "EUR 3,300", usd: "3,600" },
        grossCAD110k: { netMonthly: "EUR 4,300", usd: "4,700" }
      },
      albertaAdvantage: "N/A"
    },
    taxTreaty: { withBangladesh: true, note: "DTAA exists." },
    gstHst: "TVA (VAT) is 20%",
    capitalGainsTax: "Flat 30% (Prélèvement forfaitaire unique)",
    keyDeductions: ["Family quotient (quotient familial) massive benefit for couples with kids"],
    taxFilingDeadline: "May/June depending on department",
    recommendation: "High tax burden for single earners. The French system heavily penalizes high-earning singles but generously rewards families with children through the 'quotient familial' tax splitting mechanism."
  },
  {
    country: "Belgium",
    countryCode: "BE",
    currency: "EUR",
    overallTaxScore: 25,
    confidenceScore: 88,
    taxSystemType: "Progressive national + municipal",
    studentPhase: {
      taxResidencyNote: "Resident if registered in national register.",
      tuitionTaxCredit: "N/A",
      stipendTaxability: "PhD scholarships are often tax-free if they meet specific academic conditions.",
      effectiveTaxOnStipend: "0% for qualifying PhDs."
    },
    workingGraduatePhase: {
      federalTaxBrackets: [
        { bracket: "0-15,200", rate: "25%", currency: "EUR" },
        { bracket: "15,200-26,830", rate: "40%", currency: "EUR" },
        { bracket: "26,830-46,440", rate: "45%", currency: "EUR" },
        { bracket: "46,440+", rate: "50%", currency: "EUR" }
      ],
      provincialTax: "Municipal tax 0-9% of the income tax due.",
      cpp: "Social security: 13.07% employee share",
      ei: "Included in social security",
      effectiveTaxRate: {
        salary70k: "Approximately 45-50% combined",
        salary100k: "Approximately 50-53% combined",
        salary150k: "Approximately 53-55% combined"
      },
      netMonthlySalary: {
        grossCAD80k: { netMonthly: "EUR 3,000", usd: "3,300" },
        grossCAD110k: { netMonthly: "EUR 4,000", usd: "4,400" }
      },
      albertaAdvantage: "N/A"
    },
    taxTreaty: { withBangladesh: true, note: "DTAA exists." },
    gstHst: "VAT is 21%",
    capitalGainsTax: "0% on normal management of private wealth (huge benefit)",
    keyDeductions: ["Company car (massive common perk)", "Meal vouchers"],
    taxFilingDeadline: "End of June (online)",
    recommendation: "Belgium has arguably the highest income tax burden on labor in the world. However, capital gains on stocks are entirely tax-free, and employers heavily use net allowances and company cars to offset the income tax."
  },
  {
    country: "New Zealand",
    countryCode: "NZ",
    currency: "NZD",
    overallTaxScore: 65,
    confidenceScore: 85,
    taxSystemType: "Progressive national",
    studentPhase: {
      taxResidencyNote: "Resident if > 183 days.",
      tuitionTaxCredit: "N/A",
      stipendTaxability: "Scholarships are generally exempt from income tax.",
      effectiveTaxOnStipend: "0%"
    },
    workingGraduatePhase: {
      federalTaxBrackets: [
        { bracket: "0-14,000", rate: "10.5%", currency: "NZD" },
        { bracket: "14,000-48,000", rate: "17.5%", currency: "NZD" },
        { bracket: "48,000-70,000", rate: "30%", currency: "NZD" },
        { bracket: "70,000-180,000", rate: "33%", currency: "NZD" },
        { bracket: "180,000+", rate: "39%", currency: "NZD" }
      ],
      provincialTax: "None",
      cpp: "KiwiSaver: 3%, 4%, 6%, 8% or 10% voluntary (employer matches 3%)",
      ei: "ACC levy: 1.53%",
      effectiveTaxRate: {
        salary70k: "Approximately 20-22% combined",
        salary100k: "Approximately 25-27% combined",
        salary150k: "Approximately 28-31% combined"
      },
      netMonthlySalary: {
        grossCAD80k: { netMonthly: "NZD 5,200", usd: "3,100" },
        grossCAD110k: { netMonthly: "NZD 6,800", usd: "4,100" }
      },
      albertaAdvantage: "N/A"
    },
    taxTreaty: { withBangladesh: false, note: "No DTAA." },
    gstHst: "GST is 15%",
    capitalGainsTax: "0% (No comprehensive CGT, bright-line test for property)",
    keyDeductions: ["Very few. NZ operates a broad-base, low-rate, no-deduction system."],
    taxFilingDeadline: "July 7",
    recommendation: "NZ income taxes are lower and simpler than Australia, Canada, and Europe. The lack of capital gains tax is a benefit, but salaries are also nominally much lower."
  }
];

newTaxCountries.forEach(nc => {
  if (!taxData.taxation.find(c => c.country === nc.country)) {
    taxData.taxation.push(nc);
  }
});
fs.writeFileSync(taxPath, JSON.stringify(taxData, null, 2));
console.log('taxation.json updated successfully!');
