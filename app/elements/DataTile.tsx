import type { DataTileDataType } from "~/objects/Objects";
import invariant from "tiny-invariant"; 
import { data } from "react-router";


export default function DataTile(dataProduct: DataTileDataType ){

    //define a count variable to support the rendering of bands
    let count = -1;
    let processedDate = "date not set";

    if(dataProduct.band === undefined || dataProduct.band === null) {

        count = 0;
    } else {
        count = dataProduct.band?.length;
    }   

    if(dataProduct.startDate === undefined || dataProduct.startDate === null) {
       
        processedDate = "date not found";
    }
    else
    {
        processedDate = dataProduct.startDate?.getDate() + '/' 
        + (dataProduct.startDate?.getMonth()+1) + '/'
        + dataProduct.startDate?.getFullYear();
    }

    //define the tile one item at a time!
    return (
        <>
        <a href={dataProduct.urlToSource} target="_blank" rel="noopener noreferrer" className="text-blue-600">
            <div className="flex flex-col items-center gap-1 bg-purple-200 text-gray-200 p-1 rounded-lg shadow-xl shadow-gray-500/60 h-[140px] w-[150px] hover:bg-violet-300 transition duration-220 ease-out">
                <h1 className="text-m p-0 font-bold text-center text-gray-800">{dataProduct.projectName}</h1>
                <p className="text-xs p-0 text-gray-800">{dataProduct.runName}</p>
                <p className="p-0 font-semibold bg-black w-[100%] text-center">{dataProduct.plaformName}</p>
                <p className="p-0 text-gray-800">
                    <span>{processedDate}</span>
                    <span className="text-gray-800 font-bold">  ({dataProduct.band})</span>
                </p>
                {/* <p>{
                    dataProduct.antennas?.map((antenna, index) => (
                        <span key={index} className="text-gray-800">
                            {antenna}{index < count - 1 ? ' | ' : ' '} 
                        </span>
                    ))  
                }</p> */}
                <p >
                    <span className="text-gray-800 font-bold">{' [' + dataProduct.numberOfSources+']  '}</span>
                    <span className="p-0 text-gray-800">{ dataProduct.frequency + ' ' + dataProduct.freqUnit }</span>
                </p>
            </div>
            </a>
        </>
    );
}