import { AUTH_MODE } from "../config/okta";
import { DEMO_USERS, setDemoUser } from "../auth/mockAuth";

export function LoginScreen({
  onSignedInDemo,
  onSignInOkta,
}: {
  /** Called after a demo user is selected (reloads auth state). */
  onSignedInDemo: () => void;
  onSignInOkta: () => void;
}) {
  if (AUTH_MODE === "okta") {
    return (
      <div className="state-wrap">
        <div className="state-card">
          <div className="state-icon" aria-hidden="true">
            🔐
          </div>
          <h2 className="state-title">Sign in to continue</h2>
          <p className="state-text">
            Authenticate with Okta to see the cloud destinations you are
            authorized to reach. Access is determined by your Okta groups.
          </p>
          <div className="state-actions">
            <button className="btn btn-primary" onClick={onSignInOkta}>
              Sign in with Okta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Demo mode: pick one of the example users to exercise the access mapping.
  const pick = (id: string) => {
    setDemoUser(id);
    onSignedInDemo();
  };

  return (
    <div className="state-wrap">
      <div className="state-card">
        <div className="state-icon" aria-hidden="true">
          🧪
        </div>
        <h2 className="state-title">Demo mode — choose a sample user</h2>
        <p className="state-text">
          This is <strong>not a real sign-in</strong>. Pick an example identity
          with realistic Okta claims to preview how the dashboard maps groups to
          destinations and access levels.
        </p>
        <div className="demo-users">
          {DEMO_USERS.map((u) => (
            <button
              key={u.id}
              className="demo-user"
              onClick={() => pick(u.id)}
            >
              <strong>{u.label}</strong>
              <span>{u.description}</span>
            </button>
          ))}
        </div>
        <p className="state-text" style={{ marginBottom: 0 }}>
          To use real Okta, set <span className="mono">VITE_AUTH_MODE=okta</span>{" "}
          and fill in <span className="mono">.env.local</span>.
        </p>
      </div>
    </div>
  );
}
