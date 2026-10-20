#!/usr/bin/env node
// cockpit/server.mjs — stamp's local web cockpit (D3 product surface; PLAN §10; MASTER-TODOS G1).
//
// Stdlib-only Node `http` server on localhost:7799 — ZERO dependencies (no express/framework;
// the package is "type":"module", so this is ESM). For the CHAIRMAN's eyes, not agents (agents
// use the CLI/MCP). It serves a vanilla-JS SPA (cockpit/index.html + app.js + styles.css) and a
// handful of read-mostly JSON endpoints that surface stamp's own brain, run log, eval pyramid,
// and an "ask-the-employee" box that shells out to the REAL CLI (`node bin/stamp … --json`).
//
// Design (mirrors the proven sentinel / talent-intel cockpit pattern, in Node):
//   - REPO   = parent of cockpit/  →  the repository root.
//   - STATIC = cockpit/  (only the three SPA files are served; path-traversal guarded).
//   - Data is loaded LAZILY inside each route — a missing `dist/` (CLI not built) or a missing
//     log file returns an honest JSON error with the right status, it NEVER crashes the boot, so
//     `node cockpit/server.mjs` self-tests green standalone (the G1 verify line just needs `/`).
//   - Endpoints are GET-only (the cockpit reads; ask-the-employee runs read-only CLI verbs).
//   - Bind 127.0.0.1 ONLY — never exposed; no auth (local dev surface, like the siblings).
//
// Endpoints:
//   GET /                       → the SPA shell (index.html)
//   GET /app.js, /styles.css    → the SPA assets
//   GET /api/brain              → the 6 brain files (name + title + size)
//   GET /api/brain/file?name=   → one brain file's raw markdown
//   GET /api/brain/search?q=    → BM25 ranked, cited hits via scripts/brain-search.sh
//   GET /api/runs               → runs.jsonl tail + aggregate (cmd/human/outcome counts)
//   GET /api/eval               → the eval pyramid status (L1/L2 pass-fail + 15 golden + gate)
//   GET /api/ask?verb=…&…       → run audit | sso-plan | advise (read-only) → structured JSON

import { createServer } from "node:http";
import { readFile, readFileSync, existsSync, statSync } from "node:fs";
import { readFile as readFileP } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, ".."); // cockpit/ → the repository root
const PORT = Number(process.env.STAMP_COCKPIT_PORT || 7799);
const HOST = "127.0.0.1";

// ── the 6 canonical brain files (PLAN §10 view 1; the order the chairman expects) ───────────
const BRAIN_FILES = [
  "EXPERTISE-MAP.md",
  "BATTLE-TESTED-SCENARIOS.md",
  "KNOWN-PITFALLS.md",
  "OPINIONS.md",
  "GAPS-AND-DISPUTES.md",
  "TOOL-MATRIX.md",
];

// The SPA assets we will serve (whitelist — nothing else under cockpit/ is reachable).
const STATIC = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8" },
  "/app.js": { file: "app.js", type: "application/javascript; charset=utf-8" },
  "/styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
};

// ── small helpers ───────────────────────────────────────────────────────────────────────────
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body) });
  res.end(body);
}

function sendText(res, status, type, body) {
  res.writeHead(status, { "content-type": type, "content-length": Buffer.byteLength(body) });
  res.end(body);
}

// Extract the `title:` frontmatter (or fall back to the filename) for the brain list.
function brainTitle(name) {
  const p = join(REPO, "brain", name);
  if (!existsSync(p)) return name;
  try {
    const head = readFileSync(p, "utf8").slice(0, 1200);
    const m = head.match(/^title:\s*"?(.+?)"?\s*$/m);
    return m ? m[1] : name;
  } catch {
    return name;
  }
}

// Run a child process, capture stdout/stderr, resolve { code, stdout, stderr }. Used for the
// CLI verbs (ask-the-employee), the BM25 search, and the eval run. cwd = REPO so relative paths
// (test/fixtures, brain/, logs/, dist/) resolve. A 20s cap guards a hung child.
function run(cmd, args, { timeoutMs = 20000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: REPO, env: process.env });
    let stdout = "";
    let stderr = "";
    let done = false;
    const finish = (code) => {
      if (done) return;
      done = true;
      resolve({ code, stdout, stderr });
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(-1);
    }, timeoutMs);
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (err) => {
      stderr += String(err && err.message ? err.message : err);
      clearTimeout(timer);
      finish(-1);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      finish(code);
    });
  });
}

// ── route: GET /api/brain — list the 6 brain files (the queryable-memory corpus) ─────────────
async function apiBrainList(res) {
  const files = BRAIN_FILES.map((name) => {
    const p = join(REPO, "brain", name);
    let bytes = 0;
    try {
      bytes = existsSync(p) ? statSync(p).size : 0;
    } catch {
      bytes = 0;
    }
    return { name, title: brainTitle(name), bytes, present: bytes > 0 };
  });
  sendJson(res, 200, { files });
}

