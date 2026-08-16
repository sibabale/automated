// [ BACKEND > ERRORS > HTTP ERROR ] #################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. ERROR ........................................................................................
/**
 * Represents an expected HTTP failure that is safe to describe to a client.
 */
export class HttpError extends Error {
  /**
   * Creates an HTTP failure with the response status the client should receive.
   */
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
