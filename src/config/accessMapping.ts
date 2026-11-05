/**
 * ============================================================================
 * EDITABLE access mapping: Okta groups/claims -> destinations + access level.
 * ============================================================================
 *
 * This is the single place that decides *who sees what*. In production the
 * authoritative enforcement happens at the IdP and the target cloud; this map
 * only governs what the launchpad displays and offers. A user can never
 * self-select a higher level than their groups grant.
 *
 * Matching model:
 *  - Each rule lists the Okta groups it applies to.
 *  - `destinations` are destination keys (see destinations.ts) or glob-ish
 *    patterns using "*" (e.g. "aws:*" = all AWS envs, "*:dev" = all Dev).
 *  - `access` is the level granted for those destinations.
 *  - When multiple rules match a destination, the HIGHEST access wins.
 */

import type { Destination } from "./destinations";

export type AccessLevel = "none" | "read" | "full";

export interface AccessRule {
  /** Okta group names this rule applies to (matched against the groups claim). */
  groups: string[];
  /** Destination keys or "*" patterns, e.g. "aws:prod", "aws:*", "*:dev". */
  destinations: string[];
  access: Exclude<AccessLevel, "none">;
}

/**
 * Example mapping. Edit freely — this drives the whole dashboard.
 *
 * Example users referenced in the README / demo claims:
 *  - READ-ONLY user  -> group "cloud-viewers"   : read on all non-prod envs
 *  - FULL-ACCESS user -> group "cloud-admins"    : full on everything
 */
export const ACCESS_RULES: AccessRule[] = [
  // Read-only viewers: can see Dev/QA across all clouds + GitHub org (read).
  {
    groups: ["cloud-viewers"],
    destinations: ["*:dev", "*:qa", "github:org", "github:actions"],
    access: "read",
  },
  // Read-only viewers also get read visibility into Prod (launch still gated).
  {
    groups: ["cloud-viewers"],
    destinations: ["*:prod"],
    access: "read",
  },

  // Platform admins: full access everywhere, including Management.
  {
    groups: ["cloud-admins"],
    destinations: ["*"],
    access: "full",
  },

  // Example of a narrower team scope you might add:
  // {
  //   groups: ["aws-dev-team"],
  //   destinations: ["aws:dev", "aws:qa"],
  //   access: "full",
  // },
];

const ACCESS_RANK: Record<AccessLevel, number> = {
  none: 0,
  read: 1,
  full: 2,
};

function patternMatches(pattern: string, key: string): boolean {
  if (pattern === "*") return true;
  if (!pattern.includes("*")) return pattern === key;
  // Convert simple glob ("aws:*", "*:dev") to a RegExp.
  const re = new RegExp(
    "^" + pattern.split("*").map(escapeRegExp).join(".*") + "$"
  );
  return re.test(key);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolve the effective access level for a destination given the user's
 * Okta groups. Highest matching access wins; returns "none" if nothing grants.
 */
export function resolveAccess(
  destination: Destination,
  groups: string[]
): AccessLevel {
  let best: AccessLevel = "none";
  for (const rule of ACCESS_RULES) {
    const groupMatch = rule.groups.some((g) => groups.includes(g));
    if (!groupMatch) continue;
    const destMatch = rule.destinations.some((p) =>
      patternMatches(p, destination.key)
    );
    if (!destMatch) continue;
    if (ACCESS_RANK[rule.access] > ACCESS_RANK[best]) best = rule.access;
  }
  return best;
}
