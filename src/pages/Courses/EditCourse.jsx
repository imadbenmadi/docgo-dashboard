import { useFormik } from "formik";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { coursesAPI } from "../../API/Courses";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";

const EditCourse = () => {
  const { courseId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseNotFound, setCourseNotFound] = useState(false);
  const [objectives, setObjectives] = useState([]);

  // Video and PDF states
  const [existingVideos, setExistingVideos] = useState([]);
  const [existingPdfs, setExistingPdfs] = useState([]);
  const [deletingVideo, setDeletingVideo] = useState(null);

  // Image management - simple variable to store selected file
  const [imageFile, setImageFile] = useState(null);
  const [currentCourseImage, setCurrentCourseImage] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  // Custom validation function with toast notifications
  const validateFormWithToast = () => {
    const errors = [];

    // Title validation
    if (!formik.values.Title || formik.values.Title.trim().length === 0) {
      errors.push("Le titre français est requis");
    } else if (formik.values.Title.trim().length < 3) {
      errors.push("Le titre doit contenir au moins 3 caractères");
    }

    // Description validation
    if (
      !formik.values.Description ||
      formik.values.Description.trim().length === 0
    ) {
      errors.push("La description française est requise");
    } else {
      const textContent = formik.values.Description.replace(
        /<[^>]*>/g,
        ""
      ).trim();
      if (textContent.length < 10) {
        errors.push(
          "La description doit contenir au moins 10 caractères de texte"
        );
      }
    }

    // Category validation
    if (!formik.values.Category || formik.values.Category.trim().length === 0) {
      errors.push("La catégorie est requise");
    }

    // Price validation - optional but must be >= 0 if provided
    if (
      formik.values.Price !== "" &&
      formik.values.Price !== null &&
      formik.values.Price !== undefined &&
      parseFloat(formik.values.Price) < 0
    ) {
      errors.push("Le prix doit être positif ou 0 pour un cours gratuit");
    }

    // Discount price validation - only if main price is set and > 0
    if (
      formik.values.discountPrice &&
      formik.values.Price &&
      parseFloat(formik.values.discountPrice) >= parseFloat(formik.values.Price)
    ) {
      errors.push("Le prix réduit doit être inférieur au prix normal");
    }

    // Discount price validation - can't have discount without main price
    if (
      formik.values.discountPrice &&
      (!formik.values.Price || parseFloat(formik.values.Price) === 0)
    ) {
      errors.push(
        "Vous ne pouvez pas avoir un prix réduit sans prix principal"
      );
    }

    // Show toast notifications for errors
    if (errors.length > 0) {
      errors.forEach((error, index) => {
        setTimeout(() => {
          toast.error(error, {
            duration: 4000,
            position: "top-right",
            style: {
              background: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
            icon: "⚠️",
          });
        }, index * 200); // Stagger the toasts
      });
      return false;
    }

    // Show success toast
    toast.success("Validation réussie ! 🎉", {
      duration: 2000,
      position: "top-right",
      style: {
        background: "#dcfce7",
        color: "#16a34a",
        border: "1px solid #86efac",
        borderRadius: "12px",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      icon: "✅",
    });

    return true;
  };

  const formik = useFormik({
    initialValues: {
      // French fields
      Title: "",
      Description: "",
      Category: "",
      Prerequisites: "",

      // Arabic fields
      Title_ar: "",
      Description_ar: "",
      Category_ar: "",

      // Course details
      Price: "",
      discountPrice: "",
      Currency: "EUR",
      Level: "beginner",
      difficulty: "beginner",
      duration: "",
      Language: "French",
      status: "published",
      objectives: [],
      isFeatured: false,
      certificate: false,
    },
    validationSchema: Yup.object({
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
            // Strip HTML tags to check actual text content
            const textContent = value.replace(/<[^>]*>/g, "").trim();
            return textContent.length >= 10;
          }
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
          }
        ),
      discountPrice: Yup.number()
        .nullable()
        .test(
          "discount-validation",
          "Le prix réduit doit être inférieur au prix normal",
          function (value) {
            if (!value) return true;
            const price = this.parent.Price;
            if (!price || price === 0) {
              return this.createError({
                message:
                  "Vous ne pouvez pas avoir un prix réduit sans prix principal",
              });
            }
            return value < price;
          }
        ),
    }),
    onSubmit: async (values) => {
      // Validate with toast notifications first
      if (!validateFormWithToast()) {
        return; // Stop submission if validation fails
      }

      setIsSubmitting(true);
      let loadingToast;

      try {
        // Show loading toast
        loadingToast = toast.loading("Modification du cours en cours...", {
          style: {
            background: "#eff6ff",
            color: "#2563eb",
            border: "1px solid #93c5fd",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
        });

        // Convert Prerequisites string to array if needed
        const courseData = {
          ...values,
          objectives: objectives, // Include objectives from state
          // Convert empty strings to null for numeric fields
          Price:
            values.Price === "" ||
            values.Price === null ||
            values.Price === undefined
              ? null
              : parseFloat(values.Price),
          discountPrice:
            values.discountPrice === "" ||
            values.discountPrice === null ||
            values.discountPrice === undefined
              ? null
              : parseFloat(values.discountPrice),
          duration:
            values.duration === "" ||
            values.duration === null ||
            values.duration === undefined
              ? null
              : parseInt(values.duration),
        };

        console.log("Course data to send:", courseData);

        // Update course data
        await coursesAPI.updateCourse(courseId, courseData);

        // Upload image if user selected one
        if (imageFile) {
          console.log("Uploading image:", imageFile.name);
          const formData = new FormData();
          formData.append("Image", imageFile);

          const response = await coursesAPI.uploadCourseImage(
            courseId,
            formData
          );
          console.log("Upload response:", response);

          // Update current image path
          if (response.imagePath || response.Image) {
            setCurrentCourseImage(response.imagePath || response.Image);
          }

          // Clear the file variable
          setImageFile(null);
        }

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success("Cours modifié avec succès ! 🎉", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#dcfce7",
            color: "#16a34a",
            border: "1px solid #86efac",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
          icon: "🎉",
        });

        setTimeout(() => {
          navigate(`/Courses/${courseId}`);
        }, 1500);
      } catch (error) {
        console.error("Error updating course:", error);
        console.error("Error details:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error(
          "Full error:",
          JSON.stringify(error.response?.data, null, 2)
        );

        toast.dismiss(loadingToast);

        // Get detailed error message
        let errorMessage = "Impossible de modifier le cours";
        if (error.response?.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            errorMessage = JSON.stringify(error.response.data.errors);
          }
        }

        toast.error(errorMessage, {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#fee2e2",
            color: "#dc2626",
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
          icon: "❌",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await coursesAPI.getCourseDetails(courseId);
        const course = response.course;

        // Set form values with course data
        formik.setValues({
          Title: course.Title || "",
          Title_ar: course.Title_ar || "",
          Description: course.Description || "",
          Description_ar: course.Description_ar || "",
          Category: course.Category || "",
          Category_ar: course.Category_ar || "",
          Prerequisites: course.Prerequisites || "",
          Price: course.Price || "",
          discountPrice: course.discountPrice || "",
          Currency: course.Currency || "EUR",
          Level: course.Level || course.difficulty || "beginner",
          difficulty: course.difficulty || course.Level || "beginner",
          duration: course.duration || "",
          Language: course.Language || "French",
          status: course.status || "published",
          objectives: course.objectives || [],
          isFeatured: course.isFeatured || false,
          certificate: course.certificate || false,
        });

        // Set objectives state
        setObjectives(course.objectives || []);

        // Extract videos and PDFs from sections
        const videos = [];
        const pdfs = [];

        if (course.sections && Array.isArray(course.sections)) {
          course.sections.forEach((section) => {
            if (section.items && Array.isArray(section.items)) {
              section.items.forEach((item) => {
                if (item.type === "video" && item.videoUrl) {
                  videos.push({
                    id: item.id,
                    name: item.title,
                    title: item.title,
                    description: item.description,
                    url: item.videoUrl,
                    duration: item.videoDuration,
                    sectionId: section.id,
                    sectionTitle: section.title,
                  });
                } else if (item.type === "pdf" && item.pdfUrl) {
                  pdfs.push({
                    id: item.id,
                    name: item.title,
                    title: item.title,
                    description: item.description,
                    url: item.pdfUrl,
                    sectionId: section.id,
                    sectionTitle: section.title,
                  });
                }
              });
            }
          });
        }

        console.log("� Extracted videos:", videos);
        console.log("📄 Extracted PDFs:", pdfs);
        setExistingVideos(videos);
        setExistingPdfs(pdfs);

        // Set current Images if they exist
        if (course.Image || course.Image) {
          setCurrentCourseImage(course.Image || course.Image);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setCourseNotFound(true);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Cours non trouvé",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

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

  // Objectives management functions
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

  // Video management functions
  const handleDeleteVideo = async (videoId) => {
    const result = await Swal.fire({
      title: "Supprimer la vidéo",
      text: "Êtes-vous sûr de vouloir supprimer cette vidéo ? Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        setDeletingVideo(videoId);
        // Remove video from the list
        const updatedVideos = existingVideos.filter((v) => v.id !== videoId);
        setExistingVideos(updatedVideos);

        toast.success("Vidéo supprimée avec succès", {
          duration: 3000,
          position: "top-right",
        });
      } catch (error) {
        console.error("Error deleting video:", error);
        toast.error("Erreur lors de la suppression de la vidéo", {
          duration: 4000,
          position: "top-right",
        });
      } finally {
        setDeletingVideo(null);
      }
    }
  };

  const handleDeletePdf = async (pdfId) => {
    const result = await Swal.fire({
      title: "Supprimer le PDF",
      text: "Êtes-vous sûr de vouloir supprimer ce PDF ? Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        // Remove PDF from the list
        const updatedPdfs = existingPdfs.filter((p) => p.id !== pdfId);
        setExistingPdfs(updatedPdfs);

        toast.success("PDF supprimé avec succès", {
          duration: 3000,
          position: "top-right",
        });
      } catch (error) {
        console.error("Error deleting PDF:", error);
        toast.error("Erreur lors de la suppression du PDF", {
          duration: 4000,
          position: "top-right",
        });
      }
    }
  };

  // Simple image handler - just store the file
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simple validation
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Fichier trop volumineux. Max 10MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Seuls JPEG, PNG et WebP sont autorisés");
        return;
      }

      // Just store the file - will upload on form submit
      setImageFile(file);
      toast.success(
        "Image sélectionnée ! Cliquez sur Enregistrer pour mettre à jour"
      );
    }
  };

  const deleteCourseImage = async () => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Voulez-vous vraiment supprimer l'image du cours ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      setDeleting(true);
      try {
        await coursesAPI.deleteCourseImage(courseId);
        setCurrentCourseImage(null);

        Swal.fire({
          icon: "success",
          title: "Supprimé !",
          text: "L'image du cours a été supprimée",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Error deleting course Image:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de supprimer l'image du cours",
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Edit className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chargement du cours...
          </h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (courseNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Cours non trouvé
          </h2>
          <p className="text-gray-600 mb-4">
            Le cours demandé n&apos;existe pas
          </p>
          <button
            onClick={() => navigate("/Courses")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/Courses")}
              className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 border border-purple-100 hover:border-purple-200"
            >
              <ArrowLeft className="w-5 h-5 text-purple-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Modifier le Cours
                </h1>
                <p className="text-gray-600">
                  Modifiez les informations du cours
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* French Fields */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">FR</span>
                </div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Informations en Français
                </h2>
              </div>

              <div className="space-y-6">
                {/* Title Field */}
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
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Title")}
                    className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                      formik.touched.Title && formik.errors.Title
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
                    }`}
                    placeholder="Entrez le titre du cours"
                  />
                  {formik.touched.Title && formik.errors.Title && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
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
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formik.errors.Title}
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div className="md:col-span-2">
                  <RichTextEditor
                    label="Description"
                    value={formik.values.Description}
                    onChange={(content) =>
                      formik.setFieldValue("Description", content)
                    }
                    placeholder="Décrivez le cours en détail avec formatting..."
                    height="250px"
                    required
                    error={
                      formik.touched.Description && formik.errors.Description
                    }
                  />
                </div>

                {/* Category Field */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
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
                    placeholder="ex: Informatique, Design..."
                  />
                  {formik.touched.Category && formik.errors.Category && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
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
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formik.errors.Category}
                    </p>
                  )}
                </div>

                {/* Prerequisites Field */}
                <div className="md:col-span-2">
                  <RichTextEditor
                    label="Prérequis"
                    value={formik.values.Prerequisites}
                    onChange={(content) =>
                      formik.setFieldValue("Prerequisites", content)
                    }
                    placeholder="Quels sont les prérequis pour ce cours..."
                    height="150px"
                  />
                </div>
              </div>
            </div>

            {/* Arabic Fields */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AR</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  المعلومات باللغة العربية
                </h2>
                <span className="text-sm text-gray-500">(اختياري)</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Title_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل عنوان الدورة"
                    dir="rtl"
                  />
                </div>

                <div>
                  <RichTextEditor
                    label="الوصف"
                    value={formik.values.Description_ar}
                    onChange={(content) =>
                      formik.setFieldValue("Description_ar", content)
                    }
                    placeholder="اوصف الدورة بالتفصيل مع التنسيق..."
                    height="250px"
                    className="rtl-editor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Category_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: الحاسوب، التصميم..."
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Course Status Section */}
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
                    Sélectionnez le statut qui correspond à votre cours
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
                    {/* Selection Indicator */}
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

                    {/* Icon */}
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

                    {/* Label and Description */}
                    <div>
                      <h4
                        className={`font-semibold transition-colors duration-200 ${
                          formik.values.status === status.value
                            ? status.textColor
                            : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {status.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {status.description}
                      </p>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div
                      className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                        formik.values.status === status.value
                          ? "opacity-0"
                          : "opacity-0 group-hover:opacity-5 bg-gray-900"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Course Images Management */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Gestion des Images
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Image */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    Image du Cours
                  </h3>

                  <input
                    type="file"
                    id="course-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {/* Show current image or upload button */}
                  {currentCourseImage ? (
                    <div className="relative group">
                      <img
                        src={`${
                          import.meta.env.VITE_API_URL
                        }${currentCourseImage}`}
                        alt="Image du cours"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      {/* Show if new file selected */}
                      {imageFile && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
                          ✓ Nouvelle image sélectionnée
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <label
                          htmlFor="course-image-upload"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg"
                        >
                          <Upload className="w-4 h-4" />
                          Changer
                        </label>
                        <button
                          type="button"
                          onClick={deleteCourseImage}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
                        >
                          {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="course-image-upload"
                      className="w-full h-48 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-600 text-center font-medium">
                        {imageFile
                          ? `✓ ${imageFile.name}`
                          : "Ajouter une image"}
                      </span>
                      <span className="text-sm text-gray-400 mt-1">
                        JPEG, PNG, WebP (max 10MB)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Détails du Cours
                </h2>
              </div>

              <div className="space-y-6">
                {/* Price Field */}
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    Prix (€){" "}
                    <span className="text-gray-500 text-xs">
                      (optionnel - laissez vide pour un cours gratuit)
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...formik.getFieldProps("Price")}
                    className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                      formik.touched.Price && formik.errors.Price
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 hover:border-amber-300"
                    }`}
                    placeholder="0.00"
                  />
                  {formik.touched.Price && formik.errors.Price && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
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
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formik.errors.Price}
                    </p>
                  )}
                </div>

                {/* Discount Price Field */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
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
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Prix réduit (€)
                    {(!formik.values.Price ||
                      parseFloat(formik.values.Price) === 0) && (
                      <span className="text-gray-500 text-xs ml-2">
                        (nécessite un prix principal)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={
                      !formik.values.Price ||
                      parseFloat(formik.values.Price) === 0
                    }
                    {...formik.getFieldProps("discountPrice")}
                    className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                      !formik.values.Price ||
                      parseFloat(formik.values.Price) === 0
                        ? "bg-gray-100 cursor-not-allowed border-gray-300"
                        : formik.touched.discountPrice &&
                          formik.errors.discountPrice
                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 hover:border-green-300"
                    }`}
                    placeholder="Prix en promotion"
                  />
                  {formik.touched.discountPrice &&
                    formik.errors.discountPrice && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
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
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formik.errors.discountPrice}
                      </p>
                    )}
                </div>

                {/* Duration Field */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Durée (heures)
                  </label>
                  <input
                    type="number"
                    {...formik.getFieldProps("duration")}
                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-300"
                    placeholder="ex: 10"
                  />
                </div>

                {/* Level Field */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-teal-800 mb-2">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Niveau
                  </label>
                  <select
                    {...formik.getFieldProps("Level")}
                    onChange={(e) => {
                      formik.setFieldValue("Level", e.target.value);
                      formik.setFieldValue("difficulty", e.target.value); // Sync with difficulty field
                    }}
                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 hover:border-teal-300"
                  >
                    {difficulties.map((diff) => (
                      <option key={diff.value} value={diff.value}>
                        {diff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {/* Language Field */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-indigo-800 mb-2">
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
                    Langue
                  </label>
                  <select
                    {...formik.getFieldProps("Language")}
                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 hover:border-indigo-300"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Short Description Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Description Courte
              </h2>

              <div className="space-y-6">
                {/* Is Featured Checkbox */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <input
                      id="isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      checked={formik.values.isFeatured}
                      onChange={formik.handleChange}
                      className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded"
                    />
                    <label
                      htmlFor="isFeatured"
                      className="flex items-center gap-2 text-sm font-medium text-yellow-800"
                    >
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
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      Cours en vedette
                    </label>
                  </div>
                </div>

                {/* Certificate Checkbox */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <input
                      id="certificate"
                      name="certificate"
                      type="checkbox"
                      checked={formik.values.certificate}
                      onChange={formik.handleChange}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-green-300 rounded"
                    />
                    <label
                      htmlFor="certificate"
                      className="flex items-center gap-2 text-sm font-medium text-green-800"
                    >
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
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 003.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      Délivre un certificat
                    </label>
                  </div>
                  <p className="text-xs text-green-600 mt-2 ml-8">
                    Les étudiants recevront un certificat à la fin de ce cours
                  </p>
                </div>
              </div>
            </div>

            {/* Prerequisites Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                Prérequis
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Utilisez l&apos;éditeur de texte enrichi pour une meilleure
                  mise en forme
                </label>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200 focus-within:border-gray-500 focus-within:ring-4 focus-within:ring-gray-100 transition-all duration-200">
                  <RichTextEditor
                    value={formik.values.Prerequisites}
                    onChange={(content) =>
                      formik.setFieldValue("Prerequisites", content)
                    }
                    placeholder="Expliquez les prérequis du cours"
                  />
                </div>
              </div>
            </div>

            {/* Learning Objectives Section */}
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
                  {objectives &&
                    Array.isArray(objectives) &&
                    objectives.length > 0 &&
                    objectives.map((objective, index) => (
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

            {/* Existing Videos Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">
                    Vidéos du cours
                  </h3>
                  <p className="text-blue-600">
                    {existingVideos && existingVideos.length > 0
                      ? `${existingVideos.length} vidéo(s) disponible(s)`
                      : "Aucune vidéo pour le moment"}
                  </p>
                </div>
              </div>

              {existingVideos && existingVideos.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {existingVideos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>

                        {/* Play overlay on hover */}
                        {video.url && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all"
                            >
                              <svg
                                className="w-8 h-8 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                          {video.name ||
                            video.title ||
                            video.Name ||
                            video.Title ||
                            "Vidéo sans titre"}
                        </h4>

                        {video.sectionTitle && (
                          <div className="flex items-center gap-1 mb-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                              />
                            </svg>
                            <span className="text-xs text-gray-600">
                              {video.sectionTitle}
                            </span>
                          </div>
                        )}

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {video.description ||
                            video.Description ||
                            "Aucune description"}
                        </p>

                        {video.duration && (
                          <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
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
                            <span>{video.duration}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {video.url && (
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                            >
                              Voir
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(video.id)}
                            disabled={deletingVideo === video.id}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingVideo === video.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Existing PDFs Section */}
            {existingPdfs && existingPdfs.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-600 rounded-xl">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-900">
                      Documents PDF
                    </h3>
                    <p className="text-green-600">
                      {existingPdfs.length} document(s) disponible(s)
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {existingPdfs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <svg
                            className="w-6 h-6 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M7 18h10v-2H7v2zM17 14H7v-2h10v2zm0-4H7V8h10v2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 line-clamp-1">
                            {pdf.title ||
                              pdf.name ||
                              pdf.Title ||
                              pdf.Name ||
                              "PDF sans titre"}
                          </h4>
                          {pdf.sectionTitle && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg
                                className="w-3 h-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                              </svg>
                              <span className="text-xs text-gray-500">
                                {pdf.sectionTitle}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {pdf.description ||
                          pdf.Description ||
                          "Aucune description"}
                      </p>

                      <div className="flex gap-2">
                        {pdf.url && (
                          <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center text-sm font-medium"
                          >
                            Ouvrir
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePdf(pdf.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate("/Courses")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSubmitting ? "Modification..." : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditCourse;
