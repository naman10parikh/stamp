---
title: "stamp OPINIONS — the taste layer (always X / never Y, because Z)"
type: synthesis
domain: compliance
created: 2026-06-17
updated: 2026-06-17
tags: [opinions, taste, anti-slop, compliance, soc2, gdpr, sso-program, audit-log, residency, stamp, cp123]
sources: ["brain/research/raw/ecosystem-01-soc2-iso-automation.md", "brain/research/raw/ecosystem-02-enterprise-sso-program.md", "brain/research/raw/ecosystem-04-audit-logging.md", "brain/research/raw/ecosystem-05-data-residency.md", "brain/research/raw/ecosystem-06-gdpr-ccpa-dpa.md", "brain/research/raw/ecosystem-07-access-reviews-rbac.md", "brain/research/raw/ecosystem-08-pentest-questionnaires.md", "brain/research/raw/ecosystem-09-starter-repos.md", "brain/research/raw/ecosystem-10-github-issues-breakage.md", "brain/research/raw/ecosystem-11-agent-operator-notes.md", "brain/research/raw/ecosystem-13-tradeoff-matrix.md"]
related: ["[[stamp EXPERTISE-MAP]]", "[[stamp KNOWN-PITFALLS]]", "[[stamp BATTLE-TESTED-SCENARIOS]]", "[[stamp GAPS-AND-DISPUTES]]"]
summary: "Explicit, defensible taste stances — what stamp ALWAYS does and NEVER does, each with a reason and a source. The anti-slop layer that makes stamp opinionated, not a Wikipedia summary. Where a stance is contested, it's flagged and the dispute lives in GAPS-AND-DISPUTES."
---

# stamp OPINIONS

> These are stances, not summaries. Each is "**ALWAYS / NEVER X — because Z**" with a source. stamp holds
> these by default and will defend them; where a stance is contested, it's flagged and the dispute lives in
> [[stamp GAPS-AND-DISPUTES]]. Taste is what separates a domain expert from a search engine.

---

## On the boundary (the first thing stamp gets right)

**O1. ALWAYS place a task on the mechanism↔governance line before doing anything; NEVER blur "auth vs
compliance."**
Because the real split is **mechanism (badge) vs governance/evidence (stamp)**, not auth-vs-compliance — and
a B2B deal needs both. "badge = the connection; stamp = the program that decides we need it and proves it to
the auditor." Mis-placing the task is the #1 time-waster. Source: `ecosystem-00` §THE BOUNDARY; §one-line
handoff rule.

**O2. ALWAYS hand the SAML/SCIM/MCP-OAuth *code* to badge; NEVER re-research or re-implement the mechanism.**
Because badge owns it end-to-end (signature validation, event ordering, the 7-step SAML triage runbook, the
P1–P4 router) — duplicating it creates two sources of truth and violates the boundary. stamp keeps the
*posture*: the SSO *program* decision, the deprovisioning *proof*, the access-review *attestation*. Source:
`ecosystem-00` §What badge owns; `ecosystem-03` §what stamp does NOT touch.

## On the platform & the moat

**O3. ALWAYS vet the AUDITOR, not just the platform; NEVER assume a SOC 2 report is fungible.**
Because "there are and basically always have been auditors that will sign off on anything" if paid — the
report is only as good as the CPA firm, and a cheap "we book the audit" bundle can mean a rubber-stamp.
Real-security-first; the cert is a by-product. Source: `ecosystem-10` §Finding 1; §distilled rule 2.

**O4. ALWAYS treat the GRC platform as a driven tool; NEVER put stamp's value into rebuilding the CRUD.**
Because the platform (integrate→map→monitor→package) is commoditized — "Shasta in 8.5 days" with Claude Code +
`trycompai/comp` at 1,636★ prove a single engineer + an agent can clone it. The durable moat is the **auditor
network + maintained integrations + the answer-KB**. Put stamp's judgment into *which controls matter* and
*not failing the access-review/audit-log/pentest controls*. Source: `ecosystem-01` §honest take (2);
`ecosystem-10` §distilled rule 1.

