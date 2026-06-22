// sso-program — the enterprise-SSO PROGRAM planner (EM JTBD-8; acceptance-test half-2 core).
//
// THE boundary lives here: stamp decides the PROGRAM (do we need SSO, at what ACV, what
// proof the buyer wants) and emits a `badge_handoff` — it NEVER hand-rolls the SAML/OIDC+
// SCIM mechanism (that is badge's, end-to-end: OP O2; KP P25; BTS S3). At ~$200k ACV,
// SSO+SCIM are deal-blockers (BTS S3; OP O16). Basic SSO is a security control, not a
// feature to gate punitively (OP O15). The output is a PLAN + a handoff — zero code.

import { BADGE_HANDOFF } from "./constants.js";

export interface SsoProgramPlan {
  readonly trigger_decision: string;
  readonly acv: number | null;
  readonly buyer_readiness_checklist: string[];
  readonly workos_wiring_plan: string[];
  readonly deprovisioning_proof_spec: string[];
  readonly badge_handoff: string;
  readonly boundary_note: string;
  readonly sso_tax_stance: string;
  readonly brain_cite: string;
}

/** The ~$200k ACV threshold where SSO+SCIM flip from "nice" to deal-blocker (BTS S3). */
const DEAL_BLOCKER_ACV = 200_000;

/**
 * The buyer-readiness checklist an enterprise security team demands (EM 8.3). SCIM is
 * always paired with DEPROVISIONING — shipping "SSO only" fails the most-tested
 * questionnaire item (OP O16). ≥10 items by contract.
 */
const BUYER_READINESS_CHECKLIST: readonly string[] = [
  "SAML 2.0 SSO (the mechanism is badge's — see badge_handoff)",
  "OIDC SSO (Google / Microsoft / Okta — basic SSO is a security control, do NOT gate it punitively)",
  "SCIM provisioning + DEPROVISIONING (the most-tested B2B questionnaire item above ~$200k ACV — ship it WITH SSO)",
  "Self-serve admin portal for IdP setup (WorkOS Admin Portal is the reference)",
  "Audit-log export to the buyer's SIEM in real time (stamp JTBD-4 — Splunk/Datadog/Sentinel/New Relic)",
  "RBAC scoped to enterprise groups (badge ENFORCES at the token; stamp ATTESTS in the UAR)",
  "Data residency posture (stamp JTBD-5 — residency vs sovereignty; whole-pipeline pinning)",
  "SOC 2 / ISO 27001 report on demand (stamp JTBD-1 — audit-ready evidence, vet the auditor)",
  "Completed SIG / CAIQ security questionnaire (stamp JTBD-7 — versioned answer-KB, human signs)",
  "Signed DPA (Art. 28) + sub-processor list (stamp JTBD-6 — drafted by stamp, legal signs)",
  "Human-led pen-test attestation letter (stamp JTBD-7 — NEVER an AI/scanner-only test — OP O20)",
];

/**
 * The WorkOS wiring PLAN (steps, not code). References WorkOS Admin Portal / SCIM
 * directory — even Vanta uses WorkOS under the hood. The actual SAML/SCIM code is badge's.
 */
const WORKOS_WIRING_PLAN: readonly string[] = [
  "Provision a WorkOS environment + Admin Portal link per enterprise tenant (program decision — stamp)",
  "Map the buyer's IdP via the WorkOS Admin Portal (SAML or OIDC) — self-serve, no per-customer engineering",
  "Enable the WorkOS SCIM directory for provisioning + deprovisioning events",
  "Plan RBAC group → role mapping (badge enforces the resulting scopes at the token)",
  "Plan audit-log export of SSO/SCIM events to the buyer's SIEM (stamp owns the trail as a control)",
  "IMPLEMENTATION OF ALL OF THE ABOVE (the assertion-consumer endpoint, the federation + directory-sync endpoints, signature validation, event ordering) → badge (see badge_handoff); stamp emits the plan, never the auth code",
];

/**
 * The deprovisioning-proof SPEC — how stamp PROVES a departed user lost access (the
 * posture), without owning the SCIM pipe (that is badge's; BTS S15). Reconciliation, not
 * the event handler.
 */
const DEPROVISIONING_PROOF_SPEC: readonly string[] = [
  "Add IdP↔app reconciliation to the quarterly access review: verify each deprovisioning event actually fired, with timestamps (stamp posture)",
  "Evidence artifact: for a test departure, show the SCIM deprovision event + the app account going inactive, time-stamped (proves it to the buyer + the auditor)",
  "Alert on provisioning drift / ghost accounts (a deleted-in-Okta user still active in-app = a failed review)",
  "The mechanism fix for any dropped/misordered SCIM event (ordered Events API + signature validation) routes to badge — stamp STOPS at 'the webhook is dropping events'",
];

/**
 * Plan the enterprise-SSO program. `acv` drives the trigger decision; `dryRun` is honored
 * by the caller (no side effects either way — this is pure). Emits NO SAML/OIDC/SCIM code.
 */
export function planSsoProgram(opts: { target?: string; acv?: number | null; dryRun?: boolean }): SsoProgramPlan {
  const acv = typeof opts.acv === "number" && Number.isFinite(opts.acv) ? opts.acv : null;

  let trigger_decision: string;
  if (acv === null) {
    trigger_decision =
      "no ACV given — decide by deal value: at ~$200k ACV SSO+SCIM are deal-blockers (build now); below it SSO is 'nice-to-have'. Provide --acv to get a firm call.";
  } else if (acv >= DEAL_BLOCKER_ACV) {
    trigger_decision = `build now — SSO+SCIM are deal-blockers at ~$200k ACV (this deal is $${acv.toLocaleString("en-US")}); SCIM deprovisioning is the most-tested questionnaire item at this contract value (BTS S3)`;
  } else {
    trigger_decision = `defer — at $${acv.toLocaleString("en-US")} ACV (below ~$200k) SSO is 'nice-to-have', not a deal-blocker; do NOT over-build SSO for every small deal, but never gate basic SSO punitively (OP O15)`;
  }

  return {
    trigger_decision,
    acv,
    buyer_readiness_checklist: [...BUYER_READINESS_CHECKLIST],
    workos_wiring_plan: [...WORKOS_WIRING_PLAN],
    deprovisioning_proof_spec: [...DEPROVISIONING_PROOF_SPEC],
    badge_handoff: BADGE_HANDOFF,
    boundary_note:
      "stamp owns the SSO PROGRAM (the decision + the proof + the posture); the SAML/OIDC+SCIM MECHANISM is badge's — this plan emits NO auth code (OP O2; KP P25)",
    sso_tax_stance:
      "basic SSO (Google/Microsoft/Okta OIDC) is a security control — do NOT gate it punitively (the SSO-tax Wall of Shame). You MAY tier the genuinely-costly parts: SCIM, legacy/custom-IdP onboarding, the hosted admin portal, audit-log export (OP O15)",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-8; brain/BATTLE-TESTED-SCENARIOS.md S3/S4/S15; brain/OPINIONS.md O2/O15/O16",
  };
}
