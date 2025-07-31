import { BookOpen, Plus } from "lucide-react";

const EmptyState = ({ searchTerm }) => {
    return (
        <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
                Aucun cours trouvé
            </h3>
            <p className="text-gray-600 mb-6">
                {searchTerm
                    ? `Aucun cours ne correspond à "${searchTerm}"`
                    : "Aucun cours ne correspond aux filtres sélectionnés"}
            </p>
            <button
                onClick={() => (window.location.href = "/AddCourse")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
                <Plus className="w-5 h-5" />
                Créer votre premier cours
            </button>
        </div>
    );
};

export default EmptyState;
