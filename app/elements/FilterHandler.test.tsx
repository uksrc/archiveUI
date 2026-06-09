import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FilterHandler from "./FilterHandler";

type BadgeCase = {
  name: string;
  search: string;
  expectedLabel: string;
  expectedValue: string;
};

type PositionTestCase = {
  name: string;
  RaQuery: string;
  DecQuery: string;

};

// Define test cases for text input badges based on URLSearchParams
const textInputCases: BadgeCase[] = [
  {
    name: "project text input from query string",
    search: "?project=ALMA+Archive",
    expectedLabel: "Project",
    expectedValue: "ALMA Archive",
  },
  {
    name: "target text input from query string",
    search: "?target=NGC1300",
    expectedLabel: "Target",
    expectedValue: "NGC1300",
  },
  {
    name: "band text input from query string",
    search: "?band=F",
    expectedLabel: "Band",
    expectedValue: "F",
  },
];

const positionInputCases: PositionTestCase[] = [
  {
    name: "RA input from query string",
    RaQuery: "?ra=10+20+30.123",
    DecQuery: "?dec=10+20+30.456",
  },
];

// Helper function to render FilterHandler with a given search string in the URL
function renderFilterHandlerWithSearch(search: string) {
  render(
    <MemoryRouter initialEntries={[`/observations${search}`]}>
      <Routes>
        <Route path="/observations" element={<FilterHandler />} />
      </Routes>
    </MemoryRouter>
  );
}

// Helper function to simulate user input for adding a filter
function submitFilter(feature: string, value: string) {
  fireEvent.change(screen.getByRole("combobox"), { target: { value: feature } });
  fireEvent.change(screen.getByPlaceholderText("Filter items..."), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: /add filter/i }));
}

// Spy on window.alert to verify that validation alerts are shown when expected
let alertSpy: ReturnType<typeof vi.spyOn>;

// Set up and tear down the alert spy before and after each test
beforeEach(() => {
  alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  alertSpy.mockRestore();
  cleanup();
});

// Test suite for verifying that text badges are rendered based on URLSearchParams
describe("FilterHandler URLSearchParams text badges", () => {
  it.each(textInputCases)("renders $name", ({ search, expectedLabel, expectedValue }) => {
    renderFilterHandlerWithSearch(search);
    // find the badge by role and accessible name, which should be in the format "Label | Value", ignoring case and whitespace around the pipe
    const badge = screen.getByRole("button", {
    name: new RegExp(`${expectedLabel}\\s*\\|\\s*${expectedValue}`, "i"),
    });
    expect(badge).toBeInTheDocument();
  });
});

// Test suite for verifying that filter input validation works correctly for various filter types
describe("FilterHandler regex validation", () => {
  // Tests for Band filter input validation
  it("accepts valid band input and shows a badge", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Band", "ABCDEF");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("ABCDEF")).toBeInTheDocument();
  });
  // Tests for invalid Band filter input
  it("rejects invalid band input and shows validation alert", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Band", "Band7");

    expect(alertSpy).toHaveBeenCalledWith("Invalid filter value format.");
    expect(screen.queryByText("Band7")).not.toBeInTheDocument();
  });

  // RA filter requires Dec filter to be present, but this test verifies that valid RA input is accepted if Dec filter is already present.
  it("accepts valid RA input (with extant Dec and Radius filters)", () => {
    renderFilterHandlerWithSearch("?dec=10+20+30.456&radius=0.5");

    submitFilter("RA", "10 20 30.123");
    
    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("RA")).toBeInTheDocument();
  });

  it("rejects invalid RA input and shows RA format warning", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("RA", "abc");

    expect(alertSpy).toHaveBeenCalledWith(
      "RA value not in correct format. Please use h m s format, e.g. 10 20 30.046"
    );
  });

  it("accepts valid Dec input (with extant RA and Radius filters)", () => {
    renderFilterHandlerWithSearch("?ra=10+20+30.123&radius=0.5");

    submitFilter("Dec", "10 20 30.456");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("Dec")).toBeInTheDocument();
  });

  it("rejects out-of-bounds Dec input", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Dec", "91 00 00.000");

    expect(alertSpy).toHaveBeenCalledWith(
      "Dec is out of bounds. Please provide a value between -90 and 90 degrees, in d m s format, e.g. -10 20 30.044"
    );
  });

  it("accepts valid Radius input", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Radius", "0.5");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("0.5°")).toBeInTheDocument();
  });

  it("rejects invalid Radius input and shows radius format warning", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Radius", "-0.5");

    expect(alertSpy).toHaveBeenCalledWith(
      "Radius value not in correct format. Please provide a number with optional degree symbol, e.g. '0.1' or '0.5°'."
    );
  });

  it("accepts valid Date input", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Date", "01/05/2026");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("01/05/2026 - ∞")).toBeInTheDocument();
  });

  it("rejects invalid Date input and shows date format warning", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Date", "2026-05-01");

    expect(alertSpy).toHaveBeenCalledWith(
      "Date value not in correct format. Please use dd/mm/yyyy, dd-mm-yyyy, or dd mm yyyy format."
    );
  });

  it("accepts valid Frequency input", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Frequency", "1 GHz");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("1 GHz - ∞")).toBeInTheDocument();
  });

  it("rejects invalid Frequency input and shows frequency format warning", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Frequency", "abc GHz");

    expect(alertSpy).toHaveBeenCalledWith(
      "Frequency value not in correct format. Please provide a number with optional appropriate SI unit, e.g. '1 GHz', '500 MHz', '100 kHz', or '1000000 Hz'."
    );
  });
});

