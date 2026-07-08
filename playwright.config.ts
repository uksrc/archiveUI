import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E and integration tests.
 *
 * Phase 1: Local-only setup.
 *   - Start the dev server manually before running: npm run dev
 *   - Base URL reflects the Vite dev server port + base path from vite.config.ts
 *
 * Phase 2 will introduce webServer auto-start and environment-specific configs.
 */
export default defineConfig({
  testDir: "./e2e",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source */
  forbidOnly: !!process.env.CI,

  /* No retries locally for now; CI retries can be introduced with webServer in Phase 2 */
  retries: process.env.CI ? 2 : 0,

  /* Limit parallelism locally to keep resource usage sensible */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter: HTML for local debugging, list for CI */
  reporter: process.env.CI ? "list" : [["html", { open: "never" }]],

  use: {
    /* Base URL must match Vite dev server port + base path */
    baseURL: "http://localhost:27981/archive-gui/",

    /* Capture a trace on the first retry of a failed test for easier debugging */
    trace: "on-first-retry",

    /* Capture screenshot on failure */
    screenshot: "only-on-failure",

    /* Capture video on first retry */
    video: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
