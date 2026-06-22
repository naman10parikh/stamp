---
name: privacy-dsar-handler
description: Handle GDPR/CCPA privacy — DSARs (access/erasure), DPAs/SCCs, and residency-vs-sovereignty. Use when someone mentions "GDPR", "CCPA", "DSAR", "data subject request", "erasure", "DPA", "SCC", or "residency vs sovereignty". On the GDPR 1-month→3 / CCPA 45-day→90 clock; routes work across the subprocessor register; AI drafts, a human SIGNS.
trigger: "GDPR", "CCPA", "DSAR", "data subject request", "erasure", "right to be forgotten", "DPA", "SCC", "residency vs sovereignty", "data residency", "EU residency", "Schrems"
---

# privacy-dsar-handler

> The privacy-law process + the residency posture. Maps to `stamp dsar --type access|erasure`
> and `stamp residency --ask|--check` (EM JTBD-5/6). Encodes the regulatory clocks +
> build-GDPR-aligned-everywhere + residency-or-sovereignty + AI-drafts-human-signs. Brain:
> `brain/EXPERTISE-MAP.md` JTBD-5/6 · `brain/OPINIONS.md` O11/O12/O13/O14 ·
> `brain/KNOWN-PITFALLS.md` P13/P14/P15/P16/P17 · `brain/BATTLE-TESTED-SCENARIOS.md`
> S9/S10/S11/S12.

## When to use

A data subject request (DSAR) has arrived and the clock is running, OR a buyer asked about
"EU residency" and the deal hinges on the answer, OR the privacy program needs a DPA/SCC
posture. Two related but distinct jobs: the privacy *rights* layer (DSARs) and the residency
*posture* (where data lives vs whose law applies).

## The stance this skill enforces (don't skip)

### DSARs (JTBD-6)
1. **Know the clock** — **GDPR = 1 month (extendable to 3 if complex); CCPA/CPRA = 45 days
   (extendable to 90)** (BTS S11). Track it on intake.
2. **Route across the WHOLE subprocessor register** — an erasure that misses data in a
   subprocessor (Sentry/email/warehouse) is a *violation* (KP P15). Maintain a per-subprocessor
   data-location map.
3. **Apply erasure exemptions** — legal-obligation retention (tax/financial), fraud
   prevention / legal claims, freedom-of-expression. Erasure is not unconditional.
4. **AI drafts; a HUMAN signs** anything legally consequential (OP O22).
5. **Build GDPR-aligned EVERYWHERE** (OP O13) — GDPR is the superset; one posture mostly
   covers CCPA/CPRA + the ~19-20-state US patchwork. Honor Global Privacy Control opt-out by
   default + per-state DSAR intake. NEVER build per-jurisdiction pipelines (KP P17).
6. **Keep SCCs + a TIA as the backstop even under the EU-US DPF** (OP O14; KP P16) — the DPF
   is the third transatlantic framework after Safe Harbor + Privacy Shield (both struck down);
   a DPF-only posture is one CJEU ruling from stranded.

### Residency (JTBD-5)
7. **ASK "residency or sovereignty?" FIRST** (OP O11; BTS S10) — residency = WHERE data
   lives; sovereignty = WHOSE law applies. A US company in `eu-central-1` is still reachable
   under the US CLOUD Act. They are different promises with very different costs.
8. **Pin the WHOLE pipeline or call it nothing** (OP O12; KP P13) — DB + backups + logs/audit
   trail + caches/CDN + every subprocessor + **the LLM call** + tax-location data. The audit
   log (it contains PII), the LLM call, and tax data are the three everyone forgets.
9. **Offer BYOK/CMK as the sovereignty lever** before promising a sovereign cloud — the
   customer holds the KMS key.

## Steps

1. **Place the task on the boundary first (JTBD-0).** Privacy/residency is pure stamp (zero
   auth overlap). The regional *cells* residency is pinned to belong to **rocket**; stamp owns
   the posture + the guardrail check.
2. **DSAR:** `stamp dsar --type access|erasure --json` → the clock, the
   classify→verify→exemptions→draft→route steps, the subprocessor-register note, and the
   `requires_human_signature: true` gate.
3. **Residency:** `stamp residency --ask --json` (the question + whole-pipeline pins + BYOK
   lever) or `stamp residency --check <path> --json` (assess a config; flag any leg crossing
   the promised region).
4. **For a buyer's "EU residency?" question,** clarify residency vs sovereignty first, then
   enumerate the full pipeline and reach for BYOK/CMK if the real ask is "no US access".

## Output format

```json
{
  "type": "erasure",
  "clock": "GDPR = 1 month → 3; CCPA/CPRA = 45 days → 90",
  "steps": ["classify", "verify identity", "apply exemptions", "draft", "route across the subprocessor register", "human SIGNS"],
  "exemptions": ["legal-obligation retention", "fraud prevention / legal claims", "freedom of expression"],
  "requires_human_signature": true
}
```

Pattern reference for the DSAR flow: `tiffanycoyle/gdpr-dsr-operator`.
