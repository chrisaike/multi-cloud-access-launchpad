import { useMemo, useState } from "react";
import {
  DESTINATIONS,
  PROVIDERS,
  providerName,
  type Destination,
} from "../config/destinations";
import { resolveAccess, type AccessLevel } from "../config/accessMapping";
import type { UserClaims } from "../auth/types";
import { Filters, EMPTY_FILTERS, type FilterState } from "./Filters";
import { ProviderSection } from "./ProviderSection";

function effectiveAccountLevel(claims: UserClaims): AccessLevel {
  // Highest access the user holds anywhere — shown as a summary pill.
  let best: AccessLevel = "none";
  for (const d of DESTINATIONS) {
    const a = resolveAccess(d, claims.groups);
    if (a === "full") return "full";
    if (a === "read") best = "read";
  }
  return best;
}

export function Dashboard({ claims }: { claims: UserClaims }) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const accessFor = useMemo(
    () => (d: Destination) => resolveAccess(d, claims.groups),
    [claims.groups]
  );

  const accountLevel = useMemo(
    () => effectiveAccountLevel(claims),
    [claims]
  );

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return DESTINATIONS.filter((d) => {
      // Only show destinations the user has at least read on.
      const access = accessFor(d);
      if (access === "none") return false;
      if (filters.provider && d.provider !== filters.provider) return false;
      if (filters.environment && d.environment !== filters.environment)
        return false;
      if (filters.access && access !== filters.access) return false;
      if (q) {
        const hay = `${providerName(d.provider)} ${d.title} ${d.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filters, accessFor]);

  const byProvider = useMemo(() => {
    const map = new Map<string, Destination[]>();
    for (const d of visible) {
      const list = map.get(d.provider) ?? [];
      list.push(d);
      map.set(d.provider, list);
    }
    return map;
  }, [visible]);

  const accountLevelLabel =
    accountLevel === "full"
      ? "Full access (highest)"
      : accountLevel === "read"
        ? "Read-only (highest)"
        : "No destinations";

  return (
    <div className="container main">
      <div className="page-head">
        <div>
          <h1 className="page-title">Your cloud destinations</h1>
          <p className="page-sub">
            Showing destinations your Okta groups authorize. Access is enforced
            by the identity provider and each cloud — this launchpad only
            surfaces what you may reach.
          </p>
        </div>
        <span className="access-pill" title="Highest access level you hold">
          <span className="badge-dot" /> {accountLevelLabel}
        </span>
      </div>

      <Filters value={filters} onChange={setFilters} />

      {visible.length === 0 ? (
        <div className="empty">
          No destinations match your filters, or your groups
          {" "}
          (<span className="mono">{claims.groups.join(", ") || "none"}</span>)
          {" "}
          don’t grant access to any destination.
        </div>
      ) : (
        PROVIDERS.map((p) => (
          <ProviderSection
            key={p.id}
            provider={p}
            destinations={byProvider.get(p.id) ?? []}
            accessFor={accessFor}
          />
        ))
      )}
    </div>
  );
}
