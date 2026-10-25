# 0015. Socket.IO acknowledgements instead of separate result events

Status: Accepted

## Context

The plan proposed `message:ack` and `message:error` events correlated by a `clientId`.

## Decision

Client events use the built-in Socket.IO acknowledgement: the server answers every `message:send` with `{ ok: true, data }` or `{ ok: false, error }` (the API error shape). The sending socket gets its message from the ack; other tabs of both users get `message:new`. A server-side `on()` wrapper validates payloads and maps errors, like `mount()` does for HTTP.

## Consequences

- No hand-written correlation or timeouts; each send is a promise.
- An invalid payload gets `VALIDATION_ERROR` and the connection stays open.
