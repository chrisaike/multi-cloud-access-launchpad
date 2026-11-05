/**
 * Catalog of launch destinations.
 *
 * In this prototype, provider sign-in/console hand-off is STUBBED. Each
 * destination carries a `launchUrl` only if a real federation entry point is
 * configured; otherwise it is left undefined and the UI shows a
 * "Not configured" badge. Wiring real per-cloud federation (AWS IAM Identity
 * Center, Entra ID, GCP Workforce Identity Federation, OCI Identity Domains)
 * is an intentional extension point — see README.
 */

export type ProviderId = "aws" | "azure" | "gcp" | "oci" | "github";

export type EnvironmentId = "dev" | "qa" | "prod" | "mgmt";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  /** Short label used for the avatar chip. */
  short: string;
}

export interface EnvironmentMeta {
  id: EnvironmentId;
  name: string;
  /** Prod & Management are privileged and require step-up / approval. */
  privileged: boolean;
}

export interface Destination {
  /** Stable key, e.g. "aws:prod" or "github:actions". */
  key: string;
  provider: ProviderId;
  /** Cloud providers use an environment; GitHub areas use a logical slot. */
  environment?: EnvironmentId;
  title: string;
  description: string;
  /** Set only when a real federation launch URL exists. */
  launchUrl?: string;
}

export const PROVIDERS: ProviderMeta[] = [
  { id: "aws", name: "AWS", short: "AWS" },
  { id: "azure", name: "Microsoft Azure", short: "AZ" },
  { id: "gcp", name: "Google Cloud", short: "GCP" },
  { id: "oci", name: "Oracle Cloud (OCI)", short: "OCI" },
  { id: "github", name: "GitHub", short: "GH" },
];

export const ENVIRONMENTS: EnvironmentMeta[] = [
  { id: "dev", name: "Dev", privileged: false },
  { id: "qa", name: "QA", privileged: false },
  { id: "prod", name: "Prod", privileged: true },
  { id: "mgmt", name: "Management", privileged: true },
];

const CLOUD_PROVIDERS: ProviderId[] = ["aws", "azure", "gcp", "oci"];

/** Build the Dev/QA/Prod/Management destinations for each cloud provider. */
function cloudDestinations(): Destination[] {
  const out: Destination[] = [];
  for (const provider of CLOUD_PROVIDERS) {
    for (const env of ENVIRONMENTS) {
      out.push({
        key: `${provider}:${env.id}`,
        provider,
        environment: env.id,
        title: env.name,
        description: `${provider.toUpperCase()} ${env.name} console`,
        // launchUrl intentionally omitted -> renders as "Not configured".
      });
    }
  }
  return out;
}

/** GitHub human access is kept visually distinct from GitHub Actions. */
const GITHUB_DESTINATIONS: Destination[] = [
  {
    key: "github:org",
    provider: "github",
    title: "Organization & Repos",
    description: "Human access to GitHub org and repositories",
  },
  {
    key: "github:actions",
    provider: "github",
    title: "GitHub Actions",
    description: "Workflows & run history (workload identity, not a login)",
  },
];

export const DESTINATIONS: Destination[] = [
  ...cloudDestinations(),
  ...GITHUB_DESTINATIONS,
];

export function providerName(id: ProviderId): string {
  return PROVIDERS.find((p) => p.id === id)?.name ?? id;
}

export function environmentMeta(
  id: EnvironmentId | undefined
): EnvironmentMeta | undefined {
  return ENVIRONMENTS.find((e) => e.id === id);
}

/** GitHub Actions is treated as workload-identity, not a human login area. */
export function isGithubActions(d: Destination): boolean {
  return d.key === "github:actions";
}
