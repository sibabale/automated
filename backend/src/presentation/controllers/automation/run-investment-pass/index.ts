// [ BACKEND > PRESENTATION > CONTROLLERS > AUTOMATION > RUN INVESTMENT PASS ] #########################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../../errors/http-error/index.js";
import { statusForAlpacaError } from "../../../alpaca-error-status/index.js";
import { statusForFmpError } from "../../../fmp-error-status/index.js";
import { FmpClientError } from "../../../../infrastructure/clients/fmp-client/index.js";
import { AlpacaClientError } from "../../../../infrastructure/clients/alpaca-client/index.js";
import { createAlpacaBrokerRepository } from "../../../../infrastructure/repositories/alpaca-broker/index.js";
import { createFmpCashFlowDataRepository } from "../../../../infrastructure/repositories/fmp-cash-flow-data/index.js";
import { createFmpFinancialDataRepository } from "../../../../infrastructure/repositories/fmp-financial-data/index.js";
import { createFmpCompanyProfileRepository } from "../../../../infrastructure/repositories/fmp-company-profile/index.js";
import { createFmpProfitMarginDataRepository } from "../../../../infrastructure/repositories/fmp-profit-margin-data/index.js";
import { createFmpDebtToEquityDataRepository } from "../../../../infrastructure/repositories/fmp-debt-to-equity-data/index.js";
import { createFmpMarginOfSafetyDataRepository } from "../../../../infrastructure/repositories/fmp-margin-of-safety-data/index.js";
import { createFilePurchaseSnapshotRepository } from "../../../../infrastructure/repositories/file-purchase-snapshot/index.js";
import { createFileTickerSourceBatchRepository } from "../../../../infrastructure/repositories/file-ticker-source-batch/index.js";
import { createFileAutomatedInvestmentDecisionRepository } from "../../../../infrastructure/repositories/file-automated-investment-decision/index.js";
import { runAutomatedInvestmentPass } from "../../../../application/services/automated-investment-runner/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface RunInvestmentPassResponse {
  correlationId: string;
  data: Awaited<ReturnType<typeof runAutomatedInvestmentPass>>;
}
// 1.3. END ..........................................................................................

// 1.4. CONTROLLER ...................................................................................
export const runInvestmentPassController: RequestHandler = async (request, response, next) => {
  try {
    const summary = await runAutomatedInvestmentPass(
      {
        brokerRepository: createAlpacaBrokerRepository(),
        purchaseSnapshotRepository: createFilePurchaseSnapshotRepository(),
        decisionRepository: createFileAutomatedInvestmentDecisionRepository(),
        tickerSourceBatchRepository: createFileTickerSourceBatchRepository(),
        companyProfileRepository: createFmpCompanyProfileRepository(),
        debtToEquityRepository: createFmpDebtToEquityDataRepository(),
        freeCashFlowRepository: createFmpCashFlowDataRepository(),
        marginOfSafetyRepository: createFmpMarginOfSafetyDataRepository(),
        profitMarginRepository: createFmpProfitMarginDataRepository(),
        returnOnEquityRepository: createFmpFinancialDataRepository(),
      },
      request.correlationId,
    );

    const body: RunInvestmentPassResponse = {
      correlationId: request.correlationId,
      data: summary,
    };

    response.status(200).json(body);
  } catch (error) {
    if (error instanceof FmpClientError) {
      return next(new HttpError(statusForFmpError(error.kind), error.message));
    }
    if (error instanceof AlpacaClientError) {
      return next(new HttpError(statusForAlpacaError(error.kind), error.message));
    }
    if (error instanceof Error && error.message.includes("MAX_TRADE_AMOUNT")) {
      return next(new HttpError(500, error.message));
    }
    next(error);
  }
};
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
