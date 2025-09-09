import type { DataTileDataType } from "~/objects/Objects";
import type { SourceType } from "~/objects/Objects";
import invariant from "tiny-invariant"; 
import { data } from "react-router";

// add some colour to the band display
function FormatBand(band: string | undefined) {
    switch(band) {
       
        case 'C':
            return (
                <span className="text-center px-1 rounded-sm bg-purple-700 text-grey-200 font-bold">{band}</span>
            );     
        case 'L':
            return (
                <span className="text-center px-1 rounded-sm bg-fuchsia-500 text-grey-200 font-bold">{band}</span>
            );
        case 'K':
            return (
                <span className="text-center px-1 rounded-sm bg-pink-400 text-grey-200 font-bold">{band}</span>
            );
        default:
            return (
                <span className="text-gray-800 font-bold">{band}</span>
            );
    }
}
// text formatting for date
function ProcessDate(date: Date | undefined): string {
    let processedDate = "date not set";
    if(date === undefined || date === null) {
       
        processedDate = "date not found";
    }
    else
    {
        processedDate = date?.getDate() + '/' 
        + (date?.getMonth()+1) + '/'
        + date?.getFullYear();
    }
    return processedDate;
}

function ProcessSourceData(sources: SourceType[] | undefined): string {
    if (sources === undefined || sources.length === 0) {
        return "source not found";
    }
    return sources[0].name;
}

export default function DataTile(dataProduct: DataTileDataType ){

    //define a count variable to support the rendering of bands
    let count = -1;
    let processedDate = "date not set";

    //define the tile one item at a time!
    return (
        <>
        {/*<a href={dataProduct.urlToSource} target="_blank" rel="noopener noreferrer" className="text-blue-600">*/}
            <div className="flex flex-col items-center gap-1 bg-purple-200 text-gray-200 p-1 rounded-lg shadow-xl shadow-gray-500/60 h-[140px] w-[150px] hover:bg-violet-300 transition duration-220 ease-out">
                <h1 className="text-m p-0 font-bold text-center text-gray-800">{dataProduct.projectName}</h1>
                <p className="text-xs p-0 text-gray-800">{ProcessSourceData(dataProduct.sourceData)}</p>
                <p className="p-0 font-semibold bg-black w-[100%] text-center"><a href={dataProduct.urlToSource} target="_blank" rel="noopener noreferrer">{ProcessDate(dataProduct.startDate)}</a></p>
                <p >
                    {/* <span className="text-gray-800 font-bold">{dataProduct.band}</span> */}
                    {FormatBand(dataProduct.band)}
                    <span className="p-0 text-sm text-gray-800">{ ' (' + dataProduct.frequency + ' ' + dataProduct.freqUnit +')  '}</span>
                </p>
                <p className="p-0 text-gray-800">
                    <span className="text-gray-800 text-xs font-bold">  [sources: {dataProduct.numberOfSources}]</span>
                </p>
                {/* <p>{
                    dataProduct.antennas?.map((antenna, index) => (
                        <span key={index} className="text-gray-800">
                            {antenna}{index < count - 1 ? ' | ' : ' '} 
                        </span>
                    ))  
                }</p> */}
                
            </div>
            {/*</a>*/}
        </>
    );
}