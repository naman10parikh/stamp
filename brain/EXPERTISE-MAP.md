---
title: "stamp EXPERTISE-MAP — what the Compliance / enterprise-readiness employee must master"
type: synthesis
domain: compliance
created: 2026-06-17
updated: 2026-06-17
tags: [expertise-map, compliance, soc2, iso27001, gdpr, sso-program, audit-log, residency, jtbd, stamp, cp123]
sources: ["brain/research/raw/ecosystem-00-INDEX-and-boundary.md", "brain/research/raw/ecosystem-01-soc2-iso-automation.md", "brain/research/raw/ecosystem-02-enterprise-sso-program.md", "brain/research/raw/ecosystem-03-scim-provisioning-posture.md", "brain/research/raw/ecosystem-04-audit-logging.md", "brain/research/raw/ecosystem-05-data-residency.md", "brain/research/raw/ecosystem-06-gdpr-ccpa-dpa.md", "brain/research/raw/ecosystem-07-access-reviews-rbac.md", "brain/research/raw/ecosystem-08-pentest-questionnaires.md", "brain/research/raw/ecosystem-11-agent-operator-notes.md"]
related: ["[[stamp BATTLE-TESTED-SCENARIOS]]", "[[stamp KNOWN-PITFALLS]]", "[[stamp OPINIONS]]", "[[stamp GAPS-AND-DISPUTES]]", "[[stamp TOOL-MATRIX]]"]
summary: "The structured map of everything the Compliance / SSO-program / enterprise-readiness employee must master, organized by job-to-be-done (not by tool/vendor), each node cited to a raw source. A fresh Claude session reading brain/ should be able to route any compliance task and know what 'good' looks like."
---

# stamp EXPERTISE-MAP

> Organized by **job-to-be-done**, not by vendor. A fresh Claude session reading `brain/` should be able to
> route any compliance / enterprise-readiness task to the right node and know what "good" looks like. Every
> node cites its raw source. Companion files: scenarios → [[stamp BATTLE-TESTED-SCENARIOS]]; gotchas →
> [[stamp KNOWN-PITFALLS]]; taste → [[stamp OPINIONS]]; unknowns → [[stamp GAPS-AND-DISPUTES]]; tools →
> [[stamp TOOL-MATRIX]].

## The boundary stamp holds first (mechanism vs governance) — place EVERY task here before doing anything

The whole compliance/enterprise space splits into **mechanism** (the code that makes auth/logging/provisioning
work) and **governance/evidence** (the posture that proves it to an auditor or a buyer). **badge owns the
mechanism; stamp owns the governance/evidence.** They are complementary and a B2B deal needs both.
Source: `ecosystem-00-INDEX-and-boundary.md` §THE BOUNDARY.

- **Route to badge** when the task is: *get the SAML working · validate the SCIM webhook signature · fix
  event ordering · pick the auth provider on $ breakpoints · implement MCP OAuth (PKCE/RFC 8707/CIMD/DCR) ·
  reason about the agent-identity P1–P4 router · the auth-CVE class.* Source: `ecosystem-00` §What badge owns.
- **Keep in stamp** when the task is: *pass the SOC 2 / ISO 27001 audit · answer the security questionnaire ·
  set up access reviews · prove data residency · handle a DSAR · decide if we even need SSO to close this
  deal · prove deprovisioning fired to an auditor.* Source: `ecosystem-00` §What stamp owns.
- **The one-line handoff rule (memorize):** "badge = the connection; stamp = the program that decides we need
  it and proves it to the auditor." The shared seam (enterprise SSO) splits exactly there. Source: `ecosystem-00`
  §one-line handoff rule.
- **Energy home:** of the 7 enterprise trust primitives (`the_complete_story.md` L222), stamp is the **owner of
  `compliance`**, **co-owner of `audit`** (with sentry/observability) and **co-owner of `residency`** (with
  rocket/infra). Trust/safety is a FOLD across the fleet — **stamp IS its home.** Source: `ecosystem-00`
  §Energy trust-envelope anchor.

