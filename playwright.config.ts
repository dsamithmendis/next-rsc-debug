import { defineConfig } from "@playwright/test";

// Overridable so the suite does not collide with another local dev server.
const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  webServer: {
    command: `pnpm --filter playground start --port ${port}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingService: !process.env.CI,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
});
