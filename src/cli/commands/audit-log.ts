// `stamp audit-log [--design|--check <path>] [--json]`
// Design (or check) the tamper-EVIDENT OTel-span trail (EM JTBD-4; OP O8/O9/O10).

import { Command } from "commander";
import { designAuditLog, type AuditLogDesign } from "../../lib/verbs.js";
import { jtbdFor } from "../../lib/constants.js";
import { withRunLog } from "../../lib/runlog.js";
import { bullets, emit } from "../output.js";

export function registerAuditLog(program: Command): void {
  program
    .command("audit-log")
    .description("design the tamper-evident audit trail OR check a config for the 4 properties")
    .option("--design", "emit the span schema + hash-chain + SIEM-export design (default)", false)
    .option("--check <path>", "check a config/path against the audit-trail bar")
    .option("--json", "emit machine-parseable JSON", false)
    .action(async (opts: { design?: boolean; check?: string; json: boolean }) => {
      const mode: "design" | "check" = opts.check ? "check" : "design";
      const result = await withRunLog("audit-log", jtbdFor("audit-log"), () => designAuditLog(mode, opts.check));
      emit(result, opts, renderAuditLog);
    });
}

function renderAuditLog(r: AuditLogDesign): string {
  const schema = Object.entries(r.span_schema).map(([k, v]) => `  ${k}: ${v}`);
  const out = [
    `stamp audit-log — ${r.mode === "design" ? "tamper-EVIDENT trail design" : "config check"}`,
    `Span schema:`,
    schema.join("\n"),
    ``,
    bullets("Properties required:", r.properties_required),
    ``,
    `Hash chain: ${r.hash_chain}`,
    `SIEM export: ${r.siem_export_plan}`,
    `Accountable-human tuple: ${r.accountable_human_tuple}`,
  ];
  if (r.gaps) out.push("", bullets("Gaps:", r.gaps));
  out.push(`Cite: ${r.brain_cite}`);
  return out.join("\n");
}
