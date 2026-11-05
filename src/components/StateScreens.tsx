import type { ReactNode } from "react";

function StateShell({
  icon,
  title,
  children,
  actions,
}: {
  icon: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="state-wrap">
      <div className="state-card" role="status">
        <div className="state-icon" aria-hidden="true">
          {icon}
        </div>
        <h2 className="state-title">{title}</h2>
        <div className="state-text">{children}</div>
        {actions && <div className="state-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <StateShell icon="⏳" title="Checking your session…">
      Verifying your identity and loading authorized destinations.
    </StateShell>
  );
}

export function ExpiredScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <StateShell
      icon="⌛"
      title="Session expired"
      actions={
        <button className="btn btn-primary" onClick={onSignIn}>
          Sign in again
        </button>
      }
    >
      Your sign-in session has expired. For privileged access you may be asked
      to complete step-up verification again.
    </StateShell>
  );
}

export function AuthErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <StateShell
      icon="⚠️"
      title="Authentication problem"
      actions={
        <button className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      }
    >
      {message}
    </StateShell>
  );
}

export function MissingConfigScreen({ reason }: { reason: string }) {
  return (
    <StateShell icon="🧩" title="Okta is not configured">
      <p style={{ marginTop: 0 }}>{reason}</p>
      <p>
        Set the Okta values in <span className="mono">.env.local</span> (see{" "}
        <span className="mono">.env.example</span>), or set{" "}
        <span className="mono">VITE_AUTH_MODE=mock</span> to preview with the
        clearly-labeled Demo mode.
      </p>
    </StateShell>
  );
}
