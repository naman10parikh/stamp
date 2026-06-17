---
title: "stamp BATTLE-TESTED-SCENARIOS — real failure/migration/production scenarios + resolutions"
type: synthesis
domain: compliance
created: 2026-06-17
updated: 2026-06-17
tags: [scenarios, golden-tasks, eval, soc2, gdpr, audit-log, residency, questionnaire, sso-program, stamp, cp123]
sources: ["brain/research/raw/ecosystem-10-github-issues-breakage.md", "brain/research/raw/ecosystem-08-pentest-questionnaires.md", "brain/research/raw/ecosystem-04-audit-logging.md", "brain/research/raw/ecosystem-05-data-residency.md", "brain/research/raw/ecosystem-06-gdpr-ccpa-dpa.md", "brain/research/raw/ecosystem-07-access-reviews-rbac.md", "brain/research/raw/ecosystem-11-agent-operator-notes.md", "brain/research/raw/ecosystem-02-enterprise-sso-program.md", "brain/research/raw/ecosystem-01-soc2-iso-automation.md", "brain/research/raw/ecosystem-03-scim-provisioning-posture.md"]
related: ["[[stamp EXPERTISE-MAP]]", "[[stamp KNOWN-PITFALLS]]", "[[stamp OPINIONS]]", "[[stamp TOOL-MATRIX]]"]
summary: "16 real, specific compliance/enterprise-readiness scenarios (sourced from GitHub issues, HN postmortems, auditor practice, and the Energy trust model) — each with situation, the trap, the resolution, and the eval-gate. These become golden eval tasks in Wave S: a fresh stamp session should resolve each one the right way."
---

# stamp BATTLE-TESTED-SCENARIOS

> Each scenario is a real or realistic situation a Compliance employee hits, drawn from the research's
> anti-slop layer (GitHub issues, HN postmortems, auditor practice) + the Energy trust model. Format:
> **Situation → The trap → Resolution → Eval gate.** The eval gate is what a Wave-S golden task checks. These
> are the difference between "knows the vocabulary" and "won't lose a deal / fail an audit."

---

## S1 — Vanta OAuth2 client-credentials token exchange fails with an OPAQUE error (the concrete current bug)

- **Situation:** A stamp agent drives a live Vanta tenant via the API (or via Nango). A connection fails; the
  integrator gets `unhandled_oauth2_cc_error` with an **empty payload** — no reason why. (Real: `NangoHQ/nango`
  #6416, OPEN, opened 2026-06-09, reproduced with Vanta — the real provider error is logged server-side but
  stripped from the HTTP response.) Source: `ecosystem-10` §Finding 2.
- **The trap:** Trusting the wrapper's `unhandled_*` code, retrying blindly, and (worse) running multiple agent
  jobs that each request a token with the **same `client_id`** — because Vanta **revokes the previous token on
  re-issue**, parallel runs silently invalidate each other's auth. Source: `ecosystem-11` §Vanta REST API.
- **Resolution:** (1) Capture the **server-side provider error** (don't trust the wrapper's opaque code) —
  read the connector's logs at the token-exchange call (`oauth.controller.ts` `oauth2RequestCC`). (2)
  **Serialize token issuance per `client_id`** — never share creds across concurrent agent runs; give each
  parallel job its own client or a mutex on token refresh. (3) Respect the **5 req/min** OAuth-endpoint rate
  limit. Source: `ecosystem-10` §Finding 2; `ecosystem-11` §10.3.
- **Eval gate:** Given the opaque error + "we run nightly compliance pulls in parallel," the agent names the
  token-revocation-on-reissue behavior, prescribes per-client_id serialization, and says "read the server-side
  provider error" — does NOT say "retry."

## S2 — The cheap "we book the audit for you" bundle hides a rubber-stamp auditor

- **Situation:** A founder is choosing between Vanta (~$12K) and a bundled insurgent (Oneleet/Delve-class) that
  includes the pentest + the audit + the platform for less, "we book the auditor." Source: `ecosystem-01`
  §insurgents; `ecosystem-13` §1.
