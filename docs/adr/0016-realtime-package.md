# 0016. One app-wide socket in @cm/realtime, transport only

Status: Accepted

## Context

The socket was created inside the chat page, so messages and unread markers were lost on every other page.

## Decision

`@cm/realtime` creates one socket for the session (`RealtimeProvider`, connected while authenticated), with typed `emit` returning the ack and `on` that drops payloads failing the event schema. The package knows nothing about the chat or query keys; the web app's `src/chat/` merges messages into the caches, tracks unread peers and sends text optimistically. The server ends the connection when the access token expires, and the client reconnects with a fresh one.

## Consequences

- The header shows unread messages on any page.
- New event types (typing, read receipts) need no change to the package.
