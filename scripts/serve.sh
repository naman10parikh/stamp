#!/usr/bin/env bash
# scripts/serve.sh — launch the stamp cockpit (G1, the local cockpit; PLAN §10; MASTER-TODOS G1).
#
# The cockpit is a zero-dependency Node stdlib server (cockpit/server.mjs) + a vanilla-JS SPA
# (cockpit/index.html + cockpit/app.js + cockpit/styles.css). No build step for the SPA. The
# cockpit is READ-MOSTLY — it shells the read-only stamp verbs (`stamp audit`/`sso-plan`/`advise`),
# searches brain/**.md via scripts/brain-search.sh, and reads logs/runs.jsonl + eval/golden-tasks.json.
# It is the CHAIRMAN's eyes (agents use the CLI/MCP); it never mutates, and visibly never says
# "compliant" — it hands the enforcement MECHANISM to badge.
#
# Usage: bash scripts/serve.sh             # serves on http://127.0.0.1:7799
#        STAMP_COCKPIT_PORT=8080 bash scripts/serve.sh
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${STAMP_COCKPIT_PORT:-7799}"

# The ask-the-employee + eval views shell the compiled CLI (dist/cli/index.js via bin/stamp). Warn
# (don't fail) if dist/ is absent so the chairman knows to build — the server still boots and the
# data endpoints return an honest JSON error until then (the SPA shell itself always serves).
if [ ! -f "$REPO/dist/cli/index.js" ]; then
  echo "stamp: dist/ not built — ask-the-employee + eval views will error until you run: pnpm build" >&2
fi

echo "stamp cockpit → http://127.0.0.1:${PORT}  (Ctrl-C to stop)"
exec node "$REPO/cockpit/server.mjs"
