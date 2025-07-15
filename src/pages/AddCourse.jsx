import {
  AlertCircle,
  Check,
  CheckCircle,
  FileText,
  Loader2,
  Percent,
  Plus,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import FormInput from "../components/Courses/FormInput";
import VideoSection from "../components/Courses/VideoSection";

import {
  handleThumbnailUpload,
  handleVideoFileSelect,
  handleVideoUpload,
  handleEditVideo,
  handleDeleteVideo,
  handleAddObjective,
  handleRemoveObjective,
  handleEditObjective,
  handleSaveObjective,
  handleCancelEdit,
  handlePublish,
  handleDiscountToggle,
} from "../components/Courses/courseHandlers";

export default function AddCourse() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    difficulty: "Débutants",
    prerequisites: "",
    duration: "",
  });

  const [discount, setDiscount] = useState({
    hasDiscount: false,
    percentage: "",
    description: "",
    maxStudents: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [videos, setVideos] = useState([]);

  // Video upload states
  const [newVideo, setNewVideo] = useState({
    name: "",
    description: "",
    file: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [newObjective, setNewObjective] = useState("");
  const [editingObjective, setEditingObjective] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [objectives, setObjectives] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const difficulties = ["Débutants", "Intermédiaires", "Professionnels"];

  // Page loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chargement...
          </h2>
          <p className="text-gray-600">
            Préparation de l'interface de création de cours
          </p>
          <div className="mt-4 w-64 mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      {alert && (
        <showAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Créer un Nouveau Cours
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Partagez vos connaissances avec le monde entier en créant un cours
            professionnel et engageant
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Course Title and Thumbnail */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Titre du Cours et Miniature
              </h2>
            </div>

            <FormInput
              label="Titre du Cours *"
              value={courseData.title}
              onChange={(e) =>
                setCourseData({ ...courseData, title: e.target.value })
              }
              placeholder="Entrez le titre de votre cours"
              className="mb-6"
            />

            <div>
              <label className="block text-xl font-semibold text-gray-800 mb-3">
                Miniature du Cours
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="flex flex-col justify-center items-center p-8 w-full text-center rounded-2xl border-2 border-dashed border-blue-600 hover:border-blue-700 transition-colors cursor-pointer bg-blue-50/50 hover:bg-blue-100/50"
                >
                  {thumbnail ? (
                    <div className="relative">
                      <img
                        src={thumbnail}
                        alt="Course thumbnail"
                        className="max-w-full max-h-48 rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <span className="text-white font-medium">
                          Changer l'image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-blue-600 mb-3" />
                      <p className="text-gray-800 text-lg">
                        Télécharger l'image/miniature du cours
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        PNG, JPG jusqu'à 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </section>

          <VideoSection
            videos={videos}
            newVideo={newVideo}
            setNewVideo={setNewVideo}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            handleVideoFileSelect={handleVideoFileSelect}
            handleVideoUpload={handleVideoUpload}
            handleEditVideo={handleEditVideo}
            handleDeleteVideo={handleDeleteVideo}
          />

          {/* Course Details */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Détails du Cours
                </h2>
                <p className="text-gray-600 mt-1">
                  Informations essentielles pour vos étudiants
                </p>
              </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormInput
                  label="Description du Cours *"
                  value={courseData.description}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Décrivez votre cours en détail"
                  multiline={true}
                />
                <FormInput
                  label="Prérequis"
                  value={courseData.prerequisites}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      prerequisites: e.target.value,
                    })
                  }
                  placeholder="Quels sont les prérequis pour ce cours?"
                  multiline={true}
                />
              </div>

              <div className="space-y-6">
                <FormInput
                  label="Prix du Cours (€) *"
                  value={courseData.price}
                  onChange={(e) =>
                    setCourseData({ ...courseData, price: e.target.value })
                  }
                  type="number"
                  placeholder="Ex: 49.99"
                />

                <div>
                  <label className="block text-xl font-semibold text-gray-800 mb-3">
                    Niveau de Difficulté
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {difficulties.map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          setCourseData({ ...courseData, difficulty: level })
                        }
                        className={`px-6 py-2 rounded-2xl font-medium transition-all transform hover:scale-105 ${
                          courseData.difficulty === level
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <FormInput
                  label="Durée du Cours"
                  value={courseData.duration}
                  onChange={(e) =>
                    setCourseData({ ...courseData, duration: e.target.value })
                  }
                  placeholder="Ex: 10 heures"
                />
              </div>
            </div>
          </section>

          {/* Learning Objectives */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Objectifs d'Apprentissage
                </h2>
                <p className="text-gray-600 mt-1">
                  Ce que vos étudiants vont apprendre
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <FormInput
                  label="Nouvel Objectif"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Entrez un nouvel objectif d'apprentissage"
                  className="flex-1"
                />
                <button
                  onClick={handleAddObjective}
                  disabled={!newObjective.trim()}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center gap-2 mt-8 md:mt-0 ${
                    !newObjective.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {objectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200 transition-all hover:shadow-md"
                >
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  {editingObjective === index ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Modifier l'objectif"
                      />
                      <button
                        onClick={handleSaveObjective}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <span className="text-gray-800">{objective}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleEditObjective(index)}
                          className="text-blue-600 hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleRemoveObjective(index)}
                          className="text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {objectives.length === 0 && (
                <div className="text-center text-gray-500 py-6">
                  <Check className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <p className="text-lg">Aucun objectif ajouté</p>
                  <p className="text-sm">
                    Ajoutez des objectifs pour guider vos étudiants
                  </p>
                </div>
              )}
            </div>
          </section>
          {/* Discount Section */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Réduction</h2>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="checkbox"
                  checked={discount.hasDiscount}
                  onChange={handleDiscountToggle}
                  className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <span className="text-lg font-semibold text-gray-800">
                  Activer une réduction
                </span>
              </div>

              {discount.hasDiscount && (
                <div className="space-y-4">
                  <FormInput
                    label="Pourcentage de réduction (%)"
                    value={discount.percentage}
                    onChange={(e) =>
                      setDiscount({ ...discount, percentage: e.target.value })
                    }
                    type="number"
                    placeholder="Ex: 20"
                  />
                  <FormInput
                    label="Description de la réduction"
                    value={discount.description}
                    onChange={(e) =>
                      setDiscount({ ...discount, description: e.target.value })
                    }
                    placeholder="Ex: Offre spéciale pour les premiers inscrits"
                    multiline={true}
                  />
                  <FormInput
                    label="Nombre maximum d'étudiants avec réduction"
                    value={discount.maxStudents}
                    onChange={(e) =>
                      setDiscount({ ...discount, maxStudents: e.target.value })
                    }
                    type="number"
                    placeholder="Ex: 100"
                  />
                </div>
              )}
            </div>
          </section>
          {/* Publish Button */}
          <div className="text-center">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${
                isPublishing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                  Publication en cours...
                </>
              ) : (
                "Publier le Cours"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
