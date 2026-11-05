/**
 * Shared identity shape used across both the real Okta adapter and the
 * clearly-labeled Demo adapter, so the rest of the app is auth-agnostic.
 */

export interface UserClaims {
  /** OIDC `sub`. */
  sub: string;
  name: string;
  email: string;
  /** Okta groups claim — drives the access mapping. */
  groups: string[];
}

export type SessionStatus =
  | "loading" // determining session (reading tokens / handling callback)
  | "signed-out" // no valid session
  | "signed-in" // valid session with claims
  | "expired" // had a session, token expired
  | "error"; // auth error (e.g. callback failed)

export interface AuthState {
  status: SessionStatus;
  claims: UserClaims | null;
  /** Human-readable error for the "error" status. */
  error: string | null;
  /** True when running the Demo adapter (drives the "Demo mode" banner). */
  isDemo: boolean;
}

export interface AuthApi extends AuthState {
  signIn: () => void | Promise<void>;
  signOut: () => void | Promise<void>;
}
