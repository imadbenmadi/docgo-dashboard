import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onPageSizeChange,
}) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    // Calculate which page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Items Info */}
                <div className="text-sm text-gray-600">
                    Affichage de {startItem} à {endItem} sur {totalItems}{" "}
                    programme{totalItems > 1 ? "s" : ""}
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Afficher:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) =>
                            onPageSizeChange(Number(e.target.value))
                        }
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value={6}>6</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                    </select>
                    <span className="text-sm text-gray-600">par page</span>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        {/* First Page */}
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg transition-colors ${
                                currentPage === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                            title="Première page"
                        >
                            <ChevronsLeft className="w-5 h-5" />
                        </button>

                        {/* Previous Page */}
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg transition-colors ${
                                currentPage === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                            title="Page précédente"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {startPage > 1 && (
                                <>
                                    <button
                                        onClick={() => onPageChange(1)}
                                        className="px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        1
                                    </button>
                                    {startPage > 2 && (
                                        <span className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    )}
                                </>
                            )}

                            {pageNumbers.map((page) => (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                        page === currentPage
                                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {endPage < totalPages && (
                                <>
                                    {endPage < totalPages - 1 && (
                                        <span className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    )}
                                    <button
                                        onClick={() => onPageChange(totalPages)}
                                        className="px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Next Page */}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg transition-colors ${
                                currentPage === totalPages
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                            title="Page suivante"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg transition-colors ${
                                currentPage === totalPages
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                            title="Dernière page"
                        >
                            <ChevronsRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pagination;
