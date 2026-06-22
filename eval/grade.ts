// grade.ts — the TYPED rubric for stamp's eval pyramid (the dsip.json `eval.rubric` pointer).
//
// The grading LOGIC lives once in eval/grade.mjs (the runtime shared by eval/run.mjs + the
// Vitest L2 test). This file is the typed contract over it: it declares the GoldenTask /
// GoldenGrade shapes and re-exports the grader so any TypeScript consumer (or a future
// dist-compiled caller) gets full types. NO logic is duplicated — Karpathy Simplicity First.
//
// NO SELF-GRADING (dsip eval.noSelfGrading): the rubric grades a verb's deterministic OUTPUT
// against the EXTERNAL key in eval/golden-tasks.json (required/forbidden phrases drawn from
// the brain/BATTLE-TESTED-SCENARIOS *Resolution* text) — never the verb/LLM grading itself.

// @ts-expect-error — grade.mjs is plain JS (intentionally not in tsc's rootDir); typed here.
import { gradeGolden as _gradeGolden, gradeBatch as _gradeBatch } from "./grade.mjs";

/** One golden task (a row of eval/golden-tasks.json). */
export interface GoldenTask {
  readonly id: string;
  readonly bts: string;
  readonly level: "L1" | "L2" | "L3";
  readonly ci_block: boolean;
  readonly task: string;
  readonly handler: string;
  readonly args: Record<string, unknown>;
  readonly required_phrases: readonly string[];
  readonly forbidden_phrases: readonly string[];
}

/** The grade for one task — F1 vs the fixed rubric + any forbidden-phrase hits. */
export interface GoldenGrade {
  readonly id: string;
  readonly passed: boolean;
  readonly f1: number;
  readonly precision: number;
  readonly recall: number;
  readonly missing: readonly string[];
  readonly forbiddenHit: readonly string[];
}

export interface BatchGrade {
  readonly grades: readonly GoldenGrade[];
  readonly pass: number;
  readonly fail: number;
  readonly total: number;
  readonly meanF1: number;
}

/** Grade one golden task's serialized output against its external key (F1 >= threshold, no forbidden). */
export function gradeGolden(task: GoldenTask, output: string, f1Threshold = 0.8): GoldenGrade {
  return _gradeGolden(task, output, f1Threshold) as GoldenGrade;
}

/** Grade a batch of {task, output} pairs + an aggregate. */
export function gradeBatch(
  pairs: ReadonlyArray<{ task: GoldenTask; output: string }>,
  f1Threshold = 0.8,
): BatchGrade {
  return _gradeBatch(pairs, f1Threshold) as BatchGrade;
}