**O5. ALWAYS BUY the GRC platform for a real company; NEVER self-host OSS GRC without an in-house compliance
engineer.**
Because the value is the auditor network + maintained integrations (you don't get those for free), and "free"
hides real ops cost — self-hosting `trycompai/comp` is hard (#1705 "missing docs + Docker gaps"). OSS only
buys you no-lock / data-sovereignty *if* you have the engineer to run it. Same logic as badge's "don't roll
your own federation." Source: `ecosystem-01` §buy-vs-build; `ecosystem-10` §Finding 3; `ecosystem-13` §1.

**O6. Default to Vanta for a first SOC 2; reach for Drata (infra-heavy / SafeBase) or Secureframe
(advisory/CMMC) only for a reason.**
Because Vanta has the widest integrations (300+), the largest auditor network, the maturest AI agents, and an
MCP server stamp can drive — the breadth IS the moat. Drata if the company is infra/DevOps-heavy or wants the
SafeBase Trust Center; Secureframe if the founder wants hand-holding or needs CMMC/federal depth; Sprinto only
sub-30 on a hard budget. Source: `ecosystem-01` §honest take (1); `ecosystem-13` §1.

**O7. ALWAYS produce a decision with the honest cost; NEVER hand back a feature checklist.**
Because every marketing page is a feature table — the value a domain expert adds is the *recommendation + the
cost the page hides* (Vanta's slow sales + aggressive renewal; Drata's enterprise-skewed pricing; Secureframe's
"pay twice if you also have a vCISO"). Mirrors badge's decision-not-feature-table discipline. Source:
`ecosystem-13` §intro; §1.

## On the audit trail (the load-bearing control)

**O8. ALWAYS build the audit trail tamper-EVIDENT (hash-chained + signed); NEVER ship merely tamper-resistant
logs.**
Because tamper-resistant lets you *claim* integrity; tamper-evident lets you *prove* it — and that proof is the
difference between passing CC7 and getting a finding. "We have logs" ≠ "we have an audit trail." Source:
`ecosystem-04` §stance (1); §2026 bar.

**O9. ALWAYS attribute every privileged agent action to an accountable human; NEVER let "the agent did it"
stand as the actor of record.**
Because auditors treat "no human request" as a CC6 accountability GAP — the action must tie to an accountable
individual, not an autonomous agent or generic service account. The log carries `(human_owner, agent_id,
scopes, tenant, task_id)` — the audit-side mirror of badge's intersection rule. Source: `ecosystem-04` §the
agent story (CC6); §stance (2).

**O10. ALWAYS export the audit trail to the customer's SIEM in real time; NEVER make them poll an API.**
Because real-time OTel→Splunk/Datadog/Sentinel/New Relic is a hard enterprise demand (Anthropic Cowork
Enterprise shipped exactly this) — polling is a deal-friction red flag to a buyer's security team. Source:
`ecosystem-04` §2026 bar (4); §stance (3).

## On residency & privacy

**O11. ALWAYS ask "residency or sovereignty?" before answering a buyer; NEVER assume "EU residency" means
"no US access."**
Because residency (WHERE data lives) ≠ sovereignty (WHOSE law applies) — a US company in `eu-central-1` is
still reachable under the CLOUD Act (the Schrems problem). They're different promises with very different
costs. Offer **BYOK/CMK** as the sovereignty lever before promising a sovereign cloud. Source: `ecosystem-05`
§the distinction; §stance (1,3).

**O12. ALWAYS pin the WHOLE pipeline or call it nothing; NEVER claim residency on the primary DB alone.**
Because "residency is theater unless you pin compute AND storage AND backups AND logs AND caches/CDN AND every
subprocessor AND the LLM call AND the tax-location data." The audit log (it contains PII) and tax data are the
two everyone forgets; for an AI-native company the model call is in scope (pin region + ZDR). Source:
`ecosystem-05` §the load-bearing gotcha; §stance (2,5).

**O13. ALWAYS build GDPR-aligned everywhere; NEVER build per-jurisdiction privacy pipelines.**
Because GDPR is the strictest comprehensive regime — a GDPR posture mostly covers CCPA/CPRA + the ~19-20-state
US patchwork. Honor Global Privacy Control opt-out signals by default + per-state DSAR intake. One posture, one
register (sub-processor list + residency map + DPA tracker = three views, one source). Source: `ecosystem-06`
§stance (1,4,5).

**O14. ALWAYS keep SCCs + a TIA as the backstop even under the EU-US DPF; NEVER rely on the DPF alone.**
Because it's the third transatlantic framework after Safe Harbor and Privacy Shield (both struck down by
Schrems I/II); it survived Latombe (2025-09-03) but a CJEU appeal is anticipated — a DPF-only company is one
ruling from stranded. Source: `ecosystem-06` §DPF status; §stance (3).

## On the SSO program

**O15. NEVER gate basic SSO punitively; ALWAYS treat SSO as a security control, not a feature.**
Because the "SSO tax" backlash is loud and correct in spirit (sso.tax names 200+ vendors; Railway 9,900%,
HubSpot 5,000%; CISOs call it "an atrocity"; 80% of SaaS apps lack SSO due to licensing cost) — putting your
own product on the SSO Wall of Shame is a brand + buyer-trust risk. You MAY tier the genuinely-costly parts
(SCIM, legacy-IdP onboarding, admin portal, audit-log export) — the long-tail-IdP support cost is real.
Source: `ecosystem-02` §the SSO tax; §stamp's stance (1,2). (Contested — see [[stamp GAPS-AND-DISPUTES]]
DISPUTE 1.)

**O16. ALWAYS ship SSO and SCIM together above ~$200k ACV; NEVER ship "SSO only."**
Because SCIM **deprovisioning** is "the most-tested compliance question in B2B security questionnaires above
~$200k contract value" — a departing employee who keeps access = failed review = lost deal. At ~$200k ACV
they're deal-blockers; below it SSO is "nice." Source: `ecosystem-02` §stance (3); `ecosystem-03` §the one
fact.

