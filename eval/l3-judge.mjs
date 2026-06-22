#!/usr/bin/env node
// l3-judge.mjs — the L3 calibrated LLM-judge over stamp's TRAJECTORY golden tasks (runtime).
//
// L3 (Hamel's top of the pyramid) judges the tasks whose "right answer" is a JUDGMENT, not a
// keyword match: G4/G6/G7/G9/G12/G13 (accountable-human attribution, propose-not-revoke,
// whole-pipeline residency, the DSAR clock+exemptions, Trust-Center+KB, reconciliation-vs-pipe).
// An LLM judge reads the verb's output + the BTS *Resolution* and returns a binary verdict +
// reason — calibrated against the SAME external resolution the L2 grader uses (no self-grading:
// the judge is given the rubric, it does not invent one, and the verb does not grade itself).
//
// NON-BLOCKING + KEY-GATED (D15): the $0/no-creds floor is L1+L2 (eval/run.mjs). This judge runs
// ONLY when ANTHROPIC_API_KEY is set, and is ADVISORY — it never fails CI. It exists so that when
// the key is present (local / the optional smoke), the trajectory tasks get a real judgment pass.
//
//   ANTHROPIC_API_KEY=… node eval/l3-judge.mjs        → judge the trajectory tasks, print verdicts
//   node eval/l3-judge.mjs                            → skip cleanly (no key), exit 0

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

// Model: explicit, no bare default (model-routing rule; CP123 D12 — Opus 4.8 1M).
const JUDGE_MODEL = process.env.STAMP_JUDGE_MODEL?.trim() || "claude-opus-4-8[1m]";

// The trajectory tasks L3 judges (PLAN §6 — the judgment ones, not the keyword ones).
const TRAJECTORY_IDS = new Set(["G4", "G6", "G7", "G9", "G12", "G13"]);

const key = process.env.ANTHROPIC_API_KEY?.trim();
const keyUsable = !!key && !key.includes("sk-ant-...");
if (!keyUsable) {
  process.stdout.write("[l3-judge] skipped — no usable ANTHROPIC_API_KEY. L3 is non-blocking (D15); the L1+L2 gate (npm run eval) is the $0 floor.\n");
  process.exit(0);
}

// Ensure dist (the judge runs the real handlers to get the trajectory output to judge).
const distLib = join(repoRoot, "dist", "lib");
if (!existsSync(join(distLib, "verbs.js"))) {
  const b = spawnSync("pnpm", ["build"], { cwd: repoRoot, encoding: "utf8", stdio: "inherit" });
  if (b.status !== 0) {
    process.stderr.write("[l3-judge] build failed\n");
    process.exit(0); // non-blocking even on build hiccup — L3 never fails CI
  }
}

const { scanForGaps } = await import(join(distLib, "control-mapper.js"));
const { planSsoProgram } = await import(join(distLib, "sso-program.js"));
const { designAuditLog, runAccessReview, assessResidency, planDsar, draftQuestionnaire, advise } = await import(join(distLib, "verbs.js"));

function runHandler(handler, args) {
  const J = (x) => JSON.stringify(x);
  switch (handler) {
    case "audit": return J(scanForGaps(args.path, args.framework ?? "soc2"));
    case "sso-plan": return J(planSsoProgram({ target: args.target, acv: args.acv ?? null, dryRun: args.dryRun }));
    case "audit-log": return J(designAuditLog(args.mode ?? "design", args.path));
    case "access-review": return J(runAccessReview(args.scope ?? "all", args.scim ?? false));
    case "residency": return J(assessResidency(args.mode ?? "ask", args.path));
    case "dsar": return J(planDsar(args.type ?? "access"));
    case "questionnaire": return J(draftQuestionnaire(args.format ?? "caiq", args.kb));
    case "advise": return J(advise(args.on));
    default: throw new Error(`unknown handler: ${handler}`);
  }
}

const golden = JSON.parse(readFileSync(join(here, "golden-tasks.json"), "utf8"));
const tasks = golden.tasks.filter((t) => TRAJECTORY_IDS.has(t.id));

/** Call the Anthropic Messages API as a binary judge. Returns {verdict, reason} or null on error. */
async function judge(task, output) {
  const system =
    "You are a CALIBRATED compliance-eval judge. You are given a compliance employee's OUTPUT for a task, " +
    "and the REQUIRED resolution behaviors (the rubric). Decide if the output satisfies the rubric. " +
    "Reply with EXACTLY one line: PASS <one-clause reason>  OR  FAIL <one-clause reason>. Do not grade yourself; " +
    "grade strictly against the provided rubric.";
  const user =
    `TASK: ${task.task}\n\n` +
    `RUBRIC — the output MUST reflect ALL of: ${task.required_phrases.join("; ")}\n` +
    `RUBRIC — the output MUST NOT contain: ${task.forbidden_phrases.join("; ") || "(none)"}\n\n` +
    `OUTPUT TO JUDGE:\n${output.slice(0, 6000)}`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: JUDGE_MODEL,
        max_tokens: 100,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) {
      process.stderr.write(`[l3-judge] ${task.id}: API ${res.status} (non-blocking)\n`);
      return null;
    }
    const data = await res.json();
    const text = (data?.content?.[0]?.text ?? "").trim();
    const verdict = /^PASS\b/i.test(text) ? "PASS" : /^FAIL\b/i.test(text) ? "FAIL" : "UNCLEAR";
    return { verdict, reason: text.replace(/^(PASS|FAIL)\s*/i, "").slice(0, 160) };
  } catch (err) {
    process.stderr.write(`[l3-judge] ${task.id}: ${err.message} (non-blocking)\n`);
    return null;
  }
}

process.stdout.write(`[l3-judge] judging ${tasks.length} trajectory tasks with model=${JUDGE_MODEL} (advisory, non-blocking)\n`);
let pass = 0, fail = 0, errored = 0;
for (const task of tasks) {
  const output = runHandler(task.handler, task.args ?? {});
  const v = await judge(task, output);
  if (!v) { errored += 1; process.stdout.write(`  ?    ${task.id} — judge unavailable\n`); continue; }
  if (v.verdict === "PASS") pass += 1; else fail += 1;
  process.stdout.write(`  ${v.verdict === "PASS" ? "PASS" : "FAIL"} ${task.id} — ${v.reason}\n`);
}
process.stdout.write(`[l3-judge] advisory result: ${pass} pass / ${fail} fail / ${errored} unavailable (L3 NEVER blocks CI — D15)\n`);
process.exit(0); // always green — L3 is advisory
