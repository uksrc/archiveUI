import { useMemo, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { DateTime } from "luxon";
import type { FilterFeatureBadgeType } from "../objects/Objects";
import { AstroLib } from "@tsastro/astrolib";

const FEATURE_TO_PARAM: Record<string, string> = {
  RA: "ra",
  Dec: "dec",
  Band: "band",
  Frequency: "freqMin",
  Date: "dateMin",
  Project: "project",
  Target: "target",
  Radius: "radius",
  //may need to add date and freq max if we want to support ranged filters in the future
};

const PARAM_TO_LABEL: Record<string, string> = {
  ra: "RA",
  dec: "Dec",
  band: "Band",
  freqMin: "Frequency",
  dateMin: "Date",
  project: "Project",
  target: "Target",
  radius: "Radius",
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

 

    //loop through the URL search parameters and create a badge for each active filter, using the PARAM_TO_LABEL mapping to get the display label for each filter type. It also formats the display value for frequency and date filters to show the range if both min and max values are present.
    Object.entries(PARAM_TO_LABEL).forEach(([paramKey, label]) => {
      const value = params.get(paramKey);
      if (!value) {
        return;
      }

      

      //TODO: if the value includes a paramKey, overwrite the current paramKey -- possibly use : as a separator for the value to allow for multiple values for the same feature, e.g. ra:10:20 to specify a range of RA values, or ra:10,20 to specify multiple RA values. This would require updating the addFilter function to handle adding multiple values for the same feature, and updating the display of the badges to show all values for a feature.


      let displayValue = value;

      if (paramKey === "freqMin" && params.get("freqMax")) {
        displayValue = `${Number.parseInt(value)/1e9} - ${Number.parseInt(params.get("freqMax")!)/1e9} GHz`;
      } else if (paramKey === "freqMin") {
        displayValue = `${Number.parseInt(value)/1e9} GHz - ∞`;
      }
      if (paramKey === "dateMin" && params.get("dateMax")) {
        displayValue = `${DateTime.fromISO(value).toFormat("dd/MM/yyyy")} - ${DateTime.fromISO(params.get("dateMax")!).toFormat("dd/MM/yyyy")}`;
      }
        else if (paramKey === "dateMin") {
        displayValue = `${DateTime.fromISO(value).toFormat("dd/MM/yyyy")} - ∞`;
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


  function convertFrequencyToHz(value: string, unit = "MHz"): string {
    const unitLower = unit.toLowerCase();
    if (unitLower === "hz") {
      return value;
    }
     if (unitLower === "khz") {
      return (parseFloat(value) * 1000).toString();
    }
    if (unitLower === "mhz") {
      return (parseFloat(value) * 1000000).toString();
    }
    if (unitLower === "ghz") {
      return (parseFloat(value) * 1000000000).toString();
    }
    return "-1";
  }

  //function to handle adding a filter, checks the selected feature and value, validates them, and updates the URL search params accordingly. Also handles ranged filters for frequency and date.
  function addFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const selectedFeature = String(formData.get("filter-feature") ?? "");
    const filterValue = String(formData.get("filter-value") ?? "").trim();

    if (selectedFeature === "" || filterValue === "") {
      //TODO: see if we can find the filter value for the selected feature in the URL search params, if not alert the user to provide both the type and value for each filter
      alert("you must provide both the type and value for each filter");
      return;
    }

    const paramKey = FEATURE_TO_PARAM[selectedFeature];
    if (!paramKey) {
      return;
    }

    const nextParams = new URLSearchParams(location.search);


    if(paramKey === "ra") {
      console.log("attempt RA to deg");
      console.log(filterValue);
      console.log(AstroLib.HmsToDeg(filterValue ?? ""));
      const updateRA = AstroLib.HmsToDeg(filterValue ?? "").toString();
      if(updateRA !== "NaN") {
        nextParams.set(paramKey, updateRA);
      }
    }
    
    if(paramKey === "dec") {
      console.log("attempt Dec to deg");
      console.log(filterValue);
      console.log(AstroLib.DmsToDeg(filterValue ?? ""));
      const updateDec = AstroLib.DmsToDeg(filterValue ?? "").toString();
      if(updateDec !== "NaN") {
        nextParams.set(paramKey, updateDec);
      }
    }

    //manage ra and !dec AND !ra and dec
    if(nextParams.get("ra") && !nextParams.get("dec")) {
      console.log("RA provided without Dec");
      //hold the value and flag to the user that a dec is required before this search param can be applied, we should do this by adding a badge with the RA value and a message to provide a Dec value to apply the filter, and only apply the RA filter once both values are present. 

    }
    if(nextParams.get("dec") && !nextParams.get("ra")) {
      console.log("Dec provided without RA");
      //hold the value and flag to the user that a RA is required before this search param can be applied, we should do this by adding a badge with the Dec value and a message to provide a RA value to apply the filter, and only apply the Dec filter once both values are present.
    }


    if (RANGED_FILTERS.has(paramKey)) {
      const { min, max } = parseRange(filterValue);
      
   
      //format date to ISO format for API if date filter
      if(paramKey === "dateMin") {
        //convert date to ISO format for API, if not in correct format alert user
        const minD = convertToISODate(min, 0);
        if (minD === null) {
          alert("Invalid date format. Please use dd/mm/yyyy or dd-mm-yyyy.");
          return;
        }
        //check if we have a current value, if we do handle the new value accordingly; if lower than the current min value, set the new value as the min value and keep the current max value, if higher than the current min value, set the new value as the max value and keep the current min value, if we don't have a current value, set the new value as the min value and leave the max value empty for now
        const currentValue = nextParams.get(paramKey);

        if (currentValue) {
          const currentMin = DateTime.fromISO(currentValue);
          const newMin = DateTime.fromISO(minD);
          const currentMax = nextParams.get("dateMax") ? DateTime.fromISO(nextParams.get("dateMax")!) : null;
          
          if (newMin > currentMin) {
            //set if new value is higher than current min value, set new max value and keep current min value if it exists, if new max value is lower than current min value, set new max value and remove current min value
            //set current max value and keep min value
            nextParams.set("dateMax", minD);
            console.log("resetting max date");
            
          } else {      
            //set if new min value is lower than current min value, set new min value and keep current max value if it exists, if new min value is higher than current max value, set new min value and remove current max value      
            //update current min value
            nextParams.set(paramKey, minD);
            console.log("resetting min date");
          }
          //we could do even more clever handling updating the intermediate values if the new value is between the current min and max values, but this should be something we can add in the future if we want to support more complex date filtering
        } else {
          //set if no current value, set the new value as the min value and leave the max value empty for now
          nextParams.set(paramKey, minD);
          console.log("prime set min date");
        }
      }
      else
      {
        nextParams.set(paramKey, convertFrequencyToHz(min, "GHz"));

        //replicate the same logic as above for frequency filters, but with the added complexity of converting the frequency value to Hz for the API, and converting it back to GHz for display in the badge. We also need to handle the case where the user inputs a frequency range in GHz, e.g. "1-2 GHz", which would require us to convert both values to Hz and set them as the min and max values in the URL search params.
        const currentValue = nextParams.get(paramKey);
        if (currentValue) {
          const currentMin = parseFloat(currentValue);
          const newMin = parseFloat(convertFrequencyToHz(min, "GHz"));
          const currentMax = nextParams.get("freqMax") ? parseFloat(nextParams.get("freqMax")!) : null;
        
          if (newMin > currentMin) {
            nextParams.set("freqMax", convertFrequencyToHz(min, "GHz"));
            console.log("resetting max frequency");
          }
          else {
            nextParams.set(paramKey, convertFrequencyToHz(min, "GHz"));
          }

        console.log("prime set min frequency");
        }
      }

      const maxKey = paramKey === "freqMin" ? "freqMax" : "dateMax";
      if(maxKey === "dateMax")
      {
        if(max !== null) {
          const maxD = max ? convertToISODate(max, 1) : null;
            if(maxD !== null) {
            nextParams.set(maxKey, maxD);
            console.log("secondary set max date hit");
            }
          }
      }
      else
      {
        if (max !== null) {
          nextParams.set(maxKey, convertFrequencyToHz(max, "GHz"));
          console.log("secondary set max frequency");
        } else {
          nextParams.delete(maxKey);
          console.log("delete max frequency");
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
              <option value="Date">Date [dd/mm/yyyy]</option>
              <option value="Project">Project Name</option>
              <option value="Target">Target</option>
              <option value="RA">RA [h m s]</option>
              <option value="Dec">Dec [deg m s]</option>
              <option value="Radius">Search Radius</option>
              <option value="Band">Band</option>
              <option value="Frequency">Frequency [GHz]</option>
              
              
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
