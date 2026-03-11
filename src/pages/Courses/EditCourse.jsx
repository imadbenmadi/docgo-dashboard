import { useFormik } from "formik";
import {
  ArrowLeft,
  Edit,
  Loader2,
  PlayCircle,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { coursesAPI } from "../../API/Courses";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";
import EditQuiz from "../../components/Courses/EditCourse/EditQuiz";
import {
  ValidationErrorPanel,
  ValidationSuccessBanner,
} from "../../components/Common/FormValidation";
import { useFormValidation } from "../../components/Common/FormValidation/useFormValidation";

const EditCourse = () => {
  const { courseId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseNotFound, setCourseNotFound] = useState(false);
  const [objectives, setObjectives] = useState([]);

  // Shared validation panel
  const {
    errors: validationErrors,
    warnings: validationWarnings,
    showPanel: showValidationPanel,
    showSuccess: showValidationSuccess,
    validate: runValidation,
    hidePanel: hideValidationPanel,
  } = useFormValidation();

  // Video and PDF states
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({
    name: "",
    description: "",
    file: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Image management - simple variable to store selected file
  const [imageFile, setImageFile] = useState(null);
  const [currentCourseImage, setCurrentCourseImage] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [currentCoverImage, setCurrentCoverImage] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingCover, setDeletingCover] = useState(false);

  // Intro video management
  const [introVideoFile, setIntroVideoFile] = useState(null);
  const [introVideoPreview, setIntroVideoPreview] = useState(null);
  const [currentIntroVideo, setCurrentIntroVideo] = useState(null);
  const [deletingIntroVideo, setDeletingIntroVideo] = useState(false);

  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
  const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

  const handleIntroVideoChange = (e) => {
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

  const deleteIntroVideo = async () => {
    setDeletingIntroVideo(true);
    try {
      await coursesAPI.deleteCourseIntroVideo(courseId);
      setCurrentIntroVideo(null);
      toast.success("Vidéo d'introduction supprimée");
    } catch (err) {
      toast.error("Erreur lors de la suppression de la vidéo");
      console.error(err);
    } finally {
      setDeletingIntroVideo(false);
    }
  };

  const navigate = useNavigate();

  // Custom validation function with toast notifications
  const validateFormWithToast = () => {
    const rules = [
      {
        field: "Titre fran\u00e7ais",
        message:
          !formik.values.Title || formik.values.Title.trim().length === 0
            ? "Le titre fran\u00e7ais est requis"
            : "Le titre doit contenir au moins 3 caract\u00e8res",
        section: "Informations g\u00e9n\u00e9rales",
        scrollToId: "course-title",
        type: "error",
        condition: () =>
          !formik.values.Title || formik.values.Title.trim().length < 3,
      },
      {
        field: "Description",
        message: "La description doit contenir au moins 10 caract\u00e8res",
        section: "Informations g\u00e9n\u00e9rales",
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
        field: "Cat\u00e9gorie",
        message: "La cat\u00e9gorie est requise",
        section: "Informations g\u00e9n\u00e9rales",
        scrollToId: "course-category",
        type: "error",
        condition: () =>
          !formik.values.Category || formik.values.Category.trim().length === 0,
      },
      {
        field: "Prix",
        message: "Le prix doit \u00eatre positif ou 0 pour un cours gratuit",
        section: "Tarification",
        scrollToId: "course-price",
        type: "error",
        condition: () =>
          formik.values.Price !== "" &&
          formik.values.Price !== null &&
          parseFloat(formik.values.Price) < 0,
      },
      {
        field: "Prix r\u00e9duit",
        message:
          "Le prix r\u00e9duit doit \u00eatre inf\u00e9rieur au prix normal",
        section: "Tarification",
        scrollToId: "course-discount-price",
        type: "error",
        condition: () =>
          formik.values.discountPrice &&
          formik.values.Price &&
          parseFloat(formik.values.discountPrice) >=
            parseFloat(formik.values.Price),
      },
      {
        field: "Prix r\u00e9duit",
        message:
          "Vous ne pouvez pas avoir un prix r\u00e9duit sans prix principal",
        section: "Tarification",
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
      // French fields
      Title: "",
      Description: "",
      Category: "",
      Prerequisites: "",
      Specialty: "",
      Specialty_ar: "",
      subCategory: "",
      subCategory_ar: "",
      shortDescription: "",
      shortDescription_ar: "",

      // Arabic fields
      Title_ar: "",
      Description_ar: "",
      Category_ar: "",

      // Course details
      Price: "",
      discountPrice: "",
      Currency: "DZD",
      Level: "beginner",
      difficulty: "beginner",
      duration: "",
      Language: "French",
      status: "published",
      objectives: [],
      isFeatured: false,
      certificate: false,
      quiz: [],
      pdfs: [],
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
            if (!price || price === 0) {
              return this.createError({
                message:
                  "Vous ne pouvez pas avoir un prix réduit sans prix principal",
              });
            }
            return value < price;
          },
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

        // Prepare course data matching backend structure exactly
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
          shortDescription: values.shortDescription || "",
          shortDescription_ar: values.shortDescription_ar || "",

          // Price fields
          Price:
            values.Price === "" ||
            values.Price === null ||
            values.Price === undefined
              ? 0
              : parseFloat(values.Price),
          discountPrice:
            values.discountPrice === "" ||
            values.discountPrice === null ||
            values.discountPrice === undefined
              ? null
              : parseFloat(values.discountPrice),
          Currency: values.Currency || "DZD",

          // Course details
          Level: values.Level || values.difficulty || "beginner",
          difficulty: values.difficulty || values.Level || "beginner",
          duration:
            values.duration === "" ||
            values.duration === null ||
            values.duration === undefined
              ? null
              : parseInt(values.duration),
          Language: values.Language || "French",
          status: values.status || "published",
          Prerequisites: values.Prerequisites || "",

          // Additional fields
          objectives: objectives || [],
          isFeatured: values.isFeatured || false,
          certificate: values.certificate || false,
          quiz: values.quiz || [],
        };

        console.log("📦 Course data to send:", courseData);
        console.log("🎯 Quiz data specifically:", values.quiz);
        console.log("🎯 Quiz in courseData:", courseData.quiz);
        console.log(
          "🎯 Full courseData as JSON:",
          JSON.stringify(courseData, null, 2),
        );

        // Update course data
        const updateResponse = await coursesAPI.updateCourse(
          courseId,
          courseData,
        );
        console.log("✅ Backend response after update:", updateResponse);

        // Upload main image if user selected one
        if (imageFile) {
          console.log("Uploading image:", imageFile.name);
          const formData = new FormData();
          formData.append("Image", imageFile);
          const response = await coursesAPI.uploadCourseImage(
            courseId,
            formData,
          );
          console.log("Upload response:", response);
          if (response.imagePath || response.Image) {
            setCurrentCourseImage(response.imagePath || response.Image);
          }
          setImageFile(null);
        }

        // Upload cover image if user selected one
        if (coverImageFile) {
          console.log("Uploading cover image:", coverImageFile.name);
          const coverFormData = new FormData();
          coverFormData.append("CoverImage", coverImageFile);
          const coverResponse = await coursesAPI.uploadCoverImage(
            courseId,
            coverFormData,
          );
          console.log("Cover upload response:", coverResponse);
          if (coverResponse.imagePath || coverResponse.CoverImage) {
            setCurrentCoverImage(
              coverResponse.imagePath || coverResponse.CoverImage,
            );
          }
          setCoverImageFile(null);
        }

        // Upload intro video if user selected one
        if (introVideoFile) {
          const introFormData = new FormData();
          introFormData.append("video", introVideoFile);
          try {
            const introRes = await coursesAPI.uploadCourseIntroVideo(
              courseId,
              introFormData,
            );
            if (introRes.videoUrl) setCurrentIntroVideo(introRes.videoUrl);
          } catch (introErr) {
            toast.error("Erreur lors de l'upload de la vidéo d'introduction");
            console.error(introErr);
          }
          setIntroVideoFile(null);
          setIntroVideoPreview(null);
        }

        // Upload new videos and PDFs if any
        const videosToUpload = videos.filter((v) => v.isNew);
        const pdfsToUpload = (formik.values.pdfs || []).filter((p) => p.file);
        if (videosToUpload.length > 0 || pdfsToUpload.length > 0) {
          console.log("📤 Uploading new videos and PDFs...");
          setIsUploading(true);

          const uploadFormData = new FormData();

          // Create sections structure
          const sections = [
            {
              title: "Nouveau contenu",
              title_ar: "محتوى جديد",
              description: "Contenu ajouté lors de la modification",
              description_ar: "المحتوى المضاف أثناء التعديل",
              order: 1,
              items: [],
            },
          ];

          // Add video items metadata
          videosToUpload.forEach((video) => {
            sections[0].items.push({
              title: video.name,
              title_ar: "",
              type: "video",
              description: video.description || "",
              description_ar: "",
              order: sections[0].items.length + 1,
            });
          });

          // Add PDF items metadata
          pdfsToUpload.forEach((pdf) => {
            sections[0].items.push({
              title: pdf.title || pdf.name,
              title_ar: "",
              type: "pdf",
              description: pdf.description || "",
              description_ar: "",
              order: sections[0].items.length + 1,
            });
          });

          uploadFormData.append("sections", JSON.stringify(sections));
          uploadFormData.append(
            "courseData",
            JSON.stringify({
              Title: values.Title,
              quiz: values.quiz || [],
            }),
          );

          // Append video files
          videosToUpload.forEach((video) => {
            if (video.file) {
              uploadFormData.append("videos", video.file);
            }
          });

          // Append PDF files
          pdfsToUpload.forEach((pdf) => {
            if (pdf.file) {
              uploadFormData.append("pdfs", pdf.file);
            }
          });

          try {
            // Use the complete-course endpoint to add files
            const response = await coursesAPI.addCourseFiles(
              courseId,
              uploadFormData,
            );
            console.log("✅ Files uploaded:", response);

            // Mark uploaded videos as no longer new
            setVideos((prev) =>
              prev.map((v) =>
                v.isNew ? { ...v, isNew: false, file: undefined } : v,
              ),
            );

            toast.success("Vidéos et PDFs ajoutés avec succès !", {
              duration: 2000,
              position: "top-right",
            });
          } catch (uploadError) {
            console.error("Error uploading files:", uploadError);
            toast.error("Erreur lors de l'upload des fichiers", {
              duration: 4000,
              position: "top-right",
            });
          } finally {
            setIsUploading(false);
          }
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
          JSON.stringify(error.response?.data, null, 2),
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

        console.log("📚 Course loaded:", course);
        console.log("📝 Quiz from backend:", course.quiz);

        // Set form values with course data
        formik.setValues({
          Title: course.Title || "",
          Title_ar: course.Title_ar || "",
          Description: course.Description || "",
          Description_ar: course.Description_ar || "",
          Category: course.Category || "",
          Category_ar: course.Category_ar || "",
          Specialty: course.Specialty || "",
          Specialty_ar: course.Specialty_ar || "",
          subCategory: course.subCategory || "",
          subCategory_ar: course.subCategory_ar || "",
          shortDescription: course.shortDescription || "",
          shortDescription_ar: course.shortDescription_ar || "",
          Prerequisites: course.Prerequisites || "",
          Price: course.Price || "",
          discountPrice: course.discountPrice || "",
          Currency: course.Currency || "DZD",
          Level: course.Level || course.difficulty || "beginner",
          difficulty: course.difficulty || course.Level || "beginner",
          duration: course.duration || "",
          Language: course.Language || "French",
          status: course.status || "published",
          objectives: course.objectives || [],
          isFeatured: course.isFeatured || false,
          certificate: course.certificate || false,
          quiz: course.quiz || [],
        });

        console.log("✅ Formik values after loading:", formik.values);
        console.log("✅ Quiz in formik after loading:", formik.values.quiz);

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

        console.log("🎬 Extracted videos:", videos);
        console.log("📄 Extracted PDFs:", pdfs);
        setVideos(videos);
        formik.setFieldValue(
          "pdfs",
          pdfs.map((p) => ({
            id: p.id,
            title: p.title || p.name,
            description: p.description || "",
          })),
        );

        // Set current Images if they exist
        if (course.Image) {
          setCurrentCourseImage(course.Image);
        }
        if (course.CoverImage) {
          setCurrentCoverImage(course.CoverImage);
        }
        if (course.videoUrl) {
          setCurrentIntroVideo(course.videoUrl);
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

  // showAlert helper
  const showAlertForEdit = (type, title, msg) => {
    if (type === "success") toast.success(msg || title);
    else toast.error(msg || title);
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
        "Image sélectionnée ! Cliquez sur Enregistrer pour mettre à jour",
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

  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
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
      setCoverImageFile(file);
      toast.success(
        "Image de couverture sélectionnée ! Cliquez sur Enregistrer pour mettre à jour",
      );
    }
  };

  const deleteCoverImageHandler = async () => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Voulez-vous vraiment supprimer l'image de couverture ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      setDeletingCover(true);
      try {
        await coursesAPI.deleteCoverImage(courseId);
        setCurrentCoverImage(null);
        Swal.fire({
          icon: "success",
          title: "Supprimé !",
          text: "L'image de couverture a été supprimée",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Error deleting cover image:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de supprimer l'image de couverture",
        });
      } finally {
        setDeletingCover(false);
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
      {/* Validation Panel */}
      <ValidationErrorPanel
        errors={validationErrors}
        warnings={validationWarnings}
        isVisible={showValidationPanel}
        onClose={hideValidationPanel}
        title="Corrections requises"
      />
      <ValidationSuccessBanner isVisible={showValidationSuccess} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
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

          {/* Manage Sections Banner */}
          <Link
            to={`/Courses/${courseId}/sections`}
            className="flex items-center justify-between gap-3 p-4 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800">
                  Gérer le contenu du cours
                </p>
                <p className="text-sm text-green-600">
                  Sections, vidéos, PDFs, textes et quiz
                </p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>

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
                    id="course-title"
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
                    id="course-category"
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

                <div>
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
            {/* Course Images Management */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Images du Cours
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Main Image */}
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
                  {currentCourseImage ? (
                    <div className="relative group">
                      <img
                        src={
                          currentCourseImage.startsWith("http")
                            ? currentCourseImage
                            : `${import.meta.env.VITE_API_URL}${currentCourseImage}`
                        }
                        alt="Image du cours"
                        className="w-full h-40 object-cover rounded-lg border border-gray-300"
                      />
                      {imageFile && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium shadow">
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
                  )}
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de Couverture
                  </label>
                  <input
                    type="file"
                    id="cover-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                  {currentCoverImage ? (
                    <div className="relative group">
                      <img
                        src={
                          currentCoverImage.startsWith("http")
                            ? currentCoverImage
                            : `${import.meta.env.VITE_API_URL}${currentCoverImage}`
                        }
                        alt="Image de couverture"
                        className="w-full h-40 object-cover rounded-lg border border-gray-300"
                      />
                      {coverImageFile && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium shadow">
                          ✓ Nouvelle image sélectionnée
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <label
                          htmlFor="cover-image-upload"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg"
                        >
                          <Upload className="w-4 h-4" />
                          Changer
                        </label>
                        <button
                          type="button"
                          onClick={deleteCoverImageHandler}
                          disabled={deletingCover}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
                        >
                          {deletingCover ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>

            {/* Course Intro Video */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Vidéo d&apos;introduction
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Vidéo de présentation visible par tous les visiteurs sur la page
                du cours.
              </p>

              {currentIntroVideo && !introVideoPreview ? (
                <div className="relative group">
                  <video
                    src={`${import.meta.env.VITE_API_URL}${currentIntroVideo}`}
                    controls
                    className="w-full rounded-xl border border-gray-200"
                    style={{ maxHeight: "320px" }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <label
                      htmlFor="intro-video-upload-edit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Upload className="w-4 h-4" />
                      Changer
                    </label>
                    <button
                      type="button"
                      onClick={deleteIntroVideo}
                      disabled={deletingIntroVideo}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
                    >
                      {deletingIntroVideo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Supprimer
                    </button>
                  </div>
                  <input
                    type="file"
                    id="intro-video-upload-edit"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={handleIntroVideoChange}
                    className="hidden"
                  />
                </div>
              ) : introVideoPreview ? (
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
                    ✓ Nouvelle vidéo sélectionnée — sera uploadée à la
                    sauvegarde
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors cursor-pointer"
                  onClick={() =>
                    document.getElementById("intro-video-upload-edit").click()
                  }
                >
                  <PlayCircle className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Aucune vidéo d&apos;introduction — cliquez pour en ajouter
                    une
                  </p>
                  <input
                    type="file"
                    id="intro-video-upload-edit"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={handleIntroVideoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="intro-video-upload-edit"
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
                {/* Price + Discount column */}
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
                      Prix (DZD){" "}
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
                      <div className="w-28 px-3 py-3 border rounded-lg bg-gray-50 text-gray-700 font-medium shadow-sm text-sm text-center">
                        🇩🇿 DZD
                      </div>
                      <input
                        type="hidden"
                        {...formik.getFieldProps("Currency")}
                        value="DZD"
                      />
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
                      Prix réduit (DZD)
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

                {/* Duration + Level column */}
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

            {/* Content managed via sections — use the sections manager to add videos, PDFs, texts and quizzes */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-800 mb-1">
                  Le contenu est géré par sections
                </p>
                <p className="text-sm text-green-700">
                  Pour ajouter ou modifier des vidéos, PDFs, textes et quiz,
                  utilisez le gestionnaire de sections ci-dessus.
                </p>
              </div>
            </div>

            {/* Quiz Section */}
            <EditQuiz formik={formik} />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end items-center">
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
                  disabled={isSubmitting}
                  className={`px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    validationErrors.length > 0
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSubmitting ? "Modification..." : "Sauvegarder"}
                </button>
                {validationErrors.length > 0 && !isSubmitting && (
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

        {/* Hidden file inputs for video and PDF */}
      </div>
    </>
  );
};

export default EditCourse;
