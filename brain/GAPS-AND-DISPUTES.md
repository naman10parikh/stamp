---
title: "stamp GAPS-AND-DISPUTES — where sources disagree, where none exists, what's unconfirmed"
type: synthesis
domain: compliance
created: 2026-06-17
updated: 2026-06-17
tags: [gaps, disputes, unverified, anti-bluff, hipaa, eu-ai-act, stamp, cp123]
sources: ["brain/research/raw/ecosystem-14-gaps-and-disputes.md", "brain/research/raw/ecosystem-02-enterprise-sso-program.md", "brain/research/raw/ecosystem-06-gdpr-ccpa-dpa.md", "brain/research/raw/ecosystem-01-soc2-iso-automation.md", "brain/research/raw/ecosystem-10-github-issues-breakage.md", "brain/research/raw/ecosystem-11-agent-operator-notes.md", "brain/research/raw/ecosystem-00-INDEX-and-boundary.md"]
related: ["[[stamp EXPERTISE-MAP]]", "[[stamp OPINIONS]]", "[[stamp KNOWN-PITFALLS]]", "[[stamp TOOL-MATRIX]]"]
summary: "Honest ledger of what stamp could NOT confirm, the 4 genuine disputes (with both sides + stamp's resolved-for-now stance), the topics where no good source was found (HIPAA, EU AI Act, BAA mechanics — stamp must form its own view via experiments), and the META-GAP: the field-research half of Wave-R was never produced, so this brain is ecosystem-only."
---

# stamp GAPS-AND-DISPUTES

> Stating these is the anti-slop floor — flag the unknown, don't fabricate (badge's anti-bluff discipline).
> A future stamp session should close the gaps before relying on the affected claim, and re-open the disputes
> if new evidence lands. Where a topic has **no good source**, stamp must form its own view via **experiments**
> (run the tool, read the primary law, test the auditor's reaction) — that's flagged "FORM-OWN-VIEW."

---

## 0. THE META-GAP (most important — read first)

**The `field-*.md` research half was never produced.** The Wave-R task brief expected "two researchers" writing
both `ecosystem-*.md` AND `field-*.md`. Only the **ECOSYSTEM** set exists (15 files, `ecosystem-00`–`14`); there
are **zero `field-*.md` files** in `brain/research/raw/`. By contrast, sibling employee **badge** has a full
field set (`field-01`-`field-10`: SAML failure modes, migration war-stories, production postmortems,
practitioner taste, CVEs, 2026 shifts, agent-identity frontier — see badge EXPERTISE-MAP `sources:`).

- **What this means for stamp's brain:** it is grounded in **ecosystem breadth** (vendors, frameworks, market,
  GitHub-issue breakage, the agent-operator surface) but **thinner on first-person field depth** — there is no
  stamp equivalent of badge's "migration war-stories" or "production postmortems" beyond what `ecosystem-10`
  scraped from GitHub/HN. The scenarios in [[stamp BATTLE-TESTED-SCENARIOS]] are built from that ecosystem
  breakage layer + the Energy trust model, which is good — but a dedicated field pass would harden them with
  named-company postmortems (e.g., the Clerk-outage-class story badge has, but for a GRC tool / a failed audit).
- **Close via:** commission a `field-*.md` pass focused on: (a) real failed-SOC2/ISO-audit postmortems with the
  specific control that failed; (b) a botched-DSAR / GDPR-fine case study with the operational root cause; (c)
  a residency-leak incident (the audit-log-or-CDN-egress story); (d) practitioner taste from compliance
  engineers (the GRC equivalent of badge's `field-05`). **Open work — flagged for Wave-S/follow-up.**

---

## 1. Could NOT confirm (carried from `ecosystem-14`, re-verified as still open)

1. **Reddit thread BODIES** — WebFetch blocks `reddit.com`; firecrawl returns "site not supported." Three
   load-bearing items are **title+snippet only**: (a) "I built an open-source competitor to Delve in 8.5 days
   with Claude Code" (Shasta — the "$10K-$80K/yr" + moat quotes are from the snippet, not the body); (b) "Why
   does SOC 2 feel like security theater?"; (c) "How do you automate answering security questionnaires?"
   **Close via:** authenticated Chrome (claude-in-chrome MCP) or a logged-in browser. Source: `ecosystem-10`
   §caveats; `ecosystem-14` #1.
2. **Secureframe funding/valuation** — not surfaced (Vanta $4.15B / $300M ARR and Drata $2B are confirmed;
   Secureframe is not). **Close via:** Crunchbase / PitchBook / Sacra. Source: `ecosystem-12`; `ecosystem-14` #2.
3. **Exact per-vendor pricing is approximate** — GRC vendors don't publish list prices; the figures (Vanta
   ~$10-12K, Drata ~$34K avg via Vendr, Secureframe ~$12-20K, Sprinto ~$5-10K) come from third-party
   aggregators (cavanex, Orbiq/Vendr), not vendor sheets. **Treat as directional.** Close via: a real quote or a
   Vendr/Tropic pull. Source: `ecosystem-01`; `ecosystem-14` #3.
