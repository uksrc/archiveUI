import type { DataTileDataType } from "~/objects/Objects";

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