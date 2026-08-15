// [ BACKEND > FEATURES > CALCULATIONS > RETURN ON EQUITY CONTROLLER ] ###############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../errors/http-error.js";
import { calculateROE } from "../services/calculate-roe.service.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * Shape of a successful Return on Equity calculation response body.
 */
export interface CalculateROEResponse {
  correlationId: string;
  data: {
    roe: string;
    netIncome: number;
    shareholderEquity: number;
  };
}
// 1.3. END ..........................................................................................

// 1.4. CONTROLLER ...................................................................................
/**
 * Handles HTTP GET request for Return on Equity calculation.
 * Query params: netIncome, shareholderEquity
 */
export const calculateROEController: RequestHandler = async (
  request,
  response,
  next,
) => {
  // 1.4.1. INPUT VALIDATION .........................................................................
  const { netIncome, shareholderEquity } = request.query;

  if (!netIncome || !shareholderEquity) {
    return next(
      new HttpError(
        400,
        "Missing required query parameters: netIncome, shareholderEquity",
      ),
    );
  }

  const ni = Number(netIncome);
  const se = Number(shareholderEquity);

  if (Number.isNaN(ni) || Number.isNaN(se)) {
    return next(
      new HttpError(400, "Query parameters must be valid numbers"),
    );
  }
  // 1.4.1. END ......................................................................................

  // 1.4.2. CORE LOGIC ...............................................................................
  try {
    const roe = await calculateROE(ni, se, request.correlationId);

    const body: CalculateROEResponse = {
      correlationId: request.correlationId,
      data: {
        roe: roe.toFixed(2),
        netIncome: ni,
        shareholderEquity: se,
      },
    };

    response.status(200).json(body);
  } catch (error) {
    next(error);
  }
  // 1.4.2. END ......................................................................................
};
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