// ── route: GET /api/brain/file?name=EXPERTISE-MAP.md — one brain file's raw markdown ─────────
async function apiBrainFile(res, name) {
  // Only the whitelisted 6 are readable (no traversal, no arbitrary brain/research/raw dump).
  if (!BRAIN_FILES.includes(name)) {
    return sendJson(res, 400, { error: `unknown brain file: ${name}` });
  }
  const p = join(REPO, "brain", name);
  if (!existsSync(p)) return sendJson(res, 404, { error: `brain file not found: ${name}` });
  try {
    const markdown = await readFileP(p, "utf8");
    sendJson(res, 200, { name, title: brainTitle(name), markdown });
  } catch (err) {
    sendJson(res, 500, { error: `read failed: ${err.message}` });
  }
}

// ── route: GET /api/brain/search?q= — BM25 over brain/**.md via the canonical searcher ──────
async function apiBrainSearch(res, q) {
  if (!q || !q.trim()) return sendJson(res, 400, { error: "missing query (?q=)" });
  const script = join(REPO, "scripts", "brain-search.sh");
  if (!existsSync(script)) return sendJson(res, 503, { error: "brain-search.sh not found" });
  const { code, stdout, stderr } = await run("bash", [script, q, "--limit", "5"]);
  if (code !== 0) return sendJson(res, 500, { error: stderr.trim() || "brain-search failed", code });
  // Parse the human-readable ranked output into structured hits for the SPA.
  // Lines look like:  "[1] brain/OPINIONS.md (score: 4.21)"  then  "    ↳ <cited line>".
  const hits = [];
  const lines = stdout.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\[(\d+)\]\s+(.+?)\s+\(score:\s*([\d.]+)\)/);
    if (m) {
      const next = lines[i + 1] || "";
      const cite = next.match(/^\s*↳\s*(.+)$/);
      hits.push({ rank: Number(m[1]), file: m[2], score: Number(m[3]), cite: cite ? cite[1] : "" });
    }
  }
  sendJson(res, 200, { query: q, hits, raw: stdout });
}

