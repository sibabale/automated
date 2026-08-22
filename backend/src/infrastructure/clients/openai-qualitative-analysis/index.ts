// [ BACKEND > INFRASTRUCTURE > CLIENTS > OPENAI QUALITATIVE ANALYSIS ] ##############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import OpenAI from "openai";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import {
  QUALITATIVE_PILLAR_LABELS,
  type QualitativeAnalysis,
  type QualitativeAnalysisClient,
  type QualitativeAnalysisGenerationInput,
} from "../../../application/services/qualitative-analysis/index.js";
// 1.2. END ..........................................................................................

// 1.3. CONFIGURATION ................................................................................
interface OpenAiConfig {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

function resolvePositiveInteger(rawValue: string | undefined, fallback: number): number {
  const parsed = Number(rawValue ?? String(fallback));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveConfig(): OpenAiConfig {
  return {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
    timeoutMs: resolvePositiveInteger(process.env.OPENAI_TIMEOUT_MS, 10000),
  };
}

const QUALITATIVE_ANALYSIS_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    summary: { type: "string" },
    pillars: {
      type: "array",
      minItems: QUALITATIVE_PILLAR_LABELS.length,
      maxItems: QUALITATIVE_PILLAR_LABELS.length,
      items: {
        type: "object",
        properties: {
          label: {
            type: "string",
            enum: [...QUALITATIVE_PILLAR_LABELS],
          },
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["label", "title", "description"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "pillars"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = [
  "You write concise qualitative commentary for an equity overview page.",
  "Use only the supplied grounded data.",
  "Do not invent management behaviour, competitive moats, market events, or facts not present in the input.",
  "Keep each title short and each description to one or two sentences maximum.",
  "Preserve the supplied pillar labels and keep them in the same order.",
  "Return JSON only.",
].join(" ");
// 1.3. END ..........................................................................................

// 1.4. HELPERS ......................................................................................
function buildUserPrompt(input: QualitativeAnalysisGenerationInput): string {
  return [
    `Create a qualitative analysis for ticker ${input.reportHeader.ticker}.`,
    "",
    "Return JSON with this shape:",
    JSON.stringify(
      {
        summary: "string",
        pillars: QUALITATIVE_PILLAR_LABELS.map((label) => ({
          description: "string",
          label,
          title: "string",
        })),
      },
      null,
      2,
    ),
    "",
    "Grounded company facts:",
    JSON.stringify(
      {
        companyName: input.reportHeader.companyName,
        industry: input.reportHeader.industry,
        sector: input.reportHeader.sector,
        ticker: input.reportHeader.ticker,
      },
      null,
      2,
    ),
    "",
    "Grounded metric snapshot:",
    JSON.stringify(
      {
        metrics: input.metrics,
        strengths: input.strengths,
      },
      null,
      2,
    ),
    "",
    "Deterministic draft to improve while staying grounded:",
    JSON.stringify(input.deterministicAnalysis, null, 2),
  ].join("\n");
}

function readString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }

  return value.trim();
}

function normalizePillars(value: unknown): QualitativeAnalysis["pillars"] {
  if (!Array.isArray(value) || value.length !== QUALITATIVE_PILLAR_LABELS.length) {
    throw new Error("Qualitative analysis must contain every required pillar");
  }

  const byLabel = new Map<
    QualitativeAnalysis["pillars"][number]["label"],
    QualitativeAnalysis["pillars"][number]
  >();

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      throw new Error("Each qualitative pillar must be a JSON object");
    }

    const label = readString((entry as Record<string, unknown>).label, "Qualitative pillar label");
    if (!QUALITATIVE_PILLAR_LABELS.includes(label as (typeof QUALITATIVE_PILLAR_LABELS)[number])) {
      throw new Error(`Unexpected qualitative pillar label: ${label}`);
    }

    byLabel.set(label as QualitativeAnalysis["pillars"][number]["label"], {
      label: label as QualitativeAnalysis["pillars"][number]["label"],
      title: readString((entry as Record<string, unknown>).title, `Qualitative pillar title for ${label}`),
      description: readString(
        (entry as Record<string, unknown>).description,
        `Qualitative pillar description for ${label}`,
      ),
    });
  }

  return QUALITATIVE_PILLAR_LABELS.map((label) => {
    const pillar = byLabel.get(label);
    if (!pillar) {
      throw new Error(`Missing qualitative pillar: ${label}`);
    }

    return pillar;
  });
}

function parseQualitativeAnalysis(text: string): QualitativeAnalysis {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("OpenAI qualitative analysis did not return valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("OpenAI qualitative analysis must be a JSON object");
  }

  return {
    summary: readString((parsed as Record<string, unknown>).summary, "Qualitative analysis summary"),
    pillars: normalizePillars((parsed as Record<string, unknown>).pillars),
  };
}
// 1.4. END ..........................................................................................

// 1.5. CLIENT .......................................................................................
export function createOpenAiQualitativeAnalysisClient(): QualitativeAnalysisClient | null {
  const config = resolveConfig();

  logger.debug({ hasApiKey: !!config.apiKey, model: config.model }, "Creating OpenAI client");

  if (!config.apiKey) {
    logger.warn("No OPENAI_API_KEY found, returning null client");
    return null;
  }

  const client = new OpenAI({
    apiKey: config.apiKey,
    timeout: config.timeoutMs,
  });

  return {
    async generateOverview(input, correlationId) {
      logger.debug(
        { correlationId, model: config.model, ticker: input.reportHeader.ticker },
        "Calling OpenAI for qualitative analysis",
      );

      const response = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "overview_qualitative_analysis",
            strict: true,
            schema: QUALITATIVE_ANALYSIS_SCHEMA,
          },
        },
      });

      const content = response.choices[0]?.message.content?.trim();
      logger.debug({ correlationId, hasContent: !!content }, "OpenAI response received");
      if (!content) {
        throw new Error("OpenAI qualitative analysis returned no content");
      }

      return parseQualitativeAnalysis(content);
    },
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
