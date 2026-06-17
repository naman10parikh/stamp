---
title: "stamp ECOSYSTEM research — INDEX + the badge boundary"
type: synthesis
domain: compliance
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
updated: 2026-06-16
tags: [index, compliance, soc2, iso27001, gdpr, sso, scim, audit-log, residency, stamp]
related: ["[[ecosystem-01-soc2-iso-automation]]", "[[ecosystem-02-enterprise-sso-program]]", "[[ecosystem-03-scim-provisioning-posture]]", "[[ecosystem-04-audit-logging]]", "[[ecosystem-05-data-residency]]", "[[ecosystem-06-gdpr-ccpa-dpa]]", "[[ecosystem-07-access-reviews-rbac]]", "[[ecosystem-08-pentest-questionnaires]]", "[[ecosystem-09-tradeoff-matrix]]", "[[ecosystem-10-github-issues-breakage]]", "[[ecosystem-11-agent-operator-notes]]", "[[ecosystem-12-versions-changelog]]"]
summary: "Master index for stamp's compliance/enterprise-readiness research. Defines the stamp↔badge boundary verbatim, lists all raw files, and states the one-line verdict per topic."
---

# stamp ECOSYSTEM research — INDEX + boundary

> stamp = the Energy fleet's **Compliance / SSO / enterprise-readiness** domain-expert employee.
> This index is the map; each `ecosystem-NN-*.md` file is the territory. Every claim there is cited
> (URL + access date). June-2026 currency: prefer sources <6 months old; older sources are flagged.

## THE BOUNDARY — stamp vs badge (quote it, don't blur it)

badge already owns the **auth PRIMITIVES**. stamp owns the **compliance POSTURE + the enterprise-SSO PROGRAM**.
The split is not "auth vs compliance" — it's **mechanism vs governance/evidence**. They are complementary,
and a B2B deal needs BOTH.

badge's own SOUL.md states its claim (quoted verbatim, `~/badge/identity/SOUL.md` L15-18):
> "**SSO / SCIM** — enterprise federation (SAML/OIDC) **and** the lifecycle that deprovisions a departing
> employee before a security questionnaire fails. **Agent identity** — the live 2026 battleground."

badge's EXPERTISE-MAP JTBD-3 (`~/badge/brain/EXPERTISE-MAP.md` L53-61) owns the MECHANISM:
SSO≠SCIM, SCIM deprovisioning, **webhook-signature validation, event ordering**, SAML triage runbook.
badge's `ecosystem-07-sso-scim-enterprise.md` already covers the WorkOS/Auth0/Clerk SCIM mechanism matrix.

### What badge owns (stamp must NOT re-research these — quote/defer):
| badge territory | badge artifact |
|---|---|
| SAML/OIDC login-time protocol + the 7-step SAML triage runbook | `field-01-saml-sso-failure-modes.md`, EXPERTISE-MAP JTBD-7 |
| SCIM webhook signature validation + event ordering (the *code*) | `ecosystem-07` §gotchas, EXPERTISE-MAP 3.3 |
| Provider selection by $ breakpoint (Clerk/WorkOS/Auth0/Better Auth) | EXPERTISE-MAP JTBD-2, OPINIONS |
| MCP OAuth 2.1 implementation (PKCE, RFC 8707, CIMD>DCR, spec 2025-11-25) | `ecosystem-06-mcp-oauth.md`, JTBD-5 |
| Agent identity P1-P4 router, intersection-not-union authority | EXPERTISE-MAP JTBD-4/6, field-07 |
| The auth-CVE class (BetterAuth 2026-05-31 batch, account-linking) | `field-10-cve-verification`, `ecosystem-12-github-issues` |

