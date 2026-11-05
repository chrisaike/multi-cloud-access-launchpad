/**
 * Auth context that picks the adapter based on VITE_AUTH_MODE and exposes a
 * single `useAuth()` hook to the rest of the app.
 *
 *  - mode "okta": real OIDC Authorization Code + PKCE via @okta/okta-auth-js.
 *  - mode "mock": clearly-labeled Demo; no real authentication.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AUTH_MODE, oktaConfigError } from "../config/okta";
import type { AuthApi, AuthState, UserClaims } from "./types";
import { DEMO_USERS, getDemoUser, setDemoUser } from "./mockAuth";
import {
  claimsFromIdToken,
  getOktaAuth,
  isLoginCallback,
  tokenExpired,
} from "./oktaClient";

const AuthContext = createContext<AuthApi | null>(null);

const INITIAL: AuthState = {
  status: "loading",
  claims: null,
  error: null,
  isDemo: AUTH_MODE === "mock",
};

// ---------------------------------------------------------------------------
// Demo adapter hook
// ---------------------------------------------------------------------------
function useDemoAuth(): AuthApi {
  const [state, setState] = useState<AuthState>(() => {
    const user = getDemoUser();
    return user
      ? { ...INITIAL, status: "signed-in", claims: user.claims }
      : { ...INITIAL, status: "signed-out" };
  });

  const signIn = () => {
    // The login screen drives which demo user is chosen; default to first.
    const first = DEMO_USERS[0];
    setDemoUser(first.id);
    setState({ ...INITIAL, status: "signed-in", claims: first.claims });
  };

  const signOut = () => {
    setDemoUser(null);
    setState({ ...INITIAL, status: "signed-out" });
  };

  return { ...state, signIn, signOut };
}

// ---------------------------------------------------------------------------
// Okta adapter hook
// ---------------------------------------------------------------------------
function useOktaAuth(): AuthApi {
  const [state, setState] = useState<AuthState>(INITIAL);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Inert when not in Okta mode — avoids constructing the client with an
    // empty issuer while the Demo adapter is the one actually in use.
    if (AUTH_MODE !== "okta") {
      setState({
        status: "signed-out",
        claims: null,
        error: null,
        isDemo: false,
      });
      return;
    }

    const configErr = oktaConfigError();
    if (configErr) {
      setState({
        status: "error",
        claims: null,
        error: configErr,
        isDemo: false,
      });
      return;
    }

    const oktaAuth = getOktaAuth();

    async function bootstrap() {
      try {
        // 1) Handle the redirect callback if we just came back from Okta.
        if (isLoginCallback()) {
          await oktaAuth.handleLoginRedirect();
          // Clean the ?code=... from the URL.
          window.history.replaceState({}, document.title, "/");
        }

        // 2) Read existing tokens from the token manager.
        const idToken = await oktaAuth.tokenManager.get("idToken");
        if (!idToken) {
          setState({
            status: "signed-out",
            claims: null,
            error: null,
            isDemo: false,
          });
          return;
        }

        if (tokenExpired(idToken)) {
          setState({
            status: "expired",
            claims: null,
            error: null,
            isDemo: false,
          });
          return;
        }

        const claims: UserClaims = claimsFromIdToken(idToken as never);
        setState({
          status: "signed-in",
          claims,
          error: null,
          isDemo: false,
        });
      } catch (e) {
        setState({
          status: "error",
          claims: null,
          error: e instanceof Error ? e.message : "Authentication failed.",
          isDemo: false,
        });
      }
    }

    void bootstrap();

    // React to token expiry while the app is open.
    const onExpired = () => {
      setState((s) =>
        s.status === "signed-in"
          ? { ...s, status: "expired", claims: null }
          : s
      );
    };
    oktaAuth.tokenManager.on("expired", onExpired);
    return () => {
      oktaAuth.tokenManager.off("expired", onExpired);
    };
  }, []);

  const signIn = async () => {
    await getOktaAuth().signInWithRedirect();
  };

  const signOut = async () => {
    await getOktaAuth().signOut();
    setState({
      status: "signed-out",
      claims: null,
      error: null,
      isDemo: false,
    });
  };

  return { ...state, signIn, signOut };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const demo = AUTH_MODE === "mock";
  // Hooks must be called unconditionally; call both but use the active one.
  const demoApi = useDemoAuth();
  const oktaApi = useOktaAuth();
  const api = demo ? demoApi : oktaApi;

  const value = useMemo<AuthApi>(() => api, [api]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
