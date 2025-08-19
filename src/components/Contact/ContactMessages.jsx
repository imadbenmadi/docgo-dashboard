import { useState, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    ChatBubbleLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import contactAPI from "../../API/Contact";

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        status: "",
        priority: "",
        context: "",
        userType: "",
        search: "",
        sortBy: "createdAt",
        sortOrder: "DESC",
    });
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);

    // Load messages
    useEffect(() => {
        fetchMessages();
    }, [pagination.page, filters]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
            };

            // Remove empty filters
            Object.keys(params).forEach((key) => {
                if (params[key] === "") {
                    delete params[key];
                }
            });

            const response = await contactAPI.getContactMessages(params);

            if (response.data.success) {
                setMessages(response.data.data.messages);
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.data.pagination,
                }));
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (messageId, status) => {
        try {
            await contactAPI.updateContactMessage(messageId, { status });
            fetchMessages(); // Refresh the list
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handlePriorityUpdate = async (messageId, priority) => {
        try {
            await contactAPI.updateContactMessage(messageId, { priority });
            fetchMessages(); // Refresh the list
        } catch (error) {
            console.error("Error updating priority:", error);
        }
    };

    const handleDelete = async (messageId) => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            try {
                await contactAPI.deleteContactMessage(messageId);
                fetchMessages(); // Refresh the list
            } catch (error) {
                console.error("Error deleting message:", error);
            }
        }
    };

    const handleViewMessage = (message) => {
        setSelectedMessage(message);
        setShowMessageModal(true);

        // Mark as read if it's unread
        if (message.status === "unread") {
            handleStatusUpdate(message.id, "read");
        }
    };

    const handleCloseModal = () => {
        setShowMessageModal(false);
        setSelectedMessage(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "unread":
                return (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                );
            case "read":
                return <EyeIcon className="h-4 w-4 text-blue-500" />;
            case "responded":
                return (
                    <ChatBubbleLeftIcon className="h-4 w-4 text-green-500" />
                );
            case "resolved":
                return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
            default:
                return <ClockIcon className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent":
                return "bg-red-100 text-red-800";
            case "high":
                return "bg-orange-100 text-orange-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getContextColor = (context) => {
        switch (context) {
            case "landing":
                return "bg-blue-100 text-blue-800";
            case "dashboard":
                return "bg-green-100 text-green-800";
            case "course":
                return "bg-purple-100 text-purple-800";
            case "program":
                return "bg-indigo-100 text-indigo-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Search and Filter Bar */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.search}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    search: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filters
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                    }))
                                }
                            >
                                <option value="">All Statuses</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                                <option value="responded">Responded</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.priority}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        priority: e.target.value,
                                    }))
                                }
                            >
                                <option value="">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Context
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.context}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        context: e.target.value,
                                    }))
                                }
                            >
                                <option value="">All Contexts</option>
                                <option value="landing">Landing Page</option>
                                <option value="dashboard">Dashboard</option>
                                <option value="course">Course</option>
                                <option value="program">Program</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User Type
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={filters.userType}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        userType: e.target.value,
                                    }))
                                }
                            >
                                <option value="">All Types</option>
                                <option value="guest">Guest</option>
                                <option value="authenticated">
                                    Authenticated
                                </option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Message
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Context
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {messages.map((message) => (
                            <tr key={message.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="flex items-center">
                                            <div className="font-medium text-gray-900">
                                                {message.Name}
                                            </div>
                                            <span
                                                className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    message.userType ===
                                                    "authenticated"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {message.userType}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {message.email}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {message.messagePlain ||
                                                message.message}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {getStatusIcon(message.status)}
                                        <select
                                            className="ml-2 text-sm border-none bg-transparent focus:ring-0"
                                            value={message.status}
                                            onChange={(e) =>
                                                handleStatusUpdate(
                                                    message.id,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="unread">
                                                Unread
                                            </option>
                                            <option value="read">Read</option>
                                            <option value="responded">
                                                Responded
                                            </option>
                                            <option value="resolved">
                                                Resolved
                                            </option>
                                        </select>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        className={`text-sm rounded-full px-2 py-1 border-none ${getPriorityColor(
                                            message.priority
                                        )}`}
                                        value={message.priority}
                                        onChange={(e) =>
                                            handlePriorityUpdate(
                                                message.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getContextColor(
                                            message.context
                                        )}`}
                                    >
                                        {message.context}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(message.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                handleViewMessage(message)
                                            }
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(message.id)
                                            }
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {messages.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-gray-500">
                        No contact messages found.
                    </div>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: Math.max(1, prev.page - 1),
                                }))
                            }
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: Math.min(
                                        prev.totalPages,
                                        prev.page + 1
                                    ),
                                }))
                            }
                            disabled={pagination.page === pagination.totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing{" "}
                                <span className="font-medium">
                                    {(pagination.page - 1) * pagination.limit +
                                        1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        pagination.page * pagination.limit,
                                        pagination.total
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">
                                    {pagination.total}
                                </span>{" "}
                                results
                            </p>
                        </div>
                        <div>
                            <nav
                                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                aria-label="Pagination"
                            >
                                <button
                                    onClick={() =>
                                        setPagination((prev) => ({
                                            ...prev,
                                            page: Math.max(1, prev.page - 1),
                                        }))
                                    }
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeftIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </button>

                                {[
                                    ...Array(
                                        Math.min(5, pagination.totalPages)
                                    ),
                                ].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() =>
                                                setPagination((prev) => ({
                                                    ...prev,
                                                    page: pageNum,
                                                }))
                                            }
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                pagination.page === pageNum
                                                    ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() =>
                                        setPagination((prev) => ({
                                            ...prev,
                                            page: Math.min(
                                                prev.totalPages,
                                                prev.page + 1
                                            ),
                                        }))
                                    }
                                    disabled={
                                        pagination.page ===
                                        pagination.totalPages
                                    }
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Message View Modal */}
            {showMessageModal && selectedMessage && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Message Details
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedMessage.Name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedMessage.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <span
                                            className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                selectedMessage.status ===
                                                "unread"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : selectedMessage.status ===
                                                      "read"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}
                                        >
                                            {selectedMessage.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Priority
                                        </label>
                                        <span
                                            className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                selectedMessage.priority ===
                                                "high"
                                                    ? "bg-red-100 text-red-800"
                                                    : selectedMessage.priority ===
                                                      "medium"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}
                                        >
                                            {selectedMessage.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Context
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">
                                            {selectedMessage.context}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Message
                                    </label>
                                    <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                                        {selectedMessage.messageHtml ? (
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: selectedMessage.messageHtml,
                                                }}
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                                {selectedMessage.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            User Type
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">
                                            {selectedMessage.userType}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Received
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {new Date(
                                                selectedMessage.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {selectedMessage.adminResponse && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Admin Response
                                        </label>
                                        <div className="mt-1 p-3 border border-green-300 rounded-md bg-green-50">
                                            <p className="text-sm text-gray-900">
                                                {selectedMessage.adminResponse}
                                            </p>
                                            {selectedMessage.respondedAt && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Responded on{" "}
                                                    {new Date(
                                                        selectedMessage.respondedAt
                                                    ).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        // Navigate to respond tab with this message selected
                                        handleCloseModal();
                                        window.location.href =
                                            "/Contact/respond?messageId=" +
                                            selectedMessage.id;
                                    }}
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Respond
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessages;
