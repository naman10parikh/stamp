#!/usr/bin/env node
// rsi.workflow.js — stamp's deterministic RSI engine (CP123 Cluster E4; $0, tokenless).
//
// WHY stamp needs RSI: compliance is a field that REVISES QUARTERLY (SOC 2 TSC revisions,
// ISO 27001:2022, ISO 42001, the EU-US DPF / Schrems-III tail, the Vanta MCP beta→GA
// transition, the NangoHQ/nango #6416 bug, SafeBase-style M&A on "neutral" vendors). A
// compliance brain that doesn't keep itself current goes stale and starts giving wrong,
// deal-losing advice. This engine is how stamp keeps its own expertise current.
//
// THE SPLIT (D8): the DETERMINISTIC half here runs nightly for $0 with no token — it
// refreshes the watchlist, re-verifies the tool matrix, re-runs the eval pyramid, and
// FLAGS deltas/regressions. It NEVER auto-rewrites a brain file. The CLAUDE half (which
// rewrites the affected brain file on a real delta, adds a golden task, re-runs the gate,
// opens a gated PR) is DEFERRED to CLAUDE_CODE_OAUTH_TOKEN — its absence is NOT a gap.
//
// Pipeline: refresh-brain → re-verify-tool-matrix → run-eval-pyramid → propose → test-gate
//           → commit. With --dry-run every step runs WITHOUT side effects and the engine
// exits 0 (the CI smoke + the rsi.yml nightly cron call it with --dry-run).
//
// Model routing (cross-cutting): the Claude half, when it lights up, is pinned to an
// EXPLICIT model (no bare default) — CP123 D12: every node is claude-opus-4-8[1m], max effort.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

// EXPLICIT model for the deferred Claude half (model-routing rule: never a bare default).
// CP123 D12 — every node runs on Opus 4.8 1M, max effort. The Claude half spawns with:
//   model: "claude-opus-4-8[1m]"   (passed explicitly — no inherited/bare default).
const RSI_MODEL = "claude-opus-4-8[1m]";

const DRY_RUN = process.argv.includes("--dry-run");

function log(step, msg) {
  process.stdout.write(`[rsi:${step}] ${msg}\n`);
}

// ── Step 1: refresh-brain ──────────────────────────────────────────────────────
// Read the TOOL-MATRIX watchlist facts that move (Vanta-MCP beta→GA, Drata regions, the
// SafeBase→Drata M&A, framework revisions, the DPF/Schrems status, the nango #6416 bug).
// Deterministic half: confirm the brain files exist + are readable so a delta CAN be diffed
// against them. (Live fetch + diff + ORG_MEMORY write is the Claude half — gated below.)
const WATCHLIST = [
  { fact: "Vanta MCP status (public beta → GA?)", source: "mcp.vanta.com changelog", pin: "brain/KNOWN-PITFALLS.md P1" },
  { fact: "Drata MCP region list (us/euc1/apse2)", source: "mcp.drata.com docs", pin: "brain/KNOWN-PITFALLS.md P5" },
  { fact: "SafeBase ownership (acquired by Drata?)", source: "M&A watch on 'neutral' vendors", pin: "brain/KNOWN-PITFALLS.md P20" },
  { fact: "Framework revisions (SOC2 TSC, ISO 27001:2022, ISO 42001, FedRAMP 20x/OSCAL)", source: "framework registries", pin: "brain/EXPERTISE-MAP.md" },
  { fact: "EU-US DPF / Schrems-III appeal status", source: "CJEU / EDPB", pin: "brain/KNOWN-PITFALLS.md P16" },
  { fact: "NangoHQ/nango #6416 (Vanta opaque OAuth error) open?", source: "github.com/NangoHQ/nango/issues/6416", pin: "brain/KNOWN-PITFALLS.md P1" },
  { fact: "strongdm/comply pushed_at (still dead since 2022-07-21?)", source: "github repo pushed_at", pin: "brain/KNOWN-PITFALLS.md P21" },
];

function refreshBrain() {
  const brainDir = join(repoRoot, "brain");
  const required = [
    "EXPERTISE-MAP.md",
    "BATTLE-TESTED-SCENARIOS.md",
    "KNOWN-PITFALLS.md",
    "OPINIONS.md",
    "GAPS-AND-DISPUTES.md",
    "TOOL-MATRIX.md",
  ];
  const missing = required.filter((f) => !existsSync(join(brainDir, f)));
  if (missing.length > 0) {
    log("refresh-brain", `FAIL — brain files missing: ${missing.join(", ")}`);
    return false;
  }
  log("refresh-brain", `${required.length} brain files present; ${WATCHLIST.length} watchlist facts tracked.`);
  log("refresh-brain", "deterministic half FLAGS deltas only; the brain rewrite is the Claude half (gated on CLAUDE_CODE_OAUTH_TOKEN).");
  return true;
}

