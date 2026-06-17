---
title: "GDPR / CCPA-CPRA / DPAs / SCCs / DSARs / EU-US DPF — June 2026"
type: research
domain: compliance
topic: privacy law & data-protection posture
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [gdpr, ccpa, cpra, dpa, scc, dsar, eu-us-dpf, schrems, privacy, us-state-laws]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-05-data-residency]]", "[[ecosystem-01-soc2-iso-automation]]"]
summary: "The 2025-26 privacy reality: GDPR enforcement is real and growing (>€7.1B cumulative, €1.2B in 2025); the US has NO federal law but ~19-20 states with comprehensive laws + a CPRA-led patchwork; the EU-US DPF survived its first challenge (Latombe, Sept 2025) but is under CJEU appeal — so keep SCCs as backup. The cheapest strategy: build GDPR-aligned everywhere + automate DSARs + maintain a sub-processor/DPA register."
---

# GDPR / CCPA / DPA / DSAR — June 2026

> Zero auth overlap with badge — this is pure legal+process posture, squarely stamp's. badge does identity;
> stamp does "what the privacy regulators require and how to prove it."

## Enforcement is real and growing (the number that makes founders care)
- **GDPR fines now exceed €7.1 billion cumulative since 2018; €1.2 billion in 2025 alone.** Source:
  [Kiteworks — GDPR Fines Hit €7.1B (2026)](https://www.kiteworks.com/gdpr-compliance/gdpr-fines-data-privacy-enforcement-2026/) (accessed 2026-06-16).
- **Ireland's DPC leads with €4.04 billion cumulative** (it regulates the big US tech EU HQs). Source:
  [Improvado — GDPR Fines 2026](https://improvado.io/blog/gdpr-fines) (accessed 2026-06-16).
- The CMS Enforcement Tracker (7th ed., cut-off 2026-03-01) counts **2,685 fines (+440)**; the live tracker
  shows ~3,194 enforcement actions. Sources: [CMS Enforcement Tracker Report 2025/2026](https://cms.law/en/int/publication/GDPR-Enforcement-Tracker-Report/numbers-and-figures); [enforcementtracker.com](https://www.enforcementtracker.com/) (accessed 2026-06-16).
- **Fine tiers (memorize):** lesser infringements up to **€10M or 2%** of worldwide annual revenue; severe up
  to **€20M or 4%**. Source: [gdpr.eu/fines](https://gdpr.eu/fines/) (accessed 2026-06-16).

## The mental model: GDPR is the superset; CCPA/CPRA is the US leader; everyone else rhymes
- **Build GDPR-aligned everywhere = cheapest strategy.** GDPR is the strictest comprehensive regime, so a
  GDPR-compliant posture mostly covers CCPA/CPRA + the US state patchwork. Don't build per-state pipelines.
- **CCPA/CPRA is opt-OUT (sale/sharing); GDPR is opt-IN (consent/lawful basis).** This is the core structural
  difference and it changes your consent UX.

## DSARs / DSRs — the concrete operational obligation (exact numbers)
From [csdisco — DSARs for GDPR and CCPA](https://csdisco.com/blog/dsars-gdpr-ccpa-guide) (accessed 2026-06-16):
| | GDPR | CCPA/CPRA |
|---|---|---|
| **Response timeline** | **1 month**, extendable to **3 months** if complex | **45 days**, extendable to **90 days** if needed |
| **Scope** | any info relating to an identifiable person (incl. genetic/cultural) | data reasonably linkable to a CA resident or household |
| **Rights** | access, copy, purposes, recipients, retention, rectify, **erase**, complaint, automated-decision info (Art. 15) | know categories+sources, **correct** (CPRA add), **delete**, **limit use/disclosure** (CPRA add), portability |
| **Grounds to deny** | excessive/unfounded; conflicts with other legal obligations; free-expression/public-health/archival exemptions | security, fraud prevention, legal obligations; deletion exemptions for transactions/debugging/free-speech/internal/research |
| **Verification** | reasonable measures; avoid demanding formal ID unless necessary | "reasonable degree of certainty" — match **two data points** to records |

- **The automation story:** DSAR fulfillment is the repeated operational tax (find ALL of a person's data
  across every system + subprocessor, within the clock). Tools: OneTrust, TrustArc, DataGrail, Ethyca,
  Transcend; agent-native: `tiffanycoyle/gdpr-dsr-operator` ("drop into a Claude project: classifies, verifies
  identity, decides what the law allows, drafts the reply, routes the work" — `ecosystem-09`). This is a prime
  stamp-agent surface. Sources: [DataGrail](https://www.datagrail.io/glossary/data-subject-access-request-dsar/); [Ethyca](https://www.ethyca.com/guides/about-data-subject-requests-and-dsars); [TrustArc](https://trustarc.com/resource/dsr-requirements-everything-you-need-to-know/) (accessed 2026-06-16).

## DPAs, SCCs, sub-processors (the contract layer enterprises demand)
- **DPA (Data Processing Agreement)** — required between controller (your customer) and processor (you) under
  GDPR Art. 28; an enterprise will not sign without one. stamp drafts/tracks it; legal signs.
- **Sub-processor list** — you must disclose every sub-processor (cloud, analytics, email, error tracking, LLM
  provider) and notify customers of changes. Tie this to the residency register (`ecosystem-05`).
- **SCCs (Standard Contractual Clauses)** — the fallback lawful-transfer mechanism for EU→non-adequate
  countries; **keep them in place even if you rely on the DPF** (see DPF status below).

## EU-US Data Privacy Framework — current status (the live uncertainty)
- **The DPF SURVIVED its first challenge.** EU General Court **upheld** it on **2025-09-03** in the **Latombe**
  case (French MP), rejecting all grounds. It "**remains valid during the appeal process**"; ~**3,400 US
  companies** continue relying on it.
- **BUT an appeal to the CJEU is "widely anticipated"** (the claimant signaled he'll pursue it). So the DPF's
  long-term durability is uncertain (this is the third transatlantic framework after Safe Harbor and Privacy
  Shield, both struck down by Schrems I/II).
- **Practical takeaway (stamp's rule):** **rely on the DPF for convenience but keep SCCs + a Transfer Impact
  Assessment (TIA) as the backstop** — "multi-layered data transfer strategy ... robust TIAs as a critical
  safeguard against future legal disruption." Watch Executive Order 14086 / FISA §702 and the UK-US data
  bridge. Source: [Freshfields — DPF survives first judicial challenge](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/eu-us-data-privacy-framework-survives-its-first-judicial-challenge-but-more-are-102l4m1) (accessed 2026-06-16); [WilmerHale — CJEU to review DPF challenge](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework) (accessed 2026-06-16).

## US: no federal law, ~19-20 states with comprehensive laws (the patchwork)
- "A comprehensive privacy law on the federal level is **not expected to pass any time soon**," despite
  bipartisan drafts. So compliance is per-state.
- **~19-20 states** now have comprehensive consumer-privacy laws in effect: California (CCPA/CPRA), Colorado,
  Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New
  Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, Virginia.
- **Common requirements across them:** access/correct/delete rights; **opt-out of sale/sharing/targeted
  advertising**; sensitive-data protections; DPIAs for high-risk processing; consumer-appeal process for denied
  requests. Source: [DLA Piper — US data protection laws](https://www.dlapiperdataprotection.com/countries/united-states/law.html) (accessed 2026-06-16).
- **Implication:** "GDPR-aligned everywhere + honor opt-out signals (Global Privacy Control) + per-state DSAR
  intake" covers the patchwork without N pipelines.

## The AI-specific overlay (2026)
- **EU AI Act** is now the live new regime layering on top of GDPR (risk tiers, transparency, prohibited
  practices). For an AI-native company this is the new frontier — cross-ref `CJHodgson/Agentic-Governance-Spec`
  (DUAA + EU AI Act, `ecosystem-09`) and ISO 42001 (`ecosystem-01`). (stamp note — deep EU-AI-Act research is a
  GAP flagged for a follow-up.)
- **Data lineage for training/inference** is now an audit expectation (Teleport, `ecosystem-04`) — "where
  personal data flowed during training, fine-tuning, and inference" — a GDPR + AI-Act intersection.

## stamp's stance
1. **Build GDPR-aligned everywhere.** It's the cheapest path to covering CCPA/CPRA + the US patchwork + most of
   the world. Don't gold-plate per-jurisdiction.
2. **Automate DSARs** (the recurring tax) — agent classifies/verifies/drafts/routes; human signs anything
   legally consequential. `gdpr-dsr-operator` is the pattern.
3. **Keep SCCs + TIAs even under the DPF.** The DPF is alive but appealed; a Schrems III strike is a live tail
   risk. Don't be the company caught with only the DPF if the CJEU annuls it.
4. **Maintain ONE register** that is simultaneously the sub-processor list + the residency map + the DPA
   tracker. Three views, one source — the same consolidation discipline Energy uses for docs.
5. **Honor Global Privacy Control / opt-out signals** by default — it's the lowest-effort way to satisfy the
   strictest US states.

## Sources
- https://www.kiteworks.com/gdpr-compliance/gdpr-fines-data-privacy-enforcement-2026/ (accessed 2026-06-16)
- https://improvado.io/blog/gdpr-fines (accessed 2026-06-16)
- https://cms.law/en/int/publication/GDPR-Enforcement-Tracker-Report/numbers-and-figures (accessed 2026-06-16)
- https://www.enforcementtracker.com/ (accessed 2026-06-16)
- https://gdpr.eu/fines/ (accessed 2026-06-16)
- https://csdisco.com/blog/dsars-gdpr-ccpa-guide (accessed 2026-06-16)
- https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/eu-us-data-privacy-framework-survives-its-first-judicial-challenge-but-more-are-102l4m1 (accessed 2026-06-16)
- https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework (accessed 2026-06-16)
- https://www.dlapiperdataprotection.com/countries/united-states/law.html (accessed 2026-06-16)
- https://www.datagrail.io/glossary/data-subject-access-request-dsar/ ; https://www.ethyca.com/guides/about-data-subject-requests-and-dsars ; https://trustarc.com/resource/dsr-requirements-everything-you-need-to-know/ (accessed 2026-06-16)
