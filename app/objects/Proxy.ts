import { data } from "react-router";
import * as Search from "./Objects";
import type { DataTileDataType } from "~/objects/Objects";

export async function GetFilters(formData: FormData) {

}

export function proxyTiles() : DataTileDataType[] {
     
    const TS8004_C_001_20190801: DataTileDataType = {
        projectName: "TS8004",
        plaformName: "eMerlin",
        runName: "TS8004_C_001_20190801",
        antennas: ["Mk2", "Pi", "Da", "Kn", "Cm"],
        targets: ["0319+4130","!!1252+5634","1302+5748","1331+3030","1407+2827"],
        bands: ["C"],
        startDate: new Date("2019-08-01:23:20:00"),
        endDate: new Date("2019-08-02:21:59:00"),
        frequency: "4.82 - 5.33",
        freqUnit: "GHz",  
        numberOfSources: 5,
        polarisation: ["R", "L"],
        urlToSource: "https://www.e-merlin.ac.uk/distribute/CY8/TS8004/TS8004_C_001_20190801/weblog/index.html"
      };

        const CY11218_K_005_20210430: DataTileDataType = {
        projectName: "CY11218",
        plaformName: "eMerlin",
        runName: "CY11218_K_005_20210430",
        antennas: ["Mk2", "Pi", "Da", "Kn", "Cm"],
        targets: ["0319+4130","!!0955+6903","!!0955+6940","0958+6533"],
        bands: ["K"],
        startDate: new Date("2021-04-30:08:30:00"),
        endDate: new Date("2021-04-30:16:14:00"),
        frequency: "19.44 - 19.95",
        freqUnit: "GHz",  
        numberOfSources: 4,
        polarisation: ["R", "L"],
        urlToSource: "https://www.e-merlin.ac.uk/distribute/CY11/CY11218/CY11218_K_005_20210430/weblog/index.html"
      };

        const CY9216_L_001_20201003: DataTileDataType = {
        projectName: "CY9216",
        plaformName: "eMerlin",
        runName: "CY9216_L_001_20201003",
        antennas: [	"Lo", "Mk2", "Pi", "Da", "Kn", "De", "Cm"],
        targets: ["0319+4130","0434-1442","!!0438-1217","1331+3030","1407+2827"],
        bands: ["L"],
        startDate: new Date("2020-10-03:00:20:00"),
        endDate: new Date("2020-10-03:08:39:00"),
        frequency: "1.25 - 1.77",
        freqUnit: "GHz",  
        numberOfSources: 5,
        polarisation: ["R", "L"],
        urlToSource: "https://www.e-merlin.ac.uk/distribute/CY9/CY9216/CY9216_L_001_20201003/weblog/index.html"
      };

      return [TS8004_C_001_20190801, CY11218_K_005_20210430, CY9216_L_001_20201003];
    
}