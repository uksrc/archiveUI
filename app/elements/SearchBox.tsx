// placeholder for SearchBox component
import { FilterBadge } from "./FilterBadge";
import { useState } from "react";
import type { FilterBadgeType } from "../objects/Objects";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import invariant from "tiny-invariant"; 

export function SearchBox() 
{
  const [filter, setFilter] = useState<FilterBadgeType[]>([]);

  function search(formData: FormData) {
    const query = formData.get("query") as String;
    // alert(`You searched for '${query}'`);
    
    const items = query.split(" ") ?? "nothing to see here";
    //loose check for items
    if(items[0] == "" || items[1] == "") {
      //invariant(false, "Invalid filter badge data");
      alert("Invalid filter badge data");
    }
    else {
      const newFilter: FilterBadgeType = {
        label: items[0] ?? "none",
        query: `?query=${query}`,
        value: items[1] ?? "none",
      };
    
      setFilter((prev) => [...prev, newFilter]);
    }
  }

  return (
    <>
    <div className="flex items-center justify-center p-4">
      <form action={search} className="flex w-full max-w-md">
      <input
        type="text"
        name="query"
        placeholder="Search..."
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white rounded shadow-md"
      />
      <button type="submit" className="ml-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-700">
        Search
      </button>
      </form>
    </div>
    <div className="flex flex-wrap gap-2 p-4">
      {filter.map((item, index) => (
        <FilterBadge key={index} {...item} />
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