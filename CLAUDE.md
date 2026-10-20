@AGENTS.md

# stamp: Claude Code notes

[AGENTS.md](AGENTS.md), imported above, is the one source of instructions for every coding agent. This file adds
only what Claude Code uses. Persona: `identity/SOUL.md`.

## MCP servers

- **`.mcp.json`** is safe for anyone who clones the repository: stamp's own server from GitHub through npx, and
  context7. No secrets, no local paths.
- **`.mcp.dev.json`** holds the maintainer's set: `stamp-local` (the built `dist/mcp/server.js`, so run
  `pnpm build` first), `github` (needs `GITHUB_PERSONAL_ACCESS_TOKEN`), and `memory` and `obsidian` (paths
  relative to this repository). Load it with `claude --mcp-config .mcp.dev.json`; add `--strict-mcp-config` to load
  only that set. stamp's server reads no credentials.

## Hooks

`.claude/settings.json` wires `.claude/hooks/compliance-lint.js` as a `PreToolUse` hook on `Write|Edit|MultiEdit`.
It exits 2, which blocks the edit, on a "we are compliant" claim before an auditor signs, an AI-only pen test
presented as the SOC 2 pen test, an access revoke with no human approval, or a secret in the text. stamp's own
prose that names these patterns in order to refuse them passes. The plugin ships the same hook through
`hooks/hooks.json`. `package.json` sets `"type": "module"`, so every `.js` hook here must be an ES module.

## Sub-agents

- `.claude/agents/stamp-soc2-gap-auditor.md`: a full SOC 2 control-by-control gap scan of a repository, in a fresh
  context.
- `.claude/agents/stamp-dsar-handler.md`: a privacy request from intake to a routed reply that a person signs.

The other files in `.claude/` (generic personas, skills, commands, rules and session hooks) came from the Energy
template; only the two above and `compliance-lint.js` are stamp's own.

## Operating model

Act, don't ask. Never give up — when a tool fails, try a lateral approach. Self-improve every session. Test as a
user. Inherited rules in `.claude/rules/` are glob-loaded every session. RSI is deterministic + $0 now (the Claude
half lights up when `CLAUDE_CODE_OAUTH_TOKEN` is set — D8).
