// [ BACKEND > DOMAIN > ENTITIES > FINANCIAL YEAR ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. ENTITY .......................................................................................
/**
 * The raw financial facts for a single completed fiscal year.
 *
 * This holds only reported figures, never derived metrics. Return on equity
 * and other ratios are computed by the application layer so the domain stays
 * a faithful record of what the company actually reported.
 */
export interface FinancialYear {
  fiscalYear: number;
  netIncome: number;
  shareholdersEquity: number;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
