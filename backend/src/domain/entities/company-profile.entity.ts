// [ BACKEND > DOMAIN > ENTITIES > COMPANY PROFILE ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. ENTITY .......................................................................................
/**
 * The company identity fields shown in the overview header.
 *
 * These values come directly from the profile provider row. Optional fields stay
 * nullable here so presentation code can decide how to display missing facts
 * without pretending the provider supplied them.
 */
export interface CompanyProfile {
  companyName: string | null;
  industry: string | null;
  sector: string | null;
  sharePrice: number | null;
  ticker: string;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
