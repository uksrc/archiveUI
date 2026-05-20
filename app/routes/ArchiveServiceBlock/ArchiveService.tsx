import { useState, useEffect } from "react";
import FilterHandler from "../../elements/FilterHandler";
import DataTile from "../../elements/DataTile";
import { proxyTiles } from "~/objects/Proxy";
import type { DataTileDataType } from "~/objects/Objects";
import { mjdSecToDate } from "~/utils/api";
import { AstroLib } from "@tsastro/astrolib";
import { useAuth } from "react-oidc-context";
import { useSearchParams } from "react-router"; 

// basic layout of the Archive Service page
//
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
  energy?: { bounds?: { lower: number; upper: number }, bandpassName: string };
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
  const target = observation.target;
  const _C_ = 2998792458; // speed of light in m/s

  return {
    projectName: observation.collection,
    runName: observation.uri.split("/").pop(), // use last part of URI or fallback to ID
    plaformName: observation.telescope.name,
    urlToSource: observation.uri + "//weblog/index.html",
    band: bandpass,
    antennas: observation.telescope.keywords ?? [],
    frequency:
      lower !== undefined && upper !== undefined
        ? `${Math.round((_C_/lower*0.0000000001)*100)/100}-${Math.round((_C_/upper*0.0000000001)*100)/100}` // convert MHz to GHz for display
        : "unknown",
    wavelength:
      lower !== undefined && upper !== undefined
        ? `${Math.round(lower*1000)/1000}-${Math.round(upper*1000)/1000}` 
        : "unknown",  
    freqUnit: "GHz",
    polarisation: states,
    targets: observation.target.keywords ?? [], // placeholder until we have a real value from the API
    sourceData: [
      {
        name: target.name,
        ra: `${observation.targetPosition.coordinates.cval1}`,
        dec: `${observation.targetPosition.coordinates.cval2}`,
      },
    ],
    startDate: mjdSecToDate(observation.planes?.[0]?.time?.bounds?.lower),
    endDate: mjdSecToDate(observation.planes?.[0]?.time?.bounds?.upper),
    numberOfSources: observation.target.keywords.length, // placeholder until we have a real value from the API
  };
}


type ArchiveServiceProps = {
  observations?: Observation[];
};

export function ArchiveService({ observations = [] }: ArchiveServiceProps) 
{
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [observations_local, setObservations] = useState<Observation[]>(observations ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;
  
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
  ];
  const sexegesimalRegex = /[-+]{0,1}(\d{1,2})\D(\d{1,2})\D(\d{1,2}(\.\d+)[sS]*)/;

  useEffect(() => {
    if (!auth.isAuthenticated || auth.isLoading || !auth.user?.access_token) return;

    const fetchObservations = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = new URL(`${API_BASE_URL}/archive/search`);

        // Process RA/Dec/Radius coordinates
        let ra = String(searchParams.get("ra") || "");
        let dec = String(searchParams.get("dec") || "");
        const radius = searchParams.get("radius");

        if (ra.match(sexegesimalRegex)) {
          ra = AstroLib.HmsToDeg(ra).toString();
        }

        if (dec.match(sexegesimalRegex)) {
          dec = AstroLib.DmsToDeg(dec).toString();
        }

        ra = ra.replace("°", "");
        dec = dec.replace("°", "");

        const hasAllCoords =
          ra !== "" && dec !== "" && radius;

        if (hasAllCoords) {
          apiUrl.searchParams.set("ra", ra);
          apiUrl.searchParams.set("dec", dec);
          apiUrl.searchParams.set("radius", radius!);
        }

        // Add other allowed parameters
        for (const key of allowedParams) {
          if (["ra", "dec", "radius"].includes(key)) continue;
          const value = searchParams.get(key);
          if (value) {
            apiUrl.searchParams.set(key, value);
          }
        }

        // Fetch with Bearer token
        const res = await fetch(apiUrl.toString(), {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${auth.user!.access_token}`,
          },
        });

        if (res.status === 401) {
          throw new Error("Unauthorized: token expired or invalid");
        }

        if (!res.ok) {
          throw new Error(`API request failed: ${res.status}`);
        }

        const json = (await res.json()) as ObservationsResponse;

        if (!json || !Array.isArray(json.observations)) {
          throw new Error("Unexpected API response shape");
        }

        setObservations(json.observations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch observations");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchObservations();
  }, [auth.isAuthenticated, auth.isLoading, auth.user?.access_token, searchParams]);

  let dataTileData: DataTileDataType[] = [];

  if (Array.isArray(observations_local) && observations_local.length > 0) {
    dataTileData = observations_local.map(mapObservationToDataTile);
  }

  //const dataFromServer: DataTileDataType[] = observations_local.map(mapObservationToDataTile); // transform to DataTileDataType[]
  //dataTileData = dataFromServer.length > 0 ? dataFromServer : dataTileData; // use server data if available, otherwise fallback to proxy data
  

  return (
    <div className="min-h-[100vh] bg-gray-300">
      
      <main className="flex items-center justify-center pt-6 pb-4 min-h-[100vh] bg-gray-600 mx-auto">
        
            {/*<div className="flex flex-col items-center justify-center min-w-[99vw] h-[94vh] space-y-6 px-6 bg-linear-to-l from-cyan-500 to-blue-500 p-[10px] rounded-md">*/}
            <div className="flex flex-col items-center justify-center min-w-[99vw] h-[94vh] space-y-6 px-6 p-[10px] rounded-md bg-[url('/images/UKSRC-DA-background3.png')] bg-cover bg-center bg-no-repeat">
              <h1 className="text-5xl font-bold text-center text-gray-200">e-MERLIN Data Archive</h1>
                <div className="w-[80vw] flex flex-col items-center gap-4 gb_traslucent text-gray-200 p-4 rounded-md shadow-xl shadow-gray-500/60 h-[20vh] min-h-[250px]">
                    <FilterHandler />
                </div>
                <div className="w-[80vw] flex flex-col items-center gap-4 gb_traslucent text-gray-200 p-4 rounded-md shadow-xl shadow-gray-500/60 h-[55vh]">
                    <h1 className="text-3xl font-bold text-center">Data Products ({dataTileData.length})</h1>
                    {loading && <p>Loading observations...</p>}
                    {error && <p className="text-red-400">Error: {error}</p>}
                    <div className="gb_dataProduct pl-[12px] pt-[12px] pb-[32px] grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 scrollbar-thin overflow-y-auto overflow-x-hidden h-[95%] w-[100%]">
                       { 
                        dataTileData.map((dataTileData: DataTileDataType, index: number) =>
                        <DataTile key={index} {...dataTileData} />
                       )}
                    </div>
                </div>
            </div>
      </main>
    </div>
  );
}