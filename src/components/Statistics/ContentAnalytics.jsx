import { useState, useEffect, useCallback } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { BookOpenIcon, HeartIcon, EyeIcon } from "@heroicons/react/24/outline";
import statisticsAPI from "../../API/Statistics";
import MainLoading from "../../MainLoading";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
);

const ContentAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });

    const fetchContentData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await statisticsAPI.getContentAnalytics({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            });

            setData(response.data.data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch content analytics");
            console.error("Error fetching content analytics:", err);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchContentData();
    }, [fetchContentData]);

    if (loading) return <MainLoading />;
    if (error)
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={fetchContentData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );

    const normalizeCourse = (course) => {
        if (!course) return null;
        return {
            id: course.id,
            title: course.Title ?? course.title,
            thumbnail: course.Image ?? course.thumbnail,
        };
    };

    const getCourseFromFavoriteItem = (item) =>
        normalizeCourse(item?.favoriteCourse ?? item?.Course);

    const getCourseFromEnrollmentItem = (item) =>
        normalizeCourse(item?.applicationCourse ?? item?.Course);

    // Prepare chart data for course visits
    const courseVisitsChartData = {
        labels:
            data?.courseVisits?.slice(0, 10).map((item) => {
                const page = item.page.split("/").pop() || "Unknown";
                return page.length > 15 ? page.substring(0, 15) + "..." : page;
            }) || [],
        datasets: [
            {
                label: "Course Visits",
                data:
                    data?.courseVisits
                        ?.slice(0, 10)
                        .map((item) => item.visits) || [],
                backgroundColor: "rgba(59, 130, 246, 0.8)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Prepare chart data for top favorite courses
    const favoritesChartData = {
        labels:
            data?.topFavoriteCourses?.slice(0, 8).map((item) => {
                const course = getCourseFromFavoriteItem(item);
                const title = course?.title || `Course ${item.CourseId}`;
                return title.length > 20
                    ? title.substring(0, 20) + "..."
                    : title;
            }) || [],
        datasets: [
            {
                data:
                    data?.topFavoriteCourses
                        ?.slice(0, 8)
                        .map((item) => item.favoriteCount) || [],
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

    const CourseCard = ({
        course,
        type = "visits",
        value,
        icon: Icon,
        colorClass,
    }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                        {course?.title || `Course ${course?.id || "Unknown"}`}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                        {type === "visits"
                            ? "Page visits"
                            : type === "favorites"
                              ? "Favorites"
                              : "Enrollments"}
                    </p>
                    <div className="flex items-center mt-2">
                        <Icon className={`w-4 h-4 ${colorClass} mr-1`} />
                        <span className="text-lg font-bold text-gray-900">
                            {typeof value === "number"
                                ? value.toLocaleString()
                                : value}
                        </span>
                    </div>
                </div>
                {course?.thumbnail && (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
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
                    Content Analytics
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
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <EyeIcon className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Course Page Visits
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.courseVisits
                                    ?.reduce(
                                        (sum, item) =>
                                            sum + parseInt(item.visits),
                                        0,
                                    )
                                    ?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <BookOpenIcon className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Program Visits
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.programVisits
                                    ?.reduce(
                                        (sum, item) =>
                                            sum + parseInt(item.visits),
                                        0,
                                    )
                                    ?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <HeartIcon className="w-8 h-8 text-red-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Course Favorites
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.topFavoriteCourses
                                    ?.reduce(
                                        (sum, item) =>
                                            sum + parseInt(item.favoriteCount),
                                        0,
                                    )
                                    ?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <BookOpenIcon className="w-8 h-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Enrollments
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data?.courseEnrollments
                                    ?.reduce(
                                        (sum, item) =>
                                            sum +
                                            parseInt(item.enrollmentCount),
                                        0,
                                    )
                                    ?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Course Visits Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Top Course Page Visits
                    </h3>
                    <div className="h-80">
                        <Bar
                            data={courseVisitsChartData}
                            options={chartOptions}
                        />
                    </div>
                </div>

                {/* Favorites Doughnut Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Most Favorited Courses
                    </h3>
                    <div className="h-80">
                        <Doughnut
                            data={favoritesChartData}
                            options={doughnutOptions}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Most Visited Courses */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <EyeIcon className="w-5 h-5 text-blue-500 mr-2" />
                        Most Visited Courses
                    </h3>
                    <div className="space-y-3">
                        {data?.courseVisits?.slice(0, 6).map((item, index) => (
                            <CourseCard
                                key={index}
                                course={{ title: item.page.split("/").pop() }}
                                type="visits"
                                value={item.visits}
                                icon={EyeIcon}
                                colorClass="text-blue-500"
                            />
                        ))}
                    </div>
                </div>

                {/* Most Favorited Courses */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
                        Most Favorited Courses
                    </h3>
                    <div className="space-y-3">
                        {data?.topFavoriteCourses
                            ?.slice(0, 6)
                            .map((item, index) => (
                                <CourseCard
                                    key={index}
                                    course={getCourseFromFavoriteItem(item)}
                                    type="favorites"
                                    value={item.favoriteCount}
                                    icon={HeartIcon}
                                    colorClass="text-red-500"
                                />
                            ))}
                    </div>
                </div>

                {/* Top Enrollments */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <BookOpenIcon className="w-5 h-5 text-green-500 mr-2" />
                        Top Enrollments
                    </h3>
                    <div className="space-y-3">
                        {data?.courseEnrollments
                            ?.slice(0, 6)
                            .map((item, index) => (
                                <CourseCard
                                    key={index}
                                    course={getCourseFromEnrollmentItem(item)}
                                    type="enrollments"
                                    value={item.enrollmentCount}
                                    icon={BookOpenIcon}
                                    colorClass="text-green-500"
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentAnalytics;
