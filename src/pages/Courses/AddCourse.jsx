import { useFormik } from "formik";
import { ArrowLeft, Loader2, Save, Upload, X } from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { RichTextEditor } from "../../components/Common/RichTextEditor";
import AddPDFs from "../../components/Courses/AddPDFs";
import {
  handleDeleteVideo,
  handleEditVideo,
  handleVideoFileSelect,
  handleVideoUpload,
} from "../../components/Courses/courseHandlers";
import VideoSection from "../../components/Courses/VideoSection";
import apiClient from "../../utils/apiClient";

const AddCourse = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [courseImage, setCourseImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [objectives, setObjectives] = useState([]);

  // Video and PDF states
  const [videos, setVideos] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [newVideo, setNewVideo] = useState({
    name: "",
    description: "",
    file: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();

  // Helper function for showing alerts
  const showAlert = (message, type = "success") => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    }
  };

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
      // French fields (required)
      Title: "",
      Description: "",
      Category: "",
      Specialty: "",
      shortDescription: "",
      subCategory: "",

      // Arabic fields (optional)
      Title_ar: "",
      Description_ar: "",
      Category_ar: "",
      Specialty_ar: "",
      shortDescription_ar: "",
      subCategory_ar: "",

      // Course details
      Price: "",
      currency: "EUR",
      discountPrice: "",
      Level: "beginner",
      difficulty: "beginner", // Added for frontend filter compatibility
      duration: "",
      Language: "French",
      status: "published",
      Prerequisites: "",
      objectives: [], // Learning objectives
      isFeatured: false,
      certificate: false, // Added for certificate filter
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
        .min(0, "Le prix doit être positif ou 0 pour un cours gratuit")
        .test(
          "is-valid-price",
          "Le prix doit être un nombre valide",
          function (value) {
            if (value === null || value === undefined || value === "")
              return true;
            return !isNaN(value) && value >= 0;
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
        return;
      }

      setIsSubmitting(true);

      try {
        console.log("=== 📋 FORM DATA SUBMITTED ===");
        console.log("Full Form Values:", values);
        console.log("\n--- 🇫🇷 French Fields ---");
        console.log("Title:", values.Title);
        console.log("Description:", values.Description);
        console.log("Prerequisites:", values.Prerequisites);
        console.log("\n--- 🇸🇦 Arabic Fields ---");
        console.log("Title (AR):", values.Title_ar);
        console.log("Description (AR):", values.Description_ar);
        console.log("Prerequisites (AR):", values.Prerequisites_ar);
        console.log("\n--- 💰 Course Details ---");
        console.log("Price:", values.Price);
        console.log("Currency:", values.currency);
        console.log("Difficulty:", values.difficulty);
        console.log("Duration:", values.duration);
        console.log("\n--- 🖼️ Media ---");
        console.log("Thumbnail:", thumbnail);
        console.log("Course Image:", courseImage);
        console.log("Cover Image:", coverImage);
        console.log("\n--- 📚 Content ---");
        console.log("Objectives:", objectives);
        console.log("=========================\n");

        // Show loading toast
        const loadingToast = toast.loading("Création du cours en cours...", {
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

        // Prepare course data object - only include fields with values
        const courseData = {
          // French fields (required) - Using PascalCase to match backend
          Title: values.Title,
          Description: values.Description,
          Category: values.Category,
          Specialty: values.Specialty || "",
          shortDescription: values.shortDescription || "",
          subCategory: values.subCategory || "",
          Prerequisites: values.Prerequisites || "",

          // Course details
          Currency: values.currency || "EUR",
          Level: values.difficulty || values.Level,
          difficulty: values.difficulty || values.Level,
          Language: values.Language,
          status: values.status,
          isFeatured: values.isFeatured || false,
          certificate: values.certificate || false,
        };

        // Only add Arabic fields if they have values
        if (values.Title_ar && values.Title_ar.trim())
          courseData.Title_ar = values.Title_ar;
        if (values.Description_ar && values.Description_ar.trim())
          courseData.Description_ar = values.Description_ar;
        if (values.Category_ar && values.Category_ar.trim())
          courseData.Category_ar = values.Category_ar;
        if (values.Specialty_ar && values.Specialty_ar.trim())
          courseData.Specialty_ar = values.Specialty_ar;
        if (values.shortDescription_ar && values.shortDescription_ar.trim())
          courseData.shortDescription_ar = values.shortDescription_ar;
        if (values.subCategory_ar && values.subCategory_ar.trim())
          courseData.subCategory_ar = values.subCategory_ar;

        // Only add price if it has a value
        if (
          values.Price !== "" &&
          values.Price !== null &&
          values.Price !== undefined
        ) {
          courseData.Price = parseFloat(values.Price);
        }

        // Only add discount price if it has a value
        if (
          values.discountPrice !== "" &&
          values.discountPrice !== null &&
          values.discountPrice !== undefined
        ) {
          courseData.discountPrice = parseFloat(values.discountPrice);
        }

        // Only add duration if it has a value
        if (
          values.duration !== "" &&
          values.duration !== null &&
          values.duration !== undefined
        ) {
          courseData.duration = parseInt(values.duration);
        }

        // Only add objectives if there are any
        if (objectives.length > 0) {
          courseData.objectives = objectives;
        }

        let response;

        // Check if we have files to upload (images, videos, or PDFs)
        const hasFiles =
          thumbnail ||
          courseImage ||
          coverImage ||
          (videos && videos.length > 0) ||
          (pdfs && pdfs.length > 0);

        if (hasFiles) {
          console.log("📤 Creating complete course with files...");

          // Prepare FormData
          const formData = new FormData();

          // ✅ Add videos metadata to courseData if any
          if (videos && videos.length > 0) {
            const videosMetadata = videos.map((video) => ({
              name: video.name,
              description: video.description || "",
              duration: video.duration || null,
            }));
            courseData.videos = videosMetadata;
            console.log("📹 Videos metadata:", videosMetadata);
          }

          // ✅ Add PDFs metadata to courseData if any
          if (pdfs && pdfs.length > 0) {
            const pdfsMetadata = pdfs.map((pdf) => ({
              name: pdf.name || pdf.title,
              description: pdf.description || "",
            }));
            courseData.pdfs = pdfsMetadata;
            console.log("📄 PDFs metadata:", pdfsMetadata);
          }

          // ✅ Add courseData as JSON string (IMPORTANT!)
          formData.append("courseData", JSON.stringify(courseData));

          // Add image files
          if (thumbnail) formData.append("thumbnail", thumbnail);
          if (courseImage) formData.append("courseImage", courseImage);
          if (coverImage) formData.append("coverImage", coverImage);

          // Add video files (in same order as metadata)
          if (videos && videos.length > 0) {
            console.log(`📹 Adding ${videos.length} video files`);
            videos.forEach((video, index) => {
              if (video.file) {
                formData.append("videos", video.file);
                console.log(
                  `  ✅ Video ${index + 1}: ${video.file.name} (${(
                    video.file.size /
                    1024 /
                    1024
                  ).toFixed(2)} MB)`
                );
              } else {
                console.warn(
                  `  ⚠️ Video ${index + 1} missing file:`,
                  video.name
                );
              }
            });
          }

          // Add PDF files (in same order as metadata)
          if (pdfs && pdfs.length > 0) {
            console.log(`📄 Adding ${pdfs.length} PDF files`);
            pdfs.forEach((pdf, index) => {
              if (pdf.file) {
                formData.append("pdfs", pdf.file);
                console.log(
                  `  ✅ PDF ${index + 1}: ${pdf.file.name} (${(
                    pdf.file.size /
                    1024 /
                    1024
                  ).toFixed(2)} MB)`
                );
              }
            });
          }

          // Debug: Log FormData contents
          console.log("📦 FormData contents being sent:");
          for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
              console.log(
                `  ${key}: [File] ${value.name} (${(value.size / 1024).toFixed(
                  2
                )} KB)`
              );
            } else if (key === "courseData") {
              console.log(`  ${key}:`, JSON.parse(value));
            } else {
              console.log(`  ${key}:`, value);
            }
          }

          // ✅ Call the complete-course endpoint
          response = await apiClient.post(
            "/Admin/Courses/complete-course",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          console.log("📝 Creating basic course (no files)...");
          console.log("📦 Course data being sent:", courseData);

          // Call the JSON API for courses without files
          response = await apiClient.post("/Admin/Courses", courseData, {
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        console.log("✅ Course created successfully:", response);

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success("Cours créé avec succès ! 🎉", {
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

        // Navigate to courses page after short delay
      } catch (error) {
        console.error("❌ Error creating course:", error);

        // Determine error message
        let errorMessage = "Impossible de créer le cours";

        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast.error(errorMessage, {
          duration: 5000,
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

  const handleCourseImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux. Maximum 10MB.", {
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
          icon: "📁",
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Seuls les fichiers JPEG, PNG et WebP sont autorisés.", {
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
          icon: "🖼️",
        });
        return;
      }

      setCourseImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target.result);
      };
      reader.readAsDataURL(file);

      toast.success("Image du cours sélectionnée ! 📸", {
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
        icon: "📸",
      });
    }
  };

  const handleCoverImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux. Maximum 10MB.", {
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
          icon: "📁",
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Seuls les fichiers JPEG, PNG et WebP sont autorisés.", {
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
          icon: "🖼️",
        });
        return;
      }

      setCoverImage(file);

      toast.success("Image de couverture sélectionnée ! 🎨", {
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
        icon: "🎨",
      });
    }
  };

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

  return (
    <div className="relative">
      <Toaster />
      <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 pb-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/Courses")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux cours
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Nouveau Cours
                </h1>
                <p className="text-gray-600">
                  Créez un nouveau cours avec support multilingue
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6 pb-8">
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

                {/* Specialty Field */}
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
                    Spécialité
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Specialty")}
                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-300"
                    placeholder="ex: React, Data Science, Marketing..."
                  />
                </div>

                {/* Sub-category Field */}
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Sous-catégorie
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("subCategory")}
                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 hover:border-amber-300"
                    placeholder="ex: Développement web, UI/UX..."
                  />
                </div>

                {/* Short Description Field */}
                <div className="md:col-span-2 bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
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
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                    Description courte
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("shortDescription")}
                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 hover:border-rose-300"
                    placeholder="Résumé court du cours (255 caractères max)"
                    maxLength={255}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
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

                <div className="md:col-span-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التخصص
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("Specialty_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: ريأكت، علوم البيانات، التسويق..."
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة الفرعية
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("subCategory_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: تطوير الويب، تصميم واجهات..."
                    dir="rtl"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف المختصر
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("shortDescription_ar")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ملخص قصير للدورة (255 حرف كحد أقصى)"
                    maxLength={255}
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
            {/* Course Images */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Images du Cours
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Principale (Miniature)
                  </label>
                  <div
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() =>
                      document.getElementById("courseImageInput").click()
                    }
                  >
                    {thumbnail ? (
                      <div className="relative">
                        <img
                          src={thumbnail}
                          alt="Course thumbnail"
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setThumbnail(null);
                            setCourseImage(null);
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
                  <input
                    id="courseImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleCourseImageUpload}
                    className="sr-only"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de Couverture
                  </label>
                  <div
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() =>
                      document.getElementById("coverImageInput").click()
                    }
                  >
                    {coverImage ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(coverImage)}
                          alt="Course cover"
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImage(null);
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
                  <input
                    id="coverImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            {/* Course Details */}
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
                {/* Price Section */}
                <div className="space-y-4">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      Prix (€){" "}
                      <span className="text-gray-500 text-xs">
                        (optionnel - laissez vide pour un cours gratuit)
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.01"
                        {...formik.getFieldProps("Price")}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all ${
                          formik.touched.Price && formik.errors.Price
                            ? "border-red-500"
                            : "border-green-300"
                        }`}
                        placeholder="0.00"
                      />

                      <select
                        {...formik.getFieldProps("currency")}
                        className="w-28 px-3 py-3 border rounded-lg bg-white shadow-sm text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        aria-label="Currency"
                      >
                        <option value="EUR">EUR</option>

                        <option value="DZD">DZD</option>
                      </select>
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

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm transition-all ${
                        !formik.values.Price ||
                        parseFloat(formik.values.Price) === 0
                          ? "bg-gray-100 cursor-not-allowed"
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

                {/* Duration and Level */}
                <div className="space-y-4">
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
                      type="number"
                      {...formik.getFieldProps("duration")}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                      placeholder="ex: 10"
                    />
                  </div>

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
                        // Also update difficulty field for frontend filter compatibility
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

            {/* Course Options Section */}
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
                {/* Language Selection */}
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

                {/* Featured Course Toggle */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <input
                      id="isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      checked={formik.values.isFeatured}
                      onChange={formik.handleChange}
                      className="mt-1 h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded transition-all"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="isFeatured"
                        className="flex items-center gap-2 text-sm font-medium text-yellow-800 cursor-pointer"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Cours vedette
                      </label>
                      <p className="text-yellow-700 text-sm mt-1">
                        Mettre en avant ce cours sur la page d&apos;accueil
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Toggle */}
                <div className="md:col-span-2">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <input
                        id="certificate"
                        name="certificate"
                        type="checkbox"
                        checked={formik.values.certificate}
                        onChange={formik.handleChange}
                        className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-green-300 rounded transition-all"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="certificate"
                          className="flex items-center gap-2 text-sm font-medium text-green-800 cursor-pointer"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Certificat disponible
                        </label>
                        <p className="text-green-700 text-sm mt-1">
                          Les étudiants recevront un certificat de completion
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prerequisites Section */}
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
                  Prérequis
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

            {/* Learning Objectives Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Objectifs d&apos;apprentissage
                  </h3>
                  <p className="text-sm text-gray-600">
                    Définissez ce que les étudiants apprendront
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <label className="flex items-center gap-2 text-sm font-medium text-green-800 mb-3">
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
                  Objectifs
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
                          className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all"
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
                    className="w-full py-3 px-4 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
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

                <p className="text-green-600 text-sm mt-3 flex items-center gap-1">
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

            {/* Videos Section */}
            <VideoSection
              videos={videos}
              setVideos={setVideos}
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
                setVideos,
                videos,
                showAlert
              )}
              formik={formik}
            />

            {/* PDFs Section */}
            <AddPDFs
              formik={formik}
              showAlert={showAlert}
              pdfs={pdfs}
              setPdfs={setPdfs}
            />

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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSubmitting ? "Création..." : "Créer le cours"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
