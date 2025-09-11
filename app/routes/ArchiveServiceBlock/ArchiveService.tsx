import FilterHandler from "../../elements/FilterHandler";
import DataTile from "../../elements/DataTile";
import { proxyTiles } from "~/objects/Proxy";
import type { DataTileDataType } from "~/objects/Objects";

// basic layout of the Archive Service page
//

export function ArchiveService() 
{
   const dataTileData: DataTileDataType[] = proxyTiles();

  return (
    <div className="min-h-[100vh] bg-gray-300">
      <main className="flex items-center justify-center pt-6 pb-4 min-h-[100vh] bg-gray-100 mx-auto">

            <div className="min-w-[76vw] space-y-6 px-6 bg-gray-200 p-[10px]">
                <div className="flex flex-col items-center gap-4 bg-blue-600 text-gray-200 p-4 rounded-lg shadow-xl shadow-gray-500/60 h-[30vh] min-h-[300px]">
                    <h1 className="text-3xl font-bold text-center">Filter Features</h1>
                    <FilterHandler />
                </div>
                <div className="flex flex-col items-center gap-4 bg-linear-to-l from-cyan-500 to-blue-500 text-gray-200 p-4 rounded-lg shadow-xl shadow-gray-500/60 h-[60vh]">
                    <h1 className="text-3xl font-bold text-center">Data Products</h1>
                    <div className="pl-[12px] pt-[12px] pb-[12px] grid grid-cols-9 gap-4 scrollbar-thin overflow-y-auto overflow-x-hidden h-[50vh] w-[100%]">
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