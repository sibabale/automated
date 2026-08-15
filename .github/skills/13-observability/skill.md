---
name: correlation-ids
description: Ensure every backend log carries a correlation id for end-to-end traceability, and that clients pass it as a header on all requests.
---

# Correlation IDs

## Purpose

Apply this skill whenever writing or modifying backend code that **logs**,
**returns a response**, **handles an error**, or **calls a service**, and
whenever writing a **client** that calls the backend.

A correlation id is a single identifier that follows one request through every
layer — middleware, controller, service, and logs — so a single trace can be
reconstructed from a distributed system. Traceability is only useful if the id
is present on **every** log line and **every** response.

---

## The Canonical Implementation

Do not reinvent this. The pattern already exists — reuse it:

- `backend/src/middleware/correlation-id.ts` — resolves the id and binds it.
- `backend/src/types/express-request.d.ts` — augments `Request.correlationId`.

The middleware runs after `pino-http` and before the routes. It:

1. Reads the inbound `x-correlation-id` header, or generates a UUID when absent.
2. Assigns it to `request.correlationId`.
3. Echoes it back on the response `x-correlation-id` header.
4. Binds it into `request.log` so request-scoped logs carry it automatically.

---

## Backend Rules

### 1. Every log line must carry a correlation id

Never emit a log without the correlation id in its payload.

```ts
// Good — id is the first field in the structured payload
logger.info({ correlationId, roe }, "ROE calculated successfully");

// Bad — no correlation id, the line cannot be traced
logger.info({ roe }, "ROE calculated successfully");
```

- **Controllers / middleware** use `request.log` (already bound with the id) or
  read `request.correlationId` explicitly.
- **Never** use bare `console.log` / `console.error`. Use the structured
  `logger`, which is the only sink that can guarantee the id is present.

### 2. Services receive the id as a plain string

A service must be able to log with the correlation id **without** depending on
Express or the request object. Pass the id in as the **last parameter**, typed
as `string`, and include it in every log payload the service emits.

```ts
export async function calculateROE(
  netIncome: number,
  shareholderEquity: number,
  correlationId: string,
): Promise<number> {
  logger.debug({ correlationId, netIncome, shareholderEquity }, "Calculating ROE");
  // ...
}
```

Do not pass the logger itself into services — pass the id.

### 3. Every response body must include the id

Successful responses expose it at the top level of the body:

```ts
const body: CalculateROEResponse = {
  correlationId: request.correlationId,
  data: { /* ... */ },
};
```

The response type must declare `correlationId: string`.

### 4. Every error response must include the id

The central error handler (`backend/src/middleware/error-handler.ts`) is the one
place that shapes error bodies, and it includes the id:

```ts
response.status(statusCode).json({
  correlationId: request.correlationId,
  error: { message /* safe message */ },
});
```

Controllers and services throw `HttpError`; they never shape the error body
themselves, so the id is added centrally.

---

## Client Rules

The client is responsible for **originating and forwarding** the correlation id.

- The client **must send an `x-correlation-id` header on every request** into
  the backend.
- Generate one id per logical user action (e.g. a page load or a button click)
  and reuse it across all requests that action triggers, so related calls share
  a trace.
- When the backend returns an `x-correlation-id`, surface it in client logs and
  in any user-facing error report so a user-reported problem maps to a
  server-side trace.
- If the client omits the header the backend will generate one, but the client
  then loses the ability to correlate its own logs with the backend — so
  sending it is required, not optional.

---

## Header

The agreed header name is **`x-correlation-id`** on both requests and responses.
Do not introduce alternative names (`x-request-id`, `trace-id`, etc.).

---

## Checklist

Before finishing any change that touches logging, responses, or requests:

- [ ] No bare `console.*` calls — the structured `logger` is used.
- [ ] Every `logger.*` call includes `correlationId` in its payload.
- [ ] Services take the correlation id as a `string` parameter and log it.
- [ ] Success response types and bodies include `correlationId`.
- [ ] Error responses include `correlationId` (via the central error handler).
- [ ] Client requests send the `x-correlation-id` header.
- [ ] Only the `x-correlation-id` header name is used.
