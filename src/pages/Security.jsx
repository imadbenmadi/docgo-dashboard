import { useState, useEffect, useCallback } from "react";
import apiClient from "../utils/apiClient";
import {
    FiShield,
    FiAlertTriangle,
    FiCheck,
    FiX,
    FiTrash2,
    FiRefreshCw,
    FiFilter,
    FiDownload,
    FiMapPin,
    FiMonitor,
    FiClock,
    FiUser,
    FiGlobe,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import DataSeederPanel from "../components/DataSeederPanel";

const Security = () => {
    const [loginData, setLoginData] = useState({
        logins: [],
        stats: {},
        pagination: {},
    });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        status: "",
        threatLevel: "",
        isThreat: "",
        startDate: "",
        endDate: "",
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLogins, setSelectedLogins] = useState([]);

    // Fetch login data
    const fetchLogins = useCallback(async () => {
        setLoading(true);
        try {
            
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await apiClient.get(
                `/Admin/Logins?${params.toString()}`
            );

            setLoginData(response.data);
        } catch (error) {
            console.error("Error fetching logins:", error);
            toast.error("Failed to load login data");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await apiClient.get("/Admin/Login_Stats");
            setLoginData((prev) => ({ ...prev, stats: response.data }));
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        fetchLogins();
        fetchStats();
    }, [fetchLogins]);

    // Handle individual threat dismissal
    const handleThreatDismissal = async (loginId) => {
        try {
            await apiClient.patch(`/Admin/Logins/${loginId}/dismiss-threat`);
            toast.success("Threat marked as handled");
            fetchLogins();
        } catch (error) {
            console.error("Error dismissing threat:", error);
            toast.error("Failed to dismiss threat");
        }
    };

    // Handle bulk threat dismissal
    const handleBulkThreatDismissal = async () => {
        if (selectedLogins.length === 0) {
            toast.error("Please select login attempts to dismiss");
            return;
        }

        try {
            await apiClient.patch("/Admin/Logins/dismiss-threats", {
                loginIds: selectedLogins,
            });
            toast.success(`${selectedLogins.length} threats marked as handled`);
            setSelectedLogins([]);
            fetchLogins();
        } catch (error) {
            console.error("Error dismissing threats:", error);
            toast.error("Failed to dismiss selected threats");
        }
    };

    // Handle clear all threats
    const handleClearAllThreats = async () => {
        if (
            !window.confirm(
                "Are you sure you want to clear all threat flags? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            await apiClient.patch("/Admin/Logins/clear-all-threats");
            toast.success("All threats cleared successfully");
            fetchLogins();
        } catch (error) {
            console.error("Error clearing all threats:", error);
            toast.error("Failed to clear all threats");
        }
    };

    // Export data
    const handleExport = async () => {
        try {
            const response = await apiClient.get("/Admin/Logins/export", {
                params: filters,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `login-history-${new Date().toISOString().split("T")[0]}.csv`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Data exported successfully");
        } catch (error) {
            console.error("Error exporting data:", error);
            toast.error("Failed to export data");
        }
    };

    // Threat level colors
    const getThreatLevelColor = (level) => {
        switch (level) {
            case "LOW":
                return "text-yellow-600 bg-yellow-100";
            case "MEDIUM":
                return "text-orange-600 bg-orange-100";
            case "HIGH":
                return "text-red-600 bg-red-100";
            case "CRITICAL":
                return "text-red-800 bg-red-200";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    // Status colors
    const getStatusColor = (status) => {
        switch (status) {
            case "SUCCESS":
                return "text-green-600 bg-green-100";
            case "FAILED":
                return "text-red-600 bg-red-100";
            case "BLOCKED":
                return "text-red-800 bg-red-200";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    if (!loginData.logins) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center p-8">
                    <div className="mb-6">
                        <FiShield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Security Dashboard
                        </h2>
                        <p className="text-gray-600">
                            No login data available yet. Login attempts will
                            appear here when they occur.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-center mb-3">
                            <FiAlertTriangle className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Threats Detected
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Your system is secure. We&apos;ll monitor for any
                            suspicious login attempts.
                        </p>
                        <button
                            onClick={fetchLogins}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            Check Again
                        </button>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                        <p>The security dashboard will display:</p>
                        <ul className="mt-2 space-y-1">
                            <li>• Login attempts and their status</li>
                            <li>• Threat detection and analysis</li>
                            <li>• Geographic login tracking</li>
                            <li>• Device and browser information</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <FiShield className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Security Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FiFilter className="h-4 w-4" />
                            Filters
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <FiDownload className="h-4 w-4" />
                            Export
                        </button>
                        <button
                            onClick={fetchLogins}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Data Seeder Panel - Only show when no data */}
                {(!loginData.logins || loginData.logins.length === 0) && (
                    <DataSeederPanel onDataSeeded={fetchLogins} />
                )}

                {/* Statistics */}
                {loginData.stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Logins
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {loginData.stats.totalLogins || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {loginData.stats.successRate || 0}%
                                        success rate
                                    </p>
                                </div>
                                <FiUser className="h-12 w-12 text-blue-500 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Threats Detected
                                    </p>
                                    <p className="text-3xl font-bold text-red-600">
                                        {loginData.stats.threatenedLogins || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {loginData.stats.threatRate || 0}%
                                        threat rate
                                    </p>
                                </div>
                                <FiAlertTriangle className="h-12 w-12 text-red-500 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Last 24h
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {loginData.stats.recentActivity
                                            ?.last24Hours || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Login attempts
                                    </p>
                                </div>
                                <FiClock className="h-12 w-12 text-green-500 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Unique IPs
                                    </p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {loginData.stats.uniqueIPs || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Different locations
                                    </p>
                                </div>
                                <FiGlobe className="h-12 w-12 text-purple-500 opacity-20" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                {showFilters && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h3 className="text-lg font-semibold mb-4">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        status: e.target.value,
                                        page: 1,
                                    })
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="SUCCESS">Success</option>
                                <option value="FAILED">Failed</option>
                                <option value="BLOCKED">Blocked</option>
                            </select>

                            <select
                                value={filters.threatLevel}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        threatLevel: e.target.value,
                                        page: 1,
                                    })
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Threat Levels</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>

                            <select
                                value={filters.isThreat}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        isThreat: e.target.value,
                                        page: 1,
                                    })
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All</option>
                                <option value="true">Threats Only</option>
                                <option value="false">Normal Only</option>
                            </select>

                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        startDate: e.target.value,
                                        page: 1,
                                    })
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Start Date"
                            />

                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        endDate: e.target.value,
                                        page: 1,
                                    })
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="End Date"
                            />

                            <button
                                onClick={() =>
                                    setFilters({
                                        page: 1,
                                        limit: 20,
                                        status: "",
                                        threatLevel: "",
                                        isThreat: "",
                                        startDate: "",
                                        endDate: "",
                                    })
                                }
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedLogins.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-blue-800">
                                {selectedLogins.length} login attempt(s)
                                selected
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBulkThreatDismissal}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <FiCheck className="h-4 w-4" />
                                    Mark as Handled
                                </button>
                                <button
                                    onClick={() => setSelectedLogins([])}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    <FiX className="h-4 w-4" />
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const allIds =
                                    loginData.logins?.map(
                                        (login) => login.id
                                    ) || [];
                                setSelectedLogins(
                                    selectedLogins.length === allIds.length
                                        ? []
                                        : allIds
                                );
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            {selectedLogins.length === loginData.logins?.length
                                ? "Deselect All"
                                : "Select All"}
                        </button>
                    </div>
                    <button
                        onClick={handleClearAllThreats}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <FiTrash2 className="h-4 w-4" />
                        Clear All Threats
                    </button>
                </div>

                {/* Login Attempts Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedLogins.length ===
                                                    loginData.logins?.length &&
                                                loginData.logins?.length > 0
                                            }
                                            onChange={() => {
                                                const allIds =
                                                    loginData.logins?.map(
                                                        (login) => login.id
                                                    ) || [];
                                                setSelectedLogins(
                                                    selectedLogins.length ===
                                                        allIds.length
                                                        ? []
                                                        : allIds
                                                );
                                            }}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Admin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Device
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Threat Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <div className="flex items-center justify-center">
                                                <FiRefreshCw className="animate-spin h-6 w-6 mr-3" />
                                                Loading...
                                            </div>
                                        </td>
                                    </tr>
                                ) : loginData.logins?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            No login attempts found
                                        </td>
                                    </tr>
                                ) : (
                                    loginData.logins?.map((login) => (
                                        <tr
                                            key={login.id}
                                            className={
                                                login.isThreat
                                                    ? "bg-red-50"
                                                    : "hover:bg-gray-50"
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLogins.includes(
                                                        login.id
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedLogins([
                                                                ...selectedLogins,
                                                                login.id,
                                                            ]);
                                                        } else {
                                                            setSelectedLogins(
                                                                selectedLogins.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        login.id
                                                                )
                                                            );
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(
                                                    login.timestamp
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {login.admin?.email ||
                                                        "Unknown"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {login.adminId || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                        login.loginStatus
                                                    )}`}
                                                >
                                                    {login.loginStatus}
                                                </span>
                                                {login.failureReason && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {login.failureReason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <FiMapPin className="h-4 w-4 mr-1 text-gray-400" />
                                                    {login.location}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    IP: {login.ipAddress}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <FiMonitor className="h-4 w-4 mr-1 text-gray-400" />
                                                    {login.browser}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {login.os} (
                                                    {login.deviceType})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {login.isThreat ? (
                                                    <div>
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getThreatLevelColor(
                                                                login.threatLevel
                                                            )}`}
                                                        >
                                                            {login.threatLevel}
                                                        </span>
                                                        {login.threatReasons &&
                                                            login.threatReasons
                                                                .length > 0 && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {login.threatReasons
                                                                        .slice(
                                                                            0,
                                                                            2
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        )}
                                                                    {login
                                                                        .threatReasons
                                                                        .length >
                                                                        2 &&
                                                                        " ..."}
                                                                </div>
                                                            )}
                                                    </div>
                                                ) : (
                                                    <span className="text-green-600 text-xs">
                                                        Normal
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {login.isThreat && (
                                                    <button
                                                        onClick={() =>
                                                            handleThreatDismissal(
                                                                login.id
                                                            )
                                                        }
                                                        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs"
                                                        title="Mark threat as handled"
                                                    >
                                                        <FiCheck className="h-3 w-3" />
                                                        Handled
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {loginData.pagination &&
                        loginData.pagination.totalPages > 1 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() =>
                                                setFilters({
                                                    ...filters,
                                                    page: Math.max(
                                                        1,
                                                        filters.page - 1
                                                    ),
                                                })
                                            }
                                            disabled={
                                                !loginData.pagination.hasPrev
                                            }
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() =>
                                                setFilters({
                                                    ...filters,
                                                    page: filters.page + 1,
                                                })
                                            }
                                            disabled={
                                                !loginData.pagination.hasNext
                                            }
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing page{" "}
                                                <span className="font-medium">
                                                    {
                                                        loginData.pagination
                                                            .currentPage
                                                    }
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-medium">
                                                    {
                                                        loginData.pagination
                                                            .totalPages
                                                    }
                                                </span>{" "}
                                                (
                                                {
                                                    loginData.pagination
                                                        .totalCount
                                                }{" "}
                                                total)
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    setFilters({
                                                        ...filters,
                                                        page: 1,
                                                    })
                                                }
                                                disabled={filters.page === 1}
                                                className="px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                First
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setFilters({
                                                        ...filters,
                                                        page: Math.max(
                                                            1,
                                                            filters.page - 1
                                                        ),
                                                    })
                                                }
                                                disabled={
                                                    !loginData.pagination
                                                        .hasPrev
                                                }
                                                className="px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-3 py-2 text-sm text-gray-700">
                                                Page {filters.page} of{" "}
                                                {
                                                    loginData.pagination
                                                        .totalPages
                                                }
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setFilters({
                                                        ...filters,
                                                        page: filters.page + 1,
                                                    })
                                                }
                                                disabled={
                                                    !loginData.pagination
                                                        .hasNext
                                                }
                                                className="px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setFilters({
                                                        ...filters,
                                                        page: loginData
                                                            .pagination
                                                            .totalPages,
                                                    })
                                                }
                                                disabled={
                                                    filters.page ===
                                                    loginData.pagination
                                                        .totalPages
                                                }
                                                className="px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Last
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default Security;
