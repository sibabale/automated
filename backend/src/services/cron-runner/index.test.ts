// [ BACKEND > SERVICES > CRON RUNNER > TESTS ] ######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { readCronRunnerConfig, startCronRunner } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. CLEANUP ......................................................................................
const activeHandles: Array<{ stop(): void }> = [];

afterEach(() => {
  while (activeHandles.length > 0) {
    activeHandles.pop()?.stop();
  }
});
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("readCronRunnerConfig", () => {
  // 1.4.1. READS DEFAULTS WHEN ENV IS EMPTY .........................................................
  it("reads defaults when env is empty", () => {
    const config = readCronRunnerConfig({});

    assert.deepEqual(config, {
      enabled: false,
      intervalMs: 86_400_000,
      initialDelayMs: 14_400_000,
      endpointUrl: "http://127.0.0.1:3001/api/v1/automation/run-investment-pass",
    });
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. READS EXPLICIT ENV OVERRIDES .............................................................
  it("reads explicit env overrides", () => {
    const config = readCronRunnerConfig({
      AUTOMATION_CRON_ENABLED: "true",
      AUTOMATION_CRON_INTERVAL_MS: "120000",
      AUTOMATION_CRON_INITIAL_DELAY_MS: "5000",
      INTERNAL_API_BASE_URL: "http://127.0.0.1:4500/",
    });

    assert.deepEqual(config, {
      enabled: true,
      intervalMs: 120000,
      initialDelayMs: 5000,
      endpointUrl: "http://127.0.0.1:4500/api/v1/automation/run-investment-pass",
    });
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. REJECTS INVALID INTERVAL VALUES ..........................................................
  it("rejects invalid interval values", () => {
    assert.throws(
      () => readCronRunnerConfig({ AUTOMATION_CRON_INTERVAL_MS: "0" }),
      /AUTOMATION_CRON_INTERVAL_MS must be an integer greater than zero/,
    );
  });
  // 1.4.3. END ......................................................................................
});

describe("startCronRunner", () => {
  // 1.4.4. DOES NOTHING WHEN THE RUNNER IS DISABLED .................................................
  it("does nothing when the runner is disabled", async () => {
    const fetchMock = mock.fn(async () => new Response(null, { status: 200 }));
    const handle = startCronRunner(
      {
        enabled: false,
        intervalMs: 20,
        initialDelayMs: 0,
        endpointUrl: "http://127.0.0.1:3001/api/v1/automation/run-investment-pass",
      },
      fetchMock as typeof fetch,
    );
    activeHandles.push(handle);

    await new Promise((resolve) => setTimeout(resolve, 25));
    assert.equal(fetchMock.mock.calls.length, 0);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. CALLS THE AUTOMATION ENDPOINT ON THE CONFIGURED TIMER ....................................
  it("calls the automation endpoint on the configured timer", async () => {
    const fetchMock = mock.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const handle = startCronRunner(
      {
        enabled: true,
        intervalMs: 1000,
        initialDelayMs: 0,
        endpointUrl: "http://127.0.0.1:3001/api/v1/automation/run-investment-pass",
      },
      fetchMock as typeof fetch,
    );
    activeHandles.push(handle);

    await new Promise((resolve) => setTimeout(resolve, 30));

    assert.equal(fetchMock.mock.calls.length, 1);
    assert.equal(
      fetchMock.mock.calls[0]?.arguments[0],
      "http://127.0.0.1:3001/api/v1/automation/run-investment-pass",
    );
    assert.deepEqual(fetchMock.mock.calls[0]?.arguments[1], {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-correlation-id": fetchMock.mock.calls[0]?.arguments[1]?.headers["x-correlation-id"],
        "x-automation-trigger": "cron",
      },
    });
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. SKIPS OVERLAPPING TICKS WHILE A RUN IS STILL ACTIVE ......................................
  it("skips overlapping ticks while a run is still active", async () => {
    let resolveFetch: (() => void) | null = null;
    const fetchMock = mock.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = () => resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
        }),
    );
    const handle = startCronRunner(
      {
        enabled: true,
        intervalMs: 10,
        initialDelayMs: 0,
        endpointUrl: "http://127.0.0.1:3001/api/v1/automation/run-investment-pass",
      },
      fetchMock as typeof fetch,
    );
    activeHandles.push(handle);

    await new Promise((resolve) => setTimeout(resolve, 35));
    assert.equal(fetchMock.mock.calls.length, 1);

    resolveFetch?.();
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
  // 1.4.6. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
