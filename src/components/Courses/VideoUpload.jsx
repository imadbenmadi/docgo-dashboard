import { useState } from "react";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const VideoUpload = ({ onUpload, disabled = false }) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        if (!file.type.startsWith("video/")) {
            alert("Please select a video file");
            return;
        }

        setUploading(true);
        try {
            // TODO: Implement actual video upload logic
            console.log("Uploading video:", file.name);

            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Mock response
            const mockVideoData = {
                url: `https://example.com/videos/${file.name}`,
                filename: file.name,
                size: file.size,
                duration: Math.floor(Math.random() * 3600), // Random duration for demo
            };

            if (onUpload) {
                onUpload(mockVideoData);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                    dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                } ${
                    disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() =>
                    !disabled && document.getElementById("video-upload").click()
                }
            >
                <input
                    id="video-upload"
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileInput}
                    disabled={disabled || uploading}
                />

                <div className="text-center">
                    {uploading ? (
                        <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-sm text-gray-600">
                                Uploading video...
                            </p>
                        </>
                    ) : (
                        <>
                            <VideoCameraIcon className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium text-blue-600">
                                    Click to upload
                                </span>{" "}
                                or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                MP4, MOV, AVI up to 500MB
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

VideoUpload.propTypes = {
    onUpload: PropTypes.func,
    disabled: PropTypes.bool,
};

export default VideoUpload;
