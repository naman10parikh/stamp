---
name: soc2-readiness-audit
description: SOC 2 / ISO 27001 / HIPAA readiness gap-scan. Use when someone asks "will we pass SOC 2?", "which controls will fail our audit?", "are we audit-ready?", or "gap-scan this app for SOC 2". Produces a control-mapped gap report (CC6/CC7/CC8 + severity + fix) — NEVER a "you're compliant" badge.
trigger: ["will we pass SOC 2", "which controls fail", "are we audit-ready", "gap-scan for SOC2", "SOC 2 readiness", "ISO 27001 audit", "HIPAA readiness", "what will the auditor flag"]
---

# soc2-readiness-audit

> The first half of stamp's acceptance bar. Maps to `stamp audit <app> --framework soc2`
> (EM JTBD-1). Encodes the load-bearing-control focus + the never-claim-compliant creed.
> Brain: `brain/EXPERTISE-MAP.md` JTBD-1 · `brain/OPINIONS.md` O3/O4/O24 ·
> `brain/KNOWN-PITFALLS.md` P7/P19 · `brain/BATTLE-TESTED-SCENARIOS.md` S2/S5.

## When to use

A team is approaching a first SOC 2 (or ISO 27001 / HIPAA) audit and wants to know,
concretely, what will fail and how to fix it — BEFORE the auditor does. This is the
posture job: assemble evidence, map it to control families, surface the gaps.

## The stance this skill enforces (don't skip)

1. **The load-bearing controls are CC6 (access), CC7 (monitoring/audit trail), and CC8
   (change management) — those are what auditors fail you on** (EM JTBD-1.4). Scan those
   first; a missing **audit trail → CC7.2** and **no access review → CC6.3** are the
   canonical seeded gaps.
2. **NEVER output "compliant" / "certified"** — the attestation is the human CPA firm's,
   never the agent's; the platform monitors ≤80-90% of controls (OP O24; KP P7). Phrase
   the summary as **"audit-ready evidence: N gaps"**, attestation pending the auditor.
3. **Vet the AUDITOR, not just the platform** — a SOC 2 report is only as good as the CPA
   firm; a cheap "we book the audit" bundle can route to a rubber-stamp (OP O3; KP P19;
   BTS S2). Surface this whenever the user asks "which auditor / which bundle".
4. **The GRC platform is a DRIVEN tool — never rebuild its CRUD** (OP O4). When the user
   needs platform automation, route to `stamp advise --on grc-platform` (Vanta default),
   don't reimplement integrate→map→monitor→package.

## Steps

1. **Place the task on the boundary first (JTBD-0).** If the ask is "make SAML/SCIM/logging
   *work*", that is the **mechanism** → hand to **badge** and stop. This skill owns the
   *posture/evidence*, not the auth mechanism.
2. **Identify the framework** (soc2 | iso27001 | hipaa) and the target app/repo path.
3. **Run** `stamp audit <app> --framework soc2 --json`. The control-mapper statically scans
   the tree against the SOC 2 control checklist + the brain.
4. **Read the findings.** Each is `{control, severity, evidence_gap, fix}` mapped to a real
   control family. Verify the load-bearing families (CC6.x access-review, CC7.x audit-trail,
   CC8.x change-management) were assessed.
5. **For each gap, give the concrete fix** — not "improve your logging" but "build an
   append-only, tamper-evident (hash-chained+signed) OTel-span trail" (route to the
   `audit-trail-as-control` skill for the audit-log gap; `enterprise-sso-program` for the
   SSO gap).
6. **Write the readiness summary as "audit-ready evidence: N gaps"** — assert the output
   never contains the word "compliant" (the boundary the acceptance test checks).

## Output format

```json
{
  "framework": "soc2",
  "findings": [
    { "control": "CC7.2", "severity": "high", "evidence_gap": "no tamper-evident audit trail of privileged actions", "fix": "build an append-only, hash-chained+signed OTel-span trail with ≥1yr retention + SIEM export", "brain_cite": "..." },
    { "control": "CC6.3", "severity": "high", "evidence_gap": "no periodic access review", "fix": "run a UAR scoped to humans + service accounts + AGENT identities; propose revokes, human approves", "brain_cite": "..." }
  ],
  "readiness_summary": "audit-ready evidence: N gaps — attestation pending the auditor (NEVER 'compliant')"
}
```

For a full control-by-control repo scan, delegate to the **stamp-soc2-gap-auditor**
sub-agent (`.claude/agents/stamp-soc2-gap-auditor.md`) — it runs the heavy, fresh-context
pass.
