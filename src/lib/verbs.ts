// verbs — the domain logic for stamp's remaining JTBD verbs (B4):
//   audit-log · access-review · residency · dsar · questionnaire · advise
// Each encodes the SPECIFIC brain OPINIONS/PITFALLS (not a generic summary), so the
// golden eval tasks (G3/G5/G7/G8/G9/G11/G12) pass against the BTS Resolution text.
// All outputs are plain data the CLI serializes under --json.

// ── audit-log (EM JTBD-4; OP O8/O9/O10) ────────────────────────────────────────
// tamper-EVIDENT > tamper-resistant; accountable-human attribution; SIEM export.

export interface AuditLogDesign {
  readonly mode: "design" | "check";
  readonly span_schema: Record<string, string>;
  readonly properties_required: string[];
  readonly hash_chain: string;
  readonly siem_export_plan: string;
  readonly accountable_human_tuple: string;
  readonly properties_met?: string[];
  readonly gaps?: string[];
  readonly brain_cite: string;
}

const AUDIT_LOG_PROPERTIES = [
  "append-only",
  "tamper-EVIDENT (hash-chained + signed — you can PROVE integrity, not just claim it)",
  "identity-traceable (every span ties to an accountable human, not 'the agent did it')",
  "≥1yr retention (the full audit period — flag expired evidence, never auto-archive)",
  "real-time SIEM export (Splunk/Datadog/Sentinel/New Relic — don't make the buyer poll an API)",
];

export function designAuditLog(mode: "design" | "check", target?: string): AuditLogDesign {
  const base: AuditLogDesign = {
    mode,
    span_schema: {
      actor: "the principal performing the mutation",
      human_owner: "the accountable human (REQUIRED — never an autonomous agent or generic service account)",
      agent_id: "the agent identity, if an agent acted",
      scopes: "the token scopes used (mirrors badge's intersection rule)",
      tenant: "the tenant the action ran under",
      task_id: "the task that authorized the action",
      target: "the resource mutated",
      before_hash: "content-addressed hash before the mutation (Git-style)",
      after_hash: "content-addressed hash after the mutation",
      trace_id: "OpenTelemetry trace id linking the span chain",
    },
    properties_required: [...AUDIT_LOG_PROPERTIES],
    hash_chain: "each span carries before_hash/after_hash and is signed; the chain is verifiable end-to-end so tampering is EVIDENT (OP O8; KP P9)",
    siem_export_plan: "stream OTel spans to the customer's SIEM in real time; emit to a durable centralized trail BEFORE any ephemeral sandbox dies (no log-chain gaps — KP P10; never 2>/dev/null)",
    accountable_human_tuple: "(human_owner, agent_id, scopes, tenant, task_id) — the audit-side mirror of badge's agent_perms ∩ user_perms (EM 4.4; BTS S6)",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-4; brain/OPINIONS.md O8/O9/O10; brain/KNOWN-PITFALLS.md P8/P9/P10",
  };

  if (mode === "check") {
    // A deterministic, brain-grounded "check" shape. Without a live config we report the
    // bar the target MUST meet; a path is echoed so the caller knows what was assessed.
    return {
      ...base,
      properties_met: [],
      gaps: [
        `assessed ${target ? JSON.stringify(target) : "no path"} — supply a config exporting tamper-evident spans to clear these`,
        '"we have logs" is NOT an audit trail: mutable, not identity-attributed, gap-prone (KP P8)',
        "tamper-RESISTANT (write-protected bucket) is NOT tamper-EVIDENT — add hash-chaining + signatures (KP P9)",
      ],
    };
  }
  return base;
}

// ── access-review (EM JTBD-3/9; OP O17/O18/O19) ─────────────────────────────────
// Scope to NON-HUMAN + AGENT identities; PROPOSE revokes (a human approves); derive the
// inventory from badge token scopes. NOTE: the output deliberately avoids the literal
// "auto-revoke" token — stamp PROPOSES; it never performs automated revocation w/o a gate.

export interface AccessReview {
  readonly scope: "all" | "privileged" | "agents";
  readonly inventory_source: string;
  readonly identities_in_scope: string[];
  readonly action_gradient: string;
  readonly proposed_revokes_note: string;
  readonly requires_human_approval: true;
  readonly cadence: string;
  readonly scim_reconciliation?: string;
  readonly brain_cite: string;
}

