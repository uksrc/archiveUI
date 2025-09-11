// placeholder for FilterHandler component
import { useState } from "react";
import type { FilterFeatureBadgeType } from "../objects/Objects";
import type { Route } from "../+types/root";
import invariant from "tiny-invariant"; 

export default function FilterHandler() 
{
  // State to hold the filter badges
  // TODO write these to a global state or context for better management
  const [filterFeature, setFilterFeature] = useState<FilterFeatureBadgeType[]>([]);

  function AddFilter(formData: FormData) {
    //get the query from the form data
    // instructionTarget is the feature (e.g. RA, Dec, Freq) to filter by
    // instructionValue is the value to filter by
    const instructionTarget = formData.get("filter-feature") as string;
    const instructionValue = formData.get("filter-value") as string;

    //check that we have an instructionValue
    //TODO add some V&V on this later
    if(instructionValue === "" || instructionTarget === "") {
      //invariant(false, "Invalid filter badge data");
      alert("you must provide a value for the filter");
    }
    else {
      const newFilter: FilterFeatureBadgeType = {
        label: instructionTarget ?? "none",
        query: `?query=${instructionTarget+':'+instructionValue}`,
        value: instructionValue ?? "none",
      };
    
      setFilterFeature((prev) => [...prev, newFilter]);
      console.log("state is: ", filterFeature);
    }
  }

  function RemoveFilter(key: string) {
    // remove the filter badge with the given key
    setFilterFeature((prev) => prev.filter((item) => item.query !== key));
  }

  return (
    <>
    <div className="flex items-center justify-center p-4">
      <form action={AddFilter} className="flex flex-col min-w-[80vw] max-w-[80vw]">
        <div className="flex flex-none min-w-[60%] max-w-[60%] m-auto rounded-md text-center focus:outline-none focus:ring-2 focus:ring-violet-500 hover:bg-blue-800">
          <select className="dropdown-content dropdown
                            flex min-w-[12vw] 
                            rounded-l-md 
                            bg-gradient-to-tr from-blue-300 via-blue-200 to-gray-200 
                            text-center text-gray-900
                            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:rounded-tl-md"
                      name="filter-feature" 
                        id="filter-feature">
            // options will be replaced with a dynamic list of filter options
            // units will be flexible in the future
            // styling on the dropdown will be improved later - potentially with a significant redesign
            <option value="">Feature...</option>
            <option value="RA">RA [h m s]</option>
            <option value="Dec">Dec [° m s]</option>
            <option value="Band">Band</option>
            <option value="Freq">Frequency [GHz]</option>
            <option value="Date">Date [dd/mm/yyyy]</option>
          </select>
          <input
            type="text"
            name="filter-value"
            placeholder="Filter items..."
            className="flex flex-3 w-full p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 text-centre bg-white shadow-md"
          />
        </div>
        <div className="flex flex-none mt-2">
          <button type="submit" className="flex flex-none m-auto px-2 py-2 bg-blue-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 hover:bg-blue-800 shadow-md">
            <p className="text-center text-white m-auto">Add Filter</p>
          </button>
        </div>
      </form>
    </div>
    <div className="flex flex-wrap items-center gap-2 py-0 px-4">
      {filterFeature.map((item, index) => (
        <FilterFeatureBadge key={index} {...item} />
      ))}
    </div>
    </>
  );

function FilterFeatureBadge (details?: FilterFeatureBadgeType) {
    
    function RemoveSelf(props: any) {
        //find the index of the item to remove
        const index = filterFeature.findIndex((item) => item.query === props.query);
        // remove the item from the filter state
        if (index !== -1) {
            setFilterFeature((prev) => prev.filter((item, i) => i !== index));
            console.log("FilterBadge RemoveSelf removed item at index: ", index);
        }
        
        //return true; // placeholder for remove functionality
    }

    if (details === undefined || details === null) {
        return null; // or return a placeholder component
    }
    else{
        const items = details;

        return (
            <button className="w-{100%} flex flex-none m-auto p-4 bg-blue-800 rounded-full shadow-lg" onClick={() => RemoveSelf(details)}>
                <span className="text-gray-100">{items.label ?? 'none'}</span>
                <span className="inline-block mx-2 text-gray-400">|</span>
                <span className="text-blue-300">{items.value ?? 'none'}</span>
            </button>
        );
    }
};

// export const action = async ({ request } : ActionFunctionArgs ) => {
//   console.log("SearchBox action called");
//   return null;
// };

// export const loader = async ({ request } : LoaderFunctionArgs ) => {
//   console.log("SearchBox loader called");
//   return null;
// }
}
export const clientLoader = async ({ params } : Route.ClientActionArgs ) => {
  
  console.log("SearchBox clientLoader called");
  return null;
}
