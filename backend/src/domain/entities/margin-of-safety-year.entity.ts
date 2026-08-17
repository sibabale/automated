// [ BACKEND > DOMAIN > ENTITIES > MARGIN OF SAFETY YEAR ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. ENTITY .......................................................................................
/**
 * The reported valuation facts for one completed fiscal year.
 *
 * Margin of safety compares the provider's intrinsic-value estimate with the
 * market price available at the same point in time. These are raw inputs only;
 * the percentage discount or premium is calculated in the application layer.
 */
export interface MarginOfSafetyYear {
  fiscalYear: number;
  intrinsicValue: number;
  stockPrice: number;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
