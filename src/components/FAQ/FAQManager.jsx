import { useState, useEffect, useCallback } from "react";
import apiClient from "../../utils/apiClient";
import FAQModal from "./FAQModal";
import FAQViewModal from "./FAQViewModal";
import FAQFilters from "./FAQFilters";
import MainLoading from "../../MainLoading";
const FAQManager = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);

    // View modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingFaq, setViewingFaq] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalFaqs, setTotalFaqs] = useState(0);

    // Filter state
    const [filters, setFilters] = useState({
        assignmentType: "",
        category: "",
        search: "",
        isActive: "",
        sortBy: "displayOrder",
        sortOrder: "asc",
    });

    // Available options for filters
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [categories, setCategories] = useState([]);

    // Fetch FAQs
    const fetchFaqs = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: "20",
                    ...filters,
                });

                const response = await apiClient.get(`/faqs?${queryParams}`);
                console.log("FAQs response:", response.data);

                if (response.data.success) {
                    setFaqs(response.data.faqs);
                    setCurrentPage(response.data.pagination.currentPage);
                    setTotalPages(response.data.pagination.totalPages);
                    setTotalFaqs(response.data.pagination.totalFAQs);
                    // setTotalFaqs(response.data.faqs.length);
                }
            } catch (error) {
                console.error("Error fetching FAQs:", error);
                setError("Failed to fetch FAQs");
            } finally {
                setLoading(false);
            }
        },
        [filters]
    );

    // Fetch dropdown options
    const fetchOptions = useCallback(async () => {
        try {
            const [coursesRes, programsRes] = await Promise.all([
                apiClient.get("/Admin/Courses"),
                apiClient.get("/Admin/Programs"),
            ]);

            // Handle different response structures
            if (coursesRes.data.success) {
                setCourses(coursesRes.data.courses || []);
            } else if (coursesRes.data.courses) {
                setCourses(coursesRes.data.courses || []);
            } else if (Array.isArray(coursesRes.data)) {
                setCourses(coursesRes.data);
            }

            if (programsRes.data.success) {
                setPrograms(programsRes.data.programs || []);
            } else if (programsRes.data.programs) {
                setPrograms(programsRes.data.programs || []);
            } else if (Array.isArray(programsRes.data)) {
                setPrograms(programsRes.data);
            }

            // Extract unique categories from FAQs
            const uniqueCategories = [
                ...new Set(
                    faqs
                        .map((faq) => faq.category)
                        .filter((category) => category)
                ),
            ];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching options:", error);
        }
    }, [faqs]);

    // Delete FAQ
    const handleDelete = async (faqId) => {
        if (!window.confirm("Are you sure you want to delete this FAQ?")) {
            return;
        }

        try {
            await apiClient.delete(`/faqs/${faqId}`);
            setSuccess("FAQ deleted successfully");
            fetchFaqs(currentPage);
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            setError("Failed to delete FAQ");
        }
    };

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    // Handle modal save
    const handleModalSave = () => {
        setIsModalOpen(false);
        setEditingFaq(null);
        setSuccess(
            editingFaq ? "FAQ updated successfully" : "FAQ created successfully"
        );
        fetchFaqs(currentPage);
    };

    // Clear messages
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess("");
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // Fetch data on component mount and filter changes
    useEffect(() => {
        fetchFaqs(currentPage);
    }, [filters, currentPage, fetchFaqs]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    const getAssignmentTypeDisplay = (faq) => {
        switch (faq.assignmentType) {
            case "home":
                return (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Home
                    </span>
                );
            case "course":
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                        Course: {faq.Course?.Title || `ID: ${faq.courseId}`}
                    </span>
                );
            case "program":
                return (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        Program: {faq.Program?.Title || `ID: ${faq.programId}`}
                    </span>
                );
            case "global":
                return (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        Global
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        {faq.assignmentType}
                    </span>
                );
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        FAQ Management
                    </h1>
                    <p className="text-gray-600">
                        Manager les questions fréquentes pour la page d'accueil,
                        les cours et les programmes.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingFaq(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    ajouter une FAQ
                </button>
            </div>

            {/* Messages */}
            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Filters */}
            <FAQFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">
                        {totalFaqs}
                    </div>
                    <div className="text-gray-600">Total FAQs</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">
                        {faqs.filter((faq) => faq.isActive).length}
                    </div>
                    <div className="text-gray-600">Active FAQs</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-600">
                        {
                            faqs.filter(
                                (faq) => faq.assignmentType === "course"
                            ).length
                        }
                    </div>
                    <div className="text-gray-600">Course FAQs</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-indigo-600">
                        {
                            faqs.filter(
                                (faq) => faq.assignmentType === "program"
                            ).length
                        }
                    </div>
                    <div className="text-gray-600">Program FAQs</div>
                </div>
            </div>

            {/* FAQ Table */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading FAQs...</p>
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No FAQs found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new FAQ.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setEditingFaq(null);
                                    setIsModalOpen(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                Add Your First FAQ
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Question
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assignment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 w-24 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stats
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {faqs.map((faq) => (
                                        <tr
                                            key={faq.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {faq.question}
                                                    </div>
                                                    {faq.question_ar && (
                                                        <div className="text-xs text-gray-500 truncate mt-1">
                                                            AR:{" "}
                                                            {faq.question_ar}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getAssignmentTypeDisplay(faq)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {faq.category ||
                                                        "No Category"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                                        faq.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {faq.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-500">
                                                    <div>
                                                        Views: {faq.viewCount}
                                                    </div>
                                                    <div>
                                                        Helpful:{" "}
                                                        {faq.helpfulCount}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setViewingFaq(faq);
                                                            setIsViewModalOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                        title="Voir les détails"
                                                    >
                                                        👁️ View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingFaq(faq);
                                                            setIsModalOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                        title="Modifier"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(faq.id)
                                                        }
                                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                        title="Supprimer"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <p className="text-sm text-gray-700">
                                            Showing page {currentPage} of{" "}
                                            {totalPages} ({totalFaqs} total
                                            FAQs)
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                setCurrentPage(currentPage - 1)
                                            }
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() =>
                                                setCurrentPage(currentPage + 1)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* FAQ Modal */}
            <FAQModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingFaq(null);
                }}
                onSave={handleModalSave}
                faq={editingFaq}
                courses={courses}
                programs={programs}
            />

            {/* FAQ View Modal */}
            <FAQViewModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewingFaq(null);
                }}
                faq={viewingFaq}
            />
        </div>
    );
};

export default FAQManager;
