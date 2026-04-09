import { useLoaderData, useNavigate } from "react-router";
import type { DataTileDataType } from "~/objects/Objects";
import { mjdSecToDate } from "~/utils/api";
import FilterHandler from "../elements/FilterHandler";

type Algorithm = { 
  _id: number; 
  name: string };

type Telescope = { 
  _id: number; 
  name: string; 
  keywords: string[] };

type Coordinates = { 
  _id: number; 
  cval1: number; 
  cval2: number };

type Target = { 
  _id: number; 
  name: string; 
  targetID: string; 
  keywords: string[] };

type TargetPosition = { 
  _id: number; 
  coordsys: string; 
  coordinates: Coordinates };

type Plane = {
  _id: number; 
  id: string; 
  energy?: { bounds?: { lower: number; upper: number },  bandpassName: string };
  //samples?: { energyBands?: { bandpassNames: string[] } };
  time?: { bounds?: { lower: number; upper: number } };
  polarization?: { states: string[] };
};

export type Observation = {
  "@type": string;
  id: string;
  collection: string;
  uri: string;
  uriBucket: string;
  intent: string;
  metaReadGroups: string[];
  algorithm: Algorithm;
  telescope: Telescope;
  targetPosition: TargetPosition;
  planes: Plane[];
  target: Target;
};

type ObservationsResponse = {
  observations: Observation[];
};

function mapObservationToDataTile(observation: Observation): DataTileDataType {
  const firstPlane = observation.planes?.[0];
  const lower = firstPlane?.energy?.bounds?.lower;
  const upper = firstPlane?.energy?.bounds?.upper;
  const states = firstPlane?.polarization?.states ?? [];
  const bandpass = firstPlane?.energy?.bandpassName;
  //const bandpass = firstPlane?.energy?.bandpassName;
  const target = observation.target;
  const _C_ = 2998792458; // speed of light in m/s
  return {
    projectName: observation.collection,
    runName: observation.id,
    plaformName: observation.telescope.name,
    urlToSource: observation.uri,
    band: bandpass,
    frequency:
      lower !== undefined && upper !== undefined
        ? `${(Math.round(_C_/lower*0.0000000001)/100)}-${(Math.round(_C_/upper*0.0000000001)/100)}` // convert MHz to GHz for display
        : "unknown",
    wavelength:
      lower !== undefined && upper !== undefined
        ? `${(Math.round(lower*0.001)/100)}-${(Math.round(upper*0.001)/100)}` 
        : "unknown",    
    freqUnit: "GHz",
    polarisation: states,
    numberOfSources: observation.metaReadGroups?.length ?? 0,
    targets: observation.target.keywords ?? [],
    sourceData: [
      {
        name: target.name,
        ra: `${observation.targetPosition.coordinates.cval1}`,
        dec: `${observation.targetPosition.coordinates.cval2}`,
      },
    ],
    startDate: mjdSecToDate(observation.planes?.[0]?.time?.bounds?.lower),
    endDate: mjdSecToDate(observation.planes?.[0]?.time?.bounds?.upper),

  };
}

export async function loader({ request }: { request: Request }) {
    const API_PORT = 8080; // <-- update this if the port changes

    const requestUrl = new URL(request.url);
    //const incomingApiUrl = requestUrl.searchParams.get("apiUrl");
    const incoming = requestUrl.searchParams;
    
    const apiUrl = new URL(`http://localhost:${API_PORT}/archive/search`);

    const allowedParams = [
      "ra", 
      "dec", 
      "radius",
      "startDate",
      "dateMin",
      "dateMax",  
      "target",
      "project",
      "telescope",
      "instrument",
      "band",
      "freqMin",
      "freqMax",
      "page",
      "size"
    
    ]; // define allowed query parameters for security

    for (const key of allowedParams) {
      const value = incoming.get(key);
      if(value !== null && value !== "") //maybe indefined instead of ""?
      {
        apiUrl.searchParams.set(key, value);
      }
    }

    const res = await fetch(apiUrl.toString(), {
        method: "GET",
        signal: request.signal, // lest RR cancel if the user navigates away    
        headers: {
            "Accept": "application/json"
        }
    });

    if (!res.ok) {
        throw new Response("Failed to fetch observations:", {status: res.status, statusText: res.statusText});
    }
    
    const json = (await res.json()) as ObservationsResponse;

    // Minimal runtime guard so failures are obvious:
    if (!json || !Array.isArray(json.observations)) {
        throw new Response("Unexpected API response shape", { status: 502 });
    }

    return json.observations;
}

export default function Observations() {
  const navigate = useNavigate();
  const observations = (useLoaderData() as Observation[] | undefined) ?? [];
  const tiles = observations.map(mapObservationToDataTile);

  function launchTestFilter(url: string) {
    navigate(url);
  }

    return (
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Observations (mapped to DataTileDataType)</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <FilterHandler />
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <p>RUNNING MAP</p>
        {tiles.map((tile) => (
          <div key={tile.runName} className="border p-2 rounded">
          <p>runName: {tile.runName}</p>
          <p>projectName: {tile.projectName}</p>
          <p>urlToSource: {tile.urlToSource}</p>
          <p>band: {tile.band}</p>
          <p>frequency: {tile.frequency}</p>
          <p>freqUnit: {tile.freqUnit}</p>
          <p>polarisation: {(tile.polarisation ?? []).join(", ")}</p>
          <p>numberOfSources: {tile.numberOfSources}</p>
          <p>targets: {(tile.targets ?? []).join(", ")}</p>
          <p>sourceData: {(tile.sourceData ?? []).map((source) => `${source.name} (RA: ${source.ra}, Dec: ${source.dec})`).join("; ")}</p>
          <p>startDate: {tile.startDate?.toISOString()}</p>
          <p>endDate: {tile.endDate?.toISOString()}</p>
          </div >
        ))} 
        </div>
        </div>
  );
}
