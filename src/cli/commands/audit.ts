// `stamp audit <app|path> [--framework soc2|iso27001|hipaa] [--json]`
// SOC2-readiness gap-scan (acceptance-test half 1; EM JTBD-1). NEVER prints "compliant".

import { Command } from "commander";
import { scanForGaps, type GapReport } from "../../lib/control-mapper.js";
import { jtbdFor } from "../../lib/constants.js";
import { withRunLog } from "../../lib/runlog.js";
import { emit } from "../output.js";

export function registerAudit(program: Command): void {
  program
    .command("audit")
    .description("gap-scan a target app for SOC2-readiness → control-mapped gap report (severity + fix)")
    .argument("<path>", "path to the target app/repo to gap-scan")
    .option("--framework <framework>", "soc2 | iso27001 | hipaa", "soc2")
    .option("--json", "emit machine-parseable JSON", false)
    .action(async (path: string, opts: { framework: string; json: boolean }) => {
      const report = await withRunLog("audit", jtbdFor("audit"), () => scanForGaps(path, opts.framework));
      emit(report, opts, renderAudit);
    });
}

function renderAudit(r: GapReport): string {
  const head = `stamp audit — ${r.framework.toUpperCase()} readiness for ${r.target}`;
  const summary = r.readiness_summary;
  if (r.findings.length === 0) {
    return `${head}\n${summary}\n(no gaps in the ${r.controls_checked} load-bearing controls checked — ${r.disclaimer})`;
  }
  const lines = r.findings.map(
    (f) => `  [${f.severity.toUpperCase()}] ${f.control} (${f.family})\n      gap: ${f.evidence_gap}\n      fix: ${f.fix}\n      cite: ${f.brain_cite}`,
  );
  return `${head}\n${summary}\n\nFindings (${r.findings.length} of ${r.controls_checked} controls):\n${lines.join("\n")}\n\n${r.disclaimer}`;
}
