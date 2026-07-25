import { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-600",
  deleted: "bg-gray-200 text-gray-600",
};

export default function ServicePayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null); // includes imageBase64
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [serviceType, setServiceType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceType, filterStatus]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (serviceType !== "all") params.serviceType = serviceType;
      if (filterStatus !== "all") params.status = filterStatus;
      const res = await apiClient.get("/Admin/OtherServices/service-payments", {
        params,
      });
      setPayments(res.data.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to load payments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectPayment = async (payment) => {
    setSelected(payment);
    setDetail(null);
    try {
      setLoadingDetail(true);
      const res = await apiClient.get(
        `/Admin/OtherServices/service-payments/${payment.id}`,
      );
      setDetail(res.data.data || null);
    } catch (error) {
      // Non-fatal: keep the row data, just no proof image
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (paymentId) => {
    const { value: notes, isDismissed } = await Swal.fire({
      title: "Approve Payment",
      text: "This will approve the payment and accept the linked application.",
      input: "textarea",
      inputPlaceholder: "Optional notes...",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#16a34a",
      inputAttributes: { maxlength: 500 },
    });
    if (isDismissed) return;
    try {
      await apiClient.patch(
        `/Admin/OtherServices/service-payments/${paymentId}/approve`,
        { notes: notes || "" },
      );
      await Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Payment approved and user notified",
      });
      setSelected(null);
      setDetail(null);
      await fetchPayments();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to approve payment",
      });
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please provide a rejection reason",
      });
      return;
    }
    try {
      await apiClient.patch(
        `/Admin/OtherServices/service-payments/${selected.id}/reject`,
        { rejectionReason: rejectReason },
      );
      setShowRejectModal(false);
      setRejectReason("");
      await Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Payment rejected and user notified",
      });
      setSelected(null);
      setDetail(null);
      await fetchPayments();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to reject payment",
      });
    }
  };

  const serviceLabel = (p) =>
    p.serviceType === "cv"
      ? "CV Service"
      : `Internship${p.Internship?.title ? ` — ${p.Internship.title}` : ""}`;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-1">Other Services Payments</h1>
      <p className="text-gray-500 text-sm mb-6">
        Review CCP payments for CV creation and internship (Stage) applications.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {["all", "cv", "internship"].map((s) => (
            <button
              key={s}
              onClick={() => setServiceType(s)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                serviceType === s
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {s === "all" ? "All services" : s === "cv" ? "CV" : "Internship"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === s
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* List */}
        <div className="col-span-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold mb-4">
            Payments ({payments.length})
          </h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : payments.length === 0 ? (
            <p className="text-gray-500">No payments found</p>
          ) : (
            <div className="space-y-2 max-h-[32rem] overflow-y-auto">
              {payments.map((p) => (
                <div
                  key={p.id}
                  onClick={() => selectPayment(p)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selected?.id === p.id
                      ? "bg-indigo-100 border-2 border-indigo-500"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <p className="font-semibold">
                    {p.User?.firstName} {p.User?.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{serviceLabel(p)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold">
                      {p.amount} {p.currency}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        STATUS_STYLES[p.status] || "bg-gray-200"
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        {selected ? (
          <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold">
                {selected.User?.firstName} {selected.User?.lastName}
              </h3>
              <p className="text-gray-600">{selected.User?.email}</p>
              {selected.User?.phoneNumber && (
                <p className="text-gray-600">{selected.User.phoneNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-gray-500">Service</span>
                <p className="font-semibold">{serviceLabel(selected)}</p>
              </div>
              <div>
                <span className="text-gray-500">Amount</span>
                <p className="font-semibold">
                  {selected.amount} {selected.currency}
                </p>
              </div>
              <div>
                <span className="text-gray-500">CCP number</span>
                <p className="font-semibold">{selected.CCP_number}</p>
              </div>
              <div>
                <span className="text-gray-500">Phone</span>
                <p className="font-semibold">
                  {selected.phoneNumber || "—"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Submitted</span>
                <p className="font-semibold">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      STATUS_STYLES[selected.status] || "bg-gray-200"
                    }`}
                  >
                    {selected.status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            {/* Proof image */}
            <div className="mb-6">
              <h4 className="font-bold mb-2">Payment proof</h4>
              {loadingDetail ? (
                <p className="text-gray-500">Loading proof…</p>
              ) : detail?.imageBase64 ? (
                <a
                  href={detail.imageBase64}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={detail.imageBase64}
                    alt="Payment proof"
                    className="max-h-72 rounded-lg border border-gray-200"
                  />
                </a>
              ) : (
                <p className="text-gray-500 italic">No proof image available</p>
              )}
            </div>

            {selected.status === "rejected" && selected.rejectionReason && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-300">
                <h4 className="font-bold text-red-700 mb-1">
                  Rejection reason
                </h4>
                <p>{selected.rejectionReason}</p>
              </div>
            )}

            {/* Actions */}
            {["pending", "cancelled"].includes(selected.status) && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setRejectReason("");
                    setShowRejectModal(true);
                  }}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selected.id)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="col-span-2 bg-gray-50 rounded-lg p-6 flex items-center justify-center">
            <p className="text-gray-500">Select a payment to view details</p>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Reject Payment</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              maxLength={500}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
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
