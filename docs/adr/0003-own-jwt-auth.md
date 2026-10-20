# 0003. Own JWT authentication with an OIDC-compatible client interface (D4)

Status: Accepted

## Context

The original frontend used NextAuth with a custom 2FA flow bolted on. A full OIDC setup would need an identity provider, which is extra infrastructure for a small social network.

## Decision

The API issues its own short-lived access tokens (JWT, 15 minutes) and rotating refresh tokens. Login with 2FA returns a challenge token first; the TOTP code exchanges it for a session. On the client, `@cm/auth` exposes `login`, `loginWithTwoFactor`, `logout`, `refreshAccessToken` and `useAuth()`, an interface that a real OIDC client could implement later (optional phase 9).

## Consequences

- NextAuth is gone; the API is the only authority.
- Access and 2FA challenge tokens share the signing key and are told apart by the `type` claim, which every verification checks.
- TOTP secrets are encrypted at rest (`auth/secretBox.ts`).
