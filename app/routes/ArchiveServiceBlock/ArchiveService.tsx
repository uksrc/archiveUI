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
      
      <main className="flex items-center justify-center pt-6 pb-4 min-h-[100vh] bg-gray-600 mx-auto">
        
            <div className="min-w-[76vw] h-[94vh] space-y-6 px-6 bg-linear-to-l from-cyan-500 to-blue-500 p-[10px] rounded-md">
              <h1 className="text-3xl font-bold text-center text-gray-200">e-Merlin Data Archive</h1>

                <div className="flex flex-col items-center gap-4 gb_traslucent text-gray-500 text-gray-500 p-4 rounded-md shadow-xl shadow-gray-500/60 h-[20vh] min-h-[200px]">
                    {/*<h1 className="text-3xl font-bold text-center">Search on metadata features</h1>*/}
                    <FilterHandler />
                </div>
                <div className="flex flex-col items-center gap-4 text-gray-300 p-4 rounded-md gb_traslucent shadow-xl shadow-gray-500/60 h-[60vh]">
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