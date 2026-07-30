import { describe, expect, it, vi } from "vitest";
import { getEnvVar } from "./env";

describe("getEnvVar", () => {
  it("prefers process environment values over fallback defaults", () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://system.example");

    expect(getEnvVar("VITE_API_BASE_URL", "https://fallback.example")).toBe(
      "https://system.example"
    );
  });

  it("falls back to the provided default when no value is present", () => {
    vi.unstubAllEnvs();

    expect(getEnvVar("VITE_API_BASE_URL", "https://fallback.example")).toBe(
      "https://fallback.example"
    );
  });
});
