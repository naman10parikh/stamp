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

## The ONE thing to get right first — the JTBD-0 boundary gate

Before asking stamp anything, place the task on the **mechanism↔governance line**:

- **Mechanism** ("make the SAML/OIDC/SCIM/MCP-OAuth *work*", "validate a signature", "fix dropped SCIM events",
  "pick the auth provider on $ breakpoints", "*enforce* RBAC at the token") → **that's badge, not stamp.** stamp
  will return a `→ badge` handoff, not code.
- **Governance / evidence** (the posture, the proof, the program, the attestation) → **that's stamp.**

One-liner: **"badge = the connection; stamp = the program that decides we need it and proves it to the auditor."**

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
