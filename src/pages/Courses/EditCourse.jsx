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
import EditQuiz from "../../components/Courses/EditCourse/EditQuiz";
import VideoSection from "../../components/Courses/VideoSection";
import AddPDFs from "../../components/Courses/AddPDFs";
import {
    handleVideoFileSelect as videoFileSelectHandler,
    handleEditVideo as editVideoHandler,
} from "../../components/Courses/courseHandlers";
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
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    // Custom validation function with toast notifications
    const validateFormWithToast = () => {
        const rules = [
            {
                field: "Titre fran\u00e7ais",
                message:
                    !formik.values.Title ||
                    formik.values.Title.trim().length === 0
                        ? "Le titre fran\u00e7ais est requis"
                        : "Le titre doit contenir au moins 3 caract\u00e8res",
                section: "Informations g\u00e9n\u00e9rales",
                scrollToId: "course-title",
                type: "error",
                condition: () =>
                    !formik.values.Title ||
                    formik.values.Title.trim().length < 3,
            },
            {
                field: "Description",
                message:
                    "La description doit contenir au moins 10 caract\u00e8res",
                section: "Informations g\u00e9n\u00e9rales",
                scrollToId: "course-description",
                type: "error",
                condition: () => {
                    if (!formik.values.Description) return true;
                    return (
                        formik.values.Description.replace(/<[^>]*>/g, "").trim()
                            .length < 10
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
                    !formik.values.Category ||
                    formik.values.Category.trim().length === 0,
            },
            {
                field: "Prix",
                message:
                    "Le prix doit \u00eatre positif ou 0 pour un cours gratuit",
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
                    (!formik.values.Price ||
                        parseFloat(formik.values.Price) === 0),
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
                        const textContent = value
                            .replace(/<[^>]*>/g, "")
                            .trim();
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
                        if (
                            value === null ||
                            value === undefined ||
                            value === ""
                        )
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
                loadingToast = toast.loading(
                    "Modification du cours en cours...",
                    {
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
                    },
                );

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
                console.log(
                    "✅ Backend response after update:",
                    updateResponse,
                );

                // Upload image if user selected one
                if (imageFile) {
                    console.log("Uploading image:", imageFile.name);
                    const formData = new FormData();
                    formData.append("Image", imageFile);

                    const response = await coursesAPI.uploadCourseImage(
                        courseId,
                        formData,
                    );
                    console.log("Upload response:", response);

                    // Update current image path
                    if (response.imagePath || response.Image) {
                        setCurrentCourseImage(
                            response.imagePath || response.Image,
                        );
                    }

                    // Clear the file variable
                    setImageFile(null);
                }

                // Upload new videos and PDFs if any
                const videosToUpload = videos.filter((v) => v.isNew);
                const pdfsToUpload = (formik.values.pdfs || []).filter(
                    (p) => p.file,
                );
                if (videosToUpload.length > 0 || pdfsToUpload.length > 0) {
                    console.log("📤 Uploading new videos and PDFs...");
                    setIsUploading(true);

                    const uploadFormData = new FormData();

                    // Create sections structure
                    const sections = [
                        {
                            title: "Nouveau contenu",
                            title_ar: "محتوى جديد",
                            description:
                                "Contenu ajouté lors de la modification",
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
                                v.isNew
                                    ? { ...v, isNew: false, file: undefined }
                                    : v,
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
                        errorMessage = JSON.stringify(
                            error.response.data.errors,
                        );
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
                console.log(
                    "✅ Quiz in formik after loading:",
                    formik.values.quiz,
                );

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

    // showAlert helper for AddPDFs
    const showAlertForEdit = (type, title, msg) => {
        if (type === "success") toast.success(msg || title);
        else toast.error(msg || title);
    };

    // Video management handlers (VideoSection-compatible)
    const handleVideoFileSelectEdit = videoFileSelectHandler(
        newVideo,
        setNewVideo,
        showAlertForEdit,
    );

    const handleVideoUploadEdit = () => {
        if (!newVideo.file || !newVideo.name.trim()) {
            toast.error("Nom et fichier vidéo requis");
            return;
        }
        setIsUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress = Math.min(progress + 20, 100);
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setVideos((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        name: newVideo.name,
                        description: newVideo.description,
                        url: URL.createObjectURL(newVideo.file),
                        file: newVideo.file,
                        isNew: true,
                    },
                ]);
                setNewVideo({ name: "", description: "", file: null });
                setIsUploading(false);
                setUploadProgress(0);
                const inp = document.getElementById("video-file-input");
                if (inp) inp.value = "";
                toast.success(
                    "Vidéo ajoutée ! Sauvegardez le cours pour confirmer.",
                );
            }
        }, 200);
    };

    const handleDeleteVideoEdit = (videoId) => {
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
        toast.success("Vidéo supprimée");
    };

    const handleEditVideoEdit = editVideoHandler(
        videos,
        setVideos,
        showAlertForEdit,
    );

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

                    <form onSubmit={formik.handleSubmit} className="space-y-8">
                        {/* French Fields */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold">
                                        FR
                                    </span>
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
                                        Titre{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="course-title"
                                        {...formik.getFieldProps("Title")}
                                        className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                                            formik.touched.Title &&
                                            formik.errors.Title
                                                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                                : "border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
                                        }`}
                                        placeholder="Entrez le titre du cours"
                                    />
                                    {formik.touched.Title &&
                                        formik.errors.Title && (
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
                                            formik.setFieldValue(
                                                "Description",
                                                content,
                                            )
                                        }
                                        placeholder="Décrivez le cours en détail avec formatting..."
                                        height="250px"
                                        required
                                        error={
                                            formik.touched.Description &&
                                            formik.errors.Description
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
                                        Catégorie{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="course-category"
                                        {...formik.getFieldProps("Category")}
                                        className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                                            formik.touched.Category &&
                                            formik.errors.Category
                                                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                                : "border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-emerald-300"
                                        }`}
                                        placeholder="ex: Informatique, Design..."
                                    />
                                    {formik.touched.Category &&
                                        formik.errors.Category && (
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
                                        {...formik.getFieldProps(
                                            "shortDescription",
                                        )}
                                        className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 hover:border-rose-300"
                                        placeholder="Résumé court du cours (255 caractères max)"
                                        maxLength={255}
                                    />
                                </div>

                                {/* Prerequisites Field */}
                                <div className="md:col-span-2">
                                    <RichTextEditor
                                        label="Prérequis"
                                        value={formik.values.Prerequisites}
                                        onChange={(content) =>
                                            formik.setFieldValue(
                                                "Prerequisites",
                                                content,
                                            )
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
                                    <span className="text-white text-sm font-bold">
                                        AR
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    المعلومات باللغة العربية
                                </h2>
                                <span className="text-sm text-gray-500">
                                    (اختياري)
                                </span>
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
                                            formik.setFieldValue(
                                                "Description_ar",
                                                content,
                                            )
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
                                        {...formik.getFieldProps(
                                            "Specialty_ar",
                                        )}
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
                                        {...formik.getFieldProps(
                                            "subCategory_ar",
                                        )}
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
                                        {...formik.getFieldProps(
                                            "shortDescription_ar",
                                        )}
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
                                        Sélectionnez le statut qui correspond à
                                        votre cours
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        value: "draft",
                                        label: "Brouillon",
                                        description:
                                            "Cours en cours de création",
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
                                        description:
                                            "Visible par les étudiants",
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
                                        bgColor:
                                            "from-green-400 to-emerald-500",
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
                                        onClick={() =>
                                            formik.setFieldValue(
                                                "status",
                                                status.value,
                                            )
                                        }
                                        className={`relative cursor-pointer group transition-all duration-300 ${
                                            formik.values.status ===
                                            status.value
                                                ? `${status.bgLight} ${status.borderActiveColor} border-2 shadow-lg transform scale-105`
                                                : `bg-white ${status.borderColor} border hover:shadow-md hover:scale-102`
                                        } rounded-xl p-6 flex flex-col items-center text-center space-y-3`}
                                    >
                                        {/* Selection Indicator */}
                                        {formik.values.status ===
                                            status.value && (
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
                                                formik.values.status ===
                                                status.value
                                                    ? "scale-110"
                                                    : "group-hover:scale-105"
                                            }`}
                                        >
                                            <div className="text-white">
                                                {status.icon}
                                            </div>
                                        </div>

                                        {/* Label and Description */}
                                        <div>
                                            <h4
                                                className={`font-semibold transition-colors duration-200 ${
                                                    formik.values.status ===
                                                    status.value
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
                                                formik.values.status ===
                                                status.value
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
                                                    ✓ Nouvelle image
                                                    sélectionnée
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
                                        Prix (DZD){" "}
                                        <span className="text-gray-500 text-xs">
                                            (optionnel - laissez vide pour un
                                            cours gratuit)
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...formik.getFieldProps("Price")}
                                        className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                                            formik.touched.Price &&
                                            formik.errors.Price
                                                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                                : "border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 hover:border-amber-300"
                                        }`}
                                        placeholder="0.00"
                                    />
                                    {formik.touched.Price &&
                                        formik.errors.Price && (
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
                                        Prix réduit (DZD)
                                        {(!formik.values.Price ||
                                            parseFloat(formik.values.Price) ===
                                                0) && (
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
                                            parseFloat(formik.values.Price) ===
                                                0
                                        }
                                        {...formik.getFieldProps(
                                            "discountPrice",
                                        )}
                                        className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                                            !formik.values.Price ||
                                            parseFloat(formik.values.Price) ===
                                                0
                                                ? "bg-gray-100 cursor-not-allowed border-gray-300"
                                                : formik.touched
                                                        .discountPrice &&
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
                                            formik.setFieldValue(
                                                "Level",
                                                e.target.value,
                                            );
                                            formik.setFieldValue(
                                                "difficulty",
                                                e.target.value,
                                            ); // Sync with difficulty field
                                        }}
                                        className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 hover:border-teal-300"
                                    >
                                        {difficulties.map((diff) => (
                                            <option
                                                key={diff.value}
                                                value={diff.value}
                                            >
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
                                            <option
                                                key={lang.value}
                                                value={lang.value}
                                            >
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
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
                                            <div
                                                key={index}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={objective}
                                                        onChange={(e) =>
                                                            updateObjective(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder={`Objectif ${index + 1}...`}
                                                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeObjective(index)
                                                    }
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
                                    Définissez des objectifs clairs et
                                    mesurables pour guider l&apos;apprentissage
                                </p>
                            </div>
                        </div>

                        {/* Videos Section */}
                        <VideoSection
                            videos={videos}
                            newVideo={newVideo}
                            setNewVideo={setNewVideo}
                            isUploading={isUploading}
                            uploadProgress={uploadProgress}
                            handleVideoFileSelect={handleVideoFileSelectEdit}
                            handleVideoUpload={handleVideoUploadEdit}
                            handleEditVideo={handleEditVideoEdit}
                            handleDeleteVideo={handleDeleteVideoEdit}
                            onSaveToBackend={() => {}}
                        />

                        {/* PDFs Section */}
                        <AddPDFs formik={formik} showAlert={showAlertForEdit} />

                        {/* Quiz Section */}
                        <EditQuiz formik={formik} />

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end items-center">
                            {validationErrors.length > 0 && (
                                <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 font-medium">
                                    {validationErrors.length} erreur
                                    {validationErrors.length > 1 ? "s" : ""} —
                                    voir le panneau
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
                                    {isSubmitting
                                        ? "Modification..."
                                        : "Sauvegarder"}
                                </button>
                                {validationErrors.length > 0 &&
                                    !isSubmitting && (
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
