import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    showSizeSelector = true,
    onPageSizeChange,
}) => {
    const pageSizeOptions = [10, 20, 50, 100];

    const generatePageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate start and end of visible range
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust range if near beginning or end
            if (currentPage <= 3) {
                end = Math.min(totalPages - 1, 4);
            } else if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3);
            }

            // Add ellipsis before range if needed
            if (start > 2) {
                pages.push("...");
            }

            // Add visible range
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis after range if needed
            if (end < totalPages - 1) {
                pages.push("...");
            }

            // Always show last page if more than 1 page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Results Summary */}
                <div className="text-sm text-gray-600">
                    Affichage de {startItem} à {endItem} sur {totalItems}{" "}
                    résultats
                </div>

                {/* Page Size Selector */}
                {showSizeSelector && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Afficher:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) =>
                                onPageSizeChange?.(parseInt(e.target.value))
                            }
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-600">par page</span>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage <= 1
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {pageNumbers.map((page, index) => (
                            <div key={index}>
                                {page === "..." ? (
                                    <div className="flex items-center justify-center w-10 h-10">
                                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onPageChange(page)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                                            page === currentPage
                                                ? "bg-blue-600 text-white shadow-lg"
                                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage >= totalPages
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                    >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
