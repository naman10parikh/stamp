# stamp sandbox — E2B Firecracker microVM image (the default isolated runtime path).
#
# Builds a reproducible env that runs stamp's acceptance integration point — gap-scan the
# committed test/fixtures/ + emit the gap report + the enterprise-SSO program plan — isolated
# from the host. E2B cold start ≈ 150ms (Firecracker microVM); break-even vs the GH-runner alt
# is noted in sandbox/README.md. E2B is NOT a hard CI gate: if E2B_API_KEY is absent, the GH
# ubuntu runner (sandbox/devcontainer.json + the acceptance.yml "sandbox-isolated" step) is the
# documented, accepted alternative for the isolation requirement (HARNESS-OVERRIDES §11; D15).
#
# Build:   e2b template build -c "node --version" -d sandbox/e2b.Dockerfile   (or per e2b.toml)
# Run bar: pnpm install --frozen-lockfile && pnpm build && pnpm run acceptance

FROM node:22-slim

# pnpm via corepack (pinned to the repo's package manager).
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /home/user/stamp

# The whole-pipeline residency note applies to stamp's OWN runtime too: no PII enters this
# sandbox — it gap-scans a synthetic fixture only. The accountable-human field defaults here.
ENV STAMP_HUMAN_OWNER=e2b-sandbox

# Source is mounted/copied at run time by the E2B SDK; the acceptance bar is the canonical run:
#   pnpm install --frozen-lockfile && pnpm build && pnpm run acceptance
