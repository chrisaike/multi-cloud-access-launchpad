/**
 * Clearly-labeled DEMO adapter.
 *
 * This does NOT authenticate anyone. It lets you preview the dashboard with
 * realistic Okta claim shapes without standing up an Okta app. The UI shows a
 * prominent "Demo mode — not a real sign-in" banner whenever this is active.
 *
 * Two example users are provided to exercise the access mapping:
 *  - read-only viewer (group: cloud-viewers)
 *  - full-access admin (group: cloud-admins)
 */

import type { UserClaims } from "./types";

export interface DemoUser {
  id: string;
  label: string;
  description: string;
  claims: UserClaims;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "viewer",
    label: "Dana Viewer (read-only)",
    description: "Group: cloud-viewers — read access, launches gated",
    claims: {
      sub: "00u1demoViewer0001",
      name: "Dana Viewer",
      email: "dana.viewer@example.com",
      groups: ["cloud-viewers", "everyone"],
    },
  },
  {
    id: "admin",
    label: "Alex Admin (full access)",
    description: "Group: cloud-admins — full access, incl. Management",
    claims: {
      sub: "00u1demoAdmin0001",
      name: "Alex Admin",
      email: "alex.admin@example.com",
      groups: ["cloud-admins", "everyone"],
    },
  },
];

const STORAGE_KEY = "launchpad.demo.user";

/** Persist the selected demo user id in sessionStorage (no tokens, no secrets). */
export function setDemoUser(id: string | null): void {
  if (id === null) {
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, id);
  }
}

export function getDemoUser(): DemoUser | null {
  const id = sessionStorage.getItem(STORAGE_KEY);
  if (!id) return null;
  return DEMO_USERS.find((u) => u.id === id) ?? null;
}
