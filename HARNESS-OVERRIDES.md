# stamp — HARNESS-OVERRIDES (CP123)

> **Vertical:** Compliance / SSO-program / enterprise-readiness — Vanta (default GRC, **public-beta** MCP) ·
> Drata (infra-heavy alt, region-split MCP) · WorkOS (enterprise-SSO **program** reference) · Cobalt (human-led
> PtaaS) · `tiffanycoyle/gdpr-dsr-operator` (DSAR pattern) · OTel-spans→SIEM (audit-trail substrate).
> **Boundary (hard):** stamp owns **governance/evidence**; **badge owns the auth mechanism** (SAML/OIDC+SCIM code,
> signature validation, event ordering, provider $-breakpoints, MCP-OAuth impl, the P1–P4 router, the
> intersection-rule *enforcement*). One-liner: **"badge = the connection; stamp = the program that decides we need
> it and proves it to the auditor"** (EM §boundary; OP O1/O2; KP P25).
>
> **What this file is.** The vertical-specific DONE-criteria **overrides** vs `audit/HARNESS-CHECKLIST-2026.md`,
> written by the Wave-P architect, **honored verbatim by Wave-V auditors** (it wins where it differs from the
> generic checklist). Where a row says "as checklist," the generic criterion stands. Where it says "OVERRIDE,"
> grade against THIS text. Grading uses the locked calibration (`memory
> feedback_harness_component_grading_calibration`): ✅ = real + tested/verified with evidence; 🟡 = present but
> unproven; ❌ = absent. Every ✅ here is file-level git-verifiable. stamp is a **tool-employee**: consumed by
> coding agents (Claude Code, energy hub, sibling employees — especially **badge**) + a local cockpit — NOT a
> messaged product. **THE acceptance bar:** `stamp audit <app>` → SOC2-readiness gap report **AND** `stamp
> sso-plan --dry-run` → enterprise-SSO program plan (SAML/OIDC+SCIM-via-WorkOS, **mechanism handed to badge**),
> green ×3 in CI, fixture-driven (no live tenant needed). Source of every criterion: `PLAN.md` §3 + the six
> `brain/` artifacts.

---

## Harness components (the 11 + 2 cross-cutting)

### 1. Identity — **OVERRIDE (1b reachability = N/A)**
- **1a · Self · ✅ =** `identity/SOUL.md` + `identity/BRAND.md` filled with the **real** stamp persona (the
  compliance/enterprise-readiness expert; the IS/DOES/REFUSES + the **badge** boundary + the never-claim-compliant
  creed); **zero `{{UPPERCASE}}` template slots** (the scaffold shipped `{{AGENT_NAME}}`/`{{MISSION}}`/`{{PLATFORM}}`
  — they must be gone); unique one-word name **stamp** + tagline ("Audit-ready evidence, assembled and proven —
  never a rubber stamp, never 'we're compliant'") + "powered by Energy"; `CLAUDE.md` non-generic (the JTBD-0
  boundary gate + the badge seam, NOT the forge template; the `TODO:` stub gone). *Evidence:* `grep -rl '{{'
  identity/ CLAUDE.md` returns **nothing**; `grep -c stamp identity/BRAND.md` ≥1; `grep -q 'badge' CLAUDE.md`;
  `! grep -q 'TODO:' CLAUDE.md`.
- **1b · Reachability · ✅ BY EXEMPTION (N/A).** stamp is a **tool-employee** consumed by coding agents + the
  local cockpit, **not** a messaging-channel product. The reachability sub-axis
  (phone/email/WhatsApp/iMessage/SMS/voice/Telegram/Slack/Discord) **does not apply** — the surfaces are
  **CLI + MCP** (agents) and the **cockpit** (the chairman). **Grade ✅, not 🟡/❌** — this is an exemption, not
  an unmet criterion. (DECISIONS per-repo "Identity-reachability = N/A for tool-employees"; checklist Part B
  "Dev-tool: identity = N/A".)

