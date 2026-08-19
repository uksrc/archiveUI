import { expect, test } from "@playwright/test";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:8080";
const SEED_TARGET = "0955+696";

test("archive API is available", async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/archive/`, {
    timeout: 30_000,
  });

  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain("Archive Service Login");
});

test("seeded archive data can be retrieved by query", async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/archive/search?target=${encodeURIComponent(SEED_TARGET)}`, {
    timeout: 30_000,
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty("observations");
  expect(Array.isArray(body.observations)).toBe(true);
  expect(body.observations.length).toBeGreaterThan(0);

  const firstObservation = body.observations[0];
  expect(firstObservation).toMatchObject({
    target: expect.objectContaining({
      name: SEED_TARGET,
    }),
  });
});
