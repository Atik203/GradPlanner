// =====================================================================
// salary-data.json
// =====================================================================

export interface SalaryDataMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
  currencyRates?: object;
}

export interface SalaryBand {
  min: number;
  median: number;
  max: number;
  usdEquivalent?: number;
  afterTax?: number;
  note?: string;
}

export interface SalaryByRole {
  mscGraduate: SalaryBand;
  phdGraduate: SalaryBand;
}

export interface TaxRate {
  effective: string;
  provincial?: string;
  federal?: string;
  note?: string;
}

export interface SalaryData {
  country: string;
  countryCode: string;
  currency: string;
  salaryScore: number;
  purchasingPowerScore: number;
  entryLevel: SalaryByRole;
  midLevel3to5yrs: SalaryBand;
  seniorLevel: SalaryBand;
  totalCompensationNote?: string;
  taxRate?: TaxRate;
  geographicVariation?: Record<string, string | number | unknown>;
  benefits?: string[] | Record<string, unknown>;
  remittanceAdvice?: string;
  bdtEquivalent?: Record<string, unknown>;
  confidenceScore?: number;
}

export interface SalaryDataFile {
  salaryData: SalaryData[];
  metadata?: SalaryDataMetadata;
}
