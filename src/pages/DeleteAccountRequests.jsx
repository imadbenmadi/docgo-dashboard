import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "../utils/axios.jsx";

const API_BASE = "/Admin";

const statusBadge = (status) => {
  const map = {
    pending: {
      cls: "bg-amber-100 text-amber-800",
      icon: <Clock size={11} />,
      label: "En attente",
    },
    approved: {
      cls: "bg-green-100 text-green-800",
      icon: <CheckCircle size={11} />,
      label: "Approuvé",
    },
    rejected: {
      cls: "bg-red-100 text-red-800",
      icon: <XCircle size={11} />,
      label: "Rejeté",
    },
  };
  const { cls, icon, label } = map[status] || map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {icon} {label}
    </span>
  );
};

const DeleteAccountRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState(null);
  // Which request has its snapshot expanded
  const [expanded, setExpanded] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (filter !== "all") params.set("status", filter);
      const res = await axios.get(
        `${API_BASE}/delete-account-requests?${params}`,
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
  }, [filter]);

  const handleApprove = async (request) => {
    const snap = request.userSnapshot?.user || {};
    const coursesCount = request.userSnapshot?.courseEnrollments?.length || 0;
    const programsCount = request.userSnapshot?.programEnrollments?.length || 0;
    const totalPaid = request.userSnapshot?.totalPaid || 0;

    const result = await Swal.fire({
      icon: "warning",
      title: "Approuver la suppression ?",
      html: `
                <div style="text-align:left;font-size:0.85rem;line-height:1.6">
                    <p><strong>Utilisateur :</strong> ${snap.firstName || ""} ${snap.lastName || ""} (${snap.email || ""})</p>
                    <p><strong>Inscriptions cours :</strong> ${coursesCount}</p>
                    <p><strong>Inscriptions programmes :</strong> ${programsCount}</p>
                    <p><strong>Total payé :</strong> ${totalPaid.toFixed(2)} DZD</p>
                    <hr style="margin:10px 0"/>
                    <p style="color:#ef4444">Le compte sera <strong>anonymisé</strong> (données personnelles effacées, inscriptions suspendues, favoris supprimés). Les paiements sont conservés pour conformité légale.</p>
                    <br/>
                    <textarea id="swal-note" class="swal2-textarea" style="width:100%" placeholder="Note admin optionnelle…"></textarea>
                </div>
            `,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Approuver et anonymiser",
      cancelButtonText: "Annuler",
      preConfirm: () => document.getElementById("swal-note")?.value || "",
    });

    if (!result.isConfirmed) return;

    setProcessing(request.id);
    try {
      await axios.post(
        `${API_BASE}/delete-account-requests/${request.id}/approve`,
        { adminNote: result.value || "" },
      );
      toast.success("Compte anonymisé avec succès.");
      fetchRequests();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de l'approbation.",
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request) => {
    const { value: note, isConfirmed } = await Swal.fire({
      title: "Rejeter la demande ?",
      html: `<p class="text-sm text-gray-600 mb-3">Le compte reste actif. Ajoutez une note optionnelle.</p>
                   <textarea id="swal-note" class="swal2-textarea w-full" placeholder="Raison du refus…"></textarea>`,
      showCancelButton: true,
      confirmButtonText: "Rejeter",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#6b7280",
      preConfirm: () => document.getElementById("swal-note")?.value || "",
    });
    if (!isConfirmed) return;

    setProcessing(request.id);
    try {
      await axios.post(
        `${API_BASE}/delete-account-requests/${request.id}/reject`,
        { adminNote: note || "" },
      );
      toast.success("Demande rejetée.");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const snap = r.userSnapshot?.user || {};
    return (
      snap.email?.toLowerCase().includes(s) ||
      snap.firstName?.toLowerCase().includes(s) ||
      snap.lastName?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-red-50 rounded-lg">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Demandes de suppression de compte
          </h1>
        </div>
        <p className="text-sm text-gray-500 ml-11">
          Examinez les données de l&apos;utilisateur, les inscriptions et les
          paiements avant d&apos;approuver.
        </p>
      </div>

      {/* Warning banner */}
      <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Important :</strong> L&apos;approbation anonymise le compte
          (nom, email, mot de passe effacés) et suspend toutes les inscriptions.
          Les enregistrements de paiement sont conservés sous l&apos;ID
          utilisateur anonymisé pour la conformité légale.
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap items-center gap-3">
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
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: "all", label: "Toutes" },
            { key: "pending", label: "En attente" },
            { key: "approved", label: "Approuvées" },
            { key: "rejected", label: "Rejetées" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                filter === key
                  ? "bg-white text-red-700 shadow-sm"
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

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-gray-200">
          <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aucune demande trouvée.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const snap = r.userSnapshot || {};
            const u = snap.user || {};
            const courses = snap.courseEnrollments || [];
            const programs = snap.programEnrollments || [];
            const totalPaid = snap.totalPaid || 0;
            const isExpanded = expanded === r.id;

            return (
              <div
                key={r.id}
                className={`bg-white rounded-xl border overflow-hidden transition ${
                  r.status === "pending"
                    ? "border-red-200 shadow-sm"
                    : "border-gray-200"
                }`}
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: user info */}
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {u.firstName || u.lastName
                              ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                              : "Nom inconnu"}
                          </h3>
                          {statusBadge(r.status)}
                          {r.status === "pending" && (
                            <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                              Action requise
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {u.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail size={11} />
                              <a
                                href={`mailto:${u.email}`}
                                className="hover:underline text-blue-600"
                              >
                                {u.email}
                              </a>
                            </div>
                          )}
                          {u.phoneNumber && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone size={11} />
                              {u.phoneNumber}
                            </div>
                          )}
                          <span className="text-xs text-gray-400">
                            ID #{r.userId || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: stats + actions */}
                    <div className="flex items-center gap-6 flex-wrap">
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {courses.length}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <BookOpen size={10} />
                            Cours
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {programs.length}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <GraduationCap size={10} />
                            Programmes
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {totalPaid.toFixed(0)}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            {/* <DollarSign size={10} /> */}
                            DZD payé
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {r.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(r)}
                            disabled={processing === r.id}
                            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-2 rounded-lg transition"
                          >
                            <CheckCircle size={13} />
                            Approuver
                          </button>
                          <button
                            onClick={() => handleReject(r)}
                            disabled={processing === r.id}
                            className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg transition"
                          >
                            <XCircle size={13} />
                            Rejeter
                          </button>
                        </div>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : r.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={13} />
                            Réduire
                          </>
                        ) : (
                          <>
                            <ChevronDown size={13} />
                            Détails
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Admin note */}
                  {r.adminNote && (
                    <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500">
                        <strong>Note admin :</strong> {r.adminNote}
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <p className="mt-2 text-xs text-gray-400">
                    Demande soumise le{" "}
                    {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {r.resolvedAt &&
                      ` · Traitée le ${new Date(r.resolvedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`}
                  </p>
                </div>

                {/* Expanded snapshot */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">
                    {/* Profile */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Profil au moment de la demande
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          ["Pays", u.country],
                          ["Domaine", u.studyDomain],
                          ["Filière", u.studyDomain],
                          [
                            "Inscrit le",
                            u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString(
                                  "fr-FR",
                                )
                              : null,
                          ],
                        ]
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <div
                              key={k}
                              className="bg-white rounded-lg border border-gray-100 px-3 py-2"
                            >
                              <p className="text-xs text-gray-400">{k}</p>
                              <p className="text-sm text-gray-700 font-medium">
                                {v}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Course enrollments */}
                    {courses.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                          <BookOpen size={12} />
                          Inscriptions aux cours ({courses.length})
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="text-left pb-1 pr-4">Cours</th>
                                <th className="text-left pb-1 pr-4">Statut</th>
                                <th className="text-left pb-1 pr-4">
                                  Paiement
                                </th>
                                <th className="text-right pb-1">Montant</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {courses.map((c) => (
                                <tr key={c.id}>
                                  <td className="py-1 pr-4 text-gray-700">
                                    {c.courseTitle || `Cours #${c.courseId}`}
                                  </td>
                                  <td className="py-1 pr-4">
                                    <span className="capitalize text-gray-500">
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="py-1 pr-4 text-gray-500">
                                    {c.paymentType || "—"}
                                  </td>
                                  <td className="py-1 text-right font-medium text-gray-700">
                                    {c.paymentAmount
                                      ? `${parseFloat(c.paymentAmount).toFixed(2)} DZD`
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Program enrollments */}
                    {programs.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                          <GraduationCap size={12} />
                          Inscriptions aux programmes ({programs.length})
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="text-left pb-1 pr-4">
                                  Programme
                                </th>
                                <th className="text-left pb-1 pr-4">Statut</th>
                                <th className="text-left pb-1 pr-4">
                                  Paiement
                                </th>
                                <th className="text-right pb-1">Montant</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {programs.map((p) => (
                                <tr key={p.id}>
                                  <td className="py-1 pr-4 text-gray-700">
                                    {p.programTitle ||
                                      `Programme #${p.programId}`}
                                  </td>
                                  <td className="py-1 pr-4">
                                    <span className="capitalize text-gray-500">
                                      {p.status}
                                    </span>
                                  </td>
                                  <td className="py-1 pr-4 text-gray-500">
                                    {p.paymentType || "—"}
                                  </td>
                                  <td className="py-1 text-right font-medium text-gray-700">
                                    {p.paymentAmount
                                      ? `${parseFloat(p.paymentAmount).toFixed(2)} DZD`
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-end">
                      <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
                        <DollarSign size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Total payé :
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {totalPaid.toFixed(2)} DZD
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeleteAccountRequests;
