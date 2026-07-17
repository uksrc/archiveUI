import type { Page, Route } from "@playwright/test";
import type { ArchiveSearchResponseFixture } from "./archive-fixtures";

type ArchiveSearchHandler = (
  route: Route,
  requestUrl: URL
) => Promise<void> | void;

export type ArchiveSearchMockControl = {
  seenRequestUrls: string[];
  dispose: () => Promise<void>;
};

const ARCHIVE_SEARCH_GLOB = "**/archive/search**";

/**
 * Intercepts archive search requests and fulfills with fixture JSON.
 */
export async function mockArchiveSearch(
  page: Page,
  fixture: ArchiveSearchResponseFixture,
  status = 200
): Promise<ArchiveSearchMockControl> {
  const seenRequestUrls: string[] = [];

  const handler = async (route: Route): Promise<void> => {
    seenRequestUrls.push(route.request().url());
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(fixture),
    });
  };

  await page.route(ARCHIVE_SEARCH_GLOB, handler);

  return {
    seenRequestUrls,
    dispose: async () => {
      await page.unroute(ARCHIVE_SEARCH_GLOB, handler);
    },
  };
}

/**
 * Intercepts archive search requests with custom behavior and records URLs.
 */
export async function mockArchiveSearchWithHandler(
  page: Page,
  customHandler: ArchiveSearchHandler
): Promise<ArchiveSearchMockControl> {
  const seenRequestUrls: string[] = [];

  const handler = async (route: Route): Promise<void> => {
    const requestUrl = new URL(route.request().url());
    seenRequestUrls.push(requestUrl.toString());
    await customHandler(route, requestUrl);
  };

  await page.route(ARCHIVE_SEARCH_GLOB, handler);

  return {
    seenRequestUrls,
    dispose: async () => {
      await page.unroute(ARCHIVE_SEARCH_GLOB, handler);
    },
  };
}
