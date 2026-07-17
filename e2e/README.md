# E2E Integration Harness

This folder now supports two non-auth integration tiers:

- Mocked API tier: primary coverage for UI-to-API wiring, deterministic and fast
- Real API tier: smaller contract checks against a running backend

Authentication testing is intentionally out of scope for these integration specs.

## Suggested file layout

- `e2e/smoke.spec.ts` for lightweight app-shell checks
- `e2e/auth-redirect.spec.ts` for auth flow checks only
- `e2e/mocked/*.spec.ts` for mocked integration tests
- `e2e/contract/*.spec.ts` for real API contract checks
- `e2e/helpers/*` for shared setup, fixtures, and mocks

## Shared helpers

- `helpers/auth-state.ts`
  - `clearBrowserAuthState(page)`: force unauthenticated browser state
  - `seedAssumedAuthenticatedState(page, options?)`: pre-seed local storage with OIDC user state so tests can focus on non-auth flows
- `helpers/archive-fixtures.ts`
  - deterministic archive search fixtures (`singleObservation`, `twoObservations`, `empty`)
- `helpers/archive-mocks.ts`
  - `mockArchiveSearch(page, fixture, status?)`
  - `mockArchiveSearchWithHandler(page, customHandler)`
  - both record request URLs and expose `dispose()` for cleanup

## Example usage pattern

1. Seed assumed auth state for non-auth tests.
2. Route-stub `/archive/search` using shared fixture helper.
3. Navigate to app route and assert rendered results plus outbound request URL details.
4. Dispose route interception at end of test.

## Run commands (WSL)

- `wsl.exe -d Debian bash -lc "cd /home/benjamin/Development/UKSRC/github/archiveUI && npm run e2e"`
- `wsl.exe -d Debian bash -lc "cd /home/benjamin/Development/UKSRC/github/archiveUI && npx playwright test e2e/<spec-file> --project=chromium"`
