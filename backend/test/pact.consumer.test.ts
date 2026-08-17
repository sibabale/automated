import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// Pact relies on native binaries which may not be available in all envs. Load
// it dynamically and skip the test gracefully if the import fails.

describe('Pact consumer (example)', () => {
  it('creates a pact for the return-on-equity endpoint (skippable)', async () => {
    let PactModule;
    try {
      PactModule = await import('@pact-foundation/pact');
    } catch (err) {
      console.warn('Pact native bindings unavailable; skipping pact consumer test:', err?.message ?? err);
      return; // skip the test
    }

    const { Pact } = PactModule;

    const provider = new Pact({
      consumer: 'consumer-frontend',
      provider: 'backend-service',
      port: 12345,
      dir: './test/pacts',
      log: './logs/pact.log',
    });

    await provider.setup();

    await provider.addInteraction({
      uponReceiving: 'a request for return on equity',
      withRequest: {
        method: 'GET',
        path: '/analysis/return-on-equity',
        query: 'ticker=AAPL',
        headers: { 'Accept': 'application/json' },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          correlationId: 'test-correlation',
          data: {
            ticker: 'AAPL',
            horizons: [],
            consolidatedSummary: { values: [], denominator: '0', result: '—' },
            trailingTwelveMonthsActuals: { netIncome: '$1.0M', shareholdersEquity: '$1.0M' }
          }
        }
      }
    });

    // exercise the mock provider
    const res = await fetch('http://127.0.0.1:12345/analysis/return-on-equity?ticker=AAPL', {
      headers: { Accept: 'application/json' },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.ticker, 'AAPL');

    await provider.verify();
    await provider.finalize();
  });

  it('creates a pact for the margin-of-safety endpoint (skippable)', async () => {
    let PactModule;
    try {
      PactModule = await import('@pact-foundation/pact');
    } catch (err) {
      console.warn('Pact native bindings unavailable; skipping pact consumer test:', err?.message ?? err);
      return;
    }

    const { Pact } = PactModule;

    const provider = new Pact({
      consumer: 'consumer-frontend',
      provider: 'backend-service',
      port: 12346,
      dir: './test/pacts',
      log: './logs/pact.log',
    });

    await provider.setup();

    await provider.addInteraction({
      uponReceiving: 'a request for margin of safety',
      withRequest: {
        method: 'GET',
        path: '/analysis/margin-of-safety',
        query: 'ticker=AAPL',
        headers: { 'Accept': 'application/json' },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          correlationId: 'test-correlation',
          data: {
            ticker: 'AAPL',
            horizons: [],
            consolidatedSummary: { values: ['20.0%'], denominator: '1', result: '20.0%' },
            trailingTwelveMonthsActuals: { intrinsicValue: '$250.00', stockPrice: '$200.00' }
          }
        }
      }
    });

    const res = await fetch('http://127.0.0.1:12346/analysis/margin-of-safety?ticker=AAPL', {
      headers: { Accept: 'application/json' },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.ticker, 'AAPL');

    await provider.verify();
    await provider.finalize();
  });
});
