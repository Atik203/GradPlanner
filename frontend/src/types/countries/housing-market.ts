// =====================================================================
// housing-market.json
// =====================================================================

export interface RentBreakdown {
  localCurrency: number;
  usd: number;
  note: string;
}

export interface CityRentBreakdown {
  sharedRoom: RentBreakdown;
  privateRoom: RentBreakdown;
  studio1BR: RentBreakdown;
  onCampus?: RentBreakdown;
}

export interface CityHousing {
  city: string;
  province?: string;
  housingCrisisLevel: string;
  vacancyRate?: string;
  averageRentTrend?: string;
  studentRentalMarket: CityRentBreakdown;
  practicalTips?: string[];
}

export interface HousingMarket {
  country: string;
  countryCode: string;
  currency: string;
  usdExchangeRate: number;
  overallHousingScore: number;
  confidenceScore: number;
  housingCrisisLevel?: string;
  evidenceSummary: string;
  cityBreakdown: CityHousing[];
  nationalAverage?: Record<string, unknown>;
  practicalAdvice?: string;
  bdStudentRecommendation?: string;
}

export interface HousingMarketFile {
  housingMarkets: HousingMarket[];
}
