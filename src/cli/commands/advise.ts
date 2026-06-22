// `stamp advise --on <grc-platform|privacy|pentest|residency|repos> [--json]`
// A DECISION with the honest cost (never a feature table); directional, re-verify
// (EM JTBD-2/11; OP O5/O6/O7/O25).

import { Command } from "commander";
import { advise, type Advice, type AdviseTopic } from "../../lib/verbs.js";
import { jtbdFor } from "../../lib/constants.js";
import { withRunLog } from "../../lib/runlog.js";
import { emit } from "../output.js";

const TOPICS: readonly AdviseTopic[] = ["grc-platform", "privacy", "pentest", "residency", "repos"];

export function registerAdvise(program: Command): void {
  program
    .command("advise")
    .description("a decision with the honest cost (not a feature table)")
    .requiredOption("--on <topic>", `one of: ${TOPICS.join(" | ")}`)
    .option("--json", "emit machine-parseable JSON", false)
    .action(async (opts: { on: string; json: boolean }) => {
      const topic = TOPICS.find((t) => t === opts.on);
      if (!topic) {
        throw new Error(`stamp advise: --on must be one of ${TOPICS.join(" | ")} (got ${JSON.stringify(opts.on)})`);
      }
      const result = await withRunLog("advise", jtbdFor("advise"), () => advise(topic));
      emit(result, opts, renderAdvise);
    });
}

function renderAdvise(r: Advice): string {
  return [
    `stamp advise — on: ${r.on}`,
    `Recommendation: ${r.recommendation}`,
    `Honest cost: ${r.honest_cost}`,
    r.boundary_note ? `Boundary: ${r.boundary_note}` : "",
    `Caveat: ${r.caveat}`,
    `Cite: ${r.brain_cite}`,
  ]
    .filter((l) => l.length > 0)
    .join("\n");
}
