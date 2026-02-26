import {
    Award,
    RefreshCw,
    Ban,
    RotateCcw,
    CheckCircle,
    XCircle,
    User,
    BookOpen,
    Calendar,
    QrCode,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import AdminCertificatesAPI from "../../API/AdminCertificates";

const AdminCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCertificates: 0,
    });
    const [filters, setFilters] = useState({ revoked: "", page: 1, limit: 20 });
    const [actionLoading, setActionLoading] = useState(null);

    const Frontend_URL =
        import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            const res = await AdminCertificatesAPI.getAll(filters);
            setCertificates(res.data.certificates || []);
            setPagination(res.data.pagination || {});
        } catch {
            toast.error("Failed to load certificates");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const handleRevoke = async (cert) => {
        const { value: reason } = await Swal.fire({
            title: "Revoke Certificate",
            input: "text",
            inputLabel: "Reason for revocation",
            inputPlaceholder: "Enter reason...",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Revoke",
        });
        if (reason === undefined) return; // cancelled
        setActionLoading(cert.certificateId);
        try {
            await AdminCertificatesAPI.revoke(cert.certificateId, reason);
            toast.success("Certificate revoked");
            fetchCertificates();
        } catch {
            toast.error("Failed to revoke certificate");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestore = async (cert) => {
        const confirm = await Swal.fire({
            title: "Restore Certificate?",
            text: "This will re-activate the certificate.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#22c55e",
            confirmButtonText: "Restore",
        });
        if (!confirm.isConfirmed) return;
        setActionLoading(cert.certificateId);
        try {
            await AdminCertificatesAPI.restore(cert.certificateId);
            toast.success("Certificate restored");
            fetchCertificates();
        } catch {
            toast.error("Failed to restore certificate");
        } finally {
            setActionLoading(null);
        }
    };

    const copyVerifyLink = (cert) => {
        const url =
            cert.verificationUrl ||
            `${Frontend_URL}/verify/certificate/${cert.certificateId}`;
        navigator.clipboard.writeText(url);
        toast.success("Verification link copied!");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Award className="w-7 h-7 text-purple-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Certificates
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage issued course certificates
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchCertificates}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
                <select
                    value={filters.revoked}
                    onChange={(e) =>
                        setFilters((f) => ({
                            ...f,
                            revoked: e.target.value,
                            page: 1,
                        }))
                    }
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                    <option value="">All certificates</option>
                    <option value="false">Active only</option>
                    <option value="true">Revoked only</option>
                </select>
                <span className="text-sm text-gray-400 ml-auto">
                    {pagination.totalCertificates} total
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : certificates.length === 0 ? (
                    <div className="text-center p-12 text-gray-400">
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No certificates found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                                        Student
                                    </th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                                        Course
                                    </th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                                        Issued
                                    </th>
                                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                                        Status
                                    </th>
                                    <th className="text-right px-4 py-3 text-gray-500 font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {certificates.map((cert) => {
                                    const user = cert.certUser || {};
                                    const course = cert.certCourse || {};
                                    const meta = cert.metadata || {};
                                    const isLoading =
                                        actionLoading === cert.certificateId;
                                    return (
                                        <tr
                                            key={cert.certificateId}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                                        <User className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {user.FirstName}{" "}
                                                            {user.LastName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {user.Email}
                                                        </p>
                                                        {meta.studentName &&
                                                            meta.studentName !==
                                                                `${user.FirstName} ${user.LastName}` && (
                                                                <p className="text-xs text-purple-500 italic">
                                                                    as &quot;
                                                                    {
                                                                        meta.studentName
                                                                    }
                                                                    &quot;
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {course.Title}
                                                        </p>
                                                        {course.Category && (
                                                            <p className="text-xs text-gray-400">
                                                                {
                                                                    course.Category
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {new Date(
                                                        cert.issueDate,
                                                    ).toLocaleDateString(
                                                        "en-GB",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </div>
                                                {meta.averageQuizScore !=
                                                    null && (
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        Score:{" "}
                                                        {Math.round(
                                                            meta.averageQuizScore,
                                                        )}
                                                        %
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {cert.revoked ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        <XCircle className="w-3 h-3" />{" "}
                                                        Revoked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <CheckCircle className="w-3 h-3" />{" "}
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            copyVerifyLink(cert)
                                                        }
                                                        title="Copy verification link"
                                                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                    </button>
                                                    {cert.revoked ? (
                                                        <button
                                                            onClick={() =>
                                                                handleRestore(
                                                                    cert,
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                            title="Restore certificate"
                                                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleRevoke(
                                                                    cert,
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                            title="Revoke certificate"
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        disabled={!pagination.hasPrevPage}
                        onClick={() =>
                            setFilters((f) => ({ ...f, page: f.page - 1 }))
                        }
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={!pagination.hasNextPage}
                        onClick={() =>
                            setFilters((f) => ({ ...f, page: f.page + 1 }))
                        }
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminCertificates;
