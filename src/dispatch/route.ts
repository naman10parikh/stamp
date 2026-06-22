// dispatch/route — stamp's decision spine (Cluster D1). The router IS the boundary.
//
// Every task runs through the JTBD-0 mechanism↔governance gate FIRST (EM §boundary; the most
// important model stamp holds — OP O1; KP P25). A task that is "make the auth/SCIM/MCP-OAuth
// MECHANISM work / validate a signature / fix event ordering / enforce RBAC at the token /
// pick the auth provider on $ breakpoints" is NOT stamp's — it returns a `→ badge` handoff and
// STOPS. Only a governance/evidence task (pass the audit, prove residency, run the access
// review, plan the SSO PROGRAM, handle a DSAR, answer a questionnaire) maps to a stamp JTBD +
// handler (the CLI verb that does it).
//
// Pure + deterministic: the same task string always yields the same route. No side effects,
// no LLM call — this is the keyword-classified spine, not a model. Tested multi-step.

import { BADGE_HANDOFF } from "./../lib/constants.js";

/** A task classified to badge (mechanism) — stamp keeps the posture, badge owns the code. */
export interface MechanismRoute {
  readonly boundary: "mechanism";
  readonly handoff: "badge";
  readonly badge_command: string;
  readonly reason: string;
  readonly brain_cite: string;
}

/** A task classified to stamp (governance/evidence) — mapped to its JTBD + handler verb. */
export interface GovernanceRoute {
  readonly boundary: "governance";
  readonly jtbd: number;
  readonly handler: StampHandler;
  readonly reason: string;
  readonly brain_cite: string;
}

export type Route = MechanismRoute | GovernanceRoute;

/** The CLI verbs a governance task can route to (the employee's hands). */
export type StampHandler =
  | "audit"
  | "advise"
  | "access-review"
  | "audit-log"
  | "residency"
  | "dsar"
  | "questionnaire"
  | "sso-plan"
  | "runs";

// ── JTBD-0: the mechanism gate (runs FIRST) ──────────────────────────────────────
// These are badge's turf (EM §"Route to badge when"; JTBD-9.3). The signals are phrased
// as "make it WORK / fix the pipe / validate / enforce / implement the code / pick the
// provider on $", NOT "decide / prove / attest / plan" (those stay governance).
const MECHANISM_SIGNALS: readonly RegExp[] = [
  // SCIM/webhook plumbing — the pipe itself (JTBD-9.3: "the SCIM webhook is dropping events")
  /\bscim\b[^.]*\b(webhook|drop(?:ping|ped)?|event|pipe|provision(?:ing)?|deprovision(?:ing)?)\b.*\b(work|fix|fail|drop|order|implement|debug|broken|bug)?/i,
  /\bwebhook\b.*\b(drop(?:ping|ped)?|miss(?:ing|ed)?|out[- ]?of[- ]?order|event|sign|fail)/i,
  // signature validation + event ordering
  /\bvalidat\w*\b.*\bsignatur/i,
  /\bsignatur\w*\b.*\b(validat|verif|check)/i,
  /\bevent[- ]?order(?:ing)?\b/i,
  // SAML / OIDC / SSO *mechanism* (make it work / implement / the ACS endpoint / the assertion)
  /\b(saml|oidc)\b.*\b(work|implement|wir\w+|endpoint|acs|assertion|metadata|fix|debug|broken|configur\w*\s+the\s+(idp|sp))/i,
  /\b(implement|build|wire|fix|debug)\b.*\b(saml|oidc|sso)\b/i,
  /\bacs\b|\bassertion[- ]?consumer\b|\bsamlresponse\b/i,
  // MCP-OAuth implementation (PKCE / RFC 8707 / DCR / CIMD) — badge's
  /\bmcp[- ]?oauth\b|\bpkce\b|\brfc ?8707\b|\bdcr\b|\bcimd\b/i,
  // RBAC *enforcement* at the token (stamp ATTESTS; badge ENFORCES)
  /\b(enforc\w+|implement\w*)\b.*\b(rbac|scope|permission|token|intersection)/i,
  /\bagent_perms\b|\buser_perms\b|\bintersection rule\b/i,
  // picking the auth provider on $ breakpoints (badge's call, not stamp's — JTBD-8.5)
  /\b(pick|choose|select)\b.*\b(auth|sso|idp)\b.*\b(provider|vendor)\b.*\b(price|cost|breakpoint|\$|tier)/i,
  /\b(provider|vendor)\b.*\b(breakpoint|price\s+breakpoint)\b/i,
  // the auth-CVE / federation class
  /\bauth[- ]?(cve|vuln|federation)\b|\broll\b.*\bfederation\b/i,
];

