import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Loader2,
  Tag,
  Euro,
  Clock,
  ArrowUpDown,
} from "lucide-react";

export default function AllCourses() {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction à React",
      description:
        "Apprenez les bases de React, la bibliothèque JavaScript pour construire des interfaces utilisateur.",
      price: 49.99,
      hasDiscount: true,
      discountPercentage: 20,
      difficulty: "Débutant",
      duration: "3 heures",
      createdAt: new Date("2023-10-01T12:00:00Z"),
      thumbnail: null, // Placeholder for thumbnail
    },
    {
      id: 2,
      title: "Avancé en JavaScript",
      description:
        "Approfondissez vos connaissances en JavaScript avec des concepts avancés et des techniques modernes.",
      price: 79.99,
      hasDiscount: false,
      discountPercentage: 0,
      difficulty: "Intermédiaire",
      duration: "5 heures",
      createdAt: new Date("2023-09-15T12:00:00Z"),
      thumbnail: null, // Placeholder for thumbnail
    },
    {
      id: 3,
      title: "Développement Web Full Stack",
      description:
        "Devenez un développeur web full stack en apprenant à construire des applications complètes avec React et Node.js.",
      price: 99.99,
      hasDiscount: true,
      discountPercentage: 15,
      difficulty: "Avancé",
      duration: "10 heures",
      createdAt: new Date("2023-08-20T12:00:00Z"),
      thumbnail: null, // Placeholder for thumbnail
    },
    {
      id: 4,
      title: "Introduction à Python",
      description:
        "Découvrez les bases de Python, un langage de programmation polyvalent et facile à apprendre.",
      price: 39.99,
      hasDiscount: false,
      discountPercentage: 0,
      difficulty: "Débutant",
      duration: "4 heures",
      createdAt: new Date("2023-07-10T12:00:00Z"),
      thumbnail: null, // Placeholder for thumbnail
    },
    {
      id: 5,
      title: "Data Science avec Pandas",
      description:
        "Apprenez à manipuler et analyser des données avec Pandas, la bibliothèque Python pour la science des données.",
      price: 59.99,
      hasDiscount: true,
      discountPercentage: 10,
      difficulty: "Intermédiaire",
      duration: "6 heures",
      createdAt: new Date("2023-06-05T12:00:00Z"),
      thumbnail: null, // Placeholder for thumbnail
    },
  ]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false to see the content
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch courses from backend
  useEffect(() => {}, []);

  // Sort courses based on sortBy state
  const sortedCourses = [...courses].sort((a, b) => {
    if (sortBy === "newest") {
      return b.createdAt - a.createdAt; // Newest first
    }
    if (sortBy === "oldest") {
      return a.createdAt - b.createdAt; // Oldest first
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title); // Alphabetical by title
    }
    if (sortBy === "price-low") {
      return (
        a.price * (a.hasDiscount ? 1 - a.discountPercentage / 100 : 1) -
        b.price * (b.hasDiscount ? 1 - b.discountPercentage / 100 : 1)
      ); // Price low to high
    }
    if (sortBy === "price-high") {
      return (
        b.price * (b.hasDiscount ? 1 - b.discountPercentage / 100 : 1) -
        a.price * (a.hasDiscount ? 1 - a.discountPercentage / 100 : 1)
      ); // Price high to low
    }
    return 0;
  });

  // Format date for display
  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) {
      return "Date inconnue";
    }
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chargement des cours...
          </h2>
          <p className="text-gray-600">
            Veuillez patienter pendant que nous récupérons vos cours
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Tous les Cours
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez tous les cours disponibles et commencez votre
            apprentissage dès aujourd'hui
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="mb-8 flex justify-end">
          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              aria-label="Trier les cours"
            >
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="title">Titre (A-Z)</option>
              <option value="price-low">Prix (croissant)</option>
              <option value="price-high">Prix (décroissant)</option>
            </select>
            <ArrowUpDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Courses Grid */}
        {sortedCourses.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="w-24 h-24 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              Aucun cours disponible
            </h3>
            <p className="text-gray-400 mb-6">
              Ajoutez votre premier cours pour commencer
            </p>
            <a
              href="/add-course"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto inline-flex"
              aria-label="Ajouter un nouveau cours"
            >
              <BookOpen className="w-5 h-5" />
              Ajouter un Cours
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border border-gray-100"
                role="article"
                aria-labelledby={`course-title-${course.id}`}
              >
                {/* Thumbnail */}
                {course.thumbnail ? (
                  <img
                    src={
                      typeof course.thumbnail === "string"
                        ? course.thumbnail
                        : URL.createObjectURL(course.thumbnail)
                    }
                    alt={`Miniature du cours ${course.title}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Course Details */}
                <div className="p-5">
                  <h2
                    id={`course-title-${course.id}`}
                    className="text-xl font-bold text-gray-800 mb-2 line-clamp-2"
                  >
                    {course.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Euro className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        {course.hasDiscount && course.discountPercentage ? (
                          <>
                            <span className="line-through text-gray-500 mr-1">
                              {course.price} €
                            </span>
                            <span className="text-green-600 font-medium">
                              {(
                                course.price *
                                (1 - course.discountPercentage / 100)
                              ).toFixed(2)}{" "}
                              € ({course.discountPercentage}% de réduction)
                            </span>
                          </>
                        ) : (
                          `${course.price} €`
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <span className="text-sm capitalize">
                        {course.difficulty}
                      </span>
                    </div>
                    {course.duration && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{course.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Créé le {formatDate(course.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={`/courses/${course.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-center text-sm font-medium"
                      aria-label={`Voir le cours ${course.title}`}
                    >
                      Voir
                    </a>
                    <a
                      href={`/edit-course/${course.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors text-center text-sm font-medium"
                      aria-label={`Modifier le cours ${course.title}`}
                    >
                      Modifier
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