### What stamp owns (THIS research):
| stamp territory | why it's stamp not badge |
|---|---|
| **SOC2 Type II / ISO 27001 / HIPAA evidence automation** (Vanta/Drata/Secureframe) | governance + auditor evidence, not a login flow |
| **The enterprise-SSO PROGRAM** (the buyer-readiness wrapper around badge's SSO mechanism; "SSO tax" debate, the deal-blocker checklist a CISO demands) | program/policy, not protocol — stamp says *what an enterprise demands*, badge *implements the SAML* |
| **Audit logging as COMPLIANCE EVIDENCE** (immutable/append-only, retention, SIEM export, CC7/CC6 controls) | the audit *trail as a control*, distinct from badge's auth-event logging |
| **Data residency** (per-region pinning, customer-managed KMS, EU/US/India) | infra+legal posture |
| **GDPR / CCPA-CPRA / DPA / SCCs / DSARs** | legal+process, zero auth overlap |
| **Access reviews / user access reviews (UAR) / RBAC POSTURE** (the periodic *attestation*, least-privilege evidence) | governance attestation — badge owns the RBAC *enforcement*, stamp owns the *review/evidence* |
| **Pen-test prep + security questionnaires** (SIG/CAIQ/VSA, Whistic/SafeBase/Trust Center) | sales-security ops, not auth |

**The one-line handoff rule:** when a task is "*get the SAML working / validate the SCIM webhook / pick the
auth provider / implement MCP OAuth*" → **badge**. When it's "*pass the SOC2 audit / answer the security
questionnaire / set up access reviews / prove data residency / handle a DSAR / decide if we need SSO to close
this deal*" → **stamp**. The shared seam (enterprise SSO) splits: **badge = the connection; stamp = the
program that decides we need it and proves it to the auditor.**

## Energy trust-envelope anchor (stamp's home in the platform)

The complete_story names **7 enterprise trust primitives** (`docs/vision/the_complete_story.md` L222) — stamp
is the *compliance* primitive and co-owns *audit / residency*:
> "7 enterprise trust primitives: **identity** (RBAC + scoped JWT), **audit** (append-only OTel + SIEM
> export), **residency** (per-region pinning + customer-managed KMS), **compliance** (HIPAA BAA / SOC 2 Type
> II / FedRAMP as the customer needs), **cost** …, **kill switch** …, and **observability**."

Map to fleet employees: **identity→badge**, **audit→stamp+sentry/observability**, **residency→stamp+rocket
(infra)**, **compliance→stamp (owner)**, **cost→helios/penny**, **kill-switch→rocket**, **observability→sentry**.

Energy harness checklist (`audit/HARNESS-CHECKLIST-2026.md` L354-358) flags the open gap stamp closes:
> "Compliance / security posture / SSO — Enterprise-tier: SOC2 / GDPR / HIPAA evidence automation + audit
> logging + enterprise SSO. **Default: Vanta / Drata** (posture automation) + Clerk SAML/SSO. **GAP** — enters
> at the first enterprise deal (budget ~$15-25K/yr)." And L215: trust/safety "**FOLD**" — distributed, not a
> separate component; "if it ever needs one home, it becomes a 3rd cross-cutting property." **stamp IS that home.**

