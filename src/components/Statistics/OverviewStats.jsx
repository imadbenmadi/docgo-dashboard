import { useState, useEffect, useCallback } from "react";
import {
    UsersIcon,
    EyeIcon,
    CurrencyDollarIcon,
    BookOpenIcon,
    HeartIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import statisticsAPI from "../../API/Statistics";
import MainLoading from "../../MainLoading";
import { formatMoneyDZD } from "../../utils/currency";

const OverviewStats = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("30d");

    const periods = [
        { value: "7d", label: "Last 7 days" },
        { value: "30d", label: "Last 30 days" },
        { value: "90d", label: "Last 90 days" },
        { value: "1y", label: "Last year" },
    ];

    const fetchOverviewData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await statisticsAPI.getOverview(selectedPeriod);

            setData(response.data.data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch overview statistics");
            console.error("Error fetching overview:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        fetchOverviewData();
    }, [fetchOverviewData]);

    if (loading) return <MainLoading />;
    if (error)
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={fetchOverviewData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );

    const StatCard = ({
        title,
        value,
        change,
        icon: Icon,
        color = "blue",
        prefix = "",
        suffix = "",
    }) => {
        const isPositive = change >= 0;
        const colorClasses = {
            blue: "bg-blue-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
            orange: "bg-orange-500",
            pink: "bg-pink-500",
        };

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {prefix}
                            {typeof value === "number"
                                ? value.toLocaleString()
                                : value}
                            {suffix}
                        </p>
                        {change !== undefined && (
                            <div
                                className={`flex items-center mt-2 text-sm ${
                                    isPositive
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {isPositive ? (
                                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                                ) : (
                                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                                )}
                                <span>{Math.abs(change)}%</span>
                                <span className="text-gray-500 ml-1">
                                    vs previous period
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={`${colorClasses[color]} rounded-full p-3`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        );
    };

    const TopItem = ({ items, title, icon: Icon }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
                <Icon className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <div className="space-y-3">
                {items?.slice(0, 5).map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between"
                    >
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                            {item.page ||
                                item.referrer ||
                                item.country ||
                                "Unknown"}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                            {item.visits || item.count}
                        </span>
                    </div>
                ))}
                {(!items || items.length === 0) && (
                    <p className="text-sm text-gray-500">No data available</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Header with Period Selector */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Platform Overview
                </h2>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {periods.map((period) => (
                        <option key={period.value} value={period.value}>
                            {period.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={data?.overview?.totalUsers}
                    change={data?.overview?.userGrowth}
                    icon={UsersIcon}
                    color="blue"
                />
                <StatCard
                    title="Page Visits"
                    value={data?.overview?.totalVisits}
                    change={data?.overview?.visitsGrowth}
                    icon={EyeIcon}
                    color="green"
                />
                <StatCard
                    title="Revenue"
                    value={formatMoneyDZD(data?.overview?.totalRevenue)}
                    change={data?.overview?.revenueGrowth}
                    icon={CurrencyDollarIcon}
                    color="purple"
                />
                <StatCard
                    title="Total Courses"
                    value={data?.overview?.totalCourses}
                    icon={BookOpenIcon}
                    color="orange"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="New Users"
                    value={data?.overview?.newUsers}
                    icon={UsersIcon}
                    color="blue"
                    suffix={` in ${periods
                        .find((p) => p.value === selectedPeriod)
                        ?.label.toLowerCase()}`}
                />
                <StatCard
                    title="Unique Visitors"
                    value={data?.overview?.uniqueVisitors}
                    icon={EyeIcon}
                    color="green"
                />
                <StatCard
                    title="Course Approvals"
                    value={data?.overview?.courseApplicationsApproved}
                    icon={BookOpenIcon}
                    color="orange"
                    suffix={` (${data?.overview?.courseApprovalRate || 0}%)`}
                />
                <StatCard
                    title="Program Purchases"
                    value={data?.overview?.programPurchasesApproved}
                    icon={CurrencyDollarIcon}
                    color="purple"
                    suffix={` (${data?.overview?.programApprovalRate || 0}%)`}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Favorites"
                    value={data?.overview?.totalFavorites}
                    icon={HeartIcon}
                    color="pink"
                />
                <StatCard
                    title="Course Applications"
                    value={data?.overview?.courseApplicationsTotal}
                    icon={BookOpenIcon}
                    color="orange"
                />
                <StatCard
                    title="Program Requests"
                    value={data?.overview?.programPurchasesTotal}
                    icon={UsersIcon}
                    color="blue"
                />
                <StatCard
                    title="Payments"
                    value={data?.overview?.totalPayments}
                    icon={CurrencyDollarIcon}
                    color="green"
                />
            </div>

            {/* Top Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <TopItem
                    title="Top Pages"
                    items={data?.topPages}
                    icon={ChartBarIcon}
                />
                <TopItem
                    title="Top Referrers"
                    items={data?.topReferrers}
                    icon={EyeIcon}
                />
                <TopItem
                    title="Top Countries"
                    items={data?.countryDistribution}
                    icon={UsersIcon}
                />
                <TopItem
                    title="Device Types"
                    items={data?.deviceDistribution}
                    icon={ChartBarIcon}
                />
            </div>
        </div>
    );
};

export default OverviewStats;
