import { useEffect, useState } from "react";
import { getCategories } from "../services/categories";
import { Info } from "lucide-react";

export default function FilterBar({
  category,
  onCategoryChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  searchActive
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((data) => {
        if (mounted) setCategories(data);
      })
      .catch((err) => console.error("Failed to fetch categories", err));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Category Filter */}
      <div className="w-full sm:w-auto relative group">
        <label htmlFor="category" className="sr-only">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={searchActive}
          className={`block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
            searchActive
              ? "ring-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : "ring-gray-300 focus:ring-blue-600"
          }`}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        {searchActive && (
          <div className="absolute top-full mt-2 hidden group-hover:flex items-center gap-1.5 z-10 w-64 bg-gray-800 text-white text-xs rounded p-2 shadow-lg">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Category filter is disabled during active search (DummyJSON API limitation). Clear search to filter.</span>
          </div>
        )}
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <label htmlFor="sortBy" className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="block w-full rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          <option value="">Default</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="title">Title</option>
        </select>

        {sortBy && (
          <select
            id="order"
            value={order}
            onChange={(e) => onOrderChange(e.target.value)}
            className="block rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        )}
      </div>
    </div>
  );
}
