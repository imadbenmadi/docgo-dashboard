import { useFormik } from "formik";
import {
    ArrowLeft,
    Save,
    Loader2,
    Edit,
    X,
    Upload,
    Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { coursesAPI } from "../../API/Courses";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";

const EditCourseNew = () => {
    const { courseId } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [courseNotFound, setCourseNotFound] = useState(false);

    // Image management states
    const [courseImageFile, setCourseImageFile] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [courseImagePreview, setCourseImagePreview] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [currentCourseImage, setCurrentCourseImage] = useState(null);
    const [currentCoverImage, setCurrentCoverImage] = useState(null);
    const [uploading, setUploading] = useState({
        courseImage: false,
        coverImage: false,
    });
    const [deleting, setDeleting] = useState({
        courseImage: false,
        coverImage: false,
    });

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
        if (
            !formik.values.Category ||
            formik.values.Category.trim().length === 0
        ) {
            errors.push("La catégorie est requise");
        }

        // Price validation
        if (!formik.values.Price || formik.values.Price <= 0) {
            errors.push("Le prix est requis et doit être positif");
        }

        // Discount price validation
        if (
            formik.values.discountPrice &&
            parseFloat(formik.values.discountPrice) >=
                parseFloat(formik.values.Price)
        ) {
            errors.push("Le prix réduit doit être inférieur au prix normal");
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
            shortDescription: "",
            subCategory: "",

            // Arabic fields
            Title_ar: "",
            Description_ar: "",
            Category_ar: "",
            shortDescription_ar: "",
            subCategory_ar: "",

            // Course details
            Price: "",
            discountPrice: "",
            Level: "beginner",
            duration: "",
            Language: "French",
            status: "draft",
            Prerequisites: "",
            isFeatured: false,
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
                    }
                ),
            Category: Yup.string().required("La catégorie est requise"),
            Price: Yup.number()
                .required("Le prix est requis")
                .min(0, "Le prix doit être positif"),
            discountPrice: Yup.number().test(
                "discount-validation",
                "Le prix réduit doit être inférieur au prix normal",
                function (value) {
                    if (!value) return true;
                    return value < this.parent.Price;
                }
            ),
        }),
        onSubmit: async (values) => {
            // Validate with toast notifications first
            if (!validateFormWithToast()) {
                return; // Stop submission if validation fails
            }

            setIsSubmitting(true);

            try {
                // Show loading toast
                const loadingToast = toast.loading(
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
                    }
                );

                // Convert Prerequisites string to array if needed
                const courseData = {
                    ...values,
                };

                await coursesAPI.updateCourse(courseId, courseData);

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
                toast.error(
                    error.response?.data?.error ||
                        "Impossible de modifier le cours",
                    {
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
                    }
                );
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
                    shortDescription: course.shortDescription || "",
                    shortDescription_ar: course.shortDescription_ar || "",
                    subCategory: course.subCategory || "",
                    subCategory_ar: course.subCategory_ar || "",
                    Price: course.Price || "",
                    discountPrice: course.discountPrice || "",
                    Level: course.Level || course.difficulty || "beginner",
                    duration: course.duration || "",
                    Language: course.Language || course.language || "French",
                    status: course.status || "draft",
                    Prerequisites:
                        course.Prerequisites || course.prerequisites || "",
                    isFeatured: course.isFeatured || false,
                });

                // Set current Images if they exist
                if (course.Image || course.Image) {
                    setCurrentCourseImage(course.Image || course.Image);
                }
                if (course.coverImage || course.CoverImage) {
                    setCurrentCoverImage(
                        course.coverImage || course.CoverImage
                    );
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

    const statuses = [
        { value: "draft", label: "Brouillon" },
        { value: "published", label: "Publié" },
        { value: "archived", label: "Archivé" },
    ];

    // Image handling functions
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

            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    "Seuls les fichiers JPEG, PNG et WebP sont autorisés.",
                    {
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
                    }
                );
                return;
            }

            setCourseImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setCourseImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            toast.success("Image sélectionnée avec succès ! 📸", {
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

            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    "Seuls les fichiers JPEG, PNG et WebP sont autorisés.",
                    {
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
                    }
                );
                return;
            }

            setCoverImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

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

    const uploadCourseImage = async () => {
        if (!courseImageFile) return;

        const loadingToast = toast.loading("Téléchargement de l'Image...", {
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

        setUploading((prev) => ({ ...prev, courseImage: true }));
        try {
            const formData = new FormData();
            formData.append("CoursePic", courseImageFile);

            await coursesAPI.uploadCourseImage(courseId, formData);

            // Update current Image and clear preview
            setCurrentCourseImage(courseImagePreview);
            setCourseImageFile(null);
            setCourseImagePreview(null);

            toast.dismiss(loadingToast);
            toast.success("Image du cours mise à jour avec succès ! 📸", {
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
                icon: "📸",
            });
        } catch (error) {
            console.error("Error uploading course Image:", error);
            toast.dismiss(loadingToast);
            toast.error("Impossible de télécharger l'Image du cours", {
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
            setUploading((prev) => ({ ...prev, courseImage: false }));
        }
    };

    const uploadCoverImage = async () => {
        if (!coverImageFile) return;

        const loadingToast = toast.loading(
            "Téléchargement de l'Image de couverture...",
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
            }
        );

        setUploading((prev) => ({ ...prev, coverImage: true }));
        try {
            const formData = new FormData();
            formData.append("CoverImage", coverImageFile);

            await coursesAPI.uploadCoverImage(courseId, formData);

            // Update current Image and clear preview
            setCurrentCoverImage(coverImagePreview);
            setCoverImageFile(null);
            setCoverImagePreview(null);

            toast.dismiss(loadingToast);
            toast.success("Image de couverture mise à jour ! 🎨", {
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
                icon: "🎨",
            });
        } catch (error) {
            console.error("Error uploading cover Image:", error);
            toast.dismiss(loadingToast);
            toast.error("Impossible de télécharger l'Image de couverture", {
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
            setUploading((prev) => ({ ...prev, coverImage: false }));
        }
    };

    const deleteCourseImage = async () => {
        const result = await Swal.fire({
            title: "Êtes-vous sûr ?",
            text: "Voulez-vous vraiment supprimer l'Image du cours ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
        });

        if (result.isConfirmed) {
            setDeleting((prev) => ({ ...prev, courseImage: true }));
            try {
                await coursesAPI.deleteCourseImage(courseId);
                setCurrentCourseImage(null);

                Swal.fire({
                    icon: "success",
                    title: "Supprimé !",
                    text: "L'Image du cours a été supprimée",
                    confirmButtonText: "OK",
                });
            } catch (error) {
                console.error("Error deleting course Image:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Impossible de supprimer l'Image du cours",
                });
            } finally {
                setDeleting((prev) => ({ ...prev, courseImage: false }));
            }
        }
    };

    const deleteCoverImage = async () => {
        const result = await Swal.fire({
            title: "Êtes-vous sûr ?",
            text: "Voulez-vous vraiment supprimer l'Image de couverture ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
        });

        if (result.isConfirmed) {
            setDeleting((prev) => ({ ...prev, coverImage: true }));
            try {
                await coursesAPI.deleteCoverImage(courseId);
                setCurrentCoverImage(null);

                Swal.fire({
                    icon: "success",
                    title: "Supprimé !",
                    text: "L'Image de couverture a été supprimée",
                    confirmButtonText: "OK",
                });
            } catch (error) {
                console.error("Error deleting cover Image:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Impossible de supprimer l'Image de couverture",
                });
            } finally {
                setDeleting((prev) => ({ ...prev, coverImage: false }));
            }
        }
    };

    const clearCourseImagePreview = () => {
        setCourseImageFile(null);
        setCourseImagePreview(null);
    };

    const clearCoverImagePreview = () => {
        setCoverImageFile(null);
        setCoverImagePreview(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate("/Courses")}
                            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Modifier le Cours
                            </h1>
                            <p className="text-gray-600">
                                Modifiez les informations du cours
                            </p>
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* French Fields */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                        FR
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Informations en Français
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Titre{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps("Title")}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formik.touched.Title &&
                                            formik.errors.Title
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="Entrez le titre du cours"
                                    />
                                    {formik.touched.Title &&
                                        formik.errors.Title && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formik.errors.Title}
                                            </p>
                                        )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <RichTextEditor
                                        value={formik.values.Description}
                                        onChange={(content) =>
                                            formik.setFieldValue(
                                                "Description",
                                                content
                                            )
                                        }
                                        placeholder="Décrivez le cours en détail"
                                        error={
                                            formik.touched.Description &&
                                            formik.errors.Description
                                        }
                                    />
                                    {formik.touched.Description &&
                                        formik.errors.Description && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formik.errors.Description}
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catégorie{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps("Category")}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formik.touched.Category &&
                                            formik.errors.Category
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="ex: Informatique, Design..."
                                    />
                                    {formik.touched.Category &&
                                        formik.errors.Category && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formik.errors.Category}
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sous-catégorie
                                    </label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps("subCategory")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="ex: Développement web, UI/UX..."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description courte
                                    </label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps(
                                            "shortDescription"
                                        )}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الوصف
                                    </label>
                                    <RichTextEditor
                                        value={formik.values.Description_ar}
                                        onChange={(content) =>
                                            formik.setFieldValue(
                                                "Description_ar",
                                                content
                                            )
                                        }
                                        placeholder="اوصف الدورة بالتفصيل"
                                        direction="rtl"
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
                                        الفئة الفرعية
                                    </label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps(
                                            "subCategory_ar"
                                        )}
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
                                        {...formik.getFieldProps(
                                            "shortDescription_ar"
                                        )}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="ملخص قصير للدورة (255 حرف كحد أقصى)"
                                        maxLength={255}
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Course Images Management */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Gestion des Images
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Course Image */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                                        Image du Cours
                                    </h3>

                                    {/* Current Image Display */}
                                    {currentCourseImage &&
                                        !courseImagePreview && (
                                            <div className="mb-4">
                                                <div className="relative group">
                                                    <img
                                                        src={`${
                                                            import.meta.env
                                                                .VITE_API_URL
                                                        }${currentCourseImage}`}
                                                        alt="Image actuelle du cours"
                                                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                deleteCourseImage
                                                            }
                                                            disabled={
                                                                deleting.courseImage
                                                            }
                                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                                        >
                                                            {deleting.courseImage ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Survolez l&apos;Image pour
                                                    voir l&apos;option de
                                                    suppression
                                                </p>
                                            </div>
                                        )}

                                    {/* Image Preview */}
                                    {courseImagePreview && (
                                        <div className="mb-4">
                                            <div className="relative">
                                                <img
                                                    src={courseImagePreview}
                                                    alt="Aperçu de l'Image du cours"
                                                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={
                                                        clearCourseImagePreview
                                                    }
                                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={uploadCourseImage}
                                                    disabled={
                                                        uploading.courseImage
                                                    }
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                                >
                                                    {uploading.courseImage ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4" />
                                                    )}
                                                    {uploading.courseImage
                                                        ? "Téléchargement..."
                                                        : "Télécharger"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={
                                                        clearCourseImagePreview
                                                    }
                                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    {!courseImagePreview && (
                                        <div>
                                            <input
                                                type="file"
                                                id="course-Image-upload"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={
                                                    handleCourseImageUpload
                                                }
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="course-Image-upload"
                                                className="w-full h-48 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50"
                                            >
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-gray-600 text-center">
                                                    {currentCourseImage
                                                        ? "Changer l'Image du cours"
                                                        : "Ajouter une Image du cours"}
                                                </span>
                                                <span className="text-sm text-gray-400 mt-1">
                                                    JPEG, PNG, WebP (max 10MB)
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Cover Image */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                                        Image de Couverture
                                    </h3>

                                    {/* Current Image Display */}
                                    {currentCoverImage &&
                                        !coverImagePreview && (
                                            <div className="mb-4">
                                                <div className="relative group">
                                                    <img
                                                        src={`${
                                                            import.meta.env
                                                                .VITE_API_URL
                                                        }${currentCoverImage}`}
                                                        alt="Image de couverture actuelle"
                                                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                deleteCoverImage
                                                            }
                                                            disabled={
                                                                deleting.coverImage
                                                            }
                                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                                        >
                                                            {deleting.coverImage ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Survolez l&apos;Image pour
                                                    voir l&apos;option de
                                                    suppression
                                                </p>
                                            </div>
                                        )}

                                    {/* Image Preview */}
                                    {coverImagePreview && (
                                        <div className="mb-4">
                                            <div className="relative">
                                                <img
                                                    src={coverImagePreview}
                                                    alt="Aperçu de l'Image de couverture"
                                                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={
                                                        clearCoverImagePreview
                                                    }
                                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={uploadCoverImage}
                                                    disabled={
                                                        uploading.coverImage
                                                    }
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                                >
                                                    {uploading.coverImage ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4" />
                                                    )}
                                                    {uploading.coverImage
                                                        ? "Téléchargement..."
                                                        : "Télécharger"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={
                                                        clearCoverImagePreview
                                                    }
                                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    {!coverImagePreview && (
                                        <div>
                                            <input
                                                type="file"
                                                id="cover-Image-upload"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={
                                                    handleCoverImageUpload
                                                }
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="cover-Image-upload"
                                                className="w-full h-48 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50"
                                            >
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-gray-600 text-center">
                                                    {currentCoverImage
                                                        ? "Changer l'Image de couverture"
                                                        : "Ajouter une Image de couverture"}
                                                </span>
                                                <span className="text-sm text-gray-400 mt-1">
                                                    JPEG, PNG, WebP (max 10MB)
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Course Details */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Détails du Cours
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix (€){" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...formik.getFieldProps("Price")}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formik.touched.Price &&
                                            formik.errors.Price
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="0.00"
                                    />
                                    {formik.touched.Price &&
                                        formik.errors.Price && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formik.errors.Price}
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix réduit (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...formik.getFieldProps(
                                            "discountPrice"
                                        )}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            formik.touched.discountPrice &&
                                            formik.errors.discountPrice
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="Prix en promotion"
                                    />
                                    {formik.touched.discountPrice &&
                                        formik.errors.discountPrice && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formik.errors.discountPrice}
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Durée (heures)
                                    </label>
                                    <input
                                        type="number"
                                        {...formik.getFieldProps("duration")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="ex: 10"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Niveau
                                    </label>
                                    <select
                                        {...formik.getFieldProps("Level")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Langue
                                    </label>
                                    <select
                                        {...formik.getFieldProps("Language")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <select
                                        {...formik.getFieldProps("status")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {statuses.map((status) => (
                                            <option
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Is Featured Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        id="isFeatured"
                                        name="isFeatured"
                                        type="checkbox"
                                        checked={formik.values.isFeatured}
                                        onChange={formik.handleChange}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="isFeatured"
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        Cours vedette
                                        <span className="text-gray-500 text-xs block">
                                            Mettre en avant ce cours sur la page
                                            d&apos;accueil
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prérequis:{" "}
                                    <span className="text-gray-500 font-bold text-xs">
                                        utilisez l&apos;éditeur de texte enrichi
                                        pour une meilleure mise en forme
                                    </span>
                                </label>
                                {/* <textarea
                                {...formik.getFieldProps("Prerequisites")}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Listez les prérequis séparés par des virgules"
                            /> */}

                                <RichTextEditor
                                    value={formik.values.Prerequisites}
                                    onChange={(content) =>
                                        formik.setFieldValue(
                                            "Prerequisites",
                                            content
                                        )
                                    }
                                    placeholder="Expliquez les prérequis du cours"
                                />
                            </div>
                        </div>

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
                                {isSubmitting
                                    ? "Modification..."
                                    : "Sauvegarder"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditCourseNew;
