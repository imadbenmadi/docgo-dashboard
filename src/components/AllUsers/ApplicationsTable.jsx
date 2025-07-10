import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { Loader2, ChevronDown, X } from "lucide-react";

const ApplicationsTable = ({
  applications,
  setApplications,
  loading,
  pagination,
  onPageChange,
  filters,
  setFilters,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Refuser":
        return "bg-red-100 text-red-600";
      case "Accepter":
        return "bg-green-100 text-green-600";
      case "En attente":
        return "bg-yellow-100 text-yellow-600";
      case "On going":
        return "bg-blue-100 text-blue-600";
      case "Done":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const StatusBadge = ({ status, onClick, showDropdown }) => (
    <div className="relative">
      <button
        className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium w-24 ${getStatusStyles(
          status
        )} hover:opacity-80 transition-opacity`}
        onClick={onClick}
      >
        <span>{status}</span>
        {showDropdown && <ChevronDown className="w-3 h-3 ml-1" />}
      </button>
    </div>
  );

  const StatusDropdown = ({ currentStatus, onStatusChange, isOpen, type }) => {
    const statusOptions =
      type === "status"
        ? ["Accepter", "Refuser", "En attente"]
        : ["On going", "Done"];

    const filteredOptions = statusOptions.filter(
      (option) => option !== currentStatus
    );

    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 mt-1 w-24 bg-white rounded-md shadow-md border border-gray-200 z-10">
        {filteredOptions.map((option, index) => (
          <button
            key={option}
            className={`w-full px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 transition-colors ${
              index === filteredOptions.length - 1
                ? ""
                : "border-b border-gray-100"
            }`}
            onClick={() => onStatusChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  const handleStatusChange = (applicationId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
    setActiveDropdown(null);
  };

  const handleViberStatusChange = (applicationId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, viberStatus: newStatus } : app
      )
    );
    setActiveDropdown(null);
  };

  const toggleDropdown = (applicationId, type) => {
    const dropdownId = `${applicationId}-${type}`;
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  const clearFilter = (filterName) => {
    setFilters((prev) => ({ ...prev, [filterName]: "" }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.country && (
          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-600">
            <span>Pays: {filters.country}</span>
            <button
              onClick={() => clearFilter("country")}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {filters.search && (
          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-600">
            <span>Recherche: {filters.search}</span>
            <button
              onClick={() => clearFilter("search")}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-7 gap-4 bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-semibold text-gray-600">
              <div className="text-center">Nom</div>
              <div className="text-center">Téléphone</div>
              <div className="text-center">Spécialité</div>
              <div className="text-center">Application</div>
              <div className="text-center">Inscription</div>
              <div className="text-center">Lieu d'étude</div>
              <div className="text-center">Viber</div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            )}

            {/* Rows */}
            {!loading &&
              applications.map((app) => (
                <div
                  key={app.id}
                  className="grid grid-cols-7 gap-4 border-b border-gray-200 py-3 px-4 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">{app.name}</div>
                  <div className="text-center">{app.phone}</div>
                  <div className="text-center">{app.specialty}</div>
                  <div className="text-center relative">
                    <StatusBadge
                      status={app.status}
                      onClick={() => toggleDropdown(app.id, "status")}
                      showDropdown={true}
                    />
                    <StatusDropdown
                      currentStatus={app.status}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(app.id, newStatus)
                      }
                      isOpen={activeDropdown === `${app.id}-status`}
                      type="status"
                    />
                  </div>
                  <div className="text-center">{app.registrationDate}</div>
                  <div className="text-center">{app.studyPlace}</div>
                  <div className="text-center relative">
                    <StatusBadge
                      status={app.viberStatus}
                      onClick={() => toggleDropdown(app.id, "viber")}
                      showDropdown={true}
                    />
                    <StatusDropdown
                      currentStatus={app.viberStatus}
                      onStatusChange={(newStatus) =>
                        handleViberStatusChange(app.id, newStatus)
                      }
                      isOpen={activeDropdown === `${app.id}-viber`}
                      type="viber"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-md shadow-sm border border-gray-200 p-3"
            >
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="font-semibold">Nom:</div>
                <div>{app.name}</div>
                <div className="font-semibold">Téléphone:</div>
                <div>{app.phone}</div>
                <div className="font-semibold">Spécialité:</div>
                <div>{app.specialty}</div>
                <div className="font-semibold">Application:</div>
                <div className="relative">
                  <StatusBadge
                    status={app.status}
                    onClick={() => toggleDropdown(app.id, "status")}
                    showDropdown={true}
                  />
                  <StatusDropdown
                    currentStatus={app.status}
                    onStatusChange={(newStatus) =>
                      handleStatusChange(app.id, newStatus)
                    }
                    isOpen={activeDropdown === `${app.id}-status`}
                    type="status"
                  />
                </div>
                <div className="font-semibold">Inscription:</div>
                <div>{app.registrationDate}</div>
                <div className="font-semibold">Lieu d'étude:</div>
                <div>{app.studyPlace}</div>
                <div className="font-semibold">Viber:</div>
                <div className="relative">
                  <StatusBadge
                    status={app.viberStatus}
                    onClick={() => toggleDropdown(app.id, "viber")}
                    showDropdown={true}
                  />
                  <StatusDropdown
                    currentStatus={app.viberStatus}
                    onStatusChange={(newStatus) =>
                      handleViberStatusChange(app.id, newStatus)
                    }
                    isOpen={activeDropdown === `${app.id}-viber`}
                    type="viber"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <ReactPaginate
          previousLabel={"Précédent"}
          nextLabel={"Suivant"}
          breakLabel={"..."}
          pageCount={pagination.totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={({ selected }) => onPageChange(selected + 1)}
          containerClassName={"flex items-center justify-center mt-4 gap-1"}
          pageClassName={"px-2 py-1 rounded border border-gray-200 text-sm"}
          pageLinkClassName={"text-gray-700"}
          activeClassName={"bg-blue-500 text-white border-blue-500"}
          previousClassName={`px-2 py-1 rounded border text-sm ${
            pagination.currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          nextClassName={`px-2 py-1 rounded border text-sm ${
            pagination.currentPage === pagination.totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          breakClassName={"px-2 py-1 text-sm"}
          forcePage={pagination.currentPage - 1}
        />
      )}
    </div>
  );
};

export default ApplicationsTable;
