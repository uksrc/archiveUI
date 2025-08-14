import type { DataTileDataType } from "~/objects/Objects";
import invariant from "tiny-invariant"; 
import { data } from "react-router";


export default function DataTile(dataProduct: DataTileDataType ){

    //define a count variable to support the rendering of bands
    let count = -1;
    if(dataProduct.bands === undefined || dataProduct.bands === null) {

        count = 0;
    } else {
        count = dataProduct.bands?.length;
    }   

    //define the tile one item at a time!
    return (
        <>
        <a href={dataProduct.urlToSource} target="_blank" rel="noopener noreferrer" className="text-blue-600">
            <div className="flex flex-col items-center gap-1 bg-purple-200 text-gray-200 p-2 rounded-lg shadow-xl shadow-gray-500/60 h-[200px] w-[200px] hover:bg-violet-300 transition duration-220 ease-out">
                <h1 className="text-xl font-bold text-center text-gray-800">{dataProduct.projectName}</h1>
                <p className="p-0 text-gray-800">{dataProduct.runName}</p>
                <p className="p-0 font-semibold bg-black w-[100%] text-center">{dataProduct.plaformName}</p>
                <p className="p-0 text-gray-800"> { 
                    dataProduct.startDate?.getDate() + '/' 
                    + dataProduct.startDate?.getMonth() + '/'
                    + dataProduct.startDate?.getFullYear()
                }</p>
                <p>{
                    dataProduct.bands?.map((band, index) => (
                        <span key={index} className="text-gray-800">
                            {band}{index < count - 1 ? ' | ' : ''} 
                        </span>
                    ))  
                }
                <span className="text-gray-800 font-bold"> {' [' + dataProduct.numberOfSources+']'}</span>
                </p>
                <p className="p-0 text-gray-800">{ dataProduct.frequency + ' ' + dataProduct.freqUnit }</p>
            </div>
            </a>
        </>
    );
}