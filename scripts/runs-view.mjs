#!/usr/bin/env node
// runs-view.mjs — the standalone aggregator over stamp's append-only run trail (E3).
//
// stamp DOGFOODS its own audit-trail-as-a-control discipline: every CLI verb + the RSI loop
// append one line to logs/runs.jsonl through src/lib/runlog.ts, and EACH line carries the
// REQUIRED `human_owner` field (the accountable-human attribution stamp sells — OP O9 / BTS S6).
// This script is the human/agent-readable view of that trail. Zero-dep, stdlib-only, so it
// works without a built dist/ (the cockpit Run-log view + `stamp runs` use the same data).
//
//   node scripts/runs-view.mjs            → human summary
//   node scripts/runs-view.mjs --json     → machine-parseable aggregate
//   node scripts/runs-view.mjs --since <ISO-ts>
//   node scripts/runs-view.mjs --tail [n] → the last n raw run lines (default 10)

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const RUNLOG_PATH = join(here, "..", "logs", "runs.jsonl");

const UNATTRIBUTED = "unattributed-human-required";

function parseArgs(argv) {
  const a = { json: false, since: undefined, tail: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--json") a.json = true;
    else if (argv[i] === "--since") a.since = argv[++i];
    else if (argv[i] === "--tail") {
      const n = Number(argv[i + 1]);
      a.tail = Number.isFinite(n) ? (i++, n) : 10;
    }
  }
  return a;
}

/** Read non-empty lines from the trail; tolerant of a missing file (no runs yet). */
function readLines() {
  if (!existsSync(RUNLOG_PATH)) return [];
  return readFileSync(RUNLOG_PATH, "utf8").split("\n").filter((l) => l.trim().length > 0);
}

/** Aggregate the trail — totals, ok/error, by-command, by-human, and the unattributed count. */
function aggregate(sinceTs) {
  const summary = {
    total: 0,
    ok: 0,
    error: 0,
    by_cmd: {},
    by_human: {},
    unattributed: 0,
    first_ts: null,
    last_ts: null,
  };
  for (const line of readLines()) {
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      continue; // skip a malformed line rather than crash the view (chaos-resilience)
    }
    if (sinceTs && rec.ts < sinceTs) continue;
    summary.total += 1;
    if (rec.outcome === "ok") summary.ok += 1;
    else summary.error += 1;
    summary.by_cmd[rec.cmd] = (summary.by_cmd[rec.cmd] ?? 0) + 1;
    const owner = rec.human_owner || UNATTRIBUTED;
    summary.by_human[owner] = (summary.by_human[owner] ?? 0) + 1;
    if (!rec.human_owner || rec.human_owner === UNATTRIBUTED) summary.unattributed += 1;
    if (!summary.first_ts || rec.ts < summary.first_ts) summary.first_ts = rec.ts;
    if (!summary.last_ts || rec.ts > summary.last_ts) summary.last_ts = rec.ts;
  }
  return summary;
}

function renderHuman(s) {
  const byCmd = Object.entries(s.by_cmd)
    .sort((a, b) => b[1] - a[1])
    .map(([cmd, n]) => `    ${cmd}: ${n}`)
    .join("\n");
  const byHuman = Object.entries(s.by_human)
    .sort((a, b) => b[1] - a[1])
    .map(([h, n]) => `    ${h}: ${n}`)
    .join("\n");
  const accountability =
    s.unattributed > 0
      ? `  ⚠ ${s.unattributed} run(s) without an accountable human — set STAMP_HUMAN_OWNER (OP O9)`
      : "  all runs accountable-human-attributed ✓ (stamp dogfooding its own CC6 rule)";
  return [
    `stamp run trail — ${s.total} run(s): ${s.ok} ok / ${s.error} error`,
    s.first_ts ? `  window: ${s.first_ts} → ${s.last_ts}` : "  (no runs yet)",
    "  by command:",
    byCmd || "    (none)",
    "  by accountable human:",
    byHuman || "    (none)",
    accountability,
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.tail !== undefined) {
    const lines = readLines();
    const n = args.tail || 10;
    for (const l of lines.slice(-n)) process.stdout.write(l + "\n");
    return;
  }

  const summary = aggregate(args.since);
  if (args.json) {
    process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
    return;
  }
  process.stdout.write(renderHuman(summary) + "\n");
}

main();
