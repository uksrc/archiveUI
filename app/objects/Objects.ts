
// Filter badge data
export type FilterFeatureBadgeType = {
    label?: string;
    query?: string;
    value?: string;
}

//data tile data type
export type DataTileDataType = {
    plaformName?: string;
    projectName?: string;
    runName?: string;
    sources?: string[];
    sourceData?: SourceType[];
    band?: string;
    startDate?: Date;
    endDate?: Date;
    dateOfRecording?: Date;
    antennas?: string[];
    numberOfSources?: number;
    polarisation?: string[];
    frequency?: string;
    freqUnit?: string;
    urlToSource?: string;
}

// sources type
export type SourceType = {
    name: string;
    ra: string; // right ascension in degrees
    dec: string; // declination in degrees
}

