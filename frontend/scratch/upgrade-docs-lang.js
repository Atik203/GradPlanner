const fs = require('fs');

// ============ DOCUMENT REQUIREMENTS UPGRADE ============
const docPath = 'e:/PROJECT/GradPlanner/frontend/public/countries/document-requirements.json';
let docData = JSON.parse(fs.readFileSync(docPath, 'utf8'));

function buildDocEntry(country, code, visaDocs, bdSteps, fees) {
  return {
    country, countryCode: code,
    generalDocuments: [
      { document: "Academic Transcripts", details: "All semesters. Must be official sealed copies from registrar. Attested by Ministry of Education, Bangladesh then Ministry of Foreign Affairs.", attestationRequired: true, translationRequired: country === 'France' || country === 'Austria', processingTime: "UIU/AUST Registrar: 3-7 days; MoE attestation: 1-2 weeks; MoFA: 3-5 days" },
      { document: "Degree Certificate", details: "Original + 3 notarized copies. Same attestation chain as transcripts.", attestationRequired: true, translationRequired: country === 'France' || country === 'Austria', processingTime: "Issued 1-3 days after graduation; attestation 2-3 weeks total" },
      { document: "IELTS Certificate", details: "Academic IELTS only (not General). Valid 2 years from test date. Minimum overall 6.5 (most universities).", attestationRequired: false, translationRequired: false, processingTime: "13 days post-exam; book British Council/IDP Dhaka" },
      { document: "Statement of Purpose (SOP)", details: "800-1,500 words. Country-specific research focus required.", attestationRequired: false, translationRequired: country === 'France', processingTime: "Self-prepared; allow 2-4 weeks iteration" },
      { document: "Letters of Recommendation", details: "2-3 letters. At least one from research supervisor. Sent directly by professor on university letterhead.", attestationRequired: false, translationRequired: false, processingTime: "2-4 weeks; request early" },
      { document: "Curriculum Vitae / Resume", details: "Academic CV format. Include GPA, publications, research projects.", attestationRequired: false, translationRequired: false, processingTime: "Self-prepared" },
      { document: "Passport Copy", details: "Valid minimum 24 months beyond program end. Renew via DIP Agargaon if needed.", attestationRequired: false, translationRequired: false, processingTime: "New passport: 7-10 days urgent; 3-4 weeks regular" }
    ],
    visaDocuments: visaDocs,
    bangladeshSpecificSteps: bdSteps,
    keyDeadlines: { fallIntake: "October 1 - January 15", winterIntake: "June 1 - September 1", visaApplyAfterAdmission: "Apply immediately on receiving unconditional offer letter" },
    estimatedCosts: fees
  };
}

