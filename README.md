# Multi-Cloud Access Launchpad (prototype)

A polished, responsive prototype of a single launchpad for reaching **AWS,
Azure, Google Cloud, OCI, and GitHub**. Authentication is real **Okta OIDC
(Authorization Code + PKCE)**; per-cloud federation launches are **stubbed**
and clearly labeled. The security model stays honest — there are no fake
"you're logged in" screens.

> **Prototype scope.** This focuses on a clean, working frontend with a clearly
> stubbed backend. Real per-cloud federation, a SIEM/audit pipeline, and
> approval workflows are intentionally left as marked extension points.

---

## Quick start

```bash
npm install

# Option A — Demo mode (default): no Okta needed, clearly labeled "Demo"
npm run dev

# Option B — Real Okta
cp .env.example .env.local        # fill in issuer, clientId, redirectUri
# then set VITE_AUTH_MODE=okta in .env.local
npm run dev
```

Build / typecheck:

```bash
npm run build       # tsc + vite build
npm run typecheck   # types only
```

---

## Auth modes

| Mode   | How to enable                     | What it does                                                        |
| ------ | --------------------------------- | ------------------------------------------------------------------- |
| `mock` | `VITE_AUTH_MODE=mock` (default)   | Clearly-labeled **Demo**. No real sign-in. Sample Okta claim shapes. |
| `okta` | `VITE_AUTH_MODE=okta` + `.env`    | Real OIDC Auth Code + PKCE via `@okta/okta-auth-js`.                |

The Demo mode always shows a persistent **"Demo mode — NOT a real sign-in"**
banner so it can never be mistaken for real authentication.

### Okta configuration (placeholders only)

Set in `.env.local` (see `.env.example`). This is a **public SPA client — no
client secret**:

| Var                     | Example                                      |
| ----------------------- | -------------------------------------------- |
| `VITE_OKTA_ISSUER`      | `https://YOUR_ORG.okta.com/oauth2/default`   |
| `VITE_OKTA_CLIENT_ID`   | `0oaXXXXXXXXXXXXXXXXX`                        |
| `VITE_OKTA_REDIRECT_URI`| `http://localhost:5173/login/callback`       |
| `VITE_OKTA_SCOPES`      | `openid profile email groups`                |

In the Okta admin console:

1. Create an **OIDC → Single-Page Application**.
2. Grant type: **Authorization Code** (PKCE is automatic for SPA clients).
3. Add the **sign-in redirect URI** matching `VITE_OKTA_REDIRECT_URI`.
4. Add a **groups claim** to the ID token (e.g. filter `matches .*` or a
   prefix) so the dashboard can read `groups`.

The SDK validates issuer, audience, signature, state, nonce, and token expiry.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (this prototype)                                      │
│                                                                │
│   React SPA ──> AuthContext ──┬── Okta adapter (okta-auth-js)  │
│      │                        │     Auth Code + PKCE           │
│      │                        └── Demo adapter (labeled mock)  │
│      │                                                         │
│      ├── config/accessMapping.ts   groups/claims -> access     │
│      ├── config/destinations.ts    provider × environment      │
│      └── UI: TopBar, Filters, ProviderSection, cards, states   │
└───────────────┬──────────────────────────────┬────────────────┘
                │ OIDC (PKCE)                    │ launch hand-off (STUBBED)
                ▼                                ▼
         ┌────────────┐              ┌───────────────────────────┐
         │   Okta IdP │              │  Per-cloud federation      │
         │  (groups,  │              │  (AWS IAM Identity Center, │
         │   claims)  │              │   Entra ID, GCP WIF, OCI)  │  ← extension point
         └────────────┘              └───────────────────────────┘
```

**Extension points (not built in this prototype):**

- Real federation launch URLs per destination (set `launchUrl` in
  `destinations.ts`). Until set, destinations render **Not configured**.
- A backend **audit/SIEM** sink for sign-in, launch, and denial events.
- **Approval / step-up** workflows for privileged (Prod/Management) launches —
  currently surfaced as an **Approval required** badge enforced by the provider.

### Security notes

- Public client, **no secrets** in browser code, env, or storage.
- Tokens live in `sessionStorage` via the Okta token manager; expiry flips the
  UI into the **Session expired** state.
- The UI only *surfaces* what a user may reach. Real enforcement is the IdP and
  each cloud's permissions — the dashboard never grants access on its own, and
  a user cannot self-select a higher level than their groups allow.
- Root / tenant-owner credentials are **not** exposed as tiles.

---

## Access mapping (editable)

All "who sees what" lives in [`src/config/accessMapping.ts`](src/config/accessMapping.ts).
Rules map Okta **groups → destinations → access level**. Destinations support
`*` patterns (`aws:*`, `*:dev`, `*`). When several rules match, the **highest**
access wins.

### Example group → destination / access mapping

| Okta group      | Destinations                                  | Access     |
| --------------- | --------------------------------------------- | ---------- |
| `cloud-viewers` | `*:dev`, `*:qa`, `*:prod`, GitHub org/actions | Read-only  |
| `cloud-admins`  | `*` (all providers, all envs incl. Management)| Full access|

### Example users (Demo mode)

| Demo user      | Groups          | Result                                        |
| -------------- | --------------- | --------------------------------------------- |
| Dana Viewer    | `cloud-viewers` | **Read-only** on Dev/QA/Prod + GitHub; launches gated |
| Alex Admin     | `cloud-admins`  | **Full access** everywhere, including Management |

Prod and Management always carry an **Approval required** badge regardless of
access level, reflecting step-up/approval enforcement at the provider.

---

## UI states

- **Not signed in** — Okta sign-in button, or Demo user picker.
- **Signed in** — grouped provider sections, environment cards, badges, filters.
- **Access denied** — destinations you lack access to are hidden; an empty
  result explains which groups you hold.
- **Session expired** — prompt to sign in again.
- **Missing config** — shown in Okta mode when env vars are incomplete.

Badges: **Read-only**, **Full access**, **Approval required**, **Not configured**,
plus **Workload identity** on GitHub Actions (kept distinct from human login).

Responsive down to mobile; keyboard-accessible with visible focus states.

---

## Acceptance criteria

1. **Authorized access** — a user in `cloud-admins` sees all providers/envs with
   a **Full access** badge; Launch is enabled where a `launchUrl` is configured.
2. **Read-only enforcement** — a user in `cloud-viewers` sees **Read-only**
   badges; no **Full access** anywhere; cannot self-escalate.
3. **Denied access** — a user with no matching groups sees no destinations and a
   message naming their groups.
4. **Privileged controls** — Prod and Management always show **Approval required**.
5. **Not configured** — destinations without a `launchUrl` show **Not configured**
   and a disabled Launch button (no fabricated console).
6. **Expired/missing session** — expired tokens show the **Session expired**
   screen; incomplete Okta config (in `okta` mode) shows **missing config**.
7. **Honest demo** — Demo mode is always banner-labeled and never implies real auth.

---

## Project layout

```
src/
  config/
    okta.ts            # env-sourced Okta config + validation
    destinations.ts    # provider × environment catalog (launchUrl = stub point)
    accessMapping.ts   # EDITABLE groups -> destinations -> access rules
  auth/
    types.ts           # shared claims/session shape
    oktaClient.ts       # @okta/okta-auth-js wrapper (PKCE, token validation)
    mockAuth.ts        # clearly-labeled demo users
    AuthContext.tsx    # adapter selection + useAuth() hook
  components/          # TopBar, Filters, ProviderSection, DestinationCard,
                       # Badge, LoginScreen, StateScreens, Dashboard
  App.tsx              # state routing + demo banner
  main.tsx
```
