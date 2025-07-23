import type { FilterBadgeType } from "~/objects/Objects";

// search badge component that displays in place searches
// placeholder status

export const FilterBadge = (details?: FilterBadgeType) => {

    if (details === undefined || details === null) {
        return null; // or return a placeholder component
    }
    else{
        const items = details;

        //console.log("SearchBadge items:", items);
        return (
            <span className="w-{100%} flex flex-none items-center justify-center p-4 bg-blue-800 rounded-lg shadow-lg">
                <span className="text-gray-100">{items.label ?? 'none'}</span>
                <span className="inline-block mx-2 text-gray-400">|</span>
                <span className="text-blue-300">{items.value ?? 'none'}</span>
            </span>
        );
    }
};