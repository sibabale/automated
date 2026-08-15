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
