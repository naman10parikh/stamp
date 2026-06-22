// `stamp sso-plan --target <app> [--acv <n>] [--dry-run] [--json]`
// Enterprise-SSO PROGRAM plan (acceptance-test half 2; EM JTBD-8). Emits NO SAML code —
// only the program decision + checklist + WorkOS plan + deprovisioning spec + badge handoff.

import { Command } from "commander";
import { planSsoProgram, type SsoProgramPlan } from "../../lib/sso-program.js";
import { jtbdFor } from "../../lib/constants.js";
import { withRunLog } from "../../lib/runlog.js";
import { bullets, emit } from "../output.js";

export function registerSsoPlan(program: Command): void {
  program
    .command("sso-plan")
    .description("emit the enterprise-SSO program plan + the badge handoff (mechanism → badge)")
    .option("--target <path>", "the app the program is for")
    .option("--acv <n>", "the deal's annual contract value (drives the build-now trigger)", parseAcv)
    .option("--dry-run", "plan only — never executes (the program is advisory)", false)
    .option("--json", "emit machine-parseable JSON", false)
    .action(async (opts: { target?: string; acv?: number; dryRun?: boolean; json: boolean }) => {
      const plan = await withRunLog("sso-plan", jtbdFor("sso-plan"), () =>
        planSsoProgram({ target: opts.target, acv: opts.acv ?? null, dryRun: opts.dryRun }),
      );
      emit(plan, opts, renderSso);
    });
}

function parseAcv(raw: string): number {
  const n = Number(raw.replace(/[,_$]/g, ""));
  if (!Number.isFinite(n)) throw new Error(`--acv must be a number, got ${JSON.stringify(raw)}`);
  return n;
}

function renderSso(p: SsoProgramPlan): string {
  return [
    `stamp sso-plan — enterprise-SSO PROGRAM`,
    ``,
    `Trigger: ${p.trigger_decision}`,
    ``,
    bullets("Buyer-readiness checklist:", p.buyer_readiness_checklist),
    ``,
    bullets("WorkOS wiring plan (steps, not code):", p.workos_wiring_plan),
    ``,
    bullets("Deprovisioning-proof spec:", p.deprovisioning_proof_spec),
    ``,
    `Badge handoff (the mechanism): ${p.badge_handoff}`,
    `Boundary: ${p.boundary_note}`,
    `SSO-tax stance: ${p.sso_tax_stance}`,
    `Cite: ${p.brain_cite}`,
  ].join("\n");
}
