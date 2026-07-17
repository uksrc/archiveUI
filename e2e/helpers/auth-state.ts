import type { Page } from "@playwright/test";

type AssumedAuthOptions = {
  authority?: string;
  clientId?: string;
  accessToken?: string;
  expiresInSeconds?: number;
  profile?: Record<string, unknown>;
};

const DEFAULT_AUTHORITY = "https://ska-iam.stfc.ac.uk/";
const DEFAULT_CLIENT_ID = "8d30b7d8-af03-4d0d-82ef-ce9cfc60964d";

/**
 * Clears browser auth state to force unauthenticated behavior.
 */
export async function clearBrowserAuthState(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

/**
 * Seeds local storage with an oidc-client-ts user object so UI tests can
 * assume auth is already established and focus on non-auth integration flows.
 */
export async function seedAssumedAuthenticatedState(
  page: Page,
  options: AssumedAuthOptions = {}
): Promise<void> {
  const authority = options.authority ?? process.env.E2E_OIDC_AUTHORITY ?? DEFAULT_AUTHORITY;
  const clientId = options.clientId ?? process.env.E2E_OIDC_CLIENT_ID ?? DEFAULT_CLIENT_ID;
  const accessToken = options.accessToken ?? "e2e-assumed-access-token";
  const expiresInSeconds = options.expiresInSeconds ?? 60 * 60;
  const key = `oidc.user:${authority}:${clientId}`;

  const now = Math.floor(Date.now() / 1000);
  const user = {
    id_token: "e2e-id-token",
    session_state: "e2e-session",
    access_token: accessToken,
    token_type: "Bearer",
    scope: "openid profile email",
    profile: {
      sub: "e2e-user",
      name: "E2E User",
      ...options.profile,
    },
    expires_at: now + expiresInSeconds,
  };

  await page.context().clearCookies();
  await page.addInitScript(
    ({ storageKey, userJson }) => {
      const localKeys = Object.keys(window.localStorage);
      for (const existingKey of localKeys) {
        if (existingKey.startsWith("oidc.")) {
          window.localStorage.removeItem(existingKey);
        }
      }

      window.localStorage.setItem(storageKey, JSON.stringify(userJson));
      window.sessionStorage.setItem("e2e.assumedAuth", "1");
    },
    { storageKey: key, userJson: user }
  );
}
