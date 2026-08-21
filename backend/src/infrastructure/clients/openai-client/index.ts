// [ BACKEND > INFRASTRUCTURE > CLIENTS > OPENAI CLIENT ] #############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import OpenAI from "openai";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type OpenAiClientErrorKind =
  | "authentication"
  | "timeout"
  | "invalid-response"
  | "provider";

export interface OpenAiStructuredOutputRequest {
  instructions: string;
  input: string;
  responseFormat: {
    name: string;
    description?: string;
    schema: Record<string, unknown>;
  };
  correlationId: string;
}

export interface OpenAiStructuredOutputResponse {
  model: string;
  outputText: string;
}

interface OpenAiSdkResponse {
  error: { message?: string | null } | null;
  output_text: string;
}

interface OpenAiSdkClient {
  responses: {
    create(
      params: {
        instructions: string;
        input: string;
        metadata?: Record<string, string>;
        model: string;
        text: {
          format: {
            type: "json_schema";
            name: string;
            description?: string;
            schema: Record<string, unknown>;
            strict: true;
          };
        };
      },
      options?: { signal?: AbortSignal },
    ): Promise<OpenAiSdkResponse>;
  };
}

export interface OpenAiClient {
  generateStructuredOutput(
    request: OpenAiStructuredOutputRequest,
  ): Promise<OpenAiStructuredOutputResponse>;
}

export interface OpenAiClientDependencies {
  sdkClient?: OpenAiSdkClient;
}
// 1.3. END ..........................................................................................

// 1.4. ERROR ........................................................................................
export class OpenAiClientError extends Error {
  constructor(
    public readonly kind: OpenAiClientErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "OpenAiClientError";
  }
}
// 1.4. END ..........................................................................................

// 1.5. CONFIGURATION ................................................................................
function resolvePositiveInteger(rawValue: string | undefined, fallback: number): number {
  const parsed = Number(rawValue ?? String(fallback));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveConfig(): {
  apiKey: string;
  baseURL: string | undefined;
  model: string;
  timeoutMs: number;
} {
  return {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    baseURL: process.env.OPENAI_BASE_URL,
    model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
    timeoutMs: resolvePositiveInteger(process.env.OPENAI_TIMEOUT_MS, 10000),
  };
}

function isErrorWithStatus(error: unknown): error is { status: number; message?: string } {
  return typeof error === "object" && error !== null && "status" in error && typeof (error as { status: unknown }).status === "number";
}
// 1.5. END ..........................................................................................

// 1.6. CLIENT .......................................................................................
/**
 * Wraps the OpenAI SDK behind one structured-output method so the repository
 * layer never depends on SDK-specific request or response types.
 */
export function createOpenAiClient(dependencies: OpenAiClientDependencies = {}): OpenAiClient {
  return {
    async generateStructuredOutput(request): Promise<OpenAiStructuredOutputResponse> {
      const { apiKey, baseURL, model, timeoutMs } = resolveConfig();

      if (!apiKey) {
        throw new OpenAiClientError("authentication", "OPENAI_API_KEY is not configured");
      }

      const sdkClient = dependencies.sdkClient ?? new OpenAI({ apiKey, baseURL });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      logger.debug(
        {
          correlationId: request.correlationId,
          model,
          responseFormat: request.responseFormat.name,
        },
        "Calling OpenAI structured-output response",
      );

      try {
        const response = await sdkClient.responses.create(
          {
            instructions: request.instructions,
            input: request.input,
            metadata: {
              correlationId: request.correlationId,
              responseFormat: request.responseFormat.name,
            },
            model,
            text: {
              format: {
                type: "json_schema",
                name: request.responseFormat.name,
                description: request.responseFormat.description,
                schema: request.responseFormat.schema,
                strict: true,
              },
            },
          },
          { signal: controller.signal },
        );

        if (response.error) {
          throw new OpenAiClientError(
            "provider",
            response.error.message ?? "OpenAI returned an unknown structured-output error",
          );
        }

        if (typeof response.output_text !== "string" || response.output_text.trim().length === 0) {
          throw new OpenAiClientError(
            "invalid-response",
            "OpenAI returned an empty structured-output response",
          );
        }

        return {
          model,
          outputText: response.output_text,
        };
      } catch (error) {
        if (error instanceof OpenAiClientError) {
          throw error;
        }
        if (error instanceof Error && error.name === "AbortError") {
          throw new OpenAiClientError("timeout", `OpenAI request timed out after ${timeoutMs}ms`);
        }
        if (isErrorWithStatus(error) && (error.status === 401 || error.status === 403)) {
          throw new OpenAiClientError(
            "authentication",
            error.message ?? "OpenAI authentication failed",
          );
        }
        throw new OpenAiClientError("provider", error instanceof Error ? error.message : "OpenAI request failed");
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################
