// `stamp runs [--since <ts>] [--json]`
// Aggregate logs/runs.jsonl (the observability view — stamp dogfooding its own trail).

import { Command } from "commander";
import { aggregateRuns, type RunsSummary } from "../../lib/runlog.js";
import { emit } from "../output.js";

export function registerRuns(program: Command): void {
  program
    .command("runs")
    .description("aggregate the append-only run trail (logs/runs.jsonl)")
    .option("--since <ts>", "only count runs at/after this ISO timestamp")
    .option("--json", "emit machine-parseable JSON", false)
    .action((opts: { since?: string; json: boolean }) => {
      // Read-only view — intentionally NOT logged (it would be self-referential noise).
      const summary = aggregateRuns(opts.since);
      emit(summary, opts, renderRuns);
    });
}

function renderRuns(r: RunsSummary): string {
  const byCmd = Object.entries(r.by_cmd)
    .map(([cmd, n]) => `  ${cmd}: ${n}`)
    .join("\n");
  return [
    `stamp runs — ${r.total} run(s): ${r.ok} ok / ${r.error} error`,
    byCmd || "  (no runs yet)",
    r.unattributed > 0 ? `  ⚠ ${r.unattributed} run(s) without an accountable human (set STAMP_HUMAN_OWNER)` : "  all runs accountable-human-attributed ✓",
  ].join("\n");
}
