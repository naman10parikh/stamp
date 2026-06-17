---
title: "stamp TOOL-MATRIX — canonical tools, default vs alts, agent-access surface, required secrets"
type: synthesis
domain: compliance
created: 2026-06-17
updated: 2026-06-17
tags: [tool-matrix, vanta, drata, secureframe, mcp, api, secrets, soc2, gdpr, pentest, residency, stamp, cp123]
sources: ["brain/research/raw/ecosystem-13-tradeoff-matrix.md", "brain/research/raw/ecosystem-11-agent-operator-notes.md", "brain/research/raw/ecosystem-01-soc2-iso-automation.md", "brain/research/raw/ecosystem-12-versions-changelog.md", "brain/research/raw/ecosystem-08-pentest-questionnaires.md", "brain/research/raw/ecosystem-07-access-reviews-rbac.md", "brain/research/raw/ecosystem-06-gdpr-ccpa-dpa.md", "brain/research/raw/ecosystem-05-data-residency.md", "brain/research/raw/ecosystem-09-starter-repos.md"]
related: ["[[stamp EXPERTISE-MAP]]", "[[stamp OPINIONS]]", "[[stamp KNOWN-PITFALLS]]", "[[stamp GAPS-AND-DISPUTES]]"]
summary: "The canonical tool per compliance category — DEFAULT vs alternatives, when-to-use-which, the agent-access surface (CLI/API/MCP), and the env vars/secrets each needs. The secrets column feeds the Required-Secrets manifest in Wave P. Decisions, not feature tables — every alt names the honest cost."
---

# stamp TOOL-MATRIX

> Per category: the **DEFAULT**, the **alternatives** (with the honest cost the marketing hides), the **agent
> surface** (can a headless stamp agent drive it — CLI/API/MCP?), and the **secrets** it needs. The secrets
> column is the source for the Wave-P **Required-Secrets manifest**. Secret names follow the repo's
> `.env.example` conventions (`<VENDOR>_<PURPOSE>`). For the full decision logic see [[stamp OPINIONS]];
> for gotchas per tool see [[stamp KNOWN-PITFALLS]].

---

## Category 1 — GRC platform (SOC 2 / ISO 27001 / HIPAA / ISO 42001 automation)

**DEFAULT: Vanta.** Widest integrations (300+), largest auditor network, maturest AI agents, ships an MCP
server. The breadth IS the moat. Source: `ecosystem-01` §honest take; `ecosystem-13` §1.

