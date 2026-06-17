---
title: "Best starter / template / example repos for compliance + enterprise-readiness — June 2026"
type: research
domain: compliance
topic: GitHub starter repos
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [repos, oss, soc2, iso27001, gdpr, oscal, audit-log, questionnaire, dsar]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-01-soc2-iso-automation]]", "[[ecosystem-11-agent-operator-notes]]"]
summary: "The repos a stamp agent should clone/reference. Verdict: trycompai/comp (1,636★, the OSS Vanta) is the flagship; strongdm/comply is the famous-but-DEAD one (last commit 2022); theopenlane/core is the actively-maintained multi-framework engine; plus a new class of agent-native compliance operators (gdpr-dsr-operator, llm-iso27001) and questionnaire-RAG agents."
---

# Best starter / template / example repos — June 2026

> Star counts + last-push verified via `gh api repos/<r>` on 2026-06-16. Stars are NOT a safety signal
> (badge's OP O9 carries over) — last-commit + active maintenance matter more for compliance tooling that
> must track changing frameworks. Flagged stale repos explicitly.

## Tier 1 — the ones to actually use/reference

### 1. `trycompai/comp` (Comp AI) — 1,636★, TypeScript — THE OSS Vanta/Drata
- Description (verbatim): *"AI Native platform to get companies compliant - Vanta & Drata Alternative."*
- **Pushed 2026-06-17** (i.e., today — extremely active). 8 frameworks, "work with any accredited auditor,"
  "real evidence from your systems," 100% open source.
- **Why it matters for stamp:** this is the reference architecture for the entire category — if stamp ever
  needs to understand "what a GRC platform's data model + integration-pull + control-mapping looks like," read
  this, not a marketing page. It's the buildable proof that the *platform* is commoditized (see also "Shasta,"
  the Claude-Code-built Delve clone, `ecosystem-10`). The durable value is the auditor network + the AI
  questionnaire KB, which this repo does NOT give you for free.
