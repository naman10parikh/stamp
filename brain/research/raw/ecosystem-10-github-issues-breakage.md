---
title: "Real-world breakage — GitHub issues, HN threads, postmortems (the anti-slop layer) — June 2026"
type: research
domain: compliance
topic: failure scenarios & honest breakage
researcher: ECOSYSTEM (CP123 Wave-R, stamp)
created: 2026-06-16
status: done
tags: [breakage, github-issues, hacker-news, compliance-theater, vanta, oss-grc, postmortem, anti-slop]
related: ["[[ecosystem-00-INDEX-and-boundary]]", "[[ecosystem-01-soc2-iso-automation]]", "[[ecosystem-08-pentest-questionnaires]]", "[[ecosystem-11-agent-operator-notes]]"]
summary: "Where compliance tooling actually breaks, sourced from GitHub issues + HN threads (not marketing). Three load-bearing findings: (1) the 'compliance theater' reality — auditors exist who 'sign off on anything,' and AI tools can be 'lipstick on fraud'; (2) Vanta's OAuth2 client-credentials path has a real opaque-error breakage (Nango #6416, OPEN); (3) the OSS GRC clones are real but self-hosting is hard (trycompai/comp #1705) and integration breadth is the perpetual pain (theopenlane #2318)."
---

# Real-world breakage — the anti-slop layer — June 2026

> Per the mission: GitHub issues / HN threads / postmortems OUTRANK listicles. This file is the evidence that
> the marketing pages lie by omission. Each item is a real, cited failure.

