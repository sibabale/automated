// [ BACKEND > PRESENTATION > CONTROLLERS > RUNS ] ####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
import type { RunsDecision } from "../../../domain/entities/runs-decision.entity.js";
import { buildRunsPage, loadRunsDecisions } from "../../../application/services/runs/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface RunsResponse {
  correlationId: string;
  data: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: RunsDecision[];
  };
}
// 1.3. END ..........................................................................................

// 1.4. CONTROLLER ...................................................................................
const VALID_STATUS_VALUES = new Set(["buy", "watch", "reject"]);

export const runsController: RequestHandler = async (request, response, next) => {
  const page = Number(String(request.query["page"] ?? "1"));
  const pageSize = Number(String(request.query["pageSize"] ?? "10"));
  const statusParam = request.query["status"];
  const status = typeof statusParam === "string" && VALID_STATUS_VALUES.has(statusParam)
    ? statusParam
    : undefined;

  if (!Number.isFinite(page) || !Number.isFinite(pageSize) || page < 1 || pageSize < 1) {
    return next(new HttpError(400, "Invalid pagination parameters"));
  }

  try {
    const override = request.app.get("runsRepository") as
      | (() => Promise<RunsDecision[]>)
      | undefined;

    const decisions = await (override ? override() : loadRunsDecisions());
    const pageData = await buildRunsPage(decisions, page, pageSize, request.correlationId, { status });

    const body: RunsResponse = {
      correlationId: request.correlationId,
      data: pageData,
    };

    response.status(200).json(body);
  } catch (error) {
    next(error);
  }
};
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
