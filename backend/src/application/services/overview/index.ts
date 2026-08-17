// [ BACKEND > APPLICATION > SERVICES > OVERVIEW ] ###################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyseProfitMargin } from "../profit-margin/index.js";
import { analyseDebtToEquity } from "../debt-to-equity/index.js";
import { analyseFreeCashFlow } from "../free-cash-flow/index.js";
import { analyseMarginOfSafety } from "../margin-of-safety/index.js";
import { analyseReturnOnEquity } from "../return-on-equity/index.js";
import type { CashFlowYear } from "../../../domain/entities/cash-flow-year.entity.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { CompanyProfile } from "../../../domain/entities/company-profile.entity.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import type { CompanyProfileRepository } from "../../../domain/repositories/company-profile.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface OverviewDependencies {
  companyProfileRepository: CompanyProfileRepository;
  debtToEquityRepository: FinancialDataRepository<DebtToEquityYear>;
  freeCashFlowRepository: FinancialDataRepository<CashFlowYear>;
  marginOfSafetyRepository: FinancialDataRepository<MarginOfSafetyYear>;
  profitMarginRepository: FinancialDataRepository<ProfitMarginYear>;
  returnOnEquityRepository: FinancialDataRepository<FinancialYear>;
}

export interface OverviewAnalysis {
  metrics: {
    debtToEquity: number | null;
    freeCashFlow: number | null;
    marginOfSafety: number | null;
    profitMargin: number | null;
    returnOnEquity: number | null;
  };
  reportHeader: CompanyProfile;
}
// 1.3. END ..........................................................................................

// 1.4. HELPERS ......................................................................................
/**
 * Collapses the horizon cards into the same single number shown on the overview
 * cards: the arithmetic mean of each horizon average. Empty horizon sets stay
 * `null` so the controller can render a placeholder instead of inventing a
 * value.
 */
function averageHorizons(horizons: Array<{ average: number }>): number | null {
  if (horizons.length === 0) {
    return null;
  }

  const total = horizons.reduce((sum, horizon) => sum + horizon.average, 0);
  return total / horizons.length;
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
/**
 * Builds the company overview from the existing profile and metric services.
 *
 * Every source is independent, so they are fetched in parallel and then reduced
 * into the small header-plus-cards payload the home page needs.
 */
export async function buildOverview(
  ticker: string,
  dependencies: OverviewDependencies,
  correlationId: string,
): Promise<OverviewAnalysis> {
  const [
    reportHeader,
    returnOnEquity,
    freeCashFlow,
    debtToEquity,
    profitMargin,
    marginOfSafety,
  ] = await Promise.all([
    dependencies.companyProfileRepository.getProfile(ticker, correlationId),
    analyseReturnOnEquity(ticker, dependencies.returnOnEquityRepository, correlationId),
    analyseFreeCashFlow(ticker, dependencies.freeCashFlowRepository, correlationId),
    analyseDebtToEquity(ticker, dependencies.debtToEquityRepository, correlationId),
    analyseProfitMargin(ticker, dependencies.profitMarginRepository, correlationId),
    analyseMarginOfSafety(ticker, dependencies.marginOfSafetyRepository, correlationId),
  ]);

  return {
    metrics: {
      debtToEquity: averageHorizons(debtToEquity.horizons),
      freeCashFlow: averageHorizons(freeCashFlow.horizons),
      marginOfSafety: marginOfSafety.currentMarginOfSafety,
      profitMargin: averageHorizons(profitMargin.horizons),
      returnOnEquity: averageHorizons(returnOnEquity.horizons),
    },
    reportHeader,
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################
