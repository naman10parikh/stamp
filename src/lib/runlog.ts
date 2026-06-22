// runlog — stamp's append-only, accountable-human-attributed run trail.
//
// stamp DOGFOODS its own load-bearing control here: OP O9 / BTS S6 / EM 4.4 say every
// privileged agent action must tie to an accountable HUMAN, never "the agent did it".
// So every stamp invocation appends one line carrying `human_owner` (required), the same
// audit-side discipline stamp sells. This is the shared logger the CLI + dispatch + RSI
// all write through (the early cross-cluster dependency for Cluster B's CLI stream).

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// repo root = two levels up from dist/lib/ (or src/lib/ at type-check time).
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");

export const RUNLOG_PATH = join(repoRoot, "logs", "runs.jsonl");

/** One run record. `human_owner` is REQUIRED — the accountable-human field (OP O9). */
export interface RunRecord {
  readonly ts: string;
  readonly cmd: string;
  readonly jtbd: number;
  readonly model: string;
  readonly duration_ms: number;
  readonly outcome: "ok" | "error";
  readonly human_owner: string;
}

/**
 * Resolve the accountable human for this run. NEVER returns "agent"/"system" — an
 * unattributable action is itself the CC6 gap stamp warns about (EM 4.4). Resolution
 * order: explicit env → OS user → an explicit "unattributed" sentinel a reviewer can grep.
 */
export function resolveHumanOwner(): string {
  const explicit = process.env.STAMP_HUMAN_OWNER?.trim();
  if (explicit) return explicit;
  const osUser = (process.env.USER || process.env.LOGNAME || process.env.USERNAME)?.trim();
  if (osUser) return osUser;
  return "unattributed-human-required";
}

/**
 * Resolve the model for this run with an EXPLICIT default (model-routing rule: no bare
 * default). Honors the session pin (`ANTHROPIC_MODEL`) when present; the CLI itself is
 * deterministic/tokenless, so the field records the routing context, not a live call.
 */
export function resolveModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-8[1m]";
}

/** Append one run record to logs/runs.jsonl (append-only; creates logs/ if absent). */
export function appendRun(rec: RunRecord): void {
  const dir = dirname(RUNLOG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(RUNLOG_PATH, JSON.stringify(rec) + "\n", "utf8");
}

/**
 * Convenience: time a command, append its run line, and return the result. Records
 * outcome="error" + re-throws on failure so the trail has no silent gaps (EM 4.5).
 */
export async function withRunLog<T>(
  cmd: string,
  jtbd: number,
  fn: () => Promise<T> | T,
): Promise<T> {
  const start = Date.now();
  const ts = new Date().toISOString();
  const model = resolveModel();
  const human_owner = resolveHumanOwner();
  try {
    const result = await fn();
    appendRun({ ts, cmd, jtbd, model, duration_ms: Date.now() - start, outcome: "ok", human_owner });
    return result;
  } catch (err) {
    appendRun({ ts, cmd, jtbd, model, duration_ms: Date.now() - start, outcome: "error", human_owner });
    throw err;
  }
}

export interface RunsSummary {
  readonly total: number;
  readonly ok: number;
  readonly error: number;
  readonly by_cmd: Record<string, number>;
  readonly unattributed: number;
}

/** Read + aggregate the run trail (the `stamp runs` view). Tolerant of a missing file. */
export function aggregateRuns(sinceTs?: string): RunsSummary {
  const summary = { total: 0, ok: 0, error: 0, by_cmd: {} as Record<string, number>, unattributed: 0 };
  if (!existsSync(RUNLOG_PATH)) return summary;
  const lines = readFileSync(RUNLOG_PATH, "utf8").split("\n").filter((l) => l.trim().length > 0);
  for (const line of lines) {
    let rec: RunRecord;
    try {
      rec = JSON.parse(line) as RunRecord;
    } catch {
      // Skip a malformed line rather than crash the view (chaos-resilience).
      continue;
    }
    if (sinceTs && rec.ts < sinceTs) continue;
    summary.total += 1;
    if (rec.outcome === "ok") summary.ok += 1;
    else summary.error += 1;
    summary.by_cmd[rec.cmd] = (summary.by_cmd[rec.cmd] ?? 0) + 1;
    if (!rec.human_owner || rec.human_owner === "unattributed-human-required") summary.unattributed += 1;
  }
  return summary;
}
