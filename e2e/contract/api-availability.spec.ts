import { expect, test } from "@playwright/test";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:8080";

test("archive API is available", async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/archive/`, {
    timeout: 30_000,
  });

  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain("Archive Service Login");
});
