import { useState, useCallback, useRef } from "react";
import {
    CloudArrowUpIcon,
    VideoCameraIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../../utils/apiClient";

const VideoUpload = ({ courseId, onVideoUploaded, onCancel }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [videoInfo, setVideoInfo] = useState({
        Title: "",
        Duration: "",
        Description: "",
        VideoOrder: 0,
        isPreview: false,
        // ThumbnailUrl: "",
        status: "draft",
    });

    const fileInputRef = useRef(null);

    // Drag handlers
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    // Drop handler
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    // File input handler
    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    // Process selected file
    const handleFile = (file) => {
        setError(null);

        // Validate file type
        const allowedTypes = [
            "video/mp4",
            "video/avi",
            "video/mkv",
            "video/webm",
            "video/mov",
            "video/flv",
        ];
        if (!allowedTypes.includes(file.type)) {
            setError(
                "Only MP4, AVI, MKV, WebM, MOV, and FLV video files are allowed."
            );
            return;
        }

        // Validate file size (2GB max)
        const maxSize = 2000 * 1024 * 1024; // 2GB
        if (file.size > maxSize) {
            setError("File size must be less than 2GB.");
            return;
        }

        // Create video preview
        const videoUrl = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            const duration = Math.round(video.duration);
            setVideoInfo((prev) => ({
                ...prev,
                Duration: duration.toString(),
                Title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for default title
            }));

            setUploadedVideo({
                file,
                preview: videoUrl,
                name: file.name,
                size: file.size,
                duration,
            });

            URL.revokeObjectURL(videoUrl);
        };

        video.src = videoUrl;
    };

    // Upload video to server
    const handleUpload = async () => {
        if (!uploadedVideo || !videoInfo.Title.trim()) {
            setError("Please provide a title for the video.");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("CourseVedio", uploadedVideo.file);
            formData.append("Title", videoInfo.Title);
            formData.append("Duration", videoInfo.Duration);
            formData.append("Description", videoInfo.Description);
            formData.append("VideoOrder", videoInfo.VideoOrder);
            formData.append("isPreview", videoInfo.isPreview);
            // formData.append("ThumbnailUrl", videoInfo.ThumbnailUrl);
            formData.append("status", videoInfo.status);

            const response = await apiClient.post(
                `/Admin/upload/Courses/${courseId}/Vedio`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(progress);
                    },
                }
            );

            if (response.data) {
                onVideoUploaded(response.data.video);
                handleCancel(); // Reset form
            }
        } catch (error) {
            console.error("Upload error:", error);
            setError(
                error.response?.data?.message ||
                    "Failed to upload video. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    // Cancel upload and cleanup
    const handleCancel = () => {
        if (uploadedVideo?.preview) {
            URL.revokeObjectURL(uploadedVideo.preview);
        }
        setUploadedVideo(null);
        setVideoInfo({
            Title: "",
            Duration: "",
            Description: "",
            VideoOrder: 0,
            isPreview: false,
            // ThumbnailUrl: "",
            status: "draft",
        });
        setError(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onCancel();
    };

    // Remove uploaded video
    const handleRemoveVideo = () => {
        if (uploadedVideo?.preview) {
            URL.revokeObjectURL(uploadedVideo.preview);
        }
        setUploadedVideo(null);
        setVideoInfo((prev) => ({ ...prev, Title: "", Duration: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Format duration
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                    Upload Video
                </h3>
            </div>

            <div className="p-6">
                {!uploadedVideo ? (
                    // Drag & Drop Zone
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                            dragActive
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileInput}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            Drop your video here, or{" "}
                            <span className="text-blue-600">browse</span>
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            MP4, AVI, MKV, WebM, MOV, FLV up to 2GB
                        </p>
                    </div>
                ) : (
                    // Video Preview & Form
                    <div className="space-y-6">
                        {/* Video Preview */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-black flex items-center justify-center h-48 relative">
                                <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                                <button
                                    onClick={handleRemoveVideo}
                                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {uploadedVideo.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(uploadedVideo.size)}{" "}
                                            •{" "}
                                            {formatDuration(
                                                uploadedVideo.duration
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center text-green-600">
                                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                                        <span className="text-sm">Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video Information Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video Title *
                                </label>
                                <input
                                    type="text"
                                    value={videoInfo.Title}
                                    onChange={(e) =>
                                        setVideoInfo((prev) => ({
                                            ...prev,
                                            Title: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter video title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (seconds) *
                                </label>
                                <input
                                    type="number"
                                    value={videoInfo.Duration}
                                    onChange={(e) =>
                                        setVideoInfo((prev) => ({
                                            ...prev,
                                            Duration: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Auto-detected"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video Order
                                </label>
                                <input
                                    type="number"
                                    value={videoInfo.VideoOrder}
                                    onChange={(e) =>
                                        setVideoInfo((prev) => ({
                                            ...prev,
                                            VideoOrder:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={videoInfo.Description}
                                    onChange={(e) =>
                                        setVideoInfo((prev) => ({
                                            ...prev,
                                            Description: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Enter video description"
                                />
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thumbnail URL
                                </label>
                                <input
                                    type="url"
                                    // value={videoInfo.ThumbnailUrl}
                                    onChange={(e) =>
                                        setVideoInfo((prev) => ({
                                            ...prev,
                                            // ThumbnailUrl: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/thumbnail.jpg"
                                />
                            </div> */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={videoInfo.status}
                                    onChange={(e) =>
                                        setVideoInfo((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={videoInfo.isPreview}
                                        onChange={(e) =>
                                            setVideoInfo((prev) => ({
                                                ...prev,
                                                isPreview: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Allow as preview video
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-900">
                                        Uploading...
                                    </span>
                                    <span className="text-sm text-blue-700">
                                        {uploadProgress}%
                                    </span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-red-900">
                                        Upload Error
                                    </h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        disabled={uploading}
                    >
                        Cancel
                    </button>

                    {uploadedVideo && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !videoInfo.Title.trim()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Uploading...
                                </>
                            ) : (
                                "Save Video"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoUpload;
