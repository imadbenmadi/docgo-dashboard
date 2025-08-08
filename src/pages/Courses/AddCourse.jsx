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

                // Upload course Image if selected
                if (courseImage) {
                    await uploadCourseImage(courseId, courseImage);
                }

                // Upload cover Image if selected
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
            console.error("Error uploading course Image:", error);
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
            console.error("Error uploading cover Image:", error);
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
                                                    une Image
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
                                                    une Image de couverture
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
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            Prix (€) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...formik.getFieldProps("Price")}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all ${
                                                formik.touched.Price && formik.errors.Price
                                                    ? "border-red-500"
                                                    : "border-green-300"
                                            }`}
                                            placeholder="0.00"
                                        />
                                        {formik.touched.Price && formik.errors.Price && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {formik.errors.Price}
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                                        <label className="flex items-center gap-2 text-sm font-medium text-orange-800 mb-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Prix réduit (€)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...formik.getFieldProps("discountPrice")}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm transition-all ${
                                                formik.touched.discountPrice && formik.errors.discountPrice
                                                    ? "border-red-500"
                                                    : "border-orange-300"
                                            }`}
                                            placeholder="Prix en promotion"
                                        />
                                        {formik.touched.discountPrice && formik.errors.discountPrice && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Niveau
                                        </label>
                                        <select
                                            {...formik.getFieldProps("Level")}
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

                                {/* Language and Status */}
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl border border-cyan-200">
                                        <label className="flex items-center gap-2 text-sm font-medium text-cyan-800 mb-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                            </svg>
                                            Langue
                                        </label>
                                        <select
                                            {...formik.getFieldProps("Language")}
                                            className="w-full px-4 py-3 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm transition-all"
                                        >
                                            {languages.map((lang) => (
                                                <option key={lang.value} value={lang.value}>
                                                    {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Statut
                                        </label>
                                        <select
                                            {...formik.getFieldProps("status")}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white shadow-sm transition-all"
                                        >
                                            {statuses.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Course Section */}
                            <div className="mt-6 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
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
                                        <label htmlFor="isFeatured" className="flex items-center gap-2 text-sm font-medium text-yellow-800 cursor-pointer">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            Cours vedette
                                        </label>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            Mettre en avant ce cours sur la page d&apos;accueil et dans les sections promotionnelles
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Prerequisites Section */}
                            <div className="mt-6">
                                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200">
                                    <label className="flex items-center gap-2 text-sm font-medium text-rose-800 mb-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h.01M7 12h.01M7 17h.01M17 7h.01M17 12h.01M17 17h.01" />
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
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Utilisez l&apos;éditeur de texte enrichi pour une meilleure mise en forme
                                    </p>
                                </div>
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
