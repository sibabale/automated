// [ BACKEND > INFRASTRUCTURE > CLIENTS > OPENAI CLIENT > TESTS ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { OpenAiClientError, createOpenAiClient } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
afterEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  delete process.env.OPENAI_TIMEOUT_MS;
});

describe("createOpenAiClient", () => {
  it("throws an authentication error when the API key is missing", async () => {
    const client = createOpenAiClient();

    await assert.rejects(
      client.generateStructuredOutput({
        instructions: "system",
        input: "{}",
        responseFormat: {
          name: "overview_qualitative_analysis",
          schema: { type: "object" },
        },
        correlationId: "cid-openai-001",
      }),
      (error: unknown) =>
        error instanceof OpenAiClientError
        && error.kind === "authentication"
        && error.message === "OPENAI_API_KEY is not configured",
    );
  });

  it("sends a structured-output request through the SDK wrapper and returns output text", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-5-mini";
    let capturedRequest: unknown;

    const client = createOpenAiClient({
      sdkClient: {
        responses: {
          async create(request) {
            capturedRequest = request;
            return {
              error: null,
              output_text: '{"verdict":{"label":"Investment Verdict","title":"Watchlist Candidate","description":"Mixed signals"},"pillars":[]}',
            };
          },
        },
      },
    });

    const response = await client.generateStructuredOutput({
      instructions: "system instructions",
      input: '{"ticker":"AAPL"}',
      responseFormat: {
        name: "overview_qualitative_analysis",
        description: "overview qualitative output",
        schema: { type: "object" },
      },
      correlationId: "cid-openai-002",
    });

    assert.deepEqual(capturedRequest, {
      instructions: "system instructions",
      input: '{"ticker":"AAPL"}',
      metadata: {
        correlationId: "cid-openai-002",
        responseFormat: "overview_qualitative_analysis",
      },
      model: "gpt-5-mini",
      text: {
        format: {
          type: "json_schema",
          name: "overview_qualitative_analysis",
          description: "overview qualitative output",
          schema: { type: "object" },
          strict: true,
        },
      },
    });
    assert.deepEqual(response, {
      model: "gpt-5-mini",
      outputText: '{"verdict":{"label":"Investment Verdict","title":"Watchlist Candidate","description":"Mixed signals"},"pillars":[]}',
    });
  });

  it("maps SDK provider failures into OpenAiClientError", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const client = createOpenAiClient({
      sdkClient: {
        responses: {
          async create() {
            throw new Error("upstream unavailable");
          },
        },
      },
    });

    await assert.rejects(
      client.generateStructuredOutput({
        instructions: "system",
        input: "{}",
        responseFormat: {
          name: "overview_qualitative_analysis",
          schema: { type: "object" },
        },
        correlationId: "cid-openai-003",
      }),
      (error: unknown) =>
        error instanceof OpenAiClientError
        && error.kind === "provider"
        && error.message === "upstream unavailable",
    );
  });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
