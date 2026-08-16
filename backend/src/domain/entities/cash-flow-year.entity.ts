// [ BACKEND > DOMAIN > ENTITIES > CASH FLOW YEAR ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. ENTITY .......................................................................................
/**
 * The raw cash-flow facts for a single completed fiscal year.
 *
 * This holds only reported figures, never derived metrics. Free cash flow is
 * computed by the application layer from these inputs so the domain stays a
 * faithful record of what the company actually reported. Capital expenditure
 * follows the provider's sign convention (reported as a negative outflow).
 */
export interface CashFlowYear {
  fiscalYear: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
