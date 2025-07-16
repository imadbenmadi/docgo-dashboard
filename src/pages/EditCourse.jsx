import { useFormik } from "formik";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import Swal from "sweetalert2";
import FormInput from "../components/Courses/FormInput";
import VideoSection from "../components/Courses/VideoSection";

export default function EditCourse() {
  const { id } = useParams(); // Get course ID from URL
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videos, setVideos] = useState([]);
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

  // Formik setup
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      price: "",
      difficulty: "Débutants",
      prerequisites: "",
      duration: "",
      hasDiscount: false,
      discountPercentage: "",
      discountDescription: "",
      discountMaxStudents: "",
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required("Le titre du cours est requis")
        .min(3, "Le titre doit contenir au moins 3 caractères"),
      description: Yup.string()
        .required("La description du cours est requise")
        .min(10, "La description doit contenir au moins 10 caractères"),
      price: Yup.number()
        .required("Le prix du cours est requis")
        .min(0, "Le prix doit être supérieur ou égal à 0"),
      difficulty: Yup.string().required("Le niveau de difficulté est requis"),
      prerequisites: Yup.string(),
      duration: Yup.string(),
      hasDiscount: Yup.boolean(),
      discountPercentage: Yup.number().when("hasDiscount", {
        is: true,
        then: (schema) =>
          schema
            .required("Le pourcentage de réduction est requis")
            .min(1, "Le pourcentage doit être entre 1 et 100")
            .max(100, "Le pourcentage doit être entre 1 et 100"),
      }),
      discountDescription: Yup.string().when("hasDiscount", {
        is: true,
        then: (schema) =>
          schema.required("La description de la réduction est requise"),
      }),
      discountMaxStudents: Yup.number().when("hasDiscount", {
        is: true,
        then: (schema) =>
          schema
            .required("Le nombre maximum d'étudiants est requis")
            .min(1, "Le nombre doit être supérieur à 0"),
      }),
    }),
    onSubmit: async (values) => {
      if (videos.length === 0) {
        showAlert(
          "warning",
          "Attention",
          "Veuillez ajouter au moins une vidéo."
        );
        return;
      }
      if (!thumbnail) {
        showAlert(
          "warning",
          "Attention",
          "Veuillez ajouter une miniature pour le cours."
        );
        return;
      }

      setIsPublishing(true);
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("price", values.price);
        formData.append("difficulty", values.difficulty);
        formData.append("prerequisites", values.prerequisites);
        formData.append("duration", values.duration);
        formData.append("hasDiscount", values.hasDiscount);
        if (values.hasDiscount) {
          formData.append("discountPercentage", values.discountPercentage);
          formData.append("discountDescription", values.discountDescription);
          formData.append("discountMaxStudents", values.discountMaxStudents);
        }
        formData.append("objectives", JSON.stringify(objectives));
        if (thumbnail && typeof thumbnail !== "string") {
          formData.append("thumbnail", thumbnail); // Only append if new file
        }

        videos.forEach((video, index) => {
          formData.append(`videos[${index}][id]`, video.id || "");
          formData.append(`videos[${index}][name]`, video.name);
          formData.append(`videos[${index}][description]`, video.description);
          if (video.file) {
            formData.append(`videos[${index}][file]`, video.file); // Only append new files
          } else {
            formData.append(`videos[${index}][url]`, video.url); // Keep existing URL
          }
        });

        const response = await fetch(`/api/courses/${id}`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Erreur lors de la mise à jour du cours"
          );
        }

        showAlert("success", "Succès", "Cours mis à jour avec succès!");
        // Optionally reset form or redirect
      } catch (error) {
        showAlert(
          "error",
          "Erreur",
          "Une erreur s'est produite: " + error.message
        );
      } finally {
        setIsPublishing(false);
      }
    },
  });

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsPageLoading(true);
        const response = await fetch(`/api/courses/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du cours");
        }

        // const course = await response.json();
        const course = {
          title: "Exemple de Cours",
          description: "Ceci est un exemple de description de cours.",
          price: "49.99",
          difficulty: "Débutants",
          prerequisites: "Aucun",
          duration: "4 semaines",
          hasDiscount: true,
          discountPercentage: "20",
          discountDescription: "Promotion de lancement",
          discountMaxStudents: "100",
          thumbnail: "https://example.com/thumbnail.jpg",
          videos: [
            {
              id: 1,
              name: "Introduction",
              description: "Introduction au cours",
              url: "https://example.com/video1.mp4",
            },
            {
              id: 2,
              name: "Chapitre 1",
              description: "Première leçon",
              url: "https://example.com/video2.mp4",
            },
          ],
          objectives: [
            "Comprendre les bases",
            "Appliquer les concepts",
            "Préparer un projet final",
          ],
        };

        // Populate formik fields
        formik.setValues({
          title: course.title || "",
          description: course.description || "",
          price: course.price || "",
          difficulty: course.difficulty || "Débutants",
          prerequisites: course.prerequisites || "",
          duration: course.duration || "",
          hasDiscount: course.hasDiscount || false,
          discountPercentage: course.discountPercentage || "",
          discountDescription: course.discountDescription || "",
          discountMaxStudents: course.discountMaxStudents || "",
        });
        // Populate other states
        setThumbnail(course.thumbnail || null);
        setVideos(course.videos || []);
        setObjectives(course.objectives || []);
        setIsPageLoading(false);
      } catch (error) {
        showAlert(
          "error",
          "Erreur",
          "Erreur lors du chargement du cours: " + error.message
        );
        setIsPageLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // Reset discount fields when hasDiscount is toggled off
  useEffect(() => {
    if (!formik.values.hasDiscount) {
      formik.setFieldValue("discountPercentage", "");
      formik.setFieldValue("discountDescription", "");
      formik.setFieldValue("discountMaxStudents", "");
    }
  }, [formik.values.hasDiscount]);

  const showAlert = (type, title, message) => {
    Swal.fire({
      icon: type,
      title: title,
      text: message,
      confirmButtonColor: "#3b82f6",
      timer: type === "success" ? 1500 : undefined,
      showConfirmButton: type !== "success",
    });
  };

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        showAlert(
          "error",
          "Erreur",
          "Veuillez sélectionner une image PNG ou JPG."
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showAlert(
          "error",
          "Erreur",
          "Le fichier est trop volumineux. Maximum 10MB."
        );
        return;
      }
      setThumbnail(file);
      showAlert("success", "Succès", "Miniature téléchargée avec succès!");
    }
  };

  const handleVideoFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        showAlert("error", "Erreur", "Veuillez sélectionner un fichier vidéo.");
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        showAlert(
          "error",
          "Erreur",
          "Le fichier vidéo est trop volumineux. Maximum 500MB."
        );
        return;
      }
      setNewVideo({ ...newVideo, file });
    }
  };

  const handleVideoUpload = async () => {
    if (!newVideo.file || !newVideo.name.trim()) {
      showAlert(
        "warning",
        "Attention",
        "Veuillez remplir tous les champs et sélectionner une vidéo."
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate upload
      clearInterval(progressInterval);
      setUploadProgress(100);

      const newVideoData = {
        id: Date.now(),
        name: newVideo.name,
        description:
          newVideo.description || `Description pour la vidéo: ${newVideo.name}`,
        url: URL.createObjectURL(newVideo.file),
        file: newVideo.file,
        uploaded: true,
      };

      setVideos([...videos, newVideoData]);
      setNewVideo({ name: "", description: "", file: null });
      setIsUploading(false);
      setUploadProgress(0);

      const fileInput = document.getElementById("video-file-input");
      if (fileInput) fileInput.value = "";

      showAlert("success", "Succès", "Vidéo téléchargée avec succès!");
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      showAlert(
        "error",
        "Erreur",
        "Erreur lors du téléchargement de la vidéo: " + error.message
      );
    }
  };

  const handleEditVideo = (videoId, newData) => {
    setVideos(
      videos.map((video) =>
        video.id === videoId
          ? { ...video, name: newData.name, description: newData.description }
          : video
      )
    );
    showAlert("success", "Succès", "Vidéo modifiée avec succès!");
  };

  const handleDeleteVideo = (videoId) => {
    setVideos(videos.filter((video) => video.id !== videoId));
    showAlert("success", "Succès", "Vidéo supprimée avec succès!");
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
      showAlert("success", "Succès", "Objectif ajouté avec succès!");
    }
  };

  const handleRemoveObjective = (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
    showAlert("success", "Succès", "Objectif supprimé avec succès!");
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
      showAlert("success", "Succès", "Objectif modifié avec succès!");
    }
    setEditingObjective(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingObjective(null);
    setEditingText("");
  };

  const handleSaveToBackend = async (videos) => {
    try {
      const formData = new FormData();
      videos.forEach((video, index) => {
        formData.append(`videos[${index}][id]`, video.id || "");
        formData.append(`videos[${index}][name]`, video.name);
        formData.append(`videos[${index}][description]`, video.description);
        if (video.file) {
          formData.append(`videos[${index}][file]`, video.file);
        } else {
          formData.append(`videos[${index}][url]`, video.url);
        }
      });

      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement des vidéos");
      }

      showAlert("success", "Succès", "Vidéos enregistrées avec succès!");
    } catch (error) {
      showAlert(
        "error",
        "Erreur",
        "Une erreur s'est produite: " + error.message
      );
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chargement...
          </h2>
          <p className="text-gray-600">
            Préparation de l'interface de modification de cours
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      {alert && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            alert.type === "success"
              ? "bg-green-100 text-green-800"
              : alert.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
          role="alert"
          aria-live="assertive"
        >
          {alert.type === "success" && <CheckCircle className="w-5 h-5" />}
          {alert.type === "error" && <AlertCircle className="w-5 h-5" />}
          {alert.type === "warning" && <AlertCircle className="w-5 h-5" />}
          <div>
            <h3 className="font-semibold">{alert.title}</h3>
            <p>{alert.message}</p>
          </div>
          <button onClick={() => setAlert(null)} aria-label="Fermer l'alerte">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Modifier le Cours
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mettez à jour les détails de votre cours pour offrir la meilleure
            expérience d'apprentissage
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
          <div className="bg-white rounded-3xl shadow-xl p-8">
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
                value={formik.values.title}
                onChange={formik.handleChange}
                name="title"
                placeholder="Entrez le titre de votre cours"
                className="mb-6"
                error={formik.touched.title && formik.errors.title}
                required
              />

              <div>
                <label
                  htmlFor="thumbnail-upload"
                  className="block text-xl font-semibold text-gray-800 mb-3"
                >
                  Miniature du Cours
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail-upload"
                    aria-label="Télécharger une miniature pour le cours"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="flex flex-col justify-center items-center p-8 w-full text-center rounded-2xl border-2 border-dashed border-blue-600 hover:border-blue-700 transition-colors cursor-pointer bg-blue-50/50 hover:bg-blue-100/50"
                  >
                    {thumbnail ? (
                      <div className="relative">
                        <img
                          src={
                            typeof thumbnail === "string"
                              ? thumbnail
                              : URL.createObjectURL(thumbnail)
                          }
                          alt="Aperçu de la miniature du cours"
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
              onSaveToBackend={handleSaveToBackend}
            />

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
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    name="description"
                    placeholder="Décrivez votre cours en détail"
                    multiline={true}
                    error={
                      formik.touched.description && formik.errors.description
                    }
                    required
                  />
                  <FormInput
                    label="Prérequis"
                    value={formik.values.prerequisites}
                    onChange={formik.handleChange}
                    name="prerequisites"
                    placeholder="Quels sont les prérequis pour ce cours?"
                    multiline={true}
                  />
                </div>

                <div className="space-y-6">
                  <FormInput
                    label="Prix du Cours (€) *"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    name="price"
                    type="number"
                    placeholder="Ex: 49.99"
                    error={formik.touched.price && formik.errors.price}
                    required
                  />

                  <div>
                    <label className="block text-xl font-semibold text-gray-800 mb-3">
                      Niveau de Difficulté
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {difficulties.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            formik.setFieldValue("difficulty", level)
                          }
                          className={`px-6 py-2 rounded-2xl font-medium transition-all transform hover:scale-105 ${
                            formik.values.difficulty === level
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          aria-pressed={formik.values.difficulty === level}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    {formik.touched.difficulty && formik.errors.difficulty && (
                      <p className="text-red-500 text-sm mt-2">
                        {formik.errors.discount}
                      </p>
                    )}
                  </div>

                  <FormInput
                    label="Durée du Cours"
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    name="duration"
                    placeholder="Ex: 10 heures"
                  />
                </div>
              </div>
            </section>

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
                    type="button"
                    onClick={handleAddObjective}
                    disabled={!newObjective.trim()}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center gap-2 mt-8 md:mt-0 ${
                      !newObjective.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
                    }`}
                    aria-disabled={!newObjective.trim()}
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
                          aria-label="Modifier l'objectif"
                        />
                        <button
                          type="button"
                          onClick={handleSaveObjective}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          aria-label="Enregistrer l'objectif"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          aria-label="Annuler la modification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <span className="text-gray-800">{objective}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => handleEditObjective(index)}
                            className="text-blue-600 hover:underline"
                            aria-label={`Modifier l'objectif ${objective}`}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveObjective(index)}
                            className="text-red-600 hover:underline"
                            aria-label={`Supprimer l'objectif ${objective}`}
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
                    checked={formik.values.hasDiscount}
                    onChange={() =>
                      formik.setFieldValue(
                        "hasDiscount",
                        !formik.values.hasDiscount
                      )
                    }
                    className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    name="hasDiscount"
                    id="hasDiscount"
                    aria-label="Activer une réduction"
                  />
                  <label
                    htmlFor="hasDiscount"
                    className="text-lg font-semibold text-gray-800"
                  >
                    Activer une réduction
                  </label>
                </div>

                {formik.values.hasDiscount && (
                  <div className="space-y-4">
                    <FormInput
                      label="Pourcentage de réduction (%)"
                      value={formik.values.discountPercentage}
                      onChange={formik.handleChange}
                      name="discountPercentage"
                      type="number"
                      placeholder="Ex: 20"
                      error={
                        formik.touched.discountPercentage &&
                        formik.errors.discountPercentage
                      }
                      required
                    />
                    <FormInput
                      label="Description de la réduction"
                      value={formik.values.discountDescription}
                      onChange={formik.handleChange}
                      name="discountDescription"
                      placeholder="Ex: Offre spéciale pour les premiers inscrits"
                      multiline={true}
                      error={
                        formik.touched.discountDescription &&
                        formik.errors.discountDescription
                      }
                      required
                    />
                    <FormInput
                      label="Nombre maximum d'étudiants avec réduction"
                      value={formik.values.discountMaxStudents}
                      onChange={formik.handleChange}
                      name="discountMaxStudents"
                      type="number"
                      placeholder="Ex: 100"
                      error={
                        formik.touched.discountMaxStudents &&
                        formik.errors.discountMaxStudents
                      }
                      required
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="text-center">
              <button
                type="submit"
                disabled={isPublishing}
                className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  isPublishing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Mise à jour en cours...
                  </>
                ) : (
                  "Mettre à jour le Cours"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
