// basic layout of the Archive Service page
//

export function ArchiveService() 
{
  return (
    <div className="min-h-[100vh] bg-gray-300">
      <main className="flex items-center justify-center pt-6 pb-4 min-h-[100vh] bg-gray-100 mx-auto">

            <div className="min-w-[76vw] space-y-6 px-6 bg-gray-200 p-[10px]">
                <div className="flex flex-col items-center gap-4 bg-blue-600 text-gray-200 p-4 rounded-lg shadow-xl shadow-gray-500/60 h-[30vh]">
                    <h1 className="text-3xl font-bold text-center">SEARCHING WORKFLOW</h1>
                </div>
                <div className="flex flex-col items-center gap-4 bg-purple-600 text-gray-200 p-4 rounded-lg shadow-xl shadow-gray-500/60 h-[60vh]">
                    <h1 className="text-3xl font-bold text-center">DATA TILES HERE</h1>
                </div>
            </div>
      </main>
    </div>
  );
}