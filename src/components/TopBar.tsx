import type { UserClaims } from "../auth/types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TopBar({
  claims,
  onSignOut,
}: {
  claims: UserClaims | null;
  onSignOut: () => void;
}) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ⛅
          </span>
          Multi-Cloud Access Launchpad
        </div>
        <div className="topbar-spacer" />
        {claims && (
          <>
            <div className="identity">
              <div>
                <div className="identity-name">{claims.name}</div>
                <div className="identity-email">{claims.email}</div>
              </div>
              <div className="avatar" aria-hidden="true">
                {initials(claims.name)}
              </div>
            </div>
            <button className="btn btn-sm" onClick={onSignOut}>
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
