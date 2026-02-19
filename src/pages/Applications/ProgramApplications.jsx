import { useEffect, useState } from "react";
import {
    Check,
    X,
    Eye,
    Search,
    User,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    ImageIcon,
    RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import ApplicationsAPI from "../../API/Applications";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    approved: "bg-green-100 text-green-800 border border-green-200",
    rejected: "bg-red-100 text-red-800 border border-red-200",
    completed: "bg-blue-100 text-blue-800 border border-blue-200",
    opened: "bg-purple-100 text-purple-800 border border-purple-200",
};

const PAYMENT_TYPE_LABELS = {
    free: "Gratuit",
    ccp: "CCP / Baridi",
    paypal: "PayPal",
};

const getImageSrc = (payment) => {
    if (!payment) return null;
    if (payment.imageData) {
        const mimeType = payment.imageMimeType || "image/jpeg";
        const base64 =
            typeof payment.imageData === "string"
                ? payment.imageData
                : btoa(
                      String.fromCharCode(...new Uint8Array(payment.imageData)),
                  );
        return `data:${mimeType};base64,${base64}`;
    }
    if (payment.screenShot) return `${API_URL}${payment.screenShot}`;
    return null;
};

const ProgramApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState("free"); // "free" | "paid"

    const [filters, setFilters] = useState({
        status: "",
        page: 1,
        limit: 20,
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1,
    });

    // Related CCP payments (for paid applications)
    const [ccpPayments, setCcpPayments] = useState([]);

    // Modals
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageModalSrc, setImageModalSrc] = useState(null);

    const [search, setSearch] = useState("");

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await ApplicationsAPI.getProgramApplications({
                status: filters.status || undefined,
                page: filters.page,
                limit: filters.limit,
            });
            if (res.success) {
                setApplications(res.data.applications || []);
                setPagination(
                    res.data.pagination || { total: 0, page: 1, totalPages: 1 },
                );
            } else {
                toast.error(res.message || "Erreur lors du chargement");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCCPPayments = async () => {
        try {
            const res = await ApplicationsAPI.getAllCCPPayments({
                itemType: "program",
                limit: 200,
            });
            if (res.success) {
                setCcpPayments(res.data.payments || []);
            }
        } catch (err) {
            console.error("CCP fetch:", err);
        }
    };

    useEffect(() => {
        fetchApplications();
        fetchCCPPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.page]);

    const getPaymentForApplication = (app) => {
        if (!app.paymentId) {
            // Try matching by userId + programId in ccp
            return (
                ccpPayments.find(
                    (p) =>
                        p.userId === app.UserId &&
                        p.itemId === app.ProgramId &&
                        p.itemType === "program",
                ) || null
            );
        }
        return ccpPayments.find((p) => p.id === app.paymentId) || null;
    };

    const freeApplications = applications.filter(
        (a) => a.paymentType === "free",
    );
    const paidApplications = applications.filter(
        (a) => a.paymentType !== "free",
    );

    const filteredList = (
        activeTab === "free" ? freeApplications : paidApplications
    ).filter((a) => {
        if (!search) return true;
        const user = a.User;
        const query = search.toLowerCase();
        return (
            user?.firstName?.toLowerCase().includes(query) ||
            user?.lastName?.toLowerCase().includes(query) ||
            user?.email?.toLowerCase().includes(query) ||
            a.Program?.title?.toLowerCase().includes(query)
        );
    });

    const handleApproveFree = async (app) => {
        const result = await Swal.fire({
            icon: "question",
            title: "Approuver la candidature ?",
            html: `<p>Approuver la candidature de <b>${app.User?.firstName} ${app.User?.lastName}</b> pour <b>${app.Program?.title}</b> ?</p>`,
            showCancelButton: true,
            confirmButtonText: "Oui, approuver",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#22c55e",
        });
        if (!result.isConfirmed) return;

        setProcessing(true);
        const res = await ApplicationsAPI.approveProgramApplication(app.id, {
            notes: "Approuvé par l'administrateur",
        });
        setProcessing(false);

        if (res.success) {
            toast.success("Candidature approuvée !");
            fetchApplications();
        } else {
            Swal.fire("Erreur", res.message, "error");
        }
    };

    const handleReject = async (app) => {
        const { value: notes, isConfirmed } = await Swal.fire({
            icon: "warning",
            title: "Rejeter la candidature ?",
            html: `<p>Rejeter la candidature de <b>${app.User?.firstName} ${app.User?.lastName}</b> ?</p>`,
            input: "textarea",
            inputPlaceholder: "Motif du rejet (optionnel)...",
            showCancelButton: true,
            confirmButtonText: "Rejeter",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#ef4444",
        });
        if (!isConfirmed) return;

        setProcessing(true);
        const res = await ApplicationsAPI.rejectProgramApplication(app.id, {
            notes,
        });
        setProcessing(false);

        if (res.success) {
            toast.success("Candidature rejetée");
            fetchApplications();
        } else {
            Swal.fire("Erreur", res.message, "error");
        }
    };

    const handleApprovePaidPayment = async (app) => {
        const payment = getPaymentForApplication(app);
        if (!payment) {
            Swal.fire(
                "Introuvable",
                "Aucun paiement CCP trouvé pour cette candidature",
                "warning",
            );
            return;
        }

        const result = await Swal.fire({
            icon: "question",
            title: "Approuver le paiement ?",
            html: `<p>Approuver le paiement CCP de <b>${app.User?.firstName} ${app.User?.lastName}</b> et inscrire au programme <b>${app.Program?.title}</b> ?</p>`,
            showCancelButton: true,
            confirmButtonText: "Approuver",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#22c55e",
        });
        if (!result.isConfirmed) return;

        setProcessing(true);
        const res = await ApplicationsAPI.approveProgramPayment(payment.id);
        setProcessing(false);

        if (res.success) {
            toast.success("Paiement approuvé — utilisateur inscrit !");
            fetchApplications();
            fetchCCPPayments();
        } else {
            Swal.fire("Erreur", res.message, "error");
        }
    };

    const handleRejectPaidPayment = async (app) => {
        const payment = getPaymentForApplication(app);
        if (!payment) {
            Swal.fire(
                "Introuvable",
                "Aucun paiement CCP trouvé pour cette candidature",
                "warning",
            );
            return;
        }

        const { value: reason, isConfirmed } = await Swal.fire({
            icon: "warning",
            title: "Rejeter le paiement ?",
            input: "textarea",
            inputPlaceholder: "Motif du rejet (optionnel)...",
            showCancelButton: true,
            confirmButtonText: "Rejeter",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#ef4444",
        });
        if (!isConfirmed) return;

        setProcessing(true);
        const res = await ApplicationsAPI.rejectProgramPayment(
            payment.id,
            reason,
        );
        setProcessing(false);

        if (res.success) {
            toast.success("Paiement rejeté");
            fetchApplications();
            fetchCCPPayments();
        } else {
            Swal.fire("Erreur", res.message, "error");
        }
    };

    const openImageModal = (src) => {
        setImageModalSrc(src);
        setShowImageModal(true);
    };

    const openDetailsModal = (app) => {
        setSelectedApplication(app);
        setShowDetailsModal(true);
    };

    return (
        <div className="p-6 space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Candidatures aux Programmes
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gérez les candidatures gratuites et payantes
                    </p>
                </div>
                <button
                    onClick={() => {
                        fetchApplications();
                        fetchCCPPayments();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Rafraîchir
                </button>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total",
                        value: applications.length,
                        color: "bg-blue-50 text-blue-700",
                    },
                    {
                        label: "En attente",
                        value: applications.filter(
                            (a) => a.status === "pending",
                        ).length,
                        color: "bg-yellow-50 text-yellow-700",
                    },
                    {
                        label: "Approuvées",
                        value: applications.filter(
                            (a) => a.status === "approved",
                        ).length,
                        color: "bg-green-50 text-green-700",
                    },
                    {
                        label: "Rejetées",
                        value: applications.filter(
                            (a) => a.status === "rejected",
                        ).length,
                        color: "bg-red-50 text-red-700",
                    },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-sm">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={filters.status}
                    onChange={(e) =>
                        setFilters((f) => ({
                            ...f,
                            status: e.target.value,
                            page: 1,
                        }))
                    }
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Rejeté</option>
                    <option value="completed">Complété</option>
                </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {[
                    {
                        key: "free",
                        label: `Gratuites (${freeApplications.length})`,
                    },
                    {
                        key: "paid",
                        label: `Payantes (${paidApplications.length})`,
                    },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === tab.key
                                ? "bg-white text-blue-600 shadow"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Chargement...
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                        <p>Aucune candidature trouvée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Candidat
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Programme
                                    </th>
                                    {activeTab === "free" && (
                                        <>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">
                                                Pays
                                            </th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">
                                                Domaine
                                            </th>
                                        </>
                                    )}
                                    {activeTab === "paid" && (
                                        <>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">
                                                Paiement
                                            </th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">
                                                Reçu
                                            </th>
                                        </>
                                    )}
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Statut
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Date
                                    </th>
                                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredList.map((app) => {
                                    const payment =
                                        activeTab === "paid"
                                            ? getPaymentForApplication(app)
                                            : null;
                                    const imgSrc = payment
                                        ? getImageSrc(payment)
                                        : null;
                                    return (
                                        <motion.tr
                                            key={app.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            {/* Candidate */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                                        {app.User?.firstName?.[0]?.toUpperCase() ||
                                                            "?"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                app.User
                                                                    ?.firstName
                                                            }{" "}
                                                            {app.User?.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {app.User?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Program */}
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900 max-w-[160px] truncate">
                                                    {app.Program?.title ||
                                                        `Programme #${app.ProgramId}`}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {PAYMENT_TYPE_LABELS[
                                                        app.paymentType
                                                    ] || app.paymentType}
                                                </p>
                                            </td>

                                            {/* Free-only columns */}
                                            {activeTab === "free" && (
                                                <>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {app.User?.country ||
                                                            "—"}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {app.User?.studyField ||
                                                            "—"}
                                                    </td>
                                                </>
                                            )}

                                            {/* Paid-only columns */}
                                            {activeTab === "paid" && (
                                                <>
                                                    <td className="px-4 py-3">
                                                        {payment ? (
                                                            <div>
                                                                <p className="text-xs font-mono text-gray-600">
                                                                    N°:{" "}
                                                                    {payment.CCP_number ||
                                                                        app.CCP_number ||
                                                                        "—"}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {payment.amount
                                                                        ? `${payment.amount} DZD`
                                                                        : app.Price
                                                                          ? `${app.Price} DZD`
                                                                          : "—"}
                                                                </p>
                                                                <span
                                                                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                                                                        payment.status ===
                                                                        "approved"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : payment.status ===
                                                                                "rejected"
                                                                              ? "bg-red-100 text-red-700"
                                                                              : "bg-yellow-100 text-yellow-700"
                                                                    }`}
                                                                >
                                                                    {
                                                                        payment.status
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                Paiement non lié
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {imgSrc ? (
                                                            <button
                                                                onClick={() =>
                                                                    openImageModal(
                                                                        imgSrc,
                                                                    )
                                                                }
                                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                            >
                                                                <ImageIcon className="w-3.5 h-3.5" />
                                                                Voir reçu
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        STATUS_COLORS[
                                                            app.status
                                                        ] ||
                                                        "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {app.status}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {app.createdAt
                                                    ? new Date(
                                                          app.createdAt,
                                                      ).toLocaleDateString(
                                                          "fr-FR",
                                                      )
                                                    : "—"}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={() =>
                                                            openDetailsModal(
                                                                app,
                                                            )
                                                        }
                                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                                                        title="Détails"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {app.status ===
                                                        "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    activeTab ===
                                                                    "free"
                                                                        ? handleApproveFree(
                                                                              app,
                                                                          )
                                                                        : handleApprovePaidPayment(
                                                                              app,
                                                                          )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                                                title="Approuver"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    activeTab ===
                                                                    "free"
                                                                        ? handleReject(
                                                                              app,
                                                                          )
                                                                        : handleRejectPaidPayment(
                                                                              app,
                                                                          )
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                                title="Rejeter"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Total: {pagination.total} candidatures
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={filters.page <= 1}
                            onClick={() =>
                                setFilters((f) => ({ ...f, page: f.page - 1 }))
                            }
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700">
                            {filters.page} / {pagination.totalPages}
                        </span>
                        <button
                            disabled={filters.page >= pagination.totalPages}
                            onClick={() =>
                                setFilters((f) => ({ ...f, page: f.page + 1 }))
                            }
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedApplication && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    Détails de la candidature
                                </h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* User */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                        <User className="w-4 h-4" /> Candidat
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Nom</p>
                                            <p className="font-medium">
                                                {
                                                    selectedApplication.User
                                                        ?.firstName
                                                }{" "}
                                                {
                                                    selectedApplication.User
                                                        ?.lastName
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Email
                                            </p>
                                            <p className="font-medium text-xs break-all">
                                                {
                                                    selectedApplication.User
                                                        ?.email
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Pays
                                            </p>
                                            <p className="font-medium">
                                                {selectedApplication.User
                                                    ?.country || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Domaine d&apos;&eacute;tudes
                                            </p>
                                            <p className="font-medium">
                                                {selectedApplication.User
                                                    ?.studyField || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Spécialité
                                            </p>
                                            <p className="font-medium">
                                                {selectedApplication.User
                                                    ?.studyDomain || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">
                                                Téléphone
                                            </p>
                                            <p className="font-medium">
                                                {selectedApplication.User
                                                    ?.phoneNumber || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Program */}
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" />{" "}
                                        Programme
                                    </h4>
                                    <p className="font-medium">
                                        {selectedApplication.Program?.title}
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        Type:{" "}
                                        {PAYMENT_TYPE_LABELS[
                                            selectedApplication.paymentType
                                        ] || selectedApplication.paymentType}
                                    </p>
                                </div>

                                {/* Application Info */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Statut</p>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                STATUS_COLORS[
                                                    selectedApplication.status
                                                ] || "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {selectedApplication.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">
                                            Date de candidature
                                        </p>
                                        <p className="font-medium">
                                            {selectedApplication.createdAt
                                                ? new Date(
                                                      selectedApplication.createdAt,
                                                  ).toLocaleDateString("fr-FR")
                                                : "—"}
                                        </p>
                                    </div>
                                    {selectedApplication.notes && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">
                                                Notes
                                            </p>
                                            <p className="font-medium">
                                                {selectedApplication.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Paid-related payment info */}
                                {selectedApplication.paymentType !== "free" &&
                                    (() => {
                                        const payment =
                                            getPaymentForApplication(
                                                selectedApplication,
                                            );
                                        const imgSrc = payment
                                            ? getImageSrc(payment)
                                            : null;
                                        return payment ? (
                                            <div className="bg-yellow-50 rounded-xl p-4">
                                                <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                                                    <CreditCard className="w-4 h-4" />{" "}
                                                    Paiement CCP
                                                </h4>
                                                <div className="text-sm space-y-1">
                                                    <p>
                                                        N° CCP :{" "}
                                                        <span className="font-mono">
                                                            {payment.CCP_number ||
                                                                "—"}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Montant :{" "}
                                                        <span className="font-medium">
                                                            {payment.amount} DZD
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Statut paiement :{" "}
                                                        <span className="font-medium">
                                                            {payment.status}
                                                        </span>
                                                    </p>
                                                </div>
                                                {imgSrc && (
                                                    <button
                                                        onClick={() =>
                                                            openImageModal(
                                                                imgSrc,
                                                            )
                                                        }
                                                        className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                    >
                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                        Voir le reçu de paiement
                                                    </button>
                                                )}
                                            </div>
                                        ) : null;
                                    })()}
                            </div>

                            {/* Actions in modal */}
                            {selectedApplication.status === "pending" && (
                                <div className="flex gap-3 mt-5">
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            selectedApplication.paymentType ===
                                            "free"
                                                ? handleApproveFree(
                                                      selectedApplication,
                                                  )
                                                : handleApprovePaidPayment(
                                                      selectedApplication,
                                                  );
                                        }}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium transition"
                                    >
                                        Approuver
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            selectedApplication.paymentType ===
                                            "free"
                                                ? handleReject(
                                                      selectedApplication,
                                                  )
                                                : handleRejectPaidPayment(
                                                      selectedApplication,
                                                  );
                                        }}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-medium transition"
                                    >
                                        Rejeter
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Modal */}
            <AnimatePresence>
                {showImageModal && imageModalSrc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="relative max-w-2xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="absolute -top-10 right-0 text-white hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img
                                src={imageModalSrc}
                                alt="Reçu de paiement"
                                className="w-full rounded-xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProgramApplications;
