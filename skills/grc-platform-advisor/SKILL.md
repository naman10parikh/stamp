---
name: grc-platform-advisor
description: Recommend a GRC platform (or OSS/build) as a DECISION with the honest cost — never a feature table. Use when someone asks "which GRC platform?", "Vanta vs Drata", "should we self-host compliance?", or "which compliance OSS repo?". Vanta default; vet the auditor; verify vendor independence; check pushed_at not stars.
trigger: "which GRC platform", "Vanta vs Drata", "Vanta or Drata", "self-host compliance", "compliance OSS", "GRC tool", "which compliance repo", "buy vs build compliance", "SafeBase", "Secureframe"
---

# grc-platform-advisor

> The buy-vs-build decision. Maps to `stamp advise --on grc-platform | repos` (EM JTBD-2/11).
> Encodes Vanta-default + vet-the-auditor + verify-vendor-independence + check-pushed_at-not-stars.
> Brain: `brain/EXPERTISE-MAP.md` JTBD-2/11 · `brain/OPINIONS.md` O3/O4/O5/O6/O7/O25 ·
> `brain/KNOWN-PITFALLS.md` P19/P20/P21/P22/P24 · `brain/BATTLE-TESTED-SCENARIOS.md` S2/S16.

## When to use

A team is choosing how to get to a first SOC 2: which GRC platform, whether to self-host an
OSS alternative, or which compliance repo to clone. The value here is a *recommendation with
the cost the marketing page hides* — not a side-by-side feature grid.

## The stance this skill enforces (don't skip)

1. **Produce a DECISION with the honest cost — NEVER a feature checklist** (OP O7). Every
   marketing page is a feature table; the domain expert's value is the recommendation + the
   hidden cost (Vanta's slow sales + aggressive renewal; Drata's enterprise-skewed pricing;
   Secureframe's "pay twice if you also have a vCISO").
2. **Default to Vanta for a first SOC 2** (OP O6) — widest 300+ integrations, largest auditor
   network, maturest AI agents, an MCP server stamp can drive (**public beta**, not GA —
   spec-currency correction). Drata if infra/DevOps-heavy or you want the SafeBase Trust
   Center; Secureframe if you want advisory hand-holding or CMMC/federal depth; Sprinto only
   sub-30 on a hard budget.
3. **BUY the platform for a real company; self-host OSS only WITH a compliance engineer**
   (OP O5; KP P22) — the value is the auditor network + maintained integrations (not free);
   self-hosting `trycompai/comp` is hard (#1705 docs/Docker gaps).
4. **The platform is a DRIVEN tool — never rebuild its CRUD** (OP O4) — "Shasta in 8.5 days"
   proves the platform is commoditized; the moat is the auditor network + integrations + the
   answer-KB.
5. **VET THE AUDITOR, not just the platform** (OP O3; KP P19; BTS S2) — a cheap "we book the
   audit" bundle can route to a rubber-stamp CPA; a SOC 2 report is only as good as the firm.
6. **Verify vendor independence + check `pushed_at`, NOT stars** (OP O25; KP P20/P21; BTS S16)
   — "neutral" tools get acquired (**SafeBase → Drata** since 2025-02-12; Auth0 → Okta), and
   **`strongdm/comply` (1,556★) has been DEAD since 2022-07-21** for a field that revises
   quarterly. Use `trycompai/comp` (pushed daily) or `theopenlane/core`. Star count ≠ current.
7. **Even compliance software has authz bugs** (KP P24) — apply badge-style authz review to
   the GRC tool too; don't assume "it's a compliance product, so it's secure."

## Steps

1. **Place the task on the boundary first (JTBD-0).** Platform choice + repo recommendation
   are pure stamp.
2. **Run** `stamp advise --on grc-platform --json` (the platform decision) or
   `stamp advise --on repos --json` (the reference-repo decision).
3. **Surface the honest cost + the auditor-vetting + the vendor-independence/staleness
   checks** — not a feature comparison.
4. **Mark every figure "directional — re-verify (the field revises quarterly)"** — GRC
   pricing is a B-ledger claim.

## Output format

```json
{
  "on": "grc-platform",
  "recommendation": "Default to Vanta for a first SOC 2 ...; BUY for a real company; OSS only WITH a compliance engineer.",
  "honest_cost": "the page hides it: Vanta's renewal; Drata's enterprise pricing; ... and VET THE AUDITOR.",
  "boundary_note": "the GRC platform is a DRIVEN tool — do not rebuild its CRUD.",
  "caveat": "directional — re-verify (the field revises quarterly)"
}
```