- **The trap:** Assuming the SOC 2 report is fungible. It is not — "there are and basically always have been
  auditors that will sign off on anything" if paid; the report is only as good as the CPA firm. A bundle can
  quietly route you to a rubber-stamp auditor, and a buyer's security team that recognizes the firm will
  discount the report. Source: `ecosystem-10` §Finding 1 (`thraxil`).
- **Resolution:** **Vet the AUDITOR, not just the platform.** Ask which CPA firm issues the attestation, check
  its reputation, and prefer a recognized firm even at higher cost. Treat the platform as commoditized; the
  auditor's name is what a buyer trusts. (Real-security-first; cert as by-product.) Source: `ecosystem-10`
  §Finding 1; §distilled rule 2; `ecosystem-14` DISPUTE 2.
- **Eval gate:** The agent, given the cheaper bundle, asks "which auditor?" and flags rubber-stamp risk —
  rather than picking on price alone.

## S3 — "Do we even need SSO to close this deal?" (the program-trigger judgment)

- **Situation:** Sales is stalled on a $300k ACV enterprise deal; the buyer's security team is asking for SSO +
  SCIM. The eng lead wants to know if it's worth building now. Source: `ecosystem-02`; `ecosystem-03`.
- **The trap:** Either (a) over-building SSO for every $5k deal, or (b) shipping "SSO only" and getting failed
  on the **deprovisioning** questionnaire item. Source: `ecosystem-02` §stance; `ecosystem-03` §the one fact.
