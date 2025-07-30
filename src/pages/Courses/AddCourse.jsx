import { useFormik } from "formik";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { coursesAPI } from "../../API/Courses";
import { RichTextEditor } from "../../components/Common/RichTextEditor";

const AddCourse = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);
    const navigate = useNavigate();

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
            setIsSubmitting(true);
            try {
                // Send Prerequisites as HTML content (not converted to array)
                const courseData = {
                    ...values,
                    // Prerequisites are now rich text content, sent as-is
                };

                await coursesAPI.createCourse(courseData);

                Swal.fire({
                    icon: "success",
                    title: "Succès !",
                    text: "Le cours a été créé avec succès",
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate("/Courses");
                });
            } catch (error) {
                console.error("Error creating course:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text:
                        error.response?.data?.error ||
                        "Impossible de créer le cours",
                });
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleThumbnailUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Le fichier est trop volumineux. Maximum 10MB.",
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setThumbnail(e.target.result);
            };
            reader.readAsDataURL(file);
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
                                    {...formik.getFieldProps("discountPrice")}
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
                                Utilisez l&apos;éditeur de texte enrichi pour
                                une meilleure mise en forme
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
                            {isSubmitting ? "Création..." : "Créer le cours"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCourse;
