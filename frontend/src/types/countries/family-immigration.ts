// =====================================================================
// family-immigration.json
// =====================================================================

export interface FamilyImmigrationMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
  scoringNote?: string;
}

export interface SpouseRights {
  spouseCanWork: boolean;
  spouseCanWorkDuringStudy: boolean;
  spouseCanWorkDuringPostStudy: boolean;
  spouseCanWorkDuringWorkPermit: string | boolean;
  spouseCanWorkAfterPR: boolean;
  spouseWorkScore: number;
  spouseRestrictions: string;
  spouseCanStudy: boolean;
  spouseStudyNotes?: string;
}

export interface ChildrenRights {
  childrenCanEnrollSchool: boolean;
  schoolingType: string;
  schoolingCost?: string;
  childrenHealthcare?: string;
  birthRightCitizenship?: boolean;
  childBenefits?: string;
}

export interface ParentSponsorshipRights {
  canSponsorParents: boolean;
  whenEligible: string;
  processingTime?: string;
  visaType?: string;
  financialRequirements?: string;
}

export interface FamilyImmigrationRights {
  country: string;
  countryCode: string;
  overallFamilyScore: number;
  overallFamilyScoreConfidence: number;
  overallFamilyScoreEvidence: string;
  spouseRights: SpouseRights;
  childrenRights: ChildrenRights;
  parentSponsorshipRights?: ParentSponsorshipRights;
  healthcareForFamily?: Record<string, unknown>;
  familySummary?: string;
  strategicNote?: string;
}

export interface FamilyImmigrationFile {
  familyImmigrationRights: FamilyImmigrationRights[];
  metadata?: FamilyImmigrationMetadata;
}
