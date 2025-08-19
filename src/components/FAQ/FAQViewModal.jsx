import PropTypes from "prop-types";
import RichTextDisplay from "../Common/RichTextEditor/RichTextDisplay";

const FAQViewModal = ({ isOpen, onClose, faq }) => {
    if (!isOpen || !faq) return null;

    const getAssignmentTypeDisplay = () => {
        switch (faq.assignmentType) {
            case "home":
                return {
                    label: "🏠 Page d'accueil",
                    color: "bg-green-100 text-green-800",
                };
            case "global":
                return {
                    label: "🌍 Global",
                    color: "bg-blue-100 text-blue-800",
                };
            case "course":
                return {
                    label: "📚 Cours spécifique",
                    color: "bg-purple-100 text-purple-800",
                };
            case "program":
                return {
                    label: "🎓 Programme spécifique",
                    color: "bg-indigo-100 text-indigo-800",
                };
            default:
                return {
                    label: faq.assignmentType,
                    color: "bg-gray-100 text-gray-800",
                };
        }
    };

    const assignmentType = getAssignmentTypeDisplay();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-5xl mx-auto rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white">
                                👁️ Aperçu FAQ
                            </h3>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${assignmentType.color} bg-opacity-90`}
                            >
                                {assignmentType.label}
                            </span>
                        </div>
                        <p className="text-indigo-100">
                            Prévisualisation complète de la FAQ
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
                <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
                    <div className="p-8 space-y-8">
                        {/* FAQ Info Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
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
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Informations générales
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-2xl font-bold text-green-600">
                                        {faq.helpfulCount || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Votes utiles
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {faq.viewCount || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Vues
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {faq.displayOrder}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Ordre
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div
                                        className={`text-2xl font-bold ${
                                            faq.isActive
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {faq.isActive ? "✅" : "❌"}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {faq.isActive ? "Active" : "Inactive"}
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            {(faq.category ||
                                faq.category_ar ||
                                faq.category_fr) && (
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {faq.category && (
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-xs font-medium text-gray-500 mb-1">
                                                🇬🇧 Catégorie
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                {faq.category}
                                            </div>
                                        </div>
                                    )}
                                    {faq.category_ar && (
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-xs font-medium text-gray-500 mb-1">
                                                🇸🇦 التصنيف
                                            </div>
                                            <div
                                                className="font-medium text-gray-900"
                                                dir="rtl"
                                            >
                                                {faq.category_ar}
                                            </div>
                                        </div>
                                    )}
                                    {faq.category_fr && (
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-xs font-medium text-gray-500 mb-1">
                                                🇫🇷 Catégorie
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                {faq.category_fr}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tags */}
                            {faq.tags && (
                                <div className="mt-4">
                                    <div className="text-xs font-medium text-gray-500 mb-2">
                                        🏷️ Tags
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {faq.tags
                                            .split(",")
                                            .map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                                >
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Questions Card */}
                        <div className="bg-white rounded-xl p-6 border-2 border-green-100 shadow-sm">
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
                                Questions
                            </h4>

                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <span className="text-sm font-semibold text-gray-800">
                                            🇬🇧 Question (Anglais)
                                        </span>
                                        {!faq.question && (
                                            <span className="ml-2 text-xs text-gray-500 italic">
                                                Non renseigné
                                            </span>
                                        )}
                                    </div>
                                    {faq.question ? (
                                        <RichTextDisplay
                                            content={faq.question}
                                            className="prose max-w-none"
                                        />
                                    ) : (
                                        <div className="text-gray-400 italic">
                                            Aucune question en anglais
                                        </div>
                                    )}
                                </div>

                                {faq.question_ar && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <span className="text-sm font-semibold text-gray-800">
                                                🇸🇦 السؤال (العربية)
                                            </span>
                                        </div>
                                        <RichTextDisplay
                                            content={faq.question_ar}
                                            className="prose max-w-none"
                                            textClassName="text-right"
                                        />
                                    </div>
                                )}

                                {faq.question_fr && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <span className="text-sm font-semibold text-gray-800">
                                                🇫🇷 Question (Français)
                                            </span>
                                        </div>
                                        <RichTextDisplay
                                            content={faq.question_fr}
                                            className="prose max-w-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Answers Card */}
                        <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-sm">
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
                                Réponses
                            </h4>

                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <span className="text-sm font-semibold text-gray-800">
                                            🇬🇧 Réponse (Anglais)
                                        </span>
                                        {!faq.answer && (
                                            <span className="ml-2 text-xs text-gray-500 italic">
                                                Non renseigné
                                            </span>
                                        )}
                                    </div>
                                    {faq.answer ? (
                                        <RichTextDisplay
                                            content={faq.answer}
                                            className="prose max-w-none"
                                        />
                                    ) : (
                                        <div className="text-gray-400 italic">
                                            Aucune réponse en anglais
                                        </div>
                                    )}
                                </div>

                                {faq.answer_ar && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <span className="text-sm font-semibold text-gray-800">
                                                🇸🇦 الجواب (العربية)
                                            </span>
                                        </div>
                                        <RichTextDisplay
                                            content={faq.answer_ar}
                                            className="prose max-w-none"
                                            textClassName="text-right"
                                        />
                                    </div>
                                )}

                                {faq.answer_fr && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <span className="text-sm font-semibold text-gray-800">
                                                🇫🇷 Réponse (Français)
                                            </span>
                                        </div>
                                        <RichTextDisplay
                                            content={faq.answer_fr}
                                            className="prose max-w-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
                    >
                        🔙 Fermer l'aperçu
                    </button>
                </div>
            </div>
        </div>
    );
};

FAQViewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    faq: PropTypes.object,
};

export default FAQViewModal;
