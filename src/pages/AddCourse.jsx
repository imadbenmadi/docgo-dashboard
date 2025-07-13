"use client";
import * as React from "react";
import {
  Upload,
  X,
  Play,
  Loader2,
  Plus,
  Check,
  Trash2,
  Edit,
  Save,
  Percent,
} from "lucide-react";

export default function AddCourse() {
  const [courseData, setCourseData] = React.useState({
    title: "Fondements du Design : Des Bases à la Maîtrise Professionnelle",
    description:
      "Apprenez les principes essentiels du design, explorez la théorie des couleurs, la typographie et le design d'interface utilisateur, et acquérez de l'expérience pratique avec des outils comme Adobe Illustrator et Figma. Ce cours est idéal pour toute personne souhaitant améliorer ses compétences en design ou démarrer une carrière dans le design.",
    price: "49.99",
    difficulty: "Débutants",
    prerequisites:
      "Aucune expérience préalable en design n'est requise. Cependant, des compétences informatiques de base sont recommandées.",
    duration: "10 heures",
  });

  const [discount, setDiscount] = React.useState({
    hasDiscount: false,
    percentage: "",
    description: "",
    maxStudents: "",
  });

  const [thumbnail, setThumbnail] = React.useState(null);
  const [videos, setVideos] = React.useState([
    {
      id: 1,
      name: "Concepts de Design de Base",
      description:
        "Une vidéo fondamentale couvrant les concepts de design de base tels que l'équilibre, le contraste, l'alignement et la proximité.",
      url: "https://cdn.builder.io/api/v1/image/assets/TEMP/8f9e86c17879f2a2bf48a2fdcd0bbd2f8c7d3d27?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
      uploaded: true,
    },
    {
      id: 2,
      name: "Projet de Design Complet",
      description:
        "Un guide étape par étape pour mener un projet de design du concept initial au produit final, comprenant le brainstorming, la création de wireframes et le prototypage.",
      url: "https://cdn.builder.io/api/v1/image/assets/TEMP/300f6cc3a742f4564e8919da06ea4f9d521df387?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3",
      uploaded: true,
    },
  ]);

  const [newVideoName, setNewVideoName] = React.useState("");
  const [newObjective, setNewObjective] = React.useState("");
  const [editingObjective, setEditingObjective] = React.useState(null);
  const [editingText, setEditingText] = React.useState("");
  const [objectives, setObjectives] = React.useState([
    "Comprendre et appliquer des principes de design tels que l'équilibre, le contraste et la hiérarchie",
    "Développer des mises en page solides en utilisant des systèmes de grille et des techniques d'espacement",
    "Créer des schémas de couleurs attrayants et associer les polices de caractères de manière efficace",
    "Utiliser des outils de design comme Adobe Illustrator, Photoshop ou Figma pour donner vie aux idées",
    "Construire un projet de design complet du concept au prototype final",
  ]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const difficulties = ["Débutants", "Intermédiaires", "Professionnels"];

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setThumbnail(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (file && newVideoName.trim()) {
      setIsUploading(true);
      setTimeout(() => {
        const newVideo = {
          id: Date.now(),
          name: newVideoName,
          description: `Description pour la vidéo: ${newVideoName}`,
          url: URL.createObjectURL(file),
          uploaded: true,
        };
        setVideos([...videos, newVideo]);
        setNewVideoName("");
        setIsUploading(false);
      }, 2000);
    }
  };

  const handleDeleteVideo = (videoId) => {
    setVideos(videos.filter((video) => video.id !== videoId));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleEditObjective = (index) => {
    setEditingObjective(index);
    setEditingText(objectives[index]);
  };

  const handleSaveObjective = () => {
    if (editingText.trim()) {
      const updatedObjectives = [...objectives];
      updatedObjectives[editingObjective] = editingText.trim();
      setObjectives(updatedObjectives);
    }
    setEditingObjective(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingObjective(null);
    setEditingText("");
  };

  const handleDiscountToggle = () => {
    setDiscount({
      ...discount,
      hasDiscount: !discount.hasDiscount,
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      alert("Cours publié avec succès!");
    }, 3000);
  };

  const FormInput = ({
    label,
    value,
    onChange,
    multiline = false,
    className = "",
    placeholder = "",
    type = "text",
  }) => (
    <div className={`w-full max-md:max-w-full ${className}`}>
      {label && (
        <label className="block text-xl font-semibold text-gray-800 mb-3">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className="w-full px-6 py-3 text-base rounded-2xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
          aria-label={label}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-6 py-3 text-base rounded-2xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
          aria-label={label}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
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
              label="Titre du Cours"
              value={courseData.title}
              onChange={(e) =>
                setCourseData({ ...courseData, title: e.target.value })
              }
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

          {/* Videos Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Vidéos du Cours
              </h2>
              <span className="text-sm text-gray-500">
                {videos.length} vidéo(s)
              </span>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={isUploading || !newVideoName.trim()}
                  />
                  <label
                    htmlFor="video-upload"
                    className={`flex flex-col justify-center items-center p-8 w-full text-center rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${
                      isUploading || !newVideoName.trim()
                        ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-blue-400 bg-white hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                        <p className="text-gray-800">
                          Téléchargement en cours...
                        </p>
                      </>
                    ) : (
                      <>
                        <Plus className="w-8 h-8 text-blue-600 mb-3" />
                        <p className="text-gray-800">Télécharger votre vidéo</p>
                        <p className="text-gray-500 text-sm mt-1">
                          MP4, WebM jusqu'à 500MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
                <div className="space-y-4">
                  <FormInput
                    label="Nom de la vidéo"
                    value={newVideoName}
                    onChange={(e) => setNewVideoName(e.target.value)}
                    placeholder="Entrez le nom de la vidéo"
                  />
                  <button
                    onClick={() =>
                      document.getElementById("video-upload").click()
                    }
                    disabled={isUploading || !newVideoName.trim()}
                    className={`w-full py-3 rounded-2xl font-medium transition-all ${
                      isUploading || !newVideoName.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                    }`}
                    aria-label="Ajouter une vidéo"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Téléchargement...
                      </div>
                    ) : (
                      "Ajouter la vidéo"
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={video.url}
                      alt={video.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      aria-label={`Supprimer la vidéo ${video.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {video.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Course Details */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
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
                  label="Description du Cours"
                  value={courseData.description}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      description: e.target.value,
                    })
                  }
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
                  multiline={true}
                />
              </div>
              <div className="space-y-6">
                <FormInput
                  label="Prix du Cours (€)"
                  value={courseData.price}
                  onChange={(e) =>
                    setCourseData({ ...courseData, price: e.target.value })
                  }
                  type="number"
                  placeholder="Entrez le prix en euros"
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
                        aria-pressed={courseData.difficulty === level}
                        aria-label={`Sélectionner le niveau ${level}`}
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
                  placeholder="Ex. 10 heures"
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
                  aria-label="Ajouter un nouvel objectif"
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
                  <Check
                    className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {editingObjective === index ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSaveObjective();
                          }
                          if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveObjective}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        aria-label="Sauvegarder l'objectif"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        aria-label="Annuler la modification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800 flex-1">{objective}</p>
                      <button
                        onClick={() => handleEditObjective(index)}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors transform hover:scale-110"
                        aria-label={`Modifier l'objectif ${objective}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveObjective(index)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                        aria-label={`Supprimer l'objectif ${objective}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Discount Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-gray-800">
                    Remise Promotionnelle
                  </span>
                </div>
                <button
                  onClick={handleDiscountToggle}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    discount.hasDiscount
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {discount.hasDiscount ? "Supprimer" : "Ajouter une remise"}
                </button>
              </div>

              {discount.hasDiscount && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                      label="Pourcentage de remise"
                      value={discount.percentage}
                      onChange={(e) =>
                        setDiscount({ ...discount, percentage: e.target.value })
                      }
                      type="number"
                      placeholder="Ex. 20"
                    />
                    <FormInput
                      label="Nombre maximum d'étudiants"
                      value={discount.maxStudents}
                      onChange={(e) =>
                        setDiscount({
                          ...discount,
                          maxStudents: e.target.value,
                        })
                      }
                      type="number"
                      placeholder="Ex. 100"
                    />
                  </div>
                  <FormInput
                    label="Description de la remise"
                    value={discount.description}
                    onChange={(e) =>
                      setDiscount({ ...discount, description: e.target.value })
                    }
                    placeholder="Ex. Offre limitée pour les premiers inscrits"
                  />

                  {discount.percentage && discount.maxStudents && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-orange-200">
                      <p className="text-orange-800 font-medium">
                        Remise de {discount.percentage}% pour les{" "}
                        {discount.maxStudents} premiers étudiants
                        {discount.description && ` - ${discount.description}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Prix original: {courseData.price}€ → Prix avec remise:{" "}
                        {(
                          parseFloat(courseData.price) *
                          (1 - discount.percentage / 100)
                        ).toFixed(2)}
                        €
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Publish Button */}
          <div className="text-center">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`px-12 py-4 rounded-2xl font-medium text-lg transition-all transform hover:scale-105 ${
                isPublishing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
              }`}
              aria-label="Publier le cours"
            >
              {isPublishing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publication en cours...
                </div>
              ) : (
                "Publier le cours"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
