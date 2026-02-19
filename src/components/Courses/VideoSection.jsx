import {
    Clock,
    Download,
    Edit,
    Eye,
    FileVideo,
    Loader2,
    MoreVertical,
    Play,
    Plus,
    Save,
    Share2,
    Trash2,
    Upload,
    Video,
    X,
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import FormInput from "./FormInput";
import VideoCard from "./ViodeoCard";
import ValidationErrorPanel from "../Common/FormValidation/ValidationErrorPanel";
import { useFormValidation } from "../Common/FormValidation/useFormValidation";

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
    const {
        errors: validationErrors,
        showPanel,
        validate,
        hidePanel,
    } = useFormValidation();

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
            } else {
                validate([
                    {
                        field: "Fichier vidéo",
                        message:
                            "Veuillez sélectionner un fichier vidéo valide (MP4, AVI, MKV, etc.)",
                        section: "Vidéo",
                        condition: true,
                    },
                ]);
            }
        }
    };

    const handleUpload = async () => {
        const isValid = validate([
            {
                field: "Nom de la vidéo",
                message: "Le nom de la vidéo est requis",
                section: "Informations vidéo",
                scrollToId: "video-name-input",
                condition: !newVideo.name?.trim(),
            },
            {
                field: "Fichier vidéo",
                message: "Veuillez sélectionner un fichier vidéo",
                section: "Informations vidéo",
                condition: !newVideo.file,
            },
        ]);
        if (!isValid) return;

        const result = await Swal.fire({
            title: "Confirmer le téléchargement",
            text: "Voulez-vous télécharger cette vidéo ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Télécharger",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
        });

        if (result.isConfirmed) {
            handleVideoUpload();
            Swal.fire({
                title: "Téléchargement démarré",
                text: "Votre vidéo est en cours de téléchargement.",
                icon: "info",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    const handleSaveAll = async () => {
        const result = await Swal.fire({
            title: "Enregistrer toutes les vidéos",
            text: "Voulez-vous enregistrer toutes les vidéos sur le serveur ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Enregistrer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#22c55e",
            cancelButtonColor: "#6b7280",
        });

        if (result.isConfirmed) {
            onSaveToBackend(videos);
            Swal.fire({
                title: "Succès",
                text: "Les vidéos ont été enregistrées sur le serveur !",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
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
            <ValidationErrorPanel
                errors={validationErrors}
                isVisible={showPanel}
                onClose={hidePanel}
                title="Vérifiez les informations de la vidéo"
            />
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            Vidéos du Cours
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Gérez vos vidéos de cours
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {videos.length} vidéo(s)
                    </span>
                    {videos.length > 0 && (
                        <button
                            onClick={handleSaveAll}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Sauvegarder
                        </button>
                    )}
                </div>
            </div>

            {/*  Video Upload Form */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Ajouter une nouvelle vidéo
                </h3>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormInput
                            label="Nom de la vidéo"
                            name="video-name-input"
                            value={newVideo.name}
                            onChange={(e) =>
                                setNewVideo({
                                    ...newVideo,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Entrez le nom de la vidéo"
                            required
                        />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Fichier vidéo{" "}
                                <span className="text-red-500">*</span>
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
                            setNewVideo({
                                ...newVideo,
                                description: e.target.value,
                            })
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
                        onClick={handleUpload}
                        disabled={
                            isUploading ||
                            !newVideo.name.trim() ||
                            !newVideo.file
                        }
                        className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                            isUploading ||
                            !newVideo.name.trim() ||
                            !newVideo.file
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

            {/*  Videos Grid */}
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
                    <h3 className="text-xl font-semibold mb-2">
                        Aucune vidéo ajoutée
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Ajoutez votre première vidéo pour commencer
                    </p>
                    <button
                        onClick={() =>
                            document.getElementById("video-file-input").click()
                        }
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
