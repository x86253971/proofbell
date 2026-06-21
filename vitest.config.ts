import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests live next to source; e2e (Playwright) is excluded.
    include: ["src/**/*.test.ts"],
    exclude: ["tests/**", "node_modules/**"],
  },
});
