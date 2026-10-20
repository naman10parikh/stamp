# AGENTS.md — stamp (Compliance / enterprise-readiness employee)

> Read this first if you are an agent (Claude Code, the Energy hub, or a sibling employee) calling stamp.
> stamp is a **tool-employee**, not a product: drive it via the **CLI** (`bin/stamp`) or the **MCP server**
> (`stamp-mcp`, stdio). Its product is JUDGMENT — the six `brain/` files are the asset.
> Powered by Energy.

## What stamp does

stamp owns the **governance & evidence** half of B2B trust: SOC 2 / ISO 27001 / HIPAA / ISO 42001 audit-readiness,
the audit-trail-as-a-CONTROL, access-review *attestation*, data-residency *proof*, GDPR/CCPA + DSARs, the
security-questionnaire + pen-test taxes, and the enterprise-**SSO program** (decide → price → prove). It drives
Vanta/Drata as a tool; it does **not** rebuild a GRC platform.

A **tool-employee** (not a product): consumed by agents via **CLI + MCP** and by the chairman via a local
**cockpit**. stamp is never messaged — reachability channels are N/A. Its product is **JUDGMENT**: the six
`brain/` files are the asset; the CLI/MCP/skills/cockpit are thin surfaces that route a task to the right brain
node, run the deterministic part, and **drive Vanta/Drata as a tool — never reimplement the GRC CRUD.**

## The ONE thing to get right first — the JTBD-0 boundary gate

Before asking stamp anything, place the task on the **mechanism↔governance line**:

- **Mechanism** ("make the SAML/OIDC/SCIM/MCP-OAuth *work*", "validate a signature", "fix dropped SCIM events",
  "pick the auth provider on $ breakpoints", "*enforce* RBAC at the token") → **that's badge, not stamp.** stamp
  will return a `→ badge` handoff, not code.
- **Governance / evidence** (the posture, the proof, the program, the attestation) → **that's stamp.**

One-liner: **"badge = the connection; stamp = the program that decides we need it and proves it to the auditor."**

## Run it

- **The command line:** `npx -y -p github:naman10parikh/stamp stamp --help`. In a clone, after `pnpm build`:
  `node bin/stamp <command> [args] --json`.
- **The MCP server** over stdio: `npx -y -p github:naman10parikh/stamp stamp-mcp` (8 tools and the 6 brain files
  as resources). In a clone: `node dist/mcp/server.js`.
- `stamp_audit` reads the app you point it at, so give it a path on your disk. `stamp_audit_log` and
  `stamp_residency` read a file only in check mode, and `stamp_questionnaire` only when given an answer base
  (`kb`); the rest need no files.
- None of them needs an account or a key; the server reads no credentials.

## Tool list

### CLI (`bin/stamp`) — every command takes `--json`

| Command | What it does |
| --- | --- |
| `stamp audit <app\|path> [--framework soc2\|iso27001\|hipaa]` | gap-scan a target app for SOC2-readiness → control-mapped gap report (severity + fix). **Never prints "compliant"** — only "audit-ready evidence: N gaps". |
| `stamp sso-plan --target <app> [--acv <n>] [--dry-run]` | emit the enterprise-SSO **program** plan: buyer-readiness checklist + WorkOS Admin-Portal/SCIM wiring plan + deprovisioning-proof spec + the **`→ badge` handoff** for the mechanism. Does NOT hand-roll SAML. |
| `stamp audit-log [--design\|--check <path>]` | design the tamper-evident OTel-span trail (actor/target/before_hash/after_hash/trace_id, hash-chained, signed, SIEM-export) OR check a config for the 4 properties. |
| `stamp access-review [--scope all\|privileged\|agents] [--scim]` | run a UAR scoped to non-human + **AGENT** identities (derived from badge token scopes); **PROPOSE** revokes, a human approves; `--scim` adds IdP↔app reconciliation. |
| `stamp residency [--ask] [--check <path>]` | ask "residency or sovereignty?" first; enumerate whole-pipeline pinning + the BYOK/CMK lever; flag the audit-log/LLM-call/tax-data gaps. |
| `stamp dsar --type access\|erasure` | classify → verify → apply-exemptions → draft → route across the subprocessor register on the GDPR/CCPA clock; a human signs. |
| `stamp questionnaire <sig\|caiq\|vsa\|path> [--kb <dir>]` | draft answers mapped to a versioned answer-KB; each marked "DRAFT — human must sign". |
| `stamp advise --on <grc-platform\|privacy\|pentest\|residency\|repos>` | a DECISION with the honest cost (Vanta default; vet the auditor; verify vendor independence; check `pushed_at` not stars), not a feature table. |
| `stamp runs [--since <ts>]` | aggregate `logs/runs.jsonl` (observability view). |

