// Shared brain-grounded constants — single source of truth for the strings the
// boundary-FAIL guards and the never-claim-compliant creed depend on. Keeping these
// in one module stops the 8 command files from drifting on the load-bearing phrasing.

/** The badge↔stamp boundary one-liner (EM §boundary; OP O1/O2; KP P25). */
export const BOUNDARY_ONE_LINER =
  "badge = the connection; stamp = the program that decides we need it and proves it to the auditor";

/**
 * The exact handoff stamp emits for any mechanism task. The acceptance test asserts
 * this `badge init` value is present in sso-plan output (OP O2; KP P25; BTS S3).
 */
export const BADGE_HANDOFF = "badge init --provider workos";

/**
 * stamp NEVER asserts the claim a CPA firm signs before they sign it (OP O24; KP P7).
 * Every readiness summary is phrased as audit-ready evidence + a gap count — and
 * deliberately omits the claim token so no grep can mistake a refusal for a claim.
 */
export function readinessSummary(gapCount: number): string {
  return `audit-ready evidence: ${gapCount} gap${gapCount === 1 ? "" : "s"} (attestation pending the auditor — readiness is not certification)`;
}

/** The standing disclaimer attached to every gap report (OP O24). */
export const COMPLIANCE_DISCLAIMER =
  "audit-ready evidence assembled — the attestation is the CPA firm's, never stamp's; readiness is not certification (OP O24)";

/** Command → JTBD number (brain EXPERTISE-MAP JTBD-1..11). Used by the runlog + dispatch. */
export const CMD_JTBD: Readonly<Record<string, number>> = {
  audit: 1,
  advise: 2,
  "access-review": 3,
  "audit-log": 4,
  residency: 5,
  dsar: 6,
  questionnaire: 7,
  "sso-plan": 8,
  runs: 10,
};

export function jtbdFor(cmd: string): number {
  return CMD_JTBD[cmd] ?? 10;
}