### 2. Memory — **OVERRIDE (queryable layer indexes the EXPERTISE BRAIN, not code history)**
- **✅ =** `memory/MEMORY.md` bootstrap ≤ 2,000 tokens (the **JTBD-0 boundary one-liner** + the badge seam + the
  5 spine stances + the DSAR/UAR clocks [GDPR 1mo→3 · CCPA 45d→90 · UAR quarterly/monthly-for-agents] + pointers
  to the **6** brain files) **AND** a real semantic-search layer (BM25 via `scripts/memory-search.sh`) wired over
  **`brain/**.md`** (NOT git/code history). *Evidence:* `bash scripts/memory-search.sh "tamper-evident audit
  trail"` returns a ranked, **cited** hit (e.g. KP-P9 / BTS-S5); `wc -w memory/MEMORY.md` ≤ ~1500. A `MEMORY.md`
  + grep alone = 🟡, not ✅ — the queryable layer over the brain is required.

### 3. Skills — as checklist, **with count override ≥5**
- **✅ =** ≥ **5** real `SKILL.md` in `skills/` (soc2-readiness-audit · enterprise-sso-program ·
  audit-trail-as-control · privacy-dsar-handler · questionnaire-from-kb), each with trigger + steps + output
  format + a **brain-file citation** (encodes OPINIONS/PITFALLS, not a generic summary). *Evidence:* `ls
  skills/*/SKILL.md | wc -l → ≥5`; each file contains `trigger:` + a `brain/` ref.

### 4. Tools / CLIs — as checklist (browser = cockpit only; acceptance test is CLI)
- **✅ =** `bin/stamp` real binary (`#!/usr/bin/env node`, commander) with the §4 command tree
  (audit·sso-plan·audit-log·access-review·residency·dsar·questionnaire·advise·runs); `--help/--version`; exits
  0/non-zero; **`--json` on every command** (employee/agent-first — EM JTBD-10 / OP O23). Tool list in `AGENTS.md`
  + `llms.txt`. Browser tool: wired **only** in the cockpit (Playwright drives ask-the-employee); the acceptance
  test + agent-side platform discovery use CLI/MCP/HTTP (no browser needed) — so "no general browser tool" is
  **not** a gap here. *Evidence:* `node bin/stamp audit test/fixtures/app-under-audit --json → {"framework":"soc2",
  "findings":[…]}`.

### 5. Hooks — as checklist, **scoped to compliance-lint**
- **✅ =** `.claude/settings.json` ≥1 real matcher AND `.claude/hooks/compliance-lint.js` that **fires and blocks**
  on a seeded compliance-anti-pattern in stamp's own staged output (a **"we are SOC 2 compliant"** claim before a
  CPA signs [OP O24/KP P7] · an **"AI-pentest covers us"** claim [OP O20/KP P18] · an **auto-revoke without a
  human gate** [OP O19/KP P6] · a **secret committed to git**). *Evidence:* run the trigger against a violation
  fixture → non-zero exit + the OP-cited message; against clean text → exit 0. (Hook must FIRE — "it exists" ≠ ✅.)

### 6. Sub-agents — as checklist (the 2 named personas)
- **✅ =** `.claude/agents/` flat; **`stamp-soc2-gap-auditor.md` + `stamp-dsar-handler.md`** present, each ≥40
  lines, brain-grounded system prompt, distinct scope, no template slots; callable via `Agent`. *Evidence:* `ls
  .claude/agents/stamp-*.md` lists both; `grep -L '{{' .claude/agents/stamp-*.md` (no slots).

### 7. MCPs — **OVERRIDE (own server `stamp-mcp`; stdio-local sufficient for C2)**
- **✅ =** `.mcp.json` lists stamp's **own** server `stamp` (env-refs only, **no live keys**); `src/mcp/server.ts`
  implements the tools (stamp_audit/sso_plan/audit_log/access_review/residency/dsar/questionnaire/advise +
  `stamp://brain/*` resources) over **stdio**; `tools/list` JSON-RPC returns them. **Hosted-OAuth dual-mode is NOT
  required for C2** (stamp is a dev-tool agents call locally — the checklist permits stdio-local for dev-tools); a
  grader must NOT fail this row for lacking a hosted endpoint, nor for the inherited 4-server template still being
  present *alongside* the new `stamp` server. *Evidence:* `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' |
  node dist/mcp/server.js → lists stamp_* tools`; `python3 -m json.tool .mcp.json → OK`; no live keys
  (`! grep -E 'sk-|client_secret.*=.*[A-Za-z0-9]{8}' .mcp.json`).

