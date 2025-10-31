import axios from "axios";
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
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import AddPDFs from "../components/Courses/AddPDFs";
import AddQuiz from "../components/Courses/AddQuiz";
import {
  handleAddObjective,
  handleCancelEdit,
  handleDeleteVideo,
  handleDiscountToggle,
  handleEditObjective,
  handleEditVideo,
  handleRemoveObjective,
  handleSaveObjective,
  handleVideoFileSelect,
  handleVideoUpload,
} from "../components/Courses/courseHandlers";
import FormInput from "../components/Courses/FormInput";
import VideoSection from "../components/Courses/VideoSection";

// Modified handleThumbnailUpload to work with Formik
const modifiedHandleThumbnailUpload =
  (setThumbnail, setFieldValue, showAlert) => (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showAlert(
          "error",
          "Erreur",
          "Le fichier est trop volumineux. Maximum 10MB."
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target.result);
        setFieldValue("thumbnail", file); // Store the file in Formik
        showAlert("success", "Succès", "Miniature téléchargée avec succès!");
      };
      reader.readAsDataURL(file);
    }
  };

export default function AddCourse() {
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
  const [isDebugSubmit, setIsDebugSubmit] = useState(false);
  const Navigate = useNavigate();
  const difficulties = ["Débutants", "Intermédiaires", "Professionnels"];

  // Formik setup
  const formik = useFormik({
    initialValues: {
      // French fields (required)
      title: "",
      description: "",
      prerequisites: "",

      // Arabic fields (optional)
      title_ar: "",
      description_ar: "",
      prerequisites_ar: "",

      // Course details
      price: "",
      currency: "EUR", // Currency selector (EUR or DZD)
      difficulty: "Débutants",
      duration: "",
      hasDiscount: false,
      discountPercentage: "",
      discountDescription: "",
      discountMaxStudents: "",
      thumbnail: null,
      videos: [],
      objectives: [],
      pdfs: [],
      quiz: [],
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
        otherwise: (schema) => schema.notRequired(),
      }),
      discountDescription: Yup.string().when("hasDiscount", {
        is: true,
        then: (schema) =>
          schema.required("La description de la réduction est requise"),
        otherwise: (schema) => schema.notRequired(),
      }),
      discountMaxStudents: Yup.number().when("hasDiscount", {
        is: true,
        then: (schema) =>
          schema
            .required("Le nombre maximum d'étudiants est requis")
            .min(1, "Le nombre doit être supérieur à 0"),
        otherwise: (schema) => schema.notRequired(),
      }),
      thumbnail: Yup.mixed().required("La miniature est requise"),
      videos: Yup.array()
        .min(1, "Au moins une vidéo est requise")
        .required("Les vidéos sont requises"),
      objectives: Yup.array()
        .min(1, "Au moins un objectif est requis")
        .required("Les objectifs sont requis"),
      pdfs: Yup.array().of(
        Yup.object().shape({
          title: Yup.string().required("Le titre du PDF est requis"),
          file: Yup.mixed().required("Le fichier PDF est requis"),
        })
      ),
      quizzes: Yup.array().of(
        Yup.object().shape({
          title: Yup.string().required("Le titre du quiz est requis"),
          questions: Yup.array()
            .min(1, "Au moins une question est requise")
            .of(
              Yup.object().shape({
                question: Yup.string().required("La question est requise"),
                type: Yup.string().required("Le type de question est requis"),
                correctAnswer: Yup.string().when("type", {
                  is: "multiple-choice",
                  then: (schema) => schema.notRequired(),
                  otherwise: (schema) =>
                    schema.required("La réponse correcte est requise"),
                }),
                correctAnswers: Yup.array().when("type", {
                  is: "multiple-choice",
                  then: (schema) =>
                    schema
                      .min(1, "Sélectionnez au moins une bonne réponse")
                      .required("Les réponses correctes sont requises"),
                  otherwise: (schema) => schema.notRequired(),
                }),
              })
            )
            .required("Les questions sont requises"),
        })
      ),
    }),
    onSubmit: async (values) => {
      try {
        // Log all form data to console
        console.log("=== FORM DATA SUBMITTED ===");
        console.log("Full Form Values:", values);
        console.log("\n--- French Fields ---");
        console.log("Title:", values.title);
        console.log("Description:", values.description);
        console.log("Prerequisites:", values.prerequisites);
        console.log("\n--- Arabic Fields ---");
        console.log("Title (AR):", values.title_ar);
        console.log("Description (AR):", values.description_ar);
        console.log("Prerequisites (AR):", values.prerequisites_ar);
        console.log("\n--- Course Details ---");
        console.log("Price:", values.price);
        console.log("Currency:", values.currency);
        console.log("Difficulty:", values.difficulty);
        console.log("Duration:", values.duration);
        console.log("\n--- Media ---");
        console.log("Thumbnail:", values.thumbnail);
        console.log("Videos:", values.videos);
        console.log("\n--- Content ---");
        console.log("Objectives:", values.objectives);
        console.log("PDFs:", values.pdfs);
        console.log("Quizzes:", values.quiz);
        console.log("\n--- Discount ---");
        console.log("Has Discount:", values.hasDiscount);
        console.log("Discount %:", values.discountPercentage);
        console.log("Discount Description:", values.discountDescription);
        console.log("Discount Max Students:", values.discountMaxStudents);
        console.log("=========================\n");

        Swal.fire({
          title: "Confirmer la publication",
          text: "Êtes-vous sûr de vouloir publier ce cours ?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Publier",
          cancelButtonText: "Annuler",
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280",
        }).then(async (result) => {
          if (result.isConfirmed) {
            setIsPublishing(true);

            try {
              // Prepare course data object matching backend structure EXACTLY
              const courseData = {
                // Required fields - PascalCase to match backend
                Title: values.title,
                Title_ar: values.title_ar || "",
                Description: values.description,
                Description_ar: values.description_ar || "",
                Category: "General", // You need to add a category field to your form
                Category_ar: "",
                Specialty: "",
                Specialty_ar: "",
                subCategory: "",
                subCategory_ar: "",
                shortDescription: values.description.substring(0, 100),
                shortDescription_ar: values.description_ar
                  ? values.description_ar.substring(0, 100)
                  : "",

                // Price fields
                Price: parseFloat(values.price) || 0,
                discountPrice:
                  values.hasDiscount && values.discountPercentage
                    ? parseFloat(values.price) *
                      (1 - parseFloat(values.discountPercentage) / 100)
                    : null,
                Currency: values.currency || "EUR",

                // Course details - Map French difficulty to English
                Level: (() => {
                  const difficultyMap = {
                    "Débutants": "beginner",
                    "Intermédiaires": "intermediate", 
                    "Professionnels": "advanced"
                  };
                  return difficultyMap[values.difficulty] || "beginner";
                })(),
                difficulty: (() => {
                  const difficultyMap = {
                    "Débutants": "beginner",
                    "Intermédiaires": "intermediate",
                    "Professionnels": "advanced"
                  };
                  return difficultyMap[values.difficulty] || "beginner";
                })(),
                duration: values.duration ? parseInt(values.duration) : null,
                Language: "French",
                status: "published",
                Prerequisites: values.prerequisites || "",

                // Additional fields
                objectives: values.objectives || [],
                isFeatured: false,
                certificate: false,
                videos_count: 0,
                Rate: 0,
                totalRatings: 0,
              };

              console.log("📦 Course Data Object:", courseData);

              // Prepare FormData for file uploads
              const formData = new FormData();

              // Add courseData as JSON string (REQUIRED by backend)
              formData.append("courseData", JSON.stringify(courseData));

              // Create sections structure matching backend expectations
              const sections = [];

              if (
                (values.videos && values.videos.length > 0) ||
                (values.pdfs && values.pdfs.length > 0)
              ) {
                const items = [];

                // Add videos as section items
                if (values.videos && values.videos.length > 0) {
                  values.videos.forEach((video, index) => {
                    items.push({
                      title: video.name || `Video ${index + 1}`,
                      title_ar: "",
                      type: "video",
                      description: video.description || "",
                      description_ar: "",
                      duration: video.duration || null,
                      order: items.length + 1,
                    });
                  });
                }

                // Add PDFs as section items
                if (values.pdfs && values.pdfs.length > 0) {
                  values.pdfs.forEach((pdf, index) => {
                    items.push({
                      title: pdf.title || `PDF ${index + 1}`,
                      title_ar: "",
                      type: "pdf",
                      description: pdf.description || "",
                      description_ar: "",
                      order: items.length + 1,
                    });
                  });
                }

                // Create the section with all items
                sections.push({
                  title: "Contenu du cours",
                  title_ar: "محتوى الدورة",
                  description: "Vidéos et documents du cours",
                  description_ar: "مقاطع الفيديو والمستندات الخاصة بالدورة",
                  order: 1,
                  items: items,
                });

                console.log("📑 Sections structure:", sections);
              }

              // Add sections as JSON string
              if (sections.length > 0) {
                formData.append("sections", JSON.stringify(sections));
              }

              // Add thumbnail as courseImage
              if (values.thumbnail) {
                formData.append("courseImage", values.thumbnail);
              }

              // Add video files (in same order as in sections.items)
              if (values.videos && values.videos.length > 0) {
                console.log(`📹 Adding ${values.videos.length} video files`);
                values.videos.forEach((video, index) => {
                  if (video.file) {
                    formData.append("videos", video.file);
                    console.log(`  ✅ Video ${index + 1}: ${video.file.name}`);
                  }
                });
              }

              // Add PDF files (in same order as in sections.items)
              if (values.pdfs && values.pdfs.length > 0) {
                console.log(`📄 Adding ${values.pdfs.length} PDF files`);
                values.pdfs.forEach((pdf, index) => {
                  if (pdf.file) {
                    formData.append("pdfs", pdf.file);
                    console.log(`  ✅ PDF ${index + 1}: ${pdf.file.name}`);
                  }
                });
              }

              // Debug: Log FormData contents
              console.log("📦 FormData contents being sent:");
              for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                  console.log(
                    `  ${key}: [File] ${value.name} (${(
                      value.size / 1024
                    ).toFixed(2)} KB)`
                  );
                } else if (key === "courseData" || key === "sections") {
                  console.log(`  ${key}:`, JSON.parse(value));
                } else {
                  console.log(`  ${key}:`, value);
                }
              }

              // Make API call to upload endpoint - FIXED ENDPOINT
              console.log("🚀 Sending request to backend...");
              const response = await axios.post(
                "http://localhost:3000/Admin/salah/complete-course",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                  withCredentials: true,
                  timeout: 60000, // 60 second timeout for file uploads
                }
              );

              console.log("✅ API Response:", response.data);

              showAlert(
                "success",
                "Succès",
                "Votre cours a été publié avec succès!"
              );

              setTimeout(() => {
                Navigate("/Allcourses");
              }, 1500);
            } catch (error) {
              console.error("❌ Error posting course:", error);

              let errorMessage =
                "Une erreur s'est produite lors de la publication du cours.";

              if (error.code === "ERR_NETWORK") {
                errorMessage =
                  "⚠️ Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:3000";
                console.error(
                  "🔴 Backend server not reachable at http://localhost:3000"
                );
              } else if (error.code === "ECONNABORTED") {
                errorMessage =
                  "⏱️ La requête a expiré. Le fichier est peut-être trop volumineux.";
              } else if (error.response) {
                // Server responded with error
                console.error("Server Error Response:", error.response.data);
                console.error("Status Code:", error.response.status);
                errorMessage =
                  error.response.data?.message ||
                  error.response.data?.error ||
                  `Erreur serveur: ${error.response.status}`;
              }

              showAlert("error", "Erreur", errorMessage);
            } finally {
              setIsPublishing(false);
            }
          } else {
            showAlert(
              "info",
              "Annulé",
              "La publication du cours a été annulée."
            );
            setIsPublishing(false);
          }
        });
      } catch (error) {
        console.error("Error publishing course:", error);
        showAlert(
          "error",
          "Erreur",
          "Une erreur s'est produite lors de la publication du cours."
        );
        setIsPublishing(false);
      }
    },
  });

  // Sync videos with Formik
  useEffect(() => {
    formik.setFieldValue("videos", videos);
  }, [videos]);

  // Sync objectives with Formik
  useEffect(() => {
    formik.setFieldValue("objectives", objectives);
  }, [objectives]);

  // Page loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const showAlert = (type, title, message) => {
    Swal.fire({
      icon: type,
      title: title,
      text: message,
      confirmButtonColor: "#3b82f6",

      timer: type === "success" ? 1500 : undefined,
      showConfirmButton: type !== "success",
    });
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 3000);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 max-md:p-0">
      {alert && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            alert.type === "success"
              ? "bg-green-100 text-green-800"
              : alert.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {alert.type === "success" && <CheckCircle className="w-5 h-5" />}
          {alert.type === "error" && <AlertCircle className="w-5 h-5" />}
          {alert.type === "warning" && <AlertCircle className="w-5 h-5" />}
          <div>
            <h3 className="font-semibold">{alert.title}</h3>
            <p>{alert.message}</p>
          </div>
          <button onClick={() => setAlert(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl max-md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Créer un Nouveau Cours
          </h1>
          <p className="text-lg max-md:text-sm  text-gray-600 max-w-2xl mx-auto">
            Partagez vos connaissances avec le monde entier en créant un cours
            professionnel et engageant
          </p>
        </div>

        {/* Main Content */}
        <form
          onSubmit={(e) => {
            formik.handleSubmit(e);
          }}
          encType="multipart/form-data"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Course Title and Thumbnail */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h2 className=" max-md:text-xl max-md:text-base font-bold text-gray-800">
                  Titre du Cours et Miniature
                </h2>
              </div>

              <FormInput
                label="Titre du Cours * (Français)"
                value={formik.values.title}
                onChange={formik.handleChange}
                name="title"
                placeholder="Entrez le titre de votre cours"
                className="mb-6  max-md:text-base "
                error={formik.touched.title && formik.errors.title}
              />

              <FormInput
                label="عنوان الدورة (العربية - اختياري)"
                value={formik.values.title_ar}
                onChange={formik.handleChange}
                name="title_ar"
                placeholder="أدخل عنوان الدورة بالعربية"
                className="mb-6  max-md:text-base "
              />

              <div>
                <label className="block text-xl   max-md:text-base font-semibold text-gray-800 mb-3">
                  Miniature du Cours
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={modifiedHandleThumbnailUpload(
                      setThumbnail,
                      formik.setFieldValue,
                      showAlert
                    )}
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
                  {formik.touched.thumbnail && formik.errors.thumbnail && (
                    <p className="text-red-500 text-sm mt-2">
                      {formik.errors.thumbnail}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <VideoSection
              videos={videos}
              newVideo={newVideo}
              setNewVideo={setNewVideo}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              handleVideoFileSelect={handleVideoFileSelect(
                newVideo,
                setNewVideo,
                showAlert
              )}
              handleVideoUpload={() =>
                handleVideoUpload(
                  newVideo,
                  setNewVideo,
                  setVideos,
                  videos,
                  setIsUploading,
                  setUploadProgress,
                  showAlert
                )
              }
              handleEditVideo={handleEditVideo(videos, setVideos, showAlert)}
              handleDeleteVideo={handleDeleteVideo(
                videos,
                setVideos,
                showAlert
              )}
            />

            {/* Course Details */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className=" max-md:text-xl font-bold text-gray-800">
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
                    label="Description du Cours * (Français)"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    name="description"
                    placeholder="Décrivez votre cours en détail"
                    multiline={true}
                    error={
                      formik.touched.description && formik.errors.description
                    }
                  />

                  <FormInput
                    label="وصف الدورة (العربية - اختياري)"
                    value={formik.values.description_ar}
                    onChange={formik.handleChange}
                    name="description_ar"
                    placeholder="صف الدورة بالتفصيل"
                    multiline={true}
                  />

                  <FormInput
                    label="Prérequis (Français)"
                    value={formik.values.prerequisites}
                    onChange={formik.handleChange}
                    name="prerequisites"
                    placeholder="Quels sont les prérequis pour ce cours?"
                    multiline={true}
                  />

                  <FormInput
                    label="المتطلبات المسبقة (العربية - اختياري)"
                    value={formik.values.prerequisites_ar}
                    onChange={formik.handleChange}
                    name="prerequisites_ar"
                    placeholder="ما هي المتطلبات المسبقة لهذه الدورة؟"
                    multiline={true}
                  />
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
                    <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      Prix du Cours *
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formik.values.price}
                          onChange={formik.handleChange}
                          name="price"
                          placeholder="0.00"
                          className={`w-full pl-4 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-lg bg-white shadow-sm ${
                            formik.touched.price && formik.errors.price
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-blue-300 hover:border-blue-400"
                          }`}
                        />
                      </div>
                      <select
                        value={formik.values.currency}
                        onChange={formik.handleChange}
                        name="currency"
                        className="px-5 py-3.5 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-blue-400 font-semibold text-gray-700 shadow-sm cursor-pointer"
                      >
                        <option value="EUR">€ EUR</option>
                        <option value="DZD">DA DZD</option>
                      </select>
                    </div>
                    {formik.touched.price && formik.errors.price && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1 font-medium">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formik.errors.price}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      💡 Laissez vide pour un cours gratuit
                    </p>
                  </div>

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
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    {formik.touched.difficulty && formik.errors.difficulty && (
                      <p className="text-red-500 text-sm mt-2">
                        {formik.errors.difficulty}
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

            {/* Learning Objectives */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className=" max-md:text-xl font-bold text-gray-800">
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
                    onClick={handleAddObjective(
                      newObjective,
                      setObjectives,
                      objectives,
                      setNewObjective,
                      showAlert
                    )}
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
                          type="button"
                          onClick={handleSaveObjective(
                            editingText,
                            editingObjective,
                            objectives,
                            setObjectives,
                            setEditingObjective,
                            setEditingText,
                            showAlert
                          )}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit(
                            setEditingObjective,
                            setEditingText
                          )}
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
                            type="button"
                            onClick={() =>
                              handleEditObjective(
                                setEditingObjective,
                                setEditingText,
                                objectives
                              )(index)
                            }
                            className="text-blue-600 hover:underline"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveObjective(
                                objectives,
                                setObjectives,
                                showAlert
                              )(index)
                            }
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
                <h2 className=" max-md:text-xl font-bold text-gray-800">
                  Réduction
                </h2>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="checkbox"
                    checked={formik.values.hasDiscount}
                    onChange={handleDiscountToggle(
                      formik.values,
                      formik.setFieldValue
                    )}
                    className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    name="hasDiscount"
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    Activer une réduction
                  </span>
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
                    />
                  </div>
                )}
              </div>
            </section>

            <AddPDFs
              courseId={formik.values.courseId}
              formik={formik}
              showAlert={showAlert}
            />
            <AddQuiz
              courseId={formik.values.courseId}
              formik={formik}
              showAlert={showAlert}
            />

            {/* Publish Button */}
            <div className="text-center mt-8">
              <button
                type="submit"
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
        </form>
      </div>
    </div>
  );
}