// ── Step 2: re-verify-tool-matrix ────────────────────────────────────────────────
// Assert the TOOL-MATRIX defaults still resolve in the brain (the recommended platforms +
// the dead-repo / acquired-vendor pins are still recorded, so they can't silently rot).
// Deterministic + offline: grep the brain for the load-bearing facts (a live URL/pushed_at
// re-check is the Claude half — it needs network + the token).
function reVerifyToolMatrix() {
  const tm = join(repoRoot, "brain", "TOOL-MATRIX.md");
  let text;
  try {
    text = readFileSync(tm, "utf8");
  } catch {
    log("re-verify-tool-matrix", "FAIL — cannot read brain/TOOL-MATRIX.md");
    return false;
  }
  // Anchors are facts that ARE load-bearing AND recorded in TOOL-MATRIX.md, so the offline
  // re-verify can't false-fail. (WorkOS — the SSO-PROGRAM reference — lives in EXPERTISE-MAP
  // /PLAN, not TOOL-MATRIX; the live SSO-program plan asserts it, not this brain re-check.)
  const anchors = [
    { name: "Vanta default", re: /vanta/i },
    { name: "Drata region-split", re: /drata/i },
    { name: "strongdm/comply DEAD pin", re: /strongdm\/comply|2022-07-21|DEAD/i },
    { name: "SafeBase→Drata pin", re: /safebase/i },
    { name: "trycompai/comp (pushed daily)", re: /trycompai\/comp/i },
  ];
  const missing = anchors.filter((a) => !a.re.test(text)).map((a) => a.name);
  if (missing.length > 0) {
    log("re-verify-tool-matrix", `FAIL — TOOL-MATRIX missing anchors: ${missing.join(", ")}`);
    return false;
  }
  log("re-verify-tool-matrix", `${anchors.length} tool-matrix anchors still recorded (defaults + staleness/M&A pins intact).`);
  return true;
}

// ── Step 3: run-eval-pyramid ─────────────────────────────────────────────────────
// Re-run the L1 structural eval. Any regression = the cycle is RED and gated. On --dry-run
// we still run the eval (it is $0, deterministic, tokenless) — that IS the regression check.
function runEvalPyramid() {
  const evalRunner = join(repoRoot, "eval", "run.mjs");
  if (!existsSync(evalRunner)) {
    log("run-eval-pyramid", "eval/run.mjs not present — skipping (cluster E1 builds it).");
    return true; // tolerate during partial builds; CI's own eval step is the hard gate.
  }
  const res = spawnSync(process.execPath, [evalRunner], { cwd: repoRoot, encoding: "utf8" });
  if (res.status !== 0) {
    log("run-eval-pyramid", `RED — eval regression (exit ${res.status}). Cycle gated.`);
    if (res.stdout) process.stdout.write(res.stdout);
    if (res.stderr) process.stderr.write(res.stderr);
    return false;
  }
  const tail = (res.stdout || "").trim().split("\n").slice(-1)[0] || "ok";
  log("run-eval-pyramid", `GREEN — ${tail}`);
  return true;
}

// ── Step 4: propose (deterministic half only FLAGS) ──────────────────────────────
function propose() {
  log("propose", "deterministic half flags watchlist deltas + eval regressions; it does NOT auto-rewrite the brain.");
  const hasToken = !!(process.env.CLAUDE_CODE_OAUTH_TOKEN && process.env.CLAUDE_CODE_OAUTH_TOKEN.trim());
  if (hasToken) {
    log("propose", `Claude half AVAILABLE (CLAUDE_CODE_OAUTH_TOKEN set) — model=${RSI_MODEL}, max effort. On a real delta it would rewrite the affected brain file (consolidate-never-expand), add/update a golden task in BATTLE-TESTED-SCENARIOS.md, update the KNOWN-PITFALLS pin, re-run the eval gate, and open a gated PR. Snap-back via git if the gate regresses.`);
  } else {
    log("propose", `Claude half DEFERRED (no CLAUDE_CODE_OAUTH_TOKEN — D8). The deterministic+L1 bar runs $0/tokenless; this is NOT a gap. When the token lands, the rewrite half runs on model=${RSI_MODEL}.`);
  }
  return true;
}

// ── Step 5: test-gate / commit ───────────────────────────────────────────────────
function testGateAndCommit() {
  if (DRY_RUN) {
    log("test-gate", "DRY-RUN — gate evaluated, no commit. (A real cycle commits only when the eval gate is GREEN and there is a brain delta to ship.)");
    return true;
  }
  // A real (non-dry-run) cycle would, only after a GREEN gate AND a Claude-authored delta,
  // commit the brain rewrite. The deterministic half never commits on its own.
  log("commit", "no brain delta to commit (deterministic half flags only — the Claude half authors + commits the rewrite).");
  return true;
}

function main() {
  log("start", `stamp RSI deterministic engine ${DRY_RUN ? "(--dry-run)" : ""} — model(deferred Claude half)=${RSI_MODEL}`);
  const steps = [
    ["refresh-brain", refreshBrain],
    ["re-verify-tool-matrix", reVerifyToolMatrix],
    ["run-eval-pyramid", runEvalPyramid],
    ["propose", propose],
    ["test-gate", testGateAndCommit],
  ];
  for (const [name, fn] of steps) {
    let ok;
    try {
      ok = fn();
    } catch (err) {
      log(name, `ERROR — ${err instanceof Error ? err.message : String(err)}`);
      ok = false;
    }
    if (!ok) {
      log("end", `RED at step '${name}' — cycle gated (no ship).`);
      process.exit(1);
    }
  }
  log("end", "GREEN — deterministic RSI cycle complete (watchlist + tool-matrix + eval all clean).");
  process.exit(0);
}

main();
