// [ BACKEND > INFRASTRUCTURE > CLIENTS > ALPACA CLIENT ] ############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import type { TradeMode } from "../../../domain/entities/trade-order.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type AlpacaClientErrorKind =
  | "authentication"
  | "forbidden"
  | "invalid-request"
  | "rate-limit"
  | "timeout"
  | "invalid-response"
  | "provider";

export interface AlpacaAccountRecord {
  status?: unknown;
  trading_blocked?: unknown;
}

export interface AlpacaOrderRecord {
  id?: unknown;
  status?: unknown;
  symbol?: unknown;
  side?: unknown;
  type?: unknown;
  qty?: unknown;
  limit_price?: unknown;
  filled_qty?: unknown;
  filled_avg_price?: unknown;
  submitted_at?: unknown;
}

export interface AlpacaPositionRecord {
  asset_name?: unknown;
  symbol?: unknown;
  name?: unknown;
  qty?: unknown;
  avg_entry_price?: unknown;
  current_price?: unknown;
  market_value?: unknown;
  unrealized_pl?: unknown;
}

interface AlpacaConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  timeoutMs: number;
}

export class AlpacaClientError extends Error {
  constructor(
    public readonly kind: AlpacaClientErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "AlpacaClientError";
  }
}
// 1.3. END ..........................................................................................

// 1.4. CONFIGURATION ................................................................................
/**
 * Resolves the Alpaca configuration for one trading mode from the environment.
 *
 * Paper and live credentials stay separate so the caller must opt into the
 * target ledger explicitly instead of relying on implicit defaults.
 */
function resolveConfig(mode: TradeMode): AlpacaConfig {
  const prefix = mode === "live" ? "ALPACA_LIVE" : "ALPACA_PAPER";
  const apiKey = process.env[`${prefix}_API_KEY`] ?? "";
  const apiSecret = process.env[`${prefix}_API_SECRET`] ?? "";
  const baseUrl = (process.env[`${prefix}_API_BASE_URL`] ?? "").replace(/\/+$/, "");
  const timeoutMs = Number(process.env.ALPACA_TIMEOUT_MS ?? "10000");

  return { apiKey, apiSecret, baseUrl, timeoutMs };
}
// 1.4. END ..........................................................................................

// 1.5. CLIENT .......................................................................................
/**
 * Reads the Alpaca account state for one trading mode.
 */
export async function alpacaGetAccount(
  mode: TradeMode,
  correlationId: string,
): Promise<AlpacaAccountRecord> {
  const response = await alpacaRequest(mode, "account", undefined, correlationId);
  return readObject(response, "Alpaca account response");
}

/**
 * Submits one order to Alpaca and returns the raw broker payload.
 */
export async function alpacaSubmitOrder(
  mode: TradeMode,
  payload: Record<string, unknown>,
  correlationId: string,
): Promise<AlpacaOrderRecord> {
  const response = await alpacaRequest(mode, "orders", payload, correlationId);
  return readObject(response, "Alpaca order response");
}

/**
 * Reads the broker's current positions for one trading mode.
 */
export async function alpacaGetPositions(
  mode: TradeMode,
  correlationId: string,
): Promise<AlpacaPositionRecord[]> {
  const response = await alpacaRequest(mode, "positions", undefined, correlationId);
  if (!Array.isArray(response)) {
    throw new AlpacaClientError("invalid-response", "Alpaca positions response must be an array");
  }

  return response.filter((entry): entry is AlpacaPositionRecord => typeof entry === "object" && entry !== null);
}

/**
 * Performs one authenticated Alpaca request and translates transport failures
 * into stable client error kinds the repository can reason about.
 */
async function alpacaRequest(
  mode: TradeMode,
  resource: string,
  body: Record<string, unknown> | undefined,
  correlationId: string,
): Promise<unknown> {
  const { apiKey, apiSecret, baseUrl, timeoutMs } = resolveConfig(mode);
  if (!apiKey || !apiSecret || !baseUrl) {
    throw new AlpacaClientError("authentication", `Alpaca ${mode} credentials are not configured`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const method = body ? "POST" : "GET";
  const url = `${baseUrl}/v2/${resource}`;

  logger.debug({ correlationId, mode, resource, method }, "Calling Alpaca endpoint");

  let response: Response;
  try {
    const requestInit: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    response = await fetch(url, requestInit);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AlpacaClientError("timeout", `Alpaca ${resource} request timed out`);
    }
    throw new AlpacaClientError("provider", `Alpaca ${resource} request failed`);
  } finally {
    clearTimeout(timer);
  }

  return parseResponse(response, resource, correlationId);
}

/**
 * Translates one Alpaca HTTP response into JSON or a stable client error.
 */
async function parseResponse(response: Response, resource: string, correlationId: string): Promise<unknown> {
  if (response.status === 401) {
    throw new AlpacaClientError("authentication", `Alpaca authentication failed for ${resource}`);
  }
  if (response.status === 403) {
    throw new AlpacaClientError("forbidden", `Alpaca rejected access to ${resource}`);
  }
  if (response.status === 422) {
    throw new AlpacaClientError("invalid-request", `Alpaca rejected the ${resource} request`);
  }
  if (response.status === 429) {
    throw new AlpacaClientError("rate-limit", `Alpaca rate limit exceeded for ${resource}`);
  }
  if (response.status >= 400) {
    throw new AlpacaClientError("provider", `Alpaca returned ${response.status} for ${resource}`);
  }

  try {
    return await response.json();
  } catch {
    logger.warn({ correlationId, resource }, "Alpaca returned invalid JSON");
    throw new AlpacaClientError("invalid-response", `Alpaca returned invalid JSON for ${resource}`);
  }
}

function readObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AlpacaClientError("invalid-response", `${label} must be a JSON object`);
  }

  return value as Record<string, unknown>;
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