4. **Vanta MCP product-server (`mcp.vanta.com/mcp`) full action list + auth scopes** — confirmed it exists + 3
   example actions; the full tool catalog isn't enumerated. Same for Drata's "57 actions" (a StackOne number,
   not first-party-verified). **Close via:** crawl `developer.vanta.com/reference/*` + the product MCP tool
   list. Source: `ecosystem-11`; `ecosystem-14` #7.
5. **Secureframe MCP** — none found as of 2026-06-16 (API-only inferred). **Close via:** check Secureframe
   developer docs directly before building a headless Secureframe flow. Source: `ecosystem-11` §Secureframe.
6. **`strongdm/comply` "dead" inference** — based on `pushed_at 2022-07-21`; possible the project moved/renamed
   (StrongDM the company is very alive). **Verify it wasn't superseded** before declaring it fully abandoned (the
   "don't recommend it" stance holds regardless — it's stale). Source: `ecosystem-09`; `ecosystem-14` #8.
7. **FedRAMP "20x" official scope/status** — referenced by Vanta + Secureframe as a current program; not
   independently verified against fedramp.gov. **Close via:** primary gov source before advising a gov sale.
   Source: `ecosystem-01`; `ecosystem-14` #9.
8. **Pen-test "attestation letter" exact format** — confirmed it's demanded by questionnaires; the precise
   shareable-letter format per testing firm is inferred. **Close via:** a Cobalt/Synack sample. Source:
   `ecosystem-08`; `ecosystem-14` #6.
