#!/usr/bin/env node
// compliance-lint — stamp's own anti-slop guard (B6).
//
// Enforces stamp's NON-NEGOTIABLE compliance creeds on the staged compliance
// text/config stamp itself emits. It FIRES + BLOCKS (non-zero exit) on a seeded
// violation and is silent (exit 0) on clean text. "It exists" is not enough — the
// verify line pipes a known violation and asserts a non-zero exit + an OP-cited message.
//
// Four violation classes (each cites the brain stance it defends):
//   1. claiming "compliant"/"certified" before a CPA firm signs ........ OP O24 / KP P7
//   2. blessing an AI-only / scanner-only pen-test as the SOC2 pentest .. OP O20 / KP P18
//   3. an auto-revoke of access without a human-approval gate ........... OP O19 / KP P6
//   4. a secret committed to git (API key / client_secret in the text) . energy secret-hygiene
//
// Input handling (dual-mode, so it works as BOTH a standalone CLI and a Claude Code hook):
//   - If stdin parses as a Claude Code hook JSON payload, lint the text-bearing fields
//     (tool_input.content / file_text / new_string / command, etc.).
//   - Otherwise lint the raw stdin text directly (the verify path: `printf '...' | node ...`).
//
// Exit codes: 0 = clean; 2 = a compliance violation was found (blocks the staged output).
//
// NOTE: the repo's package.json sets "type": "module", so this file is ESM. We import
// fs from node: (not require) — the standalone verify (`printf '...' | node this.js`)
// and the Claude Code hook runner both invoke it the same way.

import { readFileSync } from "node:fs";

const VIOLATIONS_EXIT = 2;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

// Pull every plausibly-text-bearing field out of a Claude Code hook payload so the
// hook lints what's actually being written, not the JSON envelope.
function extractText(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return raw;
  let payload;
  try {
    payload = JSON.parse(trimmed);
  } catch {
    return raw; // not JSON after all — lint the raw text
  }
  const parts = [];
  const FIELDS = [
    "content",
    "file_text",
    "new_string",
    "new_str",
    "text",
    "command",
    "old_string",
    "prompt",
  ];
  const walk = (node) => {
    if (node == null) return;
    if (typeof node === "string") {
      parts.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === "object") {
      for (const key of FIELDS) {
        if (typeof node[key] === "string") parts.push(node[key]);
      }
      // also descend into the canonical hook nesting
      if (node.tool_input) walk(node.tool_input);
      if (node.toolInput) walk(node.toolInput);
    }
  };
  walk(payload);
  // Fallback: if we found nothing structured, lint the whole serialized payload.
  return parts.length ? parts.join("\n") : raw;
}

