import {
  Video,
  Plus,
  Loader2,
  Upload,
  Play,
  X,
  Edit,
  Save,
  Eye,
  Download,
  Share2,
  MoreVertical,
  Trash2,
  Clock,
  FileVideo,
} from "lucide-react";
import { useState } from "react";

// Enhanced FormInput Component
const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  required = false,
  ...props
}) => {
  const InputComponent = multiline ? "textarea" : "input";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <InputComponent
        type={multiline ? undefined : "text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
        {...props}
      />
    </div>
  );
};

// Enhanced Video Card Component
const VideoCard = ({
  video,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onShare,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editData, setEditData] = useState({
    name: video.name,
    description: video.description,
  });

  const handleSave = () => {
    onEdit(video.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: video.name,
      description: video.description,
    });
    setIsEditing(false);
  };

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

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative group">
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 flex items-center justify-center">
          <Video className="w-16 h-16 text-blue-600" />
        </div>

        {/* Video overlay with controls */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onView(video)}
              className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all"
            >
              <Play className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => onDownload(video)}
              className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all"
            >
              <Download className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => onShare(video)}
              className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all"
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Menu button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => {
                  onView(video);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                <Eye className="w-4 h-4" />
                Voir
              </button>
              <button
                onClick={() => {
                  onDownload(video);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
              <hr className="my-2" />
              <button
                onClick={() => {
                  onDelete(video.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <FormInput
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              placeholder="Nom de la vidéo"
              required
            />
            <FormInput
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              placeholder="Description de la vidéo"
              multiline
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
              {video.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
              {video.description || "Aucune description"}
            </p>

            {/* Video info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <FileVideo className="w-3 h-3" />
                {video.format || "MP4"}
              </span>
              {video.size && <span>{formatFileSize(video.size)}</span>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onView(video)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Lire
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Progress bar component
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
    <div
      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300 relative"
      style={{ width: `${progress}%` }}
    >
      <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
    </div>
  </div>
);

// Main VideoSection Component
const VideoSection = ({
  videos = [],
  newVideo = { name: "", description: "", file: null },
  setNewVideo,
  isUploading = false,
  uploadProgress = 0,
  handleVideoFileSelect,
  handleVideoUpload,
  handleEditVideo,
  handleDeleteVideo,
  onViewVideo,
  onDownloadVideo,
  onShareVideo,
  onSaveToBackend,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Handle drag and drop
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
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setNewVideo({ ...newVideo, file });
      }
    }
  };

  // Filter and sort videos
  const filteredVideos = videos.filter((video) => {
    if (filter === "all") return true;
    // Add more filter logic based on your needs
    return true;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Vidéos du Cours
            </h2>
            <p className="text-gray-600 text-sm">Gérez vos vidéos de cours</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {videos.length} vidéo(s)
          </span>
          {videos.length > 0 && (
            <button
              onClick={() => onSaveToBackend(videos)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          )}
        </div>
      </div>

      {/* Filters and Sort */}
      {videos.length > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les vidéos</option>
            <option value="recent">Récentes</option>
            <option value="large">Grandes tailles</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Plus récentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="name">Nom A-Z</option>
          </select>
        </div>
      )}

      {/* Enhanced Video Upload Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ajouter une nouvelle vidéo
        </h3>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Nom de la vidéo"
              value={newVideo.name}
              onChange={(e) =>
                setNewVideo({ ...newVideo, name: e.target.value })
              }
              placeholder="Entrez le nom de la vidéo"
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fichier vidéo <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileSelect}
                  id="video-file-input"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {newVideo.file
                      ? newVideo.file.name
                      : "Cliquez ou glissez-déposez votre vidéo"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <FormInput
            label="Description de la vidéo"
            value={newVideo.description}
            onChange={(e) =>
              setNewVideo({ ...newVideo, description: e.target.value })
            }
            placeholder="Décrivez le contenu de cette vidéo"
            multiline
          />

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Téléchargement en cours...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <ProgressBar progress={uploadProgress} />
            </div>
          )}

          <button
            onClick={handleVideoUpload}
            disabled={isUploading || !newVideo.name.trim() || !newVideo.file}
            className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
              isUploading || !newVideo.name.trim() || !newVideo.file
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Téléchargement...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Télécharger la vidéo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Videos Grid */}
      {sortedVideos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onEdit={handleEditVideo}
              onDelete={handleDeleteVideo}
              onView={onViewVideo}
              onDownload={onDownloadVideo}
              onShare={onShareVideo}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucune vidéo ajoutée</h3>
          <p className="text-gray-400 mb-6">
            Ajoutez votre première vidéo pour commencer
          </p>
          <button
            onClick={() => document.getElementById("video-file-input").click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Ajouter une vidéo
          </button>
        </div>
      )}
    </section>
  );
};

export default VideoSection;
