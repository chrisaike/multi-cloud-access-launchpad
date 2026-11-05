import type { AccessLevel } from "../config/accessMapping";

export function AccessBadge({ level }: { level: AccessLevel }) {
  if (level === "full")
    return (
      <span className="badge badge-full">
        <span className="badge-dot" /> Full access
      </span>
    );
  if (level === "read")
    return (
      <span className="badge badge-read">
        <span className="badge-dot" /> Read-only
      </span>
    );
  return (
    <span className="badge badge-unavailable">
      <span className="badge-dot" /> No access
    </span>
  );
}

export function ApprovalBadge() {
  return (
    <span
      className="badge badge-approval"
      title="Privileged destination — step-up MFA / approval required"
    >
      Approval required
    </span>
  );
}

export function NotConfiguredBadge() {
  return (
    <span
      className="badge badge-unavailable"
      title="No real federation launch URL is configured for this destination"
    >
      Not configured
    </span>
  );
}

export function ActionsBadge() {
  return <span className="badge badge-actions">Workload identity</span>;
}
