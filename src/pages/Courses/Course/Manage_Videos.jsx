import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    DocumentTextIcon,
    QuestionMarkCircleIcon,
    EyeIcon,
    ClockIcon,
    VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { coursesAPI } from "../../../API/Courses";
import Swal from "sweetalert2";
import RichTextEditor from "../../../components/Common/RichTextEditor/RichTextEditor";
import RichTextDisplay from "../../../components/Common/RichTextEditor/RichTextDisplay";
import PDFManager from "../../../components/Courses/PDFManager";
import QuizBuilder from "../../../components/Courses/QuizBuilder";

const Manage_Videos = () => {
    const { courseId } = useParams();

    // State management
    const [videos, setVideos] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddingVideo, setIsAddingVideo] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeTab, setActiveTab] = useState("basic"); // basic, pdfs, quiz

    // Form state for adding/editing videos
    const [videoForm, setVideoForm] = useState({
        Title: "",
        Description: "",
        Duration: "",
        VideoOrder: "",
        isPreview: false,
        VideoUrl: "",
        ThumbnailUrl: "",
        pdfFiles: [],
        hasQuiz: false,
        quizData: null,
        status: "draft",
    });

    // Fetch course videos
    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await coursesAPI.getCourseVideos(courseId);
            setVideos(response.videos || []);
            setCourse(response.course);
        } catch (error) {
            console.error("Error fetching videos:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load course videos",
            });
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Form handlers
    const resetForm = () => {
        setVideoForm({
            Title: "",
            Description: "",
            Duration: "",
            VideoOrder: "",
            isPreview: false,
            VideoUrl: "",
            ThumbnailUrl: "",
            pdfFiles: [],
            hasQuiz: false,
            quizData: null,
            status: "draft",
        });
        setActiveTab("basic"); // Reset to basic tab
    };

    const handleInputChange = (field, value) => {
        setVideoForm((prev) => ({ ...prev, [field]: value }));
    };

    // Add new video
    const handleAddVideo = async () => {
        try {
            if (!videoForm.Title.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Warning",
                    text: "Video title is required",
                });
                return;
            }

            const videoData = {
                ...videoForm,
                Duration: videoForm.Duration ? parseInt(videoForm.Duration) : 0,
                VideoOrder: videoForm.VideoOrder
                    ? parseInt(videoForm.VideoOrder)
                    : undefined,
            };

            await coursesAPI.addVideoMetadata(courseId, videoData);

            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Video added successfully",
                showConfirmButton: false,
                timer: 1500,
            });

            setIsAddingVideo(false);
            resetForm();
            fetchVideos();
        } catch (error) {
            console.error("Error adding video:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.error || "Failed to add video",
            });
        }
    };

    // Edit video
    const handleEditVideo = (video) => {
        setEditingVideo(video);
        setVideoForm({
            Title: video.Title || video.title || "",
            Description: video.Description || "",
            Duration: video.Duration || video.duration || "",
            VideoOrder: video.VideoOrder || video.order || "",
            isPreview: video.isPreview || false,
            VideoUrl: video.VideoUrl || video.video || "",
            ThumbnailUrl: video.ThumbnailUrl || "",
            pdfFiles: video.pdfFiles || [],
            hasQuiz: video.hasQuiz || false,
            quizData: video.quizData || null,
            status: video.status || "draft",
        });
        setIsAddingVideo(true);
    };

    // Update video
    const handleUpdateVideo = async () => {
        try {
            if (!videoForm.Title.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Warning",
                    text: "Video title is required",
                });
                return;
            }

            const videoData = {
                ...videoForm,
                Duration: videoForm.Duration ? parseInt(videoForm.Duration) : 0,
                VideoOrder: videoForm.VideoOrder
                    ? parseInt(videoForm.VideoOrder)
                    : undefined,
            };

            await coursesAPI.updateVideo(courseId, editingVideo.id, videoData);

            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Video updated successfully",
                showConfirmButton: false,
                timer: 1500,
            });

            setIsAddingVideo(false);
            setEditingVideo(null);
            resetForm();
            fetchVideos();
        } catch (error) {
            console.error("Error updating video:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.error || "Failed to update video",
            });
        }
    };

    // Delete video
    const handleDeleteVideo = async (video) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Video",
            text: `Are you sure you want to delete "${
                video.Title || video.title
            }"?`,
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                await coursesAPI.deleteVideo(courseId, video.id);

                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Video has been deleted successfully.",
                    showConfirmButton: false,
                    timer: 1500,
                });

                fetchVideos();
            } catch (error) {
                console.error("Error deleting video:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error.response?.data?.error || "Failed to delete video",
                });
            }
        }
    };

    // View video details
    const handleViewVideo = (video) => {
        setSelectedVideo(video);
        setShowVideoModal(true);
    };

    // Format duration
    const formatDuration = (seconds) => {
        if (!seconds) return "Not set";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "published":
                return "bg-green-100 text-green-800";
            case "draft":
                return "bg-yellow-100 text-yellow-800";
            case "archived":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            to={`/courses/${courseId}`}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Back to Course Details
                        </Link>
                    </div>
                </div>

                <div className="mt-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Manage Videos
                    </h1>
                    {course && (
                        <p className="text-lg text-gray-600 mt-2">
                            Course: {course.Title} ({videos.length} videos)
                        </p>
                    )}
                </div>
            </div>

            {/* Add Video Button */}
            <div className="mb-6">
                <button
                    onClick={() => {
                        setIsAddingVideo(true);
                        setEditingVideo(null);
                        resetForm();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Video
                </button>
            </div>

            {/* Videos Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {videos.length === 0 ? (
                    <div className="p-8 text-center">
                        <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No videos yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Start by adding your first video to this course.
                        </p>
                        <button
                            onClick={() => {
                                setIsAddingVideo(true);
                                setEditingVideo(null);
                                resetForm();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Add First Video
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Features
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {videos.map((video) => (
                                    <tr
                                        key={video.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                {video.VideoOrder ||
                                                    video.order ||
                                                    "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {video.ThumbnailUrl ? (
                                                        <img
                                                            className="h-10 w-10 rounded object-cover"
                                                            src={
                                                                video.ThumbnailUrl
                                                            }
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                                            <VideoCameraIcon className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {video.Title ||
                                                            video.title}
                                                    </div>
                                                    {video.isPreview && (
                                                        <div className="text-xs text-green-600 font-medium">
                                                            Preview Available
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                {formatDuration(
                                                    video.Duration ||
                                                        video.duration
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                                                    video.status
                                                )}`}
                                            >
                                                {video.status || "draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                {video.VideoUrl && (
                                                    <PlayIcon
                                                        className="h-4 w-4 text-green-500"
                                                        title="Has Video"
                                                    />
                                                )}
                                                {video.pdfFiles &&
                                                    video.pdfFiles.length >
                                                        0 && (
                                                        <DocumentTextIcon
                                                            className="h-4 w-4 text-blue-500"
                                                            title="Has PDFs"
                                                        />
                                                    )}
                                                {video.hasQuiz && (
                                                    <QuestionMarkCircleIcon
                                                        className="h-4 w-4 text-purple-500"
                                                        title="Has Quiz"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleViewVideo(video)
                                                    }
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditVideo(video)
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    title="Edit Video"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteVideo(video)
                                                    }
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Delete Video"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Video Modal */}
            {isAddingVideo && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingVideo ? "Edit Video" : "Add New Video"}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={videoForm.Title}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "Title",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter video title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Video Order
                                        </label>
                                        <input
                                            type="number"
                                            value={videoForm.VideoOrder}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "VideoOrder",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Video order (optional)"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={videoForm.Duration}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "Duration",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Duration in seconds"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Video URL
                                        </label>
                                        <input
                                            type="url"
                                            value={videoForm.VideoUrl}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "VideoUrl",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter video URL"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Thumbnail URL
                                        </label>
                                        <input
                                            type="url"
                                            value={videoForm.ThumbnailUrl}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "ThumbnailUrl",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter thumbnail URL"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={videoForm.status}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "status",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">
                                                Published
                                            </option>
                                            <option value="archived">
                                                Archived
                                            </option>
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isPreview"
                                            checked={videoForm.isPreview}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "isPreview",
                                                    e.target.checked
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="isPreview"
                                            className="ml-2 block text-sm text-gray-900"
                                        >
                                            Allow as preview (free to watch)
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="hasQuiz"
                                            checked={videoForm.hasQuiz}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "hasQuiz",
                                                    e.target.checked
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="hasQuiz"
                                            className="ml-2 block text-sm text-gray-900"
                                        >
                                            Has quiz
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs for Additional Content */}
                            <div className="mt-6">
                                <div className="border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8">
                                        <button
                                            onClick={() =>
                                                setActiveTab("basic")
                                            }
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === "basic"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                        >
                                            Basic Info
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("pdfs")}
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === "pdfs"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                        >
                                            PDF Resources
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("quiz")}
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === "quiz"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                        >
                                            Quiz Setup
                                        </button>
                                    </nav>
                                </div>

                                <div className="mt-6">
                                    {activeTab === "basic" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <RichTextEditor
                                                value={videoForm.Description}
                                                onChange={(value) =>
                                                    handleInputChange(
                                                        "Description",
                                                        value
                                                    )
                                                }
                                                placeholder="Enter video description..."
                                            />
                                        </div>
                                    )}

                                    {activeTab === "pdfs" && (
                                        <PDFManager
                                            pdfFiles={videoForm.pdfFiles}
                                            onUpdate={(files) =>
                                                handleInputChange(
                                                    "pdfFiles",
                                                    files
                                                )
                                            }
                                            disabled={false}
                                        />
                                    )}

                                    {activeTab === "quiz" && (
                                        <QuizBuilder
                                            quizData={videoForm.quizData}
                                            onUpdate={(quiz) => {
                                                handleInputChange(
                                                    "quizData",
                                                    quiz
                                                );
                                                handleInputChange(
                                                    "hasQuiz",
                                                    quiz &&
                                                        quiz.questions &&
                                                        quiz.questions.length >
                                                            0
                                                );
                                            }}
                                            disabled={false}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setIsAddingVideo(false);
                                        setEditingVideo(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={
                                        editingVideo
                                            ? handleUpdateVideo
                                            : handleAddVideo
                                    }
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {editingVideo
                                        ? "Update Video"
                                        : "Add Video"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Details Modal */}
            {showVideoModal && selectedVideo && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Video Details
                                </h3>
                                <button
                                    onClick={() => setShowVideoModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Title
                                    </h4>
                                    <p className="text-lg text-gray-900">
                                        {selectedVideo.Title ||
                                            selectedVideo.title}
                                    </p>
                                </div>

                                {selectedVideo.Description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <RichTextDisplay
                                                content={
                                                    selectedVideo.Description
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">
                                            Duration
                                        </h4>
                                        <p className="text-gray-900">
                                            {formatDuration(
                                                selectedVideo.Duration ||
                                                    selectedVideo.duration
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">
                                            Order
                                        </h4>
                                        <p className="text-gray-900">
                                            {selectedVideo.VideoOrder ||
                                                selectedVideo.order ||
                                                "Not set"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">
                                            Status
                                        </h4>
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                                                selectedVideo.status
                                            )}`}
                                        >
                                            {selectedVideo.status || "draft"}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">
                                            Preview
                                        </h4>
                                        <p className="text-gray-900">
                                            {selectedVideo.isPreview
                                                ? "Yes"
                                                : "No"}
                                        </p>
                                    </div>
                                </div>

                                {selectedVideo.VideoUrl && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700">
                                            Video URL
                                        </h4>
                                        <a
                                            href={selectedVideo.VideoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 break-all"
                                        >
                                            {selectedVideo.VideoUrl}
                                        </a>
                                    </div>
                                )}

                                {selectedVideo.ThumbnailUrl && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            Thumbnail
                                        </h4>
                                        <img
                                            src={selectedVideo.ThumbnailUrl}
                                            alt="Video thumbnail"
                                            className="w-32 h-20 object-cover rounded"
                                        />
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Features
                                    </h4>
                                    <div className="flex space-x-4">
                                        <div className="flex items-center">
                                            <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                PDFs:{" "}
                                                {selectedVideo.pdfFiles &&
                                                selectedVideo.pdfFiles.length >
                                                    0
                                                    ? selectedVideo.pdfFiles
                                                          .length
                                                    : "None"}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <QuestionMarkCircleIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                Quiz:{" "}
                                                {selectedVideo.hasQuiz
                                                    ? "Yes"
                                                    : "No"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowVideoModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Manage_Videos;
