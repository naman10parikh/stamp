---
name: questionnaire-from-kb
description: Answer a security questionnaire (SIG/CAIQ/VSA) from a versioned answer-KB, and handle the pen-test tax. Use when someone mentions "security questionnaire", "SIG", "CAIQ", "VSA", "Trust Center", "pen-test", or "answer once". A Trust Center deflects inbound; a versioned KB lets you answer once and diff on renewal; AI drafts, a human SIGNS. NEVER bless an AI-only pen-test.
trigger: "security questionnaire", "SIG", "CAIQ", "VSA", "Trust Center", "pen-test", "pentest", "answer once", "vendor security review", "we ran an AI red-team"
---

# questionnaire-from-kb

> The sales-security recurring tax. Maps to `stamp questionnaire <sig|caiq|vsa> --kb <dir>`
> and `stamp advise --on pentest` (EM JTBD-7). Encodes Trust-Center-deflects +
> versioned-answer-KB + AI-drafts-human-signs + auditors-reject-AI-only-pentest. Brain:
> `brain/EXPERTISE-MAP.md` JTBD-7 · `brain/OPINIONS.md` O20/O21/O22 ·
> `brain/KNOWN-PITFALLS.md` P18/P23 · `brain/BATTLE-TESTED-SCENARIOS.md` S13/S14.

## When to use

The same 300-question SIG/CAIQ/VSA blocks every B2B deal and the team re-answers it from
scratch each time, OR the agent-native reflex "we ran an AI red-team, we're covered for the
pen-test" has surfaced. The highest-leverage recurring-tax surface — and the #1 agent-fleet
anti-slop trap.

## The stance this skill enforces (don't skip)

1. **Stand up a Trust Center early to DEFLECT inbound** (OP O21) — publish SOC 2 / ISO /
   pen-test letter / sub-processor list (NDA-gate the sensitive docs) so most questionnaires
   never reach a human.
2. **Own the answer-KB as VERSIONED CODE** (OP O21) — `HailBytes/caiq-lite` (CAIQ-as-code) +
   WikiMem. Answer **once**, diff on renewal. The compounding asset is the accurate KB, not
   the generation (BTS S14).
3. **AI drafts; a HUMAN SIGNS every answer** (OP O22; KP P23) — a wrong questionnaire answer
   is a *misrepresentation to the customer* (legal + trust risk); AI compliance prose can be
   "lipstick on fraud — sentences that make no sense". Mark every draft **"DRAFT — human must
   sign"**.
4. **NEVER present an AI-only / scanner-only pen-test as the SOC 2 pen-test** (OP O20; KP P18;
   BTS S13) — auditors **reject** it; they want human-driven, adversarial testing
   (business-logic flaws, chained exploits). Get a **human-led** pen-test annually
   (Cobalt-class), scoped to the SOC 2 boundary, with retest evidence. CPTaaS
   (Sprocket/Equixly) is continuous coverage *layered on top* — never the report. Keep the
   shareable attestation letter for the Trust Center.

## Steps

1. **Place the task on the boundary first (JTBD-0).** Questionnaires + pen-test posture are
   pure stamp (zero auth overlap).
2. **Run** `stamp questionnaire <sig|caiq|vsa> --kb <dir> --json` → drafts mapped to the
   answer-KB, each marked "DRAFT — human must sign".
3. **For every answer,** confirm the `signature_required` gate and the `kb_source` pointer
   (so the answer is traceable + diffable on renewal).
4. **For the pen-test question,** run `stamp advise --on pentest --json` → the human-led
   recommendation + the honest cost (auditors reject AI-only). NEVER bless a scanner report.
5. **Route adjacent checklist items** to their stamp verbs (audit-trail → `audit-log`,
   residency → `residency`, DPA/sub-processors → `dsar`/privacy).

## Output format

```json
{
  "format": "caiq",
  "approach": ["Trust Center deflects inbound", "versioned answer-KB (answer once, diff on renewal)", "AI drafts, human SIGNS"],
  "answers": [
    { "q": "Do you maintain an audit trail of privileged actions?", "draft_answer": "DRAFT — human must sign: append-only, tamper-evident, identity-traceable OTel-span trail (stamp JTBD-4).", "kb_source": "..." },
    { "q": "Do you perform a third-party penetration test?", "draft_answer": "DRAFT — human must sign: HUMAN-LED pen-test annually (Cobalt-class) — NOT an AI/scanner-only test (auditors reject it).", "kb_source": "..." }
  ],
  "signature_required": "every answer is a DRAFT — a human MUST sign before it ships",
  "pentest_note": "NEVER claim AI-pentest coverage as the SOC 2 pen-test"
}
```