- Source: `gh api repos/trycompai/comp` (2026-06-16); [trycomp.ai](https://www.trycomp.ai/delve-ai-alternative) (accessed 2026-06-16).

### 2. `theopenlane/core` (OpenLane) — 261★, Go — actively-maintained multi-framework engine
- Description: *"Open source compliance automation for SOC 2, GDPR, ISO27001, NIST 800-53, and more."*
- **Pushed 2026-06-17** (today), created 2024-08, 48 forks. Go monorepo, real engineering.
- **Why:** the best-architected OSS *engine* (as opposed to Comp AI's product-shaped TS app). Good reference
  for control-model + evidence-graph design in a typed language. Multi-framework from day one.
- Source: `gh api repos/theopenlane/core` (2026-06-16).

### 3. `HailBytes/caiq-lite` — CAIQ-as-code — the questionnaire-as-code primitive
- Description: *"Programmatic schema and validator for the CSA CAIQ-Lite vendor security questionnaire. Author,
  validate, and diff CAIQ responses as code."*
- Pushed 2026-06-13, actively maintained. Small but exactly the right idea: treat the security questionnaire
  as a versioned, diffable artifact — which is what a stamp agent wants (answer once, diff on each renewal).
- Source: `gh api` / `gh search` (2026-06-16). See `ecosystem-08`.

## Tier 2 — agent-native compliance operators (the 2026 new class — closest to stamp's own pattern)

### 4. `tiffanycoyle/gdpr-dsr-operator` — Claude-project DSAR operator
- Description (verbatim): *"Folder-based AI operator for GDPR data subject requests. **Drop into a Claude
  project**: it classifies, verifies identity, decides what the law allows, drafts the reply, routes the work."*
- Created + pushed June 2026 (brand new), low stars. **This is the single closest public artifact to what
  stamp IS** — a markdown/folder agent that operates a compliance workflow, not a SaaS. Worth reading as a
  pattern even at 0★. Source: `gh api repos/tiffanycoyle/gdpr-dsr-operator` (2026-06-16). See `ecosystem-06`.

### 5. `kriss-b/llm-iso27001` — LLM-maintained ISMS
- Description: *"ISO 27001 ISMS template designed to be **instantiated and maintained by an LLM Agent**."*
- Pushed 2026-06-16 (today), 3★. Same agent-native thesis applied to the ISO 27001 ISMS document set.
- Source: `gh api repos/kriss-b/llm-iso27001` (2026-06-16).

### 6. Questionnaire-RAG agents (the recurring-tax automation, agent-flavored)
- `tolgadur/rfx-email-agent` — "RAG tool to answer RFPs, RFIs and security questionnaires with an email AI agent" (pushed 2026-04-23).
- `sandipkatel/Unified-InfoSec-QnA-Assistant` — "full-stack RAG ... handle security questionnaires and ad-hoc compliance queries using a unified knowledge base" (2026-02-01).
- `monte-carlo-data/transparent-trust` — "AI-powered platform for answering RFPs, security questionnaires, and compliance docs with full transparency" — **ARCHIVED 2026-05** (note: a real vendor open-sourced-then-archived it; signal that this is a product feature now, à la Vanta Customer Trust Agent).
- Source: `gh search repos "security questionnaire"` (2026-06-16). See `ecosystem-08`.

## Tier 3 — templates & toolkits (human-authored, good content)
- `austinsonger/Security-Program` — *"managing SOC2 compliance using nothing but GitHub"* — the GitOps-compliance pattern (policies + evidence in a repo). Pushed 2026-01. Good for the "compliance-as-code in git" play.
- `open-access-policies/minimal-soc2` — minimal SOC 2 policy set (common criteria only) for a small company. Pushed 2026-05. A real, free starting policy pack.
- `Ankit-Uniyal/iso-27001-isms-toolkit` — *"gap assessment, risk register templates, **SoA with all 93 controls**, implementation roadmap"* for ISO/IEC 27001:2022. Pushed 2026-04. The Statement-of-Applicability content is the load-bearing ISO artifact.
- `PeterGeelen/ISO27001` — long-standing ISO 27001 ISMS templates/working docs (pushed 2026-06).
- `cognis-digital/oscalkit` — *"OSCAL compliance-as-code — validate, convert & diff control coverage for catalogs, profiles, component definitions & SSPs"* (Python, pushed 2026-06, 0★ but the right tool for FedRAMP-20x/OSCAL work).
- `mthompsen/castellan` — NIST 800-53 / RMF toolkit (FIPS-199, SSP gen, OSCAL reporting), Python, June 2026.

## Tier 4 — audit-trail / agent-governance infra (cross-ref `ecosystem-04`)
- `mishrasanjeev/grantex` — *"identity, authorization, and audit infrastructure for AI agents — the 'OAuth moment' for the agentic internet ... cryptographic identity, and an **immutable audit trail**."* (pushed 2026-06-14). NOTE: identity is **badge's** turf; quote for the *audit-trail* angle only.
- `CJHodgson/Agentic-Governance-Spec` — *"Vendor-neutral open specification for governing AI agents ... DUAA and EU AI Act compliance — reversibility scoring, purpose compatibility assessment, and **immutable audit trails**."* (2026-06-09). Directly relevant to stamp's EU-AI-Act + audit-as-control work.
- `DavidLiedle/DriftDB` — "append-only database with built-in time travel ... immutable audit trails" (Rust, 2026-05). A primitive for tamper-evident logging.

## ⚠️ The famous-but-DEAD one (do NOT recommend without this caveat)
### `strongdm/comply` — 1,556★, Go — **last commit 2022-07-21** (ABANDONED)
- Description: *"Compliance automation framework, focused on SOC2."* It is the most-starred OSS compliance
  framework and will top many search results — but it has **not been touched since July 2022** (created 2018).
  For a field that changes quarterly (SOC 2 TSC revisions, ISO 27001:2022, new frameworks), a 4-year-stale
  framework is a liability, not an asset. **This is the anti-slop lesson in repo form: star count ≠ current.**
- Source: `gh api repos/strongdm/comply` → `pushed_at: 2022-07-21` (2026-06-16).

## Other stale/low-signal (mentioned so a future session doesn't re-discover them as "great")
- `loftwah/complisight` (34★, Shell, last push 2024-02) — SOC2 CLI, abandoned.
- `varaxlabs/varax` (1★, Go) — "Automated SOC2 for Kubernetes," last push 2026-04, single-author, early.

## Sources
- `gh api repos/<repo>` and `gh search repos` runs, all 2026-06-16, for: trycompai/comp, theopenlane/core, strongdm/comply, loftwah/complisight, cognis-digital/oscalkit, mthompsen/castellan, tiffanycoyle/gdpr-dsr-operator, kriss-b/llm-iso27001, Ankit-Uniyal/iso-27001-isms-toolkit, varaxlabs/varax, HailBytes/caiq-lite, tolgadur/rfx-email-agent, monte-carlo-data/transparent-trust, sandipkatel/Unified-InfoSec-QnA-Assistant, mishrasanjeev/grantex, CJHodgson/Agentic-Governance-Spec, DavidLiedle/DriftDB.
- https://www.trycomp.ai/delve-ai-alternative (accessed 2026-06-16)
