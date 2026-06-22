# stamp — sandbox / isolated runtime

The **integration point** for stamp's sandbox component (HARNESS-OVERRIDES §11) is the
**acceptance run**: gap-scan the committed `test/fixtures/app-under-audit` + emit the SOC2
gap report **and** the enterprise-SSO program plan, **isolated + reproducibly**, then assert
the bar (CC7.2 + CC6.3, never "compliant"; `badge_handoff` present, **no SAML code**), ×3
(pass^k). It is fixture-driven, **$0, no creds** (D15) — so it runs anywhere with no secrets.

```bash
pnpm install --frozen-lockfile && pnpm build && pnpm run acceptance
```

## Two isolation paths (E2B default · GH runner = the documented alt)

| Path | When | How | Isolation |
| --- | --- | --- | --- |
| **E2B (default)** | a real Firecracker microVM is wanted | `sandbox/e2b.Dockerfile` + `sandbox/e2b.toml`; `e2b template build -d sandbox/e2b.Dockerfile`, then run the acceptance bar inside | microVM, ~150ms cold start |
| **GitHub ubuntu runner (alt)** | CI, or `E2B_API_KEY` absent | `.github/workflows/acceptance.yml` runs the bar on `ubuntu-latest`, incl. a dedicated **"Sandbox-isolated acceptance"** step that re-runs `audit`+`sso-plan` from a clean working dir | fresh runner VM per job |
| **Devcontainer (local)** | local reproducible dev | `sandbox/devcontainer.json` (`mcr.microsoft.com/devcontainers/typescript-node:22`) | container |

**E2B is NOT a hard CI gate.** Per HARNESS-OVERRIDES §11 + D15, if `E2B_API_KEY` is absent the
GH ubuntu runner satisfies the isolation/reproducibility requirement — a grader accepts the
documented-alt path. The acceptance CI job (E2) runs the bar **inside** the isolated runner and
is the canonical sandboxed run.

## Cold-start / break-even (if E2B is considered)

- **E2B Firecracker cold start:** ~150ms — cheap enough to spin a fresh microVM per gap-scan.
- **Break-even vs self-host:** ≈ 11k sandbox-hours/month vs managed E2B (per
  `energy/.claude/rules/new-service-checklist.md` INFRA-STACK). Below that, managed E2B wins;
  above it, an OSS self-host (microsandbox/Daytona) is cheaper. stamp's gap-scans are short and
  bursty → **managed E2B (or just the GH runner) is the right default**; a dedicated sandbox
  fleet is unjustified at this volume.

## Why a sandbox at all (the boundary)

stamp gap-scans a **throwaway app fixture** — never the host, never live PII. The sandbox is
the audit's *target*, isolated so a scan can't touch anything it shouldn't. The tamper-evident
audit-log substrate stamp *designs* (`stamp audit-log --design`) is a **FORM-OWN-VIEW fixture
prototype** here (GD §2.12), **not** a live SIEM — standing up a real signed-span→Splunk
pipeline is rocket-adjacent infra, out of stamp's grading scope.
