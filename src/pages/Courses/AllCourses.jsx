import { BookOpen, Plus, Users, TrendingUp, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../../components/Courses/EditCourse/CourseCardNew";
import EmptyState from "../../components/Courses/EditCourse/EmptyState";
import SearchAndFilters from "../../components/Courses/EditCourse/SearchAndFilters";
import Pagination from "../../components/Courses/EditCourse/Pagination";
import CourseDetailModal from "../../components/Courses/CourseDetailModal";
import { coursesAPI } from "../../API/Courses";
import Swal from "sweetalert2";

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "",
        category: "",
        difficulty: "",
        priceMin: "",
        priceMax: "",
        dateFrom: "",
        dateTo: "",
    });
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCourses: 0,
    });
    const [pageSize, setPageSize] = useState(12);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalApplications: 0,
        averageRating: 0,
        recentCourses: 0,
    });
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchCourses = async (currentSearchTerm = searchTerm) => {
        setLoading(true);
        try {
            const response = await coursesAPI.getCourses({
                page: pagination.currentPage,
                limit: pageSize,
                search: currentSearchTerm,
                sortBy,
                sortOrder,
                ...filters,
            });

            // Add null checks for the response
            const coursesData = response?.courses || [];
            const paginationData = response?.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalCourses: 0,
            };

            setCourses(coursesData);
            setFilteredCourses(coursesData);
            setPagination(paginationData);

            // Calculate stats
            const totalApplications = coursesData.reduce(
                (sum, course) => sum + (course.stats?.totalApplications || 0),
                0
            );
            const averageRating =
                coursesData.length > 0
                    ? coursesData.reduce(
                          (sum, course) =>
                              sum + (course.stats?.averageRating || 0),
                          0
                      ) / coursesData.length
                    : 0;
            const recentCourses = coursesData.filter((course) => {
                const courseDate = new Date(course.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return courseDate > weekAgo;
            }).length;

            setStats({
                totalCourses: coursesData.length,
                totalApplications,
                averageRating: averageRating.toFixed(1),
                recentCourses,
            });
        } catch (error) {
            console.error("Error fetching courses:", error);
            // Reset to empty arrays on error
            setCourses([]);
            setFilteredCourses([]);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalCourses: 0,
            });
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Impossible de charger les cours",
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial load effect
    useEffect(() => {
        fetchCourses("");
    }, []);

    // Effect when filters change (not search)
    useEffect(() => {
        fetchCourses(searchTerm);
    }, [filters, sortBy, sortOrder, pagination.currentPage, pageSize]);

    // Debounced search effect - only triggers on search changes
    useEffect(() => {
        if (searchTerm !== undefined) {
            const debounce = setTimeout(() => {
                fetchCourses(searchTerm);
            }, 500);

            return () => clearTimeout(debounce);
        }
    }, [searchTerm]);

    const handleAddCourse = () => {
        navigate("/AddCourse");
    };

    const handleEdit = (courseId) => {
        navigate(`/Courses/${courseId}/Edit`);
    };

    const handleDelete = async (courseId) => {
        const result = await Swal.fire({
            title: "Êtes-vous sûr ?",
            text: "Cette action ne peut pas être annulée !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer !",
            cancelButtonText: "Annuler",
        });

        if (result.isConfirmed) {
            try {
                await coursesAPI.deleteCourse(courseId);
                Swal.fire("Supprimé !", "Le cours a été supprimé.", "success");
                fetchCourses();
            } catch (error) {
                console.error("Error deleting course:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text:
                        error.response?.data?.error ||
                        "Impossible de supprimer le cours",
                });
            }
        }
    };

    const handleView = (courseId) => {
        navigate(`/Courses/${courseId}`);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleExport = () => {
        try {
            const exportData = filteredCourses.map((course) => ({
                Titre: course.Title,
                "Titre (AR)": course.Title_ar,
                Catégorie: course.Category,
                Niveau: course.Difficulty,
                Prix: course.Price,
                Applications: course.stats?.totalApplications || 0,
                "Note moyenne": course.stats?.averageRating || 0,
                "Date de création": new Date(
                    course.createdAt
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
                `courses_export_${new Date().toISOString().split("T")[0]}.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                icon: "success",
                title: "Export réussi",
                text: "Les données ont été exportées avec succès",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Error exporting data:", error);
            Swal.fire({
                icon: "error",
                title: "Erreur d'export",
                text: "Une erreur est survenue lors de l'export",
            });
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setFilters({
            status: "",
            category: "",
            difficulty: "",
            priceMin: "",
            priceMax: "",
            dateFrom: "",
            dateTo: "",
        });
        setSortBy("createdAt");
        setSortOrder("desc");
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, currentPage: newPage }));
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Chargement des cours...
                    </h2>
                    <p className="text-gray-600">Veuillez patienter</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl max-md:text-xl font-bold text-gray-800">
                                    Gestion des Cours
                                </h1>
                                <p className="text-gray-600">
                                    Gérez vos cours et analysez les données
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddCourse}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Nouveau Cours
                        </button>
                    </div>
                </div>

                {/* Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Cours
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.totalCourses}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Inscriptions
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.totalApplications}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Note Moyenne
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.averageRating}/5
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Nouveaux (7j)
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.recentCourses}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600" />
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
                    totalCourses={stats.totalCourses}
                    onReset={handleReset}
                />

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {(filteredCourses || []).length} cours trouvé
                        {(filteredCourses || []).length > 1 ? "s" : ""}
                        {searchTerm && ` pour "${searchTerm}"`}
                    </p>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {(filteredCourses || []).map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            handleView={handleView}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {(filteredCourses || []).length === 0 && !loading && (
                    <EmptyState searchTerm={searchTerm} />
                )}

                {/* Pagination */}
                {(filteredCourses || []).length > 0 && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalCourses}
                        itemsPerPage={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>

            {/* Course Detail Modal */}
            <CourseDetailModal
                course={selectedCourse}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default Courses;