// Suppression guard: stamp's own correct stance NAMES an anti-pattern in order to
// FORBID it ("NEVER claim AI-pentest coverage", "auditors REJECT AI-only", "never
// auto-revoke"). When the surrounding text is rejecting/forbidding the anti-pattern,
// it is the CORRECT output and must not be flagged. (Mirrors the claim-compliant hedge.)
function isRejecting(lower) {
  return /(never|reject|do not|don['’]?t|not the|isn['’]?t|is not|refus|forbid|ban\b|banned|avoid|must not|cannot|can['’]?t)/i.test(
    lower
  );
}

// Each rule: a test over the (lowercased) text + the OP/KP-cited block message.
// Rules deliberately allow stamp's APPROVED phrasings so clean output passes.
const RULES = [
  {
    id: "claim-compliant",
    cite: "OP O24 / KP P7",
    test(text, lower) {
      // Flag a positive "we are compliant/certified" claim …
      const claims = /\b(?:soc\s?2|iso\s?27001|hipaa|fully|are|is|we['’]?re)?\s*(?:compliant|certified)\b/i.test(
        text
      );
      if (!claims) return false;
      // … UNLESS it is the approved hedge, names the issuing CPA firm / cert body, or
      // is text that is itself FORBIDDING the claim (stamp's own creed).
      const hedged =
        /audit-ready|attestation pending|pending the auditor|evidence assembled|issued by|signed by|cpa firm|certifying body|attested by/i.test(
          lower
        );
      return !hedged && !isRejecting(lower);
    },
    message:
      'Refused: claiming "compliant"/"certified" before the CPA firm signs is a ' +
      "misstatement (the attestation is the human auditor's, never the agent's; the " +
      'platform monitors ≤80-90% of controls). Say "audit-ready evidence assembled; ' +
      'attestation pending the auditor." [OP O24 / KP P7]',
  },
  {
    id: "ai-pentest",
    cite: "OP O20 / KP P18",
    test(_text, lower) {
      const pentest = /(pen[\s-]?test|penetration test|red[\s-]?team|vuln(?:erability)? scan)/i.test(
        lower
      );
      if (!pentest) return false;
      // The VIOLATION is positively CLAIMING an AI/scanner-only test gives coverage.
      const claimsCoverage =
        /(covers? us|we['’]?re covered|covered for the (?:soc\s?2 )?pen|(?:ai|scanner)[\s-]?(?:only )?(?:red[\s-]?team|pentest|scan)[^.]{0,40}(?:cover|enough|sufficient|satisf|good)|(?:we|are) (?:covered|set|fine|good)[^.]{0,30}pen)/i.test(
          lower
        );
      if (!claimsCoverage) return false;
      // … UNLESS the text is REJECTING the anti-pattern (stamp's own correct stance
      // mentions "AI-only" only to forbid it — never flag the forbidding text).
      return !isRejecting(lower);
    },
    message:
      "Refused: an AI-only / scanner-only pen-test is NOT the SOC 2 pen-test — auditors " +
      "reject it (a vuln scan ≠ a pen test; they want human-driven, adversarial testing). " +
      "Get a human-led pen-test (Cobalt-class), scoped to the boundary, with retest " +
      "evidence; CPTaaS is continuous coverage layered on top, never the report. " +
      "[OP O20 / KP P18]",
  },
  {
    id: "auto-revoke",
    cite: "OP O19 / KP P6",
    test(_text, lower) {
      const revoke =
        /(auto[\s-]?revoke|automatically revoke|auto[\s-]?remediat|automatically (?:revoke|remediate|disable|deprovision))/i.test(
          lower
        );
      if (!revoke) return false;
      // Allow when an explicit human gate / proposal is described, or the text is
      // itself FORBIDDING the auto-revoke (stamp's own "never auto-revoke" creed).
      const gated =
        /(human (?:approv|gate|sign|review)|propose|surfac\w* for approval|requires? human|read\/draft\/commit)/i.test(
          lower
        );
      return !gated && !isRejecting(lower);
    },
    message:
      "Refused: auto-revoking a privileged/uncertain grant without a human-approval gate " +
      "can break a business process and is itself a CC6 change-management risk. PROPOSE " +
      "the revoke and let a human APPROVE (read/draft/commit gradient). [OP O19 / KP P6]",
  },
  {
    id: "committed-secret",
    cite: "energy secret-hygiene / KP (vault-managed secrets)",
    test(text) {
      // Common live-key shapes; deliberately conservative to avoid false positives on docs.
      return (
        /\bsk-[A-Za-z0-9]{16,}\b/.test(text) || // OpenAI/Anthropic-style
        /\bsk-ant-[A-Za-z0-9_-]{16,}\b/.test(text) ||
        /\bAKIA[0-9A-Z]{16}\b/.test(text) || // AWS access key id
        /\bghp_[A-Za-z0-9]{30,}\b/.test(text) || // GitHub PAT
        /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/.test(text) || // Slack token
        /(client_secret|api[_-]?key|secret)["'\s:=]+[A-Za-z0-9_\-]{20,}/i.test(text)
      );
    },
    message:
      "Refused: a secret (API key / client_secret) appears in staged output — secrets must " +
      "be vault-managed (Doppler/Vault), never committed to git (it is itself an audit " +
      "finding). Remove it and reference it via an env var. [secret-hygiene]",
  },
];

function main() {
  const raw = readStdin();
  const text = extractText(raw);
  const lower = text.toLowerCase();

  const hits = RULES.filter((r) => r.test(text, lower));

  if (hits.length === 0) {
    process.exit(0);
  }

  process.stderr.write("compliance-lint: BLOCKED — stamp anti-slop violation\n");
  for (const h of hits) {
    process.stderr.write(`  [${h.id}] ${h.message}\n`);
  }
  process.exit(VIOLATIONS_EXIT);
}

main();
