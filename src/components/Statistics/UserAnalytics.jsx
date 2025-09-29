import { useState, useEffect, useCallback } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import {
    UsersIcon,
    UserPlusIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline";
import statisticsAPI from "../../API/Statistics";
import MainLoading from "../../MainLoading";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const UserAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });
    const [groupBy, setGroupBy] = useState("day");

    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await statisticsAPI.getUserAnalytics({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                groupBy,
            });
            setData(response.data.data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch user analytics");
            console.error("Error fetching user analytics:", err);
        } finally {
            setLoading(false);
        }
    }, [dateRange, groupBy]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (loading) return <MainLoading />;
    if (error)
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={fetchUserData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );

    // Prepare chart data for user growth
    const userGrowthChartData = {
        labels: data?.userGrowth?.map((item) => item.period) || [],
        datasets: [
            {
                label: "New User Registrations",
                data: data?.userGrowth?.map((item) => item.newUsers) || [],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Prepare chart data for users by country
    const countryChartData = {
        labels:
            data?.usersByCountry?.slice(0, 10).map((item) => item.country) ||
            [],
        datasets: [
            {
                label: "Users by Country",
                data:
                    data?.usersByCountry
                        ?.slice(0, 10)
                        .map((item) => item.count) || [],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(6, 182, 212, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(251, 146, 60, 0.8)",
                    "rgba(168, 85, 247, 0.8)",
                ],
                borderWidth: 1,
            },
        ],
    };

    // Prepare chart data for study fields
    const studyFieldChartData = {
        labels:
            data?.usersByStudyField?.slice(0, 8).map((item) => {
                const field = item.studyField;
                return field?.length > 15
                    ? field.substring(0, 15) + "..."
                    : field;
            }) || [],
        datasets: [
            {
                data:
                    data?.usersByStudyField
                        ?.slice(0, 8)
                        .map((item) => item.count) || [],
                backgroundColor: [
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(6, 182, 212, 0.8)",
                    "rgba(251, 146, 60, 0.8)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "right",
            },
        },
    };

    return (
        <div className="p-6">
            {/* Header with Filters */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    User Analytics
                </h2>

                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                                setDateRange((prev) => ({
                                    ...prev,
                                    startDate: e.target.value,
                                }))
                            }
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                                setDateRange((prev) => ({
                                    ...prev,
                                    endDate: e.target.value,
                                }))
                            }
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Group By
                        </label>
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="day">Day</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <UsersIcon className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Users
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.totalUsers?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <UserPlusIcon className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                New Users
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.newUsersCount?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <UsersIcon className="w-8 h-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Active Users
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.activeUsers?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <GlobeAltIcon className="w-8 h-8 text-orange-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Retention Rate
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.retentionRate || 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    User Registration Trend
                </h3>
                <div className="h-80">
                    <Line data={userGrowthChartData} options={chartOptions} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Users by Country */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Users by Country
                    </h3>
                    <div className="h-80">
                        <Bar data={countryChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Study Fields Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Study Fields Distribution
                    </h3>
                    <div className="h-80">
                        <Doughnut
                            data={studyFieldChartData}
                            options={doughnutOptions}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Countries Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Top Countries
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Country
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Users
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data?.usersByCountry
                                    ?.slice(0, 8)
                                    .map((item, index) => {
                                        const percentage =
                                            data.totalUsers > 0
                                                ? (item.count /
                                                      data.totalUsers) *
                                                  100
                                                : 0;
                                        return (
                                            <tr key={index}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.country || "Unknown"}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.count.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {percentage.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Study Fields Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Top Study Fields
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Field
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Users
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data?.usersByStudyField
                                    ?.slice(0, 8)
                                    .map((item, index) => {
                                        const percentage =
                                            data.totalUsers > 0
                                                ? (item.count /
                                                      data.totalUsers) *
                                                  100
                                                : 0;
                                        return (
                                            <tr key={index}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.studyField ||
                                                        "Not specified"}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.count.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {percentage.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;
