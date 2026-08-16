#!/usr/bin/env node
import path from 'node:path';
import { Verifier } from '@pact-foundation/pact';

// Verifies all pact files under backend/test/pacts against a running provider.
// Usage: PROVIDER_BASE_URL=http://localhost:3001 node ./verify-pacts.js

const pactDir = path.resolve(process.cwd(), 'test', 'pacts');
const pactFiles = [path.join(pactDir, '*.json')];

const providerBaseUrl = process.env.PROVIDER_BASE_URL || 'http://localhost:3001';

async function run() {
  console.log('Verifying pacts in', pactDir, 'against', providerBaseUrl);
  const opts = {
    providerBaseUrl,
    pactUrls: pactFiles,
    publishVerificationResult: false,
  };

  try {
    await new Verifier(opts).verifyProvider();
    console.log('Pact verification successful');
    process.exit(0);
  } catch (error) {
    console.error('Pact verification failed', error);
    process.exit(1);
  }
}

run();
