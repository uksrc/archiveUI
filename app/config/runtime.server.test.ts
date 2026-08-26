// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { getPublicRuntimeConfig, getRuntimeConfig } from "./runtime.server";

const ORIGINAL_ENV = process.env;

function setRequiredRuntimeEnv() {
  process.env.SERVICE_HOST_URL = "https://service.example";
  process.env.OIDC_SERVER_URL = "https://oidc.example";
  process.env.OIDC_CLIENT_ID = "client-id-123";
  process.env.OIDC_AUTH_CALLBACK = "https://service.example/archive-gui/auth/callback";
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("runtime.server", () => {
  it("returns runtime config when required env vars are present", () => {
    setRequiredRuntimeEnv();

    expect(getRuntimeConfig()).toEqual({
      SERVICE_HOST_URL: "https://service.example",
      OIDC_SERVER_URL: "https://oidc.example",
      OIDC_CLIENT_ID: "client-id-123",
      OIDC_AUTH_CALLBACK: "https://service.example/archive-gui/auth/callback",
    });
  });

  it("throws a helpful error when required SERVICE_HOST_URL is missing", () => {
    setRequiredRuntimeEnv();
    delete process.env.SERVICE_HOST_URL;

    expect(() => getRuntimeConfig()).toThrow(
      "Missing required environment variable: SERVICE_HOST_URL"
    );
  });

  it("returns only the public runtime keys", () => {
    setRequiredRuntimeEnv();
    process.env.EXTRA_SECRET = "do-not-expose";

    expect(getPublicRuntimeConfig()).toEqual({
      SERVICE_HOST_URL: "https://service.example",
      OIDC_SERVER_URL: "https://oidc.example",
      OIDC_CLIENT_ID: "client-id-123",
      OIDC_AUTH_CALLBACK: "https://service.example/archive-gui/auth/callback",
    });
    expect(getPublicRuntimeConfig()).not.toHaveProperty("EXTRA_SECRET");
  });
});