const docUpgrades = [
  buildDocEntry("Austria", "AT",
    [
      { document: "Student Visa (Type D) Application", details: "Apply at Austrian Embassy Dhaka (House 35, Road 71, Gulshan 2). Long-stay visa for full duration. Requires admission letter, blocked account proof (EUR 1,100/month = EUR 13,200 in Fintiba/Coracle), health insurance.", processingTime: "6-10 weeks" },
      { document: "Blocked Account (Fintiba/Coracle)", details: "EUR 13,200 minimum for one year. Wire transfer from Bangladesh takes 7-14 days. Apply online. Account approved in 3-7 days after funding.", processingTime: "10-21 days total including wire transfer" },
      { document: "Health Insurance", details: "OEGK or private student insurance minimum EUR 30,000 coverage. Must be valid from Day 1 of travel.", processingTime: "Purchase online; 1-2 days" },
      { document: "Police Clearance Certificate (Bangladesh)", details: "Apply via pcc.police.gov.bd; submit at Ramna Police HQ. Required for visa application.", processingTime: "4-8 weeks" },
      { document: "Proof of Accommodation", details: "University housing offer or signed rental agreement. Required for visa application.", processingTime: "Secure 4-6 weeks before visa appointment" }
    ],
    ["Attestation chain: University Registrar → Ministry of Education → Ministry of Foreign Affairs → Austrian Embassy Dhaka (legalization/apostille)", "Austrian Embassy in Gulshan 2 — book appointment online (oea.bmeia.gv.at)", "German translation of key documents (transcripts, degree) required by Austrian authorities — use certified translator in Dhaka", "Fintiba account must be in student's name — cannot use family member's account", "APS certificate NOT required for Austria (only Germany)"],
    { applicationFees: "EUR 100-200 per university", studyPermitFee: "EUR 160 (long-stay visa D)", biometricFee: "EUR 25", medicalExam: "Not standard for Austria student visa", attestationCosts: "BDT 3,000-8,000 per document chain" }
  ),
  buildDocEntry("Belgium", "BE",
    [
      { document: "Long-stay Visa (Type D) Application", details: "Apply at Belgian Embassy Dhaka (Suvastu Zara Tower, 11 Gulshan Ave). Letter of acceptance from Belgian university (COE) required. Proof of financial means: EUR 800/month or scholarship letter.", processingTime: "6-10 weeks" },
      { document: "COE (Certificate of Enrollment)", details: "Issued by Belgian university after unconditional acceptance. The primary visa trigger document.", processingTime: "Issued by university" },
      { document: "Financial Proof", details: "EUR 800/month × duration OR scholarship letter covering full amount. Bank statement 6 months history OR Fintiba/blocked account.", processingTime: "Bank statement: 1-3 days; blocked account: 2-3 weeks" },
      { document: "Health Insurance", details: "RIZIV/INAMI-affiliated mutualité (health insurance fund) — student joins on arrival. Temporary private insurance needed for visa application.", processingTime: "Purchase online; 1-2 days" },
      { document: "Police Clearance Certificate", details: "Required. From Bangladesh Police (pcc.police.gov.bd).", processingTime: "4-8 weeks" },
      { document: "Registration at Municipal Office (Commune)", details: "On arrival, register at local commune within 8 days. Required for legal residency.", processingTime: "1-2 hours; bring passport + COE + accommodation proof" }
    ],
    ["Belgian Embassy Dhaka: appointment via VFS Global system", "VLIR-UOS applicants: scholarship documentation replaces financial proof entirely", "Registration at commune on arrival is MANDATORY — failure to register creates legal status issues", "Attestation chain same as standard: University → MoE → MoFA → Belgian Embassy", "French translation for Wallonia universities; Dutch translation for Flemish universities (Ghent, Leuven)"],
    { applicationFees: "EUR 100-200 per university", studyPermitFee: "EUR 180 (long-stay visa D)", biometricFee: "Included in VFS fee", medicalExam: "Not standard for Belgium", attestationCosts: "BDT 3,000-8,000 per document" }
  ),
  buildDocEntry("New Zealand", "NZ",
    [
      { document: "Student Visa Application", details: "Apply online via Immigration New Zealand (INZ) portal (immigration.govt.nz). Offer of Place from NZQA-recognized provider required. Financial evidence: NZD 15,000/year minimum.", processingTime: "4-8 weeks online" },
      { document: "Offer of Place", details: "Unconditional acceptance letter from NZ university. Triggers visa application.", processingTime: "Issued by university" },
      { document: "Financial Evidence", details: "NZD 15,000/year in bank statement or scholarship letter. 6-month bank statement history.", processingTime: "1-3 days for bank statement" },
      { document: "Health and Character Requirements", details: "Chest X-ray and medical if from high TB-risk country (Bangladesh requires upfront medical). NZ Panel Physician in Dhaka.", processingTime: "Medical exam 1 day; results 3-7 days to upload" },
      { document: "Police Certificate", details: "Police Clearance from Bangladesh (pcc.police.gov.bd). Required as character check.", processingTime: "4-8 weeks" }
    ],
    ["NZ Student Visa is applied entirely online — no embassy visit required in Bangladesh", "Chest X-ray from NZ-approved Panel Physician in Dhaka is mandatory (required upfront for most BD applicants)", "Financial evidence is simpler than EU countries — direct bank statement widely accepted", "Biometrics collected at VFS Global Dhaka after visa approval", "Trans-Tasman Travel Agreement means NZ PR holders can live/work in Australia — very strategically important"],
    { applicationFees: "NZD 100-250 per university", studyPermitFee: "NZD 375 (student visa)", biometricFee: "NZD 78", medicalExam: "USD 100-150 at Panel Physician", attestationCosts: "BDT 2,000-5,000 (simpler than EU)" }
  ),
  buildDocEntry("Singapore", "SG",
    [
      { document: "Student Pass (ICA)", details: "Applied via SOLAR+ system by your university on your behalf. You submit documents to university; university applies to ICA (Immigration and Checkpoints Authority). Approval rate for NUS/NTU admits near 100%.", processingTime: "4-6 weeks after university applies" },
      { document: "IPA (In-Principle Approval) Letter", details: "Received after Student Pass approval. Used to enter Singapore and collect physical pass.", processingTime: "Issued with Student Pass approval" },
      { document: "Financial Evidence", details: "SGD 10,000/year minimum. For SINGA scholars, scholarship letter replaces financial proof completely.", processingTime: "1-3 days for bank statement" },
      { document: "Medical Examination", details: "Required on arrival in Singapore — university coordinates. Includes chest X-ray and blood tests.", processingTime: "1 day; results 1-3 days" },
      { document: "Passport Photo", details: "Singapore-format photo (35mm × 45mm, white background, recent 6 months).", processingTime: "Immediate" }
    ],
    ["Singapore Student Pass is arranged by YOUR UNIVERSITY — you do NOT contact ICA directly", "SINGA scholars: scholarship letter eliminates virtually all financial documentation requirements", "Medical examination is done IN Singapore, not before departure — no pre-departure health checks required", "Attendance must be ≥75% to maintain Student Pass validity — this is strictly enforced", "Bring original degree and transcript for physical verification on arrival at NUS/NTU admissions office"],
    { applicationFees: "SGD 50-100 per university", studyPermitFee: "SGD 90 (student pass)", biometricFee: "Collected in Singapore", medicalExam: "Conducted in Singapore (university arranged)", attestationCosts: "BDT 2,000-4,000 (minimal — Singapore system is digital-friendly)" }
  ),
  buildDocEntry("France", "BE",
    [
      { document: "Long-stay Student Visa (VLS-TS)", details: "Apply at VFS Global Dhaka (Nooks & Crannies Building, Banani). Campus France attestation mandatory — complete Campus France process FIRST (campusfrance.org/bd).", processingTime: "8-12 weeks; book appointment early" },
      { document: "Campus France Attestation", details: "MANDATORY for BD nationals. Create Campus France account → enter university selections → interview at Campus France Dhaka (House 8, Road 53, Gulshan 2) → receive attestation. Fee: BDT 15,000 approximately.", processingTime: "3-6 weeks for full Campus France process" },
      { document: "Financial Proof", details: "EUR 615/month minimum (EUR 7,380/year) for 12 months. Bank statement OR French government/Eiffel scholarship letter.", processingTime: "1-3 days" },
      { document: "Health Insurance", details: "Temporary travel insurance for visa (EUR 30,000 coverage). French students are automatically covered by la Sécurité Sociale on enrollment.", processingTime: "Purchase online; 1-2 days" },
      { document: "Accommodation Proof", details: "University housing offer OR Attestation d'Hébergement from French host.", processingTime: "University housing: confirm at registration" },
      { document: "OFII Registration", details: "On arrival in France, validate long-stay visa via OFII (Office Français de l'Immigration) within 3 months. Fee EUR 50.", processingTime: "Online; 1-2 weeks" }
    ],
    ["Campus France Dhaka (Gulshan 2) is YOUR FIRST STOP — book appointment 3 months before your university deadline", "VLS-TS must be validated via OFII within 3 months of arrival in France (EUR 50 online) — if missed, your residence status is invalid", "French translation of transcripts and degree certificate required — use certified translator (Institut Français Dhaka can advise)", "Alliance Française Dhaka (Mirpur Road, Dhanmondi) offers French language courses — start immediately", "Attestation chain: University Registrar → MoE → MoFA → French Embassy (via VFS Global Banani)"],
    { applicationFees: "EUR 0-200 per university (most French public universities free to apply)", studyPermitFee: "EUR 99 (long-stay visa) + EUR 50 OFII", biometricFee: "EUR 25 at VFS", medicalExam: "Not required pre-departure", attestationCosts: "BDT 3,000-8,000 per document + translation costs BDT 2,000-5,000" }
  ),
  buildDocEntry("United Arab Emirates", "AE",
    [
      { document: "Entry Permit (Student)", details: "MBZUAI arranges the student entry permit through Abu Dhabi Department of Education and Knowledge (ADEK). You do NOT apply independently. University sends your documents to ADEK.", processingTime: "2-4 weeks after university processes" },
      { document: "Emirates ID Registration", details: "Done on arrival in Abu Dhabi. University arranges appointment at ICA (Federal Authority for Identity). Required for: bank account, SIM card, accommodation.", processingTime: "1-2 weeks after arrival" },
      { document: "Residence Visa Stamping", details: "Student residence visa stamped in passport after Emirates ID registration. Done by university PRO (Public Relations Officer).", processingTime: "1-2 weeks after Emirates ID" },
      { document: "Medical Fitness Test", details: "Required in UAE — blood test for HIV, Hepatitis B/C, TB. Conducted at Ministry of Health certified center in Abu Dhabi on arrival.", processingTime: "1-2 days; results same day or next day" },
      { document: "Health Insurance Card", details: "MBZUAI provides health insurance to all students. Abu Dhabi government-mandated health insurance.", processingTime: "Provided by university on arrival" }
    ],
    ["MBZUAI handles ALL visa logistics — your job is ONLY to submit your documents to MBZUAI admissions on time", "Medical fitness test in UAE tests for HIV — positive result = residency permit denied and deportation under UAE law", "No attestation by UAE Embassy needed (most documents) — MBZUAI verification system is sufficient", "Bring sealed, original transcripts for physical verification at MBZUAI Office of Student Affairs", "WhatsApp is the primary communication tool in UAE — save MBZUAI admissions WhatsApp number immediately"],
    { applicationFees: "AED 0 (MBZUAI application is free)", studyPermitFee: "AED 0 (all visa costs covered by MBZUAI scholarship)", biometricFee: "AED 0 (covered)", medicalExam: "AED 300-500 (fitness test in Abu Dhabi; some universities cover)", attestationCosts: "BDT 2,000-4,000 (minimal documentation required)" }
  )
];

