---
title: "Access reviews (UAR) + RBAC POSTURE (the attestation, not the enforcement) — June 2026"
type: research
domain: compliance
topic: user access reviews & RBAC governance
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [access-review, uar, rbac, least-privilege, cc6, segregation-of-duties, iga, soc2, attestation]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-04-audit-logging]]", "[[ecosystem-01-soc2-iso-automation]]"]
summary: "Access reviews are the control auditors fail you on most — they're manual, periodic, and rot (privilege creep + orphaned accounts). The 2026 bar: quarterly (general) / monthly-or-continuous (privileged), MUST cover service accounts + API keys + agent identities, with immutable timestamped attestation evidence. BOUNDARY: badge ENFORCES RBAC (the token); stamp REVIEWS it (the periodic attestation an auditor reads)."
---

# Access reviews + RBAC posture — June 2026

> **The boundary (sharpest split with badge):** badge owns RBAC *enforcement* — scopes, the intersection rule
> (`agent_perms ∩ user_perms`), the policy gate per tool call (badge JTBD-6). stamp owns the *posture/
> attestation* — the periodic **user access review (UAR)** that PROVES least privilege to an auditor, the
> least-privilege *evidence*, the privilege-creep detection. Same RBAC, two jobs: badge stops the bad call;
> stamp produces the quarterly artifact that says "we checked, here's who can do what and why."

## Why access reviews are the control auditors flag most
- They satisfy SOC 2 **CC6.x** (logical access control, **least privilege, segregation of duties**) — the
  family every other access claim hangs off. Source: [Torii — Access Reviews for SOC 2 in 2026](https://www.toriihq.com/articles/soc2-access-reviews) (accessed 2026-06-16).
- They fail because they're **manual, periodic, and rot.** The named failure modes:
  - **Incomplete scope** — "skipping service accounts, API keys, and third-party access ... reviews should cover
    more than interactive users." ← THE big one for an agent fleet (see below).
  - **Delayed remediation** — creates audit exceptions.
  - **Missing documentation** — "orphaned or dormant accounts often cause control failures"; "excessive
    privileges raise the likelihood of control exceptions."
  - Source: [Torii](https://www.toriihq.com/articles/soc2-access-reviews); [Linford — UAR best practices](https://linfordco.com/blog/user-access-review-best-practices/) (privilege creep) (accessed 2026-06-16).

## The 2026 bar (cadence + evidence)
- **Cadence (risk-based):** privileged/admin/cloud-root → **monthly or continuous**; general users → **at least
  quarterly**; ad-hoc → on role change, M&A, new system onboarding. Source: [Torii](https://www.toriihq.com/articles/soc2-access-reviews).
- **Evidence auditors demand (immutable artifacts):** (1) "attestation logs with **timestamps showing who
  reviewed what and when**"; (2) "reviewer comments explaining the business/technical reason access was
  [granted/kept]"; (3) remediation items with owners + completion dates; (4) provisioning/deprovisioning
  records mapped to role definitions. Source: [Torii](https://www.toriihq.com/articles/soc2-access-reviews).
- **Scope MUST include non-human identities** — service accounts, API keys, OAuth grants, third-party/vendor
  access, AND **agent identities**. This is the load-bearing modern requirement.

## THE agent angle (why this is existential for Energy)
- An agent fleet multiplies non-human identities. The Torii rule ("cover more than interactive users") + the
  Teleport SOC 2 rule (`ecosystem-04`: "no human request = accountability gap," every privileged agent action
  must tie to an accountable individual) mean **every Energy agent identity must be in the access-review
  scope**, with an accountable human owner, scoped permissions, and an expiry.
- This is the *review-side* mirror of badge's intersection rule: badge guarantees the agent can't exceed
  `agent_perms ∩ user_perms` at the token; stamp's quarterly UAR *attests* that this is true and that no agent
  accumulated orphaned grants. **Build them together** — the token scopes ARE the access-review inventory.
- ISO 42001 + EU-AI-Act governance (`ecosystem-06`) add "review your AI agents' access" as an explicit control.

## Tools (the IGA / access-review market, 2026)
- **GRC-platform-native (closest to stamp's path):** **Vanta** and **Drata** both ship access-review modules;
  **Secureframe** shipped **User Access Reviews (GA, March 2026)** — "scheduled recurring or one-time reviews,
  evaluate access at the application level, document decisions to approve/revoke/follow-up." (`ecosystem-01`.)
- **Dedicated access-review / IGA tools (from [SecurEnds — Top 9 UAR tools 2026](https://www.securends.com/blog/user-access-review-software/), accessed 2026-06-16):**
  - **SecurEnds** — automated campaigns + risk-based reviews; growing companies.
  - **Lumos** — "good for companies with heavy SaaS usage and less legacy footprint"; SaaS-app access automation. (Also a known ConductorOne competitor.)
  - **SailPoint IdentityIQ** — "very mature IGA stack with many connectors"; large enterprise.
  - **Pathlock** — deep SAP/Oracle + segregation-of-duties analytics; enterprise GRC.
  - **CyberArk Identity** — privileged access + closed-loop remediation + audit evidence.
  - **Microsoft Entra** — built-in access reviews for M365/Azure shops.
  - **Ping Identity** — federated identity + access certification, mid/large enterprise.
  - **ManageEngine ADAudit Plus** — AD-centric, SMB/mid-market.
  - **LogicManager** — UAR tied to broader GRC/risk.
  - (Also relevant though not in that list: **ConductorOne**, **Zluri** — SaaS access governance.)

## The automation-vs-human balance (the anti-slop nuance)
- Automation turns "tedious entitlement lists into an accurate, queryable inventory in minutes"; connectors pull
  current state from SSO + cloud IAM; one-click remediation drops median time-to-remediate "from days to hours";
  analytics detect privilege creep proactively.
- **BUT:** "avoid over-automation without human validation; **an automated revoke can break a business process
  if exceptions aren't surfaced and approved.**" Source: [Torii](https://www.toriihq.com/articles/soc2-access-reviews). ← Same read/draft/commit gradient as everywhere: an agent can *propose* revokes; a human approves anything that could break prod. (badge JTBD-6.3.)

## stamp's stance
1. **Scope every UAR to NON-HUMAN identities too** — service accounts, API keys, OAuth grants, and (critically)
   every agent identity. The #1 audit failure is reviewing only interactive humans.
2. **Cadence: quarterly general, monthly/continuous for privileged + agents.**
3. **Evidence is immutable timestamped attestation + the reason** — "who reviewed what, when, and why kept."
   Generate it from the same audit trail as `ecosystem-04`.
4. **Agent proposes, human approves revokes** — auto-revoke without a gate breaks prod (and is itself a CC6
   change-management risk).
5. **The access-review inventory == the RBAC scope inventory.** Don't maintain two lists; derive the UAR from
   badge's token scopes. One source of truth.

## Sources
- https://www.toriihq.com/articles/soc2-access-reviews (accessed 2026-06-16)
- https://linfordco.com/blog/user-access-review-best-practices/ (accessed 2026-06-16)
- https://pathlock.com/learn/user-access-reviews-types-and-best-practices/ (accessed 2026-06-16)
- https://secureframe.com/blog/user-access-reviews (accessed 2026-06-16)
- https://www.securends.com/blog/user-access-review-software/ (accessed 2026-06-16)
- https://www.balkan.id/post/uar-for-soc2-hipaa-iso-compliance (accessed 2026-06-16)
- Internal: ~/badge/brain/EXPERTISE-MAP.md JTBD-6 (intersection rule, RBAC enforcement); stamp ecosystem-04
