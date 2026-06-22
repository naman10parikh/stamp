# stamp — Heartbeat

> stamp's compliance expertise MOVES quarterly (SOC 2 TSC revisions, ISO 27001:2022, ISO 42001, the EU-US DPF
> Schrems tail, the Vanta MCP public-beta→GA transition, SafeBase-style M&A, the `NangoHQ/nango` #6416 bug). The
> heartbeat keeps the brain current and stamp's own audit trail healthy. The deterministic loop runs $0/tokenless
> now; the Claude rewrite half lights up when `CLAUDE_CODE_OAUTH_TOKEN` is set (D8).

## Schedule

| Check | Frequency | Action on anomaly |
| --- | --- | --- |
| RSI watchlist diff (TOOL-MATRIX sources: Vanta/Drata MCP changelogs, framework revisions, DPF status, `nango` #6416, SafeBase M&A) | nightly (GH Actions `rsi.yml`) | propose a brain-file update → test-gate → commit (Claude half deferred to `CLAUDE_CODE_OAUTH_TOKEN`) |
| Eval pyramid re-run (L1 structural + the CI-blocking golden subset) | nightly + on every PR | a broken golden Resolution turns CI red → block the merge |
| Acceptance bar (`stamp audit` + `stamp sso-plan --dry-run`, ×3 pass^k) | every push / PR | non-green ⇒ stamp is not done; fix before shipping (no faked DONE) |
| Own audit trail (`logs/runs.jsonl`) integrity | every run | each line must carry an accountable `human_owner` (O9, dogfooded) — flag a line missing it |

## Health indicators

- **Healthy:** acceptance green ×3 + `npm run eval` pass N / fail 0 + the RSI watchlist diff has no un-triaged delta.
- **Warning:** a watchlist source moved (e.g. Vanta MCP beta→GA) and the brain hasn't been updated; or `runs.jsonl`
  has a line missing `human_owner`.
- **Critical:** the acceptance bar is red, OR `stamp sso-plan` emitted SAML/SCIM code / dropped the `badge_handoff`
  (the boundary-FAIL) — halt and fix before any further work.

## Recovery

1. Read the failing check (acceptance/eval/watchlist) and the last `logs/runs.jsonl` lines.
2. Check `brain/KNOWN-PITFALLS.md` (P1–P25) + `brain/BATTLE-TESTED-SCENARIOS.md` for a known fix.
3. If a spec-currency delta (Vanta MCP status, Secureframe MCP, a framework revision): re-verify at the source,
   update the brain file + `memory/MEMORY.md` spec-currency line, re-run the eval pyramid.
4. If the boundary was crossed: route the mechanism task to **badge** and restore stamp's posture-only output.
