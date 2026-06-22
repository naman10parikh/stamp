// stamp-mcp — stamp's own MCP server (Cluster C1). Exposes the 8 governance/evidence verbs
// as MCP tools so Claude / the energy hub / sibling employees (especially badge) call them
// natively over stdio, plus the 6 brain files as readable `stamp://brain/{file}` resources.
//
// Surgical: this wraps the EXACT same pure lib functions the CLI uses (control-mapper /
// sso-program / verbs) — one source of truth for the judgment, two surfaces (CLI + MCP).
// It adds NO new domain logic and emits NO SAML/auth code (the boundary: mechanism → badge).
//
// Uses the low-level Server + schema-constant setRequestHandler form (the installed
// @modelcontextprotocol/sdk@1.29.0 API). No direct `zod` import — the request schemas come
// pre-built from the SDK, so the tool inputSchemas are declared as plain JSON-Schema objects.

import { readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolResult,
  type ReadResourceResult,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { scanForGaps } from "../lib/control-mapper.js";
import { planSsoProgram } from "../lib/sso-program.js";
import {
  advise,
  assessResidency,
  designAuditLog,
  draftQuestionnaire,
  planDsar,
  runAccessReview,
  type AdviseTopic,
} from "../lib/verbs.js";
import { BOUNDARY_ONE_LINER } from "../lib/constants.js";

// repo root = two levels up from dist/mcp/ (or src/mcp/ at type-check time).
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const brainDir = join(repoRoot, "brain");

// ── helpers ────────────────────────────────────────────────────────────────────
type Args = Record<string, unknown>;
const str = (a: Args, k: string): string | undefined => (typeof a[k] === "string" ? (a[k] as string) : undefined);
const num = (a: Args, k: string): number | undefined => (typeof a[k] === "number" && Number.isFinite(a[k]) ? (a[k] as number) : undefined);
const bool = (a: Args, k: string): boolean => a[k] === true;

/** Wrap any structured result as an MCP text-content tool result (JSON, exact). */
function jsonResult(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

// ── the 8 tool definitions (name · description · JSON-Schema input · handler) ────
// Each handler delegates to the shared lib — identical judgment to the CLI verbs.
interface ToolDef {
  readonly tool: Tool;
  readonly run: (args: Args) => unknown;
}

const TOOLS: readonly ToolDef[] = [
  {
    tool: {
      name: "stamp_audit",
      description:
        "Gap-scan a target app/repo for SOC2-readiness → a control-mapped gap report (CC6/CC7/CC8 load-bearing controls, severity + fix). NEVER returns 'compliant' — only 'audit-ready evidence'. EM JTBD-1.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "path to the target app/repo to gap-scan" },
          framework: { type: "string", enum: ["soc2", "iso27001", "hipaa"], description: "framework (default soc2)" },
        },
        required: ["path"],
      },
    },
    run: (a) => scanForGaps(str(a, "path") ?? str(a, "app") ?? "", str(a, "framework") ?? "soc2"),
  },
  {
    tool: {
      name: "stamp_sso_plan",
      description:
        "Emit the enterprise-SSO PROGRAM plan: trigger decision (build-now at ~$200k ACV), buyer-readiness checklist, WorkOS wiring plan, deprovisioning-proof spec, and the `badge init --provider workos` handoff. Emits NO SAML/SCIM code (mechanism → badge). EM JTBD-8.",
      inputSchema: {
        type: "object",
        properties: {
          target: { type: "string", description: "the app the program is for" },
          acv: { type: "number", description: "annual contract value (drives the build-now trigger)" },
          dryRun: { type: "boolean", description: "plan only (the program is advisory)" },
        },
      },
    },
    run: (a) => planSsoProgram({ target: str(a, "target"), acv: num(a, "acv") ?? null, dryRun: bool(a, "dryRun") }),
  },
  {
    tool: {
      name: "stamp_audit_log",
      description:
        "Design the tamper-EVIDENT audit trail (actor/target/before_hash/after_hash/trace_id, hash-chained + signed, accountable-human attribution, SIEM export) OR check a config for the 4 properties. EM JTBD-4.",
      inputSchema: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["design", "check"], description: "design (default) | check" },
          path: { type: "string", description: "config path to assess (check mode)" },
        },
      },
    },
    run: (a) => designAuditLog(str(a, "mode") === "check" ? "check" : "design", str(a, "path")),
  },
  {
    tool: {
      name: "stamp_access_review",
      description:
        "Run a User Access Review scoped to non-human + AGENT identities (inventory derived from badge token scopes). PROPOSES revokes for a human to approve — never auto-revokes. --scim adds IdP↔app reconciliation. EM JTBD-3/9.",
      inputSchema: {
        type: "object",
        properties: {
          scope: { type: "string", enum: ["all", "privileged", "agents"], description: "review scope (default all)" },
          scim: { type: "boolean", description: "add IdP↔app deprovisioning reconciliation" },
        },
      },
    },
    run: (a) => {
      const s = str(a, "scope");
      const scope = s === "privileged" || s === "agents" ? s : "all";
      return runAccessReview(scope, bool(a, "scim"));
    },
  },
  {
    tool: {
      name: "stamp_residency",
      description:
        "Ask 'residency or sovereignty?' first, then enumerate the WHOLE pipeline (DB+backups+logs+CDN+subprocessors+the LLM call+tax data) + the BYOK/CMK sovereignty lever. EM JTBD-5.",
      inputSchema: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["ask", "check"], description: "ask (default) | check" },
          path: { type: "string", description: "config path to assess (check mode)" },
        },
      },
    },
    run: (a) => assessResidency(str(a, "mode") === "check" ? "check" : "ask", str(a, "path")),
  },
  {
    tool: {
      name: "stamp_dsar",
      description:
        "Plan a DSAR: classify → verify → apply exemptions → draft → route across the subprocessor register on the GDPR 1mo→3 / CCPA 45d→90 clock. A human SIGNS. EM JTBD-6.",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["access", "erasure"], description: "request type" },
        },
        required: ["type"],
      },
    },
    run: (a) => planDsar(str(a, "type") === "erasure" ? "erasure" : "access"),
  },
  {
    tool: {
      name: "stamp_questionnaire",
      description:
        "Draft security-questionnaire answers (SIG/CAIQ/VSA) mapped to a versioned answer-KB; every answer marked 'DRAFT — human must sign'. Never blesses an AI-only pen-test. EM JTBD-7.",
      inputSchema: {
        type: "object",
        properties: {
          format: { type: "string", enum: ["sig", "caiq", "vsa"], description: "questionnaire format" },
          kb: { type: "string", description: "answer-KB directory" },
        },
        required: ["format"],
      },
    },
    run: (a) => {
      const f = str(a, "format");
      const format = f === "caiq" || f === "vsa" ? f : "sig";
      return draftQuestionnaire(format, str(a, "kb"));
    },
  },
  {
    tool: {
      name: "stamp_advise",
      description:
        "A DECISION with the honest cost (Vanta default; vet the auditor; verify vendor independence; check pushed_at not stars) on grc-platform | privacy | pentest | residency | repos. EM JTBD-2/11.",
      inputSchema: {
        type: "object",
        properties: {
          on: { type: "string", enum: ["grc-platform", "privacy", "pentest", "residency", "repos"], description: "the advice topic" },
        },
        required: ["on"],
      },
    },
    run: (a) => {
      const on = str(a, "on");
      const valid: readonly AdviseTopic[] = ["grc-platform", "privacy", "pentest", "residency", "repos"];
      if (!on || !valid.includes(on as AdviseTopic)) {
        throw new Error(`stamp_advise: --on must be one of ${valid.join("|")}, got ${JSON.stringify(on)}`);
      }
      return advise(on as AdviseTopic);
    },
  },
];