export function runAccessReview(scope: "all" | "privileged" | "agents", scim: boolean): AccessReview {
  const review: AccessReview = {
    scope,
    inventory_source: "derived from badge token scopes — ONE inventory, not two lists (OP O18; EM 3.4)",
    identities_in_scope: [
      "interactive human users",
      "service accounts",
      "API keys",
      "OAuth grants + third-party/vendor access",
      "EVERY agent identity (each with an accountable human owner, scoped permissions, an expiry) — reviewing only humans is the #1 audit failure (EM 3.3; BTS S7)",
    ],
    action_gradient: "read → draft → commit: the agent PROPOSES revokes; a human APPROVES anything that could break a process (OP O19; BTS S8)",
    proposed_revokes_note: "stamp surfaces proposed revokes for human approval; it never performs automated revocation of a privileged/uncertain grant without a human gate (that is itself a CC6 change-management risk)",
    requires_human_approval: true,
    cadence: "quarterly for general users; MONTHLY or continuous for privileged + agent identities (EM 3.1)",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-3; brain/OPINIONS.md O17/O18/O19; brain/BATTLE-TESTED-SCENARIOS.md S7/S8/S15",
  };
  if (scim) {
    return {
      ...review,
      scim_reconciliation: "add IdP↔app reconciliation: verify each deprovisioning actually fired (timestamps) so SCIM drift / ghost access is caught — the MECHANISM fix (ordered Events API + signature validation) routes to badge (BTS S15)",
    };
  }
  return review;
}

// ── residency (EM JTBD-5; OP O11/O12) ───────────────────────────────────────────
// Ask "residency or sovereignty?" FIRST; enumerate the WHOLE pipeline incl. the LLM call
// + tax data; offer BYOK/CMK as the sovereignty lever.

export interface ResidencyPosture {
  readonly mode: "ask" | "check";
  readonly first_question: string;
  readonly residency_vs_sovereignty: string;
  readonly whole_pipeline_pins: string[];
  readonly most_forgotten: string[];
  readonly byok_lever: string;
  readonly guardrail: string;
  readonly gaps?: string[];
  readonly brain_cite: string;
}

const PIPELINE_PINS: readonly string[] = [
  "primary database (the easy 20%)",
  "backups (these replicate cross-region by default — a classic leak)",
  "logs + the audit trail (it contains PII — everyone forgets this)",
  "caches + CDN edge",
  "every subprocessor (put the model provider on the subprocessor list)",
  "the LLM inference call (pin the model-provider region + enable ZDR — in scope for an AI-native company)",
  "tax / billing-location data (the second thing everyone forgets)",
];

export function assessResidency(mode: "ask" | "check", target?: string): ResidencyPosture {
  const base: ResidencyPosture = {
    mode,
    first_question: 'ASK "residency or sovereignty?" before answering the buyer — they are different promises with very different costs (EM 5.2)',
    residency_vs_sovereignty: "residency = WHERE data physically lives; sovereignty = WHOSE law applies. A US company in eu-central-1 is still reachable under the US CLOUD Act (the Schrems problem) — region-pinning does NOT solve sovereignty (EM 5.1; BTS S10)",
    whole_pipeline_pins: [...PIPELINE_PINS],
    most_forgotten: [
      "the audit log (contains PII)",
      "the LLM inference call (model-provider region + ZDR)",
      "tax-location data",
    ],
    byok_lever: "offer BYOK / Customer-Managed Keys (CMK) — the customer holds the KMS key, controlling decryption — as the sovereignty lever short of a full sovereign cloud (EM 5.4; OP O11)",
    guardrail: "build per-region cells + an automated, continuously-asserted guardrail that asserts 'no PII left region X' — not a one-time architecture claim (EM 5.5)",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-5; brain/OPINIONS.md O11/O12; brain/BATTLE-TESTED-SCENARIOS.md S9/S10",
  };
  if (mode === "check") {
    return {
      ...base,
      gaps: [
        `assessed ${target ? JSON.stringify(target) : "no path"} — residency is whole-pipeline or it's a lie (KP P13)`,
        "verify NONE of {backups, audit log, cache/CDN, a subprocessor, the LLM call, tax data} crosses the promised region",
      ],
    };
  }
  return base;
}

// ── dsar (EM JTBD-6; OP O13) ────────────────────────────────────────────────────
// GDPR 1mo→3 clock; subprocessor register; apply exemptions; a human SIGNS.

