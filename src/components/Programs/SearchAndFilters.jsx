import {
    Search,
    Filter,
    Download,
    RotateCcw,
    ChevronDown,
    SortAsc,
    SortDesc,
} from "lucide-react";
import { useState } from "react";

const SearchAndFilters = ({
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    onExport,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    totalPrograms,
    onReset,
}) => {
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (filterKey, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterKey]: value,
        }));
    };

    const clearFilters = () => {
        onReset();
        setShowFilters(false);
    };

    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== ""
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            {/* Search and Main Actions */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher des programmes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 border rounded-xl flex items-center gap-2 transition-colors ${
                            showFilters || hasActiveFilters
                                ? "bg-purple-50 border-purple-200 text-purple-600"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        <Filter className="w-5 h-5" />
                        Filtres
                        {hasActiveFilters && (
                            <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {
                                    Object.values(filters).filter(
                                        (v) => v !== ""
                                    ).length
                                }
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onExport}
                        className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        disabled={totalPrograms === 0}
                    >
                        <Download className="w-5 h-5" />
                        Export
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "status",
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-3 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="open">Ouvert</option>
                                    <option value="closed">Fermé</option>
                                    <option value="draft">Brouillon</option>
                                    <option value="coming_soon">Bientôt</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Program Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de programme
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.programType}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "programType",
                                            e.target.value
                                        )
                                    }
                                    className="w-full p-3 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Tous les types</option>
                                    <option value="scholarship">
                                        Bourse d&apos;études
                                    </option>
                                    <option value="grant">Subvention</option>
                                    <option value="fellowship">
                                        Fellowship
                                    </option>
                                    <option value="internship">Stage</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catégorie
                            </label>
                            <input
                                type="text"
                                placeholder="Catégorie..."
                                value={filters.category}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "category",
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Organization Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organisation
                            </label>
                            <input
                                type="text"
                                placeholder="Organisation..."
                                value={filters.organization}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "organization",
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Scholarship Amount Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Montant min (€)
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                value={filters.minScholarship}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "minScholarship",
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Montant max (€)
                            </label>
                            <input
                                type="number"
                                placeholder="100000"
                                value={filters.maxScholarship}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "maxScholarship",
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "dateFrom",
                                        e.target.value
                                    )
                                }
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) =>
                                    handleFilterChange("dateTo", e.target.value)
                                }
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Trier par:
                            </label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
                                >
                                    <option value="createdAt">
                                        Date de création
                                    </option>
                                    <option value="title">Titre</option>
                                    <option value="organization">
                                        Organisation
                                    </option>
                                    <option value="scholarshipAmount">
                                        Montant
                                    </option>
                                    <option value="applicationDeadline">
                                        Date limite
                                    </option>
                                    <option value="status">Statut</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                setSortOrder(
                                    sortOrder === "asc" ? "desc" : "asc"
                                )
                            }
                            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {sortOrder === "asc" ? (
                                <SortAsc className="w-4 h-4" />
                            ) : (
                                <SortDesc className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                                {sortOrder === "asc"
                                    ? "Croissant"
                                    : "Décroissant"}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchAndFilters;
