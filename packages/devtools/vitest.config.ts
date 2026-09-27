import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
    environment: "jsdom",
    testTimeout: 10000,
    setupFiles: ["@testing-library/jest-dom/vitest"],
  },
});