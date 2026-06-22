#!/usr/bin/env node
// run.mjs — stamp's eval-pyramid CLI gate (`npm run eval`; PLAN §6 / §9 + HARNESS-OVERRIDES §9).
//
// Runs, in order, against the REAL deterministic handlers (the same pure libs the CLI calls):
//   L1 — structural assertions: audit returns a control-mapped finding; sso-plan emits the
//        checklist + badge handoff (and NO SAML code); residency enumerates the whole pipeline;
//        questionnaire marks every answer "DRAFT — human signs". (The non-negotiable shapes.)
//   L2 — the binary golden tasks from eval/golden-tasks.json, graded by eval/grade.mjs against
//        the EXTERNAL key (required/forbidden phrases from the brain Resolution text) — F1>=0.8,
//        NO self-grading. The CI-blocking subset (G1-G9, G11, G12, G13) is asserted hard.
//   L3 — delegated to eval/l3-judge.mjs (LLM-judge on the trajectory tasks). Key-gated +
//        NON-blocking (the bar is $0/no-creds per D15); summarized here, never fails the gate.
//
// Prints `pass N / fail 0` and exits 0 on all-green; exits non-zero if ANY L1 assert or any
// CI-blocking golden task fails (so a broken golden Resolution turns the gate red — the bite).
//
// Self-sufficient: if dist/ is absent it runs `pnpm build` once, so a bare `npm run eval` on a
// fresh checkout works (the acceptance/CI job also builds first).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

// ── ensure the compiled lib exists (eval grades the REAL handlers) ────────────────
const distLib = join(repoRoot, "dist", "lib");
if (!existsSync(join(distLib, "control-mapper.js"))) {
  process.stdout.write("[eval] dist/ missing — building once…\n");
  const b = spawnSync("pnpm", ["build"], { cwd: repoRoot, encoding: "utf8", stdio: "inherit" });
  if (b.status !== 0) {
    process.stderr.write("[eval] build failed — cannot run eval\n");
    process.exit(1);
  }
}

const { scanForGaps } = await import(join(distLib, "control-mapper.js"));
const { planSsoProgram } = await import(join(distLib, "sso-program.js"));
const {
  designAuditLog,
  runAccessReview,
  assessResidency,
  planDsar,
  draftQuestionnaire,
  advise,
} = await import(join(distLib, "verbs.js"));
const { gradeGolden } = await import("./grade.mjs");

const J = (x) => JSON.stringify(x);

// ── handler dispatch (golden-task "handler" → its serialized deterministic output) ──
function runHandler(handler, args) {
  switch (handler) {
    case "audit":
      return J(scanForGaps(args.path, args.framework ?? "soc2"));
    case "sso-plan":
      return J(planSsoProgram({ target: args.target, acv: args.acv ?? null, dryRun: args.dryRun }));
    case "audit-log":
      return J(designAuditLog(args.mode ?? "design", args.path));
    case "access-review":
      return J(runAccessReview(args.scope ?? "all", args.scim ?? false));
    case "residency":
      return J(assessResidency(args.mode ?? "ask", args.path));
    case "dsar":
      return J(planDsar(args.type ?? "access"));
    case "questionnaire":
      return J(draftQuestionnaire(args.format ?? "caiq", args.kb));
    case "advise":
      return J(advise(args.on));
    default:
      throw new Error(`unknown handler: ${handler}`);
  }
}

// ── L1: structural assertions (the non-negotiable shapes) ─────────────────────────
const l1 = [];
function assert(name, cond, detail = "") {
  l1.push({ name, ok: !!cond, detail });
}

