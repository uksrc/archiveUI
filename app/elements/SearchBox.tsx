// place holder for SearchBox component

export function SearchBox() 
{
  function search(formData: FormData) {
    const query = formData.get("query");
    alert(`You searched for '${query}'`);
  }
  return (
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
  );
}