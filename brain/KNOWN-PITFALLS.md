---
title: "stamp KNOWN-PITFALLS — version-specific gotchas with detection + avoidance"
type: synthesis
domain: compliance
created: 2026-06-17
updated: 2026-06-17
tags: [pitfalls, gotchas, vanta, drata, soc2, gdpr, audit-log, residency, scim, stamp, cp123]
sources: ["brain/research/raw/ecosystem-11-agent-operator-notes.md", "brain/research/raw/ecosystem-10-github-issues-breakage.md", "brain/research/raw/ecosystem-05-data-residency.md", "brain/research/raw/ecosystem-04-audit-logging.md", "brain/research/raw/ecosystem-07-access-reviews-rbac.md", "brain/research/raw/ecosystem-08-pentest-questionnaires.md", "brain/research/raw/ecosystem-06-gdpr-ccpa-dpa.md", "brain/research/raw/ecosystem-01-soc2-iso-automation.md", "brain/research/raw/ecosystem-09-starter-repos.md", "brain/research/raw/ecosystem-12-versions-changelog.md"]
related: ["[[stamp EXPERTISE-MAP]]", "[[stamp BATTLE-TESTED-SCENARIOS]]", "[[stamp OPINIONS]]", "[[stamp TOOL-MATRIX]]"]
summary: "The gotcha list — version-specific and dated where possible, each with a DETECT signal and an AVOID rule. These are the traps that lose deals, fail audits, or break a headless agent run. Sourced from GitHub issues, vendor docs, and auditor practice as of June 2026."
---

# stamp KNOWN-PITFALLS

> Each pitfall: **what breaks → how to DETECT it → how to AVOID it**, dated/versioned where the research gives
> it. The ones marked ⚠️CURRENT-BUG are live open issues as of June 2026 — re-check before relying on the
> affected surface. Cross-ref scenarios in [[stamp BATTLE-TESTED-SCENARIOS]].

---

## Operator pitfalls (driving the tools as an agent)

### P1 — ⚠️CURRENT-BUG: Vanta OAuth2 client-credentials errors are opaque (`unhandled_oauth2_cc_error`, empty payload)
- **Breaks:** A failed Vanta token exchange returns an opaque wrapper code with **no provider reason** — the
  real error is logged server-side but stripped from the HTTP response. (`NangoHQ/nango` #6416, OPEN, opened
  **2026-06-09**, reproduced with Vanta.) Source: `ecosystem-10` §Finding 2.
- **Detect:** You get `unhandled_*` with an empty body on a Vanta connection; the connector logs show a real
  provider error at `oauth.controller.ts` `oauth2RequestCC`.
- **Avoid:** Capture the **server-side provider error** from the connector logs; don't trust the wrapper's
  code; don't blind-retry. Re-check whether #6416 is fixed before trusting the wrapper's error surface.

### P2 — Vanta revokes the PREVIOUS token when you re-issue with the same `client_id` (parallel-agent killer)
- **Breaks:** Two concurrent stamp jobs each request a Vanta token with the same `client_id`; the second
  request **revokes the first job's token**, causing confusing mid-run auth failures. Source: `ecosystem-11`
  §Vanta REST API; `ecosystem-10` §Finding 2.
- **Detect:** Intermittent 401s during parallel/nightly compliance pulls; a job that worked alone fails when
  run alongside another.
- **Avoid:** **Serialize token issuance per `client_id`** (mutex on refresh) or give each parallel job its own
  client. Vanta token lifetime is **1 hour**. Respect the **5 req/min** OAuth-endpoint rate limit (shared
  across all APIs).

### P3 — Forgetting to name the vendor in the prompt → the agent answers from training data, not the live tenant
- **Breaks:** A prompt like "summarize our failing compliance tests" routes to the model's built-in knowledge
  instead of the Drata/Vanta MCP tools, returning generic (wrong) answers. Source: `ecosystem-11` §Drata best
  practices.
