import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockUseLoaderData = vi.fn();
const mockUseNavigate = vi.fn();
const fetchMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useLoaderData: () => mockUseLoaderData(),
    useNavigate: () => mockUseNavigate,
  };
});

vi.mock("../elements/FilterHandler", () => ({
  default: () => <div data-testid="filter-handler" />, 
}));

import Observations, { loader, type Observation } from "./observations";

function createObservation(overrides: Partial<Observation> = {}): Observation {
  return {
    "@type": "Observation",
    id: "obs-1",
    collection: "COLLECTION-1",
    uri: "https://example.test/obs/1",
    uriBucket: "bucket-1",
    intent: "science",
    metaReadGroups: ["a", "b"],
    algorithm: { _id: 1, name: "algo" },
    telescope: { _id: 2, name: "e-MERLIN", keywords: ["Mk2", "Pi"] },
    targetPosition: {
      _id: 3,
      coordsys: "ICRS",
      coordinates: { _id: 4, cval1: 123.456, cval2: -45.678 },
    },
    planes: [
      {
        _id: 5,
        id: "plane-1",
        energy: {
          bounds: { lower: 1000000000, upper: 2000000000 },
          bandpassName: "L",
        },
        time: {
          bounds: { lower: 3506716800, upper: 3506716800 + 3600 },
        },
        polarization: { states: ["R", "L"] },
      },
    ],
    target: {
      _id: 6,
      name: "TARGET-1",
      targetID: "tgt-1",
      keywords: ["target-a", "target-b"],
    },
    ...overrides,
  };
}

describe("observations loader", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("forwards only allowlisted params", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({ observations: [] }),
    });

    const request = new Request(
      "http://localhost/observations?ra=10&dec=20&radius=0.5&target=M87&page=2&size=50&notAllowed=yes&empty="
    );

    await loader({ request });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(calledUrl.origin).toBe("https://api.example.test");
    expect(calledUrl.pathname).toBe("/archive/search");
    expect(calledUrl.searchParams.get("ra")).toBe("10");
    expect(calledUrl.searchParams.get("dec")).toBe("20");
    expect(calledUrl.searchParams.get("radius")).toBe("0.5");
    expect(calledUrl.searchParams.get("target")).toBe("M87");
    expect(calledUrl.searchParams.get("page")).toBe("2");
    expect(calledUrl.searchParams.get("size")).toBe("50");
    expect(calledUrl.searchParams.get("notAllowed")).toBeNull();
    expect(calledUrl.searchParams.get("empty")).toBeNull();
  });

  it("handles non-ok fetch by throwing a Response with status", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: vi.fn(),
    });

    const request = new Request("http://localhost/observations?project=TEST");

    await expect(loader({ request })).rejects.toMatchObject({
      status: 503,
      statusText: "Service Unavailable",
    });
  });

  it("handles invalid response shape by throwing 502 Response", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({ wrongKey: [] }),
    });

    const request = new Request("http://localhost/observations");

    await expect(loader({ request })).rejects.toMatchObject({ status: 502 });
  });

  it("returns observations array on success", async () => {
    const observations = [createObservation()];

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({ observations }),
    });

    const request = new Request("http://localhost/observations?project=TEST");

    const result = await loader({ request });

    expect(result).toEqual(observations);
  });
});

describe("Observations component mapping", () => {
  afterEach(() => {
    mockUseLoaderData.mockReset();
    mockUseNavigate.mockReset();
  });

  it("maps successful observation data into tiles safely", () => {
    const safeObservation = createObservation({
      id: "obs-safe",
      planes: [],
      metaReadGroups: [],
      target: {
        _id: 6,
        name: "TARGET-SAFE",
        targetID: "tgt-safe",
        keywords: [],
      },
    });

    mockUseLoaderData.mockReturnValue([safeObservation]);

    render(<Observations />);

    expect(screen.getByText(/Observations \(mapped to DataTileDataType\)/i)).toBeInTheDocument();
    expect(screen.getByTestId("filter-handler")).toBeInTheDocument();
    expect(screen.getByText("runName: obs-safe")).toBeInTheDocument();
    expect(screen.getByText("projectName: COLLECTION-1")).toBeInTheDocument();
    expect(screen.getByText("frequency: unknown")).toBeInTheDocument();
  });
});
