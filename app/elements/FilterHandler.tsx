// placeholder for FilterHandler component
import { FilterBadge as FilterBadgeGenerator } from "./FilterBadge";
import { useState } from "react";
import type { FilterBadgeType } from "../objects/Objects";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import invariant from "tiny-invariant"; 

export function FilterHandler() 
{
  const [filter, setFilter] = useState<FilterBadgeType[]>([]);
  const FilterDelineator = ':'

  function AddFilter(formData: FormData) {
    //get the query from the form data
    const instructionTarget = formData.get("filter-feature") as string;
    const instructionValue = formData.get("filter-value") as string;

    //check that we have an instructionValue
    //TODO add some V&V on this later
    if(instructionValue === "") {
      //invariant(false, "Invalid filter badge data");
      alert("you must provide a value for the filter");
    }
    else {
      const newFilter: FilterBadgeType = {
        label: instructionTarget ?? "none",
        query: `?query=${instructionTarget+':'+instructionValue}`,
        value: instructionValue ?? "none",
      };
    
      setFilter((prev) => [...prev, newFilter]);
    }
  }

  return (
    <>
    <div className="flex items-center justify-center p-4">
      <form action={AddFilter} className="flex min-w-[50vw] max-w-[80vw]">
      <select className="flex flex min-w-[10vw] rounded-l-md bg-blue-900 focus:outline-none focus:ring-2 focus:ring-violet-500 hover:bg-blue-800" name="filter-feature" id="filter-feature">
        // options will be replaced with a dynamic list of filter options
        // units will be flexible in the future
        <option value="RA">RA [h m s]</option>
        <option value="Dec">Dec [° m s]</option>
        <option value="Band">Band</option>
      </select>
      <input
        type="text"
        name="filter-value"
        placeholder="Filter items..."
        className="flex flex-3 w-full p-2 border border-gray-300  rounded-r-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 bg-white shadow-md"
      />
      <button type="submit" className="flex flex-1 ml-4 px-2 py-2 bg-blue-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 hover:bg-blue-800 shadow-md">
        <p className="text-center text-white">Add Filter</p>
      </button>
      </form>
    </div>
    <div className="flex flex-wrap items-center gap-2 py-0 px-4">
      {filter.map((item, index) => (
        <FilterBadgeGenerator key={index} {...item} />
      ))}
    </div>
    </>
  );
}

export const action = async ({ request } : ActionFunctionArgs ) => {
  console.log("SearchBox action called");
  return null;
};

export const loader = async ({ request } : LoaderFunctionArgs ) => {
  console.log("SearchBox loader called");
  return null;
}