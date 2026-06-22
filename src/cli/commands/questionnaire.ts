// `stamp questionnaire <sig|caiq|vsa> [--kb <dir>] [--json]`
// Draft answers mapped to the versioned answer-KB; mark each "DRAFT — human must sign"
// (EM JTBD-7; OP O21/O22).

import { Command } from "commander";
import { draftQuestionnaire, type QuestionnaireDraft } from "../../lib/verbs.js";
import { jtbdFor } from "../../lib/constants.js";
import { withRunLog } from "../../lib/runlog.js";
import { bullets, emit } from "../output.js";

export function registerQuestionnaire(program: Command): void {
  program
    .command("questionnaire")
    .description("draft questionnaire answers from the KB; each marked DRAFT — a human must sign")
    .argument("<format>", "sig | caiq | vsa")
    .option("--kb <dir>", "the versioned answer-KB directory")
    .option("--json", "emit machine-parseable JSON", false)
    .action(async (format: string, opts: { kb?: string; json: boolean }) => {
      const fmt = normalizeFormat(format);
      const result = await withRunLog("questionnaire", jtbdFor("questionnaire"), () => draftQuestionnaire(fmt, opts.kb));
      emit(result, opts, renderQuestionnaire);
    });
}

function normalizeFormat(raw: string): "sig" | "caiq" | "vsa" {
  const f = raw.toLowerCase();
  if (f === "sig" || f === "vsa") return f;
  return "caiq";
}

function renderQuestionnaire(r: QuestionnaireDraft): string {
  const answers = r.answers.map((a) => `  Q: ${a.q}\n    A: ${a.draft_answer}\n    KB: ${a.kb_source}`);
  return [
    `stamp questionnaire — ${r.format.toUpperCase()}${r.kb_dir ? ` (kb: ${r.kb_dir})` : ""}`,
    bullets("Approach:", r.approach),
    ``,
    `Draft answers:`,
    answers.join("\n"),
    ``,
    `Signature required: ${r.signature_required}`,
    `Pen-test note: ${r.pentest_note}`,
    `Cite: ${r.brain_cite}`,
  ].join("\n");
}
