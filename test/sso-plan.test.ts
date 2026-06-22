// B3 — `stamp sso-plan --dry-run` enterprise-SSO PROGRAM contract (acceptance half 2;
// EM JTBD-8). The load-bearing test: the plan emits a `badge_handoff` and NO generated
// SAML/ACS/OIDC/SCIM code (the defining boundary-FAIL guard — OP O2; KP P25; BTS S3).

import { describe, expect, it } from "vitest";
import { planSsoProgram } from "../src/lib/sso-program.js";

// The exact union of code-token patterns the acceptance test (E2) + the MASTER-TODOS B3
// verify line grep for. A match anywhere in the serialized plan = boundary FAIL.
const SAML_CODE_GUARD = /ACS|SAMLResponse|<saml|samlp:|new SAML|class .*SCIM/;

describe("stamp sso-plan — enterprise-SSO program", () => {
  it('at $300k ACV the trigger is "build now" / deal-blocker (BTS S3)', () => {
    const plan = planSsoProgram({ target: "x", acv: 300_000, dryRun: true });
    expect(plan.trigger_decision).toMatch(/build now|deal-blocker/);
  });

  it("below ~$200k ACV the program defers but never gates basic SSO punitively (OP O15)", () => {
    const plan = planSsoProgram({ target: "x", acv: 50_000, dryRun: true });
    expect(plan.trigger_decision).toMatch(/defer/);
    expect(plan.sso_tax_stance).toMatch(/do NOT gate it punitively/i);
  });

  it("emits a buyer-readiness checklist of >=10 items incl. SCIM + deprovisioning (OP O16)", () => {
    const plan = planSsoProgram({ target: "x", acv: 300_000, dryRun: true });
    expect(plan.buyer_readiness_checklist.length).toBeGreaterThanOrEqual(10);
    const joined = plan.buyer_readiness_checklist.join(" ");
    expect(joined).toMatch(/SCIM/);
    expect(joined).toMatch(/DEPROVISIONING/i);
  });

  it("emits the WorkOS wiring plan + a deprovisioning-proof spec", () => {
    const plan = planSsoProgram({ target: "x", acv: 300_000, dryRun: true });
    expect(plan.workos_wiring_plan.length).toBeGreaterThan(0);
    expect(plan.deprovisioning_proof_spec.length).toBeGreaterThan(0);
  });

  it('hands the MECHANISM to badge — `badge init --provider workos` (EM JTBD-8.5)', () => {
    const plan = planSsoProgram({ target: "x", acv: 300_000, dryRun: true });
    expect(plan.badge_handoff).toBe("badge init --provider workos");
  });

  it("BOUNDARY-FAIL: the serialized plan contains NO generated SAML/ACS/OIDC/SCIM code", () => {
    // Run across ACV regimes — the guard must hold regardless of the trigger branch.
    for (const acv of [null, 50_000, 300_000]) {
      const json = JSON.stringify(planSsoProgram({ target: "x", acv, dryRun: true }));
      expect(SAML_CODE_GUARD.test(json), `boundary leak at acv=${acv}: ${json}`).toBe(false);
    }
  });

  it("is deterministic (pass^k stability)", () => {
    const a = planSsoProgram({ target: "x", acv: 300_000, dryRun: true });
    const b = planSsoProgram({ target: "x", acv: 300_000, dryRun: true });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
