import { useState } from "react";
import Swal from "sweetalert2";
import {
  Video,
  Play,
  Download,
  Share2,
  Edit,
  Trash2,
  Clock,
  FileVideo,
  MoreVertical,
  Eye,
  Save,
  X,
} from "lucide-react";
import FormInput from "./FormInput";

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

  const handleSave = async () => {
    const result = await Swal.fire({
      title: "Confirmer les modifications",
      text: "Voulez-vous enregistrer les modifications apportées à cette vidéo ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Enregistrer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      onEdit(video.id, editData);
      setIsEditing(false);
      setShowMenu(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: video.name,
      description: video.description,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Supprimer la vidéo",
      text: `Êtes-vous sûr de vouloir supprimer "${video.name}" ? Cette action est irréversible.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      onDelete(video.id);
      Swal.fire({
        title: "Supprimé",
        text: "La vidéo a été supprimée avec succès.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
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
            <MoreVertical className="w-4 h-4 text-black" />
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
                  handleDelete();
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

export default VideoCard;