describe("FilterHandler position partial and pending behavior", () => {
// RA filter can be added without Dec filter, but Dec filter cannot be added without RA filter. This test verifies that RA input is accepted even if Dec filter is not yet present.
   it("Sets RA as pending when missing Dec filter and Radius filter", () => {
    renderFilterHandlerWithSearch("?ra=10+20+30.123");
    
    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("! RA")).toBeInTheDocument();
  });

  it("sets Dec as pending when missing RA filter and Radius filter", () => {
    renderFilterHandlerWithSearch("?dec=10+20+30.456");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("! Dec")).toBeInTheDocument();
  });

  it("sets Radius as pending when missing RA filter and Dec filter", () => {
    renderFilterHandlerWithSearch("?radius=0.05");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("! Radius")).toBeInTheDocument();
  });

  it("default radius is added when RA filter is added", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("RA", "10 20 30.123");
    
    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("! Radius")).toBeInTheDocument();
  });

  it("RA accepted as a decimal value", () => {
    renderFilterHandlerWithSearch("");
    submitFilter("RA", "25.00012");
    //define button with text "RA" and check that it has text content "25.00012°"
    const badge = screen.getByRole("button", { name: /RA/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("25.00012°");
  });

  it("Dec accepted as a decimal value", () => {
    renderFilterHandlerWithSearch("");
    submitFilter("Dec", "40.10212");
    //define button with text "Dec" and check that it has text content "40.10212°"
    const badge = screen.getByRole("button", { name: /Dec/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("40.10212°");
  });

  
  //tests pending 
  //tests default radius
  it("default radius is added when Dec filter is added", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Dec", "10 20 30.456");
    
    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("! Radius")).toBeInTheDocument();
  });

  it("default radius is added when RA is extant and Dec filter is added", () => {
    renderFilterHandlerWithSearch("?ra=10+20+30.123");

    submitFilter("Dec", "10 20 30.456");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.queryByText("RA")).toBeInTheDocument();
    expect(screen.queryByText("Dec")).toBeInTheDocument();
    expect(screen.getByText("Radius")).toBeInTheDocument();
  });

    it("default radius is added when RA is extant and Dec filter is added", () => {
    renderFilterHandlerWithSearch("?dec=10+20+30.456");

    submitFilter("RA", "10 20 30.123");
    
    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.queryByText("RA")).toBeInTheDocument();
    expect(screen.queryByText("Dec")).toBeInTheDocument();
    expect(screen.getByText("Radius")).toBeInTheDocument();
  });

});


