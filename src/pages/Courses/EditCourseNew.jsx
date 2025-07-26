import { useFormik } from "formik";
import { ArrowLeft, Save, Loader2, Edit, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { coursesAPI } from "../../API/Courses";

const EditCourseNew = () => {
    const { courseId } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [courseNotFound, setCourseNotFound] = useState(false);
    const navigate = useNavigate();

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
        },
        validationSchema: Yup.object({
            Title: Yup.string()
                .required("Le titre français est requis")
                .min(3, "Le titre doit contenir au moins 3 caractères"),
            Description: Yup.string()
                .required("La description française est requise")
                .min(10, "La description doit contenir au moins 10 caractères"),
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
                // Convert Prerequisites string to array if needed
                const courseData = {
                    ...values,
                    Prerequisites: Array.isArray(values.Prerequisites)
                        ? values.Prerequisites
                        : values.Prerequisites
                        ? values.Prerequisites.split(",").map((p) => p.trim())
                        : [],
                };

                await coursesAPI.updateCourse(courseId, courseData);

                Swal.fire({
                    icon: "success",
                    title: "Succès !",
                    text: "Le cours a été modifié avec succès",
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate("/AllCourses");
                });
            } catch (error) {
                console.error("Error updating course:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text:
                        error.response?.data?.error ||
                        "Impossible de modifier le cours",
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
                    Prerequisites: Array.isArray(course.Prerequisites)
                        ? course.Prerequisites.join(", ")
                        : course.prerequisites || "",
                });
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
                        onClick={() => navigate("/AllCourses")}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retour aux cours
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/AllCourses")}
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
                                <textarea
                                    {...formik.getFieldProps("Description")}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        formik.touched.Description &&
                                        formik.errors.Description
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Décrivez le cours en détail"
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
                                <textarea
                                    {...formik.getFieldProps("Description_ar")}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="اوصف الدورة بالتفصيل"
                                    dir="rtl"
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
                            <textarea
                                {...formik.getFieldProps("Prerequisites")}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Listez les prérequis séparés par des virgules"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Séparez les prérequis par des virgules (ex:
                                HTML, CSS, JavaScript)
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/AllCourses")}
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
                            {isSubmitting ? "Modification..." : "Sauvegarder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCourseNew;
