import {
    Eye,
    Edit,
    Trash2,
    Users,
    Clock,
    Play,
    Heart,
    Star,
} from "lucide-react";
import { RichTextDisplay } from "../../Common/RichTextEditor";

const CourseCard = ({ course, handleView, handleEdit, handleDelete }) => {
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

    // Calculate if course has discount
    const hasDiscount =
        course.discountPrice && course.discountPrice < course.Price;
    const discountPercentage = hasDiscount
        ? Math.round(
              ((course.Price - course.discountPrice) / course.Price) * 100
          )
        : 0;

    // Default values for missing data
    const defaultThumbnail =
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop";
    const applications = course.stats?.totalApplications || 0;
    const approvedApplications = course.stats?.approvedApplications || 0;
    const totalVideos = course.stats?.totalVideos || 0;
    const averageRating = parseFloat(
        course.stats?.averageRating || course.Rate || 0
    );
    const totalReviews = course.stats?.totalReviews || 0;

    return (
        <div className="bg-white mx-auto rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105 border border-gray-100 h-[32rem] flex flex-col w-80">
            <div className="relative h-48">
                <img
                    src={
                        course.ThumbnailUrl ||
                        course.ImageUrl ||
                        defaultThumbnail
                    }
                    alt={course.Title || "Course thumbnail"}
                    className="w-full h-full object-cover"
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
                {/* <div className="absolute top-4 right-4">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                        <Heart className="w-4 h-4 text-gray-400" />
                    </div>
                </div> */}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                            course.Level || course.difficulty
                        )}`}
                    >
                        {getDifficultyText(course.Level || course.difficulty)}
                    </span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                            {averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                            ({totalReviews})
                        </span>
                    </div>
                </div>

                <div className="relative group mb-2">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                        {course.Title}
                    </h3>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm rounded-lg py-2 px-3 max-w-xs break-words">
                        {course.Title}
                    </div>
                </div>

                <div className="relative group mb-3 max-h-16 overflow-hidden">
                    <RichTextDisplay
                        content={course.shortDescription || course.Description}
                        className="text-gray-600 text-sm line-clamp-3"
                        maxLength={120}
                        showReadMore={false}
                    />
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm rounded-lg py-2 px-3 max-w-xs break-words">
                        <RichTextDisplay
                            content={
                                course.shortDescription || course.Description
                            }
                            className="text-white text-sm"
                            maxLength={300}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{approvedApplications}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                            {course.duration ? `${course.duration}h` : "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        <span>{totalVideos}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {hasDiscount && (
                            <span className="text-base font-bold text-red-500 line-through">
                                {parseFloat(course.Price).toFixed(2)}€
                            </span>
                        )}
                        <span className="text-xl font-bold text-gray-800">
                            {hasDiscount
                                ? parseFloat(course.discountPrice).toFixed(2)
                                : parseFloat(course.Price || 0).toFixed(2)}
                            €
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="text-xs">
                            Étudiants: {applications}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {course.Category}
                    </span>
                </div>

                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={() => handleView(course.id)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                        <Eye className="w-4 h-4" />
                        Voir
                    </button>
                    <button
                        onClick={() => handleEdit(course.id)}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </button>
                    <button
                        onClick={() => handleDelete(course.id)}
                        className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
