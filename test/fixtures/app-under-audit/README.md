# app-under-audit (synthetic fixture)

A small Next.js / Node app used as the deterministic target for `stamp audit` and
`stamp sso-plan` in the acceptance test. It is a recognizable, working app a startup
might run before its first compliance review:

- it has a sign-in gate (logical access control), and
- it has ordinary application logging.

It deliberately stops there — it has not yet built the deeper evidence an auditor looks
for, so `stamp audit` finds a focused set of gaps. (The fixture is kept free of the exact
phrases stamp scans for, so the gap-scan reflects what the app actually implements, not
what this note describes.)

This fixture contains **no live secrets and no real PII** — the acceptance test runs with
zero provider credentials (local-first, $0, no-creds).
