// `stamp residency [--ask] [--check <path>] [--json]`
// Ask "residency or sovereignty?" first; enumerate the whole pipeline (incl. LLM + tax)
// + the BYOK/CMK lever (EM JTBD-5; OP O11/O12).

import { Command } from "commander";
import { assessResidency, type ResidencyPosture } from "../../lib/verbs.js";
import { jtbdFor } from "../../lib/constants.js";
import { withRunLog } from "../../lib/runlog.js";
import { bullets, emit } from "../output.js";

export function registerResidency(program: Command): void {
  program
    .command("residency")
    .description('ask "residency or sovereignty?"; enumerate whole-pipeline pinning + the BYOK/CMK lever')
    .option("--ask", "ask-mode: the posture questions + the full pipeline (default)", false)
    .option("--check <path>", "check a target for residency gaps")
    .option("--json", "emit machine-parseable JSON", false)
    .action(async (opts: { ask?: boolean; check?: string; json: boolean }) => {
      const mode: "ask" | "check" = opts.check ? "check" : "ask";
      const result = await withRunLog("residency", jtbdFor("residency"), () => assessResidency(mode, opts.check));
      emit(result, opts, renderResidency);
    });
}

function renderResidency(r: ResidencyPosture): string {
  const out = [
    `stamp residency — ${r.mode === "ask" ? "posture" : "check"}`,
    `First question: ${r.first_question}`,
    `Residency vs sovereignty: ${r.residency_vs_sovereignty}`,
    bullets("Whole-pipeline pins:", r.whole_pipeline_pins),
    bullets("Most forgotten:", r.most_forgotten),
    `BYOK lever: ${r.byok_lever}`,
    `Guardrail: ${r.guardrail}`,
  ];
  if (r.gaps) out.push(bullets("Gaps:", r.gaps));
  out.push(`Cite: ${r.brain_cite}`);
  return out.join("\n");
}
