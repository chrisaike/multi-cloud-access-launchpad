/**
 * Okta OIDC configuration, sourced from environment variables.
 *
 * This is a browser-based PUBLIC client using Authorization Code + PKCE.
 * There is intentionally NO client secret. Never place secrets, refresh
 * tokens, or cloud credentials in frontend code or env vars.
 */

export type AuthMode = "mock" | "okta";

export interface OktaConfig {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export const AUTH_MODE: AuthMode =
  (import.meta.env.VITE_AUTH_MODE as AuthMode) === "okta" ? "okta" : "mock";

export const oktaConfig: OktaConfig = {
  issuer: import.meta.env.VITE_OKTA_ISSUER ?? "",
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID ?? "",
  redirectUri:
    import.meta.env.VITE_OKTA_REDIRECT_URI ??
    `${window.location.origin}/login/callback`,
  scopes: (import.meta.env.VITE_OKTA_SCOPES ?? "openid profile email groups")
    .split(/\s+/)
    .filter(Boolean),
};

/**
 * Returns a human-readable reason if the Okta config is incomplete, or null
 * if it looks usable. Used to render the "missing config" state honestly
 * instead of silently failing.
 */
export function oktaConfigError(): string | null {
  if (AUTH_MODE !== "okta") return null;
  if (!oktaConfig.issuer) return "VITE_OKTA_ISSUER is not set.";
  if (!oktaConfig.issuer.startsWith("https://"))
    return "VITE_OKTA_ISSUER must be an https:// URL.";
  if (!oktaConfig.clientId) return "VITE_OKTA_CLIENT_ID is not set.";
  if (!oktaConfig.redirectUri) return "VITE_OKTA_REDIRECT_URI is not set.";
  return null;
}
