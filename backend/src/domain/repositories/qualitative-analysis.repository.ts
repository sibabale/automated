// [ BACKEND > DOMAIN > REPOSITORIES > QUALITATIVE ANALYSIS ] ##########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { CompanyProfile } from "../entities/company-profile.entity.js";
import type {
  AutomatedDecisionMetrics,
  AutomatedDecisionStatus,
  AutomatedDecisionStrengths,
} from "../entities/automated-investment-decision.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export const OVERVIEW_QUALITATIVE_PILLAR_LABELS = [
  "Durable Competitive Advantage",
  "Management Quality",
  "Predictable Earnings",
  "Simple Business Model",
] as const;

export type OverviewQualitativePillarLabel = (typeof OVERVIEW_QUALITATIVE_PILLAR_LABELS)[number];

export interface OverviewQualitativeVerdict {
  label: string;
  title: string;
  description: string;
}

export interface OverviewQualitativePillar {
  label: OverviewQualitativePillarLabel;
  title: string;
  description: string;
}

export interface OverviewQualitativeAnalysis {
  verdict: OverviewQualitativeVerdict;
  pillars: OverviewQualitativePillar[];
}

export interface OverviewQualitativeInput {
  reportHeader: CompanyProfile;
  metrics: AutomatedDecisionMetrics;
  strengths: AutomatedDecisionStrengths;
  decision: AutomatedDecisionStatus;
  score: number;
  analysisModel: string;
  constitutionVersion: string;
}

/**
 * The application port for transforming quantitative overview facts into a
 * structured qualitative summary.
 */
export interface QualitativeAnalysisRepository {
  generateOverviewQualitative(
    input: OverviewQualitativeInput,
    correlationId: string,
  ): Promise<OverviewQualitativeAnalysis>;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
