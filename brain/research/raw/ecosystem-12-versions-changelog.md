---
title: "Current versions + last-6-months changelog deltas of every canonical tool — June 2026"
type: research
domain: compliance
topic: versions & changelog deltas
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [versions, changelog, vanta, drata, secureframe, funding, iso42001, fedramp, 2026]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-01-soc2-iso-automation]]", "[[ecosystem-11-agent-operator-notes]]"]
summary: "The 6-month delta (Dec 2025 → June 2026) across the canonical compliance tools. THE theme: agentic GRC (all three incumbents shipped AI agents) + ISO 42001 + FedRAMP-20x/OSCAL + MCP servers. Market: Vanta $4.15B / $300M ARR / 12K customers; Drata $2B / SafeBase $250M acquisition; Secureframe heavy CMMC/gov push."
---

# Versions + changelog deltas — Dec 2025 → June 2026

> SaaS GRC tools don't ship semver — "version" = the rolling feature changelog. This tracks the 6-month delta
> per the mission. Each row is dated + cited. The macro theme: **2026 is the year GRC went agentic.**

## VANTA — changelog deltas (most active agent surface)
| Month | Delta | Source |
|---|---|---|
| **Mar 2026** | **3 AI agents** launched at "Vanta Delivers" (Mar 19): **Compliance Agent**, **TPRM Agent**, **Customer Trust Agent** (self-improving questionnaire KB). + Enterprise: Adaptive Business Unit Scoping, Vanta Control Framework, Custom IRLs. + Privacy automation (RoPA, data inventory, DPIA). | [SiliconAngle](https://siliconangle.com/2026/03/19/vanta-unveils-agents-enterprise-features-privacy-tools-streamline-grc-workflows/); [Vanta Mar-2026](https://www.vanta.com/resources/new-in-vanta-march-2026) |
| **Feb 2026** | AI Agent 2.0 enhancements (Agent Memory, NL personnel queries, corrective-action suggestions, page-aware global availability). **Information Request Lists (IRLs)**. **TPRM evidence auto-collection** from external Trust Centers. **VantaGov** (AWS GovCloud, FedRAMP/CMMC/NIST). **OSCAL export for FedRAMP 20x**. Issues Report. | [Vanta Feb-2026](https://www.vanta.com/resources/new-in-vanta-february-2026) |
| Ongoing | **MCP server** (`mcp.vanta.com/mcp`) + **AI Skills CLI** (`npx skills add ...`) + docs MCP. 300+ integrations. | [Vanta Developer Hub](https://developer.vanta.com/) (`ecosystem-11`) |
- **Market:** **$150M Series D → $4.15B valuation**; **$300M ARR**; **12,000 customers** ("270 in 9 days"). Sources: [Vanta Series D](https://www.vanta.com/resources/vanta-announces-series-d); [Sacra](https://sacra.com/c/vanta/); [LinkedIn](https://www.linkedin.com/posts/vanta-security_vanta-has-raised-150m-in-series-d-funding-activity-7353755598544392192-TaOI) (accessed 2026-06-16).

## DRATA — changelog deltas
| Month | Delta | Source |
|---|---|---|
| **Early 2026** | "**The New Drata Experience**" UI rollout. **Drata Test Library: 1,000+ new infra tests** (AWS/Azure/GCP). Insights with **MTTR**. Internal Audits in Drata. Vuln-scan integrations (Upwind, Orca). Embedded Trust Centers. Self-serve bulk import with **AI-powered column mapping**. **AI Trust Center item generation**. | [Drata Feb-2026 recap](https://drata.com/blog/product-updates-2026-02) |
| 2026 | **AI Policy Version Comparison** (one-click policy diffs). | [Drata blog](https://drata.com/blog/introducing-ai-policy-version-comparision) |
| Ongoing | **Drata MCP** (experimental) — US `mcp.drata.com` / EU `mcp-euc1.drata.com` / APAC `mcp-apse2.drata.com`; OAuth, role-scoped. | [Drata Help — MCP config](https://help.drata.com/en/articles/13379899-mcp-configuration-new-experience) (`ecosystem-11`) |
- **Market:** **$200M Series C → $2B valuation** (doubled). **Acquired SafeBase for $250M (Feb 12, 2025)** — now owns the leading Trust Center. Sources: [FintechFutures](https://www.fintechfutures.com/venture-capital-funding/drata-doubles-valuation-to-2bn-following-200m-series-c); [TechCrunch — SafeBase $250M](https://techcrunch.com/2025/02/12/security-compliance-firm-drata-acquires-safebase-for-250m/) (accessed 2026-06-16).

## SECUREFRAME — changelog deltas (heavy CMMC / federal push)
| Month | Delta | Source |
|---|---|---|
| **May 2026** | CMMC **Scoping Module** (auto out-of-scope justifications); Defense Navigator; **GCC High config automation**; SSP implementation-statement auto-population; CMMC L2 updates; Conditional Policy Tokens; **Evidence Expiry Tracking** (flag, don't auto-archive). | [Secureframe product updates](https://secureframe.com/product-updates) |
| **Mar 2026** | **User Access Reviews (GA)**; **ComplyAI Risk Management** (guided workflow); Dedicated Auditors View. | same |
| Feb 2026 | Smart user mentions; Audit Completion Workflow; multilingual onboarding (FR/DE/ES); Azure user-data pull, MS Sentinel gov support. | same |
| Jan 2026 | New audit statuses (Met/Not-Met/In-Review); audit progress bar; audit-log jump-to-changed-item links. | same |
| Dec 2025 | **Audit Module launch** (auditor invite/review in-platform); **FedRAMP 20x JSON exports**; Trust Center resource workflow. | same |
- (Funding/valuation: not surfaced in this pass — GAP. Secureframe historically smaller-funded than Vanta/Drata.)

## Cross-cutting framework deltas (all three)
- **ISO 42001 (AI management system)** — both **Drata and Vanta** ship dedicated ISO 42001 support with
  automated evidence + **cross-mapping to ISO 27001**. The new must-have for AI companies. Source: [Truvo —
  Drata vs Vanta for ISO 42001 (2026)](https://truvocyber.com/blog/drata-vs-vanta-iso-42001) (accessed 2026-06-16).
- **FedRAMP 20x + OSCAL** — Vanta (OSCAL export, VantaGov) + Secureframe (FedRAMP 20x JSON) both shipped
  machine-readable federal exports Q4'25–Q1'26. The 5-best-FedRAMP field is Vanta/Drata/Secureframe/Paramify/
  Telos. Source: [Vanta — best FedRAMP software 2026](https://www.vanta.com/resources/resources-best-fedramp-compliance-software) (accessed 2026-06-16).
- **CMMC Level 2** — Secureframe is deepest (May 2026 scoping). Defense-adjacent.
- **MCP servers** — Vanta (GA) + Drata (experimental) both shipped; Secureframe MCP not found (API-only). The
  GRC-MCP race is the clearest sign these tools now expect AGENT operators.

## OSS / insurgent versions (snapshot 2026-06-16)
- **`trycompai/comp`** — 1,636★, TS, pushed today, 8 frameworks. (`ecosystem-09`)
- **`theopenlane/core`** — 261★, Go, pushed today, SOC2/GDPR/ISO27001/NIST 800-53. (`ecosystem-09`)
- **`strongdm/comply`** — 1,556★ but **DEAD since 2022-07-21** (do not use). (`ecosystem-09`)
- **`HailBytes/caiq-lite`** — CAIQ-as-code, active June 2026.

## stamp's takeaways
1. **The 6-month story is "GRC went agentic."** Plan for stamp to *consume* (drive via MCP) and *compete with*
   (the questionnaire KB) these agents, not to rebuild the platform.
2. **ISO 42001 + FedRAMP-20x/OSCAL are the new framework deltas** — relevant the moment Energy ships AI to
   regulated/gov buyers.
3. **Vanta leads on breadth + agent maturity + $ (4.15B/$300M ARR); Drata owns the Trust Center (SafeBase) +
   deepest infra tests; Secureframe owns CMMC/federal + advisory.** That's the current shape of the race.

## Sources
- All Vanta/Drata/Secureframe changelog + funding URLs cited inline above (accessed 2026-06-16).
- https://truvocyber.com/blog/drata-vs-vanta-iso-42001 (accessed 2026-06-16)
- https://www.vanta.com/resources/resources-best-fedramp-compliance-software (accessed 2026-06-16)
- https://www.fintechfutures.com/venture-capital-funding/drata-doubles-valuation-to-2bn-following-200m-series-c (accessed 2026-06-16)
- https://sacra.com/c/vanta/ (accessed 2026-06-16)