- **Resolution:** At **~$200k ACV, SSO+SCIM are deal-blockers** — yes, build now. Ship SSO **and** SCIM
  together (SCIM **deprovisioning** is "the most-tested compliance question in B2B security questionnaires
  above ~$200k contract value"). **Hand the SAML/OIDC+SCIM implementation to badge; stamp owns the program
  decision + proving deprovisioning to the buyer.** Source: `ecosystem-02` §stance (3,4); `ecosystem-03` §the
  one fact.
- **Eval gate:** The agent says "yes, build it — at this ACV it's a deal-blocker," insists SCIM deprovisioning
  ships with SSO, and routes the implementation to badge while keeping the program/proof.

## S4 — A vendor prices SSO at a 9,900% markup and asks stamp to bless it

- **Situation:** Product wants to gate basic SSO behind a $2,000/mo "Enterprise" tier (a 9,900% jump from the
  $20 base — Railway's real number). Source: `ecosystem-02` §the egregious multipliers.
- **The trap:** Treating SSO as a premium feature to monetize. The "SSO tax" backlash is loud (sso.tax / SSO
  Wall of Shame, 200+ vendors named); CISOs call it "an atrocity," and 80% of SaaS apps lack SSO *because of
  licensing cost, not tech*. Putting your own product on the Wall of Shame is a brand + buyer-trust risk.
  Source: `ecosystem-02` §the case AGAINST; `ecosystem-14` DISPUTE 1.
- **Resolution:** **Don't gate basic SSO (Google/Microsoft/Okta OIDC) punitively** — it's a security control,
  not a feature. You MAY tier the genuinely-costly parts: **SCIM provisioning, legacy/custom-IdP onboarding,
  the hosted admin portal, audit-log export** (the Sketch/Annema "long-tail IdP is a real time sink" point is
  legitimate). Source: `ecosystem-02` §stamp's stance (1,2).
- **Eval gate:** The agent refuses to bless a punitive basic-SSO gate, cites the security-control framing, and
  offers the "tier the expensive parts, not the login" alternative.

## S5 — "We have logs" is presented as the audit trail and the auditor issues a finding

- **Situation:** A team points the auditor at their application logs (stdout → a log aggregator) as evidence
  for CC7. The auditor flags it. Source: `ecosystem-04` §why load-bearing.
- **The trap:** Believing "we have logs" == "we have an audit trail." Generic logs are mutable, not
  identity-attributed, often short-retention, and have gaps — none of which satisfies CC7/CC6. Source:
  `ecosystem-04` §why load-bearing; §2026 bar.
- **Resolution:** Build a real audit trail: **append-only + tamper-EVIDENT (hash-chained, signed) +
  identity-traceable + ≥1yr retention + real-time SIEM export.** The right shape is OTel-style spans, one per
  mutation, carrying `actor`/`target`/`before_hash`/`after_hash`/`trace_id`. **Tamper-evident beats
  tamper-resistant** — you must be able to *prove* the log wasn't altered. Source: `ecosystem-04` §2026 bar;
  §stance (1).
- **Eval gate:** The agent distinguishes "logs" from "audit trail," lists the 4 properties, and specifies
  hash-chaining + SIEM export — not "increase log retention."

## S6 — An autonomous agent took a privileged action; the auditor asks "who authorized it?"

- **Situation:** An Energy agent flipped a config / accessed a record in production. The CC6 reviewer asks for
  the accountable individual; the log shows only "agent did it" / a generic service account. Source:
  `ecosystem-04` §the agent-specific story (CC6).
- **The trap:** Treating the agent as the actor of record. Auditors treat **"no human request" as an
  accountability GAP** — "privileged actions [must] be attributable to an accountable individual, not to an
  autonomous agent or generic system account." This fails CC6. Source: `ecosystem-04` §CC6.
- **Resolution:** Every privileged agent action must log `(human_owner, agent_id, scopes, tenant, task_id)` —
  the audit-side mirror of badge's intersection rule (`agent_perms ∩ user_perms`). badge enforces the
  authority at the token; **stamp proves it in the log.** Tie every agent to an accountable human (the chairman
  / tenant owner). Source: `ecosystem-04` §CC6; §stance (2); `ecosystem-07` §the agent angle.
- **Eval gate:** The agent names the accountable-human-attribution requirement and the exact tuple, and links
  it to badge's intersection rule — not "add the agent to the actor list."

## S7 — The quarterly access review passed, but it only covered interactive humans

- **Situation:** The team runs a clean quarterly UAR of all human employees. An auditor (or a breach) later
  finds an over-privileged **service account / API key / agent identity** with orphaned grants. Source:
  `ecosystem-07` §why auditors flag most.
- **The trap:** The #1 access-review audit failure: **incomplete scope** — "skipping service accounts, API
  keys, and third-party access ... reviews should cover more than interactive users." For an agent fleet this
  is existential. Source: `ecosystem-07` §why auditors flag most; §the agent angle.
- **Resolution:** **Scope every UAR to non-human identities too** — service accounts, API keys, OAuth grants,
  vendor access, AND **every agent identity** — each with an accountable human owner, scoped permissions, and
  an expiry. **Derive the UAR inventory from badge's token scopes** (don't keep two lists). Cadence:
  quarterly general, **monthly/continuous for privileged + agents.** Source: `ecosystem-07` §the agent angle;
  §stance (1,2,5).
- **Eval gate:** The agent insists the UAR include service accounts + API keys + agent identities, sets
  monthly cadence for privileged/agents, and derives the inventory from token scopes.

## S8 — An auto-revoke broke production during an access review

- **Situation:** An automated access-review tool revoked a "stale-looking" grant; it was actually used by a
  nightly batch job. Prod broke. Source: `ecosystem-07` §automation-vs-human balance.
- **The trap:** Over-automation without human validation — "an automated revoke can break a business process if
  exceptions aren't surfaced and approved." And the auto-revoke is itself a CC6 change-management risk. Source:
  `ecosystem-07` §automation-vs-human balance.
- **Resolution:** **Agent proposes revokes; a human approves anything that could break a process.** Surface
  exceptions for review; gate irreversible revokes behind out-of-band approval — same read/draft/commit
  gradient badge enforces for agent-auth. Source: `ecosystem-07` §stance (4); `ecosystem-11` §10.4.
- **Eval gate:** The agent designs the review so it *proposes* revokes and a human approves — never auto-revokes
  privileged/uncertain grants.

## S9 — "We support EU data residency" — but the audit log + backups + the LLM call leaked to the US

- **Situation:** A team pins their primary Postgres to `eu-central-1` and tells a buyer "we support EU
  residency." A data-flow audit finds backups replicating cross-region, the OTel/SIEM pipeline shipping to a
  US region, the CDN caching globally, and the **LLM inference call** going to a US model endpoint. Source:
  `ecosystem-05` §the load-bearing gotcha.
- **The trap:** Pinning the DB is the easy 20%. "Residency is theater unless you pin the WHOLE pipeline." The
  audit log (it contains PII), the tax/billing-location data, and the LLM call are the ones everyone forgets.
  Source: `ecosystem-05` §the load-bearing gotcha; §stance (2).
- **Resolution:** Pin **DB + backups + logs/audit-trail + caches/CDN + every subprocessor + the LLM inference
  call (region + ZDR) + tax-location data.** Build **per-region cells** + **automated, continuously-asserted
  guardrails** ("no PII left region X"). Put the model provider on the **subprocessor list**. Source:
  `ecosystem-05` §2026 architecture pattern; §stance (2,4,5).
- **Eval gate:** The agent enumerates the full pipeline (not just the DB), explicitly flags the audit log + LLM
  call + tax data, and proposes an automated residency guardrail.

## S10 — The buyer said "EU residency" but actually needs "no US-government access" (sovereignty)

- **Situation:** A buyer asks "do you support EU data residency?" The team pins to an EU region and confirms.
  The deal still dies in security review. Source: `ecosystem-05` §why it matters.
- **The trap:** Conflating **residency** (WHERE data lives) with **sovereignty** (WHOSE law applies). A US
  company storing in `eu-central-1` is still reachable by the **US CLOUD Act** — the whole Schrems problem.
  Pinning the region does NOT solve sovereignty. Source: `ecosystem-05` §the distinction; §why it matters.
- **Resolution:** **ALWAYS ask "residency or sovereignty?" before answering.** If they need sovereignty, offer
  **BYOK / Customer-Managed Keys (CMK)** as the lever short of a full sovereign cloud / self-host (the customer
  holds the KMS key, controlling decryption). Source: `ecosystem-05` §stance (1,3).
- **Eval gate:** The agent clarifies residency-vs-sovereignty *before* answering, and reaches for BYOK/CMK when
  the answer is sovereignty.

## S11 — A GDPR erasure DSAR arrives; the clock is running and data is scattered across subprocessors

- **Situation:** A data subject files a GDPR Art. 15/17 request (access + erasure). The data lives in Postgres,
  the data warehouse, Sentry, the email tool, and the support desk. Source: `ecosystem-06` §DSARs;
  `ecosystem-05` §subprocessors.
- **The trap:** Missing the clock (**GDPR = 1 month, extendable to 3 if complex**) or missing data in a
  subprocessor (incomplete erasure = a violation). DSAR fulfillment is the recurring tax precisely because you
  must find ALL of a person's data everywhere, on the clock. Source: `ecosystem-06` §DSARs; §automation story.
- **Resolution:** **Automate the DSAR pipeline:** agent classifies the request → verifies identity (GDPR:
  reasonable measures; CCPA: match two data points) → decides what the law allows (erasure has exemptions:
  legal obligations, fraud, free-speech) → drafts the reply → routes the work across every system on the
  **subprocessor register**; a human signs anything legally consequential. Pattern: `tiffanycoyle/
  gdpr-dsr-operator`. Source: `ecosystem-06` §DSARs table; §automation story; §stance (2).
- **Eval gate:** The agent states the 1-month/3-month clock, checks the subprocessor list for completeness,
  applies erasure exemptions, and routes a human to sign — does NOT auto-erase blindly.

## S12 — The compliance program relies ONLY on the EU-US DPF, then a Schrems-III risk surfaces

- **Situation:** Counsel set up EU→US transfers solely under the EU-US Data Privacy Framework. A CJEU appeal to
  the DPF is announced. Source: `ecosystem-06` §DPF status.
- **The trap:** Betting on a single transfer mechanism. The DPF *survived* its first challenge (Latombe,
  2025-09-03) and ~3,400 US companies rely on it — but it's the **third** transatlantic framework after Safe
  Harbor and Privacy Shield, **both struck down by Schrems I/II**. A CJEU annulment would strand DPF-only
  companies. Source: `ecosystem-06` §DPF status.
- **Resolution:** **Keep SCCs + a Transfer Impact Assessment (TIA) as the backstop even under the DPF** —
  "a multi-layered data-transfer strategy ... robust TIAs as a critical safeguard." Use the DPF for
  convenience, never as the only leg. Source: `ecosystem-06` §DPF status; §stance (3); `ecosystem-14` DISPUTE 4.
- **Eval gate:** The agent keeps SCCs + TIAs in place alongside the DPF and explains the Schrems precedent —
  does NOT rely on the DPF alone.

## S13 — "We ran an AI red-team, we're covered for the SOC 2 pen-test" (the #1 agent-fleet trap)

- **Situation:** An agent-native company's reflex: run an autonomous/AI red-team + vulnerability scanner and
  present it to the auditor as the pen-test. Source: `ecosystem-08` §the anti-slop fact; `ecosystem-10`
  §Finding 5.
- **The trap:** **Auditors REJECT AI-only / scanner-only PTaaS.** They want **human-driven, adversarial
  testing** that finds business-logic flaws and chained exploits with risk context. Vuln scan ≠ pen test;
  scanners have high false +/- rates and "may face auditor rejection." Source: `ecosystem-08` §the anti-slop
  fact.
- **Resolution:** Get a **human-led pen-test annually (Cobalt-class PtaaS or equivalent), scoped to the SOC 2
  boundary, with retest evidence.** Layer CPTaaS (Sprocket/Equixly) for continuous coverage *between* audits —
  but **NEVER present AI-only testing as the SOC 2 pen-test.** Keep the shareable attestation letter for the
  Trust Center. Source: `ecosystem-08` §stance (1,5); `ecosystem-13` §4.
- **Eval gate:** The agent insists on a human-led pen-test for the report, positions CPTaaS as continuous-only,
  and explicitly refuses to claim AI-pentest coverage.

## S14 — The same 300-question SIG/CAIQ blocks every deal; security re-answers it from scratch each time

- **Situation:** Sales stalls on every enterprise deal while the security team manually answers the same
  SIG/CAIQ/VSA for the Nth time. Source: `ecosystem-08` §the pain.
- **The trap:** Treating each questionnaire as a one-off. It's the recurring sales tax — and a *wrong* answer
  is a misrepresentation to the customer (legal + trust risk). Source: `ecosystem-08` §Part 2; §limits of AI
  auto-answering.
- **Resolution:** **Stand up a Trust Center early** (public SOC2/ISO/pen-test/sub-processors + NDA-gated docs)
  to **deflect** inbound questionnaires; build an **answer-KB as versioned code** (`HailBytes/caiq-lite`
  CAIQ-as-code + WikiMem) — answer once, diff on renewal; **AI drafts mapped to the KB, a human SIGNS** every
  answer. The compounding asset is the accurate KB, not the generation. Source: `ecosystem-08` §the fix;
  §stance (2,3,4); `ecosystem-11` §highest-leverage surface.
- **Eval gate:** The agent proposes a Trust Center + a versioned answer-KB + AI-drafts-human-signs — not "I'll
  answer the 300 questions."

## S15 — SCIM provisioning drift left a departed employee with active access (ghost access)

- **Situation:** An employee was deleted in the customer's Okta, but a dropped/out-of-order SCIM event means
  they're still active in the app. A security review (or the customer's own audit) finds the ghost account.
  Source: `ecosystem-03` §what stamp owns (2).
