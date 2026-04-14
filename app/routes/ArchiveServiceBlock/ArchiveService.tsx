import FilterHandler from "../../elements/FilterHandler";
import DataTile from "../../elements/DataTile";
import { proxyTiles } from "~/objects/Proxy";
import type { DataTileDataType } from "~/objects/Objects";
import { mjdSecToDate } from "~/utils/api";

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

// export async function loader({ request }: { request: Request }) {
//     const API_PORT = 8080; // <-- update this if the port changes
//     const apiUrl = `http://localhost:${API_PORT}/archive/observations`;

//     const res = await fetch(apiUrl, {
//         method: "GET",
//         signal: request.signal, // lest RR cancel if the user navigates away    
//         headers: {
//             "Accept": "application/json"
//         }
//     });

//     if (!res.ok) {
//         throw new Error(`Failed to fetch observations: ${res.status} ${res.statusText}`);
//     }
    
//     const json = (await res.json()) as ObservationsResponse;

//     // Minimal runtime guard so failures are obvious:
//     if (!json || !Array.isArray(json.observations)) {
//         throw new Response("Unexpected API response shape", { status: 502 });
//     }

//     return json.observations;

    

// }


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

            // --- NEW: gate RA/Dec/Radius as a group ---
    const ra = incoming.get("ra");
    const dec = incoming.get("dec");
    const radius = incoming.get("radius");

    const hasAllCoords =
      ra !== null && ra !== "" &&
      dec !== null && dec !== "" &&
      radius !== null && radius !== "";

    if (hasAllCoords) {
      console.log("Adding RA/Dec/Radius to API request:", { ra, dec, radius });

      apiUrl.searchParams.set("ra", ra);
      apiUrl.searchParams.set("dec", dec);
      apiUrl.searchParams.set("radius", radius);
    }
    else
    {
      console.log("Skipping RA/Dec/Radius due to missing values:", { ra, dec, radius });
    }

    for (const key of allowedParams) {
      if (key === "ra" || key === "dec" || key === "radius") continue; // skip since handled as a group above
      
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
  //let dataTileData: DataTileDataType[] = proxyTiles() ?? [];
  let dataTileData: DataTileDataType[] = [];

  const dataFromServer: DataTileDataType[] = observations.map(mapObservationToDataTile); // transform to DataTileDataType[]
  dataTileData = dataFromServer.length > 0 ? dataFromServer : dataTileData; // use server data if available, otherwise fallback to proxy data
   //dataTileData = dataFromServer; // use server data if available, otherwise fallback to proxy data

  return (
    <div className="min-h-[100vh] bg-gray-300">
      
      <main className="flex items-center justify-center pt-6 pb-4 min-h-[100vh] bg-gray-600 mx-auto">
        
            {/*<div className="flex flex-col items-center justify-center min-w-[99vw] h-[94vh] space-y-6 px-6 bg-linear-to-l from-cyan-500 to-blue-500 p-[10px] rounded-md">*/}
            <div className="flex flex-col items-center justify-center min-w-[99vw] h-[94vh] space-y-6 px-6 p-[10px] rounded-md bg-[url('/images/UKSRC-DA-background3.png')] bg-cover bg-center bg-no-repeat">
              <h1 className="text-5xl font-bold text-center text-gray-200">e-Merlin Data Archive</h1>
                <div className="w-[80vw] flex flex-col items-center gap-4 gb_traslucent text-gray-200 p-4 rounded-md shadow-xl shadow-gray-500/60 h-[20vh] min-h-[250px]">
                    <FilterHandler />
                </div>
                <div className="w-[80vw] flex flex-col items-center gap-4 gb_traslucent text-gray-200 p-4 rounded-md shadow-xl shadow-gray-500/60 h-[55vh]">
                    <h1 className="text-3xl font-bold text-center">Data Products ({dataFromServer.length})</h1>
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