export interface DsarPlan {
  readonly type: "access" | "erasure";
  readonly clock: string;
  readonly steps: string[];
  readonly subprocessor_register_note: string;
  readonly exemptions?: string[];
  readonly requires_human_signature: true;
  readonly brain_cite: string;
}

export function planDsar(type: "access" | "erasure"): DsarPlan {
  const plan: DsarPlan = {
    type,
    clock: "GDPR = 1 month, extendable to 3 if complex; CCPA/CPRA = 45 days, extendable to 90 (EM 6.3)",
    steps: [
      "classify the request (access vs erasure vs portability)",
      "verify identity (GDPR: reasonable measures, avoid demanding ID; CCPA: match two data points)",
      "decide what the law allows (erasure has exemptions — see exemptions)",
      "draft the reply",
      "route the work across EVERY system on the subprocessor register (Postgres, warehouse, Sentry, email, support desk — incomplete erasure is a violation)",
      "a human SIGNS anything legally consequential — AI drafts, human signs (OP O22)",
    ],
    subprocessor_register_note: "track the GDPR/CCPA clock on intake; maintain a per-subprocessor data-location map so erasure misses nothing (KP P15). Pattern: tiffanycoyle/gdpr-dsr-operator",
    requires_human_signature: true,
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-6; brain/OPINIONS.md O13; brain/BATTLE-TESTED-SCENARIOS.md S11",
  };
  if (type === "erasure") {
    return {
      ...plan,
      exemptions: [
        "legal-obligation retention (e.g. tax, financial records)",
        "fraud prevention / establishment of legal claims",
        "freedom of expression / journalistic exemptions",
      ],
    };
  }
  return plan;
}

// ── questionnaire (EM JTBD-7; OP O21/O22) ───────────────────────────────────────
// KB-mapped drafts; mark each "DRAFT — human must sign"; auditors reject AI-only pentests.

export interface QuestionnaireDraft {
  readonly format: "sig" | "caiq" | "vsa";
  readonly kb_dir: string | null;
  readonly approach: string[];
  readonly answers: { q: string; draft_answer: string; kb_source: string }[];
  readonly signature_required: string;
  readonly pentest_note: string;
  readonly brain_cite: string;
}

export function draftQuestionnaire(format: "sig" | "caiq" | "vsa", kbDir?: string): QuestionnaireDraft {
  return {
    format,
    kb_dir: kbDir ?? null,
    approach: [
      "stand up a Trust Center to DEFLECT inbound questionnaires (public SOC2/ISO/pen-test/sub-processors + NDA-gated docs)",
      "own the answer-KB as versioned code (HailBytes/caiq-lite CAIQ-as-code + WikiMem) — answer once, diff on renewal (OP O21)",
      "AI drafts mapped to the KB; a human SIGNS every answer (a wrong answer is a misrepresentation to the customer — OP O22)",
    ],
    answers: [
      {
        q: "Do you maintain an audit trail of privileged actions?",
        draft_answer: "DRAFT — human must sign: append-only, tamper-evident (hash-chained+signed), identity-traceable OTel-span trail with ≥1yr retention + real-time SIEM export (stamp JTBD-4).",
        kb_source: kbDir ? `${kbDir}/audit-trail.md` : "brain/EXPERTISE-MAP.md JTBD-4",
      },
      {
        q: "Do you perform a third-party penetration test?",
        draft_answer: "DRAFT — human must sign: a HUMAN-LED pen-test annually (Cobalt-class), scoped to the SOC 2 boundary, with retest evidence. We do NOT present an AI/scanner-only test as the pen-test (auditors reject it — OP O20).",
        kb_source: kbDir ? `${kbDir}/pentest.md` : "brain/EXPERTISE-MAP.md JTBD-7",
      },
    ],
    signature_required: "every answer is a DRAFT — a human MUST sign before it ships to a customer (OP O22)",
    pentest_note: "NEVER claim AI-pentest coverage as the SOC 2 pen-test — get a human-led one; CPTaaS (Sprocket/Equixly) is continuous-coverage layered on top, never the report (OP O20; BTS S13)",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-7; brain/OPINIONS.md O20/O21/O22; brain/BATTLE-TESTED-SCENARIOS.md S13/S14",
  };
}

// ── advise (EM JTBD-2/11; OP O5/O6/O7/O25) ──────────────────────────────────────
// A DECISION with the honest cost (never a feature table); directional, re-verify.

export type AdviseTopic = "grc-platform" | "privacy" | "pentest" | "residency" | "repos";