---

## JTBD-1 — "Pass our first SOC 2 / ISO 27001 / HIPAA audit (the posture job)"

The bread-and-butter. The job: assemble continuous evidence, map it to controls, not fail the controls
auditors actually fail you on, and get an independent attestation — without 6 months of manual screenshots.

- **1.1 Know what a GRC platform actually does (4 things):** (1) **integrate + pull evidence** continuously
  from cloud/IdP/HR/ticketing; (2) **map** evidence to a framework's controls (SOC 2 TSC / ISO 27001 Annex A /
  HIPAA); (3) **monitor** and surface failing tests for remediation; (4) **package** for the auditor + run a
  Trust Center. Source: `ecosystem-01` §mental model.
- **1.2 The platform does NOT issue the attestation.** An independent **CPA firm** (SOC 2) or **accredited
  certification body** (ISO 27001) still signs. "80–90% of controls monitored automatically" is the realistic
  ceiling; the rest is human attestation (policies, access reviews, pen-test). NEVER claim "we're compliant" —
  claim "audit-ready evidence assembled." Source: `ecosystem-01` §mental model; `ecosystem-11` §what an agent
  cannot do.
- **1.3 SOC 2 is design-your-own-controls, not a fixed checklist.** You select controls to meet the Trust
  Services Criteria (TSC). The **CC6.x (logical access)** and **CC7.x (monitoring)** families are where the
  load-bearing evidence lives (see JTBD-3, JTBD-4). Source: `ecosystem-04` §why this is THE load-bearing
  control.
- **1.4 The controls auditors fail you on most are access reviews + audit logging + change management.** They
  rot because they're manual and periodic. Put stamp's judgment HERE, not into re-implementing the platform
  CRUD. Source: `ecosystem-07` §why auditors flag most; `ecosystem-04` §load-bearing.
- **1.5 New 2026 frameworks to know:** **ISO 42001** (AI management system — the new must-have for any company
  shipping AI; cross-maps to ISO 27001); **FedRAMP 20x + OSCAL** (machine-readable gov exports); **CMMC L2**
  (defense-adjacent). All three incumbents offer ISO 42001; Vanta/Secureframe ship OSCAL; Secureframe is
  deepest on CMMC. Source: `ecosystem-01` §what's genuinely new; `ecosystem-12` §cross-cutting framework deltas.
- **1.6 Vet the auditor, not just the platform.** "There are and basically always have been auditors that will
  sign off on anything" — a cheap "we book the audit" bundle can mean a rubber-stamp CPA, which makes the whole
  report worthless. Source: `ecosystem-10` §Finding 1. (Stance + scenario: [[stamp OPINIONS]] O3; [[stamp
  BATTLE-TESTED-SCENARIOS]] S2.)

## JTBD-2 — "Pick a GRC platform (or build/OSS it)"

The selection job. stamp produces a **decision with the honest cost**, not a feature table. Full matrix in
[[stamp TOOL-MATRIX]].

- **2.1 Default to Vanta** for an Energy-built B2B SaaS doing its first SOC 2 — widest integrations (300+),
  largest auditor network, maturest AI agents, and it ships an **MCP server** stamp can drive. Source:
  `ecosystem-01` §honest take (1); `ecosystem-13` §1.
- **2.2 Drata** if the company is infra/DevOps-heavy (deepest IaC posture, 1,000+ infra tests) or you want the
  **SafeBase** Trust Center it now owns. **Secureframe** if the founder wants advisory hand-holding or needs
  **CMMC/federal** depth. **Sprinto** only sub-30 people on a hard budget (smaller integrations → more manual
  evidence). Source: `ecosystem-01` §honest take (1); `ecosystem-13` §1.
