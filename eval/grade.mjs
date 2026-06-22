// grade.mjs — stamp's binary golden-task grader (eval pyramid L2; the single grading core).
//
// NO SELF-GRADING (dsip eval.noSelfGrading): the grader does NOT ask a verb to grade itself,
// and it does NOT ask an LLM whether the answer is good. It matches each verb's deterministic
// OUTPUT against an EXTERNAL key — the `required_phrases` (drawn from the brain/BATTLE-TESTED-
// SCENARIOS *Resolution* text) and `forbidden_phrases` (the boundary-FAIL words) declared in
// eval/golden-tasks.json. A task PASSES iff:
//   F1(required_phrases present in output) >= f1_threshold  AND  no forbidden_phrase present.
// This is Hamel's "grade against a fixed rubric, not the model's own opinion" applied to a
// compliance employee — the rubric is the dated incident's resolution, not stamp's say-so.
//
// `grade.ts` is the typed wrapper over this module (the dsip eval.rubric pointer); this .mjs
// is the runtime so `eval/run.mjs` + the Vitest test share ONE grader with zero duplication.

/**
 * Case-insensitive substring presence. Phrases come from the brain Resolution text; we match
 * on normalized lowercase so "Tamper-EVIDENT" in the key hits "tamper-evident" in the output.
 */
function present(haystackLower, phrase) {
  return haystackLower.includes(String(phrase).toLowerCase());
}

/**
 * Grade ONE golden task's serialized output against its external key.
 * @param {object} task - a task from golden-tasks.json (required_phrases, forbidden_phrases)
 * @param {string} output - the verb's serialized JSON output (the deterministic answer)
 * @param {number} f1Threshold - pass bar for F1 (default 0.8)
 * @returns {{id:string, passed:boolean, f1:number, precision:number, recall:number, missing:string[], forbiddenHit:string[]}}
 */
export function gradeGolden(task, output, f1Threshold = 0.8) {
  const hay = String(output).toLowerCase();
  const required = Array.isArray(task.required_phrases) ? task.required_phrases : [];
  const forbidden = Array.isArray(task.forbidden_phrases) ? task.forbidden_phrases : [];

  const found = required.filter((p) => present(hay, p));
  const missing = required.filter((p) => !present(hay, p));
  const forbiddenHit = forbidden.filter((p) => present(hay, p));

  // Recall = fraction of required phrases present. Precision over a fixed-key match is 1 when
  // every "predicted positive" (a required phrase we look for) that IS present is a true
  // positive — there are no false-positive *required* phrases by construction — so for this
  // fixed-rubric binary check, precision := found/required too, making F1 == recall. We still
  // compute both explicitly so the report is honest and the math is auditable.
  const total = required.length;
  const recall = total === 0 ? 1 : found.length / total;
  const precision = total === 0 ? 1 : found.length / total;
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  const passed = f1 >= f1Threshold && forbiddenHit.length === 0;
  return {
    id: task.id,
    passed,
    f1: Number(f1.toFixed(3)),
    precision: Number(precision.toFixed(3)),
    recall: Number(recall.toFixed(3)),
    missing,
    forbiddenHit,
  };
}

/**
 * Grade a batch of {task, output} pairs. Returns the per-task grades + an aggregate.
 * @param {Array<{task:object, output:string}>} pairs
 * @param {number} f1Threshold
 */
export function gradeBatch(pairs, f1Threshold = 0.8) {
  const grades = pairs.map(({ task, output }) => gradeGolden(task, output, f1Threshold));
  const pass = grades.filter((g) => g.passed).length;
  const fail = grades.length - pass;
  const meanF1 = grades.length === 0 ? 1 : grades.reduce((s, g) => s + g.f1, 0) / grades.length;
  return { grades, pass, fail, total: grades.length, meanF1: Number(meanF1.toFixed(3)) };
}
