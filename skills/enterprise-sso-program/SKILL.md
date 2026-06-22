---
name: enterprise-sso-program
description: Plan the enterprise-SSO PROGRAM (decide we need it → price it sanely → prove it). Use when someone asks "do we need SSO to close this deal?", "enterprise SSO", "SCIM", "SSO pricing", or "deprovisioning". Emits the buyer-readiness checklist + WorkOS wiring PLAN + deprovisioning-proof spec — and hands the SAML/OIDC+SCIM CODE to badge. The flagship skill (half of stamp's acceptance bar).
trigger: "do we need SSO to close this deal", "enterprise SSO", "SCIM", "SSO pricing", "deprovisioning", "SSO tax", "run the SSO program", "enterprise readiness checklist"
---

# enterprise-sso-program

> The second half of stamp's acceptance bar. Maps to `stamp sso-plan --target <app> --dry-run`
> (EM JTBD-8). The single most important boundary in the repo: stamp plans the **program**;
> **badge** implements the **mechanism**. Brain: `brain/EXPERTISE-MAP.md` JTBD-8/8.5 ·
> `brain/OPINIONS.md` O2/O15/O16 · `brain/KNOWN-PITFALLS.md` P25 ·
> `brain/BATTLE-TESTED-SCENARIOS.md` S3/S4.

## When to use

A B2B deal is in security review (or about to be) and SSO/SCIM has come up. The team needs
to know: do we even need it for THIS deal, what does the buyer's checklist actually require,
and how do we prove deprovisioning fired — without losing the deal on a deprovisioning
question.

## The stance this skill enforces (don't skip)

1. **The trigger is ACV.** Above **~$200k ACV**, SSO **and** SCIM are deal-blockers; below
   it SSO is "nice to have" (OP O16; BTS S3). At `--acv 300000` the decision is **"build
   now — deal-blocker at ~$200k ACV"**.
2. **NEVER ship "SSO only" above ~$200k.** SCIM **deprovisioning** is the most-tested
   compliance question in B2B security questionnaires above ~$200k — a departing employee
   who keeps access = failed review = lost deal (OP O16). Ship SSO + SCIM together.
3. **NEVER gate basic SSO punitively** — the "SSO tax" is a brand + buyer-trust risk
   (sso.tax names 200+ vendors; Railway 9,900%, HubSpot 5,000%). You MAY tier the
   genuinely-costly parts (SCIM, legacy-IdP onboarding, admin portal, audit-log export),
   but basic SSO is a security control, not a paywall (OP O15; BTS S4).
4. **THE BOUNDARY (load-bearing — KP P25 / OP O2):** stamp emits the *plan* and the
   `badge_handoff` stanza. The moment the task becomes "make the SAML/OIDC+SCIM actually
   *work*" — signature validation, event ordering, the ACS endpoint — **that is badge's**.
   stamp's output contains **NO generated SAML/OIDC/SCIM code**, only the program plan and
   `badge_handoff: "badge init --provider workos"`. A plan that emits auth code has crossed
   the seam and is WRONG.

## Steps

1. **Place the task on the boundary first (JTBD-0).** "Plan/price/prove the program" →
   stamp. "Implement/validate/fix the SAML/SCIM/MCP-OAuth" → **badge**; emit the handoff.
2. **Run** `stamp sso-plan --target <app> --acv <n> --dry-run --json`.
3. **Read the `trigger_decision`** — at ≥$200k ACV it must be "build now (deal-blocker)";
   below it, "SSO nice-to-have; SCIM optional" (and still never gate basic SSO punitively).
4. **Walk the `buyer_readiness_checklist`** — SAML 2.0 · OIDC · SCIM **+ deprovisioning** ·
   admin portal · audit-log export · RBAC · residency · SOC 2 report · SIG/CAIQ · DPA ·
   pen-test letter (EM 8.3). Most of these route to other stamp verbs (audit-log, residency,
   questionnaire, dsar, audit).
5. **Confirm the `deprovisioning_proof_spec`** — prove each deprovisioning actually fired
   (timestamps / reconciliation), the question that loses deals.
6. **Confirm the `badge_handoff`** is present and the output contains NO SAML/OIDC/SCIM code
   (the boundary assertion the acceptance test ×3 + the Playwright test enforce).

## Output format

```json
{
  "trigger_decision": "build now — SSO+SCIM are deal-blockers at ~$200k ACV",
  "buyer_readiness_checklist": ["SAML 2.0", "OIDC", "SCIM + deprovisioning", "admin portal", "audit-log export", "RBAC", "residency", "SOC 2 report", "SIG/CAIQ", "DPA", "pen-test letter"],
  "workos_wiring_plan": "WorkOS Admin Portal + directory-sync PLAN (the mechanism is badge's)",
  "deprovisioning_proof_spec": "prove each deprovisioning fired (timestamps + IdP↔app reconciliation)",
  "badge_handoff": "badge init --provider workos"
}
```

WorkOS is the program **reference** (Admin Portal / SCIM directory). The live wiring code is
badge's — `stamp sso-plan` hands it over, it does not write it.
