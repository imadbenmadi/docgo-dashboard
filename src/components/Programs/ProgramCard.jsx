import {
    Eye,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    Building2,
    Star,
    Clock,
    MapPin,
    PlayCircle,
} from "lucide-react";
import { useEffect } from "react";
const ProgramCard = ({ program, handleView, handleEdit, handleDelete }) => {
    

    const formatDate = (dateString) => {
        if (!dateString) return "Non définie";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (amount, currency = "EUR") => {
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

    const getProgramTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "scholarship":
                return "🎓";
            case "grant":
                return "💰";
            case "fellowship":
                return "🏆";
            case "internship":
                return "💼";
            default:
                return "📚";
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group">
            {/* Image Section */}
            <div className="relative h-48 bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
                {program.Image ? (
                    <img
                        src={import.meta.env.VITE_API_URL + program.Image}
                        alt={program.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl opacity-30">
                            {getProgramTypeIcon(program.programType)}
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            program.status
                        )}`}
                    >
                        {getStatusText(program.status)}
                    </span>
                </div>

                {/* Featured Badge */}
                {program.isFeatured && (
                    <div className="absolute top-3 right-3">
                        <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span className="text-xs font-semibold">
                                Vedette
                            </span>
                        </div>
                    </div>
                )}

                {/* Video Indicator */}
                {/* {program.videoUrl && (
                    <div className="absolute bottom-3 right-3">
                        <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" />
                            <span className="text-xs font-semibold">Vidéo</span>
                        </div>
                    </div>
                )} */}

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button
                        onClick={() => handleView(program.id)}
                        className="bg-white text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Voir les détails"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleEdit(program.id)}
                        className="bg-white text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Modifier"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    {/* <button
                        onClick={() => handleDelete(program.id)}
                        className="bg-white text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button> */}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {program.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                        {program.short_description}
                    </p>
                </div>

                {/* Program Details */}
                <div className="space-y-3 mb-4">
                    {/* Organization */}
                    {program.organization && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="truncate">
                                {program.organization}
                            </span>
                        </div>
                    )}

                    {/* Category */}
                    {program.category && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{program.category}</span>
                        </div>
                    )}

                    {/* Scholarship Amount */}
                    {program.scholarshipAmount && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-green-600">
                                {formatCurrency(
                                    program.scholarshipAmount,
                                    program.currency
                                )}
                            </span>
                        </div>
                    )}

                    {/* Deadline */}
                    {program.applicationDeadline && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-red-400" />
                            <span>
                                Date limite:{" "}
                                {formatDate(program.applicationDeadline)}
                            </span>
                        </div>
                    )}

                    {/* Program Duration */}
                    {program.programStartDate && program.programEndDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span>
                                {formatDate(program.programStartDate)} -{" "}
                                {formatDate(program.programEndDate)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Slots Information */}
                {(program.totalSlots || program.availableSlots) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                Places disponibles:
                            </span>
                            <span className="font-semibold">
                                {program.availableSlots || 0} /{" "}
                                {program.totalSlots || 0}
                            </span>
                        </div>
                        {program.totalSlots && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${Math.max(
                                                ((program.availableSlots || 0) /
                                                    program.totalSlots) *
                                                    100,
                                                5
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {program.programType || "Programme"}
                        </span>
                        {program.programType && (
                            <span className="text-xs">
                                {getProgramTypeIcon(program.programType)}
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-500">
                        Créé le {formatDate(program.createdAt)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramCard;
