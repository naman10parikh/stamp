---
title: "SCIM / provisioning from the POSTURE side (deprovisioning attestation, drift) — June 2026"
type: research
domain: compliance
topic: SCIM provisioning posture (not the mechanism)
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [scim, provisioning, deprovisioning, posture, access-review, drift, boundary, badge]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-02-enterprise-sso-program]]", "[[ecosystem-07-access-reviews-rbac]]"]
summary: "SHORT BY DESIGN — the SCIM *mechanism* is badge's (webhook signature validation, event ordering, the code). stamp owns only the POSTURE: deprovisioning as the #1 questionnaire item, drift detection between IdP and app, and proving 'departed employees lose access' to an auditor. This file states the boundary and the few posture-only points, then hands the rest to badge."
---

# SCIM / provisioning — the POSTURE half — June 2026

> **This file is deliberately short.** badge already owns SCIM end-to-end as a *mechanism* — see
> `~/badge/brain/research/raw/ecosystem-07-sso-scim-enterprise.md` and badge EXPERTISE-MAP JTBD-3.
> Re-researching webhook-signature validation or event-ordering here would VIOLATE the boundary
> (`ecosystem-00`). stamp owns only the *posture/attestation* layer that sits on top.

## The one fact that makes SCIM stamp's concern at all
- **SCIM-driven deprovisioning is "the most-tested compliance question in B2B SaaS security questionnaires above
  ~$200k contract value."** A departing employee who keeps access = failed security review = lost deal. Source
  (badge corpus, quoted): `~/badge/brain/research/raw/ecosystem-07-sso-scim-enterprise.md`
  §why-deprovisioning, citing [guptadeepak — SCIM Provisioning B2B guide](https://guptadeepak.com/ciam-compass/guides/scim-provisioning/).
- That makes deprovisioning a **compliance posture question** (does the org prove departed users lose access?),
  not just an engineering one — which is why it lands in stamp's questionnaire + access-review scope even though
  badge builds the SCIM pipe.

## What stamp owns (posture only)
1. **Deprovisioning is the load-bearing questionnaire item** — stamp ensures it's answered + proven in the
   Trust Center (`ecosystem-08`), and that the access review (`ecosystem-07`) includes "verify deprovisioning
   actually fired" as evidence (provisioning/deprovisioning records mapped to role definitions).
2. **Provisioning DRIFT detection** — the posture question "does the app's access state match the IdP's?" Out-of-
   order/dropped SCIM events cause **ghost access** (a user deleted in the IdP but still active in the app). The
   *fix* (ordered Events API, signature validation) is badge's; the *posture control* ("we periodically
   reconcile IdP vs app and attest no drift") is stamp's — it's literally an access-review line item.
3. **The SSO+SCIM-ship-together rule as a PROGRAM trigger** — stamp decides the program kicks in at ~$200k ACV
   (`ecosystem-02`); badge implements both together.

## What stamp does NOT touch (hand to badge — quote, don't duplicate)
- Webhook **signature validation** (unsigned SCIM events = attacker provisions/deprovisions arbitrary users). →
  badge `ecosystem-07` §gotchas.
- Event **ordering / delivery** guarantees (WorkOS ordered Events API as the differentiator). → badge.
- SCIM 2.0 protocol details, endpoint schemas, the vendor mechanism matrix (WorkOS/Auth0/Clerk/Frontegg/SSOJet
  clean vs smaller CIAM rough). → badge `ecosystem-07`.
- Picking the provider on $ breakpoints. → badge JTBD-2.

## stamp's stance
1. **Treat deprovisioning as a compliance control with evidence**, not just a feature: the access review must
   include "departed-user access removed within SLA," with timestamps. (Cross-ref `ecosystem-07`.)
2. **Add IdP↔app reconciliation to the quarterly review** — catch SCIM drift / ghost access before an auditor
   (or attacker) does.
3. **When the task becomes "the SCIM webhook is dropping events" or "validate the signature" — STOP and route
   to badge.** That's mechanism, not posture.

## Sources
- Internal (quoted): ~/badge/brain/research/raw/ecosystem-07-sso-scim-enterprise.md (badge corpus, accessed 2026-06-16)
- Internal: ~/badge/brain/EXPERTISE-MAP.md JTBD-3
- https://guptadeepak.com/ciam-compass/guides/scim-provisioning/ (via badge corpus citation)
- stamp cross-refs: ecosystem-02 (program), ecosystem-07 (access-review evidence), ecosystem-08 (questionnaire)
