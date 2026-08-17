// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP COMPANY PROFILE ] #################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
  FmpClientError,
  FMP_ENDPOINTS,
  type FmpRecord,
  fmpGetJson,
} from "../../clients/fmp-client/index.js";
import { readNumber } from "../fmp-repository/index.js";
import type { CompanyProfile } from "../../../domain/entities/company-profile.entity.js";
import type { CompanyProfileRepository } from "../../../domain/repositories/company-profile.repository.js";
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
/**
 * Reads a provider string only when it contains non-whitespace content.
 */
function readText(row: FmpRecord, key: string): string | null {
  const value = row[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
// 1.3. END ..........................................................................................

// 1.4. REPOSITORY ...................................................................................
/**
 * Builds the Financial Modeling Prep implementation of the company-profile port.
 *
 * The profile endpoint is a single-row snapshot. This adapter reads only the
 * header fields the overview needs and fails fast when the provider returns no
 * profile at all for the requested ticker.
 */
export function createFmpCompanyProfileRepository(): CompanyProfileRepository {
  return {
    async getProfile(ticker, correlationId): Promise<CompanyProfile> {
      const profileRow = (await fmpGetJson(
        FMP_ENDPOINTS.profile,
        { symbol: ticker },
        correlationId,
      ))[0];

      if (!profileRow) {
        throw new FmpClientError("not-found", `No company profile found for ${ticker}`);
      }

      return {
        companyName: readText(profileRow, "companyName"),
        industry: readText(profileRow, "industry"),
        sector: readText(profileRow, "sector"),
        sharePrice: readNumber(profileRow, "price"),
        ticker: readText(profileRow, "symbol") ?? ticker,
      };
    },
  };
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
