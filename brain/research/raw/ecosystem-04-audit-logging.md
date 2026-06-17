---
title: "Audit logging as a COMPLIANCE CONTROL (SOC 2 CC7, immutable/tamper-evident) — June 2026"
type: research
domain: compliance
topic: audit logging / audit trail as evidence
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [audit-log, soc2, cc7, cc6, tamper-evident, immutable, siem, retention, agents]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-01-soc2-iso-automation]]", "[[ecosystem-07-access-reviews-rbac]]", "[[ecosystem-11-agent-operator-notes]]"]
summary: "The audit trail is the single most load-bearing SOC 2 control (CC7.x monitoring + CC6 access) and the easiest to fake badly. The bar in 2026: append-only + tamper-EVIDENT + identity-traceable + ≥1yr retention + SIEM export. For AGENT actions specifically, auditors treat 'no human request' as an accountability GAP — every privileged agent action must be attributable, or you fail CC6."
---

# Audit logging as a compliance control — June 2026

> **Boundary:** badge logs *auth events* as a mechanism (login, token issue, SAML response). stamp owns the
> *audit trail as a CONTROL* — the immutable, retained, SIEM-exported evidence that satisfies SOC 2 CC7/CC6
> and answers "who did what, when, and can you prove the log wasn't altered." This is one of the 7 Energy
> trust primitives (`the_complete_story.md` L222: "audit — append-only OTel + SIEM export").