const TOOL_BY_NAME = new Map(TOOLS.map((t) => [t.tool.name, t]));

// ── the 6 brain files exposed as MCP resources (stamp://brain/{file}) ────────────
const BRAIN_FILES: readonly string[] = [
  "EXPERTISE-MAP.md",
  "BATTLE-TESTED-SCENARIOS.md",
  "KNOWN-PITFALLS.md",
  "OPINIONS.md",
  "GAPS-AND-DISPUTES.md",
  "TOOL-MATRIX.md",
];

function brainResourceUri(file: string): string {
  return `stamp://brain/${file}`;
}

// ── build + wire the server ──────────────────────────────────────────────────────
export function buildServer(): Server {
  const server = new Server(
    { name: "stamp-mcp", version: "0.1.0" },
    {
      capabilities: { tools: {}, resources: {} },
      instructions:
        `stamp — the compliance / enterprise-readiness employee. ${BOUNDARY_ONE_LINER}. ` +
        "Tools gap-scan apps for SOC2-readiness, plan the enterprise-SSO program (and hand SAML/SCIM to badge), " +
        "design tamper-evident audit trails, scope access-reviews to agent identities, prove residency, automate " +
        "DSARs, answer SIG/CAIQ. NEVER claims 'compliant'; NEVER emits auth code; NEVER auto-revokes.",
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOLS.map((t) => t.tool) }));

  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const def = TOOL_BY_NAME.get(request.params.name);
    if (!def) {
      return { isError: true, content: [{ type: "text", text: `stamp-mcp: unknown tool ${JSON.stringify(request.params.name)}` }] };
    }
    try {
      const result = def.run((request.params.arguments ?? {}) as Args);
      return jsonResult(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { isError: true, content: [{ type: "text", text: msg }] };
    }
  });

  server.setRequestHandler(ListResourcesRequestSchema, () => ({
    resources: BRAIN_FILES.map((file) => ({
      uri: brainResourceUri(file),
      name: `brain/${file}`,
      description: `stamp's compliance brain — ${file}`,
      mimeType: "text/markdown",
    })),
  }));

  server.setRequestHandler(ReadResourceRequestSchema, (request): ReadResourceResult => {
    const uri = request.params.uri;
    const prefix = "stamp://brain/";
    if (!uri.startsWith(prefix)) {
      throw new Error(`stamp-mcp: unknown resource ${JSON.stringify(uri)}`);
    }
    // Validate the file name against the allow-list (no path traversal).
    const file = uri.slice(prefix.length);
    if (!BRAIN_FILES.includes(file)) {
      throw new Error(`stamp-mcp: unknown brain file ${JSON.stringify(file)}`);
    }
    const abs = normalize(join(brainDir, file));
    if (!abs.startsWith(normalize(brainDir))) {
      throw new Error(`stamp-mcp: invalid brain path ${JSON.stringify(file)}`);
    }
    const text = readFileSync(abs, "utf8");
    return { contents: [{ uri, mimeType: "text/markdown", text }] };
  });

  return server;
}

export async function main(): Promise<void> {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Run when invoked directly (node dist/mcp/server.js).
const invokedDirectly = process.argv[1] && normalize(process.argv[1]) === normalize(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  void main();
}
