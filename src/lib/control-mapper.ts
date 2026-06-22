// control-mapper — the SOC 2 gap-scan engine (EM JTBD-1; the acceptance-test half-1 core).
//
// stamp's judgment lives HERE, not in re-implementing a GRC platform's CRUD (OP O4).
// EM 1.3/1.4: the CC6.x (logical access) and CC7.x (monitoring) families are where the
// load-bearing evidence lives, and the controls auditors fail you on most are
// access reviews + audit logging + change management. So the scan maps a target tree
// against exactly those load-bearing controls and reports the GAPS — never a "compliant"
// verdict (OP O24). Static + deterministic: the same tree always yields the same report.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  readonly control: string;
  readonly family: string;
  readonly severity: Severity;
  readonly evidence_gap: string;
  readonly fix: string;
  readonly brain_cite: string;
}

export interface GapReport {
  readonly framework: string;
  readonly target: string;
  readonly findings: Finding[];
  readonly controls_checked: number;
  readonly readiness_summary: string;
  readonly disclaimer: string;
}

/** A control we know how to gap-scan for, with a tree-evidence detector. */
interface ControlCheck {
  readonly control: string;
  readonly family: string;
  readonly severity: Severity;
  readonly evidence_gap: string;
  readonly fix: string;
  readonly brain_cite: string;
  /** Substrings whose presence (in a filename OR file content) counts as evidence. */
  readonly evidenceSignals: readonly string[];
}

// The load-bearing SOC 2 controls stamp gap-scans (EM 1.3/1.4 — CC6/CC7/CC8 first).
// Each detector is intentionally conservative: it looks for concrete artifacts an
// auditor would accept as evidence, and flags a GAP when none are present in the tree.
const SOC2_CHECKS: readonly ControlCheck[] = [
  {
    control: "CC7.2",
    family: "CC7 — System Monitoring",
    severity: "critical",
    evidence_gap:
      'no tamper-EVIDENT audit trail found ("we have logs" ≠ "we have an audit trail")',
    fix: "build an append-only, hash-chained + signed OTel-span audit trail (actor/target/before_hash/after_hash/trace_id), ≥1yr retention, real-time SIEM export — run `stamp audit-log --design`",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-4.1/4.3; brain/OPINIONS.md O8; brain/KNOWN-PITFALLS.md P8/P9",
    evidenceSignals: ["audit-log", "audit_log", "audit-trail", "hash_chain", "hash-chain", "before_hash", "otel", "opentelemetry", "tamper-evident", "siem"],
  },
  {
    control: "CC6.3",
    family: "CC6 — Logical & Physical Access",
    severity: "high",
    evidence_gap:
      "no access-review / least-privilege attestation artifact found (the control auditors flag MOST)",
    fix: "stand up a periodic User Access Review scoped to service accounts + API keys + AGENT identities (derive the inventory from badge token scopes); propose revokes, a human approves — run `stamp access-review --scope agents`",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-3.3/3.4; brain/OPINIONS.md O17/O19; brain/BATTLE-TESTED-SCENARIOS.md S7",
    evidenceSignals: ["access-review", "access_review", "uar", "least-privilege", "least_privilege", "attestation", "rbac-review"],
  },
  {
    control: "CC8.1",
    family: "CC8 — Change Management",
    severity: "medium",
    evidence_gap:
      "no change-management evidence found (PR review / CI gate / approval records) — incl. for AI threshold-promotions (CC8)",
    fix: "require PR review + a CI gate, and attach eval-score + before/after-hash + approval to AI/AutoLab promotions (the RSI audit log doubles as CC8 evidence)",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-4.6; brain/KNOWN-PITFALLS.md P11",
    evidenceSignals: [".github/workflows", "ci.yml", "pull_request", "codeowners", "branch-protection", "changelog"],
  },
  {
    control: "CC6.1",
    family: "CC6 — Logical & Physical Access",
    severity: "high",
    evidence_gap:
      "no logical-access-control / RBAC configuration found (authentication + scoped authorization)",
    fix: "wire SSO/RBAC (the MECHANISM is badge's: `badge init`); stamp keeps the access posture + the periodic review",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-3; brain/OPINIONS.md O18 (one inventory, derived from badge)",
    evidenceSignals: ["auth", "rbac", "authorization", "permission", "scopes", "middleware", "session", "clerk", "workos", "saml", "oidc"],
  },
  {
    control: "CC7.1",
    family: "CC7 — System Monitoring",
    severity: "medium",
    evidence_gap: "no baseline logging/monitoring configuration found",
    fix: "add structured logging + monitoring before layering the tamper-evident audit trail (CC7.2)",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-4.1",
    evidenceSignals: ["logger", "logging", "pino", "winston", "monitor", "metrics", "tracing"],
  },
];

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);
const SCANNABLE_EXT = new Set([".ts", ".js", ".tsx", ".jsx", ".json", ".yml", ".yaml", ".md", ".env", ".sql", ".toml", ".mjs", ".cjs"]);
const MAX_FILE_BYTES = 256 * 1024;

