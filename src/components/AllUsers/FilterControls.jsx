import React from "react";
import { ChevronDown, Search, XIcon } from "lucide-react";

const FilterControls = ({ filters, setFilters, activeTab, setActiveTab }) => {
  const categories = ["Apprendre des cours", "Étudier à l'étranger"];

  const clearAllFilters = () => {
    setFilters({
      category: activeTab,
      paymentStatus: "",
      country: "",
      search: "",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center w-full mb-4">
      <h1 className="text-lg font-semibold text-zinc-800 whitespace-nowrap">
        {activeTab === "Apprendre des cours"
          ? "Tous les utilisateurs"
          : "Applications à l'étranger"}
      </h1>

      <div className="flex flex-wrap gap-2 items-center flex-1 w-full">
        {/* Category Filter */}
        <div className="flex bg-stone-100 rounded-lg p-0.5">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                activeTab === category
                  ? "bg-white text-zinc-800 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
              onClick={() => {
                setActiveTab(category);
                setFilters((prev) => ({ ...prev, category }));
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Country Filter (only for study abroad applications) */}
        {activeTab === "Étudier à l'étranger" && (
          <div className="relative">
            <select
              className="pl-2 pr-6 py-1 rounded-lg border border-gray-200 bg-white text-xs appearance-none"
              value={filters.country}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  country: e.target.value,
                }))
              }
            >
              <option value="">Pays</option>
              <option value="France">France</option>
              <option value="Canada">Canada</option>
              <option value="USA">États-Unis</option>
              <option value="UK">Royaume-Uni</option>
              <option value="Germany">Allemagne</option>
              <option value="Spain">Espagne</option>
              <option value="Italy">Italie</option>
              <option value="Australia">Australie</option>
              <option value="Japan">Japon</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Payment Status Filter (only for courses) */}
        {activeTab === "Apprendre des cours" && (
          <div className="relative">
            <select
              className="pl-2 pr-6 py-1 rounded-lg border border-gray-200 bg-white text-xs appearance-none"
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
            >
              <option value="">Statut de paiement</option>
              <option value="Paid">Payé</option>
              <option value="Pending">En attente</option>
              <option value="Failed">Échoué</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-7 pr-2 py-1 rounded-lg border border-gray-200 bg-white text-xs w-full"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>

        {(filters.paymentStatus || filters.country || filters.search) && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <XIcon className="w-3 h-3" />
            Effacer les filtres
          </button>
        )}
      </div>
    </div>
  );
};
export default FilterControls;
