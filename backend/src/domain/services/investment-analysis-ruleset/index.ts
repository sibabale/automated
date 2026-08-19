// [ BACKEND > DOMAIN > SERVICES > INVESTMENT ANALYSIS RULESET ] #####################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type {
  AutomatedDecisionStatus,
  AutomatedDecisionStrengths,
  AutomatedInvestmentDecision,
  MetricStrength,
} from "../../entities/automated-investment-decision.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export const SUPPORTED_API_VERSIONS = ["v1", "v2"] as const;

export type ApiVersion = (typeof SUPPORTED_API_VERSIONS)[number];

export const DEFAULT_API_VERSION: ApiVersion = "v1";

export type OverviewMetricSlug =
  | "return-on-equity"
  | "free-cash-flow"
  | "debt-to-equity"
  | "profit-margin"
  | "margin-of-safety";

export interface InvestmentAnalysisRuleset {
  apiVersion: ApiVersion;
  analysisModel: string;
  constitutionVersion: string;
  classifyMetricStrengths(metrics: AutomatedInvestmentDecision["metrics"]): AutomatedDecisionStrengths;
  deriveDecisionStatus(strengths: AutomatedDecisionStrengths): AutomatedDecisionStatus;
  scoreDecisionStrengths(strengths: AutomatedDecisionStrengths): number;
  describeMetric(slug: OverviewMetricSlug, strength: MetricStrength): string;
}

interface RulesetDefinition {
  analysisModel: string;
  constitutionVersion: string;
  freeCashFlowStrongThreshold: number;
}
// 1.3. END ..........................................................................................

// 1.4. CONFIGURATION ................................................................................
const RULESET_DEFINITIONS: Record<ApiVersion, RulesetDefinition> = {
  v1: {
    analysisModel: "automated-investment-v1",
    constitutionVersion: "all-five-metrics-must-be-strong",
    freeCashFlowStrongThreshold: 10_000_000_000,
  },
  v2: {
    analysisModel: "automated-investment-v2",
    constitutionVersion: "all-five-metrics-must-be-strong-lower-free-cash-flow-threshold",
    freeCashFlowStrongThreshold: 5_000_000_000,
  },
};
// 1.4. END ..........................................................................................

// 1.5. HELPERS ......................................................................................
export function isApiVersion(value: string): value is ApiVersion {
  return SUPPORTED_API_VERSIONS.includes(value as ApiVersion);
}

function classifyReturnOnEquity(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value >= 20) {
    return "strong";
  }
  if (value >= 10) {
    return "medium";
  }
  return "weak";
}

function classifyFreeCashFlow(
  value: number | null,
  freeCashFlowStrongThreshold: number,
): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value > freeCashFlowStrongThreshold) {
    return "strong";
  }
  if (value > 0) {
    return "medium";
  }
  return "weak";
}

function classifyDebtToEquity(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value <= 0.5) {
    return "strong";
  }
  if (value <= 1.5) {
    return "medium";
  }
  return "weak";
}

function classifyProfitMargin(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value >= 20) {
    return "strong";
  }
  if (value >= 10) {
    return "medium";
  }
  return "weak";
}

function classifyMarginOfSafety(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value >= 20) {
    return "strong";
  }
  if (value >= 0) {
    return "medium";
  }
  return "weak";
}
// 1.5. END ..........................................................................................

// 1.6. SERVICE ......................................................................................
export function resolveInvestmentAnalysisRuleset(apiVersion: ApiVersion): InvestmentAnalysisRuleset {
  const definition = RULESET_DEFINITIONS[apiVersion];

  return {
    apiVersion,
    analysisModel: definition.analysisModel,
    constitutionVersion: definition.constitutionVersion,
    classifyMetricStrengths(metrics) {
      return {
        returnOnEquity: classifyReturnOnEquity(metrics.returnOnEquity),
        freeCashFlow: classifyFreeCashFlow(
          metrics.freeCashFlow,
          definition.freeCashFlowStrongThreshold,
        ),
        debtToEquity: classifyDebtToEquity(metrics.debtToEquity),
        profitMargin: classifyProfitMargin(metrics.profitMargin),
        marginOfSafety: classifyMarginOfSafety(metrics.marginOfSafety),
      };
    },
    deriveDecisionStatus(strengths) {
      const values = Object.values(strengths);

      if (values.every((value) => value === "strong")) {
        return "buy";
      }

      if (values.some((value) => value === "weak")) {
        return "reject";
      }

      return "watch";
    },
    scoreDecisionStrengths(strengths) {
      const scores = Object.values(strengths).map((value) => {
        if (value === "strong") {
          return 100;
        }
        if (value === "medium") {
          return 60;
        }
        return 20;
      });

      return scores.reduce((sum, value) => sum + value, 0) / scores.length;
    },
    describeMetric(slug, strength) {
      switch (slug) {
        case "return-on-equity":
          if (strength === "strong") {
            return "Strong shareholder returns";
          }
          if (strength === "medium") {
            return "Acceptable shareholder returns";
          }
          return "Weak shareholder returns";
        case "free-cash-flow":
          if (strength === "strong") {
            return "Funds growth and expansion";
          }
          if (strength === "medium") {
            return "Supports ongoing investment";
          }
          return "Limited capacity to self-fund growth";
        case "debt-to-equity":
          if (strength === "strong") {
            return "Conservative leverage";
          }
          if (strength === "medium") {
            return "Manageable leverage";
          }
          return "Leverage risk";
        case "profit-margin":
          if (strength === "strong") {
            return "High pricing power";
          }
          if (strength === "medium") {
            return "Acceptable pricing power";
          }
          return "Low pricing power";
        case "margin-of-safety":
          if (strength === "strong") {
            return "Attractive discount";
          }
          if (strength === "medium") {
            return "Fairly valued";
          }
          return "Overvalued";
      }
    },
  };
}
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
