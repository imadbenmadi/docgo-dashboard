import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { coursesAPI } from "../../../API/Courses";
import Swal from "sweetalert2";
import VideoUploader from "../../../components/Courses/VideoUploader";
import VideoDetailsModal from "../../../components/Courses/VideoDetailsModal";
import VideosTable from "../../../components/Courses/VideosTable";

const Manage_Videos = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // State management
    const [videos, setVideos] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    // View video details
    const handleViewVideo = (video) => {
        setSelectedVideo(video);
        setShowVideoModal(true);
    };
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
                title: "Erreur",
                text: "Impossible de charger les vidéos du cours",
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
            title: "Supprimer la vidéo",
            text: `Êtes-vous sûr de vouloir supprimer "${
                video.Title || video.title
            }" ?`,
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
        });

        if (result.isConfirmed) {
            try {
                await coursesAPI.deleteVideo(courseId, video.id);

                Swal.fire({
                    icon: "success",
                    title: "Supprimé !",
                    text: "La vidéo a été supprimée avec succès.",
                    showConfirmButton: false,
                    timer: 1500,
                });

                fetchVideos();
            } catch (error) {
                console.error("Error deleting video:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text:
                        error.response?.data?.error ||
                        "Impossible de supprimer la vidéo",
                });
            }
        }
    };

    // Edit video handler
    const handleEditVideo = (video) => {
        setEditingVideo(video);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingVideo(null);
    };

    // Navigate to video page
    const handleNavigateToVideo = (video) => {
        navigate(`/courses/${courseId}/videos/${video.id}`);
    };

    // Handle successful video creation/update
    const handleVideoSuccess = (newVideo, isUpdate = false) => {
        if (isUpdate) {
            setVideos((prev) =>
                prev.map((v) => (v.id === newVideo.id ? newVideo : v)),
            );
        } else {
            setVideos((prev) => [...prev, newVideo]);
        }

        Swal.fire({
            icon: "success",
            title: "Succès !",
            text: `Vidéo ${isUpdate ? "mise à jour" : "créée"} avec succès !`,
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

            {/* Video Uploader - Always visible for adding new videos, or editing mode */}
            <div className="mb-8">
                {editingVideo ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-medium text-blue-900 mb-2">
                            Editing Video: {editingVideo.Title}
                        </h3>
                        <p className="text-blue-700 mb-4">
                            You can manage PDFs and quizzes for this video.
                        </p>
                        <VideoUploader
                            courseId={courseId}
                            editVideo={editingVideo}
                            onVideoCreated={(updatedVideo) => {
                                handleVideoSuccess(updatedVideo, true);
                                setEditingVideo(null);
                            }}
                            onCancel={handleCancelEdit}
                        />
                    </div>
                ) : (
                    <VideoUploader
                        courseId={courseId}
                        onVideoCreated={(newVideo) =>
                            handleVideoSuccess(newVideo, false)
                        }
                        onCancel={() => {}} // No-op since this is always visible
                    />
                )}
            </div>

            {/* Videos Table */}
            <VideosTable
                videos={videos}
                onViewVideo={handleViewVideo}
                onDeleteVideo={handleDeleteVideo}
                onNavigateToVideo={handleNavigateToVideo}
                onEditVideo={handleEditVideo}
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
