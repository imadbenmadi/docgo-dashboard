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
import axios from "../../utils/axios";

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
        console.log("=== FULL API RESPONSE ===");
        console.log("Full response:", response);
        console.log("Program data:", response.program);
        console.log(
          "Applicants from response.program.applicants:",
          response.program?.applicants
        );
        console.log(
          "Applications from response.program.Applications:",
          response.program?.Applications
        );
        console.log("========================");

        setProgram(response.program);
      } catch (error) {
        console.error("Error fetching program:", error);
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

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const handleEdit = () => {
    navigate(`/Programs/${program.id}/Edit`);
  };

  const handleBack = () => {
    navigate("/Programs");
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
      console.error("Error sending message:", error);
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
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
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
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => setShowApplicants(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Voir les candidats ({applicantsCount})
              </button>
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
                                      "fr-FR"
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
              {program.Image && (
                <div className="h-96 bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${program.Image}`}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                {/* title and Status */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                          program.status
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
                      {program.videoUrl && (
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
            {program.videoUrl && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Vidéo de présentation
                </h2>
                <VideoPlayer
                  src={`${import.meta.env.VITE_API_URL}${program.videoUrl}`}
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
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {program.eligibilityCriteria}
                  </p>
                </div>
              </div>
            )}

            {/* Application Process */}
            {program.applicationProcess && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Processus de candidature
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {program.applicationProcess}
                  </p>
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
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {program.requiredDocuments}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            {program.benefits && (
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-600" />
                  Avantages du programme
                </h2>
                <div className="prose max-w-none">
                  {Array.isArray(program.benefits) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {program.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg"
                        >
                          <Star className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {program.benefits}
                    </p>
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
            {(program.programUrl || program.organizationWebsite) && (
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
                  {program.organizationWebsite && (
                    <a
                      href={program.organizationWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Building className="w-4 h-4" />
                      Site de l&apos;organisation
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
                            }
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
                            }
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
              {/* Program Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations du programme
                </h3>

                <div className="space-y-4">
                  {/* Organization */}
                  {program.organization && (
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Organisation</p>
                        <p className="font-semibold text-gray-900">
                          {program.organization}
                        </p>
                        {program.organization_ar && (
                          <p className="text-sm text-gray-600" dir="rtl">
                            {program.organization_ar}
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

                  {/* Location */}
                  {program.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Localisation</p>
                        <p className="font-semibold text-gray-900">
                          {program.location}
                          {program.country && `, ${program.country}`}
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

                  {/* Contact Information */}
                  {(program.contactEmail || program.contactPhone) && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Contact
                      </h4>
                      {program.contactEmail && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-600">Email:</span>
                          <a
                            href={`mailto:${program.contactEmail}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {program.contactEmail}
                          </a>
                        </div>
                      )}
                      {program.contactPhone && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Téléphone:
                          </span>
                          <a
                            href={`tel:${program.contactPhone}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {program.contactPhone}
                          </a>
                        </div>
                      )}
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
                                (1000 * 60 * 60 * 24)
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
                                {program.Price} {program.currency || "EUR"}
                              </span>
                              <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs ml-1">
                                -
                                {Math.round(
                                  ((program.Price - program.discountPrice) /
                                    program.Price) *
                                    100
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
                            {program.discountPrice || program.Price}{" "}
                            {program.currency || "EUR"}
                          </span>
                        </div>
                      </div>
                      {program.discountPrice && (
                        <p className="text-sm text-green-700">
                          🎉 Prix réduit disponible ! Économisez{" "}
                          {(program.Price - program.discountPrice).toFixed(2)}{" "}
                          {program.currency || "EUR"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Scholarship Amount - Money from government/organization */}
                  {program.scholarshipAmount && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-amber-800 flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          Bourse gouvernementale
                        </span>
                        <span className="font-bold text-xl text-amber-600">
                          {program.scholarshipAmount}{" "}
                          {program.currency || "EUR"}
                        </span>
                      </div>
                      <p className="text-sm text-amber-700">
                        Montant de la bourse offerte par
                        l&apos;organisation/gouvernement aux candidats
                        sélectionnés
                      </p>
                      {program.paymentFrequency && (
                        <div className="mt-3 p-3 bg-amber-100 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2 text-amber-800">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium text-sm">
                              Fréquence de versement:
                            </span>
                            <span className="px-2 py-1 bg-amber-200 text-amber-900 rounded-full text-xs font-medium">
                              {program.paymentFrequency === "one-time" &&
                                "🎯 Paiement unique"}
                              {program.paymentFrequency === "monthly" &&
                                "📅 Mensuel"}
                              {program.paymentFrequency === "quarterly" &&
                                "📊 Trimestriel"}
                              {program.paymentFrequency === "annually" &&
                                "🗓️ Annuel"}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="mt-2 p-2 bg-amber-100 rounded text-xs text-amber-800">
                        ℹ️ Cette bourse est accordée directement par
                        l&apos;organisation du programme, indépendamment des
                        frais d&apos;application
                      </div>
                    </div>
                  )}

                  {/* Free Program */}
                  {!program.Price && !program.scholarshipAmount && (
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                        🆓 Programme entièrement gratuit
                      </span>
                      <p className="text-sm text-green-700 mt-2">
                        Aucun frais d&apos;inscription ou de participation
                      </p>
                    </div>
                  )}

                  {/* Summary */}
                  {(program.Price || program.scholarshipAmount) && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Récapitulatif financier
                      </h4>
                      <div className="space-y-2 text-sm">
                        {/* Program Cost Section */}
                        {program.Price && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="font-medium text-blue-900 mb-2">
                              💳 Frais d&apos;application
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Prix original:
                                </span>
                                <span>
                                  {program.Price} {program.currency || "EUR"}
                                </span>
                              </div>
                              {program.discountPrice && (
                                <div className="flex justify-between text-green-600">
                                  <span>Réduction:</span>
                                  <span>
                                    -
                                    {(
                                      program.Price - program.discountPrice
                                    ).toFixed(2)}{" "}
                                    {program.currency || "EUR"}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold pt-1 border-t border-blue-200">
                                <span>Total à payer:</span>
                                <span className="text-blue-700">
                                  {program.discountPrice || program.Price}{" "}
                                  {program.currency || "EUR"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Scholarship Section */}
                        {program.scholarshipAmount && (
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <div className="font-medium text-amber-900 mb-2">
                              🏛️ Bourse gouvernementale
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Montant disponible:</span>
                              <span className="text-amber-700">
                                {program.scholarshipAmount}{" "}
                                {program.currency || "EUR"}
                              </span>
                            </div>
                            {program.paymentFrequency && (
                              <div className="flex justify-between text-sm mt-1">
                                <span>Versement:</span>
                                <span className="text-amber-600 font-medium">
                                  {program.paymentFrequency === "one-time" &&
                                    "🎯 Unique"}
                                  {program.paymentFrequency === "monthly" &&
                                    "📅 Mensuel"}
                                  {program.paymentFrequency === "quarterly" &&
                                    "📊 Trimestriel"}
                                  {program.paymentFrequency === "annually" &&
                                    "🗓️ Annuel"}
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-amber-600 mt-1">
                              Accordée par l&apos;organisation, indépendamment
                              des frais d&apos;application
                            </p>
                          </div>
                        )}

                        {/* Clarification Note */}
                        {program.Price && program.scholarshipAmount && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-blue-600"
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
                              Information importante
                            </div>
                            <p className="text-xs text-gray-600">
                              Les frais d&apos;application sont payés lors de la
                              candidature. La bourse est accordée séparément par
                              l&apos;organisation aux candidats sélectionnés.
                            </p>
                          </div>
                        )}
                      </div>
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
