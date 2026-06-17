---
title: "Operating compliance tools as an AGENT (not a human) — CLIs, APIs, MCP servers — June 2026"
type: research
domain: compliance
topic: agent-operator surfaces
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [agent-operator, mcp, api, cli, vanta, drata, questionnaire, headless]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-01-soc2-iso-automation]]", "[[ecosystem-08-pentest-questionnaires]]"]
summary: "What a stamp agent needs to DRIVE these tools headlessly. Verdict: BOTH Vanta and Drata ship MCP servers (Vanta also ships an official API + AI Skills CLI). The questionnaire-answering agent is the highest-leverage surface. Most 'automation' is still integration-pull + human attestation — an agent can't make an auditor sign."
---

# Operating compliance tools as an AGENT — June 2026

> stamp is an agent employee, not a human GRC analyst. This file is "what can I actually run headlessly,
> and where does the human still have to sign." Mirrors badge's JTBD-9 ("operate auth as an agent").

## The headline: Vanta AND Drata both ship MCP servers (the GRC-MCP race is on)

### Vanta — the maturest agent surface (MCP + official API + AI Skills CLI)
- **Product MCP server:** `https://mcp.vanta.com/mcp` — lets an agent *act on a live Vanta tenant*: "find
  failing tests, remediate them, and act on your compliance data directly from Claude." Source:
  [Vanta Developer Hub](https://developer.vanta.com/) (accessed 2026-06-16).
- **Docs MCP server (separate):** `https://developer.vanta.com/mcp` — search dev docs + load AI Skills as
  resources. Add via: `claude mcp add --transport http vanta-docs https://developer.vanta.com/mcp`.
- **AI Skills CLI:** `npx skills add https://developer.vanta.com` — installs skills like
  `build-vanta-integration` ("auth, resource pushes, refresh-token rotation, marketplace listing"). Source:
  [Vanta — Install AI Skills](https://developer.vanta.com/docs/ai-skills) (accessed 2026-06-16).
- **REST API:** base `https://api.vanta.com` (gov: `https://api.vanta-gov.com`). **OAuth 2.0**, token endpoint
  `POST /oauth/token`, `Authorization: Bearer`, **1-hour token lifetime**, requesting a new token with the
  same `client_id/secret` **revokes the previous one** (gotcha for concurrent agents — don't share creds
  across parallel agent runs). OAuth endpoint rate limit: **5 req/min shared across all APIs**. Three APIs:
  **Manage Vanta** (`client_credentials` — controls/documents/vendors/personnel/tests on your own tenant),
  **Build Integrations** (private=`client_credentials`, public=`authorization_code` — push into customer
  tenants), **Auditor API** (`client_credentials` — pull audit data, manage info requests). Source:
  [Vanta API reference](https://developer.vanta.com/reference/overview) (accessed 2026-06-16).
- Vanta even published a piece titled *"How Claude + MCP + Vanta could help auditors"* — they generated the
  MCP server programmatically from their REST API docs so Claude can "understand and act on" compliance data.
  Source: [Vanta blog](https://www.vanta.com/resources/claude-mcp-vanta) (accessed 2026-06-16).

### Drata — experimental MCP, multi-region, role-scoped
- **Remote hosted MCP URLs (note the residency split — see `ecosystem-05`):**
  US `https://mcp.drata.com/mcp/` · EU `https://mcp-euc1.drata.com/mcp/` · APAC `https://mcp-apse2.drata.com/mcp/`.
- **Auth:** OAuth, "credentials not shared with the AI client"; **role-based** — "users can only retrieve data
  they have permissions for within Drata; revoke access anytime." Drata-hosted in a "hardened environment ...
  no servers, no dependencies, no upkeep."
- **Capabilities:** "summarize failed compliance tests instantly," "generate real-time risk and controls
  reports," "map controls across frameworks," "power AI workflows with live compliance context."
- **Best practices (verbatim, from Drata help center):** (1) "**Always include 'Drata' in your prompts**" to
  route to MCP tools vs built-in knowledge; (2) "Be specific ... include framework names, time ranges, risk
  categories, team names"; (3) "Use natural language — you don't need to know Drata's API or data model."
- **Currency flag:** the Drata-MCP launch blog is dated **2025-06-12** (~1 yr old, "experimental / get early
  access"); the **config help-center page is current (2026)**. So the MCP is real and current but still
  flagged experimental. Sources: [Drata — Introducing MCP](https://drata.com/blog/introducing-mcp-built-for-ai) (2025-06-12); [Drata Help — MCP Configuration](https://help.drata.com/en/articles/13379899-mcp-configuration-new-experience) (accessed 2026-06-16); third-party [StackOne Drata MCP — "57 actions"](https://www.stackone.com/connectors/drata/mcp/) (accessed 2026-06-16).

### Drata REST API (the non-MCP path)
- "Open API on REST standards" — push/pull controls, evidence, reporting. Workspace-ID required for POST/PUT.
  Source: [Drata Public API](https://help.drata.com/en/articles/6695964-drata-public-api); [Drata Developer Portal](https://developers.drata.com/) (accessed 2026-06-16).

### Secureframe — API yes, MCP not found
- Secureframe has a REST API (Comply integrations) but **no first-party MCP server surfaced** as of 2026-06-16
  (GAP — verify). If a stamp agent must drive Secureframe headlessly, it's API-only today.

## The highest-leverage agent surface: the questionnaire-answerer
- The recurring tax in enterprise sales is the **security questionnaire** (SIG / CAIQ / VSA / bespoke). All
  three incumbents now ship an AI answerer: **Vanta Customer Trust Agent** ("self-improving knowledge base"),
  **Drata** (AI Trust Center item generation + questionnaire help), **Secureframe ComplyAI**.
- OSS/agent equivalents a stamp agent can run itself: `tolgadur/rfx-email-agent`, `HailBytes/caiq-lite`
  (CAIQ-as-code), `sandipkatel/Unified-InfoSec-QnA-Assistant` (see `ecosystem-09`).
- **stamp's play:** own the company's *answered-questionnaire corpus* as a versioned KB (CAIQ-as-code +
  WikiMem-style), answer drafts via RAG, route to a human for sign-off. This is the compounding asset.

## What an agent CANNOT do headlessly (the human-in-the-loop reality)
1. **Make an auditor sign.** SOC 2 attestation / ISO 27001 certification require an independent CPA firm /
   accredited body. The agent prepares evidence; a human auditor still issues the report. No API for that.
2. **Attest to manual controls.** Access reviews, policy acknowledgement, background checks, security-training
   completion — the agent can *surface and chase* these, but a human owner must *attest*. (Vanta's NL query
   "show engineers who haven't completed training" is chase, not attest.)
3. **Sign DPAs / SCCs / BAAs.** Legal execution is human. The agent drafts and tracks.
4. **Approve irreversible remediations** without a gate — same read/draft/commit gradient badge enforces for
   agent-auth (badge JTBD-6.3) applies here: an agent auto-remediating a *control* (e.g., flipping an S3
   bucket, disabling a user) needs an out-of-band approval, or one bad inference becomes a compliance/security
   incident.

## Agent operator playbook (stamp's headless recipe)
1. **Discover capability via MCP first, API second.** Toggle the vendor MCP (Vanta `mcp.vanta.com/mcp` or
   Drata regional URL); fall back to REST (`api.vanta.com` OAuth client_credentials) for anything the MCP
   doesn't expose.
2. **Mention the vendor by name in prompts** (Drata's explicit best practice; good hygiene for Vanta too).
3. **Scope the token tightly + don't share creds across concurrent agents** (Vanta revokes the prior token on
   re-issue with the same client_id — parallel runs will fight).
4. **Pull failing tests → propose remediation → gate irreversible actions behind a human** (read/draft/commit).
5. **Maintain the questionnaire KB as code** and diff it each renewal (`caiq-lite` pattern).
6. **Never claim "compliant" — claim "audit-ready evidence assembled."** The attestation is the human's.

## Cross-ref to badge (don't duplicate)
- Authn to these tools' APIs is OAuth client_credentials — that's a **badge** primitive (machine identity / P1).
  stamp consumes it; badge reasons about it.

## Sources
- https://developer.vanta.com/ (accessed 2026-06-16)
- https://developer.vanta.com/docs/ai-skills (accessed 2026-06-16)
- https://developer.vanta.com/reference/overview (accessed 2026-06-16)
- https://www.vanta.com/resources/claude-mcp-vanta (accessed 2026-06-16)
- https://drata.com/blog/introducing-mcp-built-for-ai (2025-06-12)
- https://help.drata.com/en/articles/13379899-mcp-configuration-new-experience (accessed 2026-06-16)
- https://www.stackone.com/connectors/drata/mcp/ (accessed 2026-06-16)
- https://help.drata.com/en/articles/6695964-drata-public-api (accessed 2026-06-16)
- https://developers.drata.com/ (accessed 2026-06-16)
