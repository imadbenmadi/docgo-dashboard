import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Book,
    Video,
    FileText,
    Brain,
    Users,
} from "lucide-react";
import  apiClient  from "../../../utils/apiClient";

const CourseraStyleCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories = [
        "Programming",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Development",
        "IT & Software",
        "Personal Development",
        "Health & Fitness",
    ];

    const statusOptions = [
        {
            value: "draft",
            label: "Draft",
            color: "bg-yellow-100 text-yellow-800",
        },
        {
            value: "published",
            label: "Published",
            color: "bg-green-100 text-green-800",
        },
        {
            value: "archived",
            label: "Archived",
            color: "bg-gray-100 text-gray-800",
        },
    ];

    useEffect(() => {
        fetchCourses();
    }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
                ...(selectedCategory && { category: selectedCategory }),
                ...(selectedStatus && { status: selectedStatus }),
            });

            const response = await apiClient.get(
                `/admin/CourseraStyleCourses?${params}`
            );

            if (response.data.success) {
                setCourses(response.data.data.courses);
                setTotalPages(response.data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            setError("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this course? This will delete all sections and items."
            )
        ) {
            return;
        }

        try {
            await apiClient.delete(`/admin/CourseraStyleCourses/${courseId}`);
            await fetchCourses();
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Failed to delete course");
        }
    };

    const CourseCard = ({ course }) => {
        const statusConfig = statusOptions.find(
            (s) => s.value === course.status
        );

        return (
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Course Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {course.Title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {course.Description}
                        </p>
                    </div>
                    {course.image && (
                        <img
                            src={course.image}
                            alt={course.Title}
                            className="w-20 h-20 object-cover rounded-lg ml-4"
                        />
                    )}
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Book className="w-4 h-4 mr-1 text-blue-500" />
                        <span>{course.stats?.totalSections || 0} Sections</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Video className="w-4 h-4 mr-1 text-red-500" />
                        <span>{course.stats?.totalVideos || 0} Videos</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Brain className="w-4 h-4 mr-1 text-purple-500" />
                        <span>{course.stats?.totalQuizzes || 0} Quizzes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-1 text-green-500" />
                        <span>{course.stats?.totalPDFs || 0} PDFs</span>
                    </div>
                </div>

                {/* Course Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}
                    >
                        {statusConfig?.label}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {course.Category}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {course.difficulty}
                    </span>
                    {course.Price > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ${course.Price}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.Users_count || 0} students</span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() =>
                                window.open(
                                    `/admin/courses/${course.id}/preview`,
                                    "_blank"
                                )
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                            title="Preview Course"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                (window.location.href = `/admin/courses/${course.id}/edit`)
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                            title="Edit Course"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            title="Delete Course"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Course Management
                    </h1>
                    <p className="text-gray-600">
                        Manage your Coursera-style courses with sections and
                        items
                    </p>
                </div>
                <button
                    onClick={() =>
                        (window.location.href = "/admin/courses/create")
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search courses..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("");
                                setSelectedStatus("");
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>

            {/* Empty State */}
            {courses.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No courses found
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || selectedCategory || selectedStatus
                            ? "Try adjusting your filters"
                            : "Get started by creating your first course"}
                    </p>
                    <button
                        onClick={() =>
                            (window.location.href = "/admin/courses/create")
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Create Course
                    </button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-2 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseraStyleCourses;
