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
    HeartIcon,
    BookOpenIcon,
    AcademicCapIcon,
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

const FavoritesAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });
    const [selectedType, setSelectedType] = useState("");

    const fetchFavoritesData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await statisticsAPI.getFavoritesAnalytics({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                type: selectedType,
                limit: 15,
            });
            setData(response.data.data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch favorites analytics");
            console.error("Error fetching favorites analytics:", err);
        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedType]);

    useEffect(() => {
        fetchFavoritesData();
    }, [fetchFavoritesData]);

    if (loading) return <MainLoading />;
    if (error)
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={fetchFavoritesData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );

    // Prepare chart data for favorites over time
    const favoritesOverTimeData = {
        labels: data?.favoritesOverTime?.map((item) => item.date) || [],
        datasets: [
            {
                label: "Daily Favorites",
                data:
                    data?.favoritesOverTime?.map((item) =>
                        parseInt(item.favoriteCount)
                    ) || [],
                borderColor: "rgb(236, 72, 153)",
                backgroundColor: "rgba(236, 72, 153, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Prepare chart data for top favorite courses
    const topCoursesData = {
        labels:
            data?.topFavoriteCourses?.slice(0, 10).map((item) => {
                const title = item.Course?.title || `Course ${item.CourseId}`;
                return title.length > 20
                    ? title.substring(0, 20) + "..."
                    : title;
            }) || [],
        datasets: [
            {
                label: "Favorites Count",
                data:
                    data?.topFavoriteCourses
                        ?.slice(0, 10)
                        .map((item) => parseInt(item.favoriteCount)) || [],
                backgroundColor: [
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(6, 182, 212, 0.8)",
                    "rgba(251, 146, 60, 0.8)",
                    "rgba(168, 85, 247, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                ],
                borderWidth: 1,
            },
        ],
    };

    // Favorites by type distribution
    const typeDistributionData = {
        labels:
            data?.favoritesByType?.map((item) => {
                return item.type === "course" ? "Courses" : "Programs";
            }) || [],
        datasets: [
            {
                data:
                    data?.favoritesByType?.map((item) =>
                        parseInt(item.count)
                    ) || [],
                backgroundColor: [
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(59, 130, 246, 0.8)",
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

    const FavoriteCard = ({ item, type = "course", rank }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 text-sm font-medium">
                            #{rank}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                            {type === "course"
                                ? item.Course?.title ||
                                  `Course ${item.CourseId}`
                                : `Program ${item.ProgramId}`}
                        </h4>
                        <div className="flex items-center mt-2">
                            <HeartIcon className="w-4 h-4 text-pink-500 mr-1" />
                            <span className="text-lg font-bold text-gray-900">
                                {parseInt(item.favoriteCount).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                                favorites
                            </span>
                        </div>
                        {item.Course?.Price && (
                            <p className="text-xs text-gray-500 mt-1">
                                Price: $
                                {parseFloat(item.Course.Price).toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
                {item.Course?.thumbnail && (
                    <img
                        src={item.Course.thumbnail}
                        alt={item.Course.title}
                        className="w-12 h-12 rounded-lg object-cover ml-3"
                    />
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Header with Filters */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Favorites Analytics
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
                            Type Filter
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="course">Courses Only</option>
                            <option value="program">Programs Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <HeartIcon className="w-8 h-8 text-pink-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Favorites
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.totalFavorites?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <BookOpenIcon className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Course Favorites
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.favoritesByType
                                    ?.find((t) => t.type === "course")
                                    ?.count?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <AcademicCapIcon className="w-8 h-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Program Favorites
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.favoritesByType
                                    ?.find((t) => t.type === "program")
                                    ?.count?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Favorites Over Time Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Favorites Over Time
                </h3>
                <div className="h-80">
                    <Line data={favoritesOverTimeData} options={chartOptions} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Favorite Courses Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Most Favorited Courses
                    </h3>
                    <div className="h-80">
                        <Bar data={topCoursesData} options={chartOptions} />
                    </div>
                </div>

                {/* Type Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Favorites by Type
                    </h3>
                    <div className="h-80">
                        <Doughnut
                            data={typeDistributionData}
                            options={doughnutOptions}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Favorite Courses List */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <HeartIcon className="w-5 h-5 text-pink-500 mr-2" />
                        Most Favorited Courses
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {data?.topFavoriteCourses
                            ?.slice(0, 10)
                            .map((item, index) => (
                                <FavoriteCard
                                    key={index}
                                    item={item}
                                    type="course"
                                    rank={index + 1}
                                />
                            ))}
                        {(!data?.topFavoriteCourses ||
                            data.topFavoriteCourses.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No favorite courses data available
                            </p>
                        )}
                    </div>
                </div>

                {/* Top Favorite Programs List */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <AcademicCapIcon className="w-5 h-5 text-purple-500 mr-2" />
                        Most Favorited Programs
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {data?.topFavoritePrograms
                            ?.slice(0, 10)
                            .map((item, index) => (
                                <FavoriteCard
                                    key={index}
                                    item={item}
                                    type="program"
                                    rank={index + 1}
                                />
                            ))}
                        {(!data?.topFavoritePrograms ||
                            data.topFavoritePrograms.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No favorite programs data available
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FavoritesAnalytics;
