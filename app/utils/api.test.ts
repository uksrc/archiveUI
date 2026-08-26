import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiGet, fetchDataTiles, mjdSecToDate } from "./api";

describe("api utilities", () => {
  const fetchMock = vi.fn();
  const BASE_URL = "https://api.example.test";

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  describe("apiGet", () => {
    it("throws when token is missing", async () => {
      const auth = {
        user: undefined,
      } as any;

      await expect(apiGet(auth, "/archive/search", BASE_URL, undefined)).rejects.toThrow(
        "No access token available"
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("throws when API base URL is missing", async () => {
      const auth = {
        user: { access_token: "token-missing-base" },
      } as any;

      await expect(apiGet(auth, "/archive/search", "", undefined)).rejects.toThrow(
        "API base URL is not defined"
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("throws on 401 response", async () => {
      const auth = {
        user: { access_token: "token-401" },
      } as any;

      fetchMock.mockResolvedValue({
        status: 401,
        ok: false,
        json: vi.fn(),
      });

      await expect(apiGet(auth, "/archive/search", BASE_URL, undefined)).rejects.toThrow(
        "Unauthorised: token missing, expired, or rejected"
      );
    });

    it("throws on 403 response", async () => {
      const auth = {
        user: { access_token: "token-403" },
      } as any;

      fetchMock.mockResolvedValue({
        status: 403,
        ok: false,
        json: vi.fn(),
      });

      await expect(apiGet(auth, "/archive/search", BASE_URL, undefined)).rejects.toThrow(
        "Forbidden: token valid but insufficient permissions"
      );
    });

    it("throws on other non-ok response", async () => {
      const auth = {
        user: { access_token: "token-500" },
      } as any;

      fetchMock.mockResolvedValue({
        status: 500,
        ok: false,
        json: vi.fn(),
      });

      await expect(apiGet(auth, "/archive/search", BASE_URL, undefined)).rejects.toThrow(
        "API request failed: 500"
      );
    });

    it("returns parsed json on success", async () => {
      const auth = {
        user: { access_token: "token-ok" },
      } as any;
      const payload = { observations: [{ id: "obs-1" }] };

      fetchMock.mockResolvedValue({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      });

      const result = await apiGet(auth, "/archive/search", BASE_URL, undefined);

      expect(result).toEqual(payload);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.test/archive/search",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
            Authorization: "Bearer token-ok",
          }),
        })
      );
    });

    it("normalises trailing slash in API base URL", async () => {
      const auth = {
        user: { access_token: "token-slash" },
      } as any;
      const payload = { observations: [{ id: "obs-2" }] };

      fetchMock.mockResolvedValue({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      });

      const result = await apiGet(auth, "/archive/search", "https://api.example.test/", undefined);

      expect(result).toEqual(payload);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.test/archive/search",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
            Authorization: "Bearer token-slash",
          }),
        })
      );
    });
  });

  describe("fetchDataTiles", () => {
    it("throws on non-ok response", async () => {
      fetchMock.mockResolvedValue({
        status: 503,
        ok: false,
        json: vi.fn(),
      });

      await expect(fetchDataTiles("/api/data-tiles")).rejects.toThrow("API error: 503");
    });

    it("returns json array on success", async () => {
      const payload = [
        {
          runName: "run-1",
          projectName: "project-1",
        },
      ];

      fetchMock.mockResolvedValue({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      });

      const result = await fetchDataTiles("/api/data-tiles");

      expect(result).toEqual(payload);
      expect(Array.isArray(result)).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith("/api/data-tiles", {
        headers: { Accept: "application/json" },
      });
    });
  });

  describe("mjdSecToDate", () => {
    it("returns undefined for undefined and null input", () => {
      expect(mjdSecToDate(undefined)).toBeUndefined();
      expect(mjdSecToDate(null as unknown as number)).toBeUndefined();
    });

    it("converts known MJD seconds value to unix epoch date", () => {
      // 3506716800 MJD seconds is exactly Unix epoch start.
      const result = mjdSecToDate(3506716800);

      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe("1970-01-01T00:00:00.000Z");
    });
  });
});
