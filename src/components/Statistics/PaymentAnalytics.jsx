import { useState, useEffect, useCallback } from "react";
import { Line, Doughnut } from "react-chartjs-2";
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
import {
    CurrencyDollarIcon,
    CreditCardIcon,
    ChartBarIcon,
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
    Legend
);

const PaymentAnalytics = () => {
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

    const fetchPaymentData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await statisticsAPI.getPaymentAnalytics({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                groupBy,
            });
            setData(response.data.data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch payment analytics");
            console.error("Error fetching payment analytics:", err);
        } finally {
            setLoading(false);
        }
    }, [dateRange, groupBy]);

    useEffect(() => {
        fetchPaymentData();
    }, [fetchPaymentData]);

    if (loading) return <MainLoading />;
    if (error)
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={fetchPaymentData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );

    // Prepare chart data for revenue over time
    const revenueChartData = {
        labels: data?.revenueOverTime?.map((item) => item.period) || [],
        datasets: [
            {
                label: "Revenue ($)",
                data:
                    data?.revenueOverTime?.map((item) =>
                        parseFloat(item.revenue)
                    ) || [],
                borderColor: "rgb(34, 197, 94)",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                fill: true,
                tension: 0.4,
                yAxisID: "y",
            },
            {
                label: "Transactions",
                data:
                    data?.revenueOverTime?.map((item) =>
                        parseInt(item.transactionCount)
                    ) || [],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                yAxisID: "y1",
            },
        ],
    };

    // Revenue by type chart
    const revenueByTypeData = {
        labels:
            data?.revenueByType?.map((item) => {
                return item.type === "program_fee"
                    ? "Program Fee"
                    : item.type === "course_fee"
                    ? "Course Fee"
                    : item.type.charAt(0).toUpperCase() + item.type.slice(1);
            }) || [],
        datasets: [
            {
                data:
                    data?.revenueByType?.map((item) =>
                        parseFloat(item.revenue)
                    ) || [],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                ],
                borderWidth: 1,
            },
        ],
    };

    // Payment status distribution
    const statusData = {
        labels:
            data?.paymentsByStatus?.map((item) => {
                return (
                    item.status.charAt(0).toUpperCase() + item.status.slice(1)
                );
            }) || [],
        datasets: [
            {
                data:
                    data?.paymentsByStatus?.map((item) =>
                        parseInt(item.count)
                    ) || [],
                backgroundColor: [
                    "rgba(34, 197, 94, 0.8)", // completed - green
                    "rgba(245, 158, 11, 0.8)", // pending - yellow
                    "rgba(239, 68, 68, 0.8)", // failed - red
                    "rgba(107, 114, 128, 0.8)", // cancelled - gray
                    "rgba(139, 92, 246, 0.8)", // refunded - purple
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
        },
        scales: {
            y: {
                type: "linear",
                display: true,
                position: "left",
                beginAtZero: true,
            },
            y1: {
                type: "linear",
                display: true,
                position: "right",
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false,
                },
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
                    Payment & Revenue Analytics
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
                        <CurrencyDollarIcon className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                $
                                {data?.totalRevenue?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }) || "0.00"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <CreditCardIcon className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Transactions
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.totalTransactions?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <ChartBarIcon className="w-8 h-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Avg Transaction
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                $
                                {data?.averageTransactionValue?.toLocaleString(
                                    undefined,
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                ) || "0.00"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <CreditCardIcon className="w-8 h-8 text-orange-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Success Rate
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.paymentsByStatus?.find(
                                    (s) => s.status === "completed"
                                )
                                    ? Math.round(
                                          (data.paymentsByStatus.find(
                                              (s) => s.status === "completed"
                                          ).count /
                                              data.paymentsByStatus.reduce(
                                                  (sum, s) =>
                                                      sum + parseInt(s.count),
                                                  0
                                              )) *
                                              100
                                      )
                                    : 0}
                                %
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Over Time Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Revenue & Transactions Over Time
                </h3>
                <div className="h-80">
                    <Line data={revenueChartData} options={chartOptions} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue by Type */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Revenue by Type
                    </h3>
                    <div className="h-80">
                        <Doughnut
                            data={revenueByTypeData}
                            options={doughnutOptions}
                        />
                    </div>
                </div>

                {/* Payment Status Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Payment Status Distribution
                    </h3>
                    <div className="h-80">
                        <Doughnut data={statusData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Courses */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Top Performing Courses by Revenue
                    </h3>
                    <div className="space-y-4">
                        {data?.topCoursesByRevenue
                            ?.slice(0, 8)
                            .map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        {item.Course?.thumbnail && (
                                            <img
                                                src={item.Course.thumbnail}
                                                alt={item.Course.title}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                {item.Course?.title ||
                                                    `Course ${item.CourseId}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.enrollments} enrollments
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">
                                            $
                                            {parseFloat(
                                                item.revenue
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ${item.Course?.Price} each
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Payment Statistics Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Payment Statistics
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Count
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data?.paymentsByStatus?.map((item, index) => {
                                    const totalCount =
                                        data.paymentsByStatus.reduce(
                                            (sum, s) => sum + parseInt(s.count),
                                            0
                                        );
                                    const percentage =
                                        totalCount > 0
                                            ? (item.count / totalCount) * 100
                                            : 0;

                                    return (
                                        <tr key={index}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        item.status ===
                                                        "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : item.status ===
                                                              "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : item.status ===
                                                              "failed"
                                                            ? "bg-red-100 text-red-800"
                                                            : item.status ===
                                                              "cancelled"
                                                            ? "bg-gray-100 text-gray-800"
                                                            : "bg-purple-100 text-purple-800"
                                                    }`}
                                                >
                                                    {item.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        item.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {parseInt(
                                                    item.count
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                $
                                                {parseFloat(
                                                    item.totalAmount || 0
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
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

export default PaymentAnalytics;
