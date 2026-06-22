// `stamp dsar --type access|erasure [--json]`
// Classify→verify→exemptions→draft→route across the subprocessor register on the
// GDPR/CCPA clock; a human signs (EM JTBD-6; OP O13).

import { Command } from "commander";
import { planDsar, type DsarPlan } from "../../lib/verbs.js";
import { jtbdFor } from "../../lib/constants.js";
import { withRunLog } from "../../lib/runlog.js";
import { bullets, emit } from "../output.js";

export function registerDsar(program: Command): void {
  program
    .command("dsar")
    .description("plan a DSAR (access|erasure): clock + subprocessor routing + exemptions; a human signs")
    .option("--type <type>", "access | erasure", "access")
    .option("--json", "emit machine-parseable JSON", false)
    .action(async (opts: { type: string; json: boolean }) => {
      const type = opts.type === "erasure" ? "erasure" : "access";
      const result = await withRunLog("dsar", jtbdFor("dsar"), () => planDsar(type));
      emit(result, opts, renderDsar);
    });
}

function renderDsar(r: DsarPlan): string {
  const out = [
    `stamp dsar — type: ${r.type}`,
    `Clock: ${r.clock}`,
    bullets("Steps:", r.steps),
    `Subprocessor register: ${r.subprocessor_register_note}`,
  ];
  if (r.exemptions) out.push(bullets("Erasure exemptions:", r.exemptions));
  out.push(`Requires human signature: ${r.requires_human_signature}`);
  out.push(`Cite: ${r.brain_cite}`);
  return out.join("\n");
}
