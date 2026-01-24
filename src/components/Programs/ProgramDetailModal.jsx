import {
    Building2,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    ExternalLink,
    MapPin,
    PlayCircle,
    Star,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RichTextDisplay from "../Common/RichTextEditor/RichTextDisplay";
import VideoPlayer from "../Common/VideoPlayer";

const ProgramDetailModal = ({ program, isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen || !program) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "Non définie";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount, currency = "DZD") => {
        if (!amount) return "Non défini";
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "open":
                return "bg-green-100 text-green-800 border-green-200";
            case "closed":
                return "bg-red-100 text-red-800 border-red-200";
            case "draft":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "coming_soon":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case "open":
                return "Ouvert";
            case "closed":
                return "Fermé";
            case "draft":
                return "Brouillon";
            case "coming_soon":
                return "Bientôt";
            default:
                return status || "Inconnu";
        }
    };

    const handleEdit = () => {
        navigate(`/Programs/${program.id}/Edit`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="relative">
                    {program.Image ? (
                        <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
                            <img
                                src={program.Image}
                                alt={program.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
                            <div className="text-8xl opacity-20">🎓</div>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-600 p-2 rounded-full hover:bg-opacity-100 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Status and Featured Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                                program.status,
                            )}`}
                        >
                            {getStatusText(program.status)}
                        </span>
                        {program.isFeatured && (
                            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                    Vedette
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[calc(90vh-16rem)] overflow-y-auto">
                    {/* Title and Actions */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {program.title}
                            </h1>
                            {program.title_ar && (
                                <h1
                                    className="text-2xl font-bold text-gray-600 mb-2"
                                    dir="rtl"
                                >
                                    {program.title_ar}
                                </h1>
                            )}

                            <p className="text-gray-600 text-lg mb-2">
                                {program.short_description}
                            </p>
                            {program.short_description_ar && (
                                <p
                                    className="text-gray-600 text-lg mb-2"
                                    dir="rtl"
                                >
                                    {program.short_description_ar}
                                </p>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {program.category && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {program.category}
                                    </span>
                                )}
                                {program.category_ar && (
                                    <span
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                        dir="rtl"
                                    >
                                        {program.category_ar}
                                    </span>
                                )}
                                {program.organization && (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        {program.organization}
                                    </span>
                                )}
                                {program.organization_ar && (
                                    <span
                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                        dir="rtl"
                                    >
                                        {program.organization_ar}
                                    </span>
                                )}
                                {program.videoUrl && (
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-1">
                                        <PlayCircle className="w-4 h-4" />
                                        Vidéo
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="ml-6 flex gap-2">
                            <button
                                onClick={handleEdit}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Modifier
                            </button>
                            {program.applicationLink && (
                                <a
                                    href={program.applicationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Lien
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Key Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Organization */}
                        {program.organization && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Building2 className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Organisation
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {program.organization}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Category */}
                        {program.category && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Catégorie
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {program.category}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Scholarship Amount */}
                        {program.scholarshipAmount && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Montant de la bourse
                                    </p>
                                    <p className="font-semibold text-green-600 text-lg">
                                        {formatCurrency(
                                            program.scholarshipAmount,
                                            program.currency,
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Application Deadline */}
                        {program.applicationDeadline && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Clock className="w-6 h-6 text-red-600" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Date limite candidature
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {formatDate(
                                            program.applicationDeadline,
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Program Duration */}
                        {program.programStartDate && program.programEndDate && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Durée du programme
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {formatDate(program.programStartDate)} -{" "}
                                        {formatDate(program.programEndDate)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video Section */}
                    {program.videoUrl && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Vidéo du programme
                            </h2>
                            <VideoPlayer
                                src={program.videoUrl}
                                title={program.title}
                                className="w-full"
                                height="400px"
                            />
                        </div>
                    )}

                    {/* Description */}
                    {program.description && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Description
                            </h2>
                            <div className="prose max-w-none">
                                <RichTextDisplay
                                    content={program.description}
                                    className="text-gray-700"
                                />
                            </div>
                        </div>
                    )}

                    {/* Arabic Description */}
                    {program.description_ar && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                الوصف
                            </h2>
                            <div className="prose max-w-none" dir="rtl">
                                <RichTextDisplay
                                    content={program.description_ar}
                                    className="text-gray-700"
                                />
                            </div>
                        </div>
                    )}

                    {/* Eligibility Criteria */}
                    {program.eligibilityCriteria && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Critères d&apos;éligibilité
                            </h2>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {program.eligibilityCriteria}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Application Process */}
                    {program.applicationProcess && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Processus de candidature
                            </h2>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {program.applicationProcess}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                        <div>
                            <p className="text-sm text-gray-600">
                                Type de programme
                            </p>
                            <p className="font-medium text-gray-900">
                                {program.programType || "Non défini"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Date de création
                            </p>
                            <p className="font-medium text-gray-900">
                                {formatDate(program.createdAt)}
                            </p>
                        </div>
                        {program.updatedAt && (
                            <div>
                                <p className="text-sm text-gray-600">
                                    Dernière modification
                                </p>
                                <p className="font-medium text-gray-900">
                                    {formatDate(program.updatedAt)}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-600">
                                ID du programme
                            </p>
                            <p className="font-medium text-gray-900 font-mono text-sm">
                                {program.id}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramDetailModal;
