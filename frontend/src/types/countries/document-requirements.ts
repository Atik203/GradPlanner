// =====================================================================
// document-requirements.json
// =====================================================================

export interface DocumentRequirementsMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
}

export interface DocumentItem {
  document: string;
  details: string;
  attestationRequired: boolean;
  translationRequired: boolean;
  processingTime: string;
}

export interface DocumentCosts {
  applicationFees: string;
  studyPermitFee: string;
  biometricFee: string;
  medicalExam: string;
  attestationCosts: string;
}

export interface DocumentRequirements {
  country: string;
  countryCode: string;
  /** Some files use 'generalDocuments', older entries use 'requiredDocuments' */
  generalDocuments?: DocumentItem[];
  requiredDocuments?: DocumentItem[];
  visaDocuments: DocumentItem[];
  bangladeshSpecificSteps: string[];
  keyDeadlines: {
    fallIntake: string;
    winterIntake: string;
    visaApplyAfterAdmission: string;
  };
  estimatedCosts: DocumentCosts;
  /** Legacy field — may not exist in all entries */
  applicationStage?: string;
}

export interface DocumentRequirementsFile {
  documentRequirements: DocumentRequirements[];
  metadata?: DocumentRequirementsMetadata;
}