## Why this is THE load-bearing control
- SOC 2 is not a fixed checklist — you design controls to meet the Trust Services Criteria. The **monitoring
  family (CC7.x)** and **logical-access family (CC6.x)** are where audit logging lives, and they are the
  criteria auditors probe hardest because they're how *every other control is evidenced*. Source:
  [soc2auditors.org — SOC 2 Controls List 2026](https://soc2auditors.org/insights/soc-2-controls-list/) (accessed 2026-06-16).
- "We have logs" ≠ "we have an audit trail." The distinction the auditor cares about: **tamper-evidence**
  (can you prove no one edited the log?), **identity attribution** (not a generic service account),
  **retention** (long enough to investigate), and **completeness** (no gaps in the chain).

## The 2026 bar (what good looks like)
1. **Append-only + tamper-EVIDENT** (not just "tamper-resistant"). The Energy standard is the right shape:
   "an **append-only audit trail of OpenTelemetry-shaped spans**, one span per mutation, each carrying
   `actor`, `target`, `before_hash`/`after_hash` (content-addressed, Git-style), and a `trace_id` ... immutable
   by construction (writes are signed, appends-only, exported in real time to the customer's SIEM)." Source:
   `~/energy/docs/vision/the_complete_story.md` L222 (Energy corpus).
2. **Identity-traceable.** Every action attributable to an *accountable individual* — not "CI/CD Runner," not a
   shared service account. (Critical for agents — see below.)
3. **Retention ≥ 1 year** for the audit trail (SOC 2 audit period is typically 3–12 months; auditors expect
   the trail to cover the full period). Generic security logs (firewall/IDS) often kept "at least two months,"
   but the *compliance* audit trail is held longer. Sources: [Teleport — AI agents & SOC 2](https://goteleport.com/blog/ai-agents-soc-2/) (≥1yr, accessed 2026-06-16); [Optro — security log retention](https://optro.ai/blog/security-log-retention-best-practices-guide) (accessed 2026-06-16).
4. **SIEM export.** Real-time export to the customer's existing Splunk / Datadog / Sentinel / New Relic. This
   is a hard enterprise demand (Anthropic Cowork Enterprise shipped exactly OTel→Splunk/Datadog/New Relic —
   `the_complete_story.md` L222).
5. **Evidence storage hygiene** (the GRC-platform side): evidence must be stored with clear provenance,
   completion dates, and review intervals; Secureframe's 2026 change to "flag expired evidence rather than
   auto-archive" is the right pattern (stale evidence is an audit finding). Sources: [konfirmity — SOC 2
   evidence storage 2026](https://www.konfirmity.com/blog/soc-2-evidence-storage-best-practices); Secureframe product updates (`ecosystem-01`).

## THE agent-specific story (why audit logging is hard for AI agents — directly stamp+Energy)
This is the 2026 frontier and it's exactly what Energy must get right. From [Teleport — How AI Agents Impact
SOC 2 TSC](https://goteleport.com/blog/ai-agents-soc-2/) (accessed 2026-06-16):
- **CC6 (logical access):** auditors treat **"no human request" as an accountability GAP**. "Privileged
  actions [must] be attributable to an accountable individual, **not to an autonomous agent or generic system
  account**." → An Energy agent doing privileged things must tie back to an accountable human (the chairman /
  the tenant owner). This is the audit-side mirror of badge's **intersection rule** (`agent_perms ∩
  user_perms`) — badge enforces it at the token; stamp proves it in the log.
- **CC7 (monitoring):** "auto-scaling and ephemeral resources create **gaps in the log chain**, weakening
  monitoring coverage." → ephemeral E2B sandboxes must still emit to a durable, centralized, identity-traceable
  trail before they die. (Energy rule already: "never use `2>/dev/null` in sandbox commands — masks errors.")
- **CC8 (change management):** AI may "promote outputs based on thresholds **without producing the same
  approval and test artifacts** humans attach to change tickets." → AutoLab's nightly harness mutations need
  the same audit artifacts (eval scores, before/after hash, approval) — which Energy's design already provides
  (the deterministic-replay tuple + chairman-gated promotions).
- **What tamper-evident agent logs must capture:** "every agent action including inputs, outputs, and trigger
  events"; "clear identity attribution"; "metadata/context sufficient to reconstruct intent while protecting
  sensitive content"; "data lineage showing where personal data flowed during training, fine-tuning, and
  inference."
- **Concrete controls Teleport recommends:** RBAC + least-privilege; MFA for AI-platform management; "circuit
  breakers or kill switches" for abnormal behavior; **human-on-the-loop approval** for important decisions;
  automated anomaly alerting + centralized logging. (Maps 1:1 to Energy's cost circuit breakers + kill switch
  + graduated autonomy.)

## Tooling (what to actually use)
- **GRC-platform audit/evidence layer:** Vanta / Drata / Secureframe all centralize control evidence and
  surface failing tests; Secureframe added "jump directly to changed items from the audit-log table" (Jan
  2026) — improving the log *traceability* auditors want. (`ecosystem-01`.)
- **The actual immutable-log substrate (build/buy):** customer SIEM (Splunk/Datadog/Sentinel) for export;
  append-only stores for tamper-evidence. OSS primitives seen: `DavidLiedle/DriftDB` (Rust append-only +
  time-travel + "immutable audit trails"), and agent-governance specs (`CJHodgson/Agentic-Governance-Spec`,
  `mishrasanjeev/grantex`) that bake immutable audit trails for *agent* actions. (`ecosystem-09`.) NOTE:
  identity inside `grantex` is **badge's** turf — quote it for the audit-trail shape only.
- **OTel is the lingua franca.** Both the Energy design and enterprise buyers standardize on OpenTelemetry
  spans → SIEM. Build the audit trail as OTel from day one.

## stamp's stance
1. **Tamper-EVIDENT beats tamper-resistant.** Ship content-addressed (hash-chained) signed append-only spans
   so you can *prove* integrity, not just claim it. This is the difference between passing CC7 and getting a
   finding.
2. **Attribute every agent action to an accountable human.** "Agent did it" is an audit failure. The log must
   carry `(human_owner, agent_id, scopes, tenant, task_id)` — the same tuple badge uses for authority.
3. **Export to the customer's SIEM in real time** — non-negotiable enterprise demand; don't make them poll an
   API.
4. **Retain ≥ the full audit period (≥1yr default)** and never auto-archive evidence into oblivion — flag
   expiry instead.
5. **The audit trail is also the RSI substrate** — Energy's nightly-improvement audit log doubles as the SOC 2
   CC8 change-management evidence. Build once, satisfy both.

## Sources
- https://goteleport.com/blog/ai-agents-soc-2/ (accessed 2026-06-16)
- https://soc2auditors.org/insights/soc-2-controls-list/ (accessed 2026-06-16)
- https://www.konfirmity.com/blog/soc-2-evidence-storage-best-practices (accessed 2026-06-16)
- https://optro.ai/blog/security-log-retention-best-practices-guide (accessed 2026-06-16)
- https://onspring.com/resources/guide/soc-2-compliance-requirements-and-how-to-meet-them/ (accessed 2026-06-16)
- Internal: ~/energy/docs/vision/the_complete_story.md L222
