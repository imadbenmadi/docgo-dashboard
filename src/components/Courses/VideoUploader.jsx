import { useState, useCallback, useRef, useEffect } from "react";
import {
    CloudArrowUpIcon,
    VideoCameraIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    PlusIcon,
    TrashIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../../utils/apiClient";
import QuizBuilder from "./QuizBuilderNew";

const VideoUploader = ({
    courseId,
    onVideoCreated,
    onCancel,
    editVideo = null,
}) => {
    const [currentStep, setCurrentStep] = useState(editVideo ? 2 : 1); // Start at PDF step if editing
    const [dragActive, setDragActive] = useState(false);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [savedVideo, setSavedVideo] = useState(editVideo || null);

    // Video info state
    const [videoInfo, setVideoInfo] = useState({
        Title: editVideo?.Title || "",
        Duration: editVideo?.Duration || "",
        Description: editVideo?.Description || "",
        VideoOrder: editVideo?.VideoOrder || 0,
        isPreview: editVideo?.isPreview || false,
        status: editVideo?.status || "draft",
    });

    // Image state
    const [uploadedImage, setUploadedImage] = useState(null);
    const [ImagePreview, setImagePreview] = useState(null);
    const [ImageDragActive, setImageDragActive] = useState(false);

    // PDF state
    const [pdfFiles, setPdfFiles] = useState([]);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [pdfDragActive, setPdfDragActive] = useState(false);

    // Quiz state
    const [hasQuiz, setHasQuiz] = useState(false);
    const [quizData, setQuizData] = useState(null);

    const fileInputRef = useRef(null);
    const pdfInputRef = useRef(null);
    const ImageInputRef = useRef(null);

    // Load existing PDFs when editing
    useEffect(() => {
        if (editVideo && editVideo.pdfFiles) {
            try {
                const existingPDFs = Array.isArray(editVideo.pdfFiles)
                    ? editVideo.pdfFiles
                    : JSON.parse(editVideo.pdfFiles);
                setPdfFiles(existingPDFs);
            } catch (e) {
                console.error("Error loading existing PDFs:", e);
                setPdfFiles([]);
            }
        }
    }, [editVideo]);
    // Process selected PDF file
    const handlePdfFile = useCallback(
        async (file) => {
            if (file.type !== "application/pdf") {
                setError("Only PDF files are allowed for resources.");
                return;
            }

            // Validate file size (50MB max)
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.size > maxSize) {
                setError("PDF file size must be less than 50MB.");
                return;
            }

            if (!savedVideo) {
                setError("Please save the video first before adding PDFs.");
                return;
            }

            setUploadingPdf(true);
            setError(null);

            try {
                const formData = new FormData();
                formData.append("VideoPDF", file);
                formData.append("pdfName", file.name.replace(/\.[^/.]+$/, ""));
                formData.append("pdfDescription", "");

                const response = await apiClient.post(
                    `/Admin/upload/Videos/${savedVideo.id}/PDF`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (response.data) {
                    setPdfFiles(response.data.allPDFs || []);
                }
            } catch (error) {
                console.error("PDF upload error:", error);
                setError(
                    error.response?.data?.message ||
                        "Failed to upload PDF. Please try again."
                );
            } finally {
                setUploadingPdf(false);
            }
        },
        [savedVideo, setError, setUploadingPdf, setPdfFiles]
    );
    // Process selected video file
    const handleVideoFile = useCallback(
        (file) => {
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
            video.style.display = "none"; // Ensure it's not visible and doesn't affect layout

            video.onloadedmetadata = () => {
                try {
                    const duration = Math.round(video.duration || 0);
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

                    // Clean up the temporary video element
                    video.onloadedmetadata = null;
                    video.onerror = null;
                    if (video.src) {
                        video.src = "";
                    }
                } catch (err) {
                    console.error("Error processing video metadata:", err);
                    setError("Error processing video file. Please try again.");
                } finally {
                    // Always clean up
                    try {
                        URL.revokeObjectURL(videoUrl);
                    } catch (e) {
                        console.warn("Error revoking object URL:", e);
                    }
                }
            };

            video.onerror = (e) => {
                console.error("Video loading error:", e);
                setError(
                    "Could not process this video file. Please ensure it's a valid video format (MP4, AVI, MKV, WebM, MOV, FLV)."
                );
                video.onloadedmetadata = null;
                video.onerror = null;
                if (video.src) {
                    video.src = "";
                }
                try {
                    URL.revokeObjectURL(videoUrl);
                } catch (e) {
                    console.warn("Error revoking object URL:", e);
                }
            };

            video.src = videoUrl;
        },
        [setError, setVideoInfo, setUploadedVideo]
    );

    // Image handlers
    const handleImageFile = useCallback(
        (file) => {
            if (!file) return;

            const allowedTypes = [
                "Image/jpeg",
                "Image/jpg",
                "Image/png",
                "Image/webp",
            ];
            if (!allowedTypes.includes(file.type)) {
                setError("Only JPEG, PNG, and WebP Images are allowed.");
                return;
            }

            // Validate file size (10MB max)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setError("Image file size must be less than 10MB.");
                return;
            }

            setUploadedImage(file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
            setError(null);
        },
        [setError, setUploadedImage, setImagePreview]
    );

    const handleImageInput = (e) => {
        if (e.target.files[0]) {
            handleImageFile(e.target.files[0]);
            // Reset the input after selection to prevent any interference
            e.target.value = "";
        }
    };

    const removeImage = () => {
        if (ImagePreview) {
            URL.revokeObjectURL(ImagePreview);
        }
        setUploadedImage(null);
        setImagePreview(null);
        if (ImageInputRef.current) {
            ImageInputRef.current.value = "";
        }
    };

    // Video Drag handlers
    const handleDrag = useCallback((e) => {
        // Only handle drag events, not other events
        if (!["dragenter", "dragover", "dragleave"].includes(e.type)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    // Video Drop handler
    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleVideoFile(e.dataTransfer.files[0]);
            }
        },
        [handleVideoFile]
    );

    // PDF Drag handlers
    const handlePdfDrag = useCallback((e) => {
        // Only handle drag events, not other events
        if (!["dragenter", "dragover", "dragleave"].includes(e.type)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setPdfDragActive(true);
        } else if (e.type === "dragleave") {
            setPdfDragActive(false);
        }
    }, []);

    // PDF Drop handler
    const handlePdfDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setPdfDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handlePdfFile(e.dataTransfer.files[0]);
            }
        },
        [handlePdfFile]
    );

    // Image Drag handlers
    const handleImageDrag = useCallback((e) => {
        // Only handle drag events, not other events
        if (!["dragenter", "dragover", "dragleave"].includes(e.type)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setImageDragActive(true);
        } else if (e.type === "dragleave") {
            setImageDragActive(false);
        }
    }, []);

    // Image Drop handler
    const handleImageDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setImageDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("Image/")) {
                    handleImageFile(file);
                } else {
                    setError("Please select an Image file (PNG, JPG, WebP)");
                }
            }
        },
        [handleImageFile, setError]
    );

    // Video file input handler
    const handleVideoFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Reset drag states to ensure they don't interfere
            setDragActive(false);
            setPdfDragActive(false);

            handleVideoFile(e.target.files[0]);
            // Reset the input after selection to prevent any interference
            e.target.value = "";
        }
    };

    // PDF file input handler
    const handlePdfFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handlePdfFile(e.target.files[0]);
            // Reset the input after selection to prevent any interference
            e.target.value = "";
        }
    };

    // Upload video to server
    const handleVideoUpload = async () => {
        if (!uploadedVideo || !videoInfo.Title.trim()) {
            setError("Please provide a title for the video.");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("CourseVedio", uploadedVideo.file);

            // Add Image if uploaded
            if (uploadedImage) {
                formData.append("VideoImage", uploadedImage);
            }

            formData.append("Title", videoInfo.Title);
            formData.append("Duration", videoInfo.Duration);
            formData.append("Description", videoInfo.Description);
            formData.append("VideoOrder", videoInfo.VideoOrder);
            formData.append("isPreview", videoInfo.isPreview);
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

            if (response.data && response.data.video) {
                setSavedVideo(response.data.video);
                // Get existing PDFs if any
                if (response.data.video.pdfFiles) {
                    try {
                        const existingPDFs = Array.isArray(
                            response.data.video.pdfFiles
                        )
                            ? response.data.video.pdfFiles
                            : JSON.parse(response.data.video.pdfFiles);
                        setPdfFiles(existingPDFs);
                    } catch (e) {
                        setPdfFiles([]);
                    }
                } else {
                    // Don't clear existing PDFs if they're not in the response
                    // setPdfFiles([]);  // Remove this line
                }
                setCurrentStep(2); // Move to PDF step
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

    // Delete PDF
    const deletePdf = async (pdfId) => {
        if (!savedVideo) return;

        try {
            const response = await apiClient.delete(
                `/Admin/upload/Videos/${savedVideo.id}/PDFs/${pdfId}`
            );

            if (response.data) {
                setPdfFiles(response.data.remainingPDFs || []);
            }
        } catch (error) {
            console.error("Delete PDF error:", error);
            setError("Failed to delete PDF. Please try again.");
        }
    };

    // Reorder PDFs
    const reorderPdfs = async (newOrder) => {
        if (!savedVideo) return;

        try {
            const pdfOrders = newOrder.map((pdf, index) => ({
                id: pdf.id,
                order: index,
            }));

            const response = await apiClient.put(
                `/Admin/upload/Videos/${savedVideo.id}/PDFs/order`,
                { pdfOrders }
            );

            if (response.data) {
                setPdfFiles(response.data.allPDFs || newOrder);
            }
        } catch (error) {
            console.error("Reorder PDF error:", error);
            setError("Failed to reorder PDFs. Please try again.");
        }
    };

    // Handle PDF drag and drop reordering
    const handlePdfDragStart = (e, index) => {
        e.dataTransfer.setData("text/plain", index);
    };

    const handlePdfDragOver = (e) => {
        e.preventDefault();
    };

    const handlePdfReorderDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));

        if (dragIndex === dropIndex) return;

        const newPdfFiles = [...pdfFiles];
        const draggedItem = newPdfFiles[dragIndex];

        // Remove dragged item
        newPdfFiles.splice(dragIndex, 1);
        // Insert at new position
        newPdfFiles.splice(dropIndex, 0, draggedItem);

        setPdfFiles(newPdfFiles);
        reorderPdfs(newPdfFiles);
    };

    // Finalize video creation
    const finalizeVideo = async () => {
        if (!savedVideo) return;

        try {
            // Update video with quiz data if exists
            const updateData = {
                has_quiz: hasQuiz,
                quiz_data: hasQuiz ? JSON.stringify(quizData) : null,
            };

            // Here you would call your video update API
            // await apiClient.put(`/Admin/videos/${savedVideo.id}`, updateData);

            onVideoCreated({
                ...savedVideo,
                pdfFiles,
                hasQuiz,
                quizData,
            });
            handleCancel();
        } catch (error) {
            console.error("Finalize error:", error);
            setError("Failed to finalize video. Please try again.");
        }
    };

    // Cancel and cleanup
    const handleCancel = async () => {
        // If video was saved but not finalized, clean it up
        if (savedVideo) {
            try {
                await apiClient.delete(
                    `/Admin/upload/Videos/${savedVideo.id}/cleanup`
                );
            } catch (error) {
                console.error("Error cleaning up video:", error);
            }
        }

        // Clean up local state and URLs
        if (uploadedVideo?.preview) {
            URL.revokeObjectURL(uploadedVideo.preview);
        }
        if (ImagePreview) {
            URL.revokeObjectURL(ImagePreview);
        }

        setUploadedVideo(null);
        setUploadedImage(null);
        setImagePreview(null);
        setSavedVideo(null);
        setVideoInfo({
            Title: "",
            Duration: "",
            Description: "",
            VideoOrder: 0,
            isPreview: false,
            status: "draft",
        });
        setPdfFiles([]);
        setHasQuiz(false);
        setQuizData(null);
        setCurrentStep(1);
        setError(null);
        setUploadProgress(0);

        // Clear file inputs
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (pdfInputRef.current) {
            pdfInputRef.current.value = "";
        }
        if (ImageInputRef.current) {
            ImageInputRef.current.value = "";
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

    // Step navigation
    const goToStep = (step) => {
        if (
            step === 1 ||
            (step === 2 && savedVideo) ||
            (step === 3 && savedVideo)
        ) {
            setCurrentStep(step);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header with Steps */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {editVideo
                            ? `Edit Video: ${editVideo.Title}`
                            : "Create Video Lesson"}
                    </h3>
                    {editVideo && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                {/* Step Indicator */}
                <div className="flex items-center space-x-4">
                    {[
                        ...(editVideo
                            ? []
                            : [
                                  {
                                      step: 1,
                                      title: "Upload Video",
                                      completed: !!savedVideo,
                                  },
                              ]),
                        { step: 2, title: "Add Resources", completed: false },
                        { step: 3, title: "Create Quiz", completed: false },
                    ].map((stepItem) => (
                        <div key={stepItem.step} className="flex items-center">
                            <button
                                onClick={() => goToStep(stepItem.step)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                    currentStep === stepItem.step
                                        ? "bg-blue-600 text-white"
                                        : stepItem.completed
                                        ? "bg-green-600 text-white cursor-pointer"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                {stepItem.completed ? "✓" : stepItem.step}
                            </button>
                            <span
                                className={`ml-2 text-sm ${
                                    currentStep === stepItem.step
                                        ? "text-blue-600 font-medium"
                                        : "text-gray-600"
                                }`}
                            >
                                {stepItem.title}
                            </span>
                            {stepItem.step < 3 && (
                                <div className="w-8 h-px bg-gray-300 ml-4" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6">
                {/* Step 1: Upload Video */}
                {currentStep === 1 && (
                    <div className="space-y-6">
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
                                    onChange={handleVideoFileInput}
                                    className="sr-only"
                                />

                                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">
                                    Drop your video here, or{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                                    >
                                        browse
                                    </button>
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
                                                    {formatFileSize(
                                                        uploadedVideo.size
                                                    )}{" "}
                                                    •{" "}
                                                    {formatDuration(
                                                        uploadedVideo.duration
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center text-green-600">
                                                <CheckCircleIcon className="h-5 w-5 mr-1" />
                                                <span className="text-sm">
                                                    Ready
                                                </span>
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
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0,
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

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Video Image (Optional)
                                        </label>
                                        {!ImagePreview ? (
                                            <div
                                                className={`border-2 border-dashed rounded-lg p-4 text-center relative transition-all ${
                                                    ImageDragActive
                                                        ? "border-blue-400 bg-blue-50"
                                                        : "border-gray-300 hover:border-gray-400"
                                                }`}
                                                onDragEnter={handleImageDrag}
                                                onDragLeave={handleImageDrag}
                                                onDragOver={handleImageDrag}
                                                onDrop={handleImageDrop}
                                            >
                                                <input
                                                    ref={ImageInputRef}
                                                    type="file"
                                                    accept="Image/*"
                                                    onChange={handleImageInput}
                                                    className="sr-only"
                                                />
                                                <div className="space-y-2">
                                                    <div className="mx-auto w-8 h-8 text-gray-400">
                                                        📷
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                ImageInputRef.current?.click()
                                                            }
                                                            className="text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                                                        >
                                                            Upload an Image
                                                        </button>
                                                        <span className="text-gray-500">
                                                            {" "}
                                                            or drag and drop
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, WebP up to
                                                        10MB
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative inline-block">
                                                <img
                                                    src={ImagePreview}
                                                    alt="Video preview"
                                                    className="w-32 h-24 object-cover rounded-lg border"
                                                />
                                                <button
                                                    onClick={removeImage}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    type="button"
                                                >
                                                    <XMarkIcon className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

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
                                            <option value="published">
                                                Published
                                            </option>
                                            <option value="private">
                                                Private
                                            </option>
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
                                                        isPreview:
                                                            e.target.checked,
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
                                                style={{
                                                    width: `${uploadProgress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Add PDFs */}
                {currentStep === 2 && savedVideo && (
                    <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                    Video "{savedVideo.Title}" uploaded
                                    successfully!
                                </span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Add PDF Resources (Optional)
                            </h4>
                            <p className="text-sm text-gray-600 mb-6">
                                Upload multiple PDF files that students can
                                download as supplementary materials for this
                                video. You can add as many PDFs as needed and
                                reorder them by dragging.
                            </p>

                            {/* PDF Upload Area */}
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all mb-6 ${
                                    pdfDragActive
                                        ? "border-green-400 bg-green-50"
                                        : "border-gray-300 hover:border-gray-400"
                                }`}
                                onDragEnter={handlePdfDrag}
                                onDragLeave={handlePdfDrag}
                                onDragOver={handlePdfDrag}
                                onDrop={handlePdfDrop}
                            >
                                <input
                                    ref={pdfInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handlePdfFileInput}
                                    className="sr-only"
                                />

                                <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
                                <h3 className="mt-2 text-md font-medium text-gray-900">
                                    Drop PDF files here, or{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            pdfInputRef.current?.click()
                                        }
                                        className="text-green-600 hover:text-green-800 focus:outline-none focus:underline"
                                        disabled={uploadingPdf}
                                    >
                                        browse
                                    </button>
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    PDF files up to 50MB
                                </p>

                                {uploadingPdf && (
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-600 mb-2">
                                            Uploading PDF...
                                        </div>
                                        <div className="w-full bg-green-200 rounded-full h-2">
                                            <div className="bg-green-600 h-2 rounded-full animate-pulse w-1/2" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PDF List */}
                            {pdfFiles.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-gray-700">
                                        Uploaded PDFs ({pdfFiles.length}) - Drag
                                        to reorder
                                    </h5>
                                    <div className="space-y-2">
                                        {pdfFiles.map((pdf, index) => (
                                            <div
                                                key={pdf.id}
                                                draggable
                                                onDragStart={(e) =>
                                                    handlePdfDragStart(e, index)
                                                }
                                                onDragOver={handlePdfDragOver}
                                                onDrop={(e) =>
                                                    handlePdfReorderDrop(
                                                        e,
                                                        index
                                                    )
                                                }
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 cursor-move transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                                        #{index + 1}
                                                    </span>
                                                    <DocumentTextIcon className="h-5 w-5 text-red-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {pdf.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(
                                                                pdf.size
                                                            )}{" "}
                                                            •{" "}
                                                            {new Date(
                                                                pdf.uploadedAt
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            window.open(
                                                                pdf.url,
                                                                "_blank"
                                                            )
                                                        }
                                                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="View PDF"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deletePdf(pdf.id)
                                                        }
                                                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                                        title="Delete PDF"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {uploadingPdf && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                        <span className="text-sm font-medium text-green-900">
                                            Uploading PDF...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Create Quiz */}
                {currentStep === 3 && savedVideo && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Create Quiz (Optional)
                            </h4>
                            <p className="text-sm text-gray-600 mb-6">
                                Add a quiz to test students' understanding of
                                this video lesson.
                            </p>

                            <div className="mb-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={hasQuiz}
                                        onChange={(e) =>
                                            setHasQuiz(e.target.checked)
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Add a quiz for this video
                                    </span>
                                </label>
                            </div>

                            {hasQuiz && (
                                <QuizBuilder
                                    quizData={quizData}
                                    onUpdate={setQuizData}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-red-900">
                                Error
                            </h4>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        disabled={uploading || uploadingPdf}
                    >
                        Cancel
                    </button>

                    <div className="flex gap-3">
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                            >
                                Previous
                            </button>
                        )}

                        {currentStep === 1 && uploadedVideo && (
                            <button
                                onClick={handleVideoUpload}
                                disabled={uploading || !videoInfo.Title.trim()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    "Save & Continue"
                                )}
                            </button>
                        )}

                        {currentStep === 2 && (
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            >
                                Continue to Quiz
                            </button>
                        )}

                        {currentStep === 3 && (
                            <button
                                onClick={finalizeVideo}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
                            >
                                <CheckCircleIcon className="h-4 w-4" />
                                Complete Video
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoUploader;
