// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP COMPANY PROFILE > TESTS ] #########################
//
// These tests pin the exact profile-field mapping so the overview header only
// renders verified provider fields and treats missing strings as absent data.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFmpCompanyProfileRepository } from "./index.js";
import { FmpClientError } from "../../clients/fmp-client/index.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
async function startRepoMock(
  profileRows: unknown[],
): Promise<{ url: string; close: () => Promise<unknown> }> {
  return startMockFmpServer({
    profile: { body: profileRows },
  }) as Promise<{ url: string; close: () => Promise<unknown> }>;
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFmpCompanyProfileRepository", () => {
  // 1.4.1. SETUP ....................................................................................
  const savedKey = process.env.FMP_API_KEY;

  before(() => {
    process.env.FMP_API_KEY = "test-key";
  });

  after(() => {
    process.env.FMP_API_KEY = savedKey;
    delete process.env.FMP_BASE_URL;
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. MAPS THE PROFILE FIELDS THE OVERVIEW HEADER NEEDS ........................................
  it("maps company name, ticker, sector, industry, and share price from the profile row", async () => {
    const mock = await startRepoMock([
      {
        companyName: "Apple Inc.",
        industry: "Consumer Electronics",
        price: 184.25,
        sector: "Technology",
        symbol: "AAPL",
      },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repository = createFmpCompanyProfileRepository();
    const result = await repository.getProfile("AAPL", "cid-overview-repo-001");
    await mock.close();

    assert.deepEqual(result, {
      companyName: "Apple Inc.",
      industry: "Consumer Electronics",
      sector: "Technology",
      sharePrice: 184.25,
      ticker: "AAPL",
    });
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. TURNS BLANK STRINGS INTO NULLS AND FALLS BACK TO THE REQUESTED TICKER ....................
  it("turns blank strings into nulls and falls back to the requested ticker when symbol is missing", async () => {
    const mock = await startRepoMock([
      {
        companyName: "  ",
        industry: "",
        price: null,
        sector: " ",
      },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repository = createFmpCompanyProfileRepository();
    const result = await repository.getProfile("MSFT", "cid-overview-repo-002");
    await mock.close();

    assert.deepEqual(result, {
      companyName: null,
      industry: null,
      sector: null,
      sharePrice: null,
      ticker: "MSFT",
    });
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. FAILS WHEN THE PROVIDER RETURNS NO PROFILE ROW ...........................................
  it("throws a not-found FmpClientError when the provider returns no profile rows", async () => {
    const mock = await startRepoMock([]);
    process.env.FMP_BASE_URL = mock.url;

    const repository = createFmpCompanyProfileRepository();

    await assert.rejects(
      repository.getProfile("MISS", "cid-overview-repo-003"),
      (error: unknown) =>
        error instanceof FmpClientError &&
        error.kind === "not-found" &&
        error.message === "No company profile found for MISS",
    );

    await mock.close();
  });
  // 1.4.4. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