| Tool | Pick when | Honest cost / limit | Agent surface | $ (SMB→scale) |
|---|---|---|---|---|
| **Vanta** ★default | first SOC 2; want breadth + auditor net + agent maturity; ISO 42001 / FedRAMP | priciest early-stage; advanced features tiered; "aggressive renewal" (HN); slow sales | **MCP** (`mcp.vanta.com/mcp`, GA) + REST API + **AI Skills CLI** | ~$10-12K → $20-30K+ |
| **Drata** | infra/DevOps-heavy (1,000+ IaC tests); want **SafeBase** Trust Center; clean UI | avg contract ~$34K (enterprise-skewed); some integrations shallower than Vanta | **MCP** (experimental, region-split) + REST API | ~$10-15K → ~$34K avg |
| **Secureframe** | want advisory hand-holding + multi-framework + **CMMC/federal** depth | smaller integrations + auditor net; "pay twice" if you also have a vCISO | **REST API only** (no MCP found — P4/GAP) | ~$12-20K |
| **Sprinto** | <30 people, hard budget | smaller integrations → more manual evidence; "may outgrow it" | API (verify) | ~$5-10K |
| **Comp AI** (`trycompai/comp`) | no lock-in / data-sovereignty AND you HAVE a compliance engineer | OSS = real ops cost; self-hosting hard (#1705); no auditor network | self-host (TS) | $0 + ops |
| **Oneleet / Delve** (bundled) | first SOC 2; want pentest+audit+platform in one | "we book the audit" can = a rubber-stamp auditor — **VET them** | vendor SaaS | varies |

- **Agent surface detail (Vanta):** MCP `https://mcp.vanta.com/mcp` ("find failing tests, remediate, act on
  data"); docs-MCP `https://developer.vanta.com/mcp` (`claude mcp add --transport http vanta-docs ...`); AI
  Skills `npx skills add https://developer.vanta.com`; REST base `https://api.vanta.com` (gov:
  `api.vanta-gov.com`), OAuth 2.0, `POST /oauth/token`, **1-hr token**, **re-issue revokes prior token**, OAuth
  rate limit **5 req/min**. Three APIs: Manage Vanta (`client_credentials`), Build Integrations
  (private=`client_credentials` / public=`authorization_code`), Auditor API (`client_credentials`). Source:
  `ecosystem-11` §Vanta.
- **Agent surface detail (Drata):** MCP US `https://mcp.drata.com/mcp/` · EU `https://mcp-euc1.drata.com/mcp/` ·
  APAC `https://mcp-apse2.drata.com/mcp/`; OAuth, role-scoped, "credentials not shared with the AI client";
  **always include "Drata" in prompts.** REST API needs Workspace-ID for POST/PUT. Source: `ecosystem-11`
  §Drata.
- **Secrets:** `VANTA_CLIENT_ID`, `VANTA_CLIENT_SECRET` (OAuth client_credentials) · `DRATA_CLIENT_ID`,
  `DRATA_CLIENT_SECRET`, `DRATA_REGION` (us/euc1/apse2) · `SECUREFRAME_API_KEY` · `SPRINTO_API_KEY`.
- **Pitfalls:** P1 (opaque Vanta OAuth error), P2 (token revocation on re-issue), P3 (name the vendor), P4
  (Secureframe API-only), P5 (Drata region match). See [[stamp KNOWN-PITFALLS]].

## Category 2 — Trust Center + security-questionnaire automation

**DEFAULT: Vanta Trust Center + Customer Trust Agent** *if already on Vanta*; otherwise stand up a Trust Center
early and own the answer-KB as code. Source: `ecosystem-08` §the fix; `ecosystem-13` §2.

| Tool | Pick when | Honest cost / limit | Agent surface |
|---|---|---|---|
| **Vanta Trust Center + Customer Trust Agent** ★default | already on Vanta; want self-improving questionnaire KB | locked to Vanta; AI answers need human sign-off | via Vanta MCP/API |
| **SafeBase** (now **Drata**, $250M) | best standalone Trust Center | **no longer neutral — it's Drata** | via Drata |
| **Whistic** | Trust Center + vendor-assessment + industry-questionnaire answer library (CAIQ/VSA/SIG Lite) | another platform to run | API (verify) |
| **Conveyor / Loopio / Responsive** | heavy RFP+questionnaire volume | generic RFP tools, less GRC-native | API (verify) |
| **OSS: `HailBytes/caiq-lite`** | own the answer-KB as code (CAIQ-as-code, diff on renewal) | DIY; you own accuracy | code (clone) |
| **OSS: `tolgadur/rfx-email-agent`** | agent-native questionnaire RAG over email | DIY; human signs | code (clone) |

- **stamp play:** Trust Center deflects inbound; **own the answer-KB as versioned code** (`caiq-lite` +
  WikiMem); **AI drafts, human SIGNS.** The compounding asset is the accurate KB. Source: `ecosystem-08`
  §stance; `ecosystem-11` §highest-leverage surface.
- **Secrets:** (Trust Center via the GRC platform — reuse Vanta/Drata creds above) · `WHISTIC_API_KEY` (if
  used) · OSS KB tools need none (local repo).
- **Pitfalls:** P20 (SafeBase→Drata not neutral), P23 (don't ship AI prose blind). See [[stamp KNOWN-PITFALLS]].

## Category 3 — Access reviews / IGA (the attestation, not enforcement)

**DEFAULT: the GRC platform's native UAR** (Vanta/Drata/Secureframe) for SMB/mid; graduate to a dedicated IGA
only at SaaS sprawl / enterprise scale. **Boundary: stamp REVIEWS, badge ENFORCES.** Source: `ecosystem-07`;
`ecosystem-13` §3.

| Tool | Pick when | Honest cost / limit | Agent surface |
|---|---|---|---|
| **GRC-native UAR (Vanta/Drata/Secureframe)** ★default | already on that platform; SMB/mid | less deep than dedicated IGA for complex orgs | via that platform's MCP/API |
| **SecurEnds / Lumos / ConductorOne / Zluri** | heavy SaaS sprawl; need real access governance | another tool; setup cost | API (verify per vendor) |
| **SailPoint / CyberArk / Pathlock** | large enterprise; SAP/Oracle; privileged access | heavyweight, expensive, slow to deploy | API (enterprise) |
| **Microsoft Entra** | M365/Azure shop | Microsoft-ecosystem-bound | Graph API |

- **stamp rules (non-negotiable):** scope every UAR to **non-human identities — service accounts, API keys,
  AGENTS**; cadence quarterly-general / **monthly-or-continuous for privileged + agents**; evidence = immutable
  timestamped attestation + the reason; **agent proposes revokes, human approves**; derive the UAR inventory
  from **badge's token scopes** (one source). Source: `ecosystem-07` §stance.
- **Secrets:** native UAR reuses the GRC-platform creds. Dedicated IGA: `<VENDOR>_API_KEY` /
  `<VENDOR>_CLIENT_ID` + `<VENDOR>_CLIENT_SECRET` per chosen tool. Entra: `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`,
  `AZURE_CLIENT_SECRET` (Graph).
- **Pitfalls:** P6 (no auto-remediate without a gate), and S7/S8 in [[stamp BATTLE-TESTED-SCENARIOS]].

## Category 4 — Penetration testing / PtaaS

**DEFAULT: Cobalt** (human-driven PtaaS, scoped to the SOC 2 boundary, with retest evidence). **NEVER an
AI-only/scanner-only test for the SOC 2 report** — auditors reject it. Source: `ecosystem-08` §Part 1;
`ecosystem-13` §4.

| Tool | Pick when | Honest cost / limit | Agent surface |
|---|---|---|---|
| **Cobalt** ★default | need the SOC 2 report; default human-driven PtaaS | crowdsourced quality varies; still annual+ | platform / API (verify) |
| **HackerOne / Bugcrowd** | want bug-bounty + PtaaS | bounty noise; scoping effort | API |
| **Synack** | US gov / high-assurance | premium | platform |
| **Sprocket / Equixly (CPTaaS)** | continuous coverage *between* audits | **NOT a substitute for the human-led SOC 2 pentest** | API (continuous) |
| **AI-only / autonomous red-team** | continuous internal signal only | **auditors REJECT it as the SOC 2 pentest** (P18) | self-run |
| **Bundled (Oneleet)** | first SOC 2; collapse pentest+audit+platform | vet the auditor in the bundle | vendor SaaS |

- **stamp play:** human-led pentest annually for the report + CPTaaS layered for continuous; keep the
  **shareable attestation letter** in the Trust Center. Source: `ecosystem-08` §stance.
- **Secrets:** `COBALT_API_TOKEN` (or chosen vendor's `<VENDOR>_API_KEY`). Mostly a human-procured engagement,
  not a headless surface.
- **Pitfalls:** P18 (AI-only pentest rejected). See [[stamp KNOWN-PITFALLS]] / S13.

## Category 5 — DSAR / privacy ops (GDPR / CCPA)

**DEFAULT: build GDPR-aligned everywhere + automate DSAR intake→classify→draft (agent), human signs.** Tool
depends on scale. Source: `ecosystem-06`; `ecosystem-13` §5.

| Tool | Pick when | Honest cost / limit | Agent surface |
|---|---|---|---|
| **`tiffanycoyle/gdpr-dsr-operator`** ★default (agent-native) | folder/Claude-project DSAR drafting + routing | DIY; human signs legal calls; needs data-map coverage | **code (Claude project)** — closest to what stamp IS |
| **DataGrail / Transcend / Ethyca** | mid-market; modern DSAR automation | still need data-map coverage across subprocessors | API |
| **OneTrust / TrustArc** | enterprise; many jurisdictions | heavy, expensive | API |

- **stamp rules:** GDPR clock **1 month (→3)**; CCPA **45 days (→90)**; route across the **subprocessor
  register**; apply erasure exemptions; honor Global Privacy Control. Maintain ONE register (sub-processor +
  residency map + DPA tracker). Source: `ecosystem-06` §stance.
- **Secrets:** `gdpr-dsr-operator` reuses `ANTHROPIC_API_KEY` (it's a Claude project). Commercial tools:
  `<VENDOR>_API_KEY`. Data discovery may need read creds to each subprocessor (scope tightly).
- **Pitfalls:** P15 (DSAR clock + subprocessor completeness), P16 (DPF backstop), P17 (GDPR-aligned-everywhere).

## Category 6 — Audit-trail substrate (tamper-evident logging as a CONTROL)

**DEFAULT: build it as OTel spans → the customer's SIEM, hash-chained + signed.** No single source prescribes
the exact stack (FORM-OWN-VIEW, GAPS §2.12). **Co-owned with sentry/observability.** Source: `ecosystem-04`.

| Layer | Tool | Pick when | Agent surface |
|---|---|---|---|
| **Export target (SIEM)** ★ | customer's **Splunk / Datadog / Sentinel / New Relic** | always — real-time export is a hard enterprise demand | OTel exporters / vendor API |
| **Append-only / tamper-evident store** | `DavidLiedle/DriftDB` (Rust append-only + time-travel) or a hash-chained store | need provable integrity for CC7 | code (OSS) |
| **Agent-action audit-trail spec** | `mishrasanjeev/grantex` / `CJHodgson/Agentic-Governance-Spec` | shape for AGENT-action immutable trails (quote audit shape only — identity is **badge's**) | code (OSS spec) |
| **Evidence layer** | the GRC platform (Vanta/Drata/Secureframe) | central control-evidence + failing-test surfacing | via that platform |

- **The shape (Energy standard):** one span per mutation carrying `actor`, `target`, `before_hash`,
  `after_hash`, `trace_id`; append-only, signed, real-time SIEM export; **≥1yr retention**; **flag expired
  evidence, don't auto-archive**. **Tamper-EVIDENT > tamper-resistant.** Source: `ecosystem-04` §2026 bar;
  §stance.
- **Secrets:** SIEM export creds per target (e.g., `SPLUNK_HEC_TOKEN`, `DATADOG_API_KEY`, `DATADOG_APP_KEY`,
  `NEWRELIC_LICENSE_KEY`); signing key for the hash-chain (`AUDIT_LOG_SIGNING_KEY`). OSS substrates: none
  (local).
- **Pitfalls:** P8 (logs≠audit trail), P9 (tamper-evident not -resistant), P10 (ephemeral sandbox gaps), P11
  (CC8 artifacts), P12 (don't auto-archive evidence).

## Category 7 — Data residency / sovereignty

**DEFAULT: per-region cells + BYOK/CMK + an automated "PII stays in region" guardrail.** stamp owns the
posture; **rocket/infra owns the regional cells.** Source: `ecosystem-05`.

| Lever | What | Pick when | Agent surface |
|---|---|---|---|
| **Per-region cells** ★ | a full stack per region (AWS/Azure/GCP explicit region selection) | residency promise to EU/US/India buyers | infra (rocket) |
| **BYOK / Customer-Managed Keys (CMK)** ★ | customer holds the KMS key | the sovereignty ask short of self-host | cloud KMS API |
| **Automated residency guardrail** | continuous "no PII left region X" assertion | make residency survive an audit | **stamp agent** (continuous check) |
| **Residency-aware subprocessor register** | every subprocessor tagged by region | ties into the DPA/sub-processor list | doc / register |

- **stamp rules:** ask **"residency or sovereignty?"** first; pin the **whole pipeline** (DB + backups + logs +
  cache/CDN + subprocessors + **LLM call** + tax data); LLM provider in scope (pin region + **ZDR**). Source:
  `ecosystem-05` §stance.
- **Secrets:** cloud KMS creds for BYOK (`AWS_KMS_KEY_ID` / `AZURE_KEYVAULT_*` / `GCP_KMS_*`); the residency
  guardrail agent reuses cloud read creds (scoped). LLM ZDR is a provider *setting*, not a secret.
- **Pitfalls:** P13 (whole-pipeline), P14 (residency vs sovereignty). See S9/S10.

## Category 8 — Reference repos to clone/read (not a runtime dependency)

Read these to become dangerous; they're knowledge, not infra. Source: `ecosystem-09`.

| Repo | Use | Caveat |
|---|---|---|
| **`trycompai/comp`** (1,636★, TS) | the OSS Vanta — reference data-model + integration-pull + control-mapping | self-host hard (#1705); has own authz bugs (#203) |
| **`theopenlane/core`** (261★, Go) | best-architected OSS engine — control-model + evidence-graph in a typed lang | #1 ask is "more integrations" |
| **`tiffanycoyle/gdpr-dsr-operator`** | the closest public artifact to what stamp IS (folder Claude DSAR operator) | low stars, brand-new — read as a pattern |
| **`kriss-b/llm-iso27001`** | LLM-maintained ISMS template | small, new |
| **`HailBytes/caiq-lite`** | CAIQ-as-code (answer once, diff on renewal) | small but exactly right |
| **`Ankit-Uniyal/iso-27001-isms-toolkit`** | SoA with all 93 ISO 27001:2022 controls | human-authored content |
| **`open-access-policies/minimal-soc2`** | free minimal SOC 2 policy pack | starting point only |
| **`DriftDB` / `grantex` / `Agentic-Governance-Spec`** | audit-trail primitives + agent-governance specs | quote audit shape; identity = badge |
| ⚠️ **`strongdm/comply`** (1,556★) | **DO NOT USE — DEAD since 2022-07-21** | star count ≠ current (P21) |

- **No secrets** (these are clones/reads).

---

## The Required-Secrets manifest (Wave-P input — consolidated)

> Minimal set a stamp deployment needs, by what's actually wired. Names follow `.env.example` conventions.
> Inherited platform secrets (`ANTHROPIC_API_KEY`, `GITHUB_PERSONAL_ACCESS_TOKEN`, `FIRECRAWL_API_KEY`) are
> already in `.env.example` — reuse, don't redefine.

| Secret | Tool / purpose | Tier | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | the agent itself + `gdpr-dsr-operator` Claude project | **required** | already in `.env.example` |
| `VANTA_CLIENT_ID` / `VANTA_CLIENT_SECRET` | Vanta MCP + REST (OAuth client_credentials) | **required (default GRC)** | 1-hr token; re-issue revokes prior; serialize per client_id (P2) |
| `DRATA_CLIENT_ID` / `DRATA_CLIENT_SECRET` / `DRATA_REGION` | Drata MCP (region-split) + REST | optional (if Drata) | region ∈ {us, euc1, apse2}; match tenant region (P5) |
| `SECUREFRAME_API_KEY` | Secureframe REST (no MCP) | optional (if Secureframe) | API-only (P4) |
| `WHISTIC_API_KEY` | Whistic Trust Center / questionnaire library | optional | verify API exists |
| `COBALT_API_TOKEN` | Cobalt PtaaS | optional | mostly human-procured engagement |
| `<IGA_VENDOR>_API_KEY` / `_CLIENT_ID`+`_SECRET` | dedicated IGA (SecurEnds/Lumos/ConductorOne) | optional | only at SaaS sprawl |
| `AZURE_TENANT_ID` / `AZURE_CLIENT_ID` / `AZURE_CLIENT_SECRET` | Entra access reviews (Graph) | optional | M365/Azure shops |
| `SPLUNK_HEC_TOKEN` / `DATADOG_API_KEY`+`DATADOG_APP_KEY` / `NEWRELIC_LICENSE_KEY` | SIEM export of the audit trail | optional (per buyer) | real-time export is a hard enterprise demand |
| `AUDIT_LOG_SIGNING_KEY` | sign the hash-chained append-only spans | required-if-self-built | tamper-evidence (P9) |
| `AWS_KMS_KEY_ID` / `AZURE_KEYVAULT_*` / `GCP_KMS_*` | BYOK/CMK for residency/sovereignty | optional (enterprise) | the sovereignty lever (S10) |
| `<DSAR_VENDOR>_API_KEY` | DataGrail/Transcend/Ethyca/OneTrust | optional | if not using the OSS operator |

- **The agent-operator hygiene the manifest implies (carry into Wave P):** scope every token tightly; **never
  share creds across concurrent agent runs** (Vanta P2); store all secrets out of logs + out of URL query
  strings (residency/audit hygiene); match Drata regional URLs to tenant region.

## The meta-decision (stamp's spine, restated as tool choices)

1. **First SOC 2 → Vanta** (breadth + auditor net + MCP). Drata if infra-heavy / want SafeBase. Secureframe if
   advisory/CMMC. (O6)
2. **BUY the platform, OWN the judgment** — the CRUD is commoditized; the moat is the auditor network +
   integrations + the answer-KB. (O4, O5)
3. **Vet the auditor, verify vendor independence, human-sign every attestation.** (O3, O22, O24, O25)
4. **Drive via MCP first, API second; serialize tokens per client_id; never claim "compliant."** (O23, O24)
