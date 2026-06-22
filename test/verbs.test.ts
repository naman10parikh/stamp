// B4 — the 6 remaining verbs' brain-grounded contracts (EM JTBD-3..7,2/11). Each test
// pins the SPECIFIC opinion/pitfall the golden eval tasks grade against (G3/G5/G6/G7/G9/
// G11/G12), not a generic shape.

import { describe, expect, it } from "vitest";
import {
  advise,
  assessResidency,
  designAuditLog,
  draftQuestionnaire,
  planDsar,
  runAccessReview,
} from "../src/lib/verbs.js";

describe("stamp audit-log (EM JTBD-4; OP O8/O9)", () => {
  it("designs a tamper-EVIDENT trail with an accountable-human span field (G3)", () => {
    const d = designAuditLog("design");
    expect(d.span_schema.human_owner).toBeDefined();
    expect(d.span_schema.before_hash).toBeDefined();
    expect(d.span_schema.after_hash).toBeDefined();
    expect(d.properties_required.join(" ")).toMatch(/tamper-EVIDENT/);
    expect(d.properties_required.join(" ")).toMatch(/SIEM/);
  });
  it("check-mode flags 'we have logs' is not an audit trail (KP P8)", () => {
    const d = designAuditLog("check", "/some/config");
    expect(d.gaps?.join(" ")).toMatch(/NOT an audit trail/i);
  });
});

describe("stamp access-review (EM JTBD-3/9; OP O17/O19)", () => {
  it("scopes AGENT identities and PROPOSES revokes — never auto-revokes (G5/G6)", () => {
    const r = runAccessReview("agents", false);
    expect(r.identities_in_scope.join(" ")).toMatch(/agent identity/i);
    expect(r.action_gradient).toMatch(/PROPOSES/);
    expect(r.requires_human_approval).toBe(true);
    // The defining boundary: the output must not bless automated revocation.
    expect(JSON.stringify(r).toLowerCase()).not.toContain("auto-revoke");
  });
  it("--scim routes the MECHANISM fix to badge, keeps reconciliation as posture (G13)", () => {
    const r = runAccessReview("agents", true);
    expect(r.scim_reconciliation).toMatch(/badge/);
    expect(r.scim_reconciliation).toMatch(/reconciliation/i);
  });
});

describe("stamp residency (EM JTBD-5; OP O11/O12)", () => {
  it("asks residency-vs-sovereignty first and pins the WHOLE pipeline incl. LLM + tax (G7/G8)", () => {
    const r = assessResidency("ask");
    expect(r.first_question).toMatch(/residency or sovereignty/i);
    const pipeline = r.whole_pipeline_pins.join(" ");
    expect(pipeline).toMatch(/LLM/);
    expect(pipeline).toMatch(/tax/);
    expect(r.byok_lever).toMatch(/BYOK|CMK/);
  });
});

describe("stamp dsar (EM JTBD-6; OP O13)", () => {
  it("states the GDPR 1-month→3 clock and requires a human signature (G9)", () => {
    const p = planDsar("erasure");
    expect(p.clock).toMatch(/1 month/);
    expect(p.clock).toMatch(/3/);
    expect(p.requires_human_signature).toBe(true);
    expect(p.exemptions?.length).toBeGreaterThan(0);
    expect(p.steps.join(" ")).toMatch(/subprocessor register/);
  });
});

describe("stamp questionnaire (EM JTBD-7; OP O20/O22)", () => {
  it("marks every answer DRAFT — human signs, and rejects AI-only pen-tests (G11/G12)", () => {
    const q = draftQuestionnaire("caiq");
    expect(q.signature_required).toMatch(/human MUST sign/i);
    for (const a of q.answers) expect(a.draft_answer).toMatch(/DRAFT/);
    expect(q.pentest_note).toMatch(/NEVER claim AI-pentest/i);
  });
});

describe("stamp advise (EM JTBD-2/11; OP O5/O25)", () => {
  it("gives a decision with an honest cost and a re-verify caveat, not a feature table", () => {
    const a = advise("grc-platform");
    expect(a.recommendation).toMatch(/Vanta/);
    expect(a.honest_cost.length).toBeGreaterThan(0);
    expect(a.caveat).toMatch(/directional/);
  });
  it("repos advice checks pushed_at not stars (OP O25)", () => {
    const a = advise("repos");
    expect(a.honest_cost).toMatch(/pushed_at/);
    expect(a.honest_cost).toMatch(/stars/);
  });
});
