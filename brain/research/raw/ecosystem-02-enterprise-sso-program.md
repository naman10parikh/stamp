---
title: "The enterprise-SSO PROGRAM (buyer-readiness, the 'SSO tax' debate) — June 2026"
type: research
domain: compliance
topic: enterprise SSO as a program (not a protocol)
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [sso, sso-tax, enterprise-readiness, scim, workos, deal-blocker, program]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-03-scim-provisioning-posture]]", "[[ecosystem-08-pentest-questionnaires]]"]
summary: "stamp owns the SSO *program* (decide we need it, price it sanely, prove it to the buyer); badge owns the SAML/OIDC *mechanism*. The defining 2026 debate is the 'SSO tax' — gating SSO behind enterprise tiers is widely condemned as taxing a security control (Railway 9,900%, HubSpot 5,000%). stamp's stance: ship SSO+SCIM as a deal-blocker >~$200k ACV, but DON'T gate basic SSO punitively."
---

# Enterprise SSO — the PROGRAM, not the protocol — June 2026

> **Boundary (quote it):** badge owns the SAML/OIDC + SCIM *mechanism* — the connection, the 7-step SAML
> triage runbook, webhook-signature validation, event ordering (badge `ecosystem-07`, EXPERTISE-MAP JTBD-3/7).
> **stamp owns the PROGRAM** — the buyer-readiness wrapper: *do we need SSO to close this deal, what do we
> charge for it, what does the CISO demand, and how do we prove it.* When the task becomes "make the SAML
> work," stamp hands to badge. This file is the program half; it does NOT re-document SAML internals.

## The mental model badge already gave us (carried, not re-derived)
- **SSO ≠ SCIM, both required, ship together.** SSO = login-time trust with the enterprise IdP; SCIM 2.0 =
  lifecycle (auto-provision + **deprovision**). Source (badge corpus): `~/badge/brain/research/raw/ecosystem-07-sso-scim-enterprise.md` §mental-model.
- **SCIM deprovisioning is "the most-tested compliance question in B2B SaaS security questionnaires above
  ~$200k contract value."** A departing employee who keeps access = failed review = lost deal. Source (badge
  corpus): same file §why-deprovisioning. stamp inherits this as the trigger for *when the program kicks in*.

## THE defining 2026 debate: the "SSO tax"
This is the most contested take in the whole enterprise-readiness space and stamp must hold a clear stance.

### The case AGAINST gating (sso.tax / SSO Wall of Shame)
- Thesis (verbatim): *"SSO is a core security requirement for any company with more than five employees. Some
  vendors exploit this. They offer competitive starter plans and gate SSO behind an 'Enterprise' paywall
  bundled with unnecessary features or large minimum seat counts."* Source: [sso.tax](https://sso.tax/) (accessed 2026-06-16).
