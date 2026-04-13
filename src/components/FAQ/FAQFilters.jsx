import { useEffect, useState } from "react";

const FAQFilters = ({ filters, onDraftChange, onApply, categories }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateDraft = (newFilters) => {
    setLocalFilters(newFilters);
    onDraftChange?.(newFilters);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateDraft({ ...localFilters, [name]: value });
  };

  const handleApply = () => {
    onApply?.(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      assignmentType: "",
      category: "",
      search: "",
      isActive: "",
      sortBy: "displayOrder",
      sortOrder: "asc",
    };
    updateDraft(clearedFilters);
    onApply?.(clearedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            name="search"
            value={localFilters.search}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            placeholder="Search questions/answers..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Assignment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignment Type
          </label>
          <select
            name="assignmentType"
            value={localFilters.assignmentType}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="home">Home Page</option>
            <option value="global">Global</option>
            <option value="course">Course Specific</option>
            <option value="program">Program Specific</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={localFilters.category}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="isActive"
            value={localFilters.isActive}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mt-4">
        {/* Sort Options */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              name="sortBy"
              value={localFilters.sortBy}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="displayOrder">Display Order</option>
              <option value="createdAt">Date Created</option>
              <option value="question">Question</option>
              <option value="category">Category</option>
              <option value="viewCount">View Count</option>
              <option value="helpfulCount">Helpful Count</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              name="sortOrder"
              value={localFilters.sortOrder}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleClearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Rechercher
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQFilters;
