// [ BACKEND > INFRASTRUCTURE > CLIENTS > OPENAI QUALITATIVE ANALYSIS > TESTS ] ######################
//
// These tests cover the OpenAI adapter's public runtime contract: environment
// config resolution, prompt construction, strict JSON parsing, and null-client
// behaviour when credentials are absent.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
  __openAiQualitativeAnalysisInternals,
  createOpenAiQualitativeAnalysisClient,
} from "./index.js";
import type { QualitativeAnalysisGenerationInput } from "../../../application/services/qualitative-analysis/index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
const savedEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  OPENAI_TIMEOUT_MS: process.env.OPENAI_TIMEOUT_MS,
};

const SAMPLE_INPUT: QualitativeAnalysisGenerationInput = {
  deterministicAnalysis: {
    summary: "Amazon.com, Inc. shows a mixed quantitative profile.",
    pillars: [
      {
        label: "Capital Efficiency",
        title: "Returns remain healthy",
        description: "Return on equity and profit margin remain supportive.",
      },
      {
        label: "Cash Generation",
        title: "Cash flow remains constructive",
        description: "Free cash flow supports self-funding capacity.",
      },
      {
        label: "Balance Sheet Discipline",
        title: "Leverage is manageable",
        description: "Debt-to-equity remains within an acceptable range.",
      },
      {
        label: "Valuation Context",
        title: "Valuation needs monitoring",
        description: "Margin of safety is positive but not especially wide.",
      },
    ],
  },
  metrics: {
    debtToEquity: 0.82,
    freeCashFlow: 11_500_000_000,
    freeCashFlowCoverageYears: 3.1,
    marginOfSafety: 8.4,
    profitMargin: 12.6,
    returnOnEquity: 18.4,
  },
  reportHeader: {
    companyName: "Amazon.com, Inc.",
    industry: "Internet Retail",
    sector: "Consumer Cyclical",
    sharePrice: 178.34,
    ticker: "AMZN",
  },
  strengths: {
    debtToEquity: "medium",
    freeCashFlow: "strong",
    marginOfSafety: "medium",
    profitMargin: "medium",
    returnOnEquity: "strong",
  },
};

