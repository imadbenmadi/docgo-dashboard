import { BookOpen, Plus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../../components/Courses/EditCourse/CourseCardNew";
import EmptyState from "../../components/Courses/EditCourse/EmptyState";
import SearchAndFilters from "../../components/Courses/EditCourse/SearchAndFilters";
import { coursesAPI } from "../../API/Courses";
import Swal from "sweetalert2";

const AllCourses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCourses: 0,
    });
    const navigate = useNavigate();

    const fetchCourses = useCallback(
        async (params = {}) => {
            setLoading(true);
            try {
                const response = await coursesAPI.getAllCourses({
                    page: 1,
                    limit: 12,
                    search: searchTerm,
                    ...params,
                });
                setCourses(response.courses);
                setFilteredCourses(response.courses);
                setPagination(response.pagination);
            } catch (error) {
                console.error("Error fetching courses:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Impossible de charger les cours",
                });
            } finally {
                setLoading(false);
            }
        },
        [searchTerm]
    );

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchCourses({ search: searchTerm });
        }, 500);

        return () => clearTimeout(debounce);
    }, [searchTerm, fetchCourses]);

    const handleAddCourse = () => {
        navigate("/AddCourse");
    };

    const handleEdit = (courseId) => {
        navigate(`/edit-Course/${courseId}`);
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
        navigate(`/edit-Course/${courseId}`);
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
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className=" max-md:text-xl  font-bold text-gray-800">
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
                <SearchAndFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
                <div className="mb-6">
                    <p className="text-gray-600">
                        {filteredCourses.length} cours trouvé
                        {filteredCourses.length > 1 ? "s" : ""}
                        {searchTerm && ` pour "${searchTerm}"`}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            handleView={handleView}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    ))}
                </div>
                {filteredCourses.length === 0 && (
                    <EmptyState searchTerm={searchTerm} />
                )}
            </div>
        </div>
    );
};

export default AllCourses;
