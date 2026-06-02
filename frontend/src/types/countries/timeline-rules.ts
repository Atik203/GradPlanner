// =====================================================================
// timeline-rules.json
// =====================================================================

export interface TimelineRulesMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  targetProfile?: string;
  criticalNote?: string;
}

export interface TimelinePhaseApplication {
  duration: string;
  startDate: string;
  keyMilestones: string[];
  criticalDeadlines: string;
}

export interface TimelinePhaseStudy {
  mscDuration: string;
  phdDuration: string;
  keyMilestones: string[];
  criticalNote: string;
}

export interface TimelinePhasePostStudy {
  permitName: string;
  duration: string;
  processingTime: string;
  keyMilestones: string[];
  criticalNote: string;
}

export interface TimelinePhasePR {
  pathwayName: string;
  processingTime: string;
  eligibilityRequirements: string[];
  estimatedYearsFromGraduation: string;
  keyMilestones: string[];
}

export interface TimelinePhaseCitizenship {
  waitAfterPr: string;
  processingTime: string;
  languageRequired: string;
  estimatedYearsFromGraduation: string;
  note?: string;
}

export interface TimelinePhaseFamilyRelocation {
  spouseVisa: string;
  childrenVisa: string;
  parentSponsor: string;
  bestTime: string;
  timeFromGraduation: string;
}

export interface TimelinePhases {
  phase1_application: TimelinePhaseApplication;
  phase2_study: TimelinePhaseStudy;
  phase3_postStudyWork: TimelinePhasePostStudy;
  phase4_pr: TimelinePhasePR;
  phase5_citizenship: TimelinePhaseCitizenship;
  phase6_familyRelocation: TimelinePhaseFamilyRelocation;
}

export interface TimelineMilestone {
  year: number;
  event: string;
}

export interface CountryTimeline {
  country: string;
  countryCode: string;
  totalJourneyYears: {
    mscPathway: string;
    phdPathway: string;
  };
  phases: TimelinePhases;
  sampleTimeline_MSc: TimelineMilestone[];
  sampleTimeline_PhD?: TimelineMilestone[];
  criticalDates?: Record<string, string>;
  confidenceScore?: number;
}

export interface TimelineRulesFile {
  countryTimelines: CountryTimeline[];
  metadata?: TimelineRulesMetadata;
}
