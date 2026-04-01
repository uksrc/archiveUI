import { useMemo, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { DateTime } from "luxon";
import type { FilterFeatureBadgeType } from "../objects/Objects";


const FEATURE_TO_PARAM: Record<string, string> = {
  RA: "ra",
  Dec: "dec",
  Band: "band",
  Freq: "freqMin",
  Date: "dateMin",
  Project: "project",
  TargetName: "target",
  //may need to add date and freq max if we want to support ranged filters in the future
};

const PARAM_TO_LABEL: Record<string, string> = {
  ra: "RA",
  dec: "Dec",
  band: "Band",
  freqMin: "Freq",
  dateMin: "Date",
  project: "Project",
  target: "TargetName",
  //may need to add date and freq max if we want to support ranged filters in the future
};

const RANGED_FILTERS = new Set(["freqMin", "dateMin"]);

function parseRange(value: string): { min: string; max: string | null } {
  const cleaned = value.trim();
  if (!cleaned.includes("-")) {
    return { min: cleaned, max: null };
  }

  const [minRaw, maxRaw] = cleaned.split("-");
  const min = minRaw?.trim() ?? "";
  const max = maxRaw?.trim() ?? "";
  return { min, max: max === "" ? null : max };
}

//Component to handle the filter functionality, including adding and removing filters, and displaying the active filters as badges. It uses URL search parameters to store the active filters, and updates the URL accordingly when filters are added or removed. It also handles ranged filters for frequency and date, allowing users to specify a range of values for these features.
export default function FilterHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  const filterFeature = useMemo<FilterFeatureBadgeType[]>(() => {
    const params = new URLSearchParams(location.search);
    const badges: FilterFeatureBadgeType[] = [];

    Object.entries(PARAM_TO_LABEL).forEach(([paramKey, label]) => {
      const value = params.get(paramKey);
      if (!value) {
        return;
      }

      let displayValue = value;
      if (paramKey === "freqMin" && params.get("freqMax")) {
        displayValue = `${value} - ${params.get("freqMax")}`;
      }
      if (paramKey === "dateMin" && params.get("dateMax")) {
        displayValue = `${DateTime.fromISO(value).toFormat("dd/MM/yyyy")} - ${DateTime.fromISO(params.get("dateMax")!).toFormat("dd/MM/yyyy")}`;
      }

      badges.push({
        label,
        query: paramKey,
        value: displayValue,
      });
    });

    return badges;
  }, [location.search]);

  //function to update the URL search parameters and navigate to the new URL with the updated filters
  function submitFilters(nextParams: URLSearchParams) {
    const nextSearch = nextParams.toString();
    navigate(`${nextSearch ? `?${nextSearch}` : ""}`);
    //navigate(`\observations${nextSearch ? `?${nextSearch}` : ""}`);
  }

  //EOL function to convert date string in dd/mm/yyyy or dd-mm-yyyy format to ISO format for API, returns null if not in correct format
  //also adds a modifier to the day value to allow for ranged date filters, if modifier is 1 adds 1 day to the date to set the max date to the end of the min date
  function convertToISODate(dateStr: string, modifier = 0): string | null {

    const datePattern = /[-\\/| ]/g;
    const dateFormat = /[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}/g;
    const cleaned = dateStr.replaceAll(datePattern, "-");
    const valid = cleaned.match(dateFormat);
    if (!valid) {
      return null;
    }
   
    const [day, month, year] = cleaned.split("-").map(Number);

    const date = DateTime.utc(year, month, day + modifier);      
    return date.toISO();

  }

  //function to handle adding a filter, checks the selected feature and value, validates them, and updates the URL search params accordingly. Also handles ranged filters for frequency and date.
  function addFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const selectedFeature = String(formData.get("filter-feature") ?? "");
    const filterValue = String(formData.get("filter-value") ?? "").trim();

    if (selectedFeature === "" || filterValue === "") {
      alert("you must provide both the type and value for each filter");
      return;
    }

    const paramKey = FEATURE_TO_PARAM[selectedFeature];
    if (!paramKey) {
      return;
    }

    const nextParams = new URLSearchParams(location.search);
    console.log("param key - " + paramKey);

    if (RANGED_FILTERS.has(paramKey)) {
      const { min, max } = parseRange(filterValue);
      
      
      //formate date to ISO format for API if date filter
      if(paramKey === "dateMin") {
        //convert date to ISO format for API, if not in correct format alert user
        const minD = convertToISODate(min, 0);
        let maxD = max ? convertToISODate(max, 1) : null;
        if (minD === null) {
          alert("Invalid date format. Please use dd/mm/yyyy or dd-mm-yyyy.");
          return;
        }

        nextParams.set(paramKey, minD);
      }
      else
      {
        nextParams.set(paramKey, min);
      }

      const maxKey = paramKey === "freqMin" ? "freqMax" : "dateMax";
      if(maxKey === "dateMax")
      {
        if(max === null) {
          const maxD = convertToISODate(min, 1); //if max date is invalid, set it to the end of the min date
          if(maxD !== null) {
          nextParams.set(maxKey, maxD);
          }
          else
          {
            nextParams.delete(maxKey);
          }
        }
      }
      else
      {
        if (max) {
          nextParams.set(maxKey, max);
        } else {
          nextParams.delete(maxKey);
        }
      }
    } else {
      nextParams.set(paramKey, filterValue);
    }

    submitFilters(nextParams);
    event.currentTarget.reset();
  }

  //function to handle removing a filter, deletes the specified filter from the URL search params and updates the URL accordingly. Also handles removing the associated max value for ranged filters when the min value is removed.
  function removeFilter(paramKey: string) {
    const nextParams = new URLSearchParams(location.search);
    nextParams.delete(paramKey);

    if (paramKey === "freqMin") {
      nextParams.delete("freqMax");
    }
    if (paramKey === "dateMin") {
      nextParams.delete("dateMax");
    }
    submitFilters(nextParams);
  }

  return (
    <>
      <div className="w-[100%] flex items-center justify-center mt-6 p-2">
        <form onSubmit={addFilter} className="flex flex-col min-w-[80%] max-w-[100%]">
          <div className="flex flex-1 min-w-[60%] max-w-[100%] rounded-md text-center focus:outline-none focus:ring-2 focus:ring-violet-500 hover:bg-blue-800 shadow-md">
            <select
              className="gb_dropdown_content gb_dropdown
                            flex min-w-[12vw]
                            rounded-l-md
                            bg-linear-to-br from-purple-200 to-fuchsia-300
                            text-center text-gray-900
                            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:rounded-tl-md"
              name="filter-feature"
              id="filter-feature"
              defaultValue=""
            >
              <option value="">Feature...</option>
              <option value="RA">RA [h m s]</option>
              <option value="Dec">Dec [deg m s]</option>
              <option value="Band">Band</option>
              <option value="Freq">Frequency [GHz]</option>
              <option value="Date">Date [dd/mm/yyyy]</option>
              <option value="Project">Project Name</option>
              <option value="TargetName">Target Name</option>
            </select>
            <input
              type="text"
              name="filter-value"
              placeholder="Filter items..."
              className="flex flex-4 w-full p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 text-centre bg-white shadow-md"
            />

            <button
              type="submit"
              className="flex flex-1 px-2 py-2 bg-linear-to-br from-purple-200 to-fuchsia-300 text-gray-900 rounded-r-md focus:outline-none focus:ring-2 focus:ring-violet-500 hover:bg-blue-800 shadow-md"
            >
              <p className="text-center m-auto min-w-[40%]">Add Filter</p>
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-wrap items-center gap-2 py-0 px-4">
        {filterFeature.map((item, index) => (
          <FilterFeatureBadge
            key={`${item.query ?? "badge"}-${index}`}
            details={item}
            onRemove={removeFilter}
          />
        ))}
      </div>
    </>
  );
}

//Component to display a badge for each active filter, showing the filter type and value, and allowing the user to remove the filter by clicking on the badge. It receives the filter details and the remove function as props. 
//It checks if the filter has a query value, and if so, renders a button with the filter label and value, and an onClick handler that calls the remove function with the filter's query key when clicked.
function FilterFeatureBadge({
  details,
  onRemove,
}: {
  details: FilterFeatureBadgeType;
  onRemove: (paramKey: string) => void;
}) {
  if (!details.query) {
    return null;
  }

  return (
    <button
      type="button"
      className="w-{100%} flex flex-none m-auto p-4 bg-blue-800 rounded-full shadow-lg"
      onClick={() => onRemove(details.query as string)}
    >
      <span className="text-gray-100">{details.label ?? "none"}</span>
      <span className="inline-block mx-2 text-gray-400">|</span>
      <span className="text-blue-300">{details.value ?? "none"}</span>
    </button>
  );
}
