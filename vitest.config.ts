import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit/integration/contract tests live in test/; Cluster E adds structural
    // assertions under eval/. Both are red-blocking in CI per qa-zero-tolerance.
    include: ["test/**/*.test.ts", "eval/**/*.test.ts"],
    environment: "node",
    globals: false,
  },
});