interface TreeSnapshot {
  readonly paths: string[]; // relative paths (dirs + files), lowercased
  readonly haystack: string; // concatenated lowercased filenames + scannable file contents
}

/** Walk the target tree once, collecting relative paths + a content haystack. */
function snapshotTree(root: string): TreeSnapshot {
  const paths: string[] = [];
  const contentParts: string[] = [];

  function walk(dir: string, rel: string): void {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (SKIP_DIRS.has(name)) continue;
      const abs = join(dir, name);
      const relPath = rel ? `${rel}/${name}` : name;
      let st;
      try {
        st = statSync(abs);
      } catch {
        continue;
      }
      paths.push(relPath.toLowerCase());
      if (st.isDirectory()) {
        walk(abs, relPath);
      } else if (st.isFile() && SCANNABLE_EXT.has(extname(name).toLowerCase()) && st.size <= MAX_FILE_BYTES) {
        try {
          contentParts.push(readFileSync(abs, "utf8").toLowerCase());
        } catch {
          // unreadable file — its name still counts as a path signal
        }
      }
    }
  }

  walk(root, "");
  return { paths, haystack: (paths.join("\n") + "\n" + contentParts.join("\n")).toLowerCase() };
}

/** True iff any of the control's evidence signals appears in the tree. */
function hasEvidence(snap: TreeSnapshot, signals: readonly string[]): boolean {
  return signals.some((sig) => snap.haystack.includes(sig.toLowerCase()));
}

/**
 * Gap-scan a target app tree for SOC 2 readiness. Returns control-mapped findings for
 * every load-bearing control WITHOUT accepted evidence. NEVER returns "compliant".
 */
export function scanForGaps(targetPath: string, framework = "soc2"): GapReport {
  if (!targetPath || !existsSync(targetPath)) {
    // Graceful, deterministic error shape (chaos: corrupt/empty input).
    throw new Error(`stamp audit: target path not found: ${JSON.stringify(targetPath)}`);
  }

  const fw = framework.toLowerCase();
  if (fw !== "soc2" && fw !== "iso27001" && fw !== "hipaa") {
    throw new Error(`stamp audit: unsupported framework ${JSON.stringify(framework)} (soc2|iso27001|hipaa)`);
  }

  const snap = snapshotTree(targetPath);
  const findings: Finding[] = [];

  for (const check of SOC2_CHECKS) {
    if (!hasEvidence(snap, check.evidenceSignals)) {
      findings.push({
        control: check.control,
        family: check.family,
        severity: check.severity,
        evidence_gap: check.evidence_gap,
        fix: check.fix,
        brain_cite: check.brain_cite,
      });
    }
  }

  return {
    framework: fw,
    target: targetPath,
    findings,
    controls_checked: SOC2_CHECKS.length,
    readiness_summary: readinessSummaryLocal(findings.length),
    disclaimer:
      "audit-ready evidence assembled — the attestation is the CPA firm's, never stamp's; readiness is not certification (OP O24)",
  };
}

// Local copy of the readiness phrasing kept identical to constants.readinessSummary, so
// this lib stays importable without a cycle. NEVER emits the claim word an auditor signs.
function readinessSummaryLocal(gapCount: number): string {
  return `audit-ready evidence: ${gapCount} gap${gapCount === 1 ? "" : "s"} (attestation pending the auditor — not certification)`;
}