### 8. Dispatch — **OVERRIDE (routing = JTBD-0 boundary gate + JTBD router; cron = the RSI watch)**
- **✅ =** (routing) `src/dispatch/route.ts` runs the **JTBD-0 mechanism↔governance gate first**, then maps a task
  string → JTBD → handler, tested multi-step — a **"mechanism" task returns a badge handoff, not a stamp handler**
  (`route("the SCIM webhook is dropping events") → {boundary:"mechanism", handoff:"badge"}`; `route("will we pass
  SOC 2") → {jtbd:1, handler:"audit"}`); (routine) an **enabled** (uncommented) GH Actions `schedule:` in
  `.github/workflows/rsi.yml` running the deterministic RSI engine. No bare `tmux select-pane`. *Evidence:* both
  route tests pass; `grep -A2 'schedule:' .github/workflows/rsi.yml` shows an uncommented cron.

### 9. Evals — as checklist (Hamel L1/L2/L3 + tests), **the gap-report + sso-plan are the top integration evals**
- **✅ =** `eval/` with L1 structural assertions (`npm run eval`), L2 ≥3 binary golden tasks from
  `brain/BATTLE-TESTED-SCENARIOS.md` (F1≥0.8, graded against the Resolution text — **no self-grading**), L3
  calibrated LLM-judge on the trajectory tasks; Vitest + Playwright red-blocking in CI; **the acceptance test
  (audit + sso-plan, ×3) green in CI**; pass^k k≥3 on the acceptance CLI run. CI-blocking golden subset =
  G1-G9, G11, G12, G13 (see PLAN §6). *Evidence:* `npm run eval → exit 0, pass N/fail 0`; the acceptance CI job is
  green; a deliberately-broken golden answer turns CI red.

### 10. Observability — as checklist (stamp **dogfoods** its own audit-trail rule)
- **✅ =** append-only `logs/runs.jsonl` written by the CLI + RSI loop; each line `{ts, cmd, jtbd, model,
  duration_ms, outcome, human_owner}` — the **`human_owner` field is required** (stamp dogfooding its own
  accountable-human-attribution rule, OP O9); a `runs`/`runs-view` aggregator. *Evidence:* run `stamp audit …` →
  `runs.jsonl` grows by one valid JSON line **carrying `human_owner`**; `node scripts/runs-view.mjs` aggregates.
  `runs.jsonl` NOT gitignored.

### 11. Sandbox / Infra — **OVERRIDE (integration point = gap-scan a fixture app + generate reports; GH runner is an accepted alt)**
- **✅ =** the real integration point (gap-scan an ephemeral app fixture + produce the gap report + the SSO program
  plan) runs **isolated + reproducibly**: a `sandbox/` template (E2B default **OR** the GH Actions ubuntu runner
  as a documented alt) that runs `stamp audit` + `stamp sso-plan` against the committed `test/fixtures/`; the
  acceptance CI job runs inside it and is green. **E2B is NOT a hard CI gate** — if `E2B_API_KEY` is absent, the
  ubuntu runner satisfies the isolation need; a grader must accept the documented-alt path. (The tamper-evident
  audit-log substrate is a **FORM-OWN-VIEW fixture prototype** — GD §2.12 — NOT a live SIEM; its absence as live
  infra is **not** a gap.) *Evidence:* acceptance CI job green inside the isolated env; cold-start / break-even
  noted if E2B considered.

## Cross-cutting properties