- **The trap:** Two failures: (1) the mechanism (the SCIM pipe dropped/misordered events) — **that's badge's**;
  (2) the posture (no periodic reconciliation caught it) — **that's stamp's**. Confusing the two means nobody
  owns the right fix. Source: `ecosystem-03` §what stamp owns / does NOT touch.
- **Resolution:** stamp adds **IdP↔app reconciliation to the quarterly access review** ("verify deprovisioning
  actually fired," with timestamps) so drift/ghost-access is caught before an auditor or attacker. The
  *mechanism* fix (ordered Events API + signature validation) routes to **badge** — STOP at "the webhook is
  dropping events." Source: `ecosystem-03` §stance (2,3); §what stamp does NOT touch.
- **Eval gate:** The agent adds reconciliation to the UAR (posture) AND routes the dropped-event/signature fix
  to badge (mechanism) — does not try to fix the SCIM pipe itself.

## S16 — Picking a "neutral" Trust Center that turns out to be owned by a competitor (and a 4-year-dead OSS repo)

- **Situation:** A team picks **SafeBase** as a "vendor-neutral" Trust Center, and clones **`strongdm/comply`**
  (1,556★, top search result) as the OSS compliance framework to self-host. Source: `ecosystem-10` §Finding 4;
  `ecosystem-09` §the famous-but-DEAD one.
- **The trap:** (1) **SafeBase was acquired by Drata for $250M (2025-02-12)** — it's no longer neutral; if you
  also evaluate Drata's competitors, you're routing your trust data through a competitor's tool. (2)
  **`strongdm/comply` has been dead since 2022-07-21** — a 4-year-stale framework for a field that changes
  quarterly (SOC 2 TSC revisions, ISO 27001:2022). **Star count ≠ current.** Source: `ecosystem-10`
  §Finding 4; §distilled rule 7; `ecosystem-09` §famous-but-DEAD.
- **Resolution:** **Verify vendor independence before betting on a "neutral" tool** (SafeBase→Drata, Auth0→
  Okta — the consolidation pattern repeats). For OSS, **check `pushed_at` / active maintenance, not stars** —
  use `trycompai/comp` (pushed daily) or `theopenlane/core`, not `strongdm/comply`. Source: `ecosystem-10`
  §distilled rule 1,7; `ecosystem-09` Tier 1.
- **Eval gate:** The agent flags SafeBase→Drata ownership and rejects `strongdm/comply` on staleness (checking
  last-commit), recommending an actively-maintained alternative.

---

## Coverage map (which JTBD each scenario stresses — for Wave-S eval selection)

| Scenario | Primary JTBD | What it proves |
|---|---|---|
| S1 | JTBD-10 (agent operator) | Vanta token-revocation + opaque-error operator hygiene |
| S2 | JTBD-1 (audit) | vet the auditor, not the platform |
| S3 | JTBD-8 (SSO program) | $200k ACV deal-blocker + ship SCIM with SSO + hand mechanism to badge |
| S4 | JTBD-8 (SSO program) | don't gate basic SSO punitively (SSO tax) |
| S5 | JTBD-4 (audit log) | logs ≠ audit trail; tamper-evident |
| S6 | JTBD-4 (audit log) | accountable-human attribution for agent actions (CC6) |
| S7 | JTBD-3 (access review) | scope UAR to non-human + agent identities |
| S8 | JTBD-3 (access review) | agent proposes, human approves revokes |
| S9 | JTBD-5 (residency) | whole-pipeline pinning incl. audit log + LLM + tax data |
| S10 | JTBD-5 (residency) | residency vs sovereignty; BYOK lever |
| S11 | JTBD-6 (privacy) | DSAR clock + subprocessor completeness + exemptions |
| S12 | JTBD-6 (privacy) | keep SCCs+TIA under the DPF (Schrems risk) |
| S13 | JTBD-7 (pentest) | auditors reject AI-only pentest |
| S14 | JTBD-7 (questionnaire) | Trust Center + versioned answer-KB + AI-drafts-human-signs |
| S15 | JTBD-9 (SCIM posture) | reconciliation (stamp) vs pipe fix (badge) |
| S16 | JTBD-2 / JTBD-11 | verify vendor independence + stars ≠ current |
