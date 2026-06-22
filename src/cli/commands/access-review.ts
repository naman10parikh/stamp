// `stamp access-review [--scope all|privileged|agents] [--scim] [--json]`
// UAR scoped to non-human + AGENT identities; PROPOSE revokes, human approves (EM JTBD-3/9).

import { Command } from "commander";
import { runAccessReview, type AccessReview } from "../../lib/verbs.js";
import { jtbdFor } from "../../lib/constants.js";
import { withRunLog } from "../../lib/runlog.js";
import { bullets, emit } from "../output.js";

export function registerAccessReview(program: Command): void {
  program
    .command("access-review")
    .description("run a UAR scoped to non-human + agent identities; propose revokes, a human approves")
    .option("--scope <scope>", "all | privileged | agents", "all")
    .option("--scim", "add IdP↔app deprovisioning reconciliation", false)
    .option("--json", "emit machine-parseable JSON", false)
    .action(async (opts: { scope: string; scim: boolean; json: boolean }) => {
      const scope = normalizeScope(opts.scope);
      const result = await withRunLog("access-review", jtbdFor("access-review"), () => runAccessReview(scope, opts.scim));
      emit(result, opts, renderReview);
    });
}

function normalizeScope(raw: string): "all" | "privileged" | "agents" {
  if (raw === "privileged" || raw === "agents") return raw;
  return "all";
}

function renderReview(r: AccessReview): string {
  const out = [
    `stamp access-review — scope: ${r.scope}`,
    `Inventory source: ${r.inventory_source}`,
    bullets("Identities in scope:", r.identities_in_scope),
    ``,
    `Action gradient: ${r.action_gradient}`,
    `Proposed revokes: ${r.proposed_revokes_note}`,
    `Requires human approval: ${r.requires_human_approval}`,
    `Cadence: ${r.cadence}`,
  ];
  if (r.scim_reconciliation) out.push(`SCIM reconciliation: ${r.scim_reconciliation}`);
  out.push(`Cite: ${r.brain_cite}`);
  return out.join("\n");
}