### RSI / open-endedness — as checklist, **minimum L1; deterministic-$0 now, Claude half deferred (D8)**
- **✅ (L1 minimum) =** `dsip.json` present (eval-gated, no-self-grading, snapback git component+repo);
  `workflows/rsi.workflow.js` deterministic engine ($0, tokenless) running refresh-brain→re-verify-tool-matrix→
  run-eval-pyramid→propose→test-gate→commit (the watchlist = Vanta-MCP-beta→GA status, Drata regions, the
  SafeBase-style M&A watch, framework revisions, the DPF/Schrems status, GRC pricing, the `nango` #6416 bug);
  `darwin-check dsip.json ≥ L1` (evals gate merges). The **Claude half** (brain-file rewrite on a real watchlist
  delta + the first commissioned `field-*.md` pass per GD §0/§5) is **deferred to `CLAUDE_CODE_OAUTH_TOKEN`**
  (D8) — its absence is **NOT** a gap; grade the deterministic+L1 bar. *Evidence:* `node
  workflows/rsi.workflow.js --dry-run → exit 0`; `darwin-check ≥ L1`; `rsi.yml` cron uncommented + guarded-green.

### Model routing — as checklist
- **✅ =** `scripts/budget-manager.sh` present (inherited); RSI workflow + any sub-agent spawn pass **explicit**
  model (no bare default); commit trailers name the model. *Evidence:* `grep -r 'model:' workflows/ src/` shows
  explicit routing.

## Packaging surfaces (dev-tool/meta-harness profile)

- **CLI · ✅ =** `bin/stamp` real + `--help/--version` + the command tree. (npm-publish under `@energy/`
  **deferred to the post-C2 review** — local bin is sufficient for C2; not a gap.)
- **MCP server · ✅ =** own `stamp-mcp` stdio server, tools listed (registry/Smithery listing **deferred** — not a
  C2 gap).
- **Plugin · ✅ =** `.claude-plugin/manifest.json` valid, bundling CLI + MCP + 5 skills + compliance-lint hook + 2
  agents. *Evidence:* `python3 -m json.tool → OK`.
- **Skill-set · ✅ =** ≥5 skills exported (above).
- **A2A card · ✅ =** `.well-known/agent.json` (name/description/endpoint/capabilities:[audit, sso-plan,
  audit-log, access-review, residency, dsar, questionnaire, advise]), one capability round-trips.
- **AGENTS.md · ✅ =** rewritten for COMPLIANCE (the **stale WikiMem "wiki schema" template is replaced**): tool
  list + the **badge↔stamp boundary quick-ref** + the NOT-list. **A grader must FAIL this row if it still contains
  the WikiMem "wiki schema"/"raw/ wiki/" template content** (`! grep -qi 'wiki schema' AGENTS.md`).
- **CLAUDE.md · ✅ =** rewritten non-generic (compliance operating rules + the JTBD-0 boundary gate +
  never-claim-compliant creed), not the forge template; no `TODO:`.
- **llms.txt · ✅ =** present, links AGENTS.md + 6 brain files + 5 skills + MCP tool names + A2A card + the
  badge↔stamp boundary one-liner.
- **Sub-agent persona (packaged) · ✅ =** the 2 personas above, testable via `Agent` from another harness (e.g.
  the energy hub gap-scanning a sibling repo for SOC2-readiness).
- **Framework adapter (`@energy/agent-toolkit`) · N/A for C2** — meta-harnesses only; stamp is a product-surface
  employee, not a fleet meta-harness. Absence is **not** a gap.

## Product surface (Compliance/SSO is stamp's vertical, but stamp is the HARNESS, not the app)

- stamp does **not** ship its own product app beyond the **cockpit** (D3). The "product surface" stamp operates
  ON is the *target* app it gap-scans + plans SSO for (the acceptance test's fixture repo). Grade stamp as a
  **harness + cockpit**, not as a deployed SaaS / a running GRC platform. The regional cells (residency infra),
  the live SIEM (audit-log infra), and any target app's deploy/CI/DB/frontend belong to rocket/acorn/pixel/badge
  — **out of scope for stamp's grading** (the boundary in PLAN §2 NOT-list).

## The boundary FAIL conditions (Wave-V must enforce — stamp's defining override)

stamp's vertical sits exactly against **badge**. A grader must **FAIL** the relevant component (not pass it as a
"feature") if stamp has crossed the seam:
- ❌ **FAIL** if `stamp sso-plan` emits generated **SAML/ACS/OIDC/SCIM code** instead of the *plan* + the
  `badge_handoff` stanza (the acceptance test asserts no code + a handoff present — EM JTBD-8.5; OP O2; KP P25).
- ❌ **FAIL** if any stamp surface claims **"compliant"/"certified"** without naming the issuing CPA firm/cert
  body (must say "audit-ready evidence assembled" — OP O24; KP P7).
- ❌ **FAIL** if `stamp access-review` performs an **auto-revoke** of a privileged/uncertain grant without a
  human-approval gate (must PROPOSE — OP O19; KP P6).
- ❌ **FAIL** if a skill/the CLI **blesses an AI-only/scanner-only pen-test** as the SOC 2 pen-test (OP O20;
  KP P18).
- ❌ **FAIL** if stamp reimplements the GRC-platform CRUD instead of driving Vanta/Drata as a tool (OP O4).
- ✅ **PASS** (correct) when a "mechanism" task (fix the SCIM pipe, validate a signature, pick the auth provider
  on $ breakpoints) is **routed to badge** with a handoff, and stamp keeps the posture/evidence/program.
