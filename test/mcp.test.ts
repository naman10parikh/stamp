// C1 — the stamp-mcp stdio server must expose exactly the 8 stamp_* tools + the 6 brain
// resources, and a tools/call must route to the same judgment the CLI uses (one source of
// truth, two surfaces). We spawn the compiled server as a subprocess and pipe JSON-RPC over
// stdin — EXACTLY how the board's verify line + a real MCP client (.mcp.json) invoke it.
//
// Requires `pnpm build` first (the suite's other tests import from src; this one drives the
// built dist/mcp/server.js, the artifact .mcp.json points at). CI runs build before test.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER = join(HERE, "..", "dist", "mcp", "server.js");

/** Send one-or-more JSON-RPC requests over stdin; return the parsed response objects. */
function rpc(...requests: object[]): Array<Record<string, unknown>> {
  const input = requests.map((r) => JSON.stringify(r)).join("\n") + "\n";
  const r = spawnSync("node", [SERVER], { input, encoding: "utf8", timeout: 15_000 });
  const out: Array<Record<string, unknown>> = [];
  for (const line of (r.stdout ?? "").split("\n")) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line) as Record<string, unknown>);
    } catch {
      // non-JSON line (shouldn't happen on stdout) — skip
    }
  }
  return out;
}

// Narrow helpers for the MCP result shapes we assert on.
function resultOf(responses: Array<Record<string, unknown>>, id: number): Record<string, unknown> {
  const r = responses.find((x) => x.id === id);
  if (!r || typeof r.result !== "object" || r.result === null) {
    throw new Error(`no result for id ${id}: ${JSON.stringify(responses)}`);
  }
  return r.result as Record<string, unknown>;
}
function toolCallText(result: Record<string, unknown>): string {
  const content = result.content as Array<{ type: string; text?: string }>;
  return content.map((c) => c.text ?? "").join("\n");
}

describe("stamp-mcp — the build artifact .mcp.json points at", () => {
  it("compiled server exists (pnpm build ran)", () => {
    expect(existsSync(SERVER)).toBe(true);
  });
});

describe("stamp-mcp — tools/list (the board's exact verify)", () => {
  it("returns exactly the 8 stamp_* tools", () => {
    const res = resultOf(rpc({ jsonrpc: "2.0", id: 1, method: "tools/list" }), 1);
    const tools = res.tools as Array<{ name: string }>;
    const names = tools.map((t) => t.name).filter((n) => n.startsWith("stamp_")).sort();
    expect(names).toEqual([
      "stamp_access_review",
      "stamp_advise",
      "stamp_audit",
      "stamp_audit_log",
      "stamp_dsar",
      "stamp_questionnaire",
      "stamp_residency",
      "stamp_sso_plan",
    ]);
  });
});

describe("stamp-mcp — tools/call routes to the same judgment as the CLI", () => {
  it("stamp_audit gap-scans the fixture → CC7.2 finding, never 'compliant'", () => {
    const res = resultOf(
      rpc({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "stamp_audit", arguments: { path: "test/fixtures/app-under-audit", framework: "soc2" } },
      }),
      2,
    );
    const text = toolCallText(res);
    const report = JSON.parse(text) as { framework: string; findings: Array<{ control: string }> };
    expect(report.framework).toBe("soc2");
    expect(report.findings.map((f) => f.control)).toContain("CC7.2");
    // The defining boundary: stamp NEVER claims "compliant" (OP O24 / KP P7).
    expect(text.toLowerCase()).not.toContain('"compliant"');
  });

  it("stamp_sso_plan @ $300k → badge handoff present, NO SAML code (boundary — OP O2 / KP P25)", () => {
    const res = resultOf(
      rpc({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "stamp_sso_plan", arguments: { target: "x", acv: 300000, dryRun: true } },
      }),
      3,
    );
    const text = toolCallText(res);
    const plan = JSON.parse(text) as { badge_handoff: string; trigger_decision: string };
    expect(plan.badge_handoff).toContain("badge init");
    expect(plan.trigger_decision.toLowerCase()).toMatch(/build now|deal-blocker/);
    expect(text).not.toMatch(/ACS|SAMLResponse|samlp:|<saml|class .*SCIM/);
  });

  it("an unknown tool returns an MCP error result (not a crash)", () => {
    const res = resultOf(
      rpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "stamp_bogus", arguments: {} } }),
      4,
    );
    expect(res.isError).toBe(true);
  });
});

describe("stamp-mcp — brain resources", () => {
  it("resources/list exposes the 6 brain files as stamp://brain/*", () => {
    const res = resultOf(rpc({ jsonrpc: "2.0", id: 5, method: "resources/list" }), 5);
    const uris = (res.resources as Array<{ uri: string }>).map((r) => r.uri).sort();
    expect(uris).toEqual([
      "stamp://brain/BATTLE-TESTED-SCENARIOS.md",
      "stamp://brain/EXPERTISE-MAP.md",
      "stamp://brain/GAPS-AND-DISPUTES.md",
      "stamp://brain/KNOWN-PITFALLS.md",
      "stamp://brain/OPINIONS.md",
      "stamp://brain/TOOL-MATRIX.md",
    ]);
  });

  it("resources/read returns the real OPINIONS.md content", () => {
    const res = resultOf(
      rpc({ jsonrpc: "2.0", id: 6, method: "resources/read", params: { uri: "stamp://brain/OPINIONS.md" } }),
      6,
    );
    const contents = res.contents as Array<{ text: string }>;
    expect(contents[0]?.text).toContain("stamp OPINIONS");
  });
});