// Fix France country code
docUpgrades[4].countryCode = "FR";

docUpgrades.forEach(upgrade => {
  const idx = docData.documentRequirements.findIndex(d => d.country === upgrade.country);
  if (idx !== -1) {
    docData.documentRequirements[idx] = upgrade;
  } else {
    docData.documentRequirements.push(upgrade);
  }
});

fs.writeFileSync(docPath, JSON.stringify(docData, null, 2));
console.log('document-requirements.json: All 6 countries upgraded!');

// ============ LANGUAGE REQUIREMENTS UPGRADE ============
const langPath = 'e:/PROJECT/GradPlanner/frontend/public/countries/language-requirements.json';
let langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));

const langUpgrades = [
  {
    country: "Austria", countryCode: "AT",
    officialLanguages: ["German"], workingLanguage: "German (English in international tech firms)",
    overallLanguageScore: 35, confidenceScore: 92,
    admissionRequirements: {
      english: { ielts: { overall: 6.5, minimumBand: 6.0, competitive: 7.0 }, toefl: { ibt: 90, competitive: 100 }, pte: { overall: 58 }, exemptions: "BD nationals not exempt — test mandatory" },
      german: { required: false, note: "Not required for English-taught programs but German B2+ makes you vastly more employable in Vienna market" }
    },
    studyPhaseLanguage: {
      mediumOfInstruction: "English at Master's level at TU Wien, TU Graz, University of Vienna for most CS/AI programs",
      hostLanguageForIntegration: "German — essential for grocery shopping, bureaucracy, healthcare navigation",
      recommendedLevel: "B1 German by end of Year 1 (attend Volkshochschule courses — EUR 200-400/semester)",
      frenchAdvantage: "N/A"
    },
    workPhaseLanguage: {
      required: "German B2 for Austrian companies; English C1 for international tech firms (Red Bull, AIT, multinational offices)",
      salaryImpact: "German C1 candidates earn 20-30% more and have 5× the job options in the Austrian market"
    },
    prRequirements: {
      expressEntry: { languageTest: "German integration exam (Integrationsprüfung Deutsch B1) required for Settlement Permit", clbTarget: "N/A" },
      testValidity: "Integration exam: no expiry once passed"
    },
    citizenshipRequirements: {
      languageTest: "German B1 (Goethe-Institut Zertifikat B1) + civic knowledge exam",
      practicalLevel: "B1 is the minimum; C1 is realistically needed for daily life and full integration",
      note: "CRITICAL: Austrian citizenship requires RENOUNCING Bangladeshi citizenship. Dual citizenship is NOT permitted. This is a life-altering decision — many BD nationals stop at PR instead."
    },
    testCentersInBangladesh: ["Goethe-Institut Dhaka (Road 9, Block F, Banani)", "British Council Dhaka (IELTS)", "IDP Dhaka (IELTS)"],
    testCostBDT: { "IELTS": "BDT 22,500", "German A1-B1": "BDT 8,000-15,000 at Goethe-Institut Dhaka" },
    strategicRecommendation: "Target IELTS 7.0 for admission. Then: enroll in German A1 at Goethe-Institut Dhaka (Road 9, Banani) 12-18 months before departure — this is your highest ROI investment. German B1 by Year 2 in Austria = 5× job options, 20% salary premium, and PR eligibility. Start speaking German on Day 1 of Vienna arrival — Austrians will switch to English if you hesitate, which hinders learning. Force yourself to use German at bakeries, supermarkets, and municipal offices."
  },
  {
    country: "Belgium", countryCode: "BE",
    officialLanguages: ["Dutch", "French", "German"], workingLanguage: "English (Brussels tech), Dutch (Flanders), French (Wallonia)",
    overallLanguageScore: 55, confidenceScore: 90,
    admissionRequirements: {
      english: { ielts: { overall: 6.5, minimumBand: 6.0, competitive: 7.0 }, toefl: { ibt: 90, competitive: 100 }, pte: { overall: 58 }, exemptions: "BD nationals not exempt" },
      french: { required: false, note: "Required for UCLouvain and most Wallonia university programs; recommended for Brussels job market" },
      dutch: { required: false, note: "Required for Ghent University and KU Leuven Dutch-medium programs; not required for English-medium Master's" }
    },
    studyPhaseLanguage: {
      mediumOfInstruction: "English at KU Leuven, Ghent University (most Master's), VUB — no Dutch required for English-medium admission",
      hostLanguageForIntegration: "Brussels: English widely used. Ghent/Leuven: Dutch. Liège/Namur: French.",
      recommendedLevel: "Dutch A2 (for Flanders) or French A2 (for Wallonia) within Year 1 of studies",
      frenchAdvantage: "French B2 opens 40% more jobs in Brussels and all of French-speaking Belgium"
    },
    workPhaseLanguage: {
      required: "Brussels tech firms: English sufficient for 70% of roles. Non-Brussels: Dutch or French mandatory.",
      salaryImpact: "Bilingual (EN+NL or EN+FR) candidates earn 15-25% premium in Belgian market; trilingual is exceptionally rare and commanding"
    },
    prRequirements: {
      expressEntry: { languageTest: "Dutch A2 (Flanders) or French A2 (Wallonia) for permanent residency integration requirement; B1 for citizenship", clbTarget: "N/A" },
      testValidity: "Language tests: 2 years validity typically"
    },
    citizenshipRequirements: {
      languageTest: "Dutch B1 (NT2) or French B1 — at least one national language",
      practicalLevel: "B1 is achievable — Belgian language exam is less rigorous than German or Netherlands NT2",
      note: "Dual citizenship ALLOWED — you can keep your Bangladeshi passport. This is a major advantage over Austria, Netherlands, and Germany (which have varying dual citizenship restrictions)."
    },
    testCentersInBangladesh: ["British Council Dhaka (IELTS)", "Alliance Française Dhaka (Dhanmondi) — French courses and exams", "No dedicated Dutch test center in Dhaka — must take NT2 in Belgium"],
    testCostBDT: { "IELTS": "BDT 22,500", "DELF B1 (French)": "BDT 8,000-12,000 at Alliance Française Dhaka" },
    strategicRecommendation: "For KU Leuven English-medium MSc: only IELTS 6.5+ needed — no Dutch required. This is a major advantage. Post-admission: enroll in NT2 Dutch (Centrum voor Basiseducatie) or French course (Alliance Française Liège/Brussels) from Day 1 — free language courses are offered to residents in Belgium. Target Dutch A2 by end of Year 1 for Flanders, or French A2 for Brussels/Wallonia. This single investment transforms your employability. Dual citizenship means you keep your BD passport — this alone makes Belgium superior to Austria for citizenship."
  },
  {
    country: "New Zealand", countryCode: "NZ",
    officialLanguages: ["English", "Māori", "New Zealand Sign Language"], workingLanguage: "English",
    overallLanguageScore: 98, confidenceScore: 95,
    admissionRequirements: {
      english: { ielts: { overall: 6.5, minimumBand: 6.0, competitive: 7.0 }, toefl: { ibt: 90, competitive: 100 }, pte: { overall: 58 }, exemptions: "BD nationals not exempt; test mandatory" }
    },
    studyPhaseLanguage: {
      mediumOfInstruction: "100% English — no other language knowledge required",
      hostLanguageForIntegration: "English — zero language integration barrier for CS graduates from Bangladesh",
      recommendedLevel: "IELTS 7.0+ for academic success in research-based degrees",
      frenchAdvantage: "N/A"
    },
    workPhaseLanguage: {
      required: "English only — Kiwi accent is distinctive but universally understood by BD English speakers",
      salaryImpact: "No language premium — English is the only language; however, clear professional communication skills do differentiate"
    },
    prRequirements: {
      expressEntry: { languageTest: "IELTS 6.5 minimum for Skilled Migrant Category; 7.0+ for bonus points", clbTarget: "N/A" },
      testValidity: "IELTS valid 3 years for immigration (different from 2yr for university admission)"
    },
    citizenshipRequirements: {
      languageTest: "English proficiency — no formal test required; assessed during citizenship interview",
      practicalLevel: "Conversational English sufficient; CS graduates from Bangladesh far exceed minimum requirement",
      note: "Dual citizenship ALLOWED — you keep your Bangladeshi passport."
    },
    testCentersInBangladesh: ["British Council Dhaka (IELTS — 2 locations: Dhaka & Chittagong)", "IDP Dhaka (IELTS)", "Pearson PTE (multiple centers)"],
    testCostBDT: { "IELTS": "BDT 22,500", "PTE Academic": "BDT 18,000" },
    strategicRecommendation: "New Zealand has zero language barrier — one of its biggest advantages. Target IELTS 7.0 overall with 7.0 each band for maximum Skilled Migrant Category points. For CS graduates from Bangladesh with solid English communication, NZ immigration language requirements are trivially easy to meet. Invest zero additional time in language learning — redirect that time to publications, research experience, and IELTS preparation."
  },
  {
    country: "Singapore", countryCode: "SG",
    officialLanguages: ["English", "Malay", "Mandarin", "Tamil"], workingLanguage: "English",
    overallLanguageScore: 96, confidenceScore: 95,
    admissionRequirements: {
      english: { ielts: { overall: 6.5, minimumBand: 6.0, competitive: 7.0 }, toefl: { ibt: 90, competitive: 100 }, pte: { overall: 58 }, exemptions: "BD nationals not exempt" }
    },
    studyPhaseLanguage: {
      mediumOfInstruction: "100% English at NUS, NTU, SUTD — Singapore's official medium of instruction in higher education",
      hostLanguageForIntegration: "English for professional life; Singlish (Singapore English creole) in casual settings — you will pick it up naturally",
      recommendedLevel: "IELTS 7.0+ for NUS/NTU research programs; very strong technical English essential for seminars and paper presentations",
      frenchAdvantage: "N/A"
    },
    workPhaseLanguage: {
      required: "English only for tech roles — Singapore has English as first language for all business",
      salaryImpact: "Mandarin Chinese is a huge bonus (Singapore is 75% Chinese; many tech companies use Mandarin internally); Malay useful for government roles"
    },
    prRequirements: {
      expressEntry: { languageTest: "English only — IELTS not required separately; NUS/NTU degree proves English proficiency", clbTarget: "N/A" },
      testValidity: "University degree serves as language proof"
    },
    citizenshipRequirements: {
      languageTest: "English proficiency assessed during Singapore Citizenship journey — no formal test; conversational English required",
      practicalLevel: "CS graduate English from Bangladesh exceeds Singapore citizenship requirements",
      note: "CRITICAL: Singapore citizenship requires RENOUNCING all other citizenships — you CANNOT keep Bangladeshi passport. This, combined with the extreme difficulty of getting citizenship approved by ICA, means most foreign residents settle for long-term PR instead."
    },
    testCentersInBangladesh: ["British Council Dhaka", "IDP Dhaka", "Pearson PTE Dhaka"],
    testCostBDT: { "IELTS": "BDT 22,500", "PTE": "BDT 18,000" },
    strategicRecommendation: "Singapore is effectively English-only for CS/AI careers — zero language investment required beyond excellent professional English. Target IELTS 7.0+ for SINGA/NUS applications. If you want to maximize Singapore opportunities: take basic Mandarin (HSK 1-2) course at Confucius Institute Dhaka (Alliance Française Dhaka area) — 30% of Singapore tech jobs prefer Mandarin-comfortable candidates. BUT: do not renounce Bangladeshi citizenship for Singapore citizenship — treat Singapore as a career builder, not permanent home."
  },
  {
    country: "France", countryCode: "FR",
    officialLanguages: ["French"], workingLanguage: "French (English in international tech; Passeport Talent companies)",
    overallLanguageScore: 40, confidenceScore: 92,
    admissionRequirements: {
      english: { ielts: { overall: 6.5, minimumBand: 6.0, competitive: 7.0 }, toefl: { ibt: 90, competitive: 100 }, pte: { overall: 58 }, exemptions: "BD nationals not exempt" },
      french: { required: false, note: "Not required for English-taught Master's programs; BUT required for DELF B1 for PR after 5yr and B1 for Campus France interview; French A2 strongly recommended" }
    },
    studyPhaseLanguage: {
      mediumOfInstruction: "English at Master's level (Ecole Polytechnique, INRIA, Sorbonne internationally marketed programs). French-medium for most Grande Ecole programs.",
      hostLanguageForIntegration: "French — absolute necessity for daily life, administrative tasks, and most jobs outside Paris tech bubble",
      recommendedLevel: "French A2 before arrival; B1 by end of Year 1; B2 by graduation",
      frenchAdvantage: "French B2 = 10× more job options; PR eligibility; citizenship path; Mistral AI and INRIA accept English but French speakers preferred"
    },
    workPhaseLanguage: {
      required: "Paris Passeport Talent companies (Mistral, Contentsquare, INRIA Paris): English sufficient. French companies (Airbus, Thales, BNP): French B2+",
      salaryImpact: "French C1 candidates earn 20-30% more and qualify for 10× more positions"
    },
    prRequirements: {
      expressEntry: { languageTest: "French B1 (DELF B1 or TCF B1) mandatory for Carte de Résident (PR after 5yr)", clbTarget: "N/A" },
      testValidity: "DELF is permanent (no expiry); TCF valid 2 years"
    },
    citizenshipRequirements: {
      languageTest: "French B1 formally required; French B2 practically recommended for naturalization interview (which is entirely in French)",
      practicalLevel: "Your French must be sufficient to demonstrate integration during a 30-60 minute French-language interview with a prefect",
      note: "Dual citizenship ALLOWED — France permits multiple citizenships. You keep your Bangladeshi passport. This is a major advantage."
    },
    testCentersInBangladesh: ["Alliance Française Dhaka (Dhanmondi 2, Road 3) — French courses + DELF/TCF exams", "Institut Français Dhaka (same location) — cultural events and exam information", "IELTS: British Council Dhaka, IDP Dhaka"],
    testCostBDT: { "IELTS": "BDT 22,500", "DELF A2": "BDT 6,000", "DELF B1": "BDT 8,000", "DELF B2": "BDT 10,000", "TCF (for residency)": "BDT 7,000" },
    strategicRecommendation: "ENROLL AT ALLIANCE FRANÇAISE DHAKA (Dhanmondi Road 3) NOW. This is your single highest ROI action for France. French A2 course: 3 months, BDT 8,000-12,000. French completely transforms your France experience from international worker to integrated professional. DELF B1 is the PR gate — take it at Alliance Française Dhaka before departure to avoid stress in France. Target: French A1 before departure → A2 (Year 1) → B1 (Year 2) → B2 (Year 3). With B2, Mistral AI, INRIA, Airbus, and BNP Paribas all open to you."
  },
  {
    country: "United Arab Emirates", countryCode: "AE",
    officialLanguages: ["Arabic"], workingLanguage: "English (de facto for all tech; Arabic for government roles)",
    overallLanguageScore: 90, confidenceScore: 95,
    admissionRequirements: {
      english: { ielts: { overall: 6.5, minimumBand: 6.0, competitive: 7.0 }, toefl: { ibt: 90, competitive: 100 }, pte: { overall: 58 }, exemptions: "BD nationals not exempt — IELTS mandatory for MBZUAI" },
      arabic: { required: false, note: "Arabic not required for MBZUAI or any major tech company. Basic Arabic phrases appreciated but never enforced." }
    },
    studyPhaseLanguage: {
      mediumOfInstruction: "100% English at MBZUAI — taught by international faculty from MIT, Stanford, CMU, Oxford",
      hostLanguageForIntegration: "English is sufficient for ALL aspects of life in Dubai/Abu Dhabi tech community",
      recommendedLevel: "IELTS 7.0 target for MBZUAI; strong technical English for seminars and paper writing",
      frenchAdvantage: "N/A"
    },
    workPhaseLanguage: {
      required: "English only for G42, Microsoft UAE, Amazon AWS, MBZUAI, Careem, Noon — 100% English workplaces",
      salaryImpact: "Arabic: 15-25% salary premium in government-adjacent roles (G42 government projects, ADEK, Mubadala); essential for senior UAE government advisory positions"
    },
    prRequirements: {
      expressEntry: { languageTest: "No language requirement for Golden Visa or standard residence permit", clbTarget: "N/A" },
      testValidity: "N/A"
    },
    citizenshipRequirements: {
      languageTest: "N/A — UAE citizenship does not exist for non-Arabs regardless of language",
      practicalLevel: "N/A",
      note: "UAE has NO citizenship pathway for non-Arab foreigners. Arabic language learning is for career enhancement only, not immigration purposes."
    },
    testCentersInBangladesh: ["British Council Dhaka (IELTS)", "IDP Dhaka (IELTS)", "Pearson PTE Dhaka"],
    testCostBDT: { "IELTS": "BDT 22,500" },
    strategicRecommendation: "UAE has the lowest language barrier of any GradPlanner destination — English is universally used in tech. Focus entirely on IELTS 7.0 (for MBZUAI target — 6.5 minimum, 7.0 recommended). Zero investment in Arabic is needed for career success at MBZUAI/G42/Microsoft UAE. OPTIONAL: Basic Arabic (Duolingo Arabic for 15 min/day for 6 months) gives you cultural respect and opens government advisory roles worth 20% premium. Never invest in full Arabic learning just for UAE purposes — the ROI is insufficient unless you plan to stay for 15+ years in a government-adjacent role."
  }
];

langUpgrades.forEach(upgrade => {
  const idx = langData.languageRequirements.findIndex(l => l.country === upgrade.country);
  if (idx !== -1) {
    langData.languageRequirements[idx] = upgrade;
  } else {
    langData.languageRequirements.push(upgrade);
  }
});

fs.writeFileSync(langPath, JSON.stringify(langData, null, 2));
console.log('language-requirements.json: All 6 countries upgraded!');
