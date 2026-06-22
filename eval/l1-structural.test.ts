// l1-structural.test.ts — the eval pyramid as RED-BLOCKING Vitest (HARNESS-OVERRIDES §9).
//
// `eval/run.mjs` is the standalone `npm run eval` CLI gate; THIS file runs the SAME L1
// structural assertions + the L2 golden tasks inside Vitest, so they are red-blocking in the
// `pnpm test` CI job too (qa-zero-tolerance). It imports the REAL deterministic libs from
// src/ (Vitest transforms TS directly — no build needed) and the shared grader from grade.mjs.
//
// NO SELF-GRADING: L2 grades each verb's OUTPUT against the external key in golden-tasks.json
// (required/forbidden phrases from the brain Resolution text), never the verb/LLM grading itself.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { scanForGaps } from "../src/lib/control-mapper.js";
import { planSsoProgram } from "../src/lib/sso-program.js";
import {
  designAuditLog,
  runAccessReview,
  assessResidency,
  planDsar,
  draftQuestionnaire,
  advise,
  type AdviseTopic,
} from "../src/lib/verbs.js";
// @ts-expect-error — grade.mjs is plain JS (the shared runtime grader), typed via grade.ts.
import { gradeGolden } from "./grade.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const J = (x: unknown) => JSON.stringify(x);

// ── L1: structural assertions (the non-negotiable shapes) ─────────────────────────
describe("eval L1 — structural assertions on the real handlers", () => {
  it("audit returns a control-mapped finding (CC7.2 + CC6.3), severity+fix, never 'compliant'", () => {
    const gap = scanForGaps("test/fixtures/app-under-audit", "soc2");
    const controls = gap.findings.map((f) => f.control);
    expect(controls).toContain("CC7.2");
    expect(controls).toContain("CC6.3");
    expect(gap.findings.every((f) => f.severity && f.fix.length > 0)).toBe(true);
    expect(J(gap).toLowerCase()).not.toContain('"compliant"');
  });

  it("sso-plan @ $300k → build-now deal-blocker + >=10 checklist + badge handoff + NO SAML code", () => {
    const sso = planSsoProgram({ acv: 300_000, dryRun: true });
    expect(sso.trigger_decision).toMatch(/build now/i);
    expect(sso.trigger_decision).toMatch(/deal-block/i);
    expect(sso.buyer_readiness_checklist.length).toBeGreaterThanOrEqual(10);
    expect(sso.badge_handoff).toMatch(/badge init/);
    expect(J(sso)).not.toMatch(/ACS|SAMLResponse|samlp:|<saml|new SAML|class .*SCIM/);
  });

  it("residency enumerates the WHOLE pipeline (audit log + LLM call + tax + backups + subprocessor)", () => {
    const s = J(assessResidency("ask")).toLowerCase();
    for (const p of ["audit log", "llm inference call", "tax", "backups", "subprocessor"]) {
      expect(s).toContain(p);
    }
  });

  it('questionnaire marks every answer "DRAFT" and requires a human signature', () => {
    const q = draftQuestionnaire("caiq");
    expect(q.answers.length).toBeGreaterThan(0);
    expect(q.answers.every((a) => /DRAFT/.test(a.draft_answer))).toBe(true);
    expect(q.signature_required).toMatch(/sign/i);
  });

  it("access-review PROPOSES revokes (never auto-revoke) and scopes to agent identities", () => {
    const ar = J(runAccessReview("agents", false));
    expect(ar).toMatch(/PROPOSES/i);
    expect(ar).not.toMatch(/auto-revoke/i);
    expect(ar.toLowerCase()).toContain("agent identit");
  });

  it("audit-log design carries the accountable-human tuple + tamper-EVIDENT + SIEM export", () => {
    const al = J(designAuditLog("design")).toLowerCase();
    for (const p of ["human_owner", "agent_id", "tamper-evident", "siem", "hash"]) {
      expect(al).toContain(p);
    }
  });
});

// ── L2: golden tasks (binary, external-key graded) ────────────────────────────────
interface GoldenTask {
  id: string;
  level: string;
  ci_block: boolean;
  handler: string;
  args: Record<string, unknown>;
  required_phrases: string[];
  forbidden_phrases: string[];
}
const golden = JSON.parse(readFileSync(join(here, "golden-tasks.json"), "utf8")) as {
  f1_threshold: number;
  tasks: GoldenTask[];
};

function runHandler(handler: string, args: Record<string, unknown>): string {
  switch (handler) {
    case "audit":
      return J(scanForGaps(args.path as string, (args.framework as string) ?? "soc2"));
    case "sso-plan":
      return J(planSsoProgram({ target: args.target as string, acv: (args.acv as number) ?? null, dryRun: args.dryRun as boolean }));
    case "audit-log":
      return J(designAuditLog((args.mode as "design" | "check") ?? "design", args.path as string));
    case "access-review":
      return J(runAccessReview((args.scope as "all" | "privileged" | "agents") ?? "all", (args.scim as boolean) ?? false));
    case "residency":
      return J(assessResidency((args.mode as "ask" | "check") ?? "ask", args.path as string));
    case "dsar":
      return J(planDsar((args.type as "access" | "erasure") ?? "access"));
    case "questionnaire":
      return J(draftQuestionnaire((args.format as "sig" | "caiq" | "vsa") ?? "caiq", args.kb as string));
    case "advise":
      return J(advise(args.on as AdviseTopic));
    default:
      throw new Error(`unknown handler: ${handler}`);
  }
}

describe("eval L2 — golden tasks (F1 >= threshold vs the brain Resolution, no self-grading)", () => {
  for (const task of golden.tasks) {
    const label = `${task.id} (${task.level}${task.ci_block ? ", CI-blocking" : ""})`;
    it(`${label} resolves the way the BTS Resolution requires`, () => {
      const output = runHandler(task.handler, task.args ?? {});
      const g = gradeGolden(task, output, golden.f1_threshold);
      // Every golden task is authored to be fully resolvable → expect F1 == 1 and no forbidden hit.
      expect(g.forbiddenHit, `forbidden phrase(s) leaked: ${J(g.forbiddenHit)}`).toEqual([]);
      expect(g.f1, `missing required phrase(s): ${J(g.missing)}`).toBeGreaterThanOrEqual(golden.f1_threshold);
    });
  }

  it("the CI-blocking subset is exactly G1-G9, G11, G12, G13 (PLAN §6)", () => {
    const ciBlock = golden.tasks.filter((t) => t.ci_block).map((t) => t.id).sort();
    expect(ciBlock).toEqual(["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G11", "G12", "G13"].sort());
  });
});
