import type { ProviderMeta, Destination } from "../config/destinations";
import type { AccessLevel } from "../config/accessMapping";
import { DestinationCard } from "./DestinationCard";

export function ProviderSection({
  provider,
  destinations,
  accessFor,
}: {
  provider: ProviderMeta;
  destinations: Destination[];
  accessFor: (d: Destination) => AccessLevel;
}) {
  if (destinations.length === 0) return null;

  return (
    <section className="provider" aria-labelledby={`p-${provider.id}`}>
      <div className="provider-head">
        <span className={`provider-chip p-${provider.id}`} aria-hidden="true">
          {provider.short}
        </span>
        <div>
          <h3 className="provider-name" id={`p-${provider.id}`}>
            {provider.name}
          </h3>
          <span className="provider-count">
            {destinations.length} destination
            {destinations.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="cards">
        {destinations.map((d) => (
          <DestinationCard key={d.key} destination={d} access={accessFor(d)} />
        ))}
      </div>
    </section>
  );
}
