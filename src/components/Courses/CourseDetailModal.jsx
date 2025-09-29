import {
    X,
    Calendar,
    Users,
    Clock,
    Play,
    Star,
    Heart,
    Share2,
} from "lucide-react";
import RichTextDisplay from "../Common/RichTextEditor/RichTextDisplay";

const CourseDetailModal = ({ course, isOpen, onClose }) => {
    if (!isOpen || !course) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case "published":
                return "bg-green-100 text-green-800";
            case "draft":
                return "bg-yellow-100 text-yellow-800";
            case "archived":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "published":
                return "Publié";
            case "draft":
                return "Brouillon";
            case "archived":
                return "Archivé";
            default:
                return status;
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "beginner":
                return "bg-blue-100 text-blue-800";
            case "intermediate":
                return "bg-purple-100 text-purple-800";
            case "advanced":
                return "bg-red-100 text-red-800";
            case "expert":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getDifficultyText = (difficulty) => {
        switch (difficulty) {
            case "beginner":
                return "Débutant";
            case "intermediate":
                return "Intermédiaire";
            case "advanced":
                return "Avancé";
            case "expert":
                return "Expert";
            default:
                return difficulty;
        }
    };

    const hasDiscount =
        course.discountPrice && course.discountPrice < course.Price;
    const discountPercentage = hasDiscount
        ? Math.round(
              ((course.Price - course.discountPrice) / course.Price) * 100
          )
        : 0;

    const defaultThumbnail =
        "http://localhost:3000/Courses_Pictures/default-course-thumbnail.jpeg";
    // ||
    // "https://Images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop";
    const applications = course.stats?.totalApplications || 0;
    const approvedApplications = course.stats?.approvedApplications || 0;
    const totalVideos = course.stats?.totalVideos || 0;
    const averageRating = parseFloat(
        course.stats?.averageRating || course.Rate || 0
    );
    const totalReviews = course.stats?.totalReviews || 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative">
                    <img
                        src={
                            // course.ThumbnailUrl ||
                            import.meta.env.VITE_API_URL + course.Image ||
                            defaultThumbnail
                        }
                        alt={course.Title}
                        className="w-full h-64 object-cover rounded-t-2xl"
                        onError={(e) => {
                            e.target.src = defaultThumbnail;
                        }}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                course.status
                            )}`}
                        >
                            {getStatusText(course.status)}
                        </span>
                        {hasDiscount && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                -{discountPercentage}%
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-3 my-6 pb-6 border-b border-gray-200 mx-12">
                    <button
                        onClick={() =>
                            (window.location.href = `/Courses/${
                                course.id || course.ID
                            }`)
                        }
                        className="flex-1 bg-blue-600 text-white w-fit px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Play className="w-5 h-5" />
                        Voir le cours complet
                    </button>
                    {/* <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button> */}
                </div>
                {/* Content */}
                <div className="p-6">
                    {/* Title and Rating */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                        course.Level || course.difficulty
                                    )}`}
                                >
                                    {getDifficultyText(
                                        course.Level || course.difficulty
                                    )}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {course.Category}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                {course.Title}
                            </h1>
                            {course.Title_ar && (
                                <h2
                                    className="text-xl font-semibold text-gray-600 mb-2"
                                    dir="rtl"
                                >
                                    {course.Title_ar}
                                </h2>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="text-lg font-semibold text-gray-800">
                                    {averageRating.toFixed(1)}
                                </span>
                                <span className="text-gray-500">
                                    ({totalReviews} avis)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                                {approvedApplications}
                            </div>
                            <div className="text-xs text-gray-500">
                                Étudiants
                            </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                                {course.duration
                                    ? `${course.duration}h`
                                    : "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">Durée</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                                <Play className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                                {totalVideos}
                            </div>
                            <div className="text-xs text-gray-500">Vidéos</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center mb-1">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                                {course.Language}
                            </div>
                            <div className="text-xs text-gray-500">Langue</div>
                        </div>
                    </div>
                    {/* Short Descriptions */}
                    {(course.shortDescription ||
                        course.shortDescription_ar) && (
                        <div>
                            <h4 className="font-semibold text-gray-800">
                                Résumé
                            </h4>
                            {course.shortDescription && (
                                <p className="text-gray-600   mb-12">
                                    {course.shortDescription}
                                </p>
                            )}
                            {course.shortDescription_ar && (
                                <p className="text-gray-600  mb-12" dir="rtl">
                                    {course.shortDescription_ar}
                                </p>
                            )}
                        </div>
                    )}
                    {/* Price */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-gray-800">
                                {hasDiscount
                                    ? parseFloat(course.discountPrice).toFixed(
                                          2
                                      )
                                    : parseFloat(course.Price || 0).toFixed(2)}
                                €
                            </span>
                            {hasDiscount && (
                                <span className="text-lg text-gray-400 line-through">
                                    {parseFloat(course.Price).toFixed(2)}€
                                </span>
                            )}
                            {course.Price === 0 && (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Gratuit
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-6">
                        {/* French Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                Description
                            </h3>
                            <div className="prose max-w-none">
                                <RichTextDisplay
                                    content={course.Description}
                                    className="text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Arabic Description */}
                        {course.Description_ar && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    الوصف
                                </h3>
                                <div className="prose max-w-none" dir="rtl">
                                    <RichTextDisplay
                                        content={course.Description_ar}
                                        className="text-gray-700"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Prerequisites */}
                        {course.Prerequisites && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Prérequis
                                </h3>
                                <div className="prose max-w-none">
                                    <RichTextDisplay
                                        content={course.Prerequisites}
                                        className="text-gray-700"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Course Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                    Catégorie
                                </h4>
                                <p className="text-gray-600">
                                    {course.Category}
                                </p>
                                {course.Category_ar && (
                                    <p className="text-gray-600" dir="rtl">
                                        {course.Category_ar}
                                    </p>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                    Sous-catégorie
                                </h4>
                                <p className="text-gray-600">
                                    {course.subCategory || "Non spécifiée"}
                                </p>
                                {course.subCategory_ar && (
                                    <p className="text-gray-600" dir="rtl">
                                        {course.subCategory_ar}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;