### MCP server (`stamp-mcp`, stdio) — 8 tools + brain resources

`stamp_audit` · `stamp_sso_plan` · `stamp_audit_log` · `stamp_access_review` · `stamp_residency` · `stamp_dsar` ·
`stamp_questionnaire` · `stamp_advise`. Plus `stamp://brain/{file}` resources exposing the 6 brain files.

## The NOT-list (what NOT to ask stamp / what stamp refuses)

- ❌ **Don't ask stamp for SAML/OIDC/SCIM code** → that's **badge**. stamp emits the plan + a `badge_handoff`, not
  generated auth code.
- ❌ **Don't ask stamp to say "we're compliant"** → it returns "audit-ready evidence assembled; attestation
  pending the auditor". The CPA firm certifies, not the agent.
- ❌ **Don't ask stamp to auto-revoke or auto-remediate** an irreversible control → it PROPOSES; a human approves.
- ❌ **Don't ask stamp to bless an AI-only / scanner-only pen-test** → auditors reject it; it requires a human-led
  one.
- ❌ **Don't infer a vendor or OSS repo is safe/current from stars** → stamp checks vendor independence +
  `pushed_at`.
- ❌ **Don't ask stamp to build the regional cells** (→ **rocket**), product error/uptime monitoring (→ **canary**),
  or manage secrets (→ **hush**).

## The brain (stamp's knowledge — read these, don't re-research)

`brain/EXPERTISE-MAP.md` (the JTBD decision spine) · `brain/BATTLE-TESTED-SCENARIOS.md` (16 named, dated
incidents) · `brain/KNOWN-PITFALLS.md` (P1–P25, detect+avoid) · `brain/OPINIONS.md` (O1–O25, always/never+source)
· `brain/GAPS-AND-DISPUTES.md` · `brain/TOOL-MATRIX.md` (Vanta/Drata/WorkOS/Cobalt defaults). Query the brain via
`scripts/brain-search.sh "<query>"`.

## THE decision spine (run this on EVERY task, in order)

**1. JTBD-0 boundary gate FIRST — place the task on the mechanism↔governance line.**
If the task is "make the SAML/OIDC/SCIM/MCP-OAuth *work*", "validate a signature", "fix event ordering", "pick the
auth provider on $ breakpoints", or "*enforce* RBAC at the token" → that is **mechanism → hand to badge and STOP**
(emit a `→ badge` handoff; do NOT hand-roll the code). Everything else (the posture, the evidence, the program,
the attestation) is stamp's. Mis-placing the task is the #1 time-waster (KP P25).

**2. Then route by JTBD** (EXPERTISE-MAP):
JTBD-1 pass first SOC2/ISO/HIPAA → `audit`/`advise` · 2 pick a GRC platform → `advise` · 3 access-review (the
*attestation*, not enforcement) → `access-review` · 4 audit-trail-as-control → `audit-log` · 5 prove residency →
`residency` · 6 GDPR/CCPA/DSAR → `dsar` · 7 questionnaire + pen-test taxes → `questionnaire` · 8 the enterprise-SSO
**program** → `sso-plan` (acceptance) · 9 SCIM-deprovisioning *posture* → `access-review --scim`/`sso-plan` · 10
operate as a headless agent → every CLI cmd `--json` · 11 reference repos → `advise --repos`.

## The non-negotiable creeds (stamp's anti-slop layer — these gate every output)

- **NEVER claim "compliant" / "certified".** Always **"audit-ready evidence assembled; attestation pending the
  auditor."** The attestation is the human CPA firm's — never the agent's; platforms monitor ≤80-90% of controls
  (O24; KP P7). The `compliance-lint` hook blocks a "we are SOC 2 compliant" claim in staged output.
- **AI drafts, a HUMAN SIGNS** every control attestation, questionnaire answer, DPA/SCC/BAA. A wrong answer is a
  misrepresentation to a customer; AI prose can be "lipstick on fraud" (O22; KP P23).
- **PROPOSE revokes, a human APPROVES.** NEVER auto-revoke privileged/uncertain access or auto-remediate an
  irreversible control without a human gate — the auto-revoke is itself a CC6 change-mgmt risk (O19; KP P6).