describe("check range handling, date and frequency", () => {
  it("date input > current dateMin adds dateMax", () => {
    renderFilterHandlerWithSearch("?dateMin=2020-01-01T00%3A00%3A00.000Z");
    submitFilter("Date", "31/12/2020"); //note UK format
    expect(alertSpy).not.toHaveBeenCalled();
    const badge = screen.getByRole("button", { name: /Date/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("01/01/2020 - 31/12/2020");
  });

  it("date input < current dateMin updates dateMin", () => {
    renderFilterHandlerWithSearch("?dateMin=2020-12-31T00%3A00%3A00.000Z");
    submitFilter("Date", "01/01/2020"); //note UK format
    expect(alertSpy).not.toHaveBeenCalled();
    const badge = screen.getByRole("button", { name: /Date/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("01/01/2020 - ∞");
  });

  it("date input > current dateMin updates dateMax with extant range specification", () => {
    renderFilterHandlerWithSearch("?dateMin=2020-01-01T00%3A00%3A00.000Z&dateMax=2020-12-31T00%3A00%3A00.000Z");
    submitFilter("Date", "31/12/2021"); //note UK format
    expect(alertSpy).not.toHaveBeenCalled();
    const badge = screen.getByRole("button", { name: /Date/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("01/01/2020 - 31/12/2021");
  });

  it("date input < current dateMin updates dateMin with extant range specification", () => {
    renderFilterHandlerWithSearch("?dateMin=2020-01-01T00%3A00%3A00.000Z&dateMax=2020-12-31T00%3A00%3A00.000Z");
    submitFilter("Date", "01/01/2019"); //note UK format
    expect(alertSpy).not.toHaveBeenCalled();
    const badge = screen.getByRole("button", { name: /Date/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("01/01/2019 - 31/12/2020");
  });  

  it("date range input adds range", () => {
    renderFilterHandlerWithSearch("");
    submitFilter("Date", "01/01/2020 - 30/12/2020"); //note UK format
    expect(alertSpy).not.toHaveBeenCalled();
    const badge = screen.getByRole("button", { name: /Date/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("01/01/2020 - 30/12/2020");
  });

  it("max data within daylight saving time change is handled correctly as range", () => {
    renderFilterHandlerWithSearch("");
    submitFilter("Date", "25/5/2020 - 1/7/2020");
    expect(alertSpy).not.toHaveBeenCalled();
    const badge = screen.getByRole("button", { name: /Date/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("25/05/2020 - 01/07/2020");
  });

  it("max data within daylight saving time change is handled correctly with extant dateMin", () => {
    renderFilterHandlerWithSearch("?dateMin=2020-05-25T00%3A00%3A00.000Z");
    submitFilter("Date", "1/7/2020");
    expect(alertSpy).not.toHaveBeenCalled();
    const badge = screen.getByRole("button", { name: /Date/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("25/05/2020 - 01/07/2020");
  });



  //   it("accepts valid Date input", () => {
  //   renderFilterHandlerWithSearch("");
  //   submitFilter("Date", "01/01/2020-31/12/2021");
  //   expect(alertSpy).not.toHaveBeenCalled();
  //   const badge = screen.getByRole("button", { name: /Date/i });
  //   expect(badge).toBeInTheDocument();
  //   expect(screen.getByText("01/05/2026 - ∞")).toBeInTheDocument();
  // });
  
  // it("handles date range input correctly", () => {
  //   renderFilterHandlerWithSearch("?date=01/01/2020-31/12/2021");
  //   const badge = screen.getByRole("button", { name: /Date/i });
  //   expect(badge).toBeInTheDocument();
  //   expect(badge).toHaveTextContent("01/01/2020 - 31/12/2021");
  // });

  // it("handles frequency range input correctly", () => {
  //   renderFilterHandlerWithSearch("?frequency=1+GHz-10+GHz");
  //   const badge = screen.getByRole("button", { name: /Frequency/i });
  //   expect(badge).toBeInTheDocument();
  //   expect(badge).toHaveTextContent("1 GHz - 10 GHz");
  // });

  // it("handles frequency range input correctly", () => {
  //   renderFilterHandlerWithSearch("?frequency=1+GHz-10+GHz");
  //   const badge = screen.getByRole("button", { name: /Frequency/i });
  //   expect(badge).toBeInTheDocument();
  //   expect(badge).toHaveTextContent("1 GHz - 10 GHz");
  // });
});