# stamp — LEARNINGS (append-only)

Every error → root cause → rule. Auto-compressed when >500 lines (memory-compress.sh).

## 2026-06-22 · Under pipefail, a grep that may not match needs `|| true`

- **What broke:** the first `scripts/brain-search.sh` run printed nothing.
- **Root cause:** `set -o pipefail` made `tf=$(grep … | wc -l)` return 1 on the first term with no match, and
  `set -e` ended the script.
- **Rule:** inside `$()` under `pipefail`, write `{ grep … || true; } | wc -l` for any grep that may legitimately
  match nothing. Do not mute a broken pipe from a `head`-fed producer with `trap '' PIPE`: it keeps the loop running
  past the closed pipe and multiplies the errors.

## 2026-06-22 · In a `"type": "module"` repo, every `.js` hook must be an ES module

- **What broke:** the first `compliance-lint.js` exited 0 on a real violation, a silent false pass.
- **Root cause:** it used `require`, which throws in an ES module; a `try/catch` around reading stdin swallowed the
  error, so the hook linted empty input.
- **Rule:** hooks here use `import`; run each hook's verify line (pipe a known violation, expect exit 2) before
  calling it done. The inherited CommonJS hooks in `.claude/hooks/` would fail the same way; none of them is wired.

## 2026-06-22 · A substring guard cannot tell a description from code

- **What broke:** the acceptance check that `sso-plan` emits no SAML code failed on the plan's own prose, which
  named the "ACS" endpoint as badge's work.
- **Root cause:** the guard is a plain `grep -E 'ACS|SAMLResponse|<saml|samlp:…'` over the JSON; it cannot read
  intent.
- **Rule:** keep code tokens out of plan prose ("the assertion-consumer endpoint", not "ACS"), and keep the guard
  dumb and strict. The same holds for gates like "no commented-out cron": keep the literal token out of nearby
  comments.

## 2026-06-30 · A scheduled workflow needs its own toolchain

- **What broke:** the nightly `stamp RSI` workflow failed every night in about ten seconds.
- **Root cause:** its eval step builds `dist/` with `pnpm build`, but `rsi.yml` never set up Node or pnpm, unlike
  `ci.yml` and `acceptance.yml`.
- **Rule:** every workflow that runs the evals sets up Node and pnpm and builds first; check the scheduled runs, not
  only the push runs, after changing the loop.

## 2026-10-19 · An npx bin is a symlink: resolve it before a main-module check

- **What broke:** `stamp-mcp` started through a symlink, as npx does from `node_modules/.bin`, exited at once with
  no server.
- **Root cause:** the start guard compared the raw `process.argv[1]` (the symlink) with the module's real path.
- **Rule:** compare `realpathSync(process.argv[1])` with `fileURLToPath(import.meta.url)`, put a shebang on every
  bin target, and prove each bin through `npx -y -p github:naman10parikh/stamp <bin>` from an empty folder.

## 2026-10-19 · A skill's frontmatter must be valid YAML

- **What broke:** `claude plugin validate .` failed on all six skills: "YAML frontmatter failed to parse", so at
  runtime each skill would load with empty metadata and no description for an agent to match on.
- **Root cause:** `trigger: "a", "b", "c"` is not YAML; a comma after a quoted scalar is a syntax error.
- **Rule:** write lists in frontmatter as `trigger: ["a", "b", "c"]`, and run `claude plugin validate .` after any
  skill edit.
