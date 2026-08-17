// [ BACKEND > DOMAIN > ENTITIES > PROFIT MARGIN YEAR ] ##############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. ENTITY .......................................................................................
/**
 * The reported income-statement facts needed to calculate profit margin for one
 * completed fiscal year.
 *
 * This holds only provider-reported figures, never derived ratios. The
 * application layer turns these raw numbers into the percentage shown to users.
 */
export interface ProfitMarginYear {
  fiscalYear: number;
  netIncome: number;
  revenue: number;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
