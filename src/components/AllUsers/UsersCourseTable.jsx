import React from "react";
import { Loader2, X } from "lucide-react";
import StatusBadge from "./StatusBadgeDashboard";

const UsersCourseTable = ({
  users,
  loading,
  pagination,
  onPageChange,
  filters,
  setFilters,
}) => {
  const clearFilter = (filterName) => {
    setFilters((prev) => ({ ...prev, [filterName]: "" }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-4 bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-semibold text-gray-600">
            <div className="text-left">Utilisateur</div>
            <div className="text-left">Cours</div>
            <div className="text-left">Paiement</div>
            <div className="text-left">Inscription</div>
            <div className="text-left">Statut</div>
            <div className="text-left">Progrès</div>
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-6 gap-4 border-b border-gray-200 px-4 py-3 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="relative group">
                    <div className="text-gray-500 truncate max-w-[120px] cursor-pointer">
                      {user.email}
                    </div>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md p-2 z-10 min-w-[200px] -mt-8 ml-4">
                      <p>Email: {user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="truncate max-w-[150px]">{user.course}</div>
              <div>
                <StatusBadge status={user.paymentStatus} />
              </div>
              <div>
                {new Date(user.registrationDate).toLocaleDateString("fr-FR")}
              </div>
              <div>
                <StatusBadge status={user.courseStatus} />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${user.progress}%` }}
                  ></div>
                </div>
                <span>{user.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-md border border-gray-200 p-3"
          >
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {user.name}
                </h3>
                <div className="relative group">
                  <p className="text-xs text-gray-500 cursor-pointer">
                    {user.email}
                  </p>
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md p-2 z-10 min-w-[200px] mt-1">
                    <p>Email: {user.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="font-semibold">Cours:</div>
              <div className="truncate">{user.course}</div>
              <div className="font-semibold">Paiement:</div>
              <div>
                <StatusBadge status={user.paymentStatus} />
              </div>
              <div className="font-semibold">Inscription:</div>
              <div>
                {new Date(user.registrationDate).toLocaleDateString("fr-FR")}
              </div>
              <div className="font-semibold">Statut:</div>
              <div>
                <StatusBadge status={user.courseStatus} />
              </div>
              <div className="font-semibold">Progrès:</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${user.progress}%` }}
                  ></div>
                </div>
                <span>{user.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-1">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`px-2 py-1 rounded border text-sm ${
              pagination.currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Précédent
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-2 py-1 rounded border text-sm ${
                  page === pagination.currentPage
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`px-2 py-1 rounded border text-sm ${
              pagination.currentPage === pagination.totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersCourseTable;
