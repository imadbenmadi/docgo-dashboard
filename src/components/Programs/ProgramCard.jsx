import {
  Archive,
  Building2,
  Calendar,
  Clock,
  Edit,
  Eye,
  MapPin,
  Star,
  RotateCcw,
  Users,
} from "lucide-react";
import ImageWithFallback from "../Common/ImageWithFallback";
import { buildApiUrl } from "../../utils/apiBaseUrl";

const ProgramCard = ({
  program,
  handleView,
  handleEdit,
  handleDelete,
  handleRestore,
  isDeletedView,
}) => {
  const enrolledCount = program.enrolledCount ?? program.Users_count ?? 0;
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
    <div
      className={`bg-white rounded-2xl overflow-hidden group flex flex-col h-[600px] transition-all duration-300 ${
        isDeletedView
          ? "shadow-md border border-gray-200"
          : "shadow-lg hover:shadow-xl transform hover:scale-105"
      }`}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <ImageWithFallback
          type="program"
          src={buildApiUrl(program.Image)}
          alt={program.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
              program.status,
            )}`}
          >
            {getStatusText(program.status)}
          </span>
        </div>

        {isDeletedView && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
              Supprimé
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {program.isFeatured && (
          <div className="absolute top-3 right-3">
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span className="text-xs font-semibold">Vedette</span>
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
          {isDeletedView ? (
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Programme archivé
            </div>
          ) : (
            <>
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
            </>
          )}
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
      <div className="p-6 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
            {program.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
            {program.short_description}
          </p>
        </div>

        {/* Program Details */}
        <div
          className="space-y-3 mb-4 flex-1 overflow-y-auto"
          style={{ maxHeight: "200px" }}
        >
          {/* Organization */}
          {program.organization && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="truncate">{program.organization}</span>
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
              {/* <DollarSign className="w-4 h-4 text-green-500" /> */}
              <span className="font-semibold text-green-600">
                {formatCurrency(program.scholarshipAmount, program.currency)}
              </span>
            </div>
          )}

          {/* Deadline */}
          {program.applicationDeadline && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-red-400" />
              <span>
                Date limite: {formatDate(program.applicationDeadline)}
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

        {isDeletedView && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Ce programme est retiré du catalogue et ne doit plus être consulté
            tant qu'il n'est pas restauré.
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 flex-shrink-0 mt-auto">
          {/* View Details Button */}
          {isDeletedView ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="w-full bg-gray-100 text-gray-500 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold border border-gray-200">
                <Archive className="w-4 h-4" />
                Indisponible
              </div>
              <button
                onClick={() => handleRestore(program.id)}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2.5 px-4 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurer
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleView(program.id)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
            >
              <Eye className="w-4 h-4" />
              Voir les détails
            </button>
          )}

          {/* Info Row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>{program.programType || "Programme"}</span>
              {program.programType && (
                <span>{getProgramTypeIcon(program.programType)}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-blue-700 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>{enrolledCount} inscrits</span>
            </div>
            {isDeletedView ? (
              <span
                className="text-gray-400 flex items-center gap-1"
                title="Programme supprimé"
              >
                <Archive className="w-3.5 h-3.5" />
                Archivé
              </span>
            ) : (
              <button
                onClick={() => handleEdit(program.id)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                title="Modifier"
              >
                <Edit className="w-3.5 h-3.5" />
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;
