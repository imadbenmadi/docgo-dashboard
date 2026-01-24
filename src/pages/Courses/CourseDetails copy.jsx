import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    StarIcon,
    CalendarIcon,
    ClockIcon,
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    BookOpenIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
    User,
    Users,
    Globe,
    DollarSign,
    Mail,
    Send,
    MessageSquare,
    Pause,
    AlertTriangle,
    Info,
    Award,
    Target,
    GraduationCap,
} from "lucide-react";
import { coursesAPI } from "../../API/Courses";
import Swal from "sweetalert2";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";
import { useAppContext } from "../../AppContext";
import axios from "../../utils/axios";
import { toast } from "react-toastify";

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAppContext();
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactForm, setContactForm] = useState({
        subject: "",
        message: "",
    });
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);

    const fetchCourseDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await coursesAPI.getCourseDetails(courseId);
            setCourse(response.course);
        } catch (error) {
            console.error("Error fetching course details:", error);
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Impossible de charger les détails du cours",
            });
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    const fetchSections = useCallback(async () => {
        try {
            setSectionsLoading(true);
            const response = await coursesAPI.getCourseSections(courseId);
            setSections(response.sections || []);
        } catch (error) {
            console.error("Error fetching sections:", error);
            setSections([]);
        } finally {
            setSectionsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourseDetails();
        fetchSections();
    }, [fetchCourseDetails, fetchSections]);

    const toggleSection = (sectionId) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const getItemIcon = (type) => {
        switch (type) {
            case "video":
                return PlayIcon;
            case "pdf":
                return DocumentTextIcon;
            case "text":
                return BookOpenIcon;
            case "quiz":
                return AcademicCapIcon;
            default:
                return DocumentTextIcon;
        }
    };

    const getItemTypeLabel = (type) => {
        switch (type) {
            case "video":
                return "Vidéo";
            case "pdf":
                return "PDF";
            case "text":
                return "Texte";
            case "quiz":
                return "Quiz";
            default:
                return type;
        }
    };

    const formatCurrency = (amount, currency = "DZD") => {
        if (!amount) return "Gratuit";
        // eslint-disable-next-line no-undef
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency,
        }).format(amount);
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
                relatedType: "course",
                relatedId: courseId,
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

    const handleDeleteCourse = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Supprimer le cours",
            html: `
                <div class="text-left">
                    <p class="mb-3"><strong>Êtes-vous absolument sûr de vouloir supprimer ce cours ?</strong></p>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p class="text-red-800 text-sm">⚠️ <strong>Cette action est irréversible !</strong></p>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">Conséquences de la suppression :</p>
                    <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
                        <li>Toutes les sections et leur contenu seront supprimés</li>
                        <li>Les étudiants perdront l'accès au contenu</li>
                        <li>L'historique des évaluations sera perdu</li>
                        <li>Les données ne pourront pas être récupérées</li>
                    </ul>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Oui, supprimer définitivement",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            focusCancel: true,
            customClass: {
                popup: "text-left",
            },
        });

        if (result.isConfirmed) {
            const doubleConfirm = await Swal.fire({
                icon: "question",
                title: "Confirmation finale",
                text: 'Tapez "SUPPRIMER" pour confirmer la suppression définitive :',
                input: "text",
                inputPlaceholder: "Tapez SUPPRIMER",
                showCancelButton: true,
                confirmButtonText: "Confirmer la suppression",
                cancelButtonText: "Annuler",
                confirmButtonColor: "#dc2626",
                inputValidator: (value) => {
                    if (value !== "SUPPRIMER") {
                        return 'Vous devez taper "SUPPRIMER" pour confirmer';
                    }
                },
            });

            if (doubleConfirm.isConfirmed) {
                try {
                    setDeleting(true);
                    await coursesAPI.deleteCourse(courseId);

                    Swal.fire({
                        icon: "success",
                        title: "Cours supprimé",
                        text: "Le cours a été supprimé avec succès",
                        timer: 2000,
                        showConfirmButton: false,
                    });

                    navigate("/Courses");
                } catch (error) {
                    console.error("Error deleting course:", error);

                    let errorMessage =
                        "Une erreur s&apos;est produite lors de la suppression";
                    if (error.response?.data?.error) {
                        errorMessage = error.response.data.error;
                    }

                    Swal.fire({
                        icon: "error",
                        title: "Erreur de suppression",
                        text: errorMessage,
                    });
                } finally {
                    setDeleting(false);
                }
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: {
                color: "bg-green-100 text-green-800",
                icon: CheckCircleIcon,
                text: "Actif",
            },
            draft: {
                color: "bg-yellow-100 text-yellow-800",
                icon: ExclamationTriangleIcon,
                text: "Brouillon",
            },
            archived: {
                color: "bg-gray-100 text-gray-800",
                icon: XCircleIcon,
                text: "Archivé",
            },
        };

        const config = statusConfig[status] || statusConfig.draft;
        const IconComponent = config.icon;

        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
            >
                <IconComponent className="w-3 h-3" />
                {config.text}
            </span>
        );
    };

    const getDifficultyBadge = (level) => {
        const levelConfig = {
            beginner: { color: "bg-blue-100 text-blue-800", text: "Débutant" },
            intermediate: {
                color: "bg-orange-100 text-orange-800",
                text: "Intermédiaire",
            },
            advanced: { color: "bg-red-100 text-red-800", text: "Avancé" },
        };

        const config =
            levelConfig[level?.toLowerCase()] || levelConfig.beginner;

        return (
            <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
            >
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Cours introuvable
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Le cours que vous recherchez n&apos;existe pas.
                    </p>
                    <Link
                        to="/Courses"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Retour aux cours
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/Courses")}
                                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                                Retour aux cours
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Détails du cours
                                </h1>
                                <p className="text-gray-600">
                                    Gérer et consulter les informations du cours
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {user && (
                                <button
                                    onClick={() =>
                                        setShowContactForm(!showContactForm)
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Contacter
                                </button>
                            )}
                            <Link
                                to={`/Courses/${courseId}/Edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Modifier
                            </Link>
                            <button
                                onClick={handleDeleteCourse}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                {deleting ? "Suppression..." : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Course Details */}
                    <div className="lg:col-span-2">
                        {/* Hero Section */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                            {/* Course Image/Video */}
                            <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative">
                                {course.image ? (
                                    <>
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/${course.image}`}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                            <button
                                                onClick={() =>
                                                    setShowVideo(true)
                                                }
                                                className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all transform hover:scale-105"
                                            >
                                                <PlayIcon className="w-12 h-12 text-blue-600" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <BookOpenIcon className="w-20 h-20 text-blue-300 mx-auto mb-4" />
                                            <p className="text-gray-500 text-lg">
                                                Aucune image disponible
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8">
                                {/* Course Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            {getStatusBadge(course.status)}
                                            {getDifficultyBadge(
                                                course.difficulty,
                                            )}
                                            {course.category && (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    {course.category}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {course.title}
                                        </h1>
                                        {course.description && (
                                            <p className="text-gray-600 text-lg leading-relaxed">
                                                {course.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Course Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    {/* Price */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-sm text-green-700 font-medium">
                                                    Prix
                                                </p>
                                                <p className="text-lg font-bold text-green-800">
                                                    {formatCurrency(
                                                        course.price,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <ClockIcon className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-blue-700 font-medium">
                                                    Durée
                                                </p>
                                                <p className="text-lg font-bold text-blue-800">
                                                    {course.duration ||
                                                        "Non définie"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Students */}
                                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm text-purple-700 font-medium">
                                                    Étudiants
                                                </p>
                                                <p className="text-lg font-bold text-purple-800">
                                                    {course.enrollments_count ||
                                                        0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-100">
                                        <div className="flex items-center gap-3">
                                            <StarIcon className="w-5 h-5 text-yellow-600" />
                                            <div>
                                                <p className="text-sm text-yellow-700 font-medium">
                                                    Note
                                                </p>
                                                <p className="text-lg font-bold text-yellow-800">
                                                    {course.rating
                                                        ? `${course.rating}/5`
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Long Description */}
                                {course.long_description && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Info className="w-5 h-5" />
                                            Description détaillée
                                        </h2>
                                        <div className="prose prose-lg max-w-none">
                                            <RichTextDisplay
                                                content={
                                                    course.long_description
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Objectives */}
                                {course.objectives && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Target className="w-5 h-5" />
                                            Objectifs du cours
                                        </h2>
                                        <div className="prose prose-lg max-w-none">
                                            <RichTextDisplay
                                                content={course.objectives}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Prerequisites */}
                                {course.prerequisites && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Prérequis
                                        </h2>
                                        <div className="prose prose-lg max-w-none">
                                            <RichTextDisplay
                                                content={course.prerequisites}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Course Sections */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Contenu du cours
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            {sections.length} section
                                            {sections.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/Courses/${courseId}/sections`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Gérer les sections
                                    </Link>
                                </div>
                            </div>

                            <div className="p-8">
                                {sectionsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : sections.length === 0 ? (
                                    <div className="text-center py-8">
                                        <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Aucune section
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Ce cours n&apos;a pas encore de
                                            contenu organisé en sections.
                                        </p>
                                        <Link
                                            to={`/Courses/${courseId}/sections`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Créer la première section
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sections.map((section, index) => (
                                            <div
                                                key={section.id}
                                                className="border border-gray-200 rounded-lg overflow-hidden"
                                            >
                                                <button
                                                    onClick={() =>
                                                        toggleSection(
                                                            section.id,
                                                        )
                                                    }
                                                    className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                            {index + 1}
                                                        </span>
                                                        <h3 className="font-medium text-gray-900">
                                                            {section.title}
                                                        </h3>
                                                        <span className="text-sm text-gray-500">
                                                            {section.items
                                                                ?.length ||
                                                                0}{" "}
                                                            élément
                                                            {(section.items
                                                                ?.length ||
                                                                0) !== 1
                                                                ? "s"
                                                                : ""}
                                                        </span>
                                                    </div>
                                                    {expandedSections.has(
                                                        section.id,
                                                    ) ? (
                                                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>

                                                {expandedSections.has(
                                                    section.id,
                                                ) && (
                                                    <div className="px-6 py-4 bg-white border-t border-gray-200">
                                                        {section.description && (
                                                            <p className="text-gray-600 mb-4">
                                                                {
                                                                    section.description
                                                                }
                                                            </p>
                                                        )}

                                                        {section.items &&
                                                        section.items.length >
                                                            0 ? (
                                                            <div className="space-y-2">
                                                                {section.items.map(
                                                                    (
                                                                        item,
                                                                        itemIndex,
                                                                    ) => {
                                                                        const IconComponent =
                                                                            getItemIcon(
                                                                                item.type,
                                                                            );
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                                className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg"
                                                                            >
                                                                                <IconComponent className="w-4 h-4 text-gray-500" />
                                                                                <span className="font-medium text-gray-900">
                                                                                    {
                                                                                        item.title
                                                                                    }
                                                                                </span>
                                                                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                                                                    {getItemTypeLabel(
                                                                                        item.type,
                                                                                    )}
                                                                                </span>
                                                                                {item.duration && (
                                                                                    <span className="text-xs text-gray-500 ml-auto">
                                                                                        {
                                                                                            item.duration
                                                                                        }
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 italic">
                                                                Cette section ne
                                                                contient pas
                                                                encore
                                                                d&apos;éléments.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Contact Form */}
                        {showContactForm && user && (
                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    Contacter pour ce cours
                                </h3>
                                <form
                                    onSubmit={handleContactSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sujet
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.subject}
                                            onChange={(e) =>
                                                setContactForm({
                                                    ...contactForm,
                                                    subject: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Sujet de votre message"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            value={contactForm.message}
                                            onChange={(e) =>
                                                setContactForm({
                                                    ...contactForm,
                                                    message: e.target.value,
                                                })
                                            }
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Votre message concernant ce cours..."
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmittingContact}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            {isSubmittingContact
                                                ? "Envoi..."
                                                : "Envoyer"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowContactForm(false)
                                            }
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Course Information */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Informations
                            </h3>
                            <div className="space-y-4">
                                {/* Created Date */}
                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Date de création
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(
                                                course.createdAt,
                                            ).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                </div>

                                {/* Language */}
                                {course.language && (
                                    <div className="flex items-start gap-3">
                                        <Globe className="w-5 h-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Langue
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {course.language}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Instructor */}
                                {course.instructor && (
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Instructeur
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {course.instructor}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Certificate */}
                                <div className="flex items-start gap-3">
                                    <Award className="w-5 h-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Certificat
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {course.has_certificate
                                                ? "Oui"
                                                : "Non"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Actions rapides
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to={`/Courses/${courseId}/Videos`}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <PlayIcon className="w-4 h-4" />
                                    Gérer les vidéos
                                </Link>
                                <Link
                                    to={`/Courses/${courseId}/sections`}
                                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <BookOpenIcon className="w-4 h-4" />
                                    Gérer les sections
                                </Link>
                            </div>
                        </div>

                        {/* Contact for non-authenticated users */}
                        {!user && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mt-6">
                                <div className="text-center">
                                    <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                        Questions sur ce cours ?
                                    </h3>
                                    <p className="text-blue-700 text-sm mb-4">
                                        Connectez-vous pour contacter
                                        directement les responsables
                                    </p>
                                    <button
                                        onClick={() => navigate("/Login")}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Se connecter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Modal - Placeholder for future video feature */}
            {showVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Présentation du cours
                            </h3>
                            <button
                                onClick={() => setShowVideo(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Pause className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-8 text-center">
                            <PlayIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">
                                La vidéo de présentation sera disponible
                                bientôt.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Fonction en cours de développement
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetails;
