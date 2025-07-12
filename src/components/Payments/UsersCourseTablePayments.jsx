import React, { useState } from "react";
import { Loader2, ChevronDown, Eye } from "lucide-react";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import StatusBadgeDashboard from "../AllUsers/StatusBadgeDashboard";

const MySwal = withReactContent(Swal);

const UsersCourseTablePayments = ({
  users,
  setUsers,
  loading,
  pagination,
  onPageChange,
  onViewPaymentProof,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");

  const handleStatusChange = (userId, newStatus) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, paymentStatus: newStatus } : user
      )
    );
    setActiveDropdown(null);
    MySwal.fire({
      icon: "success",
      title: "Statut mis à jour",
      text: `Le statut de paiement a été changé en ${newStatus}`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const toggleDropdown = (userId) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  const handleViewProof = (proofImage, name) => {
    setSelectedProof(proofImage);
    setSelectedUserName(name);
    setIsModalOpen(true);
  };

  const handleAcceptPayment = (userId) => {
    handleStatusChange(userId, "Paid");
    setIsModalOpen(false);
    MySwal.fire({
      icon: "success",
      title: "Paiement accepté",
      text: `Le paiement pour ${selectedUserName} a été accepté`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleRejectPayment = (userId) => {
    handleStatusChange(userId, "Failed");
    setIsModalOpen(false);
    MySwal.fire({
      icon: "error",
      title: "Paiement rejeté",
      text: `Le paiement pour ${selectedUserName} a été rejeté`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const StatusDropdown = ({ currentStatus, userId }) => {
    const statusOptions = ["Paid", "Pending", "Failed"];
    const filteredOptions = statusOptions.filter(
      (option) => option !== currentStatus
    );

    if (activeDropdown !== userId) return null;

    return (
      <div className="absolute top-full left-0 mt-1 w-24 bg-white rounded-md shadow-lg border border-gray-200 z-20">
        {filteredOptions.map((option, index) => (
          <button
            key={option}
            className={`w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors ${
              index === filteredOptions.length - 1
                ? ""
                : "border-b border-gray-100"
            }`}
            onClick={() => handleStatusChange(userId, option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Payment Proof Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-4">
              Preuve de paiement - {selectedUserName}
            </h2>
            {selectedProof ? (
              <img
                src={selectedProof}
                alt="Payment Proof"
                className="w-full h-auto max-h-96 object-contain mb-4 rounded"
              />
            ) : (
              <p className="text-gray-500 mb-4">Aucune preuve disponible</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                onClick={() =>
                  handleAcceptPayment(
                    users.find((u) => u.name === selectedUserName).id
                  )
                }
              >
                Accepter
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                onClick={() =>
                  handleRejectPayment(
                    users.find((u) => u.name === selectedUserName).id
                  )
                }
              >
                Rejeter
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-4 bg-gray-100 border-b border-gray-200 px-6 py-4 text-sm font-semibold text-gray-700 rounded-t-lg">
            <div className="text-left">Utilisateur</div>
            <div className="text-left">Cours</div>
            <div className="text-left">Méthode de Paiement</div>
            <div className="text-left">Paiement</div>
            <div className="text-left">Inscription</div>
            <div className="text-left">Action</div>
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-6 gap-4 border-b border-gray-200 px-6 py-4 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="font-medium truncate max-w-[150px]">
                    {user.name}
                  </div>
                  <div className="text-gray-500 truncate max-w-[150px]">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="truncate max-w-[150px]">{user.course}</div>
              <div className="truncate max-w-[150px]">
                {user.paymentMethod || "Non spécifié"}
              </div>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <StatusBadgeDashboard
                  status={user.paymentStatus}
                  onClick={() => toggleDropdown(user.id)}
                  showDropdown={true}
                />
                <StatusDropdown
                  currentStatus={user.paymentStatus}
                  userId={user.id}
                />
              </div>
              <div>
                {new Date(user.registrationDate).toLocaleDateString("fr-FR")}
              </div>
              <div>
                <button
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProof(user.paymentProofImage, user.name);
                  }}
                >
                  <Eye className="w-4 h-4" /> Voir Preuve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="font-semibold">Cours:</div>
              <div className="truncate">{user.course}</div>
              <div className="font-semibold">Méthode de Paiement:</div>
              <div className="truncate">
                {user.paymentMethod || "Non spécifié"}
              </div>
              <div className="font-semibold">Paiement:</div>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <StatusBadgeDashboard
                  status={user.paymentStatus}
                  onClick={() => toggleDropdown(user.id)}
                  showDropdown={true}
                />
                <StatusDropdown
                  currentStatus={user.paymentStatus}
                  userId={user.id}
                />
              </div>
              <div className="font-semibold">Inscription:</div>
              <div>
                {new Date(user.registrationDate).toLocaleDateString("fr-FR")}
              </div>
              <div className="font-semibold">Action:</div>
              <div>
                <button
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProof(user.paymentProofImage, user.name);
                  }}
                >
                  <Eye className="w-4 h-4" /> Voir Preuve
                </button>
              </div>
            </div>
          </div>
        ))}
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
          containerClassName={"flex items-center justify-center mt-6 gap-2"}
          pageClassName={
            "px-3 py-1 rounded-lg border border-gray-200 text-sm hover:bg-gray-100"
          }
          pageLinkClassName={"text-gray-700"}
          activeClassName={"bg-blue-500 text-white border-blue-500"}
          previousClassName={`px-3 py-1 rounded-lg border text-sm ${
            pagination.currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          nextClassName={`px-3 py-1 rounded-lg border text-sm ${
            pagination.currentPage === pagination.totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          breakClassName={"px-3 py-1 text-sm"}
          forcePage={pagination.currentPage - 1}
        />
      )}
    </div>
  );
};

export default UsersCourseTablePayments;
