import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "../../utils/axios";
import RichTextEditor from "../Common/RichTextEditor/RichTextEditor";

const FAQModal = ({ isOpen, onClose, onSave, faq, courses, programs }) => {
    const [formData, setFormData] = useState({
        question: "",
        question_ar: "",
        question_fr: "",
        answer: "",
        answer_ar: "",
        answer_fr: "",
        assignmentType: "home",
        courseId: "",
        programId: "",
        category: "",
        category_ar: "",
        category_fr: "",
        tags: "",
        displayOrder: 0,
        isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Pre-populate form when editing
    useEffect(() => {
        if (faq) {
            setFormData({
                question: faq.question || "",
                question_ar: faq.question_ar || "",
                question_fr: faq.question_fr || "",
                answer: faq.answer || "",
                answer_ar: faq.answer_ar || "",
                answer_fr: faq.answer_fr || "",
                assignmentType: faq.assignmentType || "home",
                courseId: faq.courseId || "",
                programId: faq.programId || "",
                category: faq.category || "",
                category_ar: faq.category_ar || "",
                category_fr: faq.category_fr || "",
                tags: faq.tags || "",
                displayOrder: faq.displayOrder || 0,
                isActive: faq.isActive !== undefined ? faq.isActive : true,
            });
        } else {
            setFormData({
                question: "",
                question_ar: "",
                question_fr: "",
                answer: "",
                answer_ar: "",
                answer_fr: "",
                assignmentType: "home",
                courseId: "",
                programId: "",
                category: "",
                category_ar: "",
                category_fr: "",
                tags: "",
                displayOrder: 0,
                isActive: true,
            });
        }
        setError("");
    }, [faq, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear course/program IDs when assignment type changes
        if (name === "assignmentType") {
            setFormData((prev) => ({
                ...prev,
                courseId: "",
                programId: "",
            }));
        }
    };

    const handleRichTextChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.question.trim() || !formData.answer.trim()) {
            setError("Question and answer are required");
            return;
        }

        if (formData.assignmentType === "course" && !formData.courseId) {
            setError("Please select a course");
            return;
        }

        if (formData.assignmentType === "program" && !formData.programId) {
            setError("Please select a program");
            return;
        }

        try {
            setLoading(true);

            const submitData = { ...formData };

            // Convert display order to number
            submitData.displayOrder = parseInt(submitData.displayOrder) || 0;

            // Clear course/program IDs based on assignment type
            if (submitData.assignmentType !== "course") {
                submitData.courseId = null;
            }
            if (submitData.assignmentType !== "program") {
                submitData.programId = null;
            }

            if (faq) {
                await axios.put(`/faqs/${faq.id}`, submitData);
            } else {
                await axios.post("/faqs", submitData);
            }

            onSave();
        } catch (error) {
            console.error("Error saving FAQ:", error);
            setError(error.response?.data?.message || "Failed to save FAQ");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-6xl mx-auto rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-white">
                            {faq ? "✏️ Modifier FAQ" : "➕ Nouvelle FAQ"}
                        </h3>
                        <p className="text-blue-100 mt-1">
                            {faq
                                ? "Modifiez les détails de cette FAQ"
                                : "Créez une nouvelle question fréquemment posée"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
                    >
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
                    {/* Error Message */}
                    {error && (
                        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center">
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Assignment Configuration Card */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-blue-600"
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
                                Configuration d'affectation
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Type d'affectation *
                                    </label>
                                    <select
                                        name="assignmentType"
                                        value={formData.assignmentType}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="home">
                                            🏠 Page d'accueil
                                        </option>
                                        <option value="global">
                                            🌍 Global (Toutes les pages)
                                        </option>
                                        <option value="course">
                                            📚 Cours spécifique
                                        </option>
                                        <option value="program">
                                            🎓 Programme spécifique
                                        </option>
                                    </select>
                                </div>

                                {formData.assignmentType === "course" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Sélectionner un cours *
                                        </label>
                                        <select
                                            name="courseId"
                                            value={formData.courseId}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            required
                                        >
                                            <option value="">
                                                Choisir un cours...
                                            </option>
                                            {courses.map((course) => (
                                                <option
                                                    key={course.id}
                                                    value={course.id}
                                                >
                                                    {course.Title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {formData.assignmentType === "program" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Sélectionner un programme *
                                        </label>
                                        <select
                                            name="programId"
                                            value={formData.programId}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            required
                                        >
                                            <option value="">
                                                Choisir un programme...
                                            </option>
                                            {programs.map((program) => (
                                                <option
                                                    key={program.id}
                                                    value={program.id}
                                                >
                                                    {program.Title ||
                                                        program.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Questions Card */}
                        <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-sm">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Questions en plusieurs langues
                            </h4>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        🇬🇧 Question (Anglais) *
                                    </label>
                                    <RichTextEditor
                                        value={formData.question}
                                        onChange={(value) =>
                                            handleRichTextChange(
                                                "question",
                                                value
                                            )
                                        }
                                        placeholder="Tapez votre question en anglais..."
                                        required
                                        label="Question en anglais"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        🇸🇦 Question (Arabe)
                                    </label>
                                    <RichTextEditor
                                        value={formData.question_ar}
                                        onChange={(value) =>
                                            handleRichTextChange(
                                                "question_ar",
                                                value
                                            )
                                        }
                                        placeholder="اكتب سؤالك باللغة العربية..."
                                        label="Question en arabe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        🇫🇷 Question (Français)
                                    </label>
                                    <RichTextEditor
                                        value={formData.question_fr}
                                        onChange={(value) =>
                                            handleRichTextChange(
                                                "question_fr",
                                                value
                                            )
                                        }
                                        placeholder="Tapez votre question en français..."
                                        label="Question en français"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Answers Card */}
                        <div className="bg-white rounded-xl p-6 border-2 border-green-100 shadow-sm">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Réponses en plusieurs langues
                            </h4>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        🇬🇧 Réponse (Anglais) *
                                    </label>
                                    <RichTextEditor
                                        value={formData.answer}
                                        onChange={(value) =>
                                            handleRichTextChange(
                                                "answer",
                                                value
                                            )
                                        }
                                        placeholder="Tapez votre réponse en anglais..."
                                        required
                                        label="Réponse en anglais"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        🇸🇦 Réponse (Arabe)
                                    </label>
                                    <RichTextEditor
                                        value={formData.answer_ar}
                                        onChange={(value) =>
                                            handleRichTextChange(
                                                "answer_ar",
                                                value
                                            )
                                        }
                                        placeholder="اكتب إجابتك باللغة العربية..."
                                        label="Réponse en arabe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        🇫🇷 Réponse (Français)
                                    </label>
                                    <RichTextEditor
                                        value={formData.answer_fr}
                                        onChange={(value) =>
                                            handleRichTextChange(
                                                "answer_fr",
                                                value
                                            )
                                        }
                                        placeholder="Tapez votre réponse en français..."
                                        label="Réponse en français"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Categories & Settings Card */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                    />
                                </svg>
                                Catégories et paramètres
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        🇬🇧 Catégorie (Anglais)
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="ex: Payment, Enrollment, Technical"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        🇸🇦 Catégorie (Arabe)
                                    </label>
                                    <input
                                        type="text"
                                        name="category_ar"
                                        value={formData.category_ar}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="مثال: الدفع، التسجيل، تقني"
                                        dir="rtl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        🇫🇷 Catégorie (Français)
                                    </label>
                                    <input
                                        type="text"
                                        name="category_fr"
                                        value={formData.category_fr}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="ex: Paiement, Inscription, Technique"
                                    />
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        📊 Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        name="displayOrder"
                                        value={formData.displayOrder}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        min="0"
                                    />
                                </div> */}
                            </div>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        🏷️ Tags (séparés par des virgules)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="paiement, inscription, aide, support"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-4 h-4"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">
                                            ✅ FAQ active (visible par les
                                            utilisateurs)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 font-medium"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Enregistrement...
                            </div>
                        ) : faq ? (
                            "💾 Mettre à jour"
                        ) : (
                            "✨ Créer FAQ"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

FAQModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    faq: PropTypes.object,
    courses: PropTypes.array.isRequired,
    programs: PropTypes.array.isRequired,
};

export default FAQModal;
