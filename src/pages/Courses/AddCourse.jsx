import { useFormik } from "formik";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import * as Yup from "yup";
import { coursesAPI } from "../../API/Courses";
import { RichTextEditor } from "../../components/Common/RichTextEditor";

const AddCourse = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);
    const [courseImage, setCourseImage] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [uploading, setUploading] = useState({
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
            // French fields (required)
            Title: "",
            Description: "",
            Category: "",
            shortDescription: "",
            subCategory: "",

            // Arabic fields (optional)
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
                    "Création du cours en cours...",
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

                // First create the course
                const courseData = {
                    ...values,
                };

                const response = await coursesAPI.createCourse(courseData);
                console.log("Course created:", response);

                const courseId = response.course.id;

                // Upload course image if selected
                if (courseImage) {
                    await uploadCourseImage(courseId, courseImage);
                }

                // Upload cover image if selected
                if (coverImage) {
                    await uploadCoverImage(courseId, coverImage);
                }

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

                setTimeout(() => {
                    navigate("/Courses");
                }, 1500);
            } catch (error) {
                console.error("Error creating course:", error);
                toast.error(
                    error.response?.data?.error ||
                        "Impossible de créer le cours",
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

    const uploadCourseImage = async (courseId, file) => {
        setUploading((prev) => ({ ...prev, courseImage: true }));
        try {
            const formData = new FormData();
            formData.append("CoursePic", file);

            await coursesAPI.uploadCourseImage(courseId, formData);
        } catch (error) {
            console.error("Error uploading course image:", error);
            throw error;
        } finally {
            setUploading((prev) => ({ ...prev, courseImage: false }));
        }
    };

    const uploadCoverImage = async (courseId, file) => {
        setUploading((prev) => ({ ...prev, coverImage: true }));
        try {
            const formData = new FormData();
            formData.append("CoverImage", file);

            await coursesAPI.uploadCoverImage(courseId, formData);
        } catch (error) {
            console.error("Error uploading cover image:", error);
            throw error;
        } finally {
            setUploading((prev) => ({ ...prev, coverImage: false }));
        }
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

    const statuses = [
        { value: "draft", label: "Brouillon" },
        { value: "published", label: "Publié" },
    ];

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
                                Nouveau Cours
                            </h1>
                            <p className="text-gray-600">
                                Créez un nouveau cours avec support multilingue
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
                                    <RichTextEditor
                                        label="Description"
                                        value={formik.values.Description}
                                        onChange={(content) =>
                                            formik.setFieldValue(
                                                "Description",
                                                content
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
                                    <RichTextEditor
                                        label="الوصف"
                                        value={formik.values.Description_ar}
                                        onChange={(content) =>
                                            formik.setFieldValue(
                                                "Description_ar",
                                                content
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
                                            document
                                                .getElementById(
                                                    "courseImageInput"
                                                )
                                                .click()
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
                                                    Cliquez pour sélectionner
                                                    une image
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    PNG, JPG, WebP jusqu&apos;à
                                                    10MB
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
                                    {uploading.courseImage && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">
                                                    Téléchargement...
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Cover Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image de Couverture
                                    </label>
                                    <div
                                        className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    "coverImageInput"
                                                )
                                                .click()
                                        }
                                    >
                                        {coverImage ? (
                                            <div className="relative">
                                                <img
                                                    src={URL.createObjectURL(
                                                        coverImage
                                                    )}
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
                                                    Cliquez pour sélectionner
                                                    une image de couverture
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    PNG, JPG, WebP jusqu&apos;à
                                                    10MB
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
                                    {uploading.coverImage && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">
                                                    Téléchargement...
                                                </span>
                                            </div>
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
                                            d'accueil
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prérequis
                                </label>
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
                                <p className="text-sm text-gray-500 mt-1">
                                    Utilisez l&apos;éditeur de texte enrichi
                                    pour une meilleure mise en forme
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
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {isSubmitting
                                    ? "Création..."
                                    : "Créer le cours"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddCourse;
