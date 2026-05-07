import type { DataTileDataType } from "~/objects/Objects";
import type { AuthContextProps } from "react-oidc-context";

export async function apiGet(
  auth: AuthContextProps,
  path: string,
  signal?: AbortSignal
) {
  const token = auth.user?.access_token;

  if (!token) {
    throw new Error("No access token available");
  }

  const response = await fetch(`http://localhost:8080${path}`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("Unauthorised: token missing, expired, or rejected");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: token valid but insufficient permissions");
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchDataTiles(apiUrl = "/api/data-tiles"): Promise<DataTileDataType[]> {
  const res = await fetch(apiUrl, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json as DataTileDataType[];
}

/**
 * Converts MJDSec (Modified Julian Day in seconds) to a JavaScript Date
 * MJD epoch is November 17, 1858
 * Unix epoch is January 1, 1970 (40587 days later)
 * @param mjdSec - Time in Modified Julian Day seconds
 * @returns JavaScript Date object, or undefined if input is undefined/null
 */
export function mjdSecToDate(mjdSec: number | undefined): Date | undefined {
  if (mjdSec === undefined || mjdSec === null) return undefined;
  // MJD offset: 40587 days * 86400 seconds/day = 3506716800 seconds
  const MJD_UNIX_OFFSET = 3506716800; // = 40587 * 86400 seconds
  const unixSeconds = mjdSec - MJD_UNIX_OFFSET;
  return new Date(Math.round(unixSeconds * 1000)); // convert to milliseconds
}