{
  const gap = scanForGaps("test/fixtures/app-under-audit", "soc2");
  const controls = gap.findings.map((f) => f.control);
  assert("L1.audit: control-mapped finding (CC7.2 + CC6.3)", controls.includes("CC7.2") && controls.includes("CC6.3"), controls.join(","));
  assert('L1.audit: never the word "compliant"', !J(gap).toLowerCase().includes('"compliant"'));
  assert("L1.audit: every finding has severity + fix", gap.findings.every((f) => f.severity && f.fix));

  const sso = planSsoProgram({ acv: 300000, dryRun: true });
  assert("L1.sso-plan: build-now deal-blocker @ $300k", /build now/i.test(sso.trigger_decision) && /deal-block/i.test(sso.trigger_decision));
  assert("L1.sso-plan: buyer-readiness checklist >= 10", sso.buyer_readiness_checklist.length >= 10, String(sso.buyer_readiness_checklist.length));
  assert("L1.sso-plan: badge_handoff present", /badge init/.test(sso.badge_handoff), sso.badge_handoff);
  assert("L1.sso-plan: NO SAML/ACS/SCIM code (boundary)", !/ACS|SAMLResponse|samlp:|<saml|new SAML|class .*SCIM/.test(J(sso)));

  const res = assessResidency("ask");
  const resStr = J(res).toLowerCase();
  assert("L1.residency: enumerates the WHOLE pipeline (audit log + LLM + tax + backups)", ["audit log", "llm inference call", "tax", "backups", "subprocessor"].every((p) => resStr.includes(p)));

  const q = draftQuestionnaire("caiq");
  assert('L1.questionnaire: every answer marked "DRAFT" + human signs', q.answers.length > 0 && q.answers.every((a) => /DRAFT/.test(a.draft_answer)) && /sign/i.test(q.signature_required));

  const ar = runAccessReview("agents", false);
  assert("L1.access-review: PROPOSES (never auto-revoke)", /PROPOSES/i.test(J(ar)) && !/auto-revoke/i.test(J(ar)));
}

// ── L2: the golden tasks (binary, external-key graded; no self-grading) ───────────
const goldenData = JSON.parse(readFileSync(join(here, "golden-tasks.json"), "utf8"));
const f1Threshold = goldenData.f1_threshold ?? 0.8;
const tasks = goldenData.tasks;

const l2 = [];
for (const task of tasks) {
  let output;
  try {
    output = runHandler(task.handler, task.args ?? {});
  } catch (err) {
    l2.push({ id: task.id, ci_block: task.ci_block, passed: false, f1: 0, missing: [`handler error: ${err.message}`], forbiddenHit: [] });
    continue;
  }
  const g = gradeGolden(task, output, f1Threshold);
  l2.push({ ...g, ci_block: task.ci_block, level: task.level });
}

// ── report + gate ─────────────────────────────────────────────────────────────────
process.stdout.write("\n=== stamp eval — L1 structural ===\n");
for (const a of l1) process.stdout.write(`  ${a.ok ? "PASS" : "FAIL"}  ${a.name}${a.ok ? "" : `  [${a.detail}]`}\n`);

process.stdout.write("\n=== stamp eval — L2 golden tasks (F1 >= " + f1Threshold + ", no self-grading) ===\n");
for (const g of l2) {
  const flag = g.ci_block ? "[CI]" : "    ";
  const why = g.passed ? "" : `  missing=${J(g.missing)}${g.forbiddenHit.length ? ` forbidden=${J(g.forbiddenHit)}` : ""}`;
  process.stdout.write(`  ${g.passed ? "PASS" : "FAIL"} ${flag} ${g.id} (F1=${g.f1})${why}\n`);
}

const l1Fail = l1.filter((a) => !a.ok).length;
const l2Fail = l2.filter((g) => !g.passed).length;
const l2CiFail = l2.filter((g) => g.ci_block && !g.passed).length;
const l1Pass = l1.length - l1Fail;
const l2Pass = l2.length - l2Fail;

// L3 (non-blocking, key-gated) — summarize only.
const hasKey = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() && !process.env.ANTHROPIC_API_KEY.includes("sk-ant-..."));
process.stdout.write("\n=== stamp eval — L3 LLM-judge (trajectory; non-blocking, key-gated per D15) ===\n");
process.stdout.write(hasKey
  ? "  ANTHROPIC_API_KEY present — run `node eval/l3-judge.mjs` for the calibrated judge (advisory, never blocks the gate).\n"
  : "  skipped (no ANTHROPIC_API_KEY) — L3 is additive/non-blocking; the L1+L2 gate is the $0/no-creds floor (D15).\n");

// The gate bites on ANY L1 failure or ANY CI-blocking golden failure.
const totalPass = l1Pass + l2Pass;
const totalFail = l1Fail + l2Fail;
const gateFail = l1Fail + l2CiFail;

process.stdout.write(`\npass ${totalPass} / fail ${gateFail === 0 ? 0 : totalFail}\n`);
if (gateFail > 0) {
  process.stdout.write(`GATE RED — ${l1Fail} L1 + ${l2CiFail} CI-blocking golden failure(s).\n`);
  process.exit(1);
}
if (l2Fail > 0) {
  // Non-CI-blocking golden failures are advisory — report but stay green.
  process.stdout.write(`(note: ${l2Fail} non-CI-blocking golden task(s) below F1 — advisory, gate stays green)\n`);
}
process.stdout.write("GATE GREEN — all L1 structural + all CI-blocking golden tasks pass.\n");
process.exit(0);
