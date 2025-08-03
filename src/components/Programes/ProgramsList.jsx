import {
    Clock,
    Edit,
    Eye,
    GraduationCap,
    MapPin,
    Plus,
    Trash2,
} from "lucide-react";

const ProgramsList = ({
    programs,
    setCurrentPage,
    handleView,
    handleEdit,
    handleDelete,
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="mx-auto px-6 py-16">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0">
                    <div>
                        <h1 className="text-6xl max-md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 leading-tight">
                            Programs Management
                        </h1>
                        <p className="text-2xl font-light text-gray-600 mt-2">
                            Programs
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 rounded-full"></div>
                    </div>

                    <button
                        onClick={() => setCurrentPage("add")}
                        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 font-semibold text-lg overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <Plus
                            size={24}
                            className="transition-transform group-hover:rotate-90 duration-300"
                        />
                        Add New Program
                    </button>
                </div>

                {/* Programs Grid */}
                {programs.length === 0 ? (
                    <div className="text-center py-20">
                        <GraduationCap
                            size={80}
                            className="mx-auto text-gray-300 mb-6"
                        />
                        <h3 className="text-2xl font-semibold text-gray-500 mb-2">
                            No Programs Available
                        </h3>
                        <p className="text-gray-400">
                            Create your first study abroad program to get
                            started!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                        {programs.map((program, index) => (
                            <div
                                key={program.id}
                                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation:
                                        "fadeInUp 0.6s ease-out forwards",
                                }}
                            >
                                {/* Image Container */}
                                <div className="relative overflow-hidden">
                                    {program.Image ? (
                                        <img
                                            src={program.Image}
                                            alt={program.title}
                                            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                                            <GraduationCap
                                                size={80}
                                                className="text-white opacity-50"
                                            />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Price Badge */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {program.price}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                                        {program.title}
                                    </h3>

                                    {/* Info Pills */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin
                                                size={18}
                                                className="text-blue-500"
                                            />
                                            <span className="font-medium">
                                                {program.country}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock
                                                size={18}
                                                className="text-green-500"
                                            />
                                            <span>
                                                Duration: {program.duration}
                                            </span>
                                        </div>
                                        {program.university && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <GraduationCap
                                                    size={18}
                                                    className="text-purple-500"
                                                />
                                                <span className="truncate">
                                                    {program.university}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleView(program)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <Eye size={16} />
                                            <span className="hidden sm:inline">
                                                View
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(program)}
                                            className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <Edit size={16} />
                                            <span className="hidden sm:inline">
                                                Edit
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(program.id)
                                            }
                                            className="bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <Trash2 size={16} />
                                            <span className="hidden sm:inline">
                                                Delete
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default ProgramsList;
