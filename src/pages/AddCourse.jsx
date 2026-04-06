import apiClient from "../utils/apiClient";
import { useFormik } from "formik";
import {
  ArrowLeft,
  Loader2,
  PlayCircle,
  Plus,
  Save,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import {
  ValidationErrorPanel,
  ValidationSuccessBanner,
} from "../components/Common/FormValidation";
import { useFormValidation } from "../components/Common/FormValidation/useFormValidation";
import RichTextEditor from "../components/Common/RichTextEditor/RichTextEditor";
import {
  handleNumericInput,
  handleNumericPaste,
} from "../utils/numericInputHandler";
import CourseZipUploader from "../components/Courses/CourseZipUploader";

export default function AddCourse() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [objectives, setObjectives] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [introVideoFile, setIntroVideoFile] = useState(null);
  const [introVideoPreview, setIntroVideoPreview] = useState(null);
  const [zipCourseId, setZipCourseId] = useState(null);

  const navigate = useNavigate();

  const {
    errors: validationErrors,
    warnings: validationWarnings,
    showPanel: showValidationPanel,
    showSuccess: showValidationSuccess,
    validate: runValidation,
    hidePanel: hideValidationPanel,
  } = useFormValidation();

  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
  const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

  const handleIntroVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (
      !ALLOWED_VIDEO_TYPES.includes(file.type) ||
      !ALLOWED_VIDEO_EXTENSIONS.includes(ext)
    ) {
      toast.error(`Format non supporté "${ext}". Utilisez MP4, WebM ou MOV.`);
      e.target.value = "";
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("La vidéo ne doit pas dépasser 100MB.");
      e.target.value = "";
      return;
    }
    setIntroVideoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setIntroVideoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux. Max 10MB");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Seuls JPEG, PNG et WebP sont autorisés");
      return;
    }
    setImageFile(file);
    toast.success("Image sélectionnée !");
  };

  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux. Max 10MB");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Seuls JPEG, PNG et WebP sont autorisés");
      return;
    }
    setCoverImageFile(file);
    toast.success("Image de couverture sélectionnée !");
  };

  const difficulties = [
    { value: "beginner", label: "Débutant" },
    { value: "intermediate", label: "Intermédiaire" },
    { value: "advanced", label: "Avancé" },
    { value: "expert", label: "Expert" },
  ];

  const languages = [
    { value: "French", label: "Français" },
    { value: "Arabic", label: "العربية" },
    { value: "English", label: "English" },
  ];

  const addObjective = () => {
    const newObjectives = [...objectives, ""];
    setObjectives(newObjectives);
    formik.setFieldValue("objectives", newObjectives);
  };

  const updateObjective = (index, value) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
    formik.setFieldValue("objectives", newObjectives);
  };

  const removeObjective = (index) => {
    const newObjectives = objectives.filter((_, i) => i !== index);
    setObjectives(newObjectives);
    formik.setFieldValue("objectives", newObjectives);
  };

  const validateFormWithToast = () => {
    const rules = [
      {
        field: "Titre français",
        message:
          !formik.values.Title || formik.values.Title.trim().length === 0
            ? "Le titre français est requis"
            : "Le titre doit contenir au moins 3 caractères",
        section: "Informations en Français",
        scrollToId: "course-title",
        type: "error",
        condition: () =>
          !formik.values.Title || formik.values.Title.trim().length < 3,
      },
      {
        field: "Description",
        message: "La description doit contenir au moins 10 caractères",
        section: "Informations en Français",
        scrollToId: "course-description",
        type: "error",
        condition: () => {
          if (!formik.values.Description) return true;
          return (
            formik.values.Description.replace(/<[^>]*>/g, "").trim().length < 10
          );
        },
      },
      {
        field: "Catégorie",
        message: "La catégorie est requise",
        section: "Informations en Français",
        scrollToId: "course-category",
        type: "error",
        condition: () =>
          !formik.values.Category || formik.values.Category.trim().length === 0,
      },
      {
        field: "Prix",
        message: "Le prix doit être positif ou 0 pour un cours gratuit",
        section: "Détails du Cours",
        scrollToId: "course-price",
        type: "error",
        condition: () =>
          formik.values.Price !== "" &&
          formik.values.Price !== null &&
          parseFloat(formik.values.Price) < 0,
      },
      {
        field: "Prix réduit",
        message: "Le prix réduit doit être inférieur au prix normal",
        section: "Détails du Cours",
        scrollToId: "course-discount-price",
        type: "error",
        condition: () =>
          formik.values.discountPrice &&
          formik.values.Price &&
          parseFloat(formik.values.discountPrice) >=
            parseFloat(formik.values.Price),
      },
      {
        field: "Prix réduit",
        message: "Vous ne pouvez pas avoir un prix réduit sans prix principal",
        section: "Détails du Cours",
        scrollToId: "course-discount-price",
        type: "error",
        condition: () =>
          formik.values.discountPrice &&
          (!formik.values.Price || parseFloat(formik.values.Price) === 0),
      },
    ];

    return runValidation(rules);
  };

  const formik = useFormik({
    initialValues: {
      // Course type
      uploadType: "normal",

      // French fields
      Title: "",
      Description: "",
      Category: "",
      Prerequisites: "",
      Specialty: "",
      subCategory: "",
      shortDescription: "",

      // Arabic fields
      Title_ar: "",
      Description_ar: "",
      Category_ar: "",
      Specialty_ar: "",
      subCategory_ar: "",
      shortDescription_ar: "",

      // Course details
      Price: "",
      discountPrice: "",
      Currency: "DZD",
      Level: "beginner",
      difficulty: "beginner",
      duration: "",
      Language: "French",
      status: "draft",
      objectives: [],
      isFeatured: false,
      certificate: false,
      quiz: [],
      pdfs: [],
    },
    validationSchema: Yup.object({
      uploadType: Yup.string()
        .oneOf(["normal", "zip"])
        .required("Le type de cours est requis"),
      Title: Yup.string()
        .required("Le titre français est requis")
        .min(3, "Le titre doit contenir au moins 3 caractères"),
      Description: Yup.string()
        .required("La description française est requise")
        .test(
          "min-length",
          "La description doit contenir au moins 10 caractères",
          function (value) {
            if (!value) return false;
            return value.replace(/<[^>]*>/g, "").trim().length >= 10;
          },
        ),
      Category: Yup.string().required("La catégorie est requise"),
      Price: Yup.number()
        .nullable()
        .test(
          "min-price",
          "Le prix doit être positif ou 0 pour un cours gratuit",
          function (value) {
            if (value === null || value === undefined || value === "")
              return true;
            return value >= 0;
          },
        ),
      discountPrice: Yup.number()
        .nullable()
        .test(
          "discount-validation",
          "Le prix réduit doit être inférieur au prix normal",
          function (value) {
            if (!value) return true;
            const price = this.parent.Price;
            if (!price || parseFloat(price) === 0) {
              return this.createError({
                message:
                  "Vous ne pouvez pas avoir un prix réduit sans prix principal",
              });
            }
            return parseFloat(value) < parseFloat(price);
          },
        ),
    }),
    onSubmit: async (values) => {
      if (!validateFormWithToast()) return;

      const confirmed = await Swal.fire({
        title: "Confirmer la création",
        text: "Êtes-vous sûr de vouloir créer ce cours ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Créer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#7c3aed",
        cancelButtonColor: "#6b7280",
      });

      if (!confirmed.isConfirmed) return;

      setIsPublishing(true);
      const loadingToast = toast.loading("Création du cours en cours...", {
        style: {
          background: "#eff6ff",
          color: "#2563eb",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });

      try {
        const courseData = {
          Title: values.Title,
          Title_ar: values.Title_ar || "",
          Description: values.Description,
          Description_ar: values.Description_ar || "",
          Category: values.Category,
          Category_ar: values.Category_ar || "",
          Specialty: values.Specialty || "",
          Specialty_ar: values.Specialty_ar || "",
          subCategory: values.subCategory || "",
          subCategory_ar: values.subCategory_ar || "",
          shortDescription:
            values.shortDescription ||
            values.Description.replace(/<[^>]*>/g, "").substring(0, 255),
          shortDescription_ar: values.shortDescription_ar || "",
          Price: parseFloat(values.Price) || 0,
          discountPrice: values.discountPrice
            ? parseFloat(values.discountPrice)
            : null,
          Currency: "DZD",
          Level: values.Level,
          difficulty: values.difficulty,
          duration: values.duration ? values.duration : null,
          Language: values.Language,
          status: values.status,
          Prerequisites: values.Prerequisites || "",
          objectives: values.objectives || [],
          isFeatured: values.isFeatured,
          certificate: values.certificate,
          videos_count: 0,
          Rate: 0,
          totalRatings: 0,
          uploadType: values.uploadType,
        };

        const formData = new FormData();
        formData.append("courseData", JSON.stringify(courseData));

        if (imageFile) {
          formData.append("courseImage", imageFile);
        }
        if (coverImageFile) {
          formData.append("coverImage", coverImageFile);
        }

        const response = await apiClient.post(
          "/Admin/Courses/complete-course",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 60000,
          },
        );

        const newCourseId = response.data?.course?.id || response.data?.id;
        if (introVideoFile && newCourseId) {
          try {
            const videoFormData = new FormData();
            videoFormData.append("video", introVideoFile);
            await apiClient.post(
              `/Admin/upload/Courses/${newCourseId}/IntroVideo`,
              videoFormData,
              { headers: { "Content-Type": "multipart/form-data" } },
            );
          } catch (videoError) {}
        }

        toast.dismiss(loadingToast);
        toast.success("Cours créé avec succès !");
        setTimeout(() => navigate("/Courses"), 1200);
      } catch (error) {
        toast.dismiss(loadingToast);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Une erreur s'est produite lors de la création du cours.";
        toast.error(errorMessage);
      } finally {
        setIsPublishing(false);
      }
    },
  });

  return (
    <>
      <Toaster position="top-right" />
      <ValidationErrorPanel
        errors={validationErrors}
        warnings={validationWarnings}
        isVisible={showValidationPanel}
        onClose={hideValidationPanel}
        title="Champs requis manquants"
      />
      <ValidationSuccessBanner isVisible={showValidationSuccess} />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 max-md:p-3">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/Courses")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200 hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Retour</span>
            </button>
            <div>
              <h1 className="text-3xl max-md:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Créer un Nouveau Cours
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Remplissez les informations ci-dessous pour créer votre cours
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* ============================
                COURSE TYPE SELECTOR
               ============================ */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V3a2 2 0 00-2-2h0a2 2 0 00-2 2v2H9m0 0a2 2 0 002 2h2a2 2 0 002-2m-6 4h12"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Type de Cours
                  </h2>
                  <p className="text-sm text-gray-600">
                    Choisissez entre un cours manuel ou un cours basé sur un ZIP
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Normal Course Option */}
                <div
                  onClick={() => formik.setFieldValue("uploadType", "normal")}
                  className={`relative cursor-pointer group transition-all duration-300 rounded-xl p-6 border-2 ${
                    formik.values.uploadType === "normal"
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg transform scale-105"
                      : "border-gray-200 bg-white hover:shadow-md hover:border-blue-300"
                  }`}
                >
                  {formik.values.uploadType === "normal" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg transition-all duration-300 ${
                        formik.values.uploadType === "normal"
                          ? "scale-110"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4
                        className={`font-semibold transition-colors duration-200 text-lg ${
                          formik.values.uploadType === "normal"
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        Cours Manuel
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Gérez les sections et vidéos manuellement
                      </p>
                    </div>
                  </div>
                </div>

                {/* ZIP Course Option */}
                <div
                  onClick={() => formik.setFieldValue("uploadType", "zip")}
                  className={`relative cursor-pointer group transition-all duration-300 rounded-xl p-6 border-2 ${
                    formik.values.uploadType === "zip"
                      ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg transform scale-105"
                      : "border-gray-200 bg-white hover:shadow-md hover:border-purple-300"
                  }`}
                >
                  {formik.values.uploadType === "zip" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg transition-all duration-300 ${
                        formik.values.uploadType === "zip"
                          ? "scale-110"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4
                        className={`font-semibold transition-colors duration-200 text-lg ${
                          formik.values.uploadType === "zip"
                            ? "text-purple-700"
                            : "text-gray-700"
                        }`}
                      >
                        Cours ZIP
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Uploadez une archive ZIP avec tous les fichiers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ZIP Course Uploader - Only show when uploadType is "zip" */}
            {formik.values.uploadType === "zip" && (
              <CourseZipUploader
                onCourseCreated={(courseId) => setZipCourseId(courseId)}
                courseTitle={formik.values.Title}
              />
            )}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">FR</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Informations en Français
                  </h2>
                  <p className="text-sm text-gray-500">
                    Renseignez les informations principales du cours en français
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Title FR */}
                <div
                  id="course-title"
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Titre du cours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Title")}
                    className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                      formik.touched.Title && formik.errors.Title
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
                    }`}
                    placeholder="Entrez le titre du cours en français"
                  />
                  {formik.touched.Title && formik.errors.Title && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
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
                      {formik.errors.Title}
                    </p>
                  )}
                </div>

                {/* Description FR */}
                <div
                  id="course-description"
                  className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-violet-800 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-white rounded-lg border border-violet-200 overflow-hidden">
                    <RichTextEditor
                      value={formik.values.Description}
                      onChange={(content) =>
                        formik.setFieldValue("Description", content)
                      }
                      placeholder="Décrivez votre cours en détail avec formatage..."
                      height="250px"
                    />
                  </div>
                  {formik.touched.Description && formik.errors.Description && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
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
                      {formik.errors.Description}
                    </p>
                  )}
                </div>

                {/* Category FR */}
                <div
                  id="course-category"
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-emerald-800 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Category")}
                    className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                      formik.touched.Category && formik.errors.Category
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-emerald-300"
                    }`}
                    placeholder="Ex: Informatique, Design, Marketing..."
                  />
                  {formik.touched.Category && formik.errors.Category && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
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
                      {formik.errors.Category}
                    </p>
                  )}
                </div>

                {/* Specialty FR */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-purple-800 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Spécialité{" "}
                    <span className="text-gray-400 text-xs font-normal">
                      (optionnel)
                    </span>
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Specialty")}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-300"
                    placeholder="Ex: React, Data Science, Marketing Digital..."
                  />
                </div>

                {/* Sub-Category FR */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    Sous-catégorie{" "}
                    <span className="text-gray-400 text-xs font-normal">
                      (optionnel)
                    </span>
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("subCategory")}
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-100 hover:border-amber-300"
                    placeholder="Ex: Développement web, Design UI, SEO..."
                  />
                </div>

                {/* Short Description FR */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-rose-800 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Description courte{" "}
                    <span className="text-gray-400 text-xs font-normal">
                      (max 255 caractères — optionnel)
                    </span>
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("shortDescription")}
                    className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm focus:border-rose-500 focus:ring-4 focus:ring-rose-100 hover:border-rose-300"
                    placeholder="Résumé court du cours affiché dans les listes"
                    maxLength={255}
                  />
                  <p className="text-rose-500 text-xs mt-1 text-right">
                    {formik.values.shortDescription.length}/255
                  </p>
                </div>
              </div>
            </div>

            {/* ============================
                ARABIC INFORMATION SECTION
               ============================ */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">AR</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    المعلومات باللغة العربية
                  </h2>
                  <p className="text-sm text-gray-500">
                    جميع الحقول اختيارية — أضف المحتوى العربي إذا توفّر
                  </p>
                </div>
              </div>

              <div className="space-y-4" dir="rtl">
                {/* Title AR */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Title_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل عنوان الدورة بالعربية"
                  />
                </div>

                {/* Description AR */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <div className="bg-white rounded-lg border border-violet-200 overflow-hidden">
                    <RichTextEditor
                      value={formik.values.Description_ar}
                      onChange={(content) =>
                        formik.setFieldValue("Description_ar", content)
                      }
                      placeholder="اوصف الدورة بالتفصيل مع التنسيق..."
                      height="200px"
                      className="rtl-editor"
                    />
                  </div>
                </div>

                {/* Category AR */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Category_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: الحاسوب، التصميم..."
                  />
                </div>

                {/* Specialty AR */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التخصص
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Specialty_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: ريأكت، علوم البيانات، التسويق..."
                  />
                </div>

                {/* Sub-Category AR */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة الفرعية
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("subCategory_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: تطوير الويب، تصميم واجهات..."
                  />
                </div>

                {/* Short Description AR */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف المختصر
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("shortDescription_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ملخص قصير للدورة (255 حرف كحد أقصى)"
                    maxLength={255}
                  />
                </div>
              </div>
            </div>

            {/* ============================
                COURSE STATUS SECTION
               ============================ */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Statut du cours
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sélectionnez le statut initial de votre cours
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    value: "draft",
                    label: "Brouillon",
                    description: "Cours en cours de création",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    ),
                    bgColor: "from-gray-400 to-gray-500",
                    bgLight: "bg-gray-50",
                    borderColor: "border-gray-200",
                    borderActiveColor: "border-gray-500",
                    textColor: "text-gray-600",
                  },
                  {
                    value: "published",
                    label: "Publié",
                    description: "Visible par les étudiants",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    bgColor: "from-green-400 to-emerald-500",
                    bgLight: "bg-green-50",
                    borderColor: "border-green-200",
                    borderActiveColor: "border-green-500",
                    textColor: "text-green-600",
                  },
                  {
                    value: "archived",
                    label: "Archivé",
                    description: "Masqué temporairement",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 8l4 4 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    bgColor: "from-amber-400 to-orange-500",
                    bgLight: "bg-amber-50",
                    borderColor: "border-amber-200",
                    borderActiveColor: "border-amber-500",
                    textColor: "text-amber-600",
                  },
                ].map((status) => (
                  <div
                    key={status.value}
                    onClick={() => formik.setFieldValue("status", status.value)}
                    className={`relative cursor-pointer group transition-all duration-300 ${
                      formik.values.status === status.value
                        ? `${status.bgLight} ${status.borderActiveColor} border-2 shadow-lg transform scale-105`
                        : `bg-white ${status.borderColor} border hover:shadow-md hover:scale-102`
                    } rounded-xl p-6 flex flex-col items-center text-center space-y-3`}
                  >
                    {formik.values.status === status.value && (
                      <div
                        className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${status.bgColor} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                        status.bgColor
                      } flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                        formik.values.status === status.value
                          ? "scale-110"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <div className="text-white">{status.icon}</div>
                    </div>
                    <div>
                      <h4
                        className={`font-semibold transition-colors duration-200 ${
                          formik.values.status === status.value
                            ? status.textColor
                            : "text-gray-700"
                        }`}
                      >
                        {status.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {status.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================
                IMAGES SECTION
               ============================ */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Images du Cours
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Principale (Miniature)
                  </label>
                  <input
                    type="file"
                    id="course-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() =>
                      document.getElementById("course-image-upload").click()
                    }
                  >
                    {imageFile ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Cliquez pour sélectionner une Image
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, WebP jusqu&apos;à 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Image */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de Couverture{" "}
                    <span className="text-gray-400 text-xs">(optionnel)</span>
                  </label>
                  <input
                    type="file"
                    id="cover-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                  <div
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() =>
                      document.getElementById("cover-image-upload").click()
                    }
                  >
                    {coverImageFile ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(coverImageFile)}
                          alt="Cover preview"
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImageFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Cliquez pour sélectionner une Image de couverture
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, WebP jusqu&apos;à 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div> */}
              </div>
            </div>

            {/* ============================
                INTRO VIDEO SECTION
               ============================ */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Vidéo d&apos;introduction{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (optionnel)
                </span>
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Vidéo de présentation visible par tous les visiteurs sur la page
                du cours.
              </p>

              {introVideoPreview ? (
                <div className="relative">
                  <video
                    src={introVideoPreview}
                    controls
                    className="w-full rounded-xl border border-gray-200"
                    style={{ maxHeight: "320px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIntroVideoFile(null);
                      setIntroVideoPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-2 text-sm text-amber-600 font-medium">
                    ✓ Vidéo sélectionnée — sera uploadée avec le cours
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors cursor-pointer"
                  onClick={() =>
                    document.getElementById("intro-video-upload").click()
                  }
                >
                  <PlayCircle className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Cliquez pour sélectionner une vidéo d&apos;introduction
                  </p>
                  <input
                    type="file"
                    id="intro-video-upload"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={handleIntroVideoSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="intro-video-upload"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Sélectionner une vidéo
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    MP4, WebM, MOV jusqu&apos;à 100MB
                  </p>
                </div>
              )}
            </div>

            {/* ============================
                COURSE DETAILS SECTION
               ============================ */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Détails du Cours
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price + Discount column */}
                <div className="space-y-4">
                  {/* Price */}
                  <div
                    id="course-price"
                    className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-green-800 mb-2">
                      <svg
                        className="w-4 h-4"
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
                      Prix (DZD){" "}
                      <span className="text-gray-500 text-xs">
                        (vide = gratuit)
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        step="0.01"
                        {...formik.getFieldProps("Price")}
                        onChange={(e) => {
                          const value = e.target.value;
                          const sanitized = value.replace(/[^0-9.]/g, "");
                          const parts = sanitized.split(".");
                          const finalValue =
                            parts.length > 2
                              ? parts[0] + "." + parts.slice(1).join("")
                              : sanitized;
                          formik.setFieldValue("Price", finalValue);
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = (
                            e.clipboardData || window.clipboardData
                          ).getData("text");
                          const sanitized = pastedText.replace(/[^0-9.]/g, "");
                          const parts = sanitized.split(".");
                          const finalValue =
                            parts.length > 2
                              ? parts[0] + "." + parts.slice(1).join("")
                              : sanitized;
                          formik.setFieldValue("Price", finalValue);
                        }}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all ${
                          formik.touched.Price && formik.errors.Price
                            ? "border-red-500"
                            : "border-green-300"
                        }`}
                        placeholder="0.00"
                      />
                      {/* <div className="w-24 px-3 py-3 border rounded-lg bg-gray-50 text-gray-700 font-medium shadow-sm text-sm text-center">
                        🇩🇿 DZD
                      </div> */}
                    </div>
                    {formik.touched.Price && formik.errors.Price && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
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
                        {formik.errors.Price}
                      </p>
                    )}
                  </div>

                  {/* Discount Price */}
                  <div
                    id="course-discount-price"
                    className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200"
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-orange-800 mb-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Prix réduit (DZD)
                      {(!formik.values.Price ||
                        parseFloat(formik.values.Price) === 0) && (
                        <span className="text-gray-500 text-xs ml-1">
                          (nécessite un prix principal)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      step="0.01"
                      disabled={
                        !formik.values.Price ||
                        parseFloat(formik.values.Price) === 0
                      }
                      {...formik.getFieldProps("discountPrice")}
                      onChange={(e) => {
                        const value = e.target.value;
                        const sanitized = value.replace(/[^0-9.]/g, "");
                        const parts = sanitized.split(".");
                        const finalValue =
                          parts.length > 2
                            ? parts[0] + "." + parts.slice(1).join("")
                            : sanitized;
                        formik.setFieldValue("discountPrice", finalValue);
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = (
                          e.clipboardData || window.clipboardData
                        ).getData("text");
                        const sanitized = pastedText.replace(/[^0-9.]/g, "");
                        const parts = sanitized.split(".");
                        const finalValue =
                          parts.length > 2
                            ? parts[0] + "." + parts.slice(1).join("")
                            : sanitized;
                        formik.setFieldValue("discountPrice", finalValue);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm transition-all ${
                        !formik.values.Price ||
                        parseFloat(formik.values.Price) === 0
                          ? "bg-gray-100 cursor-not-allowed opacity-60"
                          : formik.touched.discountPrice &&
                              formik.errors.discountPrice
                            ? "border-red-500"
                            : "border-orange-300"
                      }`}
                      placeholder="Prix en promotion"
                    />
                    {formik.touched.discountPrice &&
                      formik.errors.discountPrice && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
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
                          {formik.errors.discountPrice}
                        </p>
                      )}
                  </div>
                </div>

                {/* Duration + Level column */}
                <div className="space-y-4">
                  {/* Duration */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <label className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Durée (heures)
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps("duration")}
                      onChange={(e) => {
                        const value = e.target.value;
                        const sanitized = value.replace(/[^0-9.]/g, "");
                        const parts = sanitized.split(".");
                        const finalValue =
                          parts.length > 2
                            ? parts[0] + "." + parts.slice(1).join("")
                            : sanitized;
                        formik.setFieldValue("duration", finalValue);
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = (
                          e.clipboardData || window.clipboardData
                        ).getData("text");
                        const sanitized = pastedText.replace(/[^0-9.]/g, "");
                        const parts = sanitized.split(".");
                        const finalValue =
                          parts.length > 2
                            ? parts[0] + "." + parts.slice(1).join("")
                            : sanitized;
                        formik.setFieldValue("duration", finalValue);
                      }}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                      placeholder="ex: 10"
                    />
                  </div>

                  {/* Level */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                    <label className="flex items-center gap-2 text-sm font-medium text-purple-800 mb-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Niveau
                    </label>
                    <select
                      {...formik.getFieldProps("Level")}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldValue("difficulty", e.target.value);
                      }}
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all"
                    >
                      {difficulties.map((diff) => (
                        <option key={diff.value} value={diff.value}>
                          {diff.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================
                COURSE OPTIONS SECTION
               ============================ */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Options du cours
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configurez les paramètres avancés du cours
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl border border-cyan-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-cyan-800 mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                    Langue du cours
                  </label>
                  <select
                    {...formik.getFieldProps("Language")}
                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 hover:border-cyan-300"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Featured Status */}
                <div
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    formik.values.isFeatured
                      ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg transform scale-105"
                      : "border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50"
                  }`}
                  onClick={() =>
                    formik.setFieldValue(
                      "isFeatured",
                      !formik.values.isFeatured,
                    )
                  }
                >
                  {/* Selection Indicator */}
                  {formik.values.isFeatured && (
                    <div className="absolute top-2 right-5 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                          formik.values.isFeatured
                            ? "from-yellow-400 to-orange-500 shadow-lg scale-110"
                            : "from-gray-300 to-gray-400 group-hover:from-yellow-400 group-hover:to-orange-500"
                        } flex items-center justify-center transition-all duration-300`}
                      >
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.519 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Cours vedette
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mettre en avant ce cours sur la page d&apos;accueil
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate toggle */}
                <div className="md:col-span-2">
                  <div
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      formik.values.certificate
                        ? "border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg transform scale-105"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      formik.setFieldValue(
                        "certificate",
                        !formik.values.certificate,
                      )
                    }
                  >
                    {/* Selection Indicator */}
                    {formik.values.certificate && (
                      <div className="absolute top-2 right-5 w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                            formik.values.certificate
                              ? "from-blue-400 to-cyan-500 shadow-lg scale-110"
                              : "from-gray-300 to-gray-400 group-hover:from-blue-400 group-hover:to-cyan-500"
                          } flex items-center justify-center transition-all duration-300`}
                        >
                          <svg
                            className="w-7 h-7 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            Certificat disponible
                          </h4>
                          <p className="text-sm text-gray-600">
                            Les étudiants recevront un certificat de complétion
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================
                PREREQUISITES SECTION
               ============================ */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h.01M7 12h.01M7 17h.01M17 7h.01M17 12h.01M17 17h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Prérequis du cours
                  </h3>
                  <p className="text-sm text-gray-600">
                    Définissez les connaissances préalables requises
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
                <label className="flex items-center gap-2 text-sm font-medium text-rose-800 mb-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h.01M7 12h.01M7 17h.01M17 7h.01M17 12h.01M17 17h.01"
                    />
                  </svg>
                  Prérequis{" "}
                  <span className="text-gray-400 text-xs font-normal">
                    (optionnel)
                  </span>
                </label>
                <div className="bg-white rounded-lg border border-rose-200 overflow-hidden">
                  <RichTextEditor
                    value={formik.values.Prerequisites}
                    onChange={(content) =>
                      formik.setFieldValue("Prerequisites", content)
                    }
                    placeholder="Expliquez les prérequis du cours (connaissances préalables, outils nécessaires, etc.)"
                    height="150px"
                  />
                </div>
                <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Utilisez l&apos;éditeur de texte enrichi pour une meilleure
                  mise en forme
                </p>
              </div>
            </div>

            {/* ============================
                OBJECTIVES SECTION
               ============================ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                Objectifs d&apos;apprentissage
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <label className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Définissez ce que les étudiants apprendront
                </label>

                <div className="space-y-3">
                  {objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) =>
                            updateObjective(index, e.target.value)
                          }
                          placeholder={`Objectif ${index + 1}...`}
                          className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        title="Supprimer cet objectif"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addObjective}
                    className="w-full py-3 px-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Ajouter un objectif
                  </button>
                </div>

                <p className="text-blue-600 text-sm mt-3 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Définissez des objectifs clairs et mesurables pour guider
                  l&apos;apprentissage
                </p>
              </div>
            </div>

            {/* ============================
                ACTION BUTTONS
               ============================ */}
            <div className="flex gap-4 justify-end items-center pb-6">
              {validationErrors.length > 0 && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 font-medium">
                  {validationErrors.length} erreur
                  {validationErrors.length > 1 ? "s" : ""} — voir le panneau
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate("/Courses")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <div className="relative inline-flex">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className={`px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    validationErrors.length > 0
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600"
                  }`}
                >
                  {isPublishing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isPublishing ? "Création en cours..." : "Créer le Cours"}
                </button>
                {validationErrors.length > 0 && !isPublishing && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 border-2 border-white text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                    {validationErrors.length > 9
                      ? "9+"
                      : validationErrors.length}
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
