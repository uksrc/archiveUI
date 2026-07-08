import { test, expect } from "@playwright/test";

/**
 * Smoke tests — verify the app loads and core pages are reachable.
 * These run against a locally-started dev server (npm run dev).
 *
 * Phase 3 will expand these into full workflow tests with proper fixtures.
 * Auth-gated routes are not covered here; see Phase 5 for the auth strategy.
 */

test("home page loads and has expected title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/archive/i);
});

test("app shell renders without JS errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(errors).toHaveLength(0);
});
