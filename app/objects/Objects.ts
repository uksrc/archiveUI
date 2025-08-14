
// Filter badge data
export type FilterFeatureBadgeType = {
    label?: string;
    query?: string;
    value?: string;
}

//
export type DataTileDataType = {
    plaformName?: string;
    projectName?: string;
    runName?: string;
    targets?: string[];
    startDate?: Date;
    endDate?: Date;
    bands?: string[];
    dateOfRecording?: Date;
    antennas?: string[];
    numberOfSources?: number;
    polarisation?: string[];
    frequency?: string;
    freqUnit?: string;
    urlToSource?: string;
}
