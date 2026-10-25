# 0004. Access token in memory, refresh token in an httpOnly cookie with rotation (D5)

Status: Accepted

## Context

Tokens in `localStorage` are readable by any injected script. The app also has to survive reloads and several open tabs.

## Decision

The access token lives only in memory. The refresh token is an httpOnly, SameSite cookie scoped to `/api/v1/auth`, stored server-side as a SHA-256 hash and rotated on every use; reusing an old token revokes its whole family. On startup `AuthProvider` restores the session from the cookie. Refreshes are deduplicated within a tab and serialized across tabs with a Web Lock; login and logout are broadcast to other tabs. The TanStack Query cache is cleared whenever the session ends.

## Consequences

- XSS cannot read a long-lived credential.
- Server components never see the session; access is checked on the client by route group.
- Callers without the axios retry (Socket.IO handshake, raw `fetch`) use `getFreshAccessToken()`.
- Only the server's logout response can delete the httpOnly cookie. When the logout request fails, `logout()` still ends the local session and leaves a flag in `localStorage` (shared by the tabs); while it is set, a refresh sends the logout again instead of using the cookie, so a reload cannot bring the session back. A successful logout or a new login clears the flag.
