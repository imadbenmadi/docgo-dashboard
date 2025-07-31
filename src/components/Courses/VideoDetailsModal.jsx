import React from "react";
import {
    DocumentTextIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import RichTextDisplay from "../Common/RichTextEditor/RichTextDisplay";

const VideoDetailsModal = ({ video, onClose }) => {
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

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Video Details
                        </h3>
                        <button
                            onClick={onClose}
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
                                {video.Title || video.title}
                            </p>
                        </div>

                        {video.Description && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <RichTextDisplay
                                        content={video.Description}
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
                                        video.Duration || video.duration
                                    )}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700">
                                    Order
                                </h4>
                                <p className="text-gray-900">
                                    {video.VideoOrder ||
                                        video.order ||
                                        "Not set"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700">
                                    Status
                                </h4>
                                <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                                        video.status
                                    )}`}
                                >
                                    {video.status || "draft"}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700">
                                    Preview
                                </h4>
                                <p className="text-gray-900">
                                    {video.isPreview ? "Yes" : "No"}
                                </p>
                            </div>
                        </div>

                        {video.VideoUrl && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700">
                                    Video URL
                                </h4>
                                <a
                                    href={video.VideoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 break-all"
                                >
                                    {video.VideoUrl}
                                </a>
                            </div>
                        )}

                        {video.image && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    Video Image
                                </h4>
                                <img
                                    src={video.image}
                                    alt="Video image"
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
                                        {video.pdfFiles &&
                                        video.pdfFiles.length > 0
                                            ? video.pdfFiles.length
                                            : "None"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <QuestionMarkCircleIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Quiz: {video.hasQuiz ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailsModal;
