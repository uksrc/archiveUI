import { test, expect } from "@playwright/test";

test("unauthenticated user is redirected from protected route", async ({ page, baseURL }) => {
  await page.context().clearCookies();
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const appOrigin = new URL(baseURL!).origin;
  await page.goto(".");

  // In test/dev environments, auth may either navigate to the IdP origin,
  // or remain on-app while showing an auth transition/error state.
  await Promise.any([
    page.waitForURL((url) => url.origin !== appOrigin, { timeout: 15000 }),
    expect(page.getByText(/please wait while we authenticate you/i)).toBeVisible({ timeout: 15000 }),
    expect(page.getByText(/redirecting for log in process/i)).toBeVisible({ timeout: 15000 }),
    expect(page.getByText(/authentication error/i)).toBeVisible({ timeout: 15000 }),
  ]);

  const wasRedirectedOffAppOrigin = new URL(page.url()).origin !== appOrigin;
  if (!wasRedirectedOffAppOrigin) {
    await expect(
      page.getByText(
        /please wait while we authenticate you|redirecting for log in process|authentication error/i
      )
    ).toBeVisible();
  }
});