## Files in this research set (final numbering)
- `ecosystem-01-soc2-iso-automation.md` — Vanta / Drata / Secureframe + Oneleet/Comp AI; the agentic-GRC inflection, pricing, the honest take, AI-questionnaire features.
- `ecosystem-02-enterprise-sso-program.md` — the "SSO tax" debate, the buyer-readiness checklist, WorkOS-as-program, where stamp hands the mechanism to badge.
- `ecosystem-03-scim-provisioning-posture.md` — SCIM from the POSTURE side (deprovisioning attestation, drift) — defers the *code* to badge. (Short by design.)
- `ecosystem-04-audit-logging.md` — audit trail as a CONTROL (append-only/tamper-evident, retention, SIEM/OTel), SOC2 CC6/CC7; the AI-agent angle; tooling.
- `ecosystem-05-data-residency.md` — region pinning, BYOK/CMK, sovereignty≠residency, EU/China/India; the whole-pipeline gotcha.
- `ecosystem-06-gdpr-ccpa-dpa.md` — GDPR / CCPA-CPRA / DPAs / SCCs / DSARs / EU-US DPF; the 2025-26 enforcement reality (€7.1B fines).
- `ecosystem-07-access-reviews-rbac.md` — user access reviews (UAR), least-privilege evidence, RBAC posture (vs badge's enforcement); the non-human-identity scope.
- `ecosystem-08-pentest-questionnaires.md` — pen-test prep for SOC2/ISO (AI-only PTaaS rejected!), security questionnaires (SIG/CAIQ/VSA), Trust Centers.
- `ecosystem-09-starter-repos.md` — the best starter/template/example repos (trycompai/comp, theopenlane/core, agent-native operators); the dead-but-famous strongdm/comply caveat.
- `ecosystem-10-github-issues-breakage.md` — real-world breakage from GitHub issues / HN / postmortems (the anti-slop layer): compliance-theater, Vanta OAuth #6416, OSS self-host pain.
- `ecosystem-11-agent-operator-notes.md` — what an AGENT (not a human) needs: CLIs, APIs, MCP servers (Vanta + Drata both ship MCP).
- `ecosystem-12-versions-changelog.md` — current versions + last-6-months changelog deltas + market (Vanta $4.15B/$300M ARR; Drata $2B/SafeBase $250M).
- `ecosystem-13-tradeoff-matrix.md` — the honest competing-tools decision matrix across all compliance categories.
- `ecosystem-14-gaps-and-disputes.md` — what could NOT be confirmed, the 4 genuine disputes, and the boundary-respect audit.

## One-line verdict per topic (the TL;DR a fresh session reads first)
1. **SOC2/ISO automation is a 3-horse race + a price war.** Vanta (category leader, ~$1.5–2B val, AI agent push) vs Drata (deep automation, "Drata Compliance Companion" AI) vs Secureframe; the *insurgents* (Oneleet, Comp AI/`comp-ai`, Delve) are undercutting on price and "we book the audit." The platform is now table-stakes; the *differentiator is the AI questionnaire-answering + Trust Center + integration breadth*.
2. **"Do you even need SSO?" is the most contested 2026 take.** The "SSO tax" backlash (sso.tax) says vendors gate SSO to extort enterprises; the counter is "SSO is a security control, not a feature." stamp's stance: SSO+SCIM are deal-blockers >~$200k ACV (badge's number), but stamp decides *when* and proves it; **don't gate basic SSO punitively**.
3. **Audit logging is the single most load-bearing SOC2 control** (CC7.x) and the easiest to fake badly — append-only + tamper-evidence + retention + SIEM export is the bar; "we have logs" ≠ "we have an audit trail."
4. **Data residency is mostly theater unless you pin compute AND storage AND backups AND logs AND your subprocessors** — the gotcha is the long tail (Sentry, analytics, email) leaking data cross-region.
5. **GDPR/CCPA: the 2025-26 reality is DSAR automation + sub-processor management + the EU-US DPF holding (for now)**; the new CCPA/CPRA + state-law patchwork (~20 US states by 2026) makes "GDPR-aligned everywhere" the cheapest strategy.
6. **Access reviews are the control auditors fail you on most** because they're manual, quarterly, and rot; the automation play (Vanta/Drata access reviews, Conductor/Lumos/ConductorOne) is real.
7. **Pen-test: SOC2 doesn't strictly require one but every enterprise questionnaire does**; the agent-relevant shift is continuous/automated pentest (Cobalt PtaaS, Sprocket) + the "remediation evidence" loop.
8. **For an AGENT operator:** Vanta and Drata both ship public REST APIs + (Vanta) an MCP server announced; the questionnaire-answering AI is the highest-leverage agent surface; most "automation" is still integration-pull + human attestation.

## Sources count for this file
This index synthesizes the per-file research; internal-corpus quotes from `~/badge/*` and
`~/energy/*` are cited inline above. External citations live in the per-topic files.
