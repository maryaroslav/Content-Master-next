# 0008. Keep Socket.IO for realtime (D9)

Status: Accepted

## Context

The reference architecture uses server-sent events. The chat is expected to grow (typing, presence, read receipts, group chats), which needs a two-way channel.

## Decision

Keep Socket.IO, but typed: events are defined in the `@cm/contracts` catalog (`realtime.ts`), validated with zod on the server, and the socket is authenticated by the same access token as HTTP. Scaling to several API instances would add the Redis adapter.

## Consequences

- See ADR 0015 for acknowledgements and ADR 0016 for the client.
- The Next proxy does not carry WebSockets, so the browser connects to the API origin directly (`REALTIME_URL`).
