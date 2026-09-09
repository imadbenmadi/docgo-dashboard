import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    FileImage,
    RefreshCw,
    Filter,
} from "lucide-react";
import AdminPaymentAPI from "../../API/AdminPaymentManagement";
import apiClient from "../../utils/apiClient";

/**
 * CCP screenshot review for CV services and paid internships. Approving or
 * rejecting unlocks or blocks the linked application.
 *
 * The listing omits image bytes; screenshots are fetched one at a time from
 * the admin-only endpoint.
 */

const STATUS_STYLES = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-700",
};

const TYPE_LABEL = { cv: "CV Service", internship: "Internship" };

export default function ServicePayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [filters, setFilters] = useState({ itemType: "", status: "pending" });

    const load = useCallback(async () => {
        setLoading(true);
        const res = await AdminPaymentAPI.getOtherServicePayments(filters);
        if (res.success) {
            setPayments(res.data || []);
        } else {
            toast.error(res.message || "Could not load payments");
            setPayments([]);
        }
        setLoading(false);
    }, [filters]);

    useEffect(() => {
        load();
    }, [load]);

    // Fetch the receipt through the API client rather than pointing <img src>
    // straight at the endpoint. The dashboard and the API sit on different
    // origins, so a plain <img> would not carry the admin session cookie —
    // the same third-party-cookie trap that used to break the PDF viewer.
    // apiClient sends credentials, and the bytes become a blob URL.
    useEffect(() => {
        if (!preview) {
            setPreviewUrl(null);
            return;
        }

        let revoked = null;
        let cancelled = false;

        apiClient
            .get(`/Admin/Payments/${preview.id}/screenshot`, {
                responseType: "blob",
            })
            .then((res) => {
                if (cancelled) return;
                revoked = URL.createObjectURL(res.data);
                setPreviewUrl(revoked);
            })
            .catch(() => {
                if (!cancelled) toast.error("Could not load the receipt");
            });

        return () => {
            cancelled = true;
            if (revoked) URL.revokeObjectURL(revoked);
        };
    }, [preview]);

    const decide = async (payment, approve) => {
        let reason = "";

        if (!approve) {
            reason = window.prompt("Reason for rejecting this payment?") || "";
            if (!reason.trim()) return; // the API requires one
        }

        setBusyId(payment.id);

        const isCV = payment.itemType === "cv";
        const call = approve
            ? isCV
                ? AdminPaymentAPI.approveCVPayment
                : AdminPaymentAPI.approveInternshipPayment
            : isCV
              ? AdminPaymentAPI.rejectCVPayment
              : AdminPaymentAPI.rejectInternshipPayment;

        const res = await call(payment.id, approve ? "" : reason);

        if (res.success) {
            toast.success(
                approve ? "Payment approved — service unlocked" : "Payment rejected",
            );
            await load();
        } else {
            toast.error(res.message || "Could not update payment");
        }

        setBusyId(null);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Service Payments
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        CV service and paid internship receipts awaiting review.
                        Approving one unlocks the application for the student.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={filters.itemType}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, itemType: e.target.value }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="">All services</option>
                        <option value="cv">CV service</option>
                        <option value="internship">Internships</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, status: e.target.value }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="">All statuses</option>
                    </select>

                    <button
                        onClick={load}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading payments…
                </div>
            ) : payments.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
                    No payments match these filters.
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    "Service",
                                    "User",
                                    "Amount",
                                    "CCP number",
                                    "Status",
                                    "Receipt",
                                    "Actions",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {TYPE_LABEL[p.itemType] || p.itemType}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">
                                            {p.User
                                                ? `${p.User.firstName || ""} ${p.User.lastName || ""}`.trim()
                                                : "—"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {p.User?.email}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {p.amount} {p.currency}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {p.CCP_number}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                STATUS_STYLES[p.status] ||
                                                "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setPreview(p)}
                                            className="flex items-center gap-1 text-blue-600 hover:underline"
                                        >
                                            <FileImage className="w-4 h-4" />
                                            View
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.status === "approved" ? (
                                            <span className="text-xs text-gray-400">
                                                Already approved
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    disabled={busyId === p.id}
                                                    onClick={() => decide(p, true)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {busyId === p.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={busyId === p.id}
                                                    onClick={() => decide(p, false)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {preview && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"
                    onClick={() => setPreview(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    Payment receipt
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {preview.User?.email} ·{" "}
                                    {TYPE_LABEL[preview.itemType]} ·{" "}
                                    {preview.amount} {preview.currency}
                                </p>
                            </div>
                            <button
                                onClick={() => setPreview(null)}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-4">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Payment receipt"
                                    className="max-w-full mx-auto rounded-lg border border-gray-200"
                                />
                            ) : (
                                <div className="flex items-center justify-center py-16 text-gray-500">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Loading receipt…
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
