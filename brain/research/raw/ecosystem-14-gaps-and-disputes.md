---
title: "GAPS, disputes, and unverified claims — stamp ECOSYSTEM research"
type: synthesis
domain: compliance
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [gaps, disputes, unverified, anti-bluff]
related: ["[[ecosystem-00-INDEX-and-boundary]]"]
summary: "Honest ledger of what this research could NOT confirm and where genuine disputes exist. Per badge's anti-bluff discipline: flag the unknown, don't fabricate."
---

# GAPS, disputes, and unverified claims

> Stating these is the anti-slop floor (badge OP O9 / GAPS-AND-DISPUTES pattern). A future stamp session should
> close these before relying on the affected claim.

## Could NOT confirm (the top 3 the mission asks for)
1. **Reddit thread BODIES** — WebFetch blocks `reddit.com` and firecrawl returns "site not supported." Three
   load-bearing Reddit items are **title+snippet only**: (a) "I built an open-source competitor to Delve in 8.5
   days with Claude Code" (Shasta) — the "$10K–$80K/yr" quotes and the moat argument are from the snippet, not
   the body; (b) "Why does SOC 2 feel like security theater?"; (c) "How do you automate answering security
   questionnaires?" **Close via:** authenticated Chrome (claude-in-chrome MCP) or a logged-in browser.
2. **Secureframe funding/valuation** — not surfaced in this pass (Vanta $4.15B and Drata $2B are confirmed;
   Secureframe is not). Historically smaller-funded but no current number captured. **Close via:** Crunchbase/
   PitchBook/Sacra direct.
3. **Exact per-vendor pricing is approximate** — GRC vendors don't publish list prices; the figures (Vanta
   ~$10–12K, Drata ~$34K avg via Vendr, Secureframe ~$12–20K, Sprinto ~$5–10K) come from third-party
   aggregators (cavanex, Orbiq/Vendr), not vendor price sheets. Treat as directional. **Close via:** a real
   quote or a Vendr/Tropic data pull.

## Other gaps (flagged inline in files, collected here)
4. **EU AI Act depth** — touched (`ecosystem-06`, ISO 42001 in `01/12`) but NOT deeply researched (risk tiers,
   prohibited practices, conformity assessment, GPAI obligations). For an AI-native fleet this deserves its own
   file. **Open work.**
5. **HIPAA / BAA specifics** — named (in the 7-trust-primitives + vendor framework lists) but the HIPAA
   control set, BAA mechanics, and the HHS enforcement posture were not deep-researched. **Open work.**
6. **Pen-test "attestation letter" exact format** — confirmed it's demanded by questionnaires; the precise
   shareable-letter format per testing firm is inferred, not sourced. **Close via:** a Cobalt/Synack sample.
7. **Vanta MCP product-server (`mcp.vanta.com/mcp`) action list** — confirmed it exists + 3 example actions
   (find failing tests / remediate / act on data); the full tool catalog + auth scopes not enumerated (the docs
   reference deeper pages not crawled). **Close via:** crawl `developer.vanta.com/reference/*` + the product
   MCP tool list. Same for Drata's "57 actions" (StackOne number, not first-party-verified).
8. **`strongdm/comply` "dead" inference** — based on `pushed_at 2022-07-21`; possible the project moved/renamed
   (StrongDM the company is very alive). Verify it wasn't superseded by another StrongDM OSS repo before
   declaring it fully abandoned.
9. **FedRAMP "20x"** — referenced by Vanta + Secureframe as a current program/guidance; the exact official
   FedRAMP 20x scope/status was not independently verified against fedramp.gov. **Close via:** primary gov source.

## Genuine disputes (where smart people honestly disagree)
- **DISPUTE 1 — Is the "SSO tax" justified?** (`ecosystem-02`). Anti (sso.tax, CISOs, Rob Chahin): it taxes a
  security control; pro (Ben Orenstein, the Sketch eng): "all profit but the legacy-IdP long tail is real."
  **stamp's resolved stance:** don't gate *basic* SSO punitively; tier the genuinely-costly parts (SCIM, legacy
  IdP onboarding, admin portal). Not a settled industry consensus.
- **DISPUTE 2 — Is SOC 2 "security theater"?** (`ecosystem-10`). Cynics (HN/Reddit): it's a lucrative checkbox,
  auditors sign anything. Defenders: continuous-evidence platforms are "in-between checkbox and real security."
  **stamp's resolved stance:** real-security-first, cert as by-product; vet the auditor. Live debate.
- **DISPUTE 3 — Buy a GRC platform or build/OSS it?** (`ecosystem-01/09`). "Shasta in 8.5 days" + `trycompai/
  comp` (1,636★) say the platform is cloneable; the incumbents say the auditor network + integrations + KB are
  the moat. **stamp's resolved stance:** BUY for a real company; OSS only with an in-house compliance eng. The
  self-hosting pain (comp #1705) supports BUY.
- **DISPUTE 4 — EU-US DPF durability** (`ecosystem-06`). It survived Latombe (Sept 2025) but a CJEU appeal is
  anticipated; Safe Harbor and Privacy Shield both fell to Schrems. **stamp's resolved stance:** use the DPF but
  keep SCCs + TIAs as backstop. Genuinely uncertain.

## Boundary-respect audit (did stamp avoid badge's turf?)
- ✅ SCIM/SAML/OIDC *mechanism*, MCP-OAuth implementation, provider $-breakpoint selection, the P1–P4 router,
  the intersection rule, the auth-CVE class — all QUOTED from badge, not re-researched.
- ✅ stamp kept: SOC2/ISO/HIPAA posture, GDPR/CCPA/DPA, audit-as-control, residency, access-review *attestation*,
  pentest, questionnaires, the SSO *program*.
- ⚠️ One soft seam: "RBAC" appears in both — resolved by splitting **enforcement (badge)** vs **review/
  attestation (stamp)** explicitly in `ecosystem-07`. Re-check if badge later claims access-review attestation.

## File-numbering note (for the next session)
Final file set (the INDEX `ecosystem-00` file-list was reconciled to this): 00 index/boundary · 01 soc2-iso ·
02 sso-program · 03 scim-posture · 04 audit-logging · 05 residency · 06 gdpr-ccpa-dpa · 07 access-reviews ·
08 pentest-questionnaires · 09 starter-repos · 10 github-issues-breakage · 11 agent-operator · 12 versions-
changelog · 13 tradeoff-matrix · 14 gaps-and-disputes. (The INDEX's original forward-reference had 09=tradeoff
and 12=versions; actuals are 09=starter-repos, 12=versions, 13=tradeoff — harmless, noted for clarity.)
