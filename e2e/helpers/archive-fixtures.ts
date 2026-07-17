export type ObservationFixture = {
  "@type": string;
  id: string;
  collection: string;
  uri: string;
  //uriBucket: string;
  //intent: string;
  metaReadGroups: string[];
//   algorithm: {
//     _id: number;
//     name: string;
//   };
  telescope: {
    _id: number;
    name: string;
    keywords: string[];
  };
  targetPosition: {
    _id: number;
    coordsys: string;
    coordinates: {
      _id: number;
      cval1: number;
      cval2: number;
    };
  };
  planes: Array<{
    _id: number;
    id: string;
    energy?: { bounds?: { lower: number; upper: number }; bandpassName: string };
    time?: { bounds?: { lower: number; upper: number } };
    polarization?: { states: string[] };
  }>;
  target: {
    _id: number;
    name: string;
    targetID: string;
    keywords: string[];
  };
};

export type ArchiveSearchResponseFixture = {
  observations: ObservationFixture[];
};

function buildObservation(overrides: Partial<ObservationFixture> = {}): ObservationFixture {
  const base: ObservationFixture = {
    "@type": "Observation",
    id: "obs-0001",
    collection: "eMERLIN",
    uri: "https://example.org/archive/obs-0001",
    //uriBucket: "obs-0001",
    //intent: "science",
    metaReadGroups: ["public"],
    //algorithm: {
    //  _id: 1,
    //  name: "default",
    //},
    telescope: {
      _id: 1,
      name: "e-MERLIN",
      keywords: ["uk", "interferometer"],
    },
    targetPosition: {
      _id: 1,
      coordsys: "ICRS",
      coordinates: {
        _id: 1,
        cval1: 150.5,
        cval2: 2.3,
      },
    },
    planes: [
      {
        _id: 1,
        id: "plane-0001",
        energy: {
          bounds: { lower: 1.2e9, upper: 1.4e9 },
          bandpassName: "L",
        },
        time: {
          bounds: { lower: 3506716800, upper: 3506717800 },
        },
        polarization: {
          states: ["I", "Q"],
        },
      },
    ],
    target: {
      _id: 1,
      name: "Target-1",
      targetID: "TGT-0001",
      keywords: ["galaxy"],
    },
  };

  return {
    ...base,
    ...overrides,
  };
}

export const archiveSearchFixtures = {
  singleObservation: (): ArchiveSearchResponseFixture => ({
    observations: [buildObservation()],
  }),

  twoObservations: (): ArchiveSearchResponseFixture => ({
    observations: [
      buildObservation(),
      buildObservation({
        id: "obs-0002",
        uri: "https://example.org/archive/obs-0002",
        collection: "eMERLIN-Alt",
        target: {
          _id: 2,
          name: "Target-2",
          targetID: "TGT-0002",
          keywords: ["quasar"],
        },
      }),
    ],
  }),

  empty: (): ArchiveSearchResponseFixture => ({
    observations: [],
  }),
};
