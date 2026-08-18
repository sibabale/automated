// [ BACKEND > SERVICES > CRON RUNNER ] ##############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { randomUUID } from "node:crypto";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../logger.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface CronRunnerConfig {
  enabled: boolean;
  intervalMs: number;
  initialDelayMs: number;
  endpointUrl: string;
}

export interface CronRunnerHandle {
  stop(): void;
}
// 1.3. END ..........................................................................................

// 1.4. CONFIGURATION ................................................................................
const DEFAULT_INTERVAL_MS = 86_400_000;
const DEFAULT_INITIAL_DELAY_MS = 60_000;
const DEFAULT_INTERNAL_API_BASE_URL = "http://127.0.0.1:3001";
const AUTOMATION_PATH = "/automation/run-investment-pass";

export function readCronRunnerConfig(environment = process.env): CronRunnerConfig {
  const enabled = String(environment.AUTOMATION_CRON_ENABLED ?? "false").trim() === "true";
  const intervalMs = readPositiveInteger(
    environment.AUTOMATION_CRON_INTERVAL_MS,
    DEFAULT_INTERVAL_MS,
    "AUTOMATION_CRON_INTERVAL_MS",
  );
  const initialDelayMs = readNonNegativeInteger(
    environment.AUTOMATION_CRON_INITIAL_DELAY_MS,
    DEFAULT_INITIAL_DELAY_MS,
    "AUTOMATION_CRON_INITIAL_DELAY_MS",
  );
  const baseUrl = (environment.INTERNAL_API_BASE_URL ?? DEFAULT_INTERNAL_API_BASE_URL).replace(/\/+$/, "");

  return {
    enabled,
    intervalMs,
    initialDelayMs,
    endpointUrl: `${baseUrl}${AUTOMATION_PATH}`,
  };
}

function readPositiveInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be an integer greater than zero`);
  }

  return parsed;
}

function readNonNegativeInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }

  return parsed;
}
// 1.4. END ..........................................................................................

// 1.5. RUNNER .......................................................................................
/**
 * Starts the internal cron scheduler when enabled.
 *
 * The runner owns only timing, overlap protection, and internal HTTP dispatch.
 * Investment analysis and order placement stay behind the existing automation
 * endpoint so there is still one execution surface for the actual workflow.
 */
export function startCronRunner(
  config = readCronRunnerConfig(),
  schedulerFetch: typeof fetch = fetch,
): CronRunnerHandle {
  if (!config.enabled) {
    logger.info({ enabled: false }, "Automation cron runner disabled");
    return { stop() {} };
  }

  let intervalTimer: NodeJS.Timeout | null = null;
  let initialTimer: NodeJS.Timeout | null = null;
  let isRunning = false;

  const runTick = async (): Promise<void> => {
    if (isRunning) {
      logger.warn({ endpointUrl: config.endpointUrl }, "Automation cron tick skipped because a run is already in progress");
      return;
    }

    isRunning = true;
    const correlationId = `cron-${randomUUID()}`;

    logger.info({ correlationId, endpointUrl: config.endpointUrl }, "Automation cron run started");

    try {
      const response = await schedulerFetch(config.endpointUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          "x-correlation-id": correlationId,
          "x-automation-trigger": "cron",
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        logger.error(
          {
            correlationId,
            endpointUrl: config.endpointUrl,
            statusCode: response.status,
            errorMessage: payload?.error?.message ?? null,
          },
          "Automation cron run failed",
        );
        return;
      }

      logger.info({ correlationId, endpointUrl: config.endpointUrl }, "Automation cron run completed");
    } catch (error) {
      logger.error({ correlationId, endpointUrl: config.endpointUrl, err: error }, "Automation cron request failed");
    } finally {
      isRunning = false;
    }
  };

  initialTimer = setTimeout(() => {
    void runTick();
    intervalTimer = setInterval(() => {
      void runTick();
    }, config.intervalMs);
  }, config.initialDelayMs);

  logger.info(
    {
      endpointUrl: config.endpointUrl,
      intervalMs: config.intervalMs,
      initialDelayMs: config.initialDelayMs,
    },
    "Automation cron runner started",
  );

  return {
    stop() {
      if (initialTimer) {
        clearTimeout(initialTimer);
        initialTimer = null;
      }
      if (intervalTimer) {
        clearInterval(intervalTimer);
        intervalTimer = null;
      }
      logger.info({ endpointUrl: config.endpointUrl }, "Automation cron runner stopped");
    },
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
