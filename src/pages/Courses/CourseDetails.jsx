import {
  AcademicCapIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PlayIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Swal from "sweetalert2";
import { coursesAPI } from "../../API/Courses";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [courseFiles, setCourseFiles] = useState({ videos: [], pdfs: [] });
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getCourseDetails(courseId);
      setCourse(response.course);
      // Extract sections from course data
      setSections(response.course?.sections || []);
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



  const fetchCourseFiles = useCallback(async () => {
    try {
      setFilesLoading(true);
      const response = await coursesAPI.getCourseFiles(courseId);
      console.log("Course files response:", response);

      // Handle response structure - prioritize direct videos/pdfs arrays
      if (response.course) {
        // Response wrapped in course object
        setCourseFiles({
          videos: response.course.videos || [],
          pdfs: response.course.pdfs || [],
        });
      } else if (response.videos || response.pdfs) {
        // Direct videos and PDFs structure
        setCourseFiles({
          videos: response.videos || [],
          pdfs: response.pdfs || [],
        });
      } else if (response.sections && Array.isArray(response.sections)) {
        // Extract videos and PDFs from sections as fallback
        const allVideos = [];
        const allPDFs = [];

        response.sections.forEach((section) => {
          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item) => {
              if (item.type === "video" && item.videoUrl) {
                allVideos.push({
                  ...item,
                  sectionTitle: section.title,
                  duration: item.videoDuration,
                });
              } else if (item.type === "pdf" && item.pdfUrl) {
                allPDFs.push({
                  ...item,
                  sectionTitle: section.title,
                });
              }
            });
          }
        });

        setCourseFiles({ videos: allVideos, pdfs: allPDFs });
      }
    } catch (error) {
      console.error("Error fetching course files:", error);
      setCourseFiles({ videos: [], pdfs: [] });
    } finally {
      setFilesLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
    fetchCourseFiles();
  }, [fetchCourseDetails, fetchCourseFiles]);

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
      // Second confirmation for extra safety
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

    const config = levelConfig[level?.toLowerCase()] || levelConfig.beginner;

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

            <div className="flex items-center gap-3">
              <Link
                to={`/Courses/${courseId}/Edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                Modifier
              </Link>
              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="w-4 h-4" />
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {course.Image && (
                  <img
                    src={import.meta.env.VITE_API_URL + course.Image}
                    alt={course.Title}
                    className="w-full h-58 mb-5 object-cover rounded-lg"
                  />
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {course.Title}
                      </h2>
                      {getStatusBadge(course.status)}
                    </div>
                    {course.Title_ar && (
                      <h3 className="text-lg text-gray-700 mb-2" dir="rtl">
                        {course.Title_ar}
                      </h3>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <TagIcon className="w-4 h-4" />
                        <span>{course.Category}</span>
                      </div>
                      {course.Level && (
                        <div className="flex items-center gap-1">
                          {getDifficultyBadge(course.Level)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(course.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {course.Prerequisites && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Prérequis
                    </h4>
                    <div className="text-gray-600">
                      <RichTextDisplay content={course.Prerequisites} />
                    </div>
                  </div>
                )}
                {/* Description */}
                {course.shortDescription && (
                  <div className="mb-4 font-bold">
                    {/* <h4 className="font-medium text-gray-900 mb-2">
                                            Description courte
                                        </h4> */}
                    <p className="text-gray-600">{course.shortDescription}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <RichTextDisplay content={course.Description} />
                    </div>
                  </div>

                  {course.Description_ar && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">الوصف</h4>
                      <div className="prose prose-sm max-w-none" dir="rtl">
                        <RichTextDisplay content={course.Description_ar} />
                      </div>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  {course.objectives &&
                    Array.isArray(course.objectives) &&
                    course.objectives.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Objectifs d&apos;apprentissage
                        </h4>

                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="grid md:grid-cols-2 gap-3">
                            {course.objectives.map((objective, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-green-600 mt-1 flex-shrink-0">
                                  ✓
                                </span>
                                <span className="text-gray-700 text-sm">
                                  {objective}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Course Sections - Only show if there are sections */}
            {!loading && sections && sections.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpenIcon className="w-5 h-5 text-blue-600" />
                      Contenu du cours
                    </h3>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sections.map((section, sectionIndex) => (
                        <div
                          key={section.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleSection(section.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                  {section.sectionOrder || sectionIndex + 1}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {section.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {section.items?.length || 0} éléments
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {section.estimatedDuration && (
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  {section.estimatedDuration} min
                                </span>
                              )}
                              {expandedSections.has(section.id) ? (
                                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {expandedSections.has(section.id) && (
                            <div className="border-t border-gray-200">
                              {section.items && section.items.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                  {section.items.map((item, itemIndex) => {
                                    const IconComponent = getItemIcon(
                                      item.type
                                    );
                                    return (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50"
                                      >
                                        <div className="flex-shrink-0">
                                          <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded flex items-center justify-center text-xs">
                                            {item.itemOrder || itemIndex + 1}
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                          <IconComponent className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-medium text-gray-900">
                                            {item.title}
                                          </h5>
                                          <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                              {getItemTypeLabel(item.type)}
                                            </span>
                                            {item.estimatedDuration && (
                                              <span className="flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" />
                                                {item.estimatedDuration} min
                                              </span>
                                            )}
                                            {item.type === "video" &&
                                              item.videoDuration && (
                                                <span className="flex items-center gap-1">
                                                  <PlayIcon className="w-3 h-3" />
                                                  {Math.floor(
                                                    item.videoDuration / 60
                                                  )}
                                                  :
                                                  {(item.videoDuration % 60)
                                                    .toString()
                                                    .padStart(2, "0")}
                                                </span>
                                              )}
                                            {item.isRequired && (
                                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                                Obligatoire
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                  <p>Aucun élément dans cette section</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Videos and PDFs Section - from /Admin/salah/:id endpoint */}
            {filesLoading ? (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">
                    Chargement des vidéos et PDFs...
                  </span>
                </div>
              </div>
            ) : (
              (courseFiles.videos.length > 0 ||
                courseFiles.pdfs.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Videos Section */}
                  {courseFiles.videos.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border-2 border-blue-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <PlayIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-blue-900">
                            Vidéos du cours
                          </h3>
                          <p className="text-sm text-blue-600">
                            {courseFiles.videos.length} vidéo(s) disponible(s)
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {courseFiles.videos.map((video, index) => {
                          const baseUrl =
                            import.meta.env.VITE_API_URL ||
                            "http://localhost:3000";
                          const videoUrl = video.videoUrl?.startsWith("http")
                            ? video.videoUrl
                            : `${baseUrl}${video.videoUrl}`;
                          const duration =
                            video.duration || video.videoDuration;

                          return (
                            <div
                              key={video.id || index}
                              className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <PlayIcon className="w-4 h-4 text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {video.title}
                                  </h4>
                                  {video.title_ar && (
                                    <h5
                                      className="text-sm text-gray-600 mb-2 font-arabic"
                                      dir="rtl"
                                    >
                                      {video.title_ar}
                                    </h5>
                                  )}
                                  {video.sectionTitle && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      📑 Section: {video.sectionTitle}
                                    </p>
                                  )}
                                  {video.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {video.description}
                                    </p>
                                  )}
                                  {video.description_ar && (
                                    <p
                                      className="text-sm text-gray-600 mb-2 font-arabic"
                                      dir="rtl"
                                    >
                                      {video.description_ar}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                                    {duration && (
                                      <span className="flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" />
                                        {Math.floor(duration / 60)}:
                                        {(duration % 60)
                                          .toString()
                                          .padStart(2, "0")}
                                      </span>
                                    )}
                                    {video.order && (
                                      <span>Ordre: {video.order}</span>
                                    )}
                                  </div>
                                  <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    <PlayIcon className="w-4 h-4" />
                                    Voir la vidéo
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PDFs Section */}
                  {courseFiles.pdfs.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-sm border-2 border-green-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-600 rounded-lg">
                          <DocumentTextIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-green-900">
                            Documents PDF
                          </h3>
                          <p className="text-sm text-green-600">
                            {courseFiles.pdfs.length} document(s) disponible(s)
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {courseFiles.pdfs.map((pdf, index) => {
                          const baseUrl =
                            import.meta.env.VITE_API_URL ||
                            "http://localhost:3000";
                          const pdfUrl = pdf.pdfUrl?.startsWith("http")
                            ? pdf.pdfUrl
                            : `${baseUrl}${pdf.pdfUrl}`;

                          return (
                            <div
                              key={pdf.id || index}
                              className="bg-white rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <DocumentTextIcon className="w-4 h-4 text-green-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {pdf.title}
                                  </h4>
                                  {pdf.title_ar && (
                                    <h5
                                      className="text-sm text-gray-600 mb-2 font-arabic"
                                      dir="rtl"
                                    >
                                      {pdf.title_ar}
                                    </h5>
                                  )}
                                  {pdf.sectionTitle && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      📑 Section: {pdf.sectionTitle}
                                    </p>
                                  )}
                                  {pdf.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {pdf.description}
                                    </p>
                                  )}
                                  {pdf.description_ar && (
                                    <p
                                      className="text-sm text-gray-600 mb-2 font-arabic"
                                      dir="rtl"
                                    >
                                      {pdf.description_ar}
                                    </p>
                                  )}
                                  {pdf.order && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      Ordre: {pdf.order}
                                    </p>
                                  )}
                                  <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    Ouvrir le PDF
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Applications Section */}
            {course.Course_Applications &&
              course.Course_Applications.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Candidatures ({course.Course_Applications.length})
                    </h3>
                    <div className="space-y-3">
                      {course.Course_Applications.slice(0, 5).map(
                        (application) => (
                          <div
                            key={application.id}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {application.User?.FirstName}{" "}
                                  {application.User?.LastName}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs ${
                                    application.status === "approved"
                                      ? "bg-green-100 text-green-700"
                                      : application.status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {application.status === "approved"
                                    ? "Approuvée"
                                    : application.status === "rejected"
                                    ? "Rejetée"
                                    : "En attente"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {application.User?.Email}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                      {course.Course_Applications.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          Et {course.Course_Applications.length - 5} autres
                          candidatures...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistiques
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Prix</span>
                  <span className="font-semibold text-gray-900">
                    {course.Price && course.Price > 0
                      ? `${course.Price}€`
                      : "Gratuit"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Durée</span>
                  <span className="font-semibold text-gray-900">
                    {course.Duration || "Non spécifiée"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Langue</span>
                  <span className="font-semibold text-gray-900">
                    {course.Language || "Non spécifiée"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sections</span>
                  <span className="font-semibold text-gray-900">
                    {sections.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Éléments de contenu</span>
                  <span className="font-semibold text-gray-900">
                    {sections.reduce(
                      (total, section) => total + (section.items?.length || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Candidatures</span>
                  <span className="font-semibold text-gray-900">
                    {course.Course_Applications?.length || 0}
                  </span>
                </div>
                {course.course_reviews && course.course_reviews.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Note moyenne</span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900">
                        {(
                          course.course_reviews.reduce(
                            (sum, r) => sum + r.Rate,
                            0
                          ) / course.course_reviews.length
                        ).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({course.course_reviews.length})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations détaillées
              </h3>
              <div className="space-y-3">
                {course.subCategory && (
                  <div>
                    <span className="text-sm text-gray-600">
                      Sous-catégorie
                    </span>
                    <p className="font-medium text-gray-900">
                      {course.subCategory}
                    </p>
                  </div>
                )}
                {course.Prerequisites && (
                  <div>
                    <span className="text-sm text-gray-600">Prérequis</span>
                    <div className="font-medium text-gray-900">
                      <RichTextDisplay content={course.Prerequisites} />
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">
                    Date de création
                  </span>
                  <p className="font-medium text-gray-900">
                    {new Date(course.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    Dernière modification
                  </span>
                  <p className="font-medium text-gray-900">
                    {new Date(course.updatedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
