/**
 * Real Okta adapter using @okta/okta-auth-js.
 *
 * The SDK implements Authorization Code + PKCE and validates the ID token's
 * issuer, audience, signature, nonce, and expiry for us. We configure it as a
 * browser public client (no client secret) and request the `groups` scope so
 * the access mapping can read the user's Okta groups.
 */

import { OktaAuth, type IDToken } from "@okta/okta-auth-js";
import { oktaConfig } from "../config/okta";
import type { UserClaims } from "./types";

let singleton: OktaAuth | null = null;

export function getOktaAuth(): OktaAuth {
  if (singleton) return singleton;
  singleton = new OktaAuth({
    issuer: oktaConfig.issuer,
    clientId: oktaConfig.clientId,
    redirectUri: oktaConfig.redirectUri,
    scopes: oktaConfig.scopes,
    pkce: true, // Authorization Code + PKCE
    responseType: "code",
    // Tokens are validated by the SDK; keep them in memory-friendly storage.
    tokenManager: {
      storage: "sessionStorage",
      autoRenew: true,
    },
  });
  return singleton;
}

/** True when the current URL is the OIDC redirect callback. */
export function isLoginCallback(): boolean {
  const { search } = window.location;
  return /[?&]code=/.test(search) || /[?&]error=/.test(search);
}

export function claimsFromIdToken(idToken: IDToken): UserClaims {
  const c = idToken.claims as Record<string, unknown>;
  const groups = Array.isArray(c.groups) ? (c.groups as string[]) : [];
  return {
    sub: String(c.sub ?? ""),
    name: String(c.name ?? c.preferred_username ?? c.email ?? "Unknown user"),
    email: String(c.email ?? ""),
    groups,
  };
}

/** Accepts any token-manager value; treats a missing/invalid token as expired. */
export function tokenExpired(token: { expiresAt?: number } | undefined | null): boolean {
  if (!token) return true;
  const expiresAt = token.expiresAt;
  if (typeof expiresAt !== "number") return true;
  return Date.now() / 1000 >= expiresAt;
}
