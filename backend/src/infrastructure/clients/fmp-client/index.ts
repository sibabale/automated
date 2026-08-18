// [ BACKEND > INFRASTRUCTURE > CLIENTS > FMP CLIENT ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { setTimeout as delay } from "node:timers/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * Distinguishes the kinds of failure the client can surface so callers can
 * react without inspecting transport-level details.
 */
export type FmpClientErrorKind =
  | "authentication"
  | "not-found"
  | "rate-limit"
  | "timeout"
  | "invalid-response"
  | "provider";

/**
 * A single record returned by an FMP endpoint. The raw shape is intentionally
 * opaque here; mapping to domain entities is the repository's responsibility.
 */
export type FmpRecord = Record<string, unknown>;

/**
 * Query parameters accepted by the statement-style endpoints.
 */
export interface FmpQuery {
  symbol: string;
  period?: "annual" | "quarter";
  limit?: number;
}
// 1.3. END ..........................................................................................

// 1.4. ENDPOINTS ....................................................................................
/**
 * The Financial Modeling Prep endpoints this client is allowed to call.
 *
 * Kept as a closed set so the surface we depend on stays small and any new
 * endpoint is a deliberate, reviewable addition.
 *
 * @sort-keys — order is a lookup convenience only and carries no meaning.
 */
export const FMP_ENDPOINTS = {
  profile: "profile",
  cashFlow: "cash-flow-statement",
  ratiosTtm: "ratios-ttm",
  keyMetrics: "key-metrics",
  balanceSheet: "balance-sheet-statement",
  incomeStatement: "income-statement",
  discountedCashFlow: "discounted-cash-flow",
} as const;

export type FmpEndpoint = (typeof FMP_ENDPOINTS)[keyof typeof FMP_ENDPOINTS];
// 1.4. END ..........................................................................................

// 1.5. ERROR ........................................................................................
/**
 * Represents any failure originating from the FMP provider or its transport.
 *
 * The `kind` lets the caller branch on meaning (for example missing
 * credentials versus an unknown ticker) without parsing provider messages.
 */
export class FmpClientError extends Error {
  constructor(
    public readonly kind: FmpClientErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "FmpClientError";
  }
}
// 1.5. END ..........................................................................................

// 1.6. CONFIGURATION ................................................................................
/**
 * Resolves the client's infrastructure settings from the environment.
 *
 * Reading configuration lazily keeps the module import-safe and lets tests
 * override values per call without a process restart.
 */
