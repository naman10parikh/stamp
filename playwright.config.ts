import { defineConfig, devices } from "@playwright/test";

// Playwright config — drives the stamp COCKPIT only (PLAN §9 E2E; MASTER-TODOS G2).
// Scoped to test/e2e/ so it never collides with the Vitest suite (test/**/*.test.ts +
// eval/**/*.test.ts — vitest.config.ts). Our specs are *.spec.ts; vitest only globs *.test.ts.
//
// `webServer` boots the real stdlib cockpit (node cockpit/server.mjs) on :7799 before the
// tests and tears it down after — no manual server lifecycle. The cockpit shells out to the
// built CLI, so CI must `pnpm build` before `pnpm exec playwright test` (the acceptance/CI
// jobs already build). reuseExistingServer keeps a local dev server if one is already up.

export default defineConfig({
  testDir: "test/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "line" : "list",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:7799",
    headless: true,
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node cockpit/server.mjs",
    url: "http://127.0.0.1:7799",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
