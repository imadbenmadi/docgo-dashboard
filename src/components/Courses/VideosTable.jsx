import React from "react";
import {
    PencilIcon,
    TrashIcon,
    PlayIcon,
    DocumentTextIcon,
    QuestionMarkCircleIcon,
    EyeIcon,
    ClockIcon,
    VideoCameraIcon,
} from "@heroicons/react/24/outline";

const VideosTable = ({ videos, onViewVideo, onDeleteVideo, onEditVideo }) => {
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Videos List
                </h2>
            </div>

            {videos.length === 0 ? (
                <div className="p-8 text-center">
                    <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No videos yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Start by adding your first video to this course.
                    </p>
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
                                <tr key={video.id} className="hover:bg-gray-50">
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
                                                {video.image ? (
                                                    <img
                                                        className="h-10 w-10 rounded object-cover"
                                                        src={video.image}
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
                                                    {video.Title || video.title}
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
                                                video.Duration || video.duration
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
                                                video.pdfFiles.length > 0 && (
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
                                                    onViewVideo(video)
                                                }
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                title="View Details"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onEditVideo(video)
                                                }
                                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                title="Edit Video"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onDeleteVideo(video)
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
    );
};

export default VideosTable;
