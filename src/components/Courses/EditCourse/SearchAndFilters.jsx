import {
    Search,
    SlidersHorizontal,
    RotateCcw,
    Download,
    Calendar,
    Filter,
    ChevronDown,
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
    totalCourses,
    onReset,
    courses = [], // Add courses prop to get dynamic data
}) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters); // Local state for filters

    const statusOptions = [
        { value: "", label: "Tous les statuts" },
        { value: "published", label: "Publié" },
        { value: "draft", label: "Brouillon" },
        { value: "archived", label: "Archivé" },
    ];

    // Get dynamic categories from courses
    const categories = [
        ...new Set(courses.map((c) => c.Category).filter(Boolean)),
    ];
    const categoryOptions = [
        { value: "", label: "Toutes les catégories" },
        ...categories.map((cat) => ({ value: cat, label: cat })),
    ];

    // Get dynamic specialties from courses
    const specialties = [
        ...new Set(courses.map((c) => c.Specialty).filter(Boolean)),
    ];

    // Add some default specialties if no courses exist yet
    const defaultSpecialties = [
        "Développement Web",
        "Data Science",
        "Intelligence Artificielle",
        "Marketing Digital",
        "Design UI/UX",
        "Cybersécurité",
        "Mobile Development",
        "Cloud Computing",
        "Business Management",
        "Finance",
        "Photography",
        "Video Editing",
    ];

    const allSpecialties =
        specialties.length > 0 ? specialties : defaultSpecialties;

    const specialtyOptions = [
        { value: "", label: "Toutes les spécialités" },
        ...allSpecialties.map((spec) => ({ value: spec, label: spec })),
    ];

    const difficultyOptions = [
        { value: "", label: "Tous les niveaux" },
        { value: "beginner", label: "Débutant" },
        { value: "intermediate", label: "Intermédiaire" },
        { value: "advanced", label: "Avancé" },
    ];

    const sortOptions = [
        { value: "createdAt", label: "Date de création" },
        { value: "title", label: "Titre" },
        { value: "category", label: "Catégorie" },
        { value: "specialty", label: "Spécialité" },
        { value: "price", label: "Prix" },
        { value: "applications", label: "Inscriptions" },
        { value: "rating", label: "Note moyenne" },
    ];

    const handleLocalFilterChange = (key, value) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const applyFilters = () => {
        setFilters(localFilters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            status: "",
            category: "",
            specialty: "",
            difficulty: "",
            priceMin: "",
            priceMax: "",
            dateFrom: "",
            dateTo: "",
        };
        setLocalFilters(emptyFilters);
        setFilters(emptyFilters);
        setSearchTerm("");
        setSortBy("createdAt");
        setSortOrder("desc");
        if (onReset) onReset();
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter((value) => value !== "").length;
    };

    const hasLocalChanges =
        JSON.stringify(localFilters) !== JSON.stringify(filters);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            {/* Search Bar and Quick Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher par titre, catégorie, description..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() =>
                            setShowAdvancedFilters(!showAdvancedFilters)
                        }
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                            showAdvancedFilters || getActiveFiltersCount() > 0
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtres
                        {getActiveFiltersCount() > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="border-t pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                value={localFilters.status || ""}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "status",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {statusOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catégorie
                            </label>
                            <select
                                value={localFilters.category || ""}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "category",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {categoryOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Specialty Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Spécialité
                            </label>
                            <select
                                value={localFilters.specialty || ""}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "specialty",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {specialtyOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Niveau
                            </label>
                            <select
                                value={localFilters.difficulty || ""}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "difficulty",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {difficultyOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trier par
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() =>
                                        setSortOrder(
                                            sortOrder === "asc"
                                                ? "desc"
                                                : "asc",
                                        )
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    title={
                                        sortOrder === "asc"
                                            ? "Croissant"
                                            : "Décroissant"
                                    }
                                >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix minimum (DZD)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={localFilters.priceMin || ""}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "priceMin",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix maximum (DZD)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="1000"
                                value={localFilters.priceMax || ""}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "priceMax",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Date de création (de)
                            </label>
                            <input
                                type="date"
                                value={localFilters.dateFrom || ""}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "dateFrom",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Date de création (à)
                            </label>
                            <input
                                type="date"
                                value={localFilters.dateTo || ""}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "dateTo",
                                        e.target.value,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Apply and Clear Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            {totalCourses} cours au total
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Effacer
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                disabled={!hasLocalChanges}
                            >
                                <Filter className="w-4 h-4" />
                                Appliquer les filtres
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchAndFilters;