// ── the governance JTBD router (keyword → JTBD → handler) ──────────────────────────
// Ordered: the FIRST matching rule wins, so put the most specific intents first. Each rule
// is a JTBD from EM (1..11) → the CLI verb that executes it.
interface GovRule {
  readonly test: RegExp;
  readonly jtbd: number;
  readonly handler: StampHandler;
  readonly reason: string;
}

const GOV_RULES: readonly GovRule[] = [
  // JTBD-8 — run the enterprise-SSO PROGRAM (decide we need it / price it / prove it).
  // Governance SSO: "do we need SSO", "SSO to close the deal", "SSO pricing/program", "deprovisioning PROOF".
  {
    test: /\b(do we need|need)\b.*\bsso\b|\bsso\b.*\b(program|deal|close|pricing|price|tax|nice|deal[- ]?block)|\benterprise sso\b|\bsso\b.*\b(decide|prove|posture|plan)/i,
    jtbd: 8,
    handler: "sso-plan",
    reason: "the enterprise-SSO PROGRAM (decide → price → prove); the SAML/SCIM mechanism is badge's (EM JTBD-8)",
  },
  // JTBD-9 — SCIM-deprovisioning POSTURE (prove it fired / reconcile drift) — stays stamp.
  {
    test: /\b(prove|proof|attest|reconcil\w+|verify)\b.*\b(deprovision|scim|access)\b|\bdeprovision\w*\b.*\b(prove|proof|fire|attest|review|posture)|\bprovisioning drift\b|\bghost (account|access)\b/i,
    jtbd: 9,
    handler: "access-review",
    reason: "the SCIM-deprovisioning POSTURE (prove it fired + reconcile drift in the UAR); the pipe fix is badge's (EM JTBD-9)",
  },
  // JTBD-3 — access-review / least-privilege ATTESTATION (CC6).
  {
    test: /\baccess[- ]?review\b|\bleast[- ]?privilege\b|\buar\b|\b(review|attest)\b.*\b(access|privilege|grant|identit)|\bprivilege creep\b|\borphan\w*\b.*\b(account|grant)/i,
    jtbd: 3,
    handler: "access-review",
    reason: "the access-review / least-privilege attestation (CC6) — scope to agent identities, propose revokes (EM JTBD-3)",
  },
  // JTBD-4 — audit trail as a real control (CC7/CC6) — tamper-evident.
  {
    test: /\baudit[- ]?(trail|log)\b|\btamper[- ]?(evident|resistant)\b|\bcc7\b|\bsiem\b|\bhash[- ]?chain\b|\b(log|trail)\b.*\b(audit|tamper|cc7|siem|integrity)/i,
    jtbd: 4,
    handler: "audit-log",
    reason: "the audit trail as a CONTROL (tamper-EVIDENT, accountable-human, SIEM export) — 'we have logs' ≠ audit trail (EM JTBD-4)",
  },
  // JTBD-5 — prove data residency (vs sovereignty).
  {
    test: /\bresidenc\w+\b|\bsovereignt\w+\b|\bdata[- ]?(residency|location)\b|\bbyok\b|\bcmk\b|\b(eu|us|region)\b.*\b(residenc|pin\w*|cloud act)/i,
    jtbd: 5,
    handler: "residency",
    reason: "prove data residency vs sovereignty — whole-pipeline pinning + BYOK/CMK lever (EM JTBD-5)",
  },
  // JTBD-6 — GDPR / CCPA / DSAR / DPA / SCC (the privacy-law process).
  {
    test: /\bdsar\b|\bdata[- ]?subject\b|\b(gdpr|ccpa|cpra)\b|\b(erasure|right to be forgotten|deletion request)\b|\bdpa\b|\bscc\b|\bprivacy[- ]?law\b/i,
    jtbd: 6,
    handler: "dsar",
    reason: "the privacy-law process (GDPR/CCPA clock, subprocessor register, human signs) (EM JTBD-6)",
  },
  // JTBD-7 — security questionnaire + pen-test taxes.
  {
    test: /\b(security )?questionnaire\b|\bsig\b|\bcaiq\b|\bvsa\b|\btrust center\b|\bpen[- ]?test\b|\bpentest\b|\bptaas\b/i,
    jtbd: 7,
    handler: "questionnaire",
    reason: "the questionnaire + pen-test tax (versioned answer-KB, AI drafts/human signs, never AI-only pentest) (EM JTBD-7)",
  },
  // JTBD-2 / JTBD-11 — pick a GRC platform / know the reference repos (a DECISION).
  {
    test: /\b(grc|compliance)[- ]?(platform|tool|vendor)\b|\b(pick|choose|select|recommend|which)\b.*\b(vanta|drata|secureframe|sprinto|grc)\b|\bvanta\b|\bdrata\b|\b(reference|starter|oss)\b.*\brepo/i,
    jtbd: 2,
    handler: "advise",
    reason: "a DECISION with the honest cost (Vanta default; vet the auditor; check pushed_at not stars) (EM JTBD-2/11)",
  },
  // JTBD-1 — pass the first SOC2 / ISO27001 / HIPAA audit (the posture job) — the catch-all
  // for "will we pass / are we audit-ready / gap-scan for the framework".
  {
    test: /\bsoc ?2\b|\bsoc2\b|\biso ?27001\b|\biso ?42001\b|\bhipaa\b|\baudit\b|\bgap[- ]?scan\b|\baudit[- ]?ready\b|\bpass\b.*\baudit\b|\bcompliant?\b|\bcontrols?\b/i,
    jtbd: 1,
    handler: "audit",
    reason: "pass the first SOC2/ISO27001/HIPAA audit — gap-scan + map controls, never claim 'compliant' (EM JTBD-1)",
  },
];