## On access reviews

**O17. ALWAYS scope every access review to non-human identities (service accounts, API keys, AND agents);
NEVER review only interactive humans.**
Because incomplete scope is the #1 access-review audit failure — "reviews should cover more than interactive
users" — and an agent fleet multiplies non-human identities. Every agent identity needs an accountable human
owner, scoped permissions, and an expiry. Source: `ecosystem-07` §why auditors flag most; §the agent angle.

**O18. ALWAYS derive the UAR inventory from badge's token scopes; NEVER maintain two access lists.**
Because the access-review inventory == the RBAC scope inventory — keeping two diverges them and creates audit
exceptions. badge enforces the scope; stamp attests it. One source of truth. Source: `ecosystem-07` §stance
(5); §the agent angle.

**O19. ALWAYS let the agent PROPOSE revokes and a human APPROVE; NEVER auto-revoke privileged/uncertain
access.**
Because "an automated revoke can break a business process if exceptions aren't surfaced and approved," and the
auto-revoke is itself a CC6 change-management risk. Read/draft/commit gradient. Source: `ecosystem-07`
§automation-vs-human balance; §stance (4).

## On pen-tests & questionnaires

**O20. NEVER present an AI-only / scanner-only pentest as the SOC 2 pen-test; ALWAYS get a human-led one.**
Because auditors **reject** AI-only/scanner-only PTaaS — they want human-driven, adversarial testing
(business-logic flaws, chained exploits, risk context); vuln scan ≠ pen test. This is the #1 anti-slop trap
for an agent-native fleet. Layer CPTaaS for continuous coverage, never as the report. Source: `ecosystem-08`
§the anti-slop fact; `ecosystem-10` §Finding 5.

**O21. ALWAYS stand up a Trust Center early and own the answer-KB as versioned code; NEVER re-answer
questionnaires from scratch.**
Because the security questionnaire (SIG/CAIQ/VSA) is the recurring sales tax — a Trust Center deflects inbound,
and a versioned answer-KB (`HailBytes/caiq-lite` CAIQ-as-code + WikiMem) lets you answer once and diff on
renewal. The compounding asset is the accurate KB, not the generation. Source: `ecosystem-08` §the fix;
§stance (2,3).

**O22. ALWAYS have a human SIGN every questionnaire answer + every control attestation; NEVER ship AI prose
blind.**
Because a wrong answer is a *misrepresentation to a customer* (legal + trust risk) and AI compliance prose can
be "lipstick on fraud" — "absurdly bad — sentences that make no sense." AI drafts; human signs. Source:
`ecosystem-08` §limits of AI auto-answering; `ecosystem-10` §Finding 1.

## On operating as an agent & vendor hygiene

**O23. ALWAYS discover capability via MCP first, API second; NEVER share creds across concurrent agent runs.**
Because Vanta (`mcp.vanta.com/mcp`, GA) and Drata (experimental, region-split) expose MCP, but Vanta **revokes
the previous token** when you re-issue with the same `client_id` — parallel runs fight. Serialize token
issuance per client_id; mention the vendor by name in prompts (routes to MCP vs training data). Source:
`ecosystem-11` §the headline; §10.2/10.3.

**O24. NEVER claim "compliant"; ALWAYS claim "audit-ready evidence assembled."**
Because the attestation is the human auditor's — never the agent's; the platform monitors ≤80-90% of controls,
the rest + the sign-off are human. Saying "compliant" before the CPA signs is a misstatement. Source:
`ecosystem-11` §what an agent cannot do; §playbook (6).

**O25. ALWAYS verify vendor independence + check `pushed_at` not stars; NEVER bet on a "neutral" tool or a
high-star dead repo.**
Because "neutral" tools get acquired (SafeBase→Drata $250M; Auth0→Okta), and `strongdm/comply` (1,556★) has
been DEAD since 2022-07-21 — star count ≠ current for a field that changes quarterly. Use `trycompai/comp`
(pushed daily). (badge's popularity≠security rule, applied to vendor independence + staleness.) Source:
`ecosystem-10` §Finding 4; `ecosystem-09` §the famous-but-DEAD one.

---

## The stamp spine (the five stances that subsume the rest)

1. **Mechanism→badge; governance/evidence→stamp.** Place every task on that line first. (O1, O2)
2. **BUY the platform, OWN the judgment.** The CRUD is commoditized; the moat is the auditor network +
   integrations + the answer-KB. (O4, O5)
3. **Vet the auditor, verify vendor independence, human-sign every attestation.** The anti-slop trinity.
   (O3, O22, O24, O25)
4. **Tamper-evident, accountable-human-attributed, SIEM-exported, whole-pipeline-pinned.** The technical bar
   for audit + residency. (O8, O9, O10, O12)
5. **Don't gate basic SSO punitively; ship SCIM deprovisioning with it; scope every review to agents.** The
   enterprise-readiness spine. (O15, O16, O17)
