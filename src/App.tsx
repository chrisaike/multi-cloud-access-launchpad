import { AUTH_MODE, oktaConfigError } from "./config/okta";
import { useAuth } from "./auth/AuthContext";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { LoginScreen } from "./components/LoginScreen";
import {
  AuthErrorScreen,
  ExpiredScreen,
  LoadingScreen,
  MissingConfigScreen,
} from "./components/StateScreens";

export default function App() {
  const auth = useAuth();
  const configErr = oktaConfigError();

  // Reloading lets the AuthProvider re-read the selected demo user on init.
  const reload = () => window.location.reload();

  function renderBody() {
    // Honest "missing config" state for Okta mode without credentials.
    if (AUTH_MODE === "okta" && configErr) {
      return <MissingConfigScreen reason={configErr} />;
    }

    switch (auth.status) {
      case "loading":
        return <LoadingScreen />;
      case "signed-out":
        return (
          <LoginScreen onSignedInDemo={reload} onSignInOkta={auth.signIn} />
        );
      case "expired":
        return <ExpiredScreen onSignIn={auth.signIn} />;
      case "error":
        return (
          <AuthErrorScreen
            message={auth.error ?? "Authentication failed."}
            onRetry={reload}
          />
        );
      case "signed-in":
        return auth.claims ? <Dashboard claims={auth.claims} /> : null;
    }
  }

  return (
    <div className="app">
      {auth.isDemo && (
        <div className="demo-banner" role="note">
          Demo mode — this is NOT a real sign-in. Identities and claims are
          sample data.
        </div>
      )}
      <TopBar
        claims={auth.status === "signed-in" ? auth.claims : null}
        onSignOut={auth.signOut}
      />
      {renderBody()}
      <footer className="footer">
        <div className="container">
          Prototype · Okta OIDC (Auth Code + PKCE) · provider launches are
          stubbed · no secrets stored in the browser
        </div>
      </footer>
    </div>
  );
}
