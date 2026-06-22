// l3-judge.ts — the TYPED contract for stamp's L3 LLM-judge (the runtime is eval/l3-judge.mjs).
//
// L3 (Hamel's apex) is a calibrated LLM-judge over the TRAJECTORY golden tasks — the ones whose
// "right answer" is a JUDGMENT, not a keyword match. The executable judge lives in
// eval/l3-judge.mjs (top-level-await script: call the real handlers → ask the Anthropic Messages
// API to grade the output against the SAME external rubric the L2 grader uses). This file is the
// typed contract over it — the IDs L3 covers + the verdict shape — so any TS consumer is typed,
// with NO logic duplicated (Karpathy Simplicity First).
//
// NON-BLOCKING + KEY-GATED (D15): the $0/no-creds floor is L1+L2 (eval/run.mjs). L3 runs only
// when ANTHROPIC_API_KEY is present and is ADVISORY — it never fails CI. NO SELF-GRADING: the
// judge is handed the rubric (it does not invent one); the verb does not grade itself.

/** The trajectory golden tasks L3 judges (PLAN §6 — the judgment ones, not the keyword ones). */
export const L3_TRAJECTORY_IDS: readonly string[] = ["G4", "G6", "G7", "G9", "G12", "G13"];

/** A single L3 verdict from the calibrated judge. */
export interface L3Verdict {
  readonly id: string;
  readonly verdict: "PASS" | "FAIL" | "UNCLEAR";
  readonly reason: string;
}

/** The advisory L3 run result (never gates CI). */
export interface L3Result {
  readonly model: string;
  readonly pass: number;
  readonly fail: number;
  readonly unavailable: number;
  readonly verdicts: readonly L3Verdict[];
}

/**
 * The L3 judge runs as a standalone script (top-level await + network), so it is invoked via
 *   `ANTHROPIC_API_KEY=… node eval/l3-judge.mjs`
 * rather than imported. This typed module exists for the contract above and to make the L3
 * surface discoverable/typed from TypeScript. See eval/l3-judge.mjs for the implementation.
 */
export const L3_RUNNER = "eval/l3-judge.mjs" as const;
