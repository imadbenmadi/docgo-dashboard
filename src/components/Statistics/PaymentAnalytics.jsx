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
    Filler,
} from "chart.js";
import {
    CurrencyDollarIcon,
    CreditCardIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import statisticsAPI from "../../API/Statistics";
import MainLoading from "../../MainLoading";
import { formatMoneyDZD } from "../../utils/currency";

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
    Filler,
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

    const successStatuses = new Set(["approved", "completed", "accepted"]);

    const normalizeCourse = (course) => {
        if (!course) return null;
        return {
            id: course.id,
            title: course.Title ?? course.title,
            thumbnail: course.Image ?? course.thumbnail,
            price: course.Price ?? course.price,
        };
    };

    const normalizeProgram = (program) => {
        if (!program) return null;
        return {
            id: program.id,
            title: program.title ?? program.Title,
            thumbnail: program.Image ?? program.thumbnail,
            price: program.Price ?? program.price,
        };
    };

    const getCourseFromRevenueItem = (item) =>
        normalizeCourse(item?.applicationCourse ?? item?.Course);

    const getProgramFromRevenueItem = (item) =>
        normalizeProgram(
            item?.Program ??
                item?.Programs ??
                item?.program ??
                item?.favoriteProgram,
        );

    // Prepare chart data for revenue over time
    const revenueChartData = {
        labels: data?.revenueOverTime?.map((item) => item.period) || [],
        datasets: [
            {
                label: "Revenue (DZD)",
                data:
                    data?.revenueOverTime?.map((item) =>
                        parseFloat(item.revenue),
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
                        parseInt(item.transactionCount),
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
                        parseFloat(item.revenue),
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
    const statusColorFor = (status) => {
        if (successStatuses.has(status)) return "rgba(34, 197, 94, 0.8)";
        if (status === "pending" || status === "opened")
            return "rgba(245, 158, 11, 0.8)";
        if (status === "rejected" || status === "failed")
            return "rgba(239, 68, 68, 0.8)";
        if (status === "cancelled") return "rgba(107, 114, 128, 0.8)";
        if (status === "deleted") return "rgba(148, 163, 184, 0.8)";
        return "rgba(139, 92, 246, 0.8)";
    };

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
                        parseInt(item.count),
                    ) || [],
                backgroundColor:
                    data?.paymentsByStatus?.map((item) =>
                        statusColorFor(item.status),
                    ) || [],
                borderWidth: 1,
            },
        ],
    };

    const methodData = {
        labels:
            data?.revenueByMethod?.map((m) =>
                (m.paymentMethod || "unknown").toUpperCase(),
            ) || [],
        datasets: [
            {
                data:
                    data?.revenueByMethod?.map((m) => parseFloat(m.revenue)) ||
                    [],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(107, 114, 128, 0.8)",
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
                                {formatMoneyDZD(data?.totalRevenue)}
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
                                {formatMoneyDZD(data?.averageTransactionValue)}
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
                                {data?.paymentsByStatus
                                    ? Math.round(
                                          (data.paymentsByStatus
                                              .filter((s) =>
                                                  successStatuses.has(s.status),
                                              )
                                              .reduce(
                                                  (sum, s) =>
                                                      sum + parseInt(s.count),
                                                  0,
                                              ) /
                                              data.paymentsByStatus.reduce(
                                                  (sum, s) =>
                                                      sum + parseInt(s.count),
                                                  0,
                                              )) *
                                              100 || 0,
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue by Method */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Revenue by Payment Method
                    </h3>
                    <div className="h-80">
                        <Doughnut data={methodData} options={doughnutOptions} />
                    </div>
                </div>

                {/* Top Programs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Top Programs by Revenue
                    </h3>
                    <div className="space-y-4">
                        {data?.topProgramsByRevenue
                            ?.slice(0, 8)
                            .map((item, index) => {
                                const program = getProgramFromRevenueItem(item);
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            {program?.thumbnail && (
                                                <img
                                                    src={program.thumbnail}
                                                    alt={program.title}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                    {program?.title ||
                                                        `Program ${item.ProgramId}`}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.purchases} purchases
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-600">
                                                {formatMoneyDZD(item.revenue)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        {(!data?.topProgramsByRevenue ||
                            data.topProgramsByRevenue.length === 0) && (
                            <p className="text-sm text-gray-500">
                                No program revenue data available
                            </p>
                        )}
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
                                        {getCourseFromRevenueItem(item)
                                            ?.thumbnail && (
                                            <img
                                                src={
                                                    getCourseFromRevenueItem(
                                                        item,
                                                    )?.thumbnail
                                                }
                                                alt={
                                                    getCourseFromRevenueItem(
                                                        item,
                                                    )?.title
                                                }
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                {getCourseFromRevenueItem(item)
                                                    ?.title ||
                                                    `Course ${item.CourseId}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.enrollments} enrollments
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">
                                            {formatMoneyDZD(item.revenue)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {getCourseFromRevenueItem(item)
                                                ?.price &&
                                            getCourseFromRevenueItem(item)
                                                ?.price > 0
                                                ? `${formatMoneyDZD(
                                                      getCourseFromRevenueItem(
                                                          item,
                                                      )?.price,
                                                  )} each`
                                                : "Gratuit"}
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
                                            0,
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
                                                        successStatuses.has(
                                                            item.status,
                                                        )
                                                            ? "bg-green-100 text-green-800"
                                                            : item.status ===
                                                                    "pending" ||
                                                                item.status ===
                                                                    "opened"
                                                              ? "bg-yellow-100 text-yellow-800"
                                                              : item.status ===
                                                                      "rejected" ||
                                                                  item.status ===
                                                                      "failed"
                                                                ? "bg-red-100 text-red-800"
                                                                : item.status ===
                                                                    "cancelled"
                                                                  ? "bg-gray-100 text-gray-800"
                                                                  : item.status ===
                                                                      "deleted"
                                                                    ? "bg-slate-100 text-slate-800"
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
                                                    item.count,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatMoneyDZD(
                                                    item.totalAmount || 0,
                                                )}
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
