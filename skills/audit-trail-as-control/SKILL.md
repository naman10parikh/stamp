---
name: audit-trail-as-control
description: Design (or check) the audit trail as a real CC7/CC6 control — tamper-EVIDENT, identity-traceable, retained, SIEM-exported. Use when someone asks "is our logging audit-ready?", "CC7", "tamper-evident", "SIEM export", or "audit log for agent actions". "We have logs" is NOT an audit trail — this skill makes the difference between passing CC7 and getting a finding.
trigger: "is our logging audit-ready", "CC7", "tamper-evident", "tamper evident", "SIEM export", "audit log for agent actions", "audit trail", "who authorized it", "we have logs"
---

# audit-trail-as-control

> The load-bearing CC7/CC6 control. Maps to `stamp audit-log --design | --check <path>`
> (EM JTBD-4). Encodes tamper-EVIDENT > tamper-resistant + accountable-human attribution +
> real-time SIEM export. Brain: `brain/EXPERTISE-MAP.md` JTBD-4 · `brain/OPINIONS.md`
> O8/O9/O10 · `brain/KNOWN-PITFALLS.md` P8/P9/P10 · `brain/BATTLE-TESTED-SCENARIOS.md`
> S5/S6.

## When to use

A team thinks their application logs satisfy the SOC 2 monitoring control (CC7), or an
auditor has asked "who authorized this privileged action?" and the answer is "the agent did
it." This skill designs the trail that actually passes — or checks an existing config against
the four properties.

## The stance this skill enforces (don't skip)

1. **"We have logs" ≠ "we have an audit trail"** (KP P8). Generic app logs are mutable, not
   identity-attributed, short-retention, gap-prone — an auditor flags them. The trail must
   meet **four** properties:
   - **append-only**
   - **tamper-EVIDENT** (hash-chained + signed — you can *prove* integrity, not just claim it)
   - **identity-traceable** (every span ties to an accountable human)
   - **≥1yr retention + real-time SIEM export**
2. **Tamper-EVIDENT, not tamper-RESISTANT** (OP O8; KP P9). "Logs in a write-protected
   bucket" *resists* tampering but can't *prove* nothing changed. **Hash-chain + sign** the
   append-only spans so integrity is *provable* — that is the line between passing CC7 and a
   finding.
3. **Attribute every privileged agent action to an accountable HUMAN** (OP O9; BTS S6).
   "The agent did it" is a CC6 accountability gap. Every span carries
   **`(human_owner, agent_id, scopes, tenant, task_id)`** — the audit-side mirror of badge's
   `agent_perms ∩ user_perms` intersection rule. When the auditor asks "who authorized it?",
   answer with the human_owner — NOT "add the agent to the actor list".
4. **Export to the customer's SIEM in real time** (OP O10) — Splunk/Datadog/Sentinel/New
   Relic; making the buyer poll an API is a deal-friction red flag.
5. **Mind the ephemeral-sandbox gap** (KP P10) — short-lived compute (E2B) can die before
   emitting its span. Emit to the durable, centralized trail BEFORE the sandbox dies; never
   `2>/dev/null` (masks errors).

## Steps

1. **Place the task on the boundary first (JTBD-0).** badge logs auth events as a
   *mechanism*; stamp owns the audit trail as the immutable, retained, SIEM-exported
   **CONTROL**. If the ask is "log the SAML assertion" that is badge's; this skill owns the
   control.
2. **Design:** `stamp audit-log --design --json` → the OTel-span schema (`actor`/`target`/
   `before_hash`/`after_hash`/`trace_id` + the accountable-human tuple), the hash-chain
   design, the SIEM-export plan, and the four properties.
3. **Check:** `stamp audit-log --check <path> --json` → assess a config against the four
   properties; report the gaps (mutable? service-account actors? retention < the audit
   period? chain gaps?).
4. **For an agent fleet,** ensure RSI/AutoLab threshold-promotions attach the change-mgmt
   artifacts (eval score, before/after hash, approval) — the RSI audit log doubles as CC8
   evidence (KP P11).

## Output format

```json
{
  "mode": "design",
  "span_schema": { "actor": "...", "human_owner": "REQUIRED accountable human", "agent_id": "...", "scopes": "...", "tenant": "...", "task_id": "...", "before_hash": "...", "after_hash": "...", "trace_id": "..." },
  "properties_required": ["append-only", "tamper-EVIDENT (hash-chained+signed)", "identity-traceable", "≥1yr retention + real-time SIEM export"],
  "hash_chain": "each span signed; chain verifiable end-to-end so tampering is EVIDENT",
  "siem_export_plan": "stream OTel spans to the customer's SIEM in real time",
  "accountable_human_tuple": "(human_owner, agent_id, scopes, tenant, task_id)"
}
```

stamp dogfoods this control on itself: every CLI/RSI run appends one line to
`logs/runs.jsonl` carrying the `human_owner` field.
