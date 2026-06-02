// =====================================================================
// taxation.json
// =====================================================================

export interface TaxationMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
  bangladeshDoubleTaxNote?: string;
}

export interface TaxBracket {
  bracket: string;
  rate: string;
  currency?: string;
}

export interface StudentTaxPhase {
  taxResidencyNote?: string;
  tuitionTaxCredit?: string;
  stipendTaxability?: string;
  effectiveTaxOnStipend?: string;
  [key: string]: unknown;
}

export interface WorkingGraduateTaxPhase {
  federalTaxBrackets?: TaxBracket[];
  provincialTax?: string;
  cpp?: string;
  ei?: string;
  effectiveTaxRate?: string;
  afterTaxExample?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface InvestmentTax {
  capitalGainsTax?: string;
  dividendTax?: string;
  cryptoTax?: string;
  tfsa?: string;
  rrsp?: string;
  [key: string]: unknown;
}

export interface RemittanceTax {
  remittanceTax?: string;
  foreignTransferReporting?: string;
  foreignAccountReporting?: string;
  [key: string]: unknown;
}

export interface TaxationEntry {
  country: string;
  countryCode: string;
  currency: string;
  overallTaxScore: number;
  confidenceScore: number;
  taxSystemType?: string;
  studentPhase?: StudentTaxPhase;
  workingGraduatePhase?: WorkingGraduateTaxPhase;
  investmentTax?: InvestmentTax;
  remittanceTax?: RemittanceTax;
  taxTreaties?: Record<string, unknown>;
  taxOptimizationTips?: string[];
  overallSummary?: string;
}

export interface TaxationFile {
  taxation: TaxationEntry[];
  metadata?: TaxationMetadata;
}
