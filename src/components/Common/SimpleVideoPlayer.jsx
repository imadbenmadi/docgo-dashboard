import { useState, useRef } from "react";
import {
    PlayIcon,
    PauseIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";

const SimpleVideoPlayer = ({
    src,
    poster,
    title,
    className = "",
    width = "100%",
    height = "auto",
}) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState(null);

    // Format time display
    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Video event handlers
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    const handleError = () => {
        setError("Error loading video. Please check the video source.");
    };

    // Control functions
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(() => {
                    setError("Unable to play video");
                });
            }
        }
    };

    const handleProgressClick = (e) => {
        if (videoRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = percent * duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume;
                setIsMuted(false);
            } else {
                videoRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    if (error) {
        return (
            <div
                className={`bg-gray-900 rounded-lg flex items-center justify-center ${className}`}
                style={{ width, height: height === "auto" ? "400px" : height }}
            >
                <div className="text-center text-white p-8">
                    <div className="text-red-500 mb-4">
                        <svg
                            className="w-16 h-16 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold mb-2">Video Error</p>
                    <p className="text-sm opacity-70">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
            style={{ width, height }}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                poster={poster}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={handleEnded}
                onError={handleError}
                playsInline
            >
                <source src={src} type="video/mp4" />
                <source src={src} type="video/webm" />
                <source src={src} type="video/ogg" />
                Your browser does not support the video tag.
            </video>

            {/* Play Button Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <button
                        onClick={togglePlay}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
                    >
                        <PlayIcon className="h-12 w-12 text-white" />
                    </button>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <div className="px-4 pt-4">
                    <div
                        className="w-full h-1 bg-white bg-opacity-30 rounded-full cursor-pointer hover:h-2 transition-all"
                        onClick={handleProgressClick}
                    >
                        <div
                            className="h-full bg-red-500 rounded-full transition-all"
                            style={{
                                width: `${(currentTime / duration) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center space-x-2">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            {isPlaying ? (
                                <PauseIcon className="h-6 w-6" />
                            ) : (
                                <PlayIcon className="h-6 w-6" />
                            )}
                        </button>

                        {/* Volume */}
                        <button
                            onClick={toggleMute}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            {isMuted || volume === 0 ? (
                                <SpeakerXMarkIcon className="h-5 w-5" />
                            ) : (
                                <SpeakerWaveIcon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Time Display */}
                        <span className="text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Title Overlay */}
            {title && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white text-lg font-semibold">
                        {title}
                    </h3>
                </div>
            )}
        </div>
    );
};

export default SimpleVideoPlayer;