- **NEVER bless an AI-only / scanner-only pen-test** as the SOC 2 pen-test — auditors reject it; you need a
  human-led one (Cobalt-class), scoped to the boundary, with retest (the #1 agent-fleet trap — O20; KP P18).
- **Tamper-EVIDENT > tamper-resistant.** "We have logs" ≠ "we have an audit trail." Hash-chain + sign + identity-
  attribute + ≥1yr + real-time SIEM export. Attribute every privileged agent action to an accountable human
  `(human_owner, agent_id, scopes, tenant, task_id)` (O8/O9; KP P8/P9).
- **Residency or sovereignty?** Ask first. Pin the WHOLE pipeline (DB + backups + logs + CDN + subprocessors +
  **the LLM call** + tax data) or call it nothing; reach for BYOK/CMK for sovereignty (O11/O12; KP P13/P14).
- **Verify vendor independence; check `pushed_at`, not stars.** "Neutral" tools get acquired (SafeBase→Drata); a
  high-star repo can be dead (`strongdm/comply`, dead 2022-07-21). Vet the auditor, not just the platform
  (O3/O25; KP P19/P20/P21).
- **BUY the GRC platform; OWN the judgment.** The CRUD is commoditized; the moat is the auditor network +
  integrations + the answer-KB. Drive Vanta/Drata as a tool — never rebuild it (O4/O5).

## Spec-currency corrections stamp carries (the field moves quarterly — re-check at decision time)

- **Vanta MCP is PUBLIC BETA, not full GA** (verified 2026-06-17). The brain's older "GA" wording is softened;
  KP P1 re-check still applies.
- **Secureframe is API-only — NO MCP** (as of 2026-06-16). Drive it via REST; reserve MCP for Vanta + Drata
  (KP P4).
- **Vanta revokes the previous token** when you re-issue with the same `client_id` → **serialize token issuance
  per client_id**; 1-hr token; 5 req/min (KP P2). Name the vendor in the prompt or the agent answers from
  training data, not the live tenant (KP P3).

## The boundary refuse-list (hand to the named sibling, do NOT do it yourself)

- Auth **mechanism** (SAML/OIDC/SCIM code, signature validation, event ordering, MCP-OAuth impl, provider
  $-breakpoint selection, RBAC *enforcement*) → **badge**.
- The **regional cells / infra** residency is pinned to (per-region cloud stacks, the deploy) → **rocket**. stamp
  owns the posture + the guardrail check, not the cells.
- Product-side **error/uptime** monitoring (Sentry/crashes) → **canary**. (stamp's "audit log" is a compliance
  CONTROL, not app-health telemetry.)
- **LLM token-spend / cost-per-run** observability → **agentmoney**.
- **Secrets management / rotation** (Doppler/Vault) → **hush**. stamp *requires* secrets be vault-managed (it's a
  finding if they're in git) and *audits for* leaked secrets, but does not own the vault.
- **Signing** anything legally consequential → **a human** (auditor / counsel / the chairman).

## Stack & conventions

- TypeScript strict, Node ≥20, ESM, pnpm, Vitest + Playwright. CLI binary `stamp`; MCP server `stamp-mcp` (stdio
  local). `--json` on every CLI command (agents never parse a human TTY — O23).
- The brain (`brain/**.md`) is the queryable memory layer — search it via `scripts/brain-search.sh`, not git
  history.
- Commit convention so git snap-back works at all 3 granularities: `feat(skill):` · `feat(employee):` ·
  `feat(company):`. Conventional commits; name the model in commit trailers.
- Acceptance bar (the spine, fixture-driven, $0, no creds): `stamp audit <app>` → SOC2-readiness gap report AND
  `stamp sso-plan --dry-run` → enterprise-SSO program plan (with the mechanism **handed to badge**, NO SAML
  code), green ×3 in CI.

## Develop and test

```bash
pnpm install && pnpm build
pnpm test                          # 80 tests (Vitest)
pnpm run eval                      # structural checks and 15 golden tasks; the model-graded step runs only with ANTHROPIC_API_KEY
pnpm run acceptance                # audit + sso-plan, 4 assertions, three runs that must match
pnpm exec playwright test cockpit  # the cockpit end-to-end test (needs Chromium)
bash scripts/serve.sh              # the local cockpit on http://127.0.0.1:7799
bash scripts/brain-search.sh "<query>"
```

Running the command line appends a line to `logs/runs.jsonl`, which is tracked. CI runs the build, the tests, the
eval, the acceptance bar and the cockpit test on every push and pull request; the nightly RSI workflow re-runs the
eval and the brain checks and never commits.
