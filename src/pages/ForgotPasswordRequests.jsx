import {
    CheckCircle,
    Clock,
    Eye,
    EyeOff,
    KeyRound,
    Mail,
    Phone,
    RefreshCw,
    Search,
    Trash2,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "../utils/axios.jsx";

const API_BASE = "/Admin";

const statusBadge = (status) => {
    if (status === "resolved")
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle size={11} />
                Résolu
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock size={11} />
            En attente
        </span>
    );
};

const ForgotPasswordRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [resolving, setResolving] = useState(null);
    // Track which rows have their password visible
    const [visiblePasswords, setVisiblePasswords] = useState({});

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 50 });
            if (filter !== "all") params.set("status", filter);
            const res = await axios.get(
                `${API_BASE}/forgot-password-requests?${params}`,
            );
            setRequests(res.data?.requests || []);
            setTotal(res.data?.total || 0);
        } catch {
            toast.error("Erreur lors du chargement des demandes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line
    }, [filter, page]);

    const handleResolve = async (request) => {
        const { value: note, isConfirmed } = await Swal.fire({
            title: "Marquer comme résolu",
            html: `<p class="text-sm text-gray-600 mb-3">Ajoutez une note optionnelle (ex: "contacté par email le 02/03/2026").</p>
                   <textarea id="swal-note" class="swal2-textarea w-full" placeholder="Note admin…"></textarea>`,
            showCancelButton: true,
            confirmButtonText: "Résoudre",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#16a34a",
            preConfirm: () => document.getElementById("swal-note")?.value || "",
        });
        if (!isConfirmed) return;

        setResolving(request.id);
        try {
            await axios.patch(
                `${API_BASE}/forgot-password-requests/${request.id}/resolve`,
                { adminNote: note || "" },
            );
            toast.success("Demande marquée comme résolue.");
            fetchRequests();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Erreur lors de la résolution.",
            );
        } finally {
            setResolving(null);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Supprimer la demande ?",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Supprimer",
            cancelButtonText: "Annuler",
        });
        if (!result.isConfirmed) return;
        try {
            await axios.delete(`${API_BASE}/forgot-password-requests/${id}`);
            toast.success("Demande supprimée.");
            fetchRequests();
        } catch {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const togglePassword = (id) =>
        setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));

    const filtered = requests.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            r.email?.toLowerCase().includes(s) ||
            r.firstName?.toLowerCase().includes(s) ||
            r.lastName?.toLowerCase().includes(s)
        );
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <KeyRound className="h-5 w-5 text-amber-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Demandes mot de passe oublié
                    </h1>
                </div>
                <p className="text-sm text-gray-500 ml-11">
                    Consultez le mot de passe actuel de l&apos;utilisateur et
                    contactez-le manuellement.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Rechercher par email, nom…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {[
                        { key: "all", label: "Toutes" },
                        { key: "pending", label: "En attente" },
                        { key: "resolved", label: "Résolues" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => {
                                setFilter(key);
                                setPage(1);
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                                filter === key
                                    ? "bg-white text-amber-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-2"
                >
                    <RefreshCw size={13} />
                    Actualiser
                </button>

                <span className="text-xs text-gray-400 ml-auto">
                    {total} demande{total !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center p-12">
                        <KeyRound className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">
                            Aucune demande trouvée.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Utilisateur
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Mot de passe actuel
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((r) => (
                                    <tr
                                        key={r.id}
                                        className={`hover:bg-gray-50 transition ${
                                            r.status === "pending"
                                                ? "bg-amber-50/30"
                                                : ""
                                        }`}
                                    >
                                        {/* User info */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <User
                                                        size={14}
                                                        className="text-gray-500"
                                                    />
                                                </div>
                                                <div>
                                                    {r.firstName ||
                                                    r.lastName ? (
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {r.firstName}{" "}
                                                            {r.lastName}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">
                                                            Compte introuvable
                                                        </p>
                                                    )}
                                                    {r.userId && (
                                                        <p className="text-xs text-gray-400">
                                                            ID #{r.userId}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                                    <Mail
                                                        size={13}
                                                        className="text-gray-400 flex-shrink-0"
                                                    />
                                                    <a
                                                        href={`mailto:${r.email}`}
                                                        className="hover:underline text-blue-600"
                                                    >
                                                        {r.email}
                                                    </a>
                                                </div>
                                                {r.phoneNumber && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Phone
                                                            size={12}
                                                            className="text-gray-400"
                                                        />
                                                        {r.phoneNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Password */}
                                        <td className="px-4 py-3">
                                            {r.passwordSnapshot ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`text-sm font-mono ${
                                                            visiblePasswords[
                                                                r.id
                                                            ]
                                                                ? "text-gray-900"
                                                                : "text-gray-400 select-none"
                                                        }`}
                                                    >
                                                        {visiblePasswords[r.id]
                                                            ? r.passwordSnapshot
                                                            : "••••••••"}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            togglePassword(r.id)
                                                        }
                                                        className="text-gray-400 hover:text-gray-600"
                                                        title={
                                                            visiblePasswords[
                                                                r.id
                                                            ]
                                                                ? "Masquer"
                                                                : "Afficher"
                                                        }
                                                    >
                                                        {visiblePasswords[
                                                            r.id
                                                        ] ? (
                                                            <EyeOff size={14} />
                                                        ) : (
                                                            <Eye size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">
                                                    Email non enregistré
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                {statusBadge(r.status)}
                                                {r.adminNote && (
                                                    <p
                                                        className="text-xs text-gray-400 max-w-[160px] truncate"
                                                        title={r.adminNote}
                                                    >
                                                        📝 {r.adminNote}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(
                                                r.createdAt,
                                            ).toLocaleDateString("fr-FR", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {r.status === "pending" && (
                                                    <button
                                                        onClick={() =>
                                                            handleResolve(r)
                                                        }
                                                        disabled={
                                                            resolving === r.id
                                                        }
                                                        className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                                                    >
                                                        <CheckCircle
                                                            size={12}
                                                        />
                                                        Résoudre
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleDelete(r.id)
                                                    }
                                                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition"
                                                >
                                                    <Trash2 size={12} />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordRequests;