- **2.3 BUY for a real company; the platform is commoditized but the moat is not.** "Shasta in 8.5 days" (an
  OSS Delve clone built with Claude Code) + `trycompai/comp` (1,636★) prove the CRUD is cloneable. The durable
  value is the **auditor network + maintained integrations + the answer-KB**. Source: `ecosystem-01` §honest
  take (2,3); `ecosystem-10` §Finding 1; `ecosystem-09` Tier 1.
- **2.4 OSS (`trycompai/comp`) only if you HAVE a compliance engineer and want no lock-in / data-sovereignty.**
  "Free" hides real ops cost — self-hosting is hard (comp #1705) and you get no auditor network. Same logic as
  badge's "don't roll your own federation." Source: `ecosystem-01` §buy-vs-build; `ecosystem-10` §Finding 3.
- **2.5 The selection criterion average teams skip: integration breadth + auditor-network size.** That's what
  makes Vanta worth $20K; it's exactly what the OSS clones can't match (theopenlane's #1 open ask is "expand
  integrations"). Source: `ecosystem-10` §Finding 3; `ecosystem-01` §integration breadth.

## JTBD-3 — "Pass the access-review / least-privilege control (CC6) — the attestation, not the enforcement"

The control auditors flag MOST. **Boundary: badge ENFORCES RBAC (the token, the intersection rule); stamp
REVIEWS it (the periodic UAR an auditor reads).** Same RBAC, two jobs. Source: `ecosystem-07` §boundary.

- **3.1 Cadence is risk-based:** privileged/admin/cloud-root → **monthly or continuous**; general users → **at
  least quarterly**; ad-hoc on role change / M&A / new-system onboarding. Source: `ecosystem-07` §2026 bar.
- **3.2 Evidence auditors demand (immutable artifacts):** (1) attestation logs with **timestamps showing who
  reviewed what and when**; (2) **reviewer comments explaining the business/technical reason** access was kept;
  (3) remediation items with owners + completion dates; (4) provisioning/deprovisioning records mapped to role
  definitions. Source: `ecosystem-07` §2026 bar.
- **3.3 Scope MUST include non-human identities** — service accounts, API keys, OAuth grants, third-party/vendor
  access, AND **every agent identity**. Reviewing only interactive humans is the #1 audit failure. This is
  existential for an agent fleet. Source: `ecosystem-07` §why auditors flag most; §the agent angle.
- **3.4 The UAR inventory == the RBAC scope inventory — derive it from badge's token scopes, don't keep two
  lists.** badge guarantees the agent can't exceed `agent_perms ∩ user_perms` at the token; stamp's quarterly
  UAR *attests* it's true and no agent accumulated orphaned grants. Build them together. Source: `ecosystem-07`
  §the agent angle; §stance (5).
- **3.5 Agent proposes revokes, human approves.** "An automated revoke can break a business process if
  exceptions aren't surfaced and approved" — auto-revoke without a gate is itself a CC6 change-management risk.
  Same read/draft/commit gradient as everywhere. Source: `ecosystem-07` §automation-vs-human balance.
- **3.6 Failure modes that create audit exceptions:** incomplete scope (skipping service accounts),
  delayed remediation, missing documentation, **orphaned/dormant accounts**, **privilege creep**. Source:
  `ecosystem-07` §why auditors flag most.

## JTBD-4 — "Make the audit trail a real control (CC7/CC6), not just 'we have logs'"

The single most load-bearing SOC 2 control and the easiest to fake badly. **Boundary: badge logs auth events
as a mechanism; stamp owns the audit trail as the immutable, retained, SIEM-exported CONTROL.** Source:
`ecosystem-04` §boundary.

- **4.1 The 2026 bar = append-only + tamper-EVIDENT + identity-traceable + ≥1yr retention + SIEM export.**
  "We have logs" ≠ "we have an audit trail." The four things the auditor cares about: tamper-evidence,
  identity attribution, retention, completeness (no gaps in the chain). Source: `ecosystem-04` §why load-bearing;
  §2026 bar.
- **4.2 The right shape (Energy standard):** an append-only audit trail of **OpenTelemetry-shaped spans**, one
  span per mutation, each carrying `actor`, `target`, `before_hash`/`after_hash` (content-addressed, Git-style),
  and a `trace_id`; writes are signed, appends-only, exported in real time to the customer's SIEM. Build the
  trail as OTel from day one. Source: `ecosystem-04` §2026 bar (1); §stance (1).
- **4.3 Tamper-EVIDENT beats tamper-resistant.** Hash-chained signed spans let you *prove* integrity, not just
  claim it — the difference between passing CC7 and getting a finding. Source: `ecosystem-04` §stance (1).
- **4.4 Attribute EVERY agent action to an accountable human.** Auditors treat **"no human request" as a CC6
  accountability GAP**: privileged actions must be attributable to an accountable individual, NOT to an
  autonomous agent or generic system account. The log must carry `(human_owner, agent_id, scopes, tenant,
  task_id)` — the audit-side mirror of badge's intersection rule. Source: `ecosystem-04` §the agent-specific
  story (CC6).
- **4.5 Ephemeral resources create log-chain gaps (CC7).** Auto-scaling / ephemeral E2B sandboxes must emit to
  a durable, centralized, identity-traceable trail BEFORE they die. (Energy rule: never `2>/dev/null` in
  sandbox commands — masks errors.) Source: `ecosystem-04` §the agent-specific story (CC7).
- **4.6 AI threshold-promotions need the same change-management artifacts as a human change ticket (CC8)** —
  eval scores, before/after hash, approval. AutoLab's nightly mutations satisfy both the RSI need and CC8
  evidence. Build once, satisfy both. Source: `ecosystem-04` §the agent-specific story (CC8); §stance (5).
- **4.7 Export to the customer's SIEM in real time (Splunk/Datadog/Sentinel/New Relic) — non-negotiable
  enterprise demand.** Don't make them poll an API. Source: `ecosystem-04` §2026 bar (4); §stance (3).
- **4.8 Evidence storage hygiene: flag expired evidence, don't auto-archive it.** Stale evidence is an audit
  finding; store with provenance + completion dates + review intervals (Secureframe's 2026 pattern). Source:
  `ecosystem-04` §2026 bar (5); §stance (4).

## JTBD-5 — "Prove data residency (and know when the buyer actually means sovereignty)"

stamp owns the posture (what we promise + how we prove it); rocket/infra owns the regional cells. Source:
`ecosystem-05` §intro.

- **5.1 Hold the three-way distinction.** **Residency** = WHERE data physically lives. **Sovereignty** = WHO has
  authority / WHOSE law applies (a US company storing in `eu-central-1` is still reachable by the US CLOUD Act —
  the whole Schrems problem). **Privacy** = the GDPR/CCPA rights layer (JTBD-6). Source: `ecosystem-05` §the
  distinction.
- **5.2 ALWAYS ask "residency or sovereignty?" before answering a buyer.** They're different promises with very
  different costs: region-pin = cheap; sovereignty/no-US-access = sovereign cloud or self-host + BYOK. Source:
  `ecosystem-05` §why it matters; §stance (1).
- **5.3 Residency is whole-pipeline or it's a lie.** Pinning the primary DB is the easy 20%. You must ALSO pin
  **backups + logs/audit-trail + caches/CDN edge + every subprocessor + the LLM inference call + the
  tax/billing-location data.** The audit log (it contains PII) and tax-location data are the two everyone
  forgets. Source: `ecosystem-05` §the load-bearing gotcha; §stance (2).
- **5.4 Offer BYOK / Customer-Managed Keys (CMK) as the sovereignty lever** before promising a full sovereign
  cloud — the customer holds the KMS key, controlling decryption even though data resides in your cloud. The
  standard enterprise ask above plain residency. Source: `ecosystem-05` §2026 architecture pattern; §stance (3).
- **5.5 Build per-region cells + automated, continuously-asserted residency guardrails** (a stamp agent that
  asserts "no PII left region X") — not a one-time architecture claim. That's how it survives an audit and where
  an agent adds value. Source: `ecosystem-05` §2026 architecture pattern; §stance (4).
- **5.6 Region-specific law to know:** EU → SCCs or EU-US DPF for transfers; **China (CSL/PIPL)** → in-country
  storage for CII operators + export security assessment; **India (DPDP)** → penalties up to **$30M** (Energy
  India footprint); US → contractual not statutory except sectoral (HIPAA/FedRAMP). Source: `ecosystem-05`
  §region-specific.
- **5.7 The model provider is in residency scope for an AI-native company.** Pin the Anthropic/OpenAI region +
  enable **ZDR (zero-data-retention)**; put it on the subprocessor list. Source: `ecosystem-05` §the load-bearing
  gotcha (LLM); §stance (5).

## JTBD-6 — "Handle GDPR / CCPA-CPRA / DPAs / SCCs / DSARs (the privacy-law job)"

Zero auth overlap with badge — pure legal+process posture. Source: `ecosystem-06` §intro.

- **6.1 Build GDPR-aligned everywhere — it's the cheapest strategy.** GDPR is the strictest comprehensive
  regime, so a GDPR posture mostly covers CCPA/CPRA + the ~19-20-state US patchwork. Don't build per-state
  pipelines or gold-plate per-jurisdiction. Source: `ecosystem-06` §the mental model; §stance (1).
- **6.2 Know the structural difference: GDPR is opt-IN (consent/lawful basis); CCPA/CPRA is opt-OUT
  (sale/sharing).** This changes your consent UX. Source: `ecosystem-06` §the mental model.
- **6.3 DSAR clocks (memorize):** **GDPR = 1 month, extendable to 3** if complex; **CCPA/CPRA = 45 days,
  extendable to 90.** Verification: GDPR "reasonable measures, avoid demanding ID"; CCPA "match two data points
  to records." Source: `ecosystem-06` §DSARs table.
- **6.4 Automate DSAR fulfillment (the recurring tax) — agent classifies → verifies identity → decides what the
  law allows → drafts the reply → routes; a human signs anything legally consequential.** The pattern is
  `tiffanycoyle/gdpr-dsr-operator` (the single closest public artifact to what stamp IS). Source: `ecosystem-06`
  §automation story; §stance (2); `ecosystem-09` Tier 2 (4).
- **6.5 The contract layer enterprises demand: DPA (Art. 28, signed before they buy) + sub-processor list +
  SCCs.** stamp drafts/tracks; legal signs. Source: `ecosystem-06` §DPAs/SCCs/sub-processors.
- **6.6 Keep SCCs + a Transfer Impact Assessment (TIA) even under the EU-US DPF.** The DPF survived its first
  challenge (Latombe, 2025-09-03) but a CJEU appeal is anticipated; Safe Harbor and Privacy Shield both fell to
  Schrems I/II. Don't be the company caught with only the DPF if it's annulled. Source: `ecosystem-06` §DPF
  status; §stance (3).
- **6.7 Maintain ONE register that is simultaneously the sub-processor list + the residency map + the DPA
  tracker.** Three views, one source — same consolidation discipline Energy uses for docs. Source: `ecosystem-06`
  §stance (4); cross-ref JTBD-5.
- **6.8 Honor Global Privacy Control / opt-out signals by default** — lowest-effort way to satisfy the strictest
  US states. Source: `ecosystem-06` §stance (5).
- **6.9 Enforcement is real (the number that makes founders care): >€7.1B cumulative GDPR fines, €1.2B in 2025;
  tiers up to €20M or 4% of worldwide revenue.** Source: `ecosystem-06` §enforcement.
- **6.10 The AI overlay: EU AI Act layers on top of GDPR (risk tiers, transparency, prohibited practices) +
  data-lineage-for-training/inference is now an audit expectation.** Cross-ref ISO 42001 (JTBD-1.5). Deep
  EU-AI-Act research is a GAP. Source: `ecosystem-06` §the AI-specific overlay.

## JTBD-7 — "Survive the security questionnaire + pen-test taxes (sales-security ops)"

Two recurring enterprise taxes that show up in every deal and recur on every renewal. Pure sales-security ops,
no auth overlap. Source: `ecosystem-08` §intro.

- **7.1 SOC 2 doesn't STRICTLY require a pen-test, but every auditor + every enterprise questionnaire expects
  one — annually, scoped to the SOC 2 boundary, with evidence of RETESTING (the remediation-proof loop).**
  Source: `ecosystem-08` §Part 1.
- **7.2 ⚠️ AUDITORS REJECT AI-only / scanner-only PTaaS.** They want **human-driven, adversarial testing**
  (business-logic flaws, chained exploits, risk context). Vuln scan ≠ pen test. **NEVER let a stamp agent claim
  "we ran an AI pentest, we're covered"** — that's a rejected control and the #1 anti-slop trap for an agent
  fleet. Source: `ecosystem-08` §the anti-slop fact; `ecosystem-10` §Finding 5.
- **7.3 Pen-test tooling: human-led PtaaS (Cobalt-class) for the SOC 2 report; layer CPTaaS (Sprocket/Equixly)
  for continuous coverage between audits; Synack for gov/high-assurance.** The bundled-audit insurgents
  (Oneleet) include the pen-test — attractive for a first SOC 2. Source: `ecosystem-08` §the PTaaS landscape.
- **7.4 Keep the shareable pen-test attestation letter** (1-2 page exec summary the firm signs, no exploit
  detail) as a Trust Center artifact — questionnaires routinely ask for it. Source: `ecosystem-08` §attestation
  letter.
- **7.5 Know the questionnaire formats by name: SIG / SIG Lite (Shared Assessments), CAIQ / CAIQ-Lite (CSA,
  cloud-focused), VSA (Vendor Security Alliance), + every enterprise's bespoke 200-400-question sheet.** Source:
  `ecosystem-08` §the formats.
- **7.6 The fix for the questionnaire tax: a Trust Center (public SOC2/ISO/pen-test/sub-processors + NDA-gated
  docs) that DEFLECTS inbound + an answer-KB + AI drafting mapped to the KB.** Stand it up early — it's the
  artifact a CISO checks first. Source: `ecosystem-08` §the pain + the fix; §Trust Center tools.
- **7.7 Own the answer-KB as versioned code (`HailBytes/caiq-lite` CAIQ-as-code + WikiMem) — answer once, diff
  on renewal. That is the compounding asset, not the generation.** Source: `ecosystem-08` §stance (3);
  `ecosystem-11` §highest-leverage agent surface.
- **7.8 AI drafts, human SIGNS every questionnaire answer + every control attestation.** A wrong answer is a
  *misrepresentation to a customer* (legal + trust risk). Source: `ecosystem-08` §limits of AI auto-answering;
  §stance (4).

## JTBD-8 — "Run the enterprise-SSO PROGRAM (decide we need it, price it sanely, prove it)"

stamp owns the program (the buyer-readiness wrapper); **badge owns the SAML/OIDC + SCIM mechanism.** When the
task becomes "make the SAML work," hand to badge. Source: `ecosystem-02` §boundary.

- **8.1 The program triggers at ~$200k ACV (badge's number).** Below it, SSO is "nice"; at/above it, SSO+SCIM
  are **deal-blockers**, and SCIM **deprovisioning** is the single most-tested questionnaire item. Source:
  `ecosystem-02` §stance (3); `ecosystem-03` §the one fact.
- **8.2 The "SSO tax" stance: SSO is a security control, not a feature — DON'T gate basic SSO punitively.**
  Offer basic SSO (Google/Microsoft/Okta OIDC) on a reasonable tier; putting your own product on the SSO Wall
  of Shame is a brand risk. You MAY tier the genuinely-costly parts (SCIM, legacy-IdP onboarding, admin portal,
  audit-log export). Source: `ecosystem-02` §stamp's stance (1,2).
- **8.3 The buyer-readiness checklist (stamp's deliverable) — what a CISO demands before signing:** SAML 2.0 +
  OIDC (badge) · SCIM provisioning **+ deprovisioning** (badge mech / stamp #1 questionnaire item) · IT-admin
  self-serve portal (WorkOS Admin Portal is the reference) · audit logs to their SIEM (stamp, JTBD-4) · RBAC
  scoped to enterprise groups (badge enforce / stamp attest) · data residency (stamp, JTBD-5) · SOC2/ISO report
  on demand (stamp, JTBD-1) · completed SIG/CAIQ (stamp, JTBD-7) · signed DPA + sub-processor list (stamp,
  JTBD-6) · pen-test letter (stamp, JTBD-7). Source: `ecosystem-02` §buyer-readiness checklist.
- **8.4 The reference for "what a 10,000-seat buyer demands" is Anthropic Cowork Enterprise (GA 2026-04-09):**
  SCIM auto-provisioning from Okta/Azure AD/Google Workspace, RBAC per-group, Group Spend Limits, OTel export to
  Splunk/Datadog/New Relic, Per-Tool Connector Controls, Analytics API. Source: `ecosystem-02` §Anthropic
  reference (quoting `the_complete_story.md` L222).
- **8.5 Sequence:** decide-need (stamp) → price-sanely (stamp) → implement SAML/OIDC+SCIM (**badge**) → prove
  via Trust Center + questionnaire (stamp). stamp does NOT pick the provider on $ breakpoints — that's badge's
  job. Source: `ecosystem-02` §stance (4); §who delivers the mechanism.

## JTBD-9 — "Hold the SCIM-deprovisioning + provisioning-drift POSTURE (defer the code to badge)"

Deliberately narrow. badge owns SCIM end-to-end as a mechanism; stamp owns ONLY the posture/attestation on top.
Source: `ecosystem-03` §boundary.

- **9.1 Deprovisioning is the load-bearing questionnaire item — prove it in the Trust Center + make the access
  review include "verify deprovisioning actually fired" with timestamps.** A departing employee who keeps access
  = failed review = lost deal. Source: `ecosystem-03` §the one fact; §what stamp owns (1).
- **9.2 Add IdP↔app reconciliation to the quarterly review to catch SCIM drift / ghost access** (a user deleted
  in the IdP but still active in the app, from dropped/out-of-order events) before an auditor or attacker does.
  The *fix* (ordered Events API, signature validation) is badge's; the *posture control* ("we periodically
  reconcile and attest no drift") is stamp's — literally an access-review line item. Source: `ecosystem-03`
  §what stamp owns (2); §stance (2).
- **9.3 STOP and route to badge** the moment the task becomes "the SCIM webhook is dropping events" or "validate
  the signature." That's mechanism, not posture. Source: `ecosystem-03` §what stamp does NOT touch; §stance (3).

## JTBD-10 — "Operate all of this as an AGENT (headless), and know where a human must still sign"

stamp is an agent employee, not a human GRC analyst. Source: `ecosystem-11` §intro.

- **10.1 Discover capability via MCP first, API second.** **Vanta ships an MCP server** (`mcp.vanta.com/mcp` —
  "find failing tests, remediate, act on compliance data") + an official REST API (`api.vanta.com`, OAuth) +
  an **AI Skills CLI** (`npx skills add https://developer.vanta.com`). **Drata ships an experimental,
  region-split, role-scoped MCP** (US `mcp.drata.com` / EU `mcp-euc1.drata.com` / APAC `mcp-apse2.drata.com`).
  **Secureframe is API-only** (no MCP found). Source: `ecosystem-11` §the headline; §Secureframe.
- **10.2 Operator hygiene: mention the vendor by name in prompts** (Drata's explicit best practice; routes to
  MCP tools vs built-in knowledge), be specific (framework/time-range/team), use natural language. Source:
  `ecosystem-11` §Drata best practices.
- **10.3 Scope tokens tightly + DON'T share creds across concurrent agents.** Vanta revokes the previous token
  when you request a new one with the same `client_id` — parallel runs will fight; serialize token issuance per
  client_id. OAuth endpoint rate limit: 5 req/min shared. Source: `ecosystem-11` §Vanta REST API;
  `ecosystem-10` §Finding 2.
- **10.4 What an agent CANNOT do headlessly:** make an auditor sign · attest to manual controls (access reviews,
  policy ack, background checks, training) · sign DPAs/SCCs/BAAs · approve irreversible remediations without a
  gate (flipping an S3 bucket, disabling a user). Source: `ecosystem-11` §what an agent cannot do.
- **10.5 The headless recipe:** pull failing tests → propose remediation → **gate irreversible actions behind a
  human** (read/draft/commit) → maintain the questionnaire KB as code, diff each renewal → **never claim
  "compliant," only "audit-ready evidence assembled."** Source: `ecosystem-11` §agent operator playbook.
- **10.6 The highest-leverage agent surface is the questionnaire-answerer** (the recurring tax). Own the
  company's answered-questionnaire corpus as a versioned KB. Source: `ecosystem-11` §highest-leverage surface;
  cross-ref JTBD-7.7.

## JTBD-11 — "Know the canonical reference repos (what to clone/read, what's dead)"

The artifacts a stamp agent reads to become dangerous, with the staleness caveats. Source: `ecosystem-09`.

- **11.1 The OSS Vanta = `trycompai/comp`** (1,636★, TS, pushed daily, 8 frameworks) — the reference data-model
  + integration-pull + control-mapping architecture. Read this, not a marketing page, to understand the
  category. Source: `ecosystem-09` Tier 1 (1).
- **11.2 The best-architected OSS engine = `theopenlane/core`** (261★, Go, multi-framework). Reference for
  control-model + evidence-graph design in a typed language. Source: `ecosystem-09` Tier 1 (2).
- **11.3 The closest public artifact to what stamp IS = `tiffanycoyle/gdpr-dsr-operator`** (folder-based Claude
  DSAR operator) + `kriss-b/llm-iso27001` (LLM-maintained ISMS). Read these as the agent-native pattern. Source:
  `ecosystem-09` Tier 2 (4,5).
- **11.4 Questionnaire-as-code primitive = `HailBytes/caiq-lite`** (author/validate/diff CAIQ responses as
  code) — exactly the "answer once, diff on renewal" idea. Source: `ecosystem-09` Tier 1 (3).
- **11.5 Audit-trail primitives = `DavidLiedle/DriftDB`** (Rust append-only + time-travel) + `mishrasanjeev/
  grantex` / `CJHodgson/Agentic-Governance-Spec` (immutable audit trails for AGENT actions — quote for the
  trail shape only; identity inside is badge's turf). Source: `ecosystem-09` Tier 4; `ecosystem-04` §tooling.
- **11.6 ⚠️ Do NOT recommend `strongdm/comply` (1,556★) — it's DEAD since 2022-07-21.** Most-starred OSS
  compliance framework, tops search results, but unmaintained for a field that changes quarterly. **Star count ≠
  current.** Source: `ecosystem-09` §the famous-but-DEAD one. (Stance: [[stamp OPINIONS]] O14.)

---

## How to use this map (the routing reflex)

1. **Place the task on the mechanism↔governance boundary first** (the top section). If it's mechanism, hand to
   badge and stop.
2. **Route to a JTBD node**, read its sub-points, and check [[stamp KNOWN-PITFALLS]] for the version-specific
   gotcha before acting.
3. **For any "should we / which tool" question, produce a decision with the honest cost** ([[stamp TOOL-MATRIX]]
   + [[stamp OPINIONS]]) — never a feature checkbox.
4. **For any attestation, draft as the agent and route a human to sign** (JTBD-10.4/10.5). Never claim
   "compliant."
5. **When sources disagree, read [[stamp GAPS-AND-DISPUTES]]** for the resolved stance + the open question.
