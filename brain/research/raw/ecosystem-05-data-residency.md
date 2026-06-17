---
title: "Data residency (region pinning, BYOK/CMK, sovereignty) — June 2026"
type: research
domain: compliance
topic: data residency & sovereignty
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [data-residency, data-sovereignty, byok, cmk, region-pinning, gdpr, china-csl, india-dpdp, schrems]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-06-gdpr-ccpa-dpa]]", "[[ecosystem-04-audit-logging]]"]
summary: "Data residency (WHERE data lives) ≠ data sovereignty (WHO controls it / whose law applies). Residency is mostly theater unless you pin compute AND storage AND backups AND logs AND caches AND your subprocessors — the gotcha is the long tail leaking cross-region. 2026 reality: per-region cells + BYOK/CMK + a residency-aware subprocessor list."
---

# Data residency — June 2026

> One of the 7 Energy trust primitives (`the_complete_story.md` L222: "residency — per-region pinning +
> customer-managed KMS"). stamp owns the *posture* (what we promise, how we prove it); rocket/infra owns the
> *deployment* (the actual regional cells). This file is the compliance posture.

## The distinction stamp must hold (residency ≠ sovereignty ≠ privacy)
- **Data residency** = the *geographical location* where data physically lives/is stored. Source: [IBM — Data
  Sovereignty vs Data Residency](https://www.ibm.com/think/topics/data-sovereignty-vs-data-residency) (accessed 2026-06-16).
- **Data sovereignty** = *who has authority over the data / whose laws govern it.* "Data is subject to the laws
  and regulations of the country where it is collected or processed." Data can RESIDE in region X but still be
  SUBJECT to another country's jurisdiction (e.g., US CLOUD Act reaching US-company data stored in the EU) —
  which is the entire `Schrems` problem. Sources: [Splunk](https://www.splunk.com/en_us/blog/learn/data-sovereignty-vs-data-residency.html); [StratoKey — residency ≠ sovereignty](https://www.stratokey.com/blog/data-residency-does-not-equal-data-sovereignty); [Kiteworks](https://www.kiteworks.com/regulatory-compliance/data-sovereignty-privacy-residency-difference/) (all accessed 2026-06-16).
- **Why it matters:** a buyer asking "do you support EU data residency?" often actually needs *sovereignty*
  (no US-government access). Pinning to `eu-central-1` does NOT solve sovereignty if the provider is a US
  company subject to the CLOUD Act. stamp must clarify which one the buyer means.

## The load-bearing gotcha: residency is theater unless you pin the WHOLE pipeline
Pinning the primary database is the easy 20%. The 80% that leaks data cross-region (and fails an audit):
- **Backups** — replicate cross-region by default on most clouds; must be explicitly regionalized.
- **Logs / audit trail** — your SIEM/OTel pipeline often ships to a single global region (the audit log itself
  contains personal data!). Cross-ref `ecosystem-04`.
- **Caches / CDN edge** — CDN edge nodes and caches replicate content globally by design; a notable blind spot
  (Alation's residency-by-design piece omits CDN/cache entirely — a real gap to watch). Source: [Alation —
  Data Residency for SaaS](https://www.alation.com/blog/data-residency-by-design-global-compliance/) (accessed 2026-06-16).
- **Subprocessors** — the long tail: error tracking (Sentry), product analytics, transactional email,
  support tooling, AND your LLM provider. Each is a cross-region egress unless contractually + technically
  region-pinned. "Right-to-access requests require systems that can find all data about an individual **across
  your infrastructure**." (Alation.)
- **Tax/billing location data** — "customer location data used for tax compliance is itself subject to data
  residency regulations ... most companies build tax compliance systems separately from their residency
  infrastructure." (Alation — a genuinely non-obvious leak.)
- **Shadow data** — "35% of data breaches now involve shadow data" (16% higher cost). (Alation.)
- **LLM inference (the 2026 addition Alation doesn't cover):** for an AI-native company, the *model call* is a
  cross-region data flow. Anthropic/OpenAI region + ZDR (zero-data-retention) settings are part of the
  residency story now. stamp must include the LLM provider in the residency map. (stamp inference — flagged.)

## Region-specific requirements (2026)
- **EU (GDPR):** transfers outside the EU need a lawful mechanism — **SCCs** (Standard Contractual Clauses) or
  the **EU-US Data Privacy Framework** (for US transfers; status: surviving but under CJEU review — see
  `ecosystem-06`). Source: [Alation]; [Kiteworks].
- **China (Cybersecurity Law / PIPL):** "critical information infrastructure operators [must] store personal
  information collected in China on servers **within the country**" + security assessment for export. Source: [Alation].
- **India (DPDP Act):** "brings similar rigor with penalties up to **$30 million** for the most severe
  violations." Source: [Alation]. (Relevant: Naman/Energy India footprint.)
- **US:** no comprehensive federal law; a sectoral + state patchwork (see `ecosystem-06`). Residency is mostly
  contractual, not statutory, except sectoral (HIPAA, gov FedRAMP/IL).

## The 2026 architecture pattern (what to build)
- **Per-region cells** (a full stack per region, not one global app with a regional DB). Location-aware routing
  sends a customer's requests to their region's cell. AWS/Azure/GCP all support explicit region selection —
  "specify exactly which region stores your data" rather than trusting defaults. Source: [Alation].
- **BYOK / Customer-Managed Keys (CMK)** — the customer holds the KMS key; even if data resides in your cloud,
  *they* control decryption. This is the sovereignty lever short of full self-host (Energy's "customer-managed
  KMS" primitive). It's the standard enterprise ask above residency.
- **Automated residency guardrails** — "build automated checks that verify data stays in approved regions, flag
  violations before they occur" + "real-time data location tracking." (Alation.) This is an agent-automatable
  control: a stamp agent can continuously assert "no PII left region X."
- **A residency-aware subprocessor register** — every subprocessor tagged with the regions it processes in;
  ties into the DPA/sub-processor list (`ecosystem-06`).

## Concrete proof-point: vendors now ship region-split everything
Drata's own MCP server is region-split — US `mcp.drata.com`, EU `mcp-euc1.drata.com`, APAC `mcp-apse2.drata.com`
(`ecosystem-11`) — a live example that even the *tooling control plane* now respects residency. Expect buyers
to ask whether YOUR control plane (not just data plane) is region-pinned.

## stamp's stance
1. **Always ask "residency or sovereignty?"** before answering a buyer. They're different promises with very
   different costs (region pin = cheap; sovereignty/no-US-access = sovereign cloud or self-host).
2. **Residency is whole-pipeline or it's a lie.** Pin DB + backups + logs + cache/CDN + every subprocessor +
   the LLM call. The audit log and the tax-location data are the two everyone forgets.
3. **Offer BYOK/CMK as the sovereignty lever** before promising a sovereign cloud.
4. **Make residency an automated, continuously-asserted control** (agent checks "PII stays in region"), not a
   one-time architecture claim — that's how it survives an audit and how a stamp agent adds value.
5. **For an AI-native company, the model provider is in scope** — pin region + enable ZDR; put it on the
   subprocessor list.

## Sources
- https://www.ibm.com/think/topics/data-sovereignty-vs-data-residency (accessed 2026-06-16)
- https://www.splunk.com/en_us/blog/learn/data-sovereignty-vs-data-residency.html (accessed 2026-06-16)
- https://www.stratokey.com/blog/data-residency-does-not-equal-data-sovereignty (accessed 2026-06-16)
- https://www.kiteworks.com/regulatory-compliance/data-sovereignty-privacy-residency-difference/ (accessed 2026-06-16)
- https://www.alation.com/blog/data-residency-by-design-global-compliance/ (accessed 2026-06-16)
- https://dualitytech.com/blog/data-sovereignty-vs-data-residency-full-comparison/ (accessed 2026-06-16)
- Internal: ~/energy/docs/vision/the_complete_story.md L222; stamp ecosystem-11 (Drata regional MCP)