const BOUNDARY_CITE = "brain/EXPERTISE-MAP.md §boundary; brain/OPINIONS.md O1/O2; brain/KNOWN-PITFALLS.md P25";

/**
 * Route a task string. Runs the JTBD-0 mechanism gate FIRST (mechanism → badge handoff),
 * then the governance JTBD router (→ stamp JTBD + handler). Falls back to JTBD-1 (audit)
 * for an unrecognized compliance-shaped task (the posture job is the bread-and-butter).
 */
export function route(task: string): Route {
  const t = (task ?? "").trim();

  // JTBD-0 gate FIRST — place every task on the mechanism↔governance line before anything.
  for (const sig of MECHANISM_SIGNALS) {
    if (sig.test(t)) {
      return {
        boundary: "mechanism",
        handoff: "badge",
        badge_command: BADGE_HANDOFF,
        reason: "this is the auth/provisioning MECHANISM (make-it-work / validate / enforce / implement) — badge owns it end-to-end; stamp keeps the posture/evidence/program",
        brain_cite: BOUNDARY_CITE,
      };
    }
  }

  // Governance router — first matching JTBD wins.
  for (const rule of GOV_RULES) {
    if (rule.test.test(t)) {
      return {
        boundary: "governance",
        jtbd: rule.jtbd,
        handler: rule.handler,
        reason: rule.reason,
        brain_cite: BOUNDARY_CITE,
      };
    }
  }

  // Fallback: an unrecognized but compliance-shaped task → the posture job (JTBD-1, audit).
  return {
    boundary: "governance",
    jtbd: 1,
    handler: "audit",
    reason: "unrecognized compliance task — defaulting to the posture job (gap-scan); refine the task to route more precisely (EM JTBD-1)",
    brain_cite: BOUNDARY_CITE,
  };
}
