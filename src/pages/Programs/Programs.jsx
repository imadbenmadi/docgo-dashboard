import { GraduationCap, Plus, Users, Calendar, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { programsAPI } from "../../API/Programs";
import ProgramCard from "../../components/Programs/ProgramCard";
import EmptyState from "../../components/Programs/EmptyState";
import SearchAndFilters from "../../components/Programs/SearchAndFilters";
import Pagination from "../../components/Programs/Pagination";
import ProgramDetailModal from "../../components/Programs/ProgramDetailModal";

const Programs = () => {
    const [programs, setPrograms] = useState([]);
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "",
        programType: "",
        category: "",
        organization: "",
        minScholarship: "",
        maxScholarship: "",
        dateFrom: "",
        dateTo: "",
    });
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalPrograms: 0,
    });
    const [pageSize, setPageSize] = useState(12);
    const [stats, setStats] = useState({
        totalPrograms: 0,
        openPrograms: 0,
        closedPrograms: 0,
        featuredPrograms: 0,
    });
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchPrograms = async (currentSearchTerm = searchTerm) => {
        setLoading(true);
        try {
            const response = await programsAPI.getPrograms({
                page: pagination.currentPage,
                limit: pageSize,
                search: currentSearchTerm,
                sortBy,
                sortOrder,
                ...filters,
            });

            const programsData = response?.programs || [];
            const paginationData = response?.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalPrograms: 0,
            };
            const statsData = response?.stats || {
                totalPrograms: 0,
                openPrograms: 0,
                closedPrograms: 0,
                featuredPrograms: 0,
            };

            setPrograms(programsData);
            setFilteredPrograms(programsData);
            setPagination(paginationData);
            setStats(statsData);

            if (programsData.length === 0 && currentSearchTerm) {
                toast.error("Aucun programme trouvé pour cette recherche", {
                    duration: 3000,
                    style: {
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                    },
                });
            }
        } catch (error) {
            console.error("Error fetching programs:", error);
            setPrograms([]);
            setFilteredPrograms([]);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalPrograms: 0,
            });
            toast.error("Erreur lors du chargement des programmes", {
                duration: 4000,
                style: {
                    background: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                },
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial load effect
    useEffect(() => {
        fetchPrograms("");
    }, []);

    // Effect when filters change (not search)
    useEffect(() => {
        fetchPrograms(searchTerm);
    }, [filters, sortBy, sortOrder, pagination.currentPage, pageSize]);

    // Debounced search effect
    useEffect(() => {
        if (searchTerm !== undefined) {
            const debounce = setTimeout(() => {
                fetchPrograms(searchTerm);
            }, 500);

            return () => clearTimeout(debounce);
        }
    }, [searchTerm]);

    const handleAddProgram = () => {
        navigate("/Programs/Add");
    };

    const handleEdit = (programId) => {
        navigate(`/Programs/${programId}/Edit`);
    };

    const handleDelete = async (programId) => {
        const program = filteredPrograms.find((p) => p.id === programId);

        toast(
            (t) => (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                Confirmer la suppression
                            </h3>
                            <p className="text-sm text-gray-600">
                                Supprimer le programme &quot;{program?.title}
                                &quot; ?
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await programsAPI.deleteProgram(programId);
                                    toast.success(
                                        "Programme supprimé avec succès",
                                        {
                                            duration: 3000,
                                            style: {
                                                background: "#F0FDF4",
                                                color: "#166534",
                                                border: "1px solid #BBF7D0",
                                            },
                                        }
                                    );
                                    fetchPrograms();
                                } catch (error) {
                                    console.error(
                                        "Error deleting program:",
                                        error
                                    );
                                    toast.error(
                                        "Erreur lors de la suppression",
                                        {
                                            duration: 4000,
                                            style: {
                                                background: "#FEF2F2",
                                                color: "#DC2626",
                                                border: "1px solid #FECACA",
                                            },
                                        }
                                    );
                                }
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            Supprimer
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                style: {
                    background: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                    maxWidth: "400px",
                },
            }
        );
    };

    const handleView = (programId) => {
        navigate(`/Programs/${programId}`);
    };

    const handleViewModal = (programId) => {
        const program = filteredPrograms.find((p) => p.id === programId);
        if (program) {
            setSelectedProgram(program);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProgram(null);
    };

    const handleExport = () => {
        try {
            const exportData = filteredPrograms.map((program) => ({
                Titre: program.title,
                "Description courte": program.short_description,
                Type: program.programType,
                Catégorie: program.category,
                Organisation: program.organization,
                "Montant bourse": program.scholarshipAmount,
                Devise: program.currency,
                Statut: program.status,
                "Date limite": program.applicationDeadline
                    ? new Date(program.applicationDeadline).toLocaleDateString(
                          "fr-FR"
                      )
                    : "",
                "Date de création": new Date(
                    program.createdAt
                ).toLocaleDateString("fr-FR"),
            }));

            const csvContent = [
                Object.keys(exportData[0] || {}).join(","),
                ...exportData.map((row) => Object.values(row).join(",")),
            ].join("\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `programs_export_${new Date().toISOString().split("T")[0]}.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Export réalisé avec succès", {
                duration: 3000,
                style: {
                    background: "#F0FDF4",
                    color: "#166534",
                    border: "1px solid #BBF7D0",
                },
            });
        } catch (error) {
            console.error("Error exporting data:", error);
            toast.error("Erreur lors de l'export", {
                duration: 4000,
                style: {
                    background: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                },
            });
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setFilters({
            status: "",
            programType: "",
            category: "",
            organization: "",
            minScholarship: "",
            maxScholarship: "",
            dateFrom: "",
            dateTo: "",
        });
        setSortBy("createdAt");
        setSortOrder("desc");
        toast.success("Filtres réinitialisés", {
            duration: 2000,
            style: {
                background: "#F0F9FF",
                color: "#0369A1",
                border: "1px solid #BAE6FD",
            },
        });
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, currentPage: newPage }));
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Chargement des programmes...
                    </h2>
                    <p className="text-gray-600">Veuillez patienter</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl max-md:text-xl font-bold text-gray-800">
                                    Gestion des Programmes
                                </h1>
                                <p className="text-gray-600">
                                    Gérez vos programmes de bourses et analysez
                                    les données
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddProgram}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Nouveau Programme
                        </button>
                    </div>
                </div>

                {/* Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Programmes
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.totalPrograms}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Programmes Ouverts
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.openPrograms}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Programmes Fermés
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.closedPrograms}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Programmes Vedettes
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.featuredPrograms}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    onExport={handleExport}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    totalPrograms={stats.totalPrograms}
                    onReset={handleReset}
                />

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {(filteredPrograms || []).length} programme
                        {(filteredPrograms || []).length > 1 ? "s" : ""} trouvé
                        {(filteredPrograms || []).length > 1 ? "s" : ""}
                        {searchTerm && ` pour "${searchTerm}"`}
                    </p>
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {(filteredPrograms || []).map((program) => (
                        <ProgramCard
                            key={program.id}
                            program={program}
                            handleView={handleView}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {(filteredPrograms || []).length === 0 && !loading && (
                    <EmptyState searchTerm={searchTerm} />
                )}

                {/* Pagination */}
                {(filteredPrograms || []).length > 0 && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalPrograms}
                        itemsPerPage={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>

            {/* Program Detail Modal */}
            <ProgramDetailModal
                program={selectedProgram}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default Programs;
