// B6 — the compliance-lint hook must FIRE + BLOCK on stamp's anti-slop violations and
// stay SILENT on clean/forbidding text. The hook is a standalone JS script (also a real
// Claude Code PreToolUse hook), so we spawn it as a subprocess and pipe stdin — exactly
// how the board's verify line + the hook runner invoke it.

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const HOOK = join(HERE, "..", ".claude", "hooks", "compliance-lint.js");

function lint(input: string): { code: number; stderr: string } {
  const r = spawnSync("node", [HOOK], { input, encoding: "utf8" });
  return { code: r.status ?? -1, stderr: r.stderr ?? "" };
}

describe("compliance-lint — the board's two exact verify lines", () => {
  it('BLOCKS "we are SOC 2 compliant" with the OP-O24-cited message (OP O24 / KP P7)', () => {
    const { code, stderr } = lint("we are SOC 2 compliant\n");
    expect(code).not.toBe(0);
    expect(stderr).toMatch(/O24/);
  });

  it('PASSES "audit-ready evidence assembled" (exit 0)', () => {
    expect(lint("audit-ready evidence assembled\n").code).toBe(0);
  });
});

describe("compliance-lint — all four violation classes FIRE", () => {
  it("blesses-AI-pentest-as-coverage → block (OP O20 / KP P18)", () => {
    const { code, stderr } = lint(
      "we ran an AI red-team, we are covered for the SOC 2 pen-test\n"
    );
    expect(code).not.toBe(0);
    expect(stderr).toMatch(/O20/);
  });

  it("auto-revoke without a human gate → block (OP O19 / KP P6)", () => {
    const { code, stderr } = lint("the agent will auto-revoke the stale grant\n");
    expect(code).not.toBe(0);
    expect(stderr).toMatch(/O19/);
  });

  it("a secret committed to git → block", () => {
    const { code } = lint("ANTHROPIC_API_KEY=sk-ant-api03-AbCdEfGhIjKlMnOpQrStUv\n");
    expect(code).not.toBe(0);
  });
});

describe("compliance-lint — clean + forbidding text PASSES (no false positives)", () => {
  it("PROPOSE + human-approves access review → pass", () => {
    expect(lint("stamp will PROPOSE revokes; a human approves\n").code).toBe(0);
  });

  it("human-led pen-test → pass", () => {
    expect(lint("get a human-led pen-test annually, scoped to the boundary\n").code).toBe(0);
  });

  it("text FORBIDDING the anti-pattern is stamp's own creed → pass", () => {
    // stamp's own brain/skills mention the anti-pattern only to forbid it.
    expect(lint("NEVER claim AI-pentest coverage as the SOC 2 pen-test\n").code).toBe(0);
    expect(lint("NEVER auto-revoke; PROPOSE and a human approves\n").code).toBe(0);
    expect(lint("NEVER claim compliant; say audit-ready evidence assembled\n").code).toBe(0);
  });

  it("env-refs / placeholders are not secrets → pass", () => {
    expect(lint("VANTA_CLIENT_SECRET=${VANTA_CLIENT_SECRET}\n").code).toBe(0);
    expect(lint("set client_secret to <your-secret-here>\n").code).toBe(0);
  });
});

describe("compliance-lint — works as a real Claude Code hook (JSON payload)", () => {
  it("lints the text-bearing fields of a hook payload", () => {
    const violation = JSON.stringify({
      tool_input: { file_path: "x.md", content: "we are SOC 2 compliant" },
    });
    expect(lint(violation + "\n").code).not.toBe(0);

    const clean = JSON.stringify({
      tool_input: { content: "audit-ready evidence assembled; attestation pending the auditor" },
    });
    expect(lint(clean + "\n").code).toBe(0);
  });
});
