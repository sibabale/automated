// [ BACKEND > DOMAIN > ENTITIES > DEBT TO EQUITY YEAR ] #############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. ENTITY .......................................................................................
/**
 * The raw balance-sheet facts for a single completed fiscal year.
 *
 * This holds only reported figures, never derived metrics. The debt-to-equity
 * ratio is computed by the application layer from these inputs so the domain
 * stays a faithful record of what the company actually reported.
 */
export interface DebtToEquityYear {
  fiscalYear: number;
  totalDebt: number;
  shareholdersEquity: number;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
