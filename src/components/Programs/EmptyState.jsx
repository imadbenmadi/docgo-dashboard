import { GraduationCap, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyState = ({ searchTerm }) => {
    const navigate = useNavigate();

    const handleAddProgram = () => {
        navigate("/Programs/Add");
    };

    if (searchTerm) {
        return (
            <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Aucun programme trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                    Aucun programme ne correspond à votre recherche &quot;
                    {searchTerm}&quot;.
                    <br />
                    Essayez avec des termes différents ou créez un nouveau
                    programme.
                </p>
                <button
                    onClick={handleAddProgram}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                >
                    <Plus className="w-5 h-5" />
                    Créer un programme
                </button>
            </div>
        );
    }

    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Aucun programme disponible
            </h3>
            <p className="text-gray-600 mb-6">
                Vous n&apos;avez pas encore créé de programmes de bourses.
                <br />
                Commencez par créer votre premier programme.
            </p>
            <button
                onClick={handleAddProgram}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
                <Plus className="w-5 h-5" />
                Créer votre premier programme
            </button>
        </div>
    );
};

export default EmptyState;
