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

const PARAM_TO_REGEX: Record<string, RegExp> = {
  ra: /^(\d{1,2})[ -.:](\d{1,2})[ -.:](\d{1,2}(\.\d+)[sS]*)$/,
  dec: /^[-+]{0,1}(\d{1,2})\D(\d{1,2})\D(\d{1,2}(\.\d+)[sS]*)$/,
  alt_ra_dec: /^[-+]{0,1}(\d+(?:\.\d+)?)\s*°?$/, //alternative regex to match RA and Dec values in decimal degrees format, e.g. "150.25°" or "-45.5°", with optional degree symbol
  band: /^[A-Za-z]{1,6}$/, // allow only letters for band, with a maximum length of 6 characters
  freqMin: /^(\d+(?:\.\d+)?)\s*((-\s*\d+(?:\.\d+)?)\s*)?(GHz|MHz|kHz|Hz)?$/, // regex to match frequency values with optional unit suffix, e.g. "1 GHz", "500 MHz", "100 kHz", "1000000 Hz"
  dateMin: /^(\d{1,2}[-\/ ]\d{1,2}[-\/ ]\d{4})(\s*-\s*(\d{1,2}[-\/ ]\d{1,2}[-\/ ]\d{4})$)?/, // regex to match date in dd/mm/yyyy, dd-mm-yyyy, OR dd mm yyyy format
  project: /^.*$/, // allow any string
  target: /^.*$/, // allow any string
  radius: /^(\d+(?:\.\d+)?)\s*°?$/, // regex to match radius values with optional degree symbol, e.g. "0.1", "0.5°"
};

const PARAM_TO_FORMATWARNING: Record<string, string> = {
  ra: "RA value not in correct format. Please use h m s format, e.g. 10 20 30.046",
  dec: "Dec value not in correct format. Please use d m s format, e.g. 10 20 30.047",
  freqMin: "Frequency value not in correct format. Please provide a number with optional appropriate SI unit, e.g. '1 GHz', '500 MHz', '100 kHz', or '1000000 Hz'.",
  dateMin: "Date value not in correct format. Please use dd/mm/yyyy, dd-mm-yyyy, or dd mm yyyy format.",
  radius: "Radius value not in correct format. Please provide a number with optional degree symbol, e.g. '0.1' or '0.5°'.",
};

const RANGED_FILTERS = new Set(["freqMin", "dateMin"]);

const DEFAULT_FILTER_RADIUS = "0.05"; // default search radius in degrees for RA/Dec filters when one is provided without the other, we can adjust this value as needed based on typical use cases and user feedback

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

function formatISODateAsUTC(isoDate: string): string {
  return DateTime.fromISO(isoDate, { setZone: true }).toUTC().toFormat("dd/MM/yyyy");
}

