import { describe, expect, it, vi } from "vitest";
import { getEnvVar } from "~/utils/env";

describe("getEnvVar", () => {
  it("reads deployment-style OIDC keys from process env", () => {
    vi.stubEnv("OIDC_SERVER_URL", "https://oidc.example");
    expect(getEnvVar("OIDC_SERVER_URL")).toBe("https://oidc.example");
  });

  it("reads deployment-style callback key from process env", () => {
    vi.stubEnv("OIDC_AUTH_CALLBACK", "https://service.example/archive-gui/auth/callback");
    expect(getEnvVar("OIDC_AUTH_CALLBACK")).toBe("https://service.example/archive-gui/auth/callback");
  });

  it("falls back when value is missing", () => {
    vi.unstubAllEnvs();
    expect(getEnvVar("SERVICE_HOST", "https://fallback.example")).toBe("https://fallback.example");
  });
});