- *"This pricing strategy punishes growing businesses and encourages dangerous security shortcuts."* (sso.tax)
- **The egregious multipliers (memorize a few — they win the argument):** Railway **9,900%** ($20→$2,000);
  ReadMe 2,930% ($99→$3,000); Coursera 2,400% ($1,995→$49,875/yr); Mixpanel 4,065%; n8n 1,500%; **HubSpot
  5,000%** ($15/mo→$1,500/mo). sso.tax documents **200+ vendors** with triple-digit SSO markups. Sources:
  [sso.tax](https://sso.tax/); [1Password — backlash to the SSO tax](https://1password.com/blog/explaining-the-backlash-to-the-sso-tax) (accessed 2026-06-16).
- The killer rhetorical question (Rob Chahin, SSO Wall of Shame creator): *"If your SSO pricing is 3x your base
  pricing, are you telling me that 2/3 of the cost of your product is just keeping the SAML going? Doesn't seem
  reasonable to me."* Source: [1Password](https://1password.com/blog/explaining-the-backlash-to-the-sso-tax).
- Empirical: **80% of SaaS apps employees use lack SSO** (Grip research), "primarily due to licensing costs,
  not technical limitations." CISO Ed Contreras (Frost Bank) called the SSO tax *"an atrocity ... security
  infrastructure is too important to be priced as a luxury."* Source: [1Password](https://1password.com/blog/explaining-the-backlash-to-the-sso-tax).

### The case FOR (the honest vendor counter)
- **Real engineering burden on the long tail:** "Supporting Google/Microsoft SSO is straightforward, but
  supporting whatever wonky homebuilt some large enterprises use is a huge time sink" (Klaas Pieter Annema,
  Sketch). Source: [1Password](https://1password.com/blog/explaining-the-backlash-to-the-sso-tax).
- **The "spicy take" defense:** including SSO in cheap tiers is wasted on tiny businesses that can't afford
  SSO platforms anyway; tiering it funds enterprise support. Source: [LinkedIn — "SSO tax isn't a bad thing"](https://www.linkedin.com/posts/kane-n_spicy-take-sso-tax-isnt-a-bad-thing-activity-7237580278825656320-pEav) (accessed 2026-06-16).
- **The candid admission (the real reason):** Ben Orenstein (Tuple CEO): charge "2–5x your normal pricing" for
  SSO because "SSO costs close to nothing after a little automation, so this price increase is all profit" —
  he admits it "always felt a little gray hat." Source: [1Password](https://1password.com/blog/explaining-the-backlash-to-the-sso-tax).

### stamp's STANCE (taste, defendable)
1. **SSO is a security control, not a feature.** For an Energy-built product, **basic SSO (Google/Microsoft/
   Okta OIDC) should NOT be gated punitively.** Offer it on a reasonable tier; do not 9,900% it. This is both
   ethically right and a 2026 buyer expectation — putting your own product on the SSO Wall of Shame is a brand
   risk.
2. **You MAY tier the expensive parts:** SCIM provisioning, custom/legacy IdP onboarding, the hosted IT-admin
   portal, audit-log export — these carry genuine support cost (the Sketch/Annema point). Tier those, not the
   login.
3. **The program triggers at ~$200k ACV** (badge's number): below it, SSO is "nice"; at/above it, SSO+SCIM are
   **deal-blockers** — and SCIM **deprovisioning** is the single most-tested questionnaire item.
4. **Sequence:** decide-need (stamp) → price-sanely (stamp) → implement SAML/OIDC+SCIM (**badge**) → prove to
   buyer via Trust Center + questionnaire (stamp, `ecosystem-08`).

## The buyer-readiness checklist (what a CISO demands before signing — stamp's deliverable)
This is the *program* artifact stamp produces; the mechanism rows hand to badge.
| Demand | Owner | Notes |
|---|---|---|
| SAML 2.0 **and** OIDC login | **badge** | support both — enterprises standardize on one (OIDC vs SAML decision: [Clerk 2026 guide](https://clerk.com/articles/oidc-vs-saml-for-enterprise-sso-a-2026-decision-guide)) |
| SCIM 2.0 inbound provisioning **+ deprovisioning** | **badge** (mechanism) / **stamp** (it's the #1 questionnaire item) | deprovisioning is the load-bearing one |
| IT-admin self-serve portal (configure their own IdP) | badge mechanism / stamp program | WorkOS Admin Portal is the reference |
| Audit logs exportable to their SIEM | **stamp** (`ecosystem-04`) | OTel/Splunk/Datadog export |
| RBAC scoped to enterprise groups | **badge** (enforcement) / **stamp** (the access-review attestation, `ecosystem-07`) | |
| Data residency (region pinning) | **stamp** (`ecosystem-05`) | EU/US/India |
| SOC 2 Type II / ISO 27001 report on demand | **stamp** (`ecosystem-01`) | via Trust Center |
| Completed security questionnaire (SIG/CAIQ) | **stamp** (`ecosystem-08`) | the recurring tax |
| Signed DPA + sub-processor list | **stamp** (`ecosystem-06`) | |
| Pen-test summary letter | **stamp** (`ecosystem-08`) | |

> Anthropic's own enterprise surface is the canonical reference for "what a 10,000-seat buyer demands":
> **Cowork Enterprise (GA April 9, 2026)** shipped exactly this set — "SCIM auto-provisioning from
> Okta/Azure AD/Google Workspace, RBAC scoped to per-group permissions, Group Spend Limits, OpenTelemetry
> export to Splunk/Datadog/New Relic, Per-Tool Connector Controls, and an Analytics API." Source:
> `~/energy/docs/vision/the_complete_story.md` L222 (Energy corpus, quoting Anthropic Cowork GA).

## Who delivers the SSO mechanism well (defer detail to badge; program-level summary only)
- **WorkOS AuthKit** — the reference enterprise-readiness platform; 1M MAU free but **SSO/SCIM are PAID**
  (~$125/connection/mo). Its ordered Events API for SCIM is a genuine differentiator. (badge `ecosystem-07`.)
- **Auth0/Okta** — breadth + certs, but SSO gated behind expensive enterprise (~$800–1,500+/mo). (badge.)
- **Clerk** — SAML + EASIE + SCIM as PAID add-ons; org-first B2B. (badge.)
- **Better Auth** — SSO via plugins, you carry the SCIM ordering/signature burden. (badge.)
- stamp does NOT pick among these on $ breakpoints — that's badge's JTBD-2. stamp decides *whether the program
  is triggered* and *what the buyer must see*.

## Sources
- https://sso.tax/ (accessed 2026-06-16)
- https://1password.com/blog/explaining-the-backlash-to-the-sso-tax (accessed 2026-06-16)
- https://www.idsalliance.org/blog/avoid-the-sso-tax-stay-secure-without-paying-more/ (accessed 2026-06-16)
- https://www.linkedin.com/posts/kane-n_spicy-take-sso-tax-isnt-a-bad-thing-activity-7237580278825656320-pEav (accessed 2026-06-16)
- https://clerk.com/articles/oidc-vs-saml-for-enterprise-sso-a-2026-decision-guide (accessed 2026-06-16)
- Internal: ~/badge/brain/research/raw/ecosystem-07-sso-scim-enterprise.md; ~/energy/docs/vision/the_complete_story.md L222
