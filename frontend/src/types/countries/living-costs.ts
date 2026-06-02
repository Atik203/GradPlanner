// =====================================================================
// living-costs.json
// =====================================================================

export interface RentCategory {
  localCurrency: number;
  usd: number;
  note: string;
}

export interface RentCosts {
  sharedRoom: RentCategory;
  privateRoom: RentCategory;
  studio1BR: RentCategory;
  onCampus?: RentCategory;
}

export interface MonthlyBreakdown {
  rent: RentCosts;
  food?: { total: RentCategory; breakdown?: Record<string, RentCategory> };
  transport?: RentCategory;
  utilities?: RentCategory;
  internet?: RentCategory;
  phone?: RentCategory;
  healthcare?: RentCategory;
  miscellaneous?: RentCategory;
  totalMinimum?: RentCategory;
  totalComfortable?: RentCategory;
}

export interface LivingCostPhase {
  durationTypical?: string;
  monthlyBreakdown: MonthlyBreakdown;
  annualTotal?: RentCategory;
  notes?: string;
}

export interface LivingCosts {
  country: string;
  countryCode: string;
  currency: string;
  usdExchangeRate: number;
  majorStudyCities?: string[];
  recommendedCitiesForBangladeshiStudents?: string[];
  avoidCitiesNote?: string;
  confidenceScore: number;
  evidenceSummary: string;
  studentPhase: LivingCostPhase;
  workingPhase?: LivingCostPhase;
  comparison?: Record<string, unknown>;
  bdSpecificAdvice?: string;
}

export interface LivingCostsFile {
  livingCosts: LivingCosts[];
}
