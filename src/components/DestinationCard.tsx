import {
  environmentMeta,
  isGithubActions,
  type Destination,
} from "../config/destinations";
import type { AccessLevel } from "../config/accessMapping";
import {
  AccessBadge,
  ActionsBadge,
  ApprovalBadge,
  NotConfiguredBadge,
} from "./Badge";

export function DestinationCard({
  destination,
  access,
}: {
  destination: Destination;
  access: AccessLevel;
}) {
  const env = environmentMeta(destination.environment);
  const privileged = env?.privileged ?? false;
  const configured = Boolean(destination.launchUrl);
  const hasAccess = access !== "none";
  const actions = isGithubActions(destination);

  // Honest launch semantics:
  //  - no access      -> cannot launch (shouldn't normally render, but guard)
  //  - not configured -> button disabled, "Not configured" explained
  //  - privileged      -> launch allowed, but labeled as approval/step-up gated
  const canLaunch = hasAccess && configured;

  const handleLaunch = () => {
    if (!canLaunch || !destination.launchUrl) return;
    // Real per-cloud federation hand-off would happen here. In the prototype
    // this only opens configured URLs — never a fabricated "logged-in" screen.
    window.open(destination.launchUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={[
        "card",
        privileged ? "privileged" : "",
        hasAccess ? "" : "denied",
      ]
        .join(" ")
        .trim()}
    >
      <div className="card-top">
        <div>
          <h4 className="card-title">{destination.title}</h4>
          <p className="card-desc">{destination.description}</p>
        </div>
      </div>

      <div className="card-badges">
        <AccessBadge level={access} />
        {privileged && <ApprovalBadge />}
        {actions && <ActionsBadge />}
        {!configured && <NotConfiguredBadge />}
      </div>

      <div className="card-actions">
        <button
          className="btn btn-sm btn-primary"
          onClick={handleLaunch}
          disabled={!canLaunch}
          title={
            !hasAccess
              ? "You do not have access to this destination"
              : !configured
                ? "No federation launch URL configured for this destination"
                : privileged
                  ? "Launch (step-up MFA / approval enforced by the provider)"
                  : "Launch destination"
          }
        >
          {actions ? "Open workflows" : "Launch"}
        </button>
        {!configured && (
          <span className="card-note">Stubbed — add federation URL</span>
        )}
      </div>
    </div>
  );
}