afterEach(() => {
  if (savedEnv.OPENAI_API_KEY === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = savedEnv.OPENAI_API_KEY;

  if (savedEnv.OPENAI_MODEL === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = savedEnv.OPENAI_MODEL;

  if (savedEnv.OPENAI_TIMEOUT_MS === undefined) delete process.env.OPENAI_TIMEOUT_MS;
  else process.env.OPENAI_TIMEOUT_MS = savedEnv.OPENAI_TIMEOUT_MS;
});
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createOpenAiQualitativeAnalysisClient", () => {
  // 1.4.1. RESOLVES DEFAULT CONFIGURATION ...........................................................
  it("resolves the default OpenAI config when env vars are absent", () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
    delete process.env.OPENAI_TIMEOUT_MS;

    assert.deepEqual(__openAiQualitativeAnalysisInternals.resolveConfig(), {
      apiKey: "",
      model: "gpt-5-mini",
      timeoutMs: 10000,
    });
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RESOLVES EXPLICIT CONFIGURATION ..........................................................
  it("resolves explicit OpenAI config from env vars and falls back for invalid timeout", () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.OPENAI_MODEL = "gpt-4o-mini";
    process.env.OPENAI_TIMEOUT_MS = "0";

    assert.deepEqual(__openAiQualitativeAnalysisInternals.resolveConfig(), {
      apiKey: "test-openai-key",
      model: "gpt-4o-mini",
      timeoutMs: 10000,
    });

    process.env.OPENAI_TIMEOUT_MS = "15000";

    assert.deepEqual(__openAiQualitativeAnalysisInternals.resolveConfig(), {
      apiKey: "test-openai-key",
      model: "gpt-4o-mini",
      timeoutMs: 15000,
    });
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS NULL WITHOUT AN API KEY ..........................................................
  it("returns null when the OpenAI API key is absent", () => {
    delete process.env.OPENAI_API_KEY;

    assert.equal(createOpenAiQualitativeAnalysisClient(), null);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. EXPOSES A GENERATION FUNCTION WITH CREDENTIALS ...........................................
  it("returns a qualitative analysis client when the OpenAI API key is present", () => {
    process.env.OPENAI_API_KEY = "test-openai-key";

    const client = createOpenAiQualitativeAnalysisClient();

    assert.ok(client);
    assert.equal(typeof client.generateOverview, "function");
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. BUILDS A GROUNDED USER PROMPT ............................................................
  it("builds a prompt that includes the ticker, metric snapshot, strengths, and deterministic draft", () => {
    const prompt = __openAiQualitativeAnalysisInternals.buildUserPrompt(SAMPLE_INPUT);

    assert.match(prompt, /Create a qualitative analysis for ticker AMZN\./);
    assert.match(prompt, /"companyName": "Amazon\.com, Inc\."/);
    assert.match(prompt, /"ticker": "AMZN"/);
    assert.match(prompt, /"freeCashFlowCoverageYears": 3\.1/);
    assert.match(prompt, /"returnOnEquity": "strong"/);
    assert.match(prompt, /Deterministic draft to improve while staying grounded:/);
    assert.match(prompt, /"summary": "Amazon\.com, Inc\. shows a mixed quantitative profile\."/);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. PARSES VALID JSON AND NORMALISES PILLAR ORDER ............................................
  it("parses valid JSON and returns the required pillar order even when the input order is shuffled", () => {
    const analysis = __openAiQualitativeAnalysisInternals.parseQualitativeAnalysis(JSON.stringify({
      summary: "AMZN has grounded qualitative commentary.",
      pillars: [
        {
          label: "Valuation Context",
          title: "Valuation remains balanced",
          description: "Margin of safety is present but not wide.",
        },
        {
          label: "Balance Sheet Discipline",
          title: "Leverage remains manageable",
          description: "Debt-to-equity does not currently signal excess strain.",
        },
        {
          label: "Capital Efficiency",
          title: "Returns remain supportive",
          description: "Return on equity and margins both contribute positively.",
        },
        {
          label: "Cash Generation",
          title: "Cash flow remains supportive",
          description: "Cash generation continues to fund the operating base.",
        },
      ],
    }));

    assert.deepEqual(analysis, {
      summary: "AMZN has grounded qualitative commentary.",
      pillars: [
        {
          label: "Capital Efficiency",
          title: "Returns remain supportive",
          description: "Return on equity and margins both contribute positively.",
        },
        {
          label: "Cash Generation",
          title: "Cash flow remains supportive",
          description: "Cash generation continues to fund the operating base.",
        },
        {
          label: "Balance Sheet Discipline",
          title: "Leverage remains manageable",
          description: "Debt-to-equity does not currently signal excess strain.",
        },
        {
          label: "Valuation Context",
          title: "Valuation remains balanced",
          description: "Margin of safety is present but not wide.",
        },
      ],
    });
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. REJECTS INVALID JSON .....................................................................
  it("throws the exact invalid JSON error when OpenAI returns malformed JSON", () => {
    assert.throws(
      () => __openAiQualitativeAnalysisInternals.parseQualitativeAnalysis("{invalid-json"),
      (error: unknown) =>
        error instanceof Error
        && error.message === "OpenAI qualitative analysis did not return valid JSON",
    );
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. REJECTS NON-OBJECT PAYLOADS ..............................................................
  it("throws the exact object-shape error when OpenAI returns a non-object payload", () => {
    assert.throws(
      () => __openAiQualitativeAnalysisInternals.parseQualitativeAnalysis(JSON.stringify([])),
      (error: unknown) =>
        error instanceof Error
        && error.message === "OpenAI qualitative analysis must be a JSON object",
    );
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. REJECTS MISSING PILLARS ..................................................................
  it("throws the exact missing-pillar error when a required qualitative pillar is omitted", () => {
    assert.throws(
      () => __openAiQualitativeAnalysisInternals.parseQualitativeAnalysis(JSON.stringify({
        summary: "AMZN summary",
        pillars: [
          {
            label: "Capital Efficiency",
            title: "Returns remain supportive",
            description: "Return on equity remains healthy.",
          },
          {
            label: "Cash Generation",
            title: "Cash generation remains strong",
            description: "Free cash flow remains robust.",
          },
          {
            label: "Balance Sheet Discipline",
            title: "Leverage remains manageable",
            description: "Debt-to-equity remains moderate.",
          },
        ],
      })),
      (error: unknown) =>
        error instanceof Error
        && error.message === "Qualitative analysis must contain every required pillar",
    );
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. REJECTS UNEXPECTED PILLAR LABELS ........................................................
  it("throws the exact label error when OpenAI returns an unexpected pillar label", () => {
    assert.throws(
      () => __openAiQualitativeAnalysisInternals.parseQualitativeAnalysis(JSON.stringify({
        summary: "AMZN summary",
        pillars: [
          {
            label: "Capital Efficiency",
            title: "Returns remain supportive",
            description: "Return on equity remains healthy.",
          },
          {
            label: "Cash Generation",
            title: "Cash generation remains strong",
            description: "Free cash flow remains robust.",
          },
          {
            label: "Balance Sheet Discipline",
            title: "Leverage remains manageable",
            description: "Debt-to-equity remains moderate.",
          },
          {
            label: "Moat",
            title: "Unexpected label",
            description: "This should fail parsing.",
          },
        ],
      })),
      (error: unknown) =>
        error instanceof Error
        && error.message === "Unexpected qualitative pillar label: Moat",
    );
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. REJECTS EMPTY STRINGS ...................................................................
  it("throws the exact summary error when OpenAI returns an empty summary", () => {
    assert.throws(
      () => __openAiQualitativeAnalysisInternals.parseQualitativeAnalysis(JSON.stringify({
        summary: "   ",
        pillars: [
          {
            label: "Capital Efficiency",
            title: "Returns remain supportive",
            description: "Return on equity remains healthy.",
          },
          {
            label: "Cash Generation",
            title: "Cash generation remains strong",
            description: "Free cash flow remains robust.",
          },
          {
            label: "Balance Sheet Discipline",
            title: "Leverage remains manageable",
            description: "Debt-to-equity remains moderate.",
          },
          {
            label: "Valuation Context",
            title: "Valuation remains fair",
            description: "Margin of safety remains positive.",
          },
        ],
      })),
      (error: unknown) =>
        error instanceof Error
        && error.message === "Qualitative analysis summary must be a non-empty string",
    );
  });
  // 1.4.11. END .....................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
