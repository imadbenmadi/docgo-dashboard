import { BookOpen, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CourseCard from "../components/Courses/EditCourse/CourseCard";
import EmptyState from "../components/Courses/EditCourse/EmptyState";
import SearchAndFilters from "../components/Courses/EditCourse/SearchAndFilters";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const mockCourses = [
    {
      id: 1,
      title: "React Développement Avancé",
      description:
        "Maîtrisez React  ec les hooks, le context API et les patterns avancés pour créer des applications web modernec les hooks, le context API et les patterns avancés pour créer des applications web modernec les hooks, le context API et les patterns avancés pour créer des applications web modern  avec les hooks, le context API et les patterns avancés pour créer des applications web mode ",
      thumbnail:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
      price: 89.99,
      originalPrice: 129.99,
      difficulty: "Professionnels",
      duration: "12 heures",
      studentsCount: 2847,
      rating: 4.8,
      reviewsCount: 342,
      status: "published",
      category: "Développement Web",
      createdAt: "2024-01-15",
      updatedAt: "2024-02-20",
      videosCount: 45,
      quizzesCount: 8,
      hasDiscount: true,
      discountPercentage: 30,
      instructor: "Marie Dubois",
      revenue: 12450.5,
      completionRate: 87,
    },
    {
      id: 2,
      title: "JavaScript pour Débutants",
      description:
        "Apprenez les fondamentaux de JavaScript de zéro jusqu'à la création de vos premiers projets interactifs.",
      thumbnail:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
      price: 49.99,
      originalPrice: 49.99,
      difficulty: "Débutants",
      duration: "8 heures",
      studentsCount: 5234,
      rating: 4.6,
      reviewsCount: 789,
      status: "published",
      category: "Programmation",
      createdAt: "2024-01-10",
      updatedAt: "2024-02-15",
      videosCount: 32,
      quizzesCount: 5,
      hasDiscount: false,
      instructor: "Jean Martin",
      revenue: 8756.3,
      completionRate: 92,
    },
    {
      id: 3,
      title: "Design UI/UX avec Figma",
      description:
        "Créez des interfaces utilisateur modernes et attractives avec Figma et les principes du design thinking.",
      thumbnail:
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=250&fit=crop",
      price: 69.99,
      originalPrice: 99.99,
      difficulty: "Intermédiaires",
      duration: "10 heures",
      studentsCount: 1456,
      rating: 4.9,
      reviewsCount: 203,
      status: "draft",
      category: "Design",
      createdAt: "2024-02-01",
      updatedAt: "2024-02-25",
      videosCount: 38,
      quizzesCount: 6,
      hasDiscount: true,
      discountPercentage: 25,
      instructor: "Sophie Laurent",
      revenue: 5430.2,
      completionRate: 78,
    },
    {
      id: 4,
      title: "Python pour l'Intelligence Artificielle",
      description:
        "Découvrez les applications de Python dans l'IA, le machine learning et l'analyse de données.",
      thumbnail:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
      price: 149.99,
      originalPrice: 199.99,
      difficulty: "Professionnels",
      duration: "16 heures",
      studentsCount: 892,
      rating: 4.7,
      reviewsCount: 127,
      status: "published",
      category: "Intelligence Artificielle",
      createdAt: "2024-01-20",
      updatedAt: "2024-02-10",
      videosCount: 52,
      quizzesCount: 12,
      hasDiscount: true,
      discountPercentage: 25,
      instructor: "Dr. Pierre Durand",
      revenue: 15670.8,
      completionRate: 73,
    },
    {
      id: 5,
      title: "WordPress pour Entrepreneurs",
      description:
        "Créez votre site web professionnel avec WordPress sans connaissances techniques préalables.",
      thumbnail:
        "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=250&fit=crop",
      price: 39.99,
      originalPrice: 39.99,
      difficulty: "Débutants",
      duration: "6 heures",
      studentsCount: 3421,
      rating: 4.5,
      reviewsCount: 456,
      status: "published",
      category: "Développement Web",
      createdAt: "2024-01-05",
      updatedAt: "2024-02-18",
      videosCount: 28,
      quizzesCount: 4,
      hasDiscount: false,
      instructor: "Claire Moreau",
      revenue: 7890.45,
      completionRate: 89,
    },
    {
      id: 6,
      title: "Photoshop Professionnel",
      description:
        "Maîtrisez tous les outils de Photoshop pour la retouche photo et la création graphique professionnelle.",
      thumbnail:
        "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=250&fit=crop",
      price: 79.99,
      originalPrice: 79.99,
      difficulty: "Intermédiaires",
      duration: "14 heures",
      studentsCount: 2103,
      rating: 4.8,
      reviewsCount: 298,
      status: "archived",
      category: "Design",
      createdAt: "2023-12-15",
      updatedAt: "2024-01-30",
      videosCount: 41,
      quizzesCount: 7,
      hasDiscount: false,
      instructor: "Thomas Blanc",
      revenue: 11234.7,
      completionRate: 81,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  const handleEdit = (courseId) => {
    console.log("Edit course:", courseId);
  };

  const handleDelete = (courseId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      setCourses(courses.filter((course) => course.id !== courseId));
      console.log("Delete course:", courseId);
    }
  };

  const handleView = (courseId) => {
    console.log("View course:", courseId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chargement des cours...
          </h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className=" max-md:text-xl  font-bold text-gray-800">
                  Gestion des Cours
                </h1>
                <p className="text-gray-600">
                  Gérez vos cours et analysez les données
                </p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouveau Cours
            </button>
          </div>
        </div>
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCourses.length} cours trouvé
            {filteredCourses.length > 1 ? "s" : ""}
            {searchTerm && ` pour "${searchTerm}"`}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              handleView={handleView}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ))}
        </div>
        {filteredCourses.length === 0 && <EmptyState searchTerm={searchTerm} />}
      </div>
    </div>
  );
};

export default AllCourses;
