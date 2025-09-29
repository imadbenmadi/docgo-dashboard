import { useState, useEffect } from "react";
import {
    ChartBarIcon,
    EnvelopeIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UsersIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import contactAPI from "../../API/Contact";

const ContactStatistics = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("30d");

    useEffect(() => {
        fetchStatistics();
    }, [timeRange]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getContactStatistics(timeRange);
            if (response.data.success) {
                setStatistics(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching contact statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeRangeLabel = (range) => {
        switch (range) {
            case "7d":
                return "Last 7 Days";
            case "30d":
                return "Last 30 Days";
            case "90d":
                return "Last 90 Days";
            default:
                return "All Time";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="p-6">
                <div className="text-center text-gray-500">
                    Failed to load statistics. Please try again.
                </div>
            </div>
        );
    }

    const { totals, distributions } = statistics;

    return (
        <div className="p-6 space-y-8">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
                    Contact Analytics
                </h2>
                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Time Range:</label>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <EnvelopeIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Messages
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {totals.totalInPeriod.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                {getTimeRangeLabel(timeRange)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Avg Response Time
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {totals.avgResponseTimeHours}h
                            </p>
                            <p className="text-sm text-gray-500">
                                For responded messages
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Resolved Rate
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {totals.totalInPeriod > 0
                                    ? Math.round(
                                          ((distributions.status.find(
                                              (s) => s.status === "resolved"
                                          )?.count || 0) /
                                              totals.totalInPeriod) *
                                              100
                                      )
                                    : 0}
                                %
                            </p>
                            <p className="text-sm text-gray-500">
                                Resolution percentage
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Urgent Messages
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {distributions.priority.find(
                                    (p) => p.priority === "urgent"
                                )?.count || 0}
                            </p>
                            <p className="text-sm text-gray-500">
                                Requiring immediate attention
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        Message Status Distribution
                    </h3>
                    <div className="space-y-4">
                        {distributions.status.map((item) => {
                            const percentage =
                                totals.totalInPeriod > 0
                                    ? (item.count / totals.totalInPeriod) * 100
                                    : 0;
                            const statusColors = {
                                unread: "bg-red-500",
                                read: "bg-blue-500",
                                responded: "bg-green-500",
                                resolved: "bg-green-600",
                            };

                            return (
                                <div
                                    key={item.status}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                statusColors[item.status]
                                            } mr-3`}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    statusColors[item.status]
                                                }`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
                        Priority Distribution
                    </h3>
                    <div className="space-y-4">
                        {distributions.priority.map((item) => {
                            const percentage =
                                totals.totalInPeriod > 0
                                    ? (item.count / totals.totalInPeriod) * 100
                                    : 0;
                            const priorityColors = {
                                low: "bg-gray-500",
                                medium: "bg-yellow-500",
                                high: "bg-orange-500",
                                urgent: "bg-red-500",
                            };

                            return (
                                <div
                                    key={item.priority}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                priorityColors[item.priority]
                                            } mr-3`}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {item.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    priorityColors[
                                                        item.priority
                                                    ]
                                                }`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Context Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 text-purple-500 mr-2" />
                        Message Context
                    </h3>
                    <div className="space-y-4">
                        {distributions.context.map((item) => {
                            const percentage =
                                totals.totalInPeriod > 0
                                    ? (item.count / totals.totalInPeriod) * 100
                                    : 0;
                            const contextColors = {
                                landing: "bg-blue-500",
                                dashboard: "bg-green-500",
                                course: "bg-purple-500",
                                program: "bg-indigo-500",
                            };

                            return (
                                <div
                                    key={item.context}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                contextColors[item.context]
                                            } mr-3`}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {item.context}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    contextColors[item.context]
                                                }`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* User Type Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
                        User Type Distribution
                    </h3>
                    <div className="space-y-4">
                        {distributions.userType.map((item) => {
                            const percentage =
                                totals.totalInPeriod > 0
                                    ? (item.count / totals.totalInPeriod) * 100
                                    : 0;
                            const userTypeColors = {
                                guest: "bg-gray-500",
                                authenticated: "bg-green-500",
                            };

                            return (
                                <div
                                    key={item.userType}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                userTypeColors[item.userType]
                                            } mr-3`}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {item.userType}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    userTypeColors[
                                                        item.userType
                                                    ]
                                                }`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactStatistics;
