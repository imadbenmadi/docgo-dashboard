import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";

export default function InternshipApplications() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const params = filterStatus !== "all" ? { status: filterStatus } : {};
      const response = await axios.get(
        "/Admin/OtherServices/internship-applications",
        { params },
      );
      setApplications(response.data.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load internship applications",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (applicationId) => {
    const { value: notes, isDismissed } = await Swal.fire({
      title: "Accept Application",
      input: "textarea",
      inputPlaceholder: "Add optional notes...",
      showCancelButton: true,
      confirmButtonText: "Accept",
      inputAttributes: {
        maxlength: 500,
      },
    });

    if (!isDismissed) {
      try {
        await axios.patch(
          `/Admin/OtherServices/internship-applications/${applicationId}/accept`,
          { notes: notes || "" },
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Application accepted and user notified",
        });
        await fetchApplications();
        setSelectedApp(null);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to accept application",
        });
      }
    }
  };

  const handleRejectClick = (applicationId) => {
    setRejectingId(applicationId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please provide a rejection reason",
      });
      return;
    }

    try {
      await axios.patch(
        `/Admin/OtherServices/internship-applications/${rejectingId}/reject`,
        {
          rejectionReason: rejectReason,
        },
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Application rejected and user notified",
      });
      setShowRejectModal(false);
      await fetchApplications();
      setSelectedApp(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reject application",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Internship Applications</h1>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {["all", "pending", "accepted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List and Details */}
      <div className="grid grid-cols-3 gap-6">
        {/* List */}
        <div className="col-span-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold mb-4">
            Applications ({applications.length})
          </h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : applications.length === 0 ? (
            <p className="text-gray-500">No applications found</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedApp?.id === app.id
                      ? "bg-blue-100 border-2 border-blue-500"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <p className="font-semibold">
                    {app.User.firstName} {app.User.lastName}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {app.Internship.title}
                  </p>
                  <p className="text-xs mt-1">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        app.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : app.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        {selectedApp ? (
          <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold">
                {selectedApp.User.firstName} {selectedApp.User.lastName}
              </h3>
              <p className="text-gray-600">{selectedApp.User.email}</p>
              {selectedApp.User.phoneNumber && (
                <p className="text-gray-600">{selectedApp.User.phoneNumber}</p>
              )}
            </div>

            {/* Internship Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-300">
              <h4 className="font-bold mb-2">Applied for</h4>
              <h5 className="text-lg font-semibold">
                {selectedApp.Internship.title}
              </h5>
              <p className="text-sm text-gray-600">
                {selectedApp.Internship.companyName} •{" "}
                {selectedApp.Internship.location}
              </p>
            </div>

            {/* Meta Info */}
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Submitted:{" "}
                {new Date(selectedApp.submissionDate).toLocaleDateString()}
              </p>
              <p className="text-sm">
                Status:{" "}
                <span
                  className={`px-2 py-1 rounded-full ${
                    selectedApp.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : selectedApp.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedApp.status.toUpperCase()}
                </span>
              </p>
            </div>

            {/* Application Content */}
            {selectedApp.content && (
              <div className="mb-6">
                <h4 className="font-bold mb-2">Application Letter</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedApp.content || "No content",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedApp.status === "rejected" &&
              selectedApp.rejectionReason && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-300">
                  <h4 className="font-bold text-red-700 mb-2">
                    Rejection Reason
                  </h4>
                  <p>{selectedApp.rejectionReason}</p>
                </div>
              )}

            {/* Internship Contact Info */}
            {selectedApp.Internship.contactEmail ||
            selectedApp.Internship.contactPhone ? (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-300">
                <h4 className="font-bold text-green-700 mb-2">
                  Internship Contact
                </h4>
                {selectedApp.Internship.contactEmail && (
                  <p className="text-sm">
                    Email:{" "}
                    <a
                      href={`mailto:${selectedApp.Internship.contactEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedApp.Internship.contactEmail}
                    </a>
                  </p>
                )}
                {selectedApp.Internship.contactPhone && (
                  <p className="text-sm">
                    Phone:{" "}
                    <a
                      href={`tel:${selectedApp.Internship.contactPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedApp.Internship.contactPhone}
                    </a>
                  </p>
                )}
              </div>
            ) : null}

            {/* Actions */}
            {selectedApp.status === "pending" && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleRejectClick(selectedApp.id)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAccept(selectedApp.id)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="col-span-2 bg-gray-50 rounded-lg p-6 flex items-center justify-center">
            <p className="text-gray-500">
              Select an application to view details
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Reject Application</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              maxLength={500}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-sm text-gray-500 mb-4">
              {rejectReason.length}/500 characters
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