export interface Advice {
  readonly on: AdviseTopic;
  readonly recommendation: string;
  readonly honest_cost: string;
  readonly caveat: "directional — re-verify (the field revises quarterly)";
  readonly boundary_note?: string;
  readonly brain_cite: string;
}

const ADVICE: Readonly<Record<AdviseTopic, Omit<Advice, "on" | "caveat">>> = {
  "grc-platform": {
    recommendation: "Default to Vanta for a first SOC 2 (widest 300+ integrations, largest auditor network, maturest AI agents, an MCP server stamp can drive — public beta). Drata if infra/DevOps-heavy or you want SafeBase; Secureframe if you want advisory hand-holding or CMMC/federal depth; Sprinto only sub-30 on a hard budget. BUY for a real company; OSS (trycompai/comp) only WITH a compliance engineer (OP O5/O6).",
    honest_cost: "the page hides it: Vanta's slow sales + aggressive renewal; Drata's enterprise-skewed pricing; Secureframe's 'pay twice if you also have a vCISO'. And VET THE AUDITOR — a cheap 'we book the audit' bundle can route you to a rubber-stamp CPA (OP O3; OP O7).",
    boundary_note: "the GRC platform is a DRIVEN tool — do not rebuild its CRUD (the moat is the auditor network + integrations + the answer-KB, not the platform — OP O4).",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-2; brain/OPINIONS.md O3/O4/O5/O6/O7; brain/TOOL-MATRIX.md",
  },
  privacy: {
    recommendation: "Build GDPR-aligned EVERYWHERE (GDPR is the superset — it mostly covers CCPA/CPRA + the ~19-20-state US patchwork); honor Global Privacy Control opt-out by default + per-state DSAR intake. One posture, one register (sub-processor list + residency map + DPA tracker = three views, one source) (OP O13).",
    honest_cost: "keep SCCs + a Transfer Impact Assessment as the backstop even under the EU-US DPF — it's the third transatlantic framework after Safe Harbor + Privacy Shield (both struck down); a DPF-only posture is one CJEU ruling from stranded (OP O14).",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-6; brain/OPINIONS.md O13/O14; brain/BATTLE-TESTED-SCENARIOS.md S11/S12",
  },
  pentest: {
    recommendation: "Get a HUMAN-LED pen-test annually (Cobalt-class), scoped to the SOC 2 boundary, with retest evidence — keep the shareable attestation letter for the Trust Center. Layer CPTaaS (Sprocket/Equixly) for continuous coverage BETWEEN audits.",
    honest_cost: "auditors REJECT AI-only / scanner-only PtaaS — a vuln scan is not a pen test; presenting one as the SOC 2 pen-test risks auditor rejection (the #1 agent-fleet trap — OP O20; BTS S13).",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-7; brain/OPINIONS.md O20; brain/BATTLE-TESTED-SCENARIOS.md S13",
  },
  residency: {
    recommendation: "ASK 'residency or sovereignty?' first. For residency, pin the WHOLE pipeline (DB + backups + logs + CDN + every subprocessor + the LLM call + tax data) with a 'no PII left region X' guardrail. For sovereignty, offer BYOK/CMK before promising a sovereign cloud (OP O11/O12).",
    honest_cost: "region-pinning is cheap; sovereignty/no-US-access means a sovereign cloud or self-host + BYOK — very different cost. 'EU residency' does NOT mean 'no US access' (the CLOUD Act).",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-5; brain/OPINIONS.md O11/O12; brain/BATTLE-TESTED-SCENARIOS.md S9/S10",
  },
  repos: {
    recommendation: "Use trycompai/comp (OSS Vanta, pushed daily) + theopenlane/core. For DSAR, tiffanycoyle/gdpr-dsr-operator; for the answer-KB, HailBytes/caiq-lite. Verify vendor independence before betting on a 'neutral' tool.",
    honest_cost: "check pushed_at, NOT stars: strongdm/comply (1,556★) has been DEAD since 2022-07-21 for a field that revises quarterly; SafeBase is owned by Drata since 2025-02-12 (no longer neutral). Star count ≠ current (OP O25).",
    brain_cite: "brain/EXPERTISE-MAP.md JTBD-11; brain/OPINIONS.md O25; brain/KNOWN-PITFALLS.md P20/P21",
  },
};

export function advise(on: AdviseTopic): Advice {
  const a = ADVICE[on];
  return { on, ...a, caveat: "directional — re-verify (the field revises quarterly)" };
}
