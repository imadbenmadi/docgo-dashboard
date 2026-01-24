import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    DocumentTextIcon,
    QuestionMarkCircleIcon,
    EyeIcon,
    CalendarIcon,
    UsersIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import { coursesAPI } from "../../../API/Courses";
import Swal from "sweetalert2";
import RichTextDisplay from "../../../components/Common/RichTextEditor/RichTextDisplay";
import VideoPlayer from "../../../components/Common/SimpleVideoPlayer";
import { getVideoURL, getImage } from "../../../utils/mediaUtils";
const VideoView = () => {
    const { courseId, videoId } = useParams();
    const navigate = useNavigate();

    const [video, setVideo] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    const fetchVideoDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await coursesAPI.getVideoDetails(
                courseId,
                videoId,
            );

            setVideo(response.video);
            setCourse(response.course);
        } catch (error) {
            console.error("Error fetching video details:", error);
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Impossible de charger les détails de la vidéo",
            }).then(() => {
                navigate(`/courses/${courseId}/videos`);
            });
        } finally {
            setLoading(false);
        }
    }, [courseId, videoId, navigate]);

    useEffect(() => {
        fetchVideoDetails();
    }, [fetchVideoDetails]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">
                    Video not found
                </h2>
                <p className="text-gray-600 mt-2">
                    The requested video could not be found.
                </p>
                <Link
                    to={`/courses/${courseId}/videos`}
                    className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Videos
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <Link
                        to={`/courses/${courseId}/videos`}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to Videos
                    </Link>
                </div>

                <div className="mt-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {video.Title}
                    </h1>
                    {course && (
                        <p className="text-lg text-gray-600 mt-2">
                            Course: {course.Title}
                        </p>
                    )}
                </div>
            </div>

            {/* Video Player Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Video Player */}
                    <VideoPlayer
                        src={getVideoURL(video)}
                        poster={getImage(video.Image)}
                        title={video.Title}
                        className="mb-6 aspect-video"
                    />

                    {/* Video Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Video Information
                        </h2>
                        {video.Description && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </h3>
                                <p className="text-gray-600">
                                    <RichTextDisplay
                                        content={video.Description}
                                        maxLength={300}
                                        showReadMore={true}
                                    />
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">
                                    Duration:
                                </span>
                                <span className="ml-2 text-gray-600">
                                    {formatDuration(
                                        parseInt(video.Duration) || 0,
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">
                                    Order:
                                </span>
                                <span className="ml-2 text-gray-600">
                                    #{video.VideoOrder || 0}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">
                                    Status:
                                </span>
                                <span
                                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                        video.status === "published"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    {video.status || "draft"}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">
                                    Preview:
                                </span>
                                <span className="ml-2 text-gray-600">
                                    {video.isPreview ? "Yes" : "No"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        PDFs
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {video.pdfs?.length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <QuestionMarkCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        Quizzes
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {video.quizzes?.length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <EyeIcon className="h-5 w-5 text-purple-600 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        Views
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {video.views || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CalendarIcon className="h-5 w-5 text-gray-600 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        Created
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {new Date(
                                        video.createdAt,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Actions
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                Edit Video
                            </button>
                            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                Add Resources
                            </button>
                            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                                Create Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-lg shadow">
                {/* Tab Headers */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            {
                                id: "pdfs",
                                name: "PDF Resources",
                                icon: DocumentTextIcon,
                            },
                            {
                                id: "quizzes",
                                name: "Quizzes",
                                icon: QuestionMarkCircleIcon,
                            },
                            {
                                id: "analytics",
                                name: "Analytics",
                                icon: ChartBarIcon,
                            },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <tab.icon className="h-5 w-5 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === "pdfs" && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                PDF Resources
                            </h3>
                            {video.pdfs && video.pdfs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {video.pdfs.map((pdf, index) => (
                                        <div
                                            key={pdf.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <DocumentTextIcon className="h-8 w-8 text-red-500" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            {pdf.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            {formatFileSize(
                                                                pdf.size,
                                                            )}{" "}
                                                            • Order #{index + 1}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        window.open(
                                                            pdf.url,
                                                            "_blank",
                                                        )
                                                    }
                                                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No PDF resources available for this video.
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === "quizzes" && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Quizzes
                            </h3>
                            {video.quizzes && video.quizzes.length > 0 ? (
                                <div className="space-y-4">
                                    {video.quizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <h4 className="font-medium text-gray-900">
                                                {quiz.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {quiz.questions?.length || 0}{" "}
                                                questions
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No quizzes available for this video.
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Analytics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 rounded-lg p-6 text-center">
                                    <EyeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-blue-900">
                                        {video.views || 0}
                                    </div>
                                    <div className="text-sm text-blue-600">
                                        Total Views
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-6 text-center">
                                    <UsersIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-green-900">
                                        {video.completions || 0}
                                    </div>
                                    <div className="text-sm text-green-600">
                                        Completions
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-6 text-center">
                                    <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-purple-900">
                                        {video.avgScore || 0}%
                                    </div>
                                    <div className="text-sm text-purple-600">
                                        Avg Quiz Score
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

export default VideoView;
