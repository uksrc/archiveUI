import { data } from "react-router";
import * as Search from "./Objects";
import type { DataTileDataType } from "~/objects/Objects";

export async function GetFilters(formData: FormData) {

}

export function proxyTiles() : DataTileDataType[] {
     
    const TS8004_C_001_20190801: DataTileDataType = {
        projectName: "TS8004",
        plaformName: "eMerlin",
        runName: "TS8004_C_001_2019NANA",
        antennas: ["Mk2", "Pi", "Da", "Kn", "Cm"],
        sourceData: [{name: "0319+4130", ra: "0:0:01.1", dec: "+1.2.34.56789"}, {name: "1252+5634", ra: "12:52:34.56789", dec: "+56.34.56.78901"}, {name: "1302+5748", ra: "13:02:34.56789", dec: "+57.48.56.78901"}, {name: "1331+3030", ra: "13:31:08.28730", dec: "+30.30.32.95900"}, {name: "1407+2827", ra: "14:07:00.39441", dec: "+28.27.14.68990"}],
        band: "C",
        startDate: new Date("2019-08-01:23:20:00"),
        endDate: new Date("2019-08-02:21:59:00"),
        frequency: "4.82-5.33",
        freqUnit: "GHz",  
        numberOfSources: 5,
        polarisation: ["R", "L"],
        urlToSource: "https://www.example.com/data/TS8004_C_001_2019NANA"
    };
    const CY11218_K_005_20210430: DataTileDataType = {
        projectName: "CY11218",
        plaformName: "eMerlin",
        runName: "CY11218_K_005_2021AABB",
        antennas: ["Mk2", "Pi", "Da", "Kn", "Cm"],
        sourceData: [{name: "0319+4130", ra: "0:0:01.1", dec: "+1.2.34.56789"}, {name: "0955+6903", ra: "09:55:50.703990", dec: "+69.40.43.59080"}, {name: "!!0955+6940", ra: "09:55:50.703990", dec: "+69.40.43.59080"}, {name: "0958+6533", ra: "09:58:12.345678", dec: "+65.33.45.67890"}],
        band: "K",
        startDate: new Date("2021-04-30:08:30:00"),
        endDate: new Date("2021-04-30:16:14:00"),
        frequency: "19.44-19.95",
        freqUnit: "GHz",  
        numberOfSources: 4,
        polarisation: ["R", "L"],
        urlToSource: "https://www.example.com/data/CY11218_K_005_2021AABB"
    };
    const CY9216_L_001_20201003: DataTileDataType = {
        projectName: "CY9216",
        plaformName: "eMerlin",
        runName: "CY9216_L_001_2020XXXY",
        antennas: [	"Lo", "Mk2", "Pi", "Da", "Kn", "De", "Cm"],
        sourceData: [{name: "0319+4130", ra: "0:0:01.1", dec: "+1.2.34.56789"}, {name: "0434-1442", ra: "04:34:00.00000", dec: "-14.42.0.00000"}, {name: "!!0438-1217", ra: "04:38:00.00000", dec: "-12.17.0.00000"}, {name: "1331+3030", ra: "13:31:08.28730", dec: "+30.30.32.95900"}, {name: "!!1331+3030", ra: "13:31:08.28730", dec: "+30.30.32.95900"}, {name: "1407+2827", ra: "14:07:00.39441", dec: "+28.27.14.68990"}],
        band: "L",
        startDate: new Date("2020-10-03:00:20:00"),
        endDate: new Date("2020-10-03:08:39:00"),
        frequency: "1.25-1.77",
        freqUnit: "GHz",  
        numberOfSources: 5,
        polarisation: ["R", "L"],
        urlToSource: "https://www.example.com/data/CY9216_L_001_2020XXXY"
    }
    return [
    TS8004_C_001_20190801,
    CY11218_K_005_20210430,
    CY9216_L_001_20201003,
    ];
}