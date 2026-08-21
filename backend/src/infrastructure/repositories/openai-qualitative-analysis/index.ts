// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > OPENAI QUALITATIVE ANALYSIS ] ###########################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createOpenAiClient, type OpenAiClient } from "../../clients/openai-client/index.js";
import {
  OVERVIEW_QUALITATIVE_PILLAR_LABELS,
  type OverviewQualitativeAnalysis,
  type OverviewQualitativeInput,
  type QualitativeAnalysisRepository,
} from "../../../domain/repositories/qualitative-analysis.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface StructuredQualitativeResponse {
  verdict: {
    label?: unknown;
    title?: unknown;
    description?: unknown;
  };
  pillars: Array<{
    label?: unknown;
    title?: unknown;
    description?: unknown;
  }>;
}

interface OpenAiQualitativeRepositoryDependencies {
  client?: OpenAiClient;
}
// 1.3. END ..........................................................................................

// 1.4. PROMPT .......................................................................................
const QUALITATIVE_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["verdict", "pillars"],
  properties: {
    verdict: {
      type: "object",
      additionalProperties: false,
      required: ["label", "title", "description"],
      properties: {
        label: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
      },
    },
    pillars: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "title", "description"],
        properties: {
          label: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  },
} as const;

const SYSTEM_PROMPT = [
  "You produce qualitative investment commentary for a stock overview card set.",
  "Use only the facts supplied by the caller. Do not invent products, segments, strategy, or management actions that are not present in the input.",
  "Return concise, businesslike prose with no markdown.",
  "Always return exactly four pillars in this order: Durable Competitive Advantage, Management Quality, Predictable Earnings, Simple Business Model.",
  "If the supplied facts are incomplete, acknowledge the uncertainty directly instead of guessing.",
].join(" ");
// 1.4. END ..........................................................................................

// 1.5. HELPERS ......................................................................................
function readNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeStructuredResponse(parsed: unknown): OverviewQualitativeAnalysis {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("OpenAI qualitative response must be a JSON object");
  }

  const response = parsed as StructuredQualitativeResponse;
  const verdictTitle = readNonEmptyString(response.verdict?.title);
  const verdictDescription = readNonEmptyString(response.verdict?.description);

  if (!verdictTitle || !verdictDescription) {
    throw new Error("OpenAI qualitative response must include verdict title and description");
  }

  if (!Array.isArray(response.pillars) || response.pillars.length !== OVERVIEW_QUALITATIVE_PILLAR_LABELS.length) {
    throw new Error("OpenAI qualitative response must include exactly four pillars");
  }

  const pillars = response.pillars.map((pillar, index) => {
    const title = readNonEmptyString(pillar.title);
    const description = readNonEmptyString(pillar.description);

    if (!title || !description) {
      throw new Error("OpenAI qualitative response pillars must include title and description");
    }

    return {
      label: OVERVIEW_QUALITATIVE_PILLAR_LABELS[index]!,
      title,
      description,
    };
  });

  return {
    verdict: {
      label: "Investment Verdict",
      title: verdictTitle,
      description: verdictDescription,
    },
    pillars,
  };
}

function createPromptInput(input: OverviewQualitativeInput): string {
  return JSON.stringify({
    company: {
      companyName: input.reportHeader.companyName,
      industry: input.reportHeader.industry,
      sector: input.reportHeader.sector,
      ticker: input.reportHeader.ticker,
    },
    decision: input.decision,
    score: input.score,
    analysisModel: input.analysisModel,
    constitutionVersion: input.constitutionVersion,
    metrics: input.metrics,
    strengths: input.strengths,
  });
}
// 1.5. END ..........................................................................................

// 1.6. REPOSITORY ...................................................................................
/**
 * Adapts the OpenAI structured-output call to the application's qualitative
 * analysis port while keeping the response schema deterministic.
 */
export function createOpenAiQualitativeAnalysisRepository(
  dependencies: OpenAiQualitativeRepositoryDependencies = {},
): QualitativeAnalysisRepository {
  const client = dependencies.client ?? createOpenAiClient();

  return {
    async generateOverviewQualitative(input, correlationId): Promise<OverviewQualitativeAnalysis> {
      const response = await client.generateStructuredOutput({
        instructions: SYSTEM_PROMPT,
        input: createPromptInput(input),
        responseFormat: {
          name: "overview_qualitative_analysis",
          description: "Structured verdict and four qualitative investment pillars for a stock overview.",
          schema: QUALITATIVE_RESPONSE_SCHEMA,
        },
        correlationId,
      });

      return normalizeStructuredResponse(JSON.parse(response.outputText));
    },
  };
}
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
