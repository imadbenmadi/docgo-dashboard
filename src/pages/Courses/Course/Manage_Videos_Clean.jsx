import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeftIcon,
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
import VideoUploader from "../../../components/Courses/VideoUploader";
import VideoDetailsModal from "../../../components/Courses/VideoDetailsModal";
import VideosTable from "../../../components/Courses/VideosTable";

const Manage_Videos = () => {
    const { courseId } = useParams();

    // State management
    const [videos, setVideos] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

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

    // Handle successful video creation/update
    const handleVideoSuccess = (newVideo, isUpdate = false) => {
        if (isUpdate) {
            setVideos((prev) =>
                prev.map((v) => (v.id === newVideo.id ? newVideo : v))
            );
        } else {
            setVideos((prev) => [...prev, newVideo]);
        }

        Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Video ${isUpdate ? "updated" : "created"} successfully!`,
            timer: 2000,
            showConfirmButton: false,
        });
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

            {/* Video Uploader - Always visible for adding new videos */}
            <div className="mb-8">
                <VideoUploader
                    courseId={courseId}
                    onVideoCreated={(newVideo) =>
                        handleVideoSuccess(newVideo, false)
                    }
                    onCancel={() => {}} // No-op since this is always visible
                />
            </div>

            {/* Videos Table */}
            <VideosTable
                videos={videos}
                onViewVideo={handleViewVideo}
                onDeleteVideo={handleDeleteVideo}
                onEditVideo={(video) => {
                    // For now, editing will open the video details modal
                    // In the future, this could open the VideoUploader in edit mode
                    handleViewVideo(video);
                }}
            />

            {/* Video Details Modal */}
            {showVideoModal && selectedVideo && (
                <VideoDetailsModal
                    video={selectedVideo}
                    onClose={() => setShowVideoModal(false)}
                />
            )}
        </div>
    );
};

export default Manage_Videos;