9. **SafeBase→Drata acquisition** — confirmed via TechCrunch + Drata blog (2025-02-12, $250M). (This was a
   "flagged recall" in `ecosystem-08` that `ecosystem-10` §Finding 4 *resolved* — noting it here as CLOSED so a
   future session doesn't re-flag it.) Source: `ecosystem-10` §Finding 4.

---

## 2. Topics with NO good source — stamp must FORM-OWN-VIEW via experiments

These are named across the corpus but never deep-researched. For these, stamp should not bluff — it should run
the experiment (read the primary regulation, drive the tool, test the auditor's reaction) and write the result
back to `brain/`.

10. **HIPAA / BAA specifics — FORM-OWN-VIEW.** HIPAA + the Business Associate Agreement appear in the
    7-trust-primitives and vendor framework lists, but **the HIPAA control set, BAA mechanics (who signs, what
    it obligates, subcontractor flow-down), and the HHS enforcement posture were not researched.** For an
    Energy product touching health data this is a hard blocker. **Experiment:** read the HHS Security Rule
    directly + a real BAA template; drive Vanta/Drata's HIPAA framework module and record what evidence it
    auto-collects vs what's manual. **Open work.** Source: `ecosystem-14` #5.

11. **EU AI Act depth — FORM-OWN-VIEW.** Touched (`ecosystem-06`: risk tiers, transparency, prohibited
    practices; ISO 42001 in `01/12`) but **NOT deeply researched** (conformity assessment, GPAI obligations,
    timelines, who-is-a-provider-vs-deployer). For an AI-native fleet this deserves its own file and is the new
    frontier. **Experiment:** read the AI Act text + the `CJHodgson/Agentic-Governance-Spec` (DUAA + EU AI Act:
    reversibility scoring, purpose-compatibility) as a working interpretation; map Energy's agents to risk
    tiers. **Open work.** Source: `ecosystem-06` §the AI-specific overlay; `ecosystem-14` #4.

12. **The exact tamper-evident audit-log substrate to BUILD vs BUY — FORM-OWN-VIEW.** The *shape* is clear
    (OTel spans, hash-chained, signed, SIEM export) and primitives exist (`DriftDB` append-only; SIEM for
    export) — but **no source prescribes the concrete stack** for an E2B/Energy deployment. **Experiment:**
    prototype the span schema `(actor, target, before_hash, after_hash, trace_id)`, hash-chain it, and verify a
    sample SIEM export; decide build-vs-buy on that. **Open work.** Source: `ecosystem-04` §tooling.

13. **Whether the audit RSI-substrate double-use actually satisfies a real auditor — FORM-OWN-VIEW.** stamp's
    stance (O / EXPERTISE-MAP 4.6) is that AutoLab's nightly-mutation audit log doubles as CC8 change-management
    evidence. This is **a design assertion, not an auditor-confirmed fact.** **Experiment:** present the
    AutoLab audit artifacts to a real auditor (or model the CC8 IRL) and record whether they accept it. **Open
    work.** Source: `ecosystem-04` §the agent story (CC8).

---

## 3. Genuine disputes (where smart people honestly disagree — both sides + stamp's resolved-for-now stance)

### DISPUTE 1 — Is the "SSO tax" justified?
- **Anti-gating (sso.tax, CISOs, Rob Chahin):** it taxes a *security control*; "if your SSO pricing is 3x your
  base pricing, are you telling me 2/3 of your product's cost is keeping SAML going?"; 80% of SaaS apps lack
  SSO due to licensing cost. Source: `ecosystem-02` §the case AGAINST.
- **Pro-tiering (Ben Orenstein, Klaas Pieter Annema/Sketch):** "SSO costs close to nothing after automation, so
  the increase is all profit" (admitted "gray hat"); BUT "supporting whatever wonky homebuilt IdP large
  enterprises use is a huge time sink" — the long-tail support cost is real. Source: `ecosystem-02` §the case
  FOR.
- **stamp's resolved-for-now stance ([[stamp OPINIONS]] O15):** don't gate *basic* SSO (Google/Microsoft/Okta
  OIDC) punitively; DO tier the genuinely-costly parts (SCIM, legacy-IdP onboarding, admin portal, audit-log
  export). **Not a settled industry consensus** — re-open if the buyer norm shifts. Source: `ecosystem-14`
  DISPUTE 1.

### DISPUTE 2 — Is SOC 2 "security theater"?
- **Cynics (HN/Reddit):** "SOC2 is a checkbox ... not security ... but a very lucrative business"; auditors
  "sign anything"; certified firms that "binned all ISMS processes post-takeover." Source: `ecosystem-10`
  §Finding 1.
- **Defenders (HN id=40564639):** continuous-evidence platforms (Vanta/Drata) are "somewhere in-between
  checkbox compliance and real security" — they exist *because* point-in-time certs rot. Source: `ecosystem-10`
  §Finding 1.
- **stamp's resolved-for-now stance ([[stamp OPINIONS]] O3):** real-security-first, cert as a by-product;
  **vet the auditor.** A live debate, not a closed one. Source: `ecosystem-14` DISPUTE 2.

### DISPUTE 3 — Buy a GRC platform, or build/OSS it?
- **"It's cloneable":** "Shasta in 8.5 days" with Claude Code + `trycompai/comp` (1,636★) say the platform is
  commoditized. Source: `ecosystem-01`/`09`.
- **"The moat is real":** the incumbents say the auditor network + maintained integrations + the answer-KB are
  the value; the OSS self-host pain (comp #1705) + the "integrations are the eternal ask" (theopenlane #2318)
  support BUY. Source: `ecosystem-10` §Finding 3.
- **stamp's resolved-for-now stance ([[stamp OPINIONS]] O5):** **BUY for a real company; OSS only with an
  in-house compliance engineer + a no-lock/sovereignty reason.** Source: `ecosystem-14` DISPUTE 3.

### DISPUTE 4 — EU-US DPF durability
- **Alive:** survived Latombe (2025-09-03); ~3,400 US companies rely on it; "remains valid during the appeal."
  Source: `ecosystem-06` §DPF status.
- **Fragile:** a CJEU appeal is "widely anticipated"; it's the third framework after Safe Harbor + Privacy
  Shield, both struck by Schrems. Source: `ecosystem-06` §DPF status.
- **stamp's resolved-for-now stance ([[stamp OPINIONS]] O14):** use the DPF for convenience but **keep SCCs +
  TIAs as the backstop.** Genuinely uncertain — watch EO 14086 / FISA §702 / the UK-US data bridge. Source:
  `ecosystem-14` DISPUTE 4.

---

## 4. Boundary-respect audit (did stamp avoid badge's turf? — carried from `ecosystem-14`, re-affirmed)

- ✅ SCIM/SAML/OIDC *mechanism*, MCP-OAuth implementation, provider $-breakpoint selection, the P1–P4 router,
  the intersection rule, the auth-CVE class — all **QUOTED from badge, not re-researched** across `ecosystem-00`
  / `02` / `03` and EXPERTISE-MAP JTBD-8/9.
- ✅ stamp kept: SOC2/ISO/HIPAA posture, GDPR/CCPA/DPA, audit-as-control, residency, access-review
  *attestation*, pentest, questionnaires, the SSO *program*.
- ⚠️ **One soft seam: "RBAC" appears in both** — resolved by splitting **enforcement (badge)** vs
  **review/attestation (stamp)** explicitly (EXPERTISE-MAP JTBD-3 / `ecosystem-07` §boundary). **Re-check if
  badge later claims access-review attestation** — if it does, that's a real overlap to renegotiate. Source:
  `ecosystem-14` §boundary-respect audit.

---

## 5. What a future session should close FIRST (priority order)

1. **Commission the `field-*.md` pass** (§0) — the biggest structural gap; everything else is breadth, this is
   depth.
2. **HIPAA/BAA + EU AI Act** (§2.10, §2.11) — the two named-but-unresearched frameworks that block real
   verticals (health, AI-to-regulated-buyers).
3. **Confirm the Reddit bodies + Vanta/Drata full MCP action lists** (§1.1, §1.4) — load-bearing for the moat
   argument + the agent-operator surface.
4. **Prototype + auditor-test the tamper-evident audit substrate** (§2.12, §2.13) — turn the design assertions
   into auditor-confirmed facts.
