import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  Globe,
  Info,
  MapPin,
  PlayCircle,
  Star,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { programsAPI } from "../../API/Programs";
import { useAppContext } from "../../AppContext";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";
import VideoPlayer from "../../components/Common/VideoPlayer";
import MainLoading from "../../MainLoading";
import ImageWithFallback from "../../components/Common/ImageWithFallback";
import axios from "../../utils/axios";
import { buildApiUrl } from "../../utils/apiBaseUrl";

const resolveProgramMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;

  const value = String(mediaPath).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const normalized = value.replace(/^\/?public\/+?/i, "/");
  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;

  return buildApiUrl(withLeadingSlash);
};

const ProgramDetails = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        const response = await programsAPI.getProgram(programId);

        setProgram(response.program);
      } catch (error) {
        toast.error("Erreur lors du chargement du programme");
        navigate("/Programs");
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgram();
    }
  }, [programId, navigate]);

  // Get applicants from program data (already included in response)
  const applicants = program?.applicants || program?.Applications || [];
  const applicantsCount = applicants.length;
  // Real enrolled users count from actual enrollment records
  const enrolledCount = program?.enrolledCount ?? program?.Users_count ?? 0;
  const programVideoPath = program?.videoUrl || program?.video;
  const resolvedProgramVideoUrl = resolveProgramMediaUrl(programVideoPath);

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
  };

  const handleBack = () => {
    navigate("/Programs");
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Archiver ce programme ?",
      text: "Le programme sera marqué comme supprimé, et les utilisateurs perdront l'accès.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, archiver",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      await programsAPI.deleteProgram(programId);
      Swal.fire({
        icon: "success",
        title: "Programme archivé",
        text: "Le programme a été déplacé vers la liste des programmes supprimés.",
      });
      navigate("/Programs/Deleted");
    } catch (error) {
      toast.error("Erreur lors de la suppression du programme");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Connexion requise",
        text: "Vous devez être connecté pour envoyer un message",
      });
      return;
    }

    if (!contactForm.subject || !contactForm.message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      setIsSubmittingContact(true);
      await axios.post("/contact", {
        subject: contactForm.subject,
        message: contactForm.message,
        relatedType: "program",
        relatedId: programId,
      });

      Swal.fire({
        icon: "success",
        title: "Message envoyé",
        text: "Votre message a été envoyé avec succès. Nous vous répondrons bientôt.",
      });

      setContactForm({ subject: "", message: "" });
      setShowContactForm(false);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  if (loading) {
    return <MainLoading />;
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Programme introuvable
          </h2>
          <p className="text-gray-600 mb-4">
            Le programme demandé n&apos;existe pas ou a été supprimé.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux programmes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Détails du programme
                </h1>
                <p className="text-gray-600">
                  Informations complètes sur le programme
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-3">
              <button
                onClick={handleEdit}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => setShowApplicants(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Users className="w-4 h-4" />
                Voir les candidats ({applicantsCount})
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap">
                <Users className="w-4 h-4 text-green-600" />
                {enrolledCount} inscrits
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applicants Modal */}
      {showApplicants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Candidats du programme ({applicantsCount})
              </h2>
              <button
                onClick={() => setShowApplicants(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {applicants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Aucun candidat pour ce programme
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Téléphone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date de candidature
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applicants.map((applicant, index) => {
                        // Handle nested User object from backend
                        const user = applicant.User || applicant;
                        const firstName = user.firstName || applicant.firstName;
                        const lastName = user.lastName || applicant.lastName;
                        const email = user.email || applicant.email;
                        const phone =
                          user.telephone ||
                          user.phone ||
                          applicant.telephone ||
                          applicant.phone;
                        const appliedDate =
                          applicant.createdAt || applicant.appliedAt;

                        return (
                          <tr
                            key={applicant.id || index}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 font-semibold">
                                    {(
                                      firstName?.[0] ||
                                      user.name?.[0] ||
                                      "?"
                                    ).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {firstName && lastName
                                      ? `${firstName} ${lastName}`
                                      : user.name || "Non renseigné"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {email || "Non renseigné"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {phone || "Non renseigné"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {appliedDate
                                  ? new Date(appliedDate).toLocaleDateString(
                                      "fr-FR",
                                    )
                                  : "Non renseigné"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  applicant.status === "approved" ||
                                  applicant.status === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : applicant.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : applicant.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {applicant.status === "approved" ||
                                applicant.status === "accepted"
                                  ? "Accepté"
                                  : applicant.status === "rejected"
                                    ? "Refusé"
                                    : applicant.status === "pending"
                                      ? "En attente"
                                      : applicant.status || "Non défini"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              {/* Image or Video */}
              <div className="h-96 overflow-hidden">
                <ImageWithFallback
                  type="program"
                  src={buildApiUrl(program.Image)}
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8">
                {/* title and Status */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
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
                          <span className="text-sm font-semibold">Vedette</span>
                        </div>
                      )}
                      {programVideoPath && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-1">
                          <PlayCircle className="w-4 h-4" />
                          Vidéo
                        </span>
                      )}
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {program.title}
                    </h1>
                    {program.title_ar && (
                      <h1
                        className="text-3xl font-bold text-gray-600 mb-4"
                        dir="rtl"
                      >
                        {program.title_ar}
                      </h1>
                    )}

                    {program.shortdescription && (
                      <p className="text-xl text-gray-600 mb-2">
                        {program.shortdescription}
                      </p>
                    )}
                    {program.shortdescription_ar && (
                      <p className="text-xl text-gray-600 mb-4" dir="rtl">
                        {program.shortdescription_ar}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {program.Category && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {program.Category}
                        </span>
                      )}
                      {program.Category_ar && (
                        <span
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          dir="rtl"
                        >
                          {program.Category_ar}
                        </span>
                      )}
                      {program.university && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {program.university}
                        </span>
                      )}
                      {program.university_ar && (
                        <span
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                          dir="rtl"
                        >
                          {program.university_ar}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {program.applicationLink && (
                  <div className="mb-6">
                    <a
                      href={program.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Postuler maintenant
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Video Section */}
            {resolvedProgramVideoUrl && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Vidéo de présentation
                </h2>
                <VideoPlayer
                  src={resolvedProgramVideoUrl}
                  title={program.title}
                  className="w-full"
                  height="400px"
                />
              </div>
            )}

            {/* description */}
            {program.description && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  description du programme
                </h2>
                <div className="prose max-w-none">
                  <RichTextDisplay
                    content={program.description}
                    className="text-gray-700"
                  />
                </div>
              </div>
            )}

            {/* Arabic description */}
            {program.description_ar && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  وصف البرنامج
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
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Critères d&apos;éligibilité
                </h2>
                <div className="prose max-w-none">
                  <RichTextDisplay
                    content={program.eligibilityCriteria}
                    className="text-gray-700"
                  />
                </div>
              </div>
            )}

            {/* Required Documents */}
            {program.requiredDocuments && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-orange-600" />
                  Documents requis
                </h2>
                <div className="prose max-w-none">
                  {Array.isArray(program.requiredDocuments) ? (
                    <ul className="space-y-2">
                      {program.requiredDocuments.map((doc, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <RichTextDisplay
                      content={program.requiredDocuments}
                      className="text-gray-700"
                    />
                  )}
                </div>
              </div>
            )}

            {/* FAQ */}
            {program.faq &&
              Array.isArray(program.faq) &&
              program.faq.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-purple-600" />
                    Questions fréquentes
                  </h2>
                  <div className="space-y-6">
                    {program.faq.map((item, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-purple-600 pl-4"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Q: {item.question}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          R: {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Tags */}
            {program.tags &&
              Array.isArray(program.tags) &&
              program.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Tag className="w-6 h-6 text-indigo-600" />
                    Mots-clés
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* External Links */}
            {(program.programUrl || program.universityWebsite) && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ExternalLink className="w-6 h-6 text-blue-600" />
                  Liens utiles
                </h2>
                <div className="space-y-3">
                  {program.programUrl && (
                    <a
                      href={program.programUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Site officiel du programme
                    </a>
                  )}
                  {program.universityWebsite && (
                    <a
                      href={program.universityWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Building className="w-4 h-4" />
                      Site de l&apos;université
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Program Metadata */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-gray-600" />
                Métadonnées du programme
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Creation Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">
                    Informations de création
                  </h3>
                  <div className="space-y-2 text-sm">
                    {program.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Créé le:</span>
                        <span className="font-medium">
                          {new Date(program.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                    {program.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Modifié le:</span>
                        <span className="font-medium">
                          {new Date(program.updatedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                    {program.id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Programme:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          #{program.id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">
                    Statut
                  </h3>
                  <div className="space-y-2 text-sm">
                    {program.isFeatured !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">En vedette:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            program.isFeatured
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {program.isFeatured ? "Oui" : "Non"}
                        </span>
                      </div>
                    )}
                    {program.isActive !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Actif:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            program.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {program.isActive ? "Oui" : "Non"}
                        </span>
                      </div>
                    )}
                    {program.visibility && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visibilité:</span>
                        <span className="font-medium capitalize">
                          {program.visibility}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">
                    Données techniques
                  </h3>
                  <div className="space-y-2 text-sm">
                    {program.slug && (
                      <div>
                        <span className="text-gray-600 block">Slug:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all">
                          {program.slug}
                        </span>
                      </div>
                    )}
                    {program.seotitle && (
                      <div>
                        <span className="text-gray-600 block">Titre SEO:</span>
                        <span className="text-xs text-gray-700 break-words">
                          {program.seotitle}
                        </span>
                      </div>
                    )}
                    {program.seodescription && (
                      <div>
                        <span className="text-gray-600 block">
                          description SEO:
                        </span>
                        <span className="text-xs text-gray-700 break-words">
                          {program.seodescription}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Data section removed for production */}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Enrolled Users Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Apprenants inscrits
                </h3>
                <p className="text-4xl font-bold text-blue-700">
                  {enrolledCount}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Utilisateurs actuellement inscrits
                </p>
              </div>

              {/* Program Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations du programme
                </h3>

                <div className="space-y-4">
                  {/* University */}
                  {program.university && (
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Université</p>
                        <p className="font-semibold text-gray-900">
                          {program.university}
                        </p>
                        {program.university_ar && (
                          <p className="text-sm text-gray-600" dir="rtl">
                            {program.university_ar}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {program.Category && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Catégorie</p>
                        <p className="font-semibold text-gray-900">
                          {program.Category}
                        </p>
                        {program.category_ar && (
                          <p className="text-sm text-gray-600" dir="rtl">
                            {program.category_ar}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Program Type */}
                  {program.programType && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Type de programme
                        </p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {program.programType}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Country */}
                  {(program.programCountry || program.country) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Pays</p>
                        <p className="font-semibold text-gray-900">
                          {program.programCountry || program.country}
                        </p>
                        {program.isRemote && (
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-1">
                            À distance
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Language */}
                  {program.language && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Langue</p>
                        <p className="font-semibold text-gray-900">
                          {program.language}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Dates Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dates importantes
                </h3>

                <div className="space-y-4">
                  {/* Application Start Date */}
                  {program.applicationStartDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Début des candidatures
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(program.applicationStartDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Application Deadline */}
                  {program.applicationDeadline && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Date limite de candidature
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(program.applicationDeadline)}
                        </p>
                        {new Date(program.applicationDeadline) > new Date() ? (
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-1">
                            Ouvert
                          </span>
                        ) : (
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs mt-1">
                            Expiré
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Program Start Date */}
                  {program.programStartDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Début du programme
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(program.programStartDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Program End Date */}
                  {program.programEndDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Fin du programme
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(program.programEndDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Program Duration */}
                  {program.programStartDate && program.programEndDate && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-600">Durée totale</p>
                          <p className="font-semibold text-gray-900">
                            {Math.ceil(
                              (new Date(program.programEndDate) -
                                new Date(program.programStartDate)) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            jours
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Financial Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations financières
                </h3>

                <div className="space-y-4">
                  {/* Program Price */}
                  {program.Price && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">
                          Prix du programme
                        </span>
                        <div className="text-right">
                          {program.discountPrice && (
                            <div>
                              <span className="text-sm text-gray-500 line-through mr-2">
                                {program.Price}
                              </span>
                              <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs ml-1">
                                -
                                {Math.round(
                                  ((program.Price - program.discountPrice) /
                                    program.Price) *
                                    100,
                                )}
                                %
                              </span>
                            </div>
                          )}
                          <span
                            className={`font-bold text-xl ${
                              program.discountPrice
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                          >
                            {program.discountPrice || program.Price}
                          </span>
                        </div>
                      </div>
                      {program.discountPrice && (
                        <p className="text-sm text-green-700">
                          🎉 Prix réduit disponible ! Économisez{" "}
                          {(program.Price - program.discountPrice).toFixed(
                            2,
                          )}{" "}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Free Program */}
                  {!program.Price && (
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                        🆓 Programme entièrement gratuit
                      </span>
                      <p className="text-sm text-green-700 mt-2">
                        Aucun frais d&apos;inscription ou de participation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;