//Component to handle the filter functionality, including adding and removing filters, and displaying the active filters as badges. It uses URL search parameters to store the active filters, and updates the URL accordingly when filters are added or removed. It also handles ranged filters for frequency and date, allowing users to specify a range of values for these features.
export default function FilterHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  const filterFeature = useMemo<FilterFeatureBadgeType[]>(() => {
    const params = new URLSearchParams(location.search);
    const badges: FilterFeatureBadgeType[] = [];
    let isPending = false; // default colour for badges, we can adjust this as needed or make it dynamic based on the filter type or value

    //loop through the URL search parameters and create a badge for each active filter, using the PARAM_TO_LABEL mapping to get the display label for each filter type. It also formats the display value for frequency and date filters to show the range if both min and max values are present.
    Object.entries(PARAM_TO_LABEL).forEach(([paramKey, label]) => {
      const value = params.get(paramKey);
      if (!value) {
        return;
      }
      let displayValue = value;

      //reset isPending to false for each filter, we will set it to true later if we determine that the filter is pending based on the presence of certain parameters or values. This ensures that the badge for each filter is displayed with the correct style based on whether it's active or pending.
      isPending = false; 
      
      //RA, DEC, RADIUS
      if(paramKey === "ra" || paramKey === "dec" || paramKey === "radius") {
        //check params for RA, Dec and Radius to ensure all are present - if not record that fact and continue
        if((params.get("ra") || params.get("dec") || params.get("radius")) 
          && !(params.get("ra") && params.get("dec") && params.get("radius"))) {
            isPending = true;
        }
        //add a degree symbol if it's missing
        if(paramKey === "radius") {
          if(!value.includes("°")) {
            displayValue = `${value}°`;
          }
          else {
            displayValue = value;
          }
        }
        //add a degree symbol if degree format and it's missing
        if(paramKey === "ra" || paramKey === "dec") {
          
          const regex = PARAM_TO_REGEX["alt_ra_dec"];
          if(!regex.test(value)) {
            //dont reformat
          } else {
            if(!value.includes("°")) {
              displayValue = `${value}°`;
            }
            else {
              displayValue = value;
            }
          }
        }
      }

      //TODO: if the value includes a paramKey, overwrite the current paramKey -- possibly use : as a separator for the value to allow for multiple values for the same feature, e.g. ra:10:20 to specify a range of RA values, or ra:10,20 to specify multiple RA values. This would require updating the addFilter function to handle adding multiple values for the same feature, and updating the display of the badges to show all values for a feature.
      
      if (paramKey === "freqMin" && params.get("freqMax")) {
        displayValue = `${Number.parseInt(value)/1e9} - ${Number.parseInt(params.get("freqMax")!)/1e9} GHz`;
      } else if (paramKey === "freqMin") {
        displayValue = `${Number.parseInt(value)/1e9} GHz - ∞`;
      }
      if (paramKey === "dateMin" && params.get("dateMax")) {
        displayValue = `${formatISODateAsUTC(value)} - ${formatISODateAsUTC(params.get("dateMax")!)}`;
      }
        else if (paramKey === "dateMin") {
        displayValue = `${formatISODateAsUTC(value)} - ∞`;
      }

      badges.push({
        label,
        query: paramKey,
        value: displayValue,
        isPending: isPending,
      });
    });

    return badges;
  }, [location.search]);

  function validateFilterValue(paramKey: string, value: string): boolean {
    const regex = PARAM_TO_REGEX[paramKey];
    if (!regex) {
      return true; // if no regex defined for the parameter, consider it valid by default
    }

    if(regex.test(value)) {
      //all good
    } else if ((paramKey === "ra" || paramKey === "dec") && PARAM_TO_REGEX["alt_ra_dec"].test(value)) {
      //special case: passes if alternative pattern matches RA and Dec in decimal degrees format
      return true;
    } else {
      alert(PARAM_TO_FORMATWARNING[paramKey] || "Invalid filter value format.");
      console.log(`"${value}" is not the correct format for ${paramKey}. Expected format: ${regex}`);
    }
    
    return regex.test(value);
  }

  function parseSubmittedFilter(event: FormEvent<HTMLFormElement>) : {paramKey: string, filterValue: string} | "" {
    const formData = new FormData(event.currentTarget);
    const selectedFeature = String(formData.get("filter-feature") ?? "");
    const filterValue = String(formData.get("filter-value") ?? "").trim();
    ;

    if (selectedFeature === "" || filterValue === "") {
      //TODO: see if we can find the filter value for the selected feature in the URL search params, if not alert the user to provide both the type and value for each filter
      alert("you must provide both the type and value for each filter");
      return "";
    }

    const paramKey = FEATURE_TO_PARAM[selectedFeature];
    if (!paramKey) {
      alert("no query parameter found for selected filter type");
      return "";
    }

    //validate the filter value based on the selected feature, using the PARAM_TO_REGEX mapping to get the appropriate regex for each filter type. If the value does not match the expected format, alert the user and do not add the filter.
    if (!validateFilterValue(paramKey, filterValue)) {
      return "";
    }

    return {paramKey, filterValue};
  }

  //function to handle adding a filter, checks the selected feature and value, validates them, and updates the URL search params accordingly. Also handles ranged filters for frequency and date.
  function addFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const validatedFilter = parseSubmittedFilter(event);
    if(validatedFilter === "") {
      return;
    }

    const nextParams = new URLSearchParams(location.search);

    //handle ra filter, converting from "10h 20m 30s" format to decimal degrees, and also handle the case where the user inputs a negative right ascension value, e.g. "-10h 20m 30s", which should be correctly converted to a negative decimal degree value for the API
    if(validatedFilter.paramKey === "ra") {
      let verifiedRA = validatedFilter.filterValue;
      
      //remove the degree symbol if it's included. 
      verifiedRA = verifiedRA.replace("°", "");

      //get segements and analyse the first for range checks
      const raAsSegemtents = validatedFilter.filterValue.match(PARAM_TO_REGEX[validatedFilter.paramKey]);
            
      if(raAsSegemtents) {
        console.log(`RA regex matched ${validatedFilter.filterValue}`);

        if(Number(raAsSegemtents[1]) >= 0 && Number(raAsSegemtents[1]) < 360){
          console.log("RA range matched");
          verifiedRA = AstroLib.HmsToDeg(validatedFilter.filterValue ?? "").toString();
          
          if(verifiedRA !== "NaN") {
            nextParams.set(validatedFilter.paramKey, verifiedRA);
            
            if(nextParams.get("radius") === null) {
              nextParams.set("radius", DEFAULT_FILTER_RADIUS);
            }
          }
          else{
            alert("RA value not in correct format. Please use h m s format, e.g. 10 20 30.042");
            return;
          }
        }
        else if (PARAM_TO_REGEX["alt_ra_dec"].test(validatedFilter.filterValue)) {
          nextParams.set(validatedFilter.paramKey, verifiedRA);
        } 
        else {
          alert("RA value not in correct format. Please use h m s format, e.g. 10 20 30.041");
          return;
        }
      }
    }

    
    //handle dec filter, converting from "10d 20m 30s" format to decimal degrees, and also handle the case where the user inputs a negative declination value, e.g. "-10d 20m 30s", which should be correctly converted to a negative decimal degree value for the API
    if(validatedFilter.paramKey === "dec"){
      let verifiedDec = validatedFilter.filterValue;

      //remove the degree symbol if it's included. 
      verifiedDec = verifiedDec.replace("°", "");

      const decAsSegemtents = validatedFilter.filterValue.match(PARAM_TO_REGEX[validatedFilter.paramKey]);
      
      if(decAsSegemtents) {
        if(Number(decAsSegemtents[1]) > -90 && Number(decAsSegemtents[1]) < 90) {
          verifiedDec = AstroLib.DmsToDeg(validatedFilter.filterValue ?? "").toString();
          
          if(verifiedDec !== "NaN") {
              nextParams.set(validatedFilter.paramKey, verifiedDec);
            
            if(nextParams.get("radius") === null) {
              nextParams.set("radius", DEFAULT_FILTER_RADIUS);
            }
          }
          else{
            alert("Dec value not in correct format. Please use d m s format, e.g. 10 20 30.040");
            return;
          }
        }
        else if (PARAM_TO_REGEX["alt_ra_dec"].test(validatedFilter.filterValue)) {
          nextParams.set(validatedFilter.paramKey, verifiedDec);
        } else {
          alert("Dec is out of bounds. Please provide a value between -90 and 90 degrees, in d m s format, e.g. -10 20 30.044");
          return;
        }
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

    //handle ranged filters for frequency and date, allowing users to specify a range of values for these features. We can use a simple syntax for the filter value, e.g. "1-2 GHz" for frequency or "01/01/2020 - 31/12/2020" for date, and parse the min and max values from the input string. We also need to handle the case where the user inputs only a min value, e.g. "1 GHz" or "01/01/2020", which should be interpreted as a range with no upper bound (i.e. "1 GHz - ∞" or "01/01/2020 - ∞").
    if (RANGED_FILTERS.has(validatedFilter.paramKey)) {
      const { min, max } = parseRange(validatedFilter.filterValue);
      
      //format date to ISO format for API if date filter
      if(validatedFilter.paramKey === "dateMin") {
        //convert date to ISO format for API, if not in correct format alert user
        const minD = convertToISODate(min);
        const maxD = convertToISODate(min, true);
        
        //TODO - TEST IF THIS IS HIT ANY MORE
        if (minD === null) {
          alert("Invalid date format. Please use dd/mm/yyyy or dd-mm-yyyy.");
          return;
        }
        //check if we have a current value, if we do handle the new value accordingly; if lower than the current min value, set the new value as the min value and keep the current max value, if higher than the current min value, set the new value as the max value and keep the current min value, if we don't have a current value, set the new value as the min value and leave the max value empty for now
        const currentValue = nextParams.get(validatedFilter.paramKey);

        if (currentValue) {
          const currentMin = DateTime.fromISO(currentValue);
          const newMin = DateTime.fromISO(minD);
          //const currentMax = nextParams.get("dateMax") ? DateTime.fromISO(nextParams.get("dateMax")!) : null;
          
          if (newMin > currentMin) {
            //set if new value is higher than current min value, set new max value and keep current min value if it exists, if new max value is lower than current min value, set new max value and remove current min value
            //set current max value and keep min value, update
            if(maxD !== null) {
              nextParams.set("dateMax", maxD);
              console.log("resetting max date");
            }
            else {
              alert("date range end value not in correct format. Please use dd/mm/yyyy or dd-mm-yyyy.");
              return;
            }
          } else {      
            //set if new min value is lower than current min value, set new min value and keep current max value if it exists, if new min value is higher than current max value, set new min value and remove current max value      
            //update current min value
            nextParams.set(validatedFilter.paramKey, minD);
            console.log("resetting min date");
          }
          //we could do even more clever handling updating the intermediate values if the new value is between the current min and max values, but this should be something we can add in the future if we want to support more complex date filtering
        } else {
          //set if no current value, set the new value as the min value and leave the max value empty for now
          nextParams.set(validatedFilter.paramKey, minD);
          console.log("prime set min date");
        }
      }
      else if (validatedFilter.paramKey === "freqMin")
      {
        const componentFrequency = convertToFreqAndUnit(min);

        console.log("Frequency min value:", componentFrequency.value, "Unit:", componentFrequency.unit);
        //nextParams.set(submittedFilter.paramKey, convertFrequencyToHz(submittedFilter.filterValue, "GHz"));

        //replicate the same logic as above for frequency filters, but with the added complexity of converting the frequency value to Hz for the API, and converting it back to GHz for display in the badge. We also need to handle the case where the user inputs a frequency range in GHz, e.g. "1-2 GHz", which would require us to convert both values to Hz and set them as the min and max values in the URL search params.
        const currentValue = nextParams.get(validatedFilter.paramKey);
        
        if (currentValue) {
          const currentMin = parseFloat(currentValue);
          console.log("current min:", currentMin);
          const newMin = parseFloat(convertFrequencyToHz(componentFrequency.value, componentFrequency.unit));
          console.log("converted new min frequency value in Hz:", newMin);
        
          if (newMin > currentMin) {
            nextParams.set("freqMax", convertFrequencyToHz(componentFrequency.value, componentFrequency.unit));
          }
          else {
            nextParams.set(validatedFilter.paramKey, convertFrequencyToHz(componentFrequency.value, componentFrequency.unit));
          }
        }else{
          //set if no current value, set the new value as the min value and leave the max value empty for now
          nextParams.set(validatedFilter.paramKey, convertFrequencyToHz(componentFrequency.value, componentFrequency.unit));
        }
        
      }

      const maxKey = validatedFilter.paramKey === "freqMin" ? "freqMax" : "dateMax";
      if(maxKey === "dateMax")
      {
        if(max !== null) {
          
          const maxD = max ? convertToISODate(max, true) : null;
            if(maxD !== null) {
              nextParams.set(maxKey, maxD);
            }
          }
      }
      else if (maxKey === "freqMax")
      {
        if (max !== null) {
          const componentFrequency = convertToFreqAndUnit(max);
          nextParams.set(maxKey, convertFrequencyToHz(componentFrequency.value, componentFrequency.unit));
        } 
      }
    } else {
      nextParams.set(validatedFilter.paramKey, validatedFilter.filterValue);
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
    else if (paramKey === "dateMin") {
      nextParams.delete("dateMax");
    }
    submitFilters(nextParams);
  }

  //function to update the URL search parameters and navigate to the new URL with the updated filters
  function submitFilters(nextParams: URLSearchParams) {
    const nextSearch = nextParams.toString();
    navigate(`${nextSearch ? `?${nextSearch}` : ""}`);
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
              <option value="Target">Target Name</option>
              <hr/>
              <option value="RA">RA [h m s | deg]</option>
              <option value="Dec">Dec [deg m s | deg]</option>
              <option value="Radius">Radius [deg]</option>
              <hr/>
              <option value="Frequency">Frequency [GHz (default)]</option>
              <option value="Band">Band</option>
              
              
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

function convertToFreqAndUnit(freqStr: string): { value: string; unit: string } {
  let unitMatch = freqStr.match(/GHz|MHz|kHz|Hz/i);
  const valueMatch = freqStr.match(/(\d+(?:\.\d+)?)/);
  if(!unitMatch)
  {
    unitMatch = ["GHz"]; //default to GHz if no unit provided, we can adjust this default as needed based on typical use cases and user feedback
  }
  return { value: valueMatch ? valueMatch[0] : "", unit: unitMatch[0] };
}

//EOL function to convert date string in dd/mm/yyyy or dd-mm-yyyy format to ISO format for API, returns null if not in correct format
//also adds a modifier to the day value to allow for ranged date filters, if modifier is 1 adds 1 day to the date to set the max date to the end of the min date
function convertToISODate(dateStr: string, endOfDate: boolean = false): string | null {

  const datePattern = /[-\\/| ]/g;
  const dateFormat = /[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}/g;
  const cleaned = dateStr.replaceAll(datePattern, "-");
  const valid = cleaned.match(dateFormat);
  if (!valid) {
    return null;
  }
  
  const [day, month, year] = cleaned.split("-").map(Number);

  //if end of date modifier is true, add 23:59:59 to the date to set the max date to the end of the min date, we can adjust this logic as needed based on how we want to handle ranged date filters and the user input for them
  const date = DateTime.utc(year, month, day, (endOfDate ? 23 : 0), (endOfDate ? 59 : 0), (endOfDate ? 59 : 0));      
  return date.toISO();
}

//EOL
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

  const tooltipId = `filter-tooltip-${details.query}`;
  const tooltipText =
    "This feature is pending; it requires RA, Dec, and Radius. Once the missing values have been provided, the filter will be applied.";

  return (
    <div className="relative group">
      <button
        type="button"
        aria-describedby={details.isPending ? tooltipId : undefined}
        className={
          details.isPending
            ? "w-{100%} flex flex-none m-auto p-4 bg-gray-700 rounded-full shadow-lg cursor-pointer"
            : "w-{100%} flex flex-none m-auto p-4 bg-blue-800 rounded-full shadow-lg cursor-pointer"
        }
        onClick={() => onRemove(details.query as string)}
      >
        <span className={details.isPending ? "text-red-400" : "text-gray-100"}>
          {details.isPending ? `! ${details.label ?? "none"}` : details.label ?? "none"}
        </span>
        <span className="inline-block mx-2 text-gray-400">|</span>
        <span className="text-blue-300">{details.value ?? "none"}</span>
      </button>

      {details.isPending ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-0 z-20 hidden w-64 -translate-x-1/2 -translate-y-full rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg group-hover:block"
        >
          {tooltipText}
        </span>
      ) : null}
    </div>
  );
}