- **Detect:** The answer is plausible but doesn't match the live tenant; no MCP tool call fired.
- **Avoid:** **Always include the vendor name** ("Drata"/"Vanta") in prompts (Drata's explicit best practice),
  be specific (framework / time-range / team / risk category), and confirm an MCP tool actually executed.

### P4 — Assuming Secureframe has an MCP server (it's API-only as of 2026-06-16)
- **Breaks:** An agent flow built on "toggle the Secureframe MCP" fails — no first-party MCP server surfaced.
  Source: `ecosystem-11` §Secureframe; `ecosystem-12` §MCP servers.
- **Detect:** No `mcp.secureframe.*` URL in any current doc; only a REST API.
- **Avoid:** Drive Secureframe **via its REST API** (Comply integrations). Use MCP only for **Vanta**
  (`mcp.vanta.com/mcp`, GA) and **Drata** (experimental, region-split). (Flagged GAP — verify per
  `ecosystem-14` #7.)

### P5 — Pointing an agent at the wrong Drata regional MCP (residency mismatch)
- **Breaks:** Using `mcp.drata.com` (US) for an EU tenant — wrong region control-plane, possible residency
  violation. Source: `ecosystem-11` §Drata; `ecosystem-05` §concrete proof-point.
- **Detect:** Tenant data region ≠ the MCP URL region you connected.
- **Avoid:** Match the URL to the tenant region: US `mcp.drata.com/mcp/` · EU `mcp-euc1.drata.com/mcp/` · APAC
  `mcp-apse2.drata.com/mcp/`. Note: even the **control plane** is now region-pinned — expect buyers to ask
  whether YOURS is.

### P6 — An agent auto-remediating a control without a human gate turns one bad inference into an incident
- **Breaks:** A stamp agent flips an S3 bucket / disables a user / auto-revokes access based on a failing test;
  the inference was wrong → outage or lockout (and a CC6 change-management finding). Source: `ecosystem-11`
  §10.4; `ecosystem-07` §automation-vs-human balance.
- **Detect:** A remediation step has no out-of-band approval and is irreversible.
- **Avoid:** **read/draft/commit gradient** — agent pulls failing tests and *proposes* remediation; gate any
  irreversible action behind a human. Same rule badge enforces for agent-auth (JTBD-6.3 there).

### P7 — Claiming "we're compliant" instead of "audit-ready evidence assembled"
- **Breaks:** An agent (or a status report) states the company "is SOC 2 compliant" before the CPA firm has
  signed — a misstatement; the attestation is the human auditor's, never the agent's. Source: `ecosystem-11`
  §what an agent cannot do; §playbook (6).
- **Detect:** Any output asserting compliance/certification without naming the issuing CPA firm / cert body.
- **Avoid:** Phrase as **"audit-ready evidence assembled; attestation pending the auditor."** The platform
  monitors ≤80-90% of controls automatically; the rest + the sign-off are human.

---

## Audit-trail pitfalls (the load-bearing CC7/CC6 control)

### P8 — Treating "we have logs" as the audit trail (auditor finding)
- **Breaks:** Generic app logs presented as CC7 evidence get flagged — they're mutable, not identity-attributed,
  short-retention, gap-prone. Source: `ecosystem-04` §why load-bearing.
- **Detect:** Logs are editable; actors are service accounts; retention < the audit period; chain has gaps.
- **Avoid:** Build **append-only + tamper-EVIDENT (hash-chained, signed) + identity-traceable + ≥1yr retention
  + real-time SIEM export**. OTel spans, one per mutation, with `actor`/`target`/`before_hash`/`after_hash`/
  `trace_id`.

### P9 — Tamper-RESISTANT mistaken for tamper-EVIDENT
- **Breaks:** "Logs are stored in a write-protected bucket" *resists* tampering but can't *prove* nothing was
  altered — an auditor wanting integrity proof issues a finding. Source: `ecosystem-04` §stance (1).
- **Detect:** You can claim integrity but cannot *demonstrate* it (no hash chain / signatures).
- **Avoid:** **Hash-chain + sign** the append-only spans so integrity is *provable*. This is the line between
  passing CC7 and a finding.

### P10 — Ephemeral sandboxes die before emitting their audit spans (CC7 log-chain gap)
- **Breaks:** Auto-scaling / ephemeral E2B sandboxes create gaps in the log chain — the privileged action
  happened but no durable, identity-traceable record survived. Source: `ecosystem-04` §the agent story (CC7).
- **Detect:** Actions in short-lived compute with no corresponding span in the central trail.
- **Avoid:** Emit to a **durable, centralized, identity-traceable** trail BEFORE the sandbox dies; never use
  `2>/dev/null` in sandbox commands (masks errors — Energy rule).

### P11 — AI threshold-promotions ship without change-management artifacts (CC8)
- **Breaks:** An AI/AutoLab process promotes an output based on a threshold **without the approval + test
  artifacts** a human attaches to a change ticket → CC8 gap. Source: `ecosystem-04` §the agent story (CC8).
- **Detect:** A promoted change with no eval score / before-after hash / approval record.
- **Avoid:** Attach the same artifacts (eval scores, before/after hash, approval) to AI promotions — the RSI
  audit log doubles as CC8 evidence.

### P12 — Auto-archiving evidence into oblivion (stale evidence = a finding)
- **Breaks:** A GRC platform auto-archives evidence past an expiry; the auditor finds the control unevidenced
  for part of the period. Source: `ecosystem-04` §2026 bar (5); §stance (4).
- **Detect:** Evidence silently disappears at an expiry date; no provenance/review-interval metadata.
- **Avoid:** **Flag expired evidence, don't auto-archive it** (Secureframe's 2026 pattern). Store with
  provenance + completion dates + review intervals. Retain the trail ≥ the full audit period (≥1yr default).

---

## Residency / privacy pitfalls

### P13 — Pinning only the primary DB and calling it "residency"
- **Breaks:** Backups replicate cross-region, the SIEM/OTel pipeline ships to one global region, the CDN caches
  globally, and the **LLM call** + **tax-location data** egress — a data-flow audit fails the residency claim.
  Source: `ecosystem-05` §the load-bearing gotcha.
- **Detect:** Any of {backups, audit log, cache/CDN, a subprocessor, the model call, tax data} crosses the
  promised region.
- **Avoid:** Pin the **whole pipeline**; the audit log (contains PII), the tax-location data, and the LLM call
  are the three everyone forgets. Add an **automated guardrail** that asserts "no PII left region X."

### P14 — Answering "EU residency: yes" when the buyer actually means sovereignty
- **Breaks:** Region-pinned to the EU but still reachable under the **US CLOUD Act** (US company) → the deal
  dies in security review despite the "yes." Source: `ecosystem-05` §why it matters.
- **Detect:** The buyer's underlying ask is "no US-government access," not "where is the data."
- **Avoid:** **Ask "residency or sovereignty?" first.** For sovereignty, offer **BYOK/CMK** (customer holds the
  KMS key) before promising a sovereign cloud.

### P15 — Missing the DSAR clock or leaving subprocessor data behind
- **Breaks:** A GDPR DSAR isn't answered within **1 month** (extendable to 3), or an erasure misses data in a
  subprocessor (Sentry/email/warehouse) → a violation. Source: `ecosystem-06` §DSARs; `ecosystem-05`
  §subprocessors.
- **Detect:** No clock tracking on intake; no per-subprocessor data-location map.
- **Avoid:** Automate intake→classify→verify→draft→route across the **subprocessor register**; track the
  GDPR 1-month / CCPA 45-day clocks; apply erasure exemptions (legal/fraud/free-speech). Human signs.

### P16 — Relying ONLY on the EU-US DPF (Schrems-III tail risk)
- **Breaks:** A CJEU annulment of the DPF strands DPF-only transfers (Safe Harbor + Privacy Shield both fell).
  The DPF survived Latombe (2025-09-03) but a CJEU appeal is anticipated. Source: `ecosystem-06` §DPF status.
- **Detect:** Transfers depend on the DPF with no SCCs/TIA underneath.
- **Avoid:** **Keep SCCs + a Transfer Impact Assessment as the backstop** even while using the DPF.

### P17 — Building per-jurisdiction privacy pipelines instead of GDPR-aligned-everywhere
- **Breaks:** N separate consent/DSAR pipelines for GDPR + CCPA + ~19-20 US states → expensive, brittle, and
  still leaky. Source: `ecosystem-06` §the mental model; §US patchwork.
- **Detect:** Per-state/per-region compliance code paths.
- **Avoid:** **Build GDPR-aligned everywhere** (GDPR is the superset) + honor Global Privacy Control opt-out
  signals + per-state DSAR intake. One posture covers the patchwork.

---

## Audit / pen-test / vendor pitfalls

### P18 — Presenting an AI-only / scanner-only pentest as the SOC 2 pen-test (auditors reject it)
- **Breaks:** The agent-native reflex ("we ran an AI red-team") fails the SOC 2 pen-test control — auditors
  want **human-driven, adversarial** testing; scanners miss business-logic + chained exploits and "may face
  auditor rejection." Source: `ecosystem-08` §the anti-slop fact; `ecosystem-10` §Finding 5.
- **Detect:** The "pentest" evidence is a scanner report / autonomous-agent run with no human tester.
- **Avoid:** **Human-led pen-test annually (Cobalt-class), scoped to the SOC 2 boundary, with retest
  evidence.** CPTaaS (Sprocket/Equixly) is continuous-coverage *layered on top*, never the report.

### P19 — Vetting the platform but not the AUDITOR (rubber-stamp report)
- **Breaks:** A cheap "we book the audit" bundle routes you to an auditor "that will sign off on anything";
  the report is worthless to a buyer who recognizes the firm. Source: `ecosystem-10` §Finding 1.
- **Detect:** The bundle won't name the CPA firm, or names an unknown one.
- **Avoid:** **Vet the auditor** (firm reputation), not just the platform. Real-security-first, cert as
  by-product.

### P20 — Betting on a "neutral" vendor that's been acquired by a competitor
- **Breaks:** Picking **SafeBase** as a neutral Trust Center — it's been **Drata** since **2025-02-12** ($250M);
  routing trust data through a competitor's tool. (Pattern repeats: Auth0→Okta.) Source: `ecosystem-10`
  §Finding 4.
- **Detect:** The "independent" tool is owned by a direct competitor of another vendor you evaluate.
- **Avoid:** **Verify vendor independence** before betting on "neutral." Re-check the M&A status each cycle.

### P21 — Recommending an OSS compliance repo on STAR COUNT (the `strongdm/comply` trap)
- **Breaks:** `strongdm/comply` (1,556★, top search result) has been **DEAD since 2022-07-21** — a 4-year-stale
  framework for a field that changes quarterly (SOC 2 TSC revisions, ISO 27001:2022). Source: `ecosystem-09`
  §the famous-but-DEAD one; `ecosystem-12`.
- **Detect:** High stars but `pushed_at` is >12 months old.
- **Avoid:** **Check `pushed_at` / active maintenance, not stars.** Use `trycompai/comp` (pushed daily) or
  `theopenlane/core`. (Also flagged stale: `loftwah/complisight` 2024-02.) **Star count ≠ current** (badge's
  popularity≠security rule, applied to staleness).

### P22 — Assuming OSS GRC ("free") has no ops cost
- **Breaks:** Self-hosting `trycompai/comp` is hard ("missing documentation and Docker configuration gaps",
  comp #1705) and you get no auditor network. Source: `ecosystem-10` §Finding 3; `ecosystem-01` §buy-vs-build.
- **Detect:** Plan to self-host OSS GRC without an in-house compliance engineer.
- **Avoid:** **BUY for a real company** (auditor network + maintained integrations are the value); OSS only
  with a dedicated compliance engineer + a data-sovereignty/no-lock reason.

### P23 — Trusting AI-generated compliance prose blindly ("lipstick on fraud")
- **Breaks:** AI-templated compliance language can be "absurdly bad — sentences that make no sense," and a
  *wrong* questionnaire/attestation answer is a misrepresentation to a customer. Source: `ecosystem-10`
  §Finding 1 (`sebmellen`); `ecosystem-08` §limits of AI auto-answering.
- **Detect:** AI-drafted control text or questionnaire answers shipped without a human read.
- **Avoid:** **AI drafts, a human SIGNS** every control attestation + every questionnaire answer. The
  compounding asset is the accurate KB, not the generator.

### P24 — Even compliance software has authz bugs — don't assume the GRC tool is secure
- **Breaks:** `trycompai/comp` #203: "**Policies can be edited in the employee portal**" — a privilege bug in
  a *compliance* tool; #284: API keys generated without argon2id until someone filed it. Source: `ecosystem-10`
  §Finding 3.
- **Detect:** The GRC tool itself grants over-broad access or ships weak crypto defaults.
- **Avoid:** Apply badge-style authz review to the compliance tooling too; don't assume "it's a compliance
  product, so it's secure."

---

## Boundary pitfall (the one that wastes the most time)

### P25 — stamp wandering into badge's mechanism (or vice-versa)
- **Breaks:** stamp starts debugging "the SCIM webhook is dropping events" / "validate the signature" / "pick
  the auth provider on $ breakpoints" — that's **badge's** turf; or treats RBAC *enforcement* as stamp's.
  Source: `ecosystem-00` §boundary; `ecosystem-03` §what stamp does NOT touch; `ecosystem-07` §boundary.
- **Detect:** The task is "make the SAML/SCIM/MCP-OAuth *work*" or "enforce the scope at the token" — that's
  mechanism.
- **Avoid:** **Place every task on the mechanism↔governance line first.** Mechanism → hand to badge and stop.
  stamp keeps the *posture/evidence/program*: SOC2/GDPR audit, questionnaire, access-review attestation,
  residency proof, DSAR, the SSO program decision, deprovisioning *proof* (not the SCIM pipe).
