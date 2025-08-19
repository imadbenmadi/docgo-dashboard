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
    const [objectives, setObjectives] = useState([]);

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
            parseFloat(formik.values.discountPrice) >=
                parseFloat(formik.values.Price)
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
            Specialty: "",
            shortDescription: "",
            subCategory: "",

            // Arabic fields
            Title_ar: "",
            Description_ar: "",
            Category_ar: "",
            Specialty_ar: "",
            shortDescription_ar: "",
            subCategory_ar: "",

            // Course details
            Price: "",
            discountPrice: "",
            Level: "beginner",
            difficulty: "beginner", // Added for frontend filter compatibility
            duration: "",
            Language: "French",
            status: "draft",
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
                        const textContent = value
                            .replace(/<[^>]*>/g, "")
                            .trim();
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
                        if (
                            value === null ||
                            value === undefined ||
                            value === ""
                        )
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
                    Specialty: course.Specialty || "",
                    Specialty_ar: course.Specialty_ar || "",
                    shortDescription: course.shortDescription || "",
                    shortDescription_ar: course.shortDescription_ar || "",
                    subCategory: course.subCategory || "",
                    subCategory_ar: course.subCategory_ar || "",
                    Price: course.Price || "",
                    discountPrice: course.discountPrice || "",
                    Level: course.Level || course.difficulty || "beginner",
                    difficulty: course.difficulty || course.Level || "beginner", // Added for frontend filter compatibility
                    duration: course.duration || "",
                    Language: course.Language || course.language || "French",
                    status: course.status || "draft",
                    Prerequisites:
                        course.Prerequisites || course.prerequisites || "",
                    objectives: course.objectives || [], // Learning objectives
                    isFeatured: course.isFeatured || false,
                    certificate: course.certificate || false, // Added for certificate filter
                });

                // Set objectives state
                setObjectives(course.objectives || []);

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
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                        Titre{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps("Title")}
                                        className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                                            formik.touched.Title &&
                                            formik.errors.Title
                                                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                                : "border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-300"
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
                                                d="M4 6h16M4 12h16M4 18h7"
                                            />
                                        </svg>
                                        Description{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-purple-200 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 transition-all duration-200">
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
                                    </div>
                                    {formik.touched.Description &&
                                        formik.errors.Description && (
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
                                        Spécialité
                                    </label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps("Specialty")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="ex: React, Data Science, Marketing..."
                                    />
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
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold">
                                        AR
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
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
                                        التخصص
                                    </label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps(
                                            "Specialty_ar"
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
                        {/* Status Selection Section */}
                        <div className="mt-8 border-t pt-6">
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
                                                status.value
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
                                        Prix réduit (€)
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
                                            "discountPrice"
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
                                                e.target.value
                                            );
                                            formik.setFieldValue(
                                                "difficulty",
                                                e.target.value
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
                                        Les étudiants recevront un certificat à
                                        la fin de ce cours
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
                                    Utilisez l&apos;éditeur de texte enrichi
                                    pour une meilleure mise en forme
                                </label>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200 focus-within:border-gray-500 focus-within:ring-4 focus-within:ring-gray-100 transition-all duration-200">
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
                                    {objectives.map((objective, index) => (
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
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={`Objectif ${
                                                        index + 1
                                                    }...`}
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