function resolvePositiveInteger(
  rawValue: string | undefined,
  fallback: number,
): number {
  const parsed = Number(rawValue ?? String(fallback));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveConfig(): {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  minIntervalMs: number;
  maxRetries: number;
} {
  const baseUrl = (process.env.FMP_BASE_URL ?? "https://financialmodelingprep.com/stable").replace(
    /\/+$/,
    "",
  );
  const apiKey = process.env.FMP_API_KEY ?? "";
  const timeoutMs = resolvePositiveInteger(process.env.FMP_TIMEOUT_MS, 10000);
  const minIntervalMs = resolvePositiveInteger(process.env.FMP_MIN_INTERVAL_MS, 400);
  const maxRetries = resolvePositiveInteger(process.env.FMP_RATE_LIMIT_RETRIES, 4);

  return { baseUrl, apiKey, timeoutMs, minIntervalMs, maxRetries };
}
// 1.6. END ..........................................................................................

// 1.6.1. RATE LIMITING ..............................................................................
let nextAvailableAt = 0;

async function waitForTurn(minIntervalMs: number): Promise<void> {
  const now = Date.now();
  const scheduledAt = Math.max(now, nextAvailableAt);
  nextAvailableAt = scheduledAt + minIntervalMs;

  const waitMs = scheduledAt - now;
  if (waitMs > 0) {
    await delay(waitMs);
  }
}

function readRetryAfterMs(response: Response): number | null {
  const header = response.headers.get("retry-after");
  if (!header) {
    return null;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.ceil(seconds * 1000);
  }

  return null;
}

async function backOffAfterRateLimit(
  response: Response,
  attempt: number,
  endpoint: FmpEndpoint,
  correlationId: string,
): Promise<void> {
  const retryAfterMs = readRetryAfterMs(response);
  const exponentialMs = Math.min(1000 * 2 ** attempt, 30000);
  const jitterMs = Math.floor(Math.random() * 250);
  const delayMs = retryAfterMs ?? exponentialMs + jitterMs;

  logger.warn(
    { correlationId, endpoint, attempt: attempt + 1, delayMs, retryAfterMs },
    "FMP rate limit encountered; backing off before retry",
  );

  await delay(delayMs);
}
// 1.6.1. END ........................................................................................

// 1.7. CLIENT .......................................................................................
/**
 * Performs a single authenticated GET against an FMP endpoint and returns the
 * raw JSON rows.
 *
 * Transport, authentication and status-code concerns are contained here so the
 * rest of the application only ever sees typed rows or a `FmpClientError`.
 *
 * @param endpoint - One of the allowed {@link FMP_ENDPOINTS} paths.
 * @param query - The ticker and optional period/limit selectors.
 * @param correlationId - Request-scoped identifier propagated for tracing.
 */
export async function fmpGetJson(
  endpoint: FmpEndpoint,
  query: FmpQuery,
  correlationId: string,
): Promise<FmpRecord[]> {
  // 1.7.1. GUARD ....................................................................................
  const { baseUrl, apiKey, timeoutMs, minIntervalMs, maxRetries } = resolveConfig();

  if (!apiKey) {
    throw new FmpClientError("authentication", "FMP API key is not configured");
  }
  // 1.7.1. END ......................................................................................

  // 1.7.2. REQUEST ..................................................................................
  // Build the full URL with the ticker and optional filters, then attach the
  // secret key last. A timer is armed so a slow FMP call is aborted after the
  // configured timeout instead of hanging the request. If the fetch is aborted
  // we report a timeout; any other network failure is reported as a generic
  // provider error. The timer is always cleared so it can never fire late.
  const url = new URL(`${baseUrl}/${endpoint}`);
  url.searchParams.set("symbol", query.symbol);
  if (query.period) url.searchParams.set("period", query.period);
  if (query.limit !== undefined) url.searchParams.set("limit", String(query.limit));
  url.searchParams.set("apikey", apiKey);

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    await waitForTurn(minIntervalMs);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    logger.debug({ correlationId, endpoint, symbol: query.symbol, attempt }, "Calling FMP endpoint");

    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new FmpClientError("timeout", `FMP request timed out for ${endpoint}`);
      }
      throw new FmpClientError("provider", `FMP request failed for ${endpoint}`);
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 429 && attempt < maxRetries) {
      await backOffAfterRateLimit(response, attempt, endpoint, correlationId);
      continue;
    }

    return parseResponse(endpoint, response, correlationId);
  }

  // 1.7.2. END ......................................................................................

  // 1.7.3. RESPONSE .................................................................................
  throw new FmpClientError("rate-limit", `FMP rate limit exceeded for ${endpoint}`);
  // 1.7.3. END ......................................................................................
}

/**
 * Translates an HTTP response into rows or a meaningful {@link FmpClientError}.
 */
async function parseResponse(
  endpoint: FmpEndpoint,
  response: Response,
  correlationId: string,
): Promise<FmpRecord[]> {
  if (response.status === 401 || response.status === 403) {
    throw new FmpClientError("authentication", `FMP authentication failed for ${endpoint}`);
  }
  if (response.status === 404) {
    throw new FmpClientError("not-found", `FMP endpoint not found for ${endpoint}`);
  }
  if (response.status === 429) {
    throw new FmpClientError("rate-limit", `FMP rate limit exceeded for ${endpoint}`);
  }
  if (response.status >= 400) {
    throw new FmpClientError("provider", `FMP returned ${response.status} for ${endpoint}`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new FmpClientError("invalid-response", `FMP returned invalid JSON for ${endpoint}`);
  }

  if (Array.isArray(body)) {
    return body.filter((row): row is FmpRecord => typeof row === "object" && row !== null);
  }

  if (typeof body === "object" && body !== null) {
    const message = (body as Record<string, unknown>)["Error Message"];
    if (typeof message === "string") {
      logger.warn({ correlationId, endpoint }, "FMP returned an error message");
      throw new FmpClientError("invalid-response", message);
    }
    return [body as FmpRecord];
  }

  throw new FmpClientError("invalid-response", "FMP returned an unsupported response shape");
}
// 1.7. END ..........................................................................................

// END FILE ##########################################################################################
