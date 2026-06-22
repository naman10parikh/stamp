#!/usr/bin/env node
// acceptance.mjs — THE acceptance bar for stamp (PLAN §5; the spine; CI-blocking).
//
// THE BAR (D13/§5): `stamp audit <app>` produces a SOC2-readiness gap report AND
// `stamp sso-plan --dry-run` emits a verifiable enterprise-SSO program plan — with the auth
// MECHANISM explicitly handed to badge (NO SAML code). Fixture-driven, $0, NO creds (D15) —
// so this job ALWAYS runs (no "skipped because key absent" escape). Run ×3 (pass^k, k>=3):
// the deterministic reports must be byte-stable.
//
// It drives the REAL CLI (`node bin/stamp … --json`), not the libs, so it tests the full path
// an agent uses. The 4 assertions:
//   A1. gap JSON: framework=soc2, a control-mapped finding incl. CC7.2 + CC6.3, NEVER "compliant".
//   A2. sso JSON @ $300k: "build now"+deal-blocker, buyer-readiness checklist (>=10), WorkOS
//       wiring plan, deprovisioning-proof spec.
//   A3. BOUNDARY (load-bearing): sso JSON has `badge_handoff` (badge init) AND contains NO
//       generated SAML/ACS/OIDC/SCIM code. A run that emits SAML code OR omits badge_handoff FAILS.
//   A4. determinism: the audit + sso JSON are identical across all 3 runs (pass^k).
//
// Self-builds dist/ if absent so `pnpm run acceptance` works on a fresh checkout.

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const BIN = join(repoRoot, "bin", "stamp");
const FIXTURE = "test/fixtures/app-under-audit";
const RUNS = 3; // pass^k, k >= 3

// The boundary-FAIL guard: any generated SAML/ACS/OIDC/SCIM code in the sso plan = FAIL
// (EM JTBD-8.5; OP O2; KP P25). Matches the same shape the B3 test + the override enforce.
const SAML_CODE_GUARD = /ACS|SAMLResponse|samlp:|<saml|new SAML|class .*SCIM/;

let failures = 0;
function check(name, cond, detail = "") {
  if (cond) {
    process.stdout.write(`  PASS  ${name}\n`);
  } else {
    failures += 1;
    process.stdout.write(`  FAIL  ${name}${detail ? `  — ${detail}` : ""}\n`);
  }
}

// Ensure the compiled CLI exists (bin/stamp loads dist/).
if (!existsSync(join(repoRoot, "dist", "cli", "index.js"))) {
  process.stdout.write("[acceptance] dist/ missing — building once…\n");
  const b = spawnSync("pnpm", ["build"], { cwd: repoRoot, encoding: "utf8", stdio: "inherit" });
  if (b.status !== 0) {
    process.stderr.write("[acceptance] build failed — cannot run the bar\n");
    process.exit(1);
  }
}

/** Run `node bin/stamp <args> --json` and return parsed JSON (throws on non-zero exit / bad JSON). */
function runStampJson(args, label) {
  const res = spawnSync(process.execPath, [BIN, ...args], { cwd: repoRoot, encoding: "utf8" });
  if (res.status !== 0) {
    throw new Error(`${label}: exit ${res.status} — stderr: ${(res.stderr || "").trim().slice(0, 300)}`);
  }
  try {
    return { json: JSON.parse(res.stdout), raw: res.stdout };
  } catch (err) {
    throw new Error(`${label}: output is not valid JSON — ${err.message}`);
  }
}

process.stdout.write(`\n=== stamp acceptance bar — ${RUNS} consecutive runs (pass^k, k>=${RUNS}) ===\n`);

const auditRaws = [];
const ssoRaws = [];

for (let i = 1; i <= RUNS; i++) {
  process.stdout.write(`\n--- run ${i}/${RUNS} ---\n`);

  // ── half 1: stamp audit → SOC2 gap report ──────────────────────────────────────
  let audit;
  try {
    audit = runStampJson(["audit", FIXTURE, "--framework", "soc2", "--json"], "stamp audit");
  } catch (err) {
    check("A1. stamp audit runs + emits JSON", false, err.message);
    break;
  }
  auditRaws.push(audit.raw);
  const controls = (audit.json.findings ?? []).map((f) => f.control);
  check("A1. audit framework=soc2", audit.json.framework === "soc2", `got ${audit.json.framework}`);
  check("A1. audit finds CC7.2 (missing audit trail)", controls.includes("CC7.2"), `controls=${controls.join(",")}`);
  check("A1. audit finds CC6.3 (no access review)", controls.includes("CC6.3"), `controls=${controls.join(",")}`);
  check("A1. every finding has severity + fix", (audit.json.findings ?? []).every((f) => f.severity && f.fix), "");
  check('A1. audit NEVER says "compliant" (OP O24 / KP P7)', !audit.raw.toLowerCase().includes('"compliant"'), "boundary-FAIL: compliant claim present");
  check("A1. audit summary says 'audit-ready evidence'", /audit-ready evidence/i.test(audit.raw), "");

  // ── half 2: stamp sso-plan --dry-run → enterprise-SSO program plan ──────────────
  let sso;
  try {
    sso = runStampJson(["sso-plan", "--target", FIXTURE, "--acv", "300000", "--dry-run", "--json"], "stamp sso-plan");
  } catch (err) {
    check("A2. stamp sso-plan runs + emits JSON", false, err.message);
    break;
  }
  ssoRaws.push(sso.raw);
  check("A2. sso trigger = build-now deal-blocker @ $300k (BTS S3)", /build now/i.test(sso.json.trigger_decision) && /deal-block/i.test(sso.json.trigger_decision), sso.json.trigger_decision);
  check("A2. buyer-readiness checklist >= 10 items", Array.isArray(sso.json.buyer_readiness_checklist) && sso.json.buyer_readiness_checklist.length >= 10, `len=${sso.json.buyer_readiness_checklist?.length}`);
  check("A2. checklist includes SCIM + deprovisioning", sso.raw.toLowerCase().includes("scim") && sso.raw.toLowerCase().includes("deprovision"), "");
  check("A2. WorkOS wiring plan present", Array.isArray(sso.json.workos_wiring_plan) && sso.json.workos_wiring_plan.length > 0 && /workos/i.test(sso.raw), "");
  check("A2. deprovisioning-proof spec present", Array.isArray(sso.json.deprovisioning_proof_spec) && sso.json.deprovisioning_proof_spec.length > 0, "");

  // ── A3: THE boundary assertion (load-bearing) ──────────────────────────────────
  check("A3. badge_handoff present (mechanism → badge)", typeof sso.json.badge_handoff === "string" && /badge init/.test(sso.json.badge_handoff), `badge_handoff=${JSON.stringify(sso.json.badge_handoff)}`);
  check("A3. BOUNDARY: NO generated SAML/ACS/OIDC/SCIM code (OP O2 / KP P25)", !SAML_CODE_GUARD.test(sso.raw), "boundary-FAIL: SAML code present in the plan");
}

// ── A4: determinism across the 3 runs (pass^k) ───────────────────────────────────
if (auditRaws.length === RUNS) {
  check("A4. audit report byte-stable across all 3 runs (pass^k)", auditRaws.every((r) => r === auditRaws[0]), "");
}
if (ssoRaws.length === RUNS) {
  check("A4. sso plan byte-stable across all 3 runs (pass^k)", ssoRaws.every((r) => r === ssoRaws[0]), "");
}

process.stdout.write(`\n=== acceptance: ${failures === 0 ? "GREEN" : "RED"} (${failures} failure(s)) ===\n`);
process.exit(failures === 0 ? 0 : 1);
