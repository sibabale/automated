// [ BACKEND > PRESENTATION > ROUTES > CREATE API ROUTER ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { Router } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { overviewController } from "../controllers/overview/index.js";
import { portfolioController } from "../controllers/portfolio/index.js";
import { buyTradeController } from "../controllers/trades/buy/index.js";
import { profitMarginController } from "../controllers/profit-margin/index.js";
import { debtToEquityController } from "../controllers/debt-to-equity/index.js";
import { freeCashFlowController } from "../controllers/free-cash-flow/index.js";
import { marginOfSafetyController } from "../controllers/margin-of-safety/index.js";
import { returnOnEquityController } from "../controllers/return-on-equity/index.js";
import {
  createOverviewController,
} from "../controllers/overview/index.js";
import {
  createRunInvestmentPassController,
  runInvestmentPassController,
} from "../controllers/automation/run-investment-pass/index.js";
import type { ApiVersion } from "../../domain/services/investment-analysis-ruleset/index.js";
// 1.2. END ..........................................................................................

// 1.3. SERVICE ......................................................................................
export function createApiRouter(apiVersion: ApiVersion): Router {
  const router = Router();
  const selectedOverviewController =
    apiVersion === "v1" ? overviewController : createOverviewController(apiVersion);
  const selectedRunInvestmentPassController =
    apiVersion === "v1"
      ? runInvestmentPassController
      : createRunInvestmentPassController(apiVersion);

  router.get("/analysis/return-on-equity", returnOnEquityController);
  router.get("/analysis/free-cash-flow", freeCashFlowController);
  router.get("/analysis/debt-to-equity", debtToEquityController);
  router.get("/analysis/profit-margin", profitMarginController);
  router.get("/analysis/margin-of-safety", marginOfSafetyController);
  router.get("/overview", selectedOverviewController);
  router.post("/trades/buy", buyTradeController);
  router.get("/portfolio", portfolioController);
  router.post("/automation/run-investment-pass", selectedRunInvestmentPassController);

  return router;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