## Finding 1 — "Compliance theater" is a real, loud, named critique (HN "Delve – Fake Compliance as a Service")
The Hacker News thread [id=47444319](https://news.ycombinator.com/item?id=47444319) (accessed 2026-06-16),
sparked by a former-customer exposé alleging a YC-backed compliance startup (Delve) "provided pre-filled
compliance conclusions before conducting actual audits," is a goldmine of practitioner cynicism stamp must
internalize (and design AGAINST):
- **The auditor-will-sign-anything problem** (commenter `thraxil`): auditors who care flag suspicious reports,
  but "there are and basically always have been auditors that will sign off on anything" if paid — "the
  industry knows who they are." → A SOC 2 report is only as good as the CPA firm; a cheap "we book the audit"
  bundle can mean a rubber-stamp auditor. **stamp must vet the auditor, not just the platform.**
- **AI as "lipstick on fraud"** (`sebmellen`): the automated template language was "absurdly bad — sentences
  that make no sense," i.e., crude template-filling, not genuine assistance. → Don't trust AI-generated
  compliance prose blindly; a human must read it (the read/draft/commit gradient again).
- **Cert ≠ security** (`torginus`): a vendor with a GDPR cert "implemented [crypto] wrong on purpose" to harvest
  data yet passed a major consulting firm's audit. (`madaxe_again`): acquired a compliance-certified firm, it
  "binned all ISMS processes post-takeover — complete access remained unfixed for a year ... nobody actually
  gives a shit." → Continuous evidence (the GRC-platform model) exists precisely because point-in-time certs
  rot.
- **The legal-liability debate** (`littlestymaar` vs `BrandoElFollito`): one says boxes exist so "the dude who
  checked the box becomes legally responsible"; the counter is "no relation between checking a box and becoming
  legally responsible" in practice. → stamp's posture must be real-security-first, with the cert as a
  by-product, not the goal. (Mirrors badge's "popularity ≠ security.")
- Corroborating: [Reddit r/cybersecurity — "Why does SOC 2 feel like security theater?"](https://www.reddit.com/r/cybersecurity/comments/1fofb7k/why_does_soc_2_feel_like_security_theater/): top sentiment "SOC2 is a checkbox ... not security ... but a very lucrative business" (title/snippet via firecrawl; body unverified). The balanced view, [HN id=40564639](https://news.ycombinator.com/item?id=40564639): "Vanta/Drata are starting to build solutions somewhere in-between checkbox compliance and real security."

## Finding 2 — Vanta's OAuth2 client-credentials path breaks opaquely (the concrete, current code bug)
**`NangoHQ/nango` #6416** (OPEN, opened **2026-06-09**, in a 6,400★ repo): *"OAuth2 Client Credentials (Vanta):
provider token error masked as `unhandled_oauth2_cc_error` with empty payload."* Verbatim body:
> "When creating a connection for an `OAUTH2_CC` provider — **reproduced with Vanta** — and the token exchange
> against the provider fails, Nango returns a completely opaque error ... The underlying provider error (the
> real reason **Vanta rejected the token request**) is **logged server-side but stripped from the HTTP
> response**, so there is no way for an integrator to diagnose *why* the connection failed."
- Root cause located in `oauth.controller.ts` `OAuthController.oauth2RequestCC` (real provider error captured to
  logs, not returned). Source: `gh issue view 6416 --repo NangoHQ/nango` (accessed 2026-06-16).
- **Why it matters for a stamp agent:** this is exactly the surface stamp drives (Vanta API = OAuth2
  client_credentials, `ecosystem-11`). The failure mode is **silent/opaque token-exchange errors** — combined
  with Vanta's documented "new token revokes the previous one" behavior, a stamp agent doing parallel runs will
  hit confusing auth failures. **Operator rule: capture the server-side provider error; don't trust the
  wrapper's `unhandled_*` code; serialize token issuance per client_id.**
- Related ecosystem signals: `rajuversespace/isms-backend` #12 ("Vanta API OAuth2 client + token management" —
  someone re-implementing exactly this, marked priority-high); `fleetdm/fleet` has a `/connect-vanta`
  integration + an open issue "retrieve users via API for non-admin roles" (#21400) — the recurring "the API
  won't give me what the auditor needs" pain. Source: `gh search issues` (2026-06-16).

## Finding 3 — The OSS GRC clones are real but self-hosting is hard + integrations are the eternal pain
- **`trycompai/comp` #1705** (CLOSED, 2026-04): *"Self-hosting is difficult due to missing documentation and
  Docker configuration gaps."* → The OSS Vanta (1,636★) is genuinely buildable, but "free" hides a real ops
  cost. Confirms `ecosystem-01`'s "buy unless you have a compliance engineer."
- `trycompai/comp` real authz bugs: #203 "**Policies can be edited in the employee portal**" (a compliance
  tool with a privilege bug — the irony, and the lesson: even compliance software needs badge-style authz);
  #205 "How to remove employee, right now ya can't." Source: `gh search issues --repo trycompai/comp`.
- **`theopenlane/core` #2318** (OPEN): "[Feature Request] **Expand Integrations**" and #2342 (CLOSED) Authentik
  Directory Sync. → Even the well-built OSS engine's #1 ask is *more integrations* — the integration-breadth
  moat that makes Vanta worth $20K is exactly what the clones can't match. #284 (CLOSED): "Update API key
  generation to use **argon2id**" — a real security-posture fix in the OSS tool (good hygiene, also proof the
  clones ship insecure defaults until someone files it). Source: `gh search issues --repo theopenlane/core`.

## Finding 4 — Acquisitions reshape the landscape (verify your vendor isn't being absorbed)
- **Drata acquired SafeBase for $250M (Feb 12, 2025)** — Drata now owns the leading standalone Trust Center.
  Source: [TechCrunch](https://techcrunch.com/2025/02/12/security-compliance-firm-drata-acquires-safebase-for-250m/); [Drata — Acquiring SafeBase](https://drata.com/blog/acquiring-safebase) (accessed 2026-06-16). → If you pick SafeBase as a "neutral" Trust Center, know it's now Drata. (Corrects the "flagged" note in `ecosystem-08`.)
- Auth0 is Okta; the consolidation pattern (badge corpus) repeats in GRC. Verify independence before betting on a "neutral" tool.

## Finding 5 — The pen-test rejection (re-stated here because it's the #1 anti-slop trap for an agent fleet)
- Auditors **reject AI-only / scanner-only pentests** — "they want human-driven, adversarial testing." An
  agent-native company's reflex ("we'll just run an AI red-team") fails the SOC 2 pen-test control. Source:
  [Netragard](https://netragard.com/blog/soc-2-penetration-testing-requirements/) (`ecosystem-08`).

## The distilled anti-slop rules (what marketing pages WON'T tell you)
1. **The platform is commoditized** ("Shasta in 8.5 days" with Claude Code; `trycompai/comp` at 1,636★) — the
   moat is the **auditor network + maintained integrations + the answer-KB**, not the CRUD.
2. **Vet the auditor, not just the tool** — a rubber-stamp CPA makes the whole report worthless (HN thread).
3. **Vanta API auth fails opaquely** — capture provider errors, serialize token issuance per client_id (Nango #6416).
4. **OSS GRC = real ops cost** — self-hosting `comp` is hard; "free" ≠ free (comp #1705).
5. **Integration breadth is the perpetual pain** — even OpenLane's #1 ask (theopenlane #2318); it's why
   incumbents charge.
6. **AI auto-answer / AI-pentest must be human-verified** — auditors reject AI-only pentests; AI compliance
   prose can be "lipstick on fraud."
7. **Verify vendor independence** — SafeBase→Drata, Auth0→Okta; "neutral" tools get acquired.

## Caveats on sourcing
- Reddit bodies could NOT be fetched (WebFetch blocks reddit.com; firecrawl returns "site not supported"). The
  two Reddit items here ("Delve OSS competitor / Shasta," "SOC2 security theater") are **title+snippet only via
  firecrawl_search** — flagged as unverified bodies. GAP: confirm via an authenticated browser if precision is
  needed (see GAPS-AND-DISPUTES).
- SaaS-tool breakage (Vanta/Drata UX, billing, renewal) lives mostly in private forums / G2 / Reddit, not
  GitHub issues — so GitHub under-samples it; HN threads partially fill the gap.

## Sources
- https://news.ycombinator.com/item?id=47444319 (accessed 2026-06-16)
- https://news.ycombinator.com/item?id=40564639 (accessed 2026-06-16)
- `gh issue view 6416 --repo NangoHQ/nango` (accessed 2026-06-16)
- `gh search issues --repo trycompai/comp` ; `--repo theopenlane/core` ; "Vanta API token" (accessed 2026-06-16)
- https://techcrunch.com/2025/02/12/security-compliance-firm-drata-acquires-safebase-for-250m/ (accessed 2026-06-16)
- https://drata.com/blog/acquiring-safebase (accessed 2026-06-16)
- https://netragard.com/blog/soc-2-penetration-testing-requirements/ (accessed 2026-06-16)
- https://www.reddit.com/r/cybersecurity/comments/1fofb7k/why_does_soc_2_feel_like_security_theater/ (title/snippet only — body unverified)
- https://www.reddit.com/r/SaaS/comments/1sejdsh/i_built_an_opensource_competitor_to_delve/ (title/snippet only — body unverified)
