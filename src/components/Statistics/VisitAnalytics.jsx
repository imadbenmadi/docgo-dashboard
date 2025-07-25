import { useState, useEffect, useCallback } from "react";
import { Line, Bar } from "react-chartjs-2";
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
} from "chart.js";
import { CalendarIcon, EyeIcon, ClockIcon } from "@heroicons/react/24/outline";
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
    Legend
);

const VisitAnalytics = () => {
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

    const fetchVisitData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await statisticsAPI.getVisitAnalytics({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                groupBy,
            });
            setData(response.data.data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch visit analytics");
            console.error("Error fetching visits:", err);
        } finally {
            setLoading(false);
        }
    }, [dateRange, groupBy]);

    useEffect(() => {
        fetchVisitData();
    }, [fetchVisitData]);

    if (loading) return <MainLoading />;
    if (error)
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={fetchVisitData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );

    // Prepare chart data
    const visitsChartData = {
        labels: data?.visitsOverTime?.map((item) => item.period) || [],
        datasets: [
            {
                label: "Total Visits",
                data: data?.visitsOverTime?.map((item) => item.visits) || [],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "Unique Visitors",
                data:
                    data?.visitsOverTime?.map((item) => item.uniqueVisitors) ||
                    [],
                borderColor: "rgb(16, 185, 129)",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const topPagesChartData = {
        labels:
            data?.topPages?.slice(0, 10).map((item) => {
                const page = item.page;
                return page.length > 30 ? page.substring(0, 30) + "..." : page;
            }) || [],
        datasets: [
            {
                label: "Page Visits",
                data:
                    data?.topPages?.slice(0, 10).map((item) => item.visits) ||
                    [],
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

    return (
        <div className="p-6">
            {/* Header with Filters */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Visit Analytics
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
                            <option value="hour">Hour</option>
                            <option value="day">Day</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Visits Over Time Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center mb-4">
                    <CalendarIcon className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                        Visits Over Time
                    </h3>
                </div>
                <div className="h-80">
                    <Line data={visitsChartData} options={chartOptions} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <EyeIcon className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Visits
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.visitsOverTime
                                    ?.reduce(
                                        (sum, item) =>
                                            sum + parseInt(item.visits),
                                        0
                                    )
                                    ?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <EyeIcon className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Unique Visitors
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.visitsOverTime
                                    ?.reduce(
                                        (sum, item) =>
                                            sum + parseInt(item.uniqueVisitors),
                                        0
                                    )
                                    ?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <ClockIcon className="w-8 h-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Avg Duration
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.topPages?.[0]?.avgDuration
                                    ? `${Math.round(
                                          data.topPages[0].avgDuration
                                      )}s`
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Most Visited Pages
                    </h3>
                    <div className="h-80">
                        <Bar data={topPagesChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Bounce Rates Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Bounce Rates by Page
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Page
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Visits
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bounce Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data?.bounceRates
                                    ?.slice(0, 8)
                                    .map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">
                                                {item.page}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.totalVisits.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        item.bounceRate > 70
                                                            ? "bg-red-100 text-red-800"
                                                            : item.bounceRate >
                                                              50
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-green-100 text-green-800"
                                                    }`}
                                                >
                                                    {item.bounceRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitAnalytics;