// ── route: GET /api/runs — tail logs/runs.jsonl + the runs-view aggregate ────────────────────
async function apiRuns(res) {
  const logPath = join(REPO, "logs", "runs.jsonl");
  let recent = [];
  if (existsSync(logPath)) {
    try {
      const text = await readFileP(logPath, "utf8");
      const all = text.split("\n").filter((l) => l.trim());
      // last 50, newest first
      recent = all
        .slice(-50)
        .reverse()
        .map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch {
      recent = [];
    }
  }
  // Aggregate via the existing zero-dep viewer (single source of truth for the totals).
  let summary = null;
  const viewer = join(REPO, "scripts", "runs-view.mjs");
  if (existsSync(viewer)) {
    const { code, stdout } = await run("node", [viewer, "--json"]);
    if (code === 0) {
      try {
        summary = JSON.parse(stdout);
      } catch {
        summary = null;
      }
    }
  }
  sendJson(res, 200, { summary, recent });
}

// ── route: GET /api/eval — the eval pyramid status (runs eval/run.mjs, parses deterministic output)
async function apiEval(res) {
  // Static structure from golden-tasks.json (the 15 tasks + which are CI-blocking).
  let golden = { total: 0, ci_blocking: 0, threshold: 0.8, ids: [] };
  const gPath = join(REPO, "eval", "golden-tasks.json");
  if (existsSync(gPath)) {
    try {
      const data = JSON.parse(readFileSync(gPath, "utf8"));
      const tasks = data.tasks || [];
      golden = {
        total: tasks.length,
        ci_blocking: tasks.filter((t) => t.ci_block).length,
        threshold: data.f1_threshold || 0.8,
        ids: tasks.map((t) => ({ id: t.id, level: t.level, ci_block: !!t.ci_block, bts: t.bts || "" })),
      };
    } catch {
      // keep defaults
    }
  }
  // Live pass/fail by running the eval (it builds first, ~2-4s). Parse the deterministic
  // PASS/FAIL lines + the final `pass N / fail M` + `GATE GREEN|RED`. eval/run.mjs has no
  // --json mode (by design — it's the CI gate); we parse its stable text contract.
  const { code, stdout } = await run("node", [join(REPO, "eval", "run.mjs")], { timeoutMs: 60000 });
  const l1 = [];
  const l2 = [];
  for (const line of stdout.split("\n")) {
    const l1m = line.match(/^\s*(PASS|FAIL)\s+(L1\.[^\s].*)$/);
    if (l1m) l1.push({ ok: l1m[1] === "PASS", name: l1m[2].trim() });
    const l2m = line.match(/^\s*(PASS|FAIL)\s+(\[CI\]|\s{4})\s*(G\d+)\s+\(F1=([\d.]+)\)/);
    if (l2m) l2.push({ ok: l2m[1] === "PASS", ci_block: l2m[2].includes("CI"), id: l2m[3], f1: Number(l2m[4]) });
  }
  const sumM = stdout.match(/pass\s+(\d+)\s*\/\s*fail\s+(\d+)/);
  const gate = /GATE GREEN/.test(stdout) ? "green" : /GATE RED/.test(stdout) ? "red" : "unknown";
  const l3Gated = /L3 LLM-judge/.test(stdout) && /skipped \(no ANTHROPIC_API_KEY\)|ANTHROPIC_API_KEY present/.test(stdout);
  sendJson(res, 200, {
    gate,
    pass: sumM ? Number(sumM[1]) : null,
    fail: sumM ? Number(sumM[2]) : null,
    exit_code: code,
    l1,
    l2,
    golden,
    l3_note: l3Gated ? "L3 LLM-judge is key-gated + non-blocking (D15)" : "",
  });
}

// ── route: GET /api/ask?verb=audit|sso-plan|advise&… — run a read-only CLI verb ──────────────
async function apiAsk(res, params) {
  const verb = params.get("verb");
  const ALLOWED = new Set(["audit", "sso-plan", "advise"]);
  if (!verb || !ALLOWED.has(verb)) {
    return sendJson(res, 400, { error: `verb must be one of: ${[...ALLOWED].join(", ")}` });
  }
  // Build the argv per verb — only known flags, values validated, ALWAYS --json. No shell.
  const args = [join(REPO, "bin", "stamp"), verb];
  if (verb === "audit") {
    const target = params.get("target") || "test/fixtures/app-under-audit";
    // restrict target to a repo-relative fixture path (no traversal, no abs paths)
    const safe = normalize(target);
    if (safe.startsWith("..") || safe.startsWith("/")) {
      return sendJson(res, 400, { error: "target must be a repo-relative path" });
    }
    args.push(safe);
    const fw = params.get("framework");
    if (fw && /^(soc2|iso27001|gdpr)$/.test(fw)) args.push("--framework", fw);
  } else if (verb === "sso-plan") {
    args.push("--dry-run");
    const acv = params.get("acv");
    if (acv && /^\d+$/.test(acv)) args.push("--acv", acv);
    const target = params.get("target");
    if (target) {
      const safe = normalize(target);
      if (!safe.startsWith("..") && !safe.startsWith("/")) args.push("--target", safe);
    }
  } else if (verb === "advise") {
    const on = params.get("on") || "grc-platform";
    if (!/^(grc-platform|privacy|pentest|residency|repos)$/.test(on)) {
      return sendJson(res, 400, { error: "advise --on must be one of: grc-platform|privacy|pentest|residency|repos" });
    }
    args.push("--on", on);
  }
  args.push("--json");

  if (!existsSync(join(REPO, "dist", "cli", "index.js"))) {
    return sendJson(res, 503, {
      error: "the stamp CLI is not built — run `pnpm build` first (cockpit shells out to bin/stamp)",
      verb,
    });
  }
  const { code, stdout, stderr } = await run("node", args);
  if (code !== 0) {
    return sendJson(res, 500, { error: stderr.trim() || `stamp ${verb} exited ${code}`, verb, code });
  }
  let result;
  try {
    result = JSON.parse(stdout);
  } catch {
    return sendJson(res, 500, { error: "stamp returned non-JSON output", verb, raw: stdout });
  }
  sendJson(res, 200, { verb, result });
}

// ── static file serving (whitelist + traversal guard) ────────────────────────────────────────
function serveStatic(res, route) {
  const entry = STATIC[route];
  if (!entry) return false;
  const p = join(HERE, entry.file);
  // Defense-in-depth: the resolved path MUST stay inside cockpit/.
  if (!normalize(p).startsWith(normalize(HERE))) {
    sendText(res, 403, "text/plain", "forbidden");
    return true;
  }
  readFile(p, (err, buf) => {
    if (err) return sendText(res, 404, "text/plain", "not found");
    res.writeHead(200, { "content-type": entry.type, "content-length": buf.length });
    res.end(buf);
  });
  return true;
}

// ── request router ────────────────────────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  try {
    if (req.method !== "GET") return sendJson(res, 405, { error: "GET only" });
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    const path = url.pathname;
    const params = url.searchParams;

    if (STATIC[path]) return void serveStatic(res, path);
    if (path === "/api/brain") return void (await apiBrainList(res));
    if (path === "/api/brain/file") return void (await apiBrainFile(res, params.get("name")));
    if (path === "/api/brain/search") return void (await apiBrainSearch(res, params.get("q")));
    if (path === "/api/runs") return void (await apiRuns(res));
    if (path === "/api/eval") return void (await apiEval(res));
    if (path === "/api/ask") return void (await apiAsk(res, params));
    if (path === "/favicon.ico") return void sendText(res, 204, "text/plain", "");

    sendJson(res, 404, { error: `no route: ${path}` });
  } catch (err) {
    sendJson(res, 500, { error: err && err.message ? err.message : String(err) });
  }
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`stamp cockpit → http://${HOST}:${PORT}  (the chairman's eyes; agents use the CLI/MCP)\n`);
});
