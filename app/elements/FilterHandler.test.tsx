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

function renderFilterHandlerWithSearch(search: string) {
  render(
    <MemoryRouter initialEntries={[`/observations${search}`]}>
      <Routes>
        <Route path="/observations" element={<FilterHandler />} />
      </Routes>
    </MemoryRouter>
  );
}

function submitFilter(feature: string, value: string) {
  fireEvent.change(screen.getByRole("combobox"), { target: { value: feature } });
  fireEvent.change(screen.getByPlaceholderText("Filter items..."), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: /add filter/i }));
}

let alertSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  alertSpy.mockRestore();
  cleanup();
});

describe("FilterHandler URLSearchParams text badges", () => {
  it.each(textInputCases)("renders $name", ({ search, expectedLabel, expectedValue }) => {
    renderFilterHandlerWithSearch(search);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    expect(screen.getByText(expectedValue)).toBeInTheDocument();
  });
});

describe("FilterHandler regex validation", () => {
  it("accepts valid band input and shows a badge", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Band", "ABCDEF");

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByText("ABCDEF")).toBeInTheDocument();
  });

  it("rejects invalid band input and shows validation alert", () => {
    renderFilterHandlerWithSearch("");

    submitFilter("Band", "Band7");

    expect(alertSpy).toHaveBeenCalledWith("Invalid filter value format.");
    expect(screen.queryByText("Band7")).not.toBeInTheDocument();
  });

  it("accepts valid RA input", () => {
    renderFilterHandlerWithSearch("");

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

  it("accepts valid Dec input", () => {
    renderFilterHandlerWithSearch("");

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
