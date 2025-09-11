import type { DataTileDataType } from "~/objects/Objects";
import type { SourceType } from "~/objects/Objects";
import invariant from "tiny-invariant"; 
import { data } from "react-router";

// add some colour to the band display
function FormatBand(band: string | undefined, id: string) {
    switch(band) {
       
        case 'C':
            return (
                <span className={id + " text-center px-1 rounded-sm bg-purple-700 text-grey-200 font-bold"}>{band}</span>
            );     
        case 'L':
            return (
                <span className={id + " text-center px-1 rounded-sm bg-fuchsia-500 text-grey-200 font-bold"}>{band}</span>
            );
        case 'K':
            return (
                <span className={id + "text-center px-1 rounded-sm bg-pink-400 text-grey-200 font-bold"}>{band}</span>
            );
        default:
            return (
                <span className={id + "text-gray-800 font-bold"}>{band}</span>
            );
    }
}

function HideElement(id: string) {
    const elements = document.getElementsByClassName(id);
    if(elements) {
        Array.from(elements).forEach((element) => {
            if((element as HTMLElement).style.opacity === "1" || (element as HTMLElement).style.opacity === "") {
                (element as HTMLElement).style.opacity = "0"; 
                (element as HTMLElement).style.display = "none"; 
            }
        });
    }
}

function ShowElement(id: string) {
    const elements = document.getElementsByClassName(id);
    if (elements) {
        Array.from(elements).forEach((element) => {
            if((element as HTMLElement).style.opacity === "0"){
            (element as HTMLElement).style.opacity = "1";
            (element as HTMLElement).style.display = "inline-block";
            }
        });
    }
}

function RenderTargets(dataProduct: DataTileDataType) {
    let count = -1;
    return (
            <p className={"pl-1 text-gray-800 hidden v_" + GenerateId(dataProduct)}>{
                    dataProduct.targets?.map((target, index) => (
                        <span key={index} className="text-gray-800 text-xs">
                            {target}{index < count - 1 ? ' ' : ' + '} 
                        </span>
                    ))  
                }
            </p>
    );
}


// text formatting for date
function ProcessDate({date, separator="/"} : {date?: Date | undefined, separator?: string | undefined}={}): string {
    let processedDate = "date not set";
    if(date === undefined || date === null) {
        console.log(date);
        processedDate = "date not found";
    }
    else
    {
        processedDate = date?.getDate() + separator
        + (date?.getMonth()+1) + separator
        + date?.getFullYear();
    }
    return processedDate;
}

function GenerateId(dataProduct: DataTileDataType): string {
    const unique_id = dataProduct.runName + "_" + ProcessDate({date: dataProduct.startDate, separator: "_"});
    return unique_id; 
}

function ProcessSourceData(sources: SourceType[] | undefined): string {
    if (sources === undefined || sources.length === 0) {
        return "source not found";
    }
    return sources[0].name;
}

export default function DataTile(dataProduct: DataTileDataType ){

    //define a count variable to support the rendering of bands
    
    let processedDate = "date not set";

    //define the tile one item at a time!
    return (
        <>
        <div  onMouseOver={() => HideElement(GenerateId(dataProduct))} onMouseOut={() => ShowElement(GenerateId(dataProduct))} className="cursor-pointer h-[140px] w-[150px]">
            <a  href={dataProduct.urlToSource} target="_blank" rel="noopener noreferrer" className="w-[100%]">
                <div className="gb_card flex flex-col items-center gap-1 bg-purple-200 text-gray-200 p-1 rounded-lg shadow-xl shadow-gray-500/60 h-[100%] w-[100%] hover:translate transition duration-220 ease-out">
                    <h1 className="text-m p-0 font-bold text-center text-gray-800">{dataProduct.projectName}</h1>
                    <p className={"text-xs p-0 text-gray-800 " + GenerateId(dataProduct)}>{ProcessSourceData(dataProduct.sourceData)}</p>
                    <p className="p-0 font-semibold bg-black w-[100%] text-center">{ProcessDate({date: dataProduct.startDate, separator: "\/"})}</p>
                    <p className={GenerateId(dataProduct)}>
                        {/* <span className="text-gray-800 font-bold">{dataProduct.band}</span> */}
                        {FormatBand(dataProduct.band, GenerateId(dataProduct))}
                        <span className="p-0 text-sm text-gray-800">{ ' (' + dataProduct.frequency + ' ' + dataProduct.freqUnit +')  '}</span>
                    </p>
                    <p className={"p-0 text-gray-800 " + GenerateId(dataProduct)}>
                        <span className="text-gray-800 text-xs font-bold ">  [sources: {dataProduct.numberOfSources}]</span>
                    </p>
                    { RenderTargets(dataProduct) }
                    
                </div>
            </a>
        </div>
        </>
    );
}