// stamp CLI — the employee's hands (EM JTBD-1..11; OP O23: --json on every command).
// Thin commander wrapper: registers the 10 subcommands, resolves the version, and exits
// non-zero with a clear stderr message on any error (agents never parse a human TTY).

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

import { registerAudit } from "./commands/audit.js";
import { registerSsoPlan } from "./commands/sso-plan.js";
import { registerAuditLog } from "./commands/audit-log.js";
import { registerAccessReview } from "./commands/access-review.js";
import { registerResidency } from "./commands/residency.js";
import { registerDsar } from "./commands/dsar.js";
import { registerQuestionnaire } from "./commands/questionnaire.js";
import { registerAdvise } from "./commands/advise.js";
import { registerRuns } from "./commands/runs.js";

function resolveVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, "..", "..", "package.json"), "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export function buildProgram(): Command {
  const program = new Command();
  program
    .name("stamp")
    .description(
      "stamp — the compliance / enterprise-readiness employee. " +
        "badge = the connection; stamp = the program that decides we need it and proves it to the auditor.",
    )
    .version(resolveVersion(), "-v, --version", "print the stamp version");

  registerAudit(program);
  registerSsoPlan(program);
  registerAuditLog(program);
  registerAccessReview(program);
  registerResidency(program);
  registerDsar(program);
  registerQuestionnaire(program);
  registerAdvise(program);
  registerRuns(program);

  return program;
}

export async function main(argv: string[]): Promise<void> {
  const program = buildProgram();
  try {
    await program.parseAsync(argv);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`stamp: ${msg}\n`);
    process.exitCode = 1;
  }
}
