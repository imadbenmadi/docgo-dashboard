import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Plus,
  Search,
  Tag,
  Percent,
  Users,
  Copy,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserCheck,
  X,
  Calendar,
  Hash,
} from "lucide-react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CouponsAPI from "../../API/Coupons";
import { RichTextEditor } from "../../components/Common/RichTextEditor";
import contactAPI from "../../API/Contact";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  active: "bg-green-100 text-green-700 border border-green-200",
  inactive: "bg-gray-100 text-gray-600 border border-gray-200",
  exhausted: "bg-red-100 text-red-700 border border-red-200",
  expired: "bg-orange-100 text-orange-700 border border-orange-200",
};

const getCouponStatus = (coupon) => {
  if (!coupon.isActive) return "inactive";
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date())
    return "expired";
  if (coupon.usesCount >= coupon.maxUses) return "exhausted";
  return "active";
};

const STATUS_LABELS = {
  active: "Actif",
  inactive: "Inactif",
  exhausted: "Épuisé",
  expired: "Expiré",
};

const EMPTY_FORM = {
  label: "",
  discountType: "percentage",
  discountValue: "",
  maxUses: 1,
  isActive: true,
  expiryDate: "",
  applicableTo: "both",
  notes: "",
  codePrefix: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Create / Edit coupon
// ─────────────────────────────────────────────────────────────────────────────
const CouponModal = ({ coupon, onClose, onSave }) => {
  const isEdit = Boolean(coupon?.id);
  const [form, setForm] = useState(
    isEdit
      ? {
          label: coupon.label || "",
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxUses: coupon.maxUses,
          isActive: coupon.isActive,
          expiryDate: coupon.expiryDate
            ? new Date(coupon.expiryDate).toISOString().substring(0, 10)
            : "",
          applicableTo: coupon.applicableTo,
          notes: coupon.notes || "",
          codePrefix: "",
        }
      : { ...EMPTY_FORM },
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.discountValue || isNaN(form.discountValue)) {
      toast.error("Valeur de remise invalide");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        maxUses: Number(form.maxUses),
        expiryDate: form.expiryDate || null,
      };
      if (isEdit) {
        await CouponsAPI.update(coupon.id, payload);
        toast.success("Coupon mis à jour");
      } else {
        await CouponsAPI.create(payload);
        toast.success("Coupon créé");
      }
      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur serveur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Modifier le coupon" : "Nouveau coupon"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom / Description
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="ex. Promo été 20%"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Prefix (create only) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préfixe du code (optionnel)
              </label>
              <input
                type="text"
                value={form.codePrefix}
                onChange={(e) =>
                  set("codePrefix", e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="ex. SUMMER → SUMMER-XXXX-XXXX"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
            </div>
          )}

          {/* Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de remise
              </label>
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (DZD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valeur {form.discountType === "percentage" ? "(%)" : "(DZD)"}
              </label>
              <input
                type="number"
                min="1"
                max={form.discountType === "percentage" ? 100 : undefined}
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "percentage" ? "20" : "500"}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Applicable to + Max Uses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applicable à
              </label>
              <select
                value={form.applicableTo}
                onChange={(e) => set("applicableTo", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="both">Cours & Programmes</option>
                <option value="courses">Cours seulement</option>
                <option value="programs">Programmes seulement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilisations max
              </label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => set("maxUses", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d&apos;expiration (optionnel)
            </label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes internes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              {form.isActive ? "Actif" : "Inactif"}
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving
              ? "Enregistrement..."
              : isEdit
                ? "Mettre à jour"
                : "Créer le coupon"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

CouponModal.propTypes = {
  coupon: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Assign coupon to user + send message
// ─────────────────────────────────────────────────────────────────────────────
const AssignModal = ({ coupon, onClose, onDone }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sendMsg, setSendMsg] = useState(true);
  const [msgHtml, setMsgHtml] = useState("");
  const [msgPlain, setMsgPlain] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Build default message HTML when a user is selected
  useEffect(() => {
    if (selectedUser && coupon) {
      const discount =
        coupon.discountType === "percentage"
          ? `${coupon.discountValue}%`
          : `${coupon.discountValue} DZD`;
      setMsgPlain(
        `Bonjour ${selectedUser.firstName},\n\nNous avons le plaisir de vous offrir un coupon de réduction de ${discount}.\n\nCode : ${coupon.code}\n\nBonne continuation !`,
      );
      setMsgHtml(
        `<p>Bonjour <strong>${selectedUser.firstName}</strong>,</p><p>Nous avons le plaisir de vous offrir un coupon de réduction de <strong>${discount}</strong>.</p><p>🎟️ Code : <strong style="font-size:1.2em;color:#2563eb;">${coupon.code}</strong></p><p>Bonne continuation sur DocGo !</p>`,
      );
    }
  }, [selectedUser, coupon]);

  const searchUsers = useCallback(async (q) => {
    if (!q.trim()) {
      setUsers([]);
      return;
    }
    setSearchLoading(true);
    try {
      // We use the axios instance from AdminUsers
      const axios = (await import("../../utils/axios.jsx")).default;
      const res = await axios.get(
        `/Admin/users?search=${encodeURIComponent(q)}&limit=10`,
      );
      setUsers(res.data?.users || res.data?.data?.users || []);
    } catch {
      toast.error("Erreur de recherche utilisateurs");
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim().length >= 2) searchUsers(search);
    }, 400);
    return () => clearTimeout(t);
  }, [search, searchUsers]);

  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error("Sélectionnez un utilisateur");
      return;
    }
    setAssigning(true);
    try {
      await CouponsAPI.assignToUser(coupon.id, selectedUser.id);
      if (sendMsg && (msgHtml || msgPlain)) {
        await contactAPI.createAdminMessage({
          userId: selectedUser.id,
          message: msgPlain,
          messageHtml: msgHtml,
          context: "dashboard",
          priority: "medium",
          subject: `Coupon ${coupon.code}`,
        });
      }
      toast.success(
        `Coupon assigné à ${selectedUser.firstName} ${selectedUser.lastName}`,
      );
      onDone();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Assigner le coupon
            </h2>
            <p className="text-sm text-gray-500 font-mono mt-0.5">
              {coupon.code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher un utilisateur
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, prénom ou email..."
                className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {searchLoading && (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" /> Recherche...
              </p>
            )}

            {users.length > 0 && !selectedUser && (
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u);
                      setUsers([]);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left border-b last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold uppercase">
                      {u.firstName?.[0]}
                      {u.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="mt-2 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-xs text-blue-700">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Send message toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSendMsg(!sendMsg)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                sendMsg ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  sendMsg ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              Envoyer un message à l&apos;utilisateur avec le code
            </span>
          </div>

          {/* Rich Text message */}
          {sendMsg && selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (avec éditeur riche)
              </label>
              <RichTextEditor
                value={msgHtml}
                onChange={(html) => {
                  setMsgHtml(html);
                  // Strip HTML for plain text
                  const div = document.createElement("div");
                  div.innerHTML = html;
                  setMsgPlain(div.textContent || div.innerText || "");
                }}
                height="160px"
                placeholder="Rédigez votre message..."
              />
            </div>
          )}

          <button
            onClick={handleAssign}
            disabled={assigning || !selectedUser}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {assigning
              ? "Assignation..."
              : sendMsg
                ? "Assigner & Envoyer le message"
                : "Assigner le coupon"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

AssignModal.propTypes = {
  coupon: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Coupons Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ isActive: "", applicableTo: "" });
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [assignCoupon, setAssignCoupon] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filters.isActive !== "") params.isActive = filters.isActive;
      if (filters.applicableTo) params.applicableTo = filters.applicableTo;
      const res = await CouponsAPI.getAll(params);
      setCoupons(res.data?.data?.coupons || []);
      setPagination(
        res.data?.data?.pagination || { total: 0, page: 1, totalPages: 1 },
      );
    } catch {
      toast.error("Erreur chargement coupons");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async (coupon) => {
    const r = await Swal.fire({
      icon: "warning",
      title: "Supprimer le coupon ?",
      html: `<p>Le code <strong>${coupon.code}</strong> sera définitivement supprimé.</p>`,
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#ef4444",
    });
    if (!r.isConfirmed) return;
    try {
      await CouponsAPI.remove(coupon.id);
      toast.success("Coupon supprimé");
      fetchCoupons();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await CouponsAPI.update(coupon.id, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? "Coupon désactivé" : "Coupon activé");
      fetchCoupons();
    } catch {
      toast.error("Erreur");
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié !");
  };

  // Stats
  const activeCoupons = coupons.filter(
    (c) => getCouponStatus(c) === "active",
  ).length;
  const totalUses = coupons.reduce((s, c) => s + (c.usesCount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />

      <AnimatePresence>
        {showCreate && (
          <CouponModal
            coupon={null}
            onClose={() => setShowCreate(false)}
            onSave={() => {
              setShowCreate(false);
              fetchCoupons();
            }}
          />
        )}
        {editCoupon && (
          <CouponModal
            coupon={editCoupon}
            onClose={() => setEditCoupon(null)}
            onSave={() => {
              setEditCoupon(null);
              fetchCoupons();
            }}
          />
        )}
        {assignCoupon && (
          <AssignModal
            coupon={assignCoupon}
            onClose={() => setAssignCoupon(null)}
            onDone={() => {
              setAssignCoupon(null);
              fetchCoupons();
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les codes promo et remises
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nouveau coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total coupons",
            value: pagination.total,
            icon: Tag,
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Actifs",
            value: activeCoupons,
            icon: CheckCircle,
            color: "bg-green-50 text-green-700",
          },
          {
            label: "Utilisations totales",
            value: totalUses,
            icon: Hash,
            color: "bg-purple-50 text-purple-700",
          },
          {
            label: "Affichés",
            value: coupons.length,
            icon: Percent,
            color: "bg-orange-50 text-orange-700",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4" />
              <p className="text-xs font-medium">{s.label}</p>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par code ou label..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <select
          value={filters.isActive}
          onChange={(e) =>
            setFilters((p) => ({ ...p, isActive: e.target.value }))
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
        <select
          value={filters.applicableTo}
          onChange={(e) =>
            setFilters((p) => ({ ...p, applicableTo: e.target.value }))
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous types</option>
          <option value="courses">Cours</option>
          <option value="programs">Programmes</option>
          <option value="both">Les deux</option>
        </select>
        <button
          onClick={fetchCoupons}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {/* Coupons table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Tag className="w-10 h-10 mb-3" />
          <p>Aucun coupon trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Code
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Remise
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Utilisations
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Applicable
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Expiration
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Statut
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="text-gray-400 hover:text-blue-600 transition"
                            title="Copier le code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {coupon.label && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {coupon.label}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {coupon.discountType === "percentage" ? (
                            <>
                              <Percent className="w-3 h-3" />
                              {coupon.discountValue}%
                            </>
                          ) : (
                            <>{coupon.discountValue} DZD</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {coupon.usesCount}
                            <span className="text-gray-400">
                              /{coupon.maxUses}
                            </span>
                          </span>
                        </div>
                        {/* Usage bar */}
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-1.5 bg-blue-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (coupon.usesCount / coupon.maxUses) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize text-xs">
                        {coupon.applicableTo === "both"
                          ? "Tous"
                          : coupon.applicableTo}
                      </td>
                      <td className="px-4 py-3">
                        {coupon.expiryDate ? (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(coupon.expiryDate).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Aucune</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setAssignCoupon(coupon)}
                            title="Assigner à un utilisateur"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(coupon)}
                            title={coupon.isActive ? "Désactiver" : "Activer"}
                            className={`p-1.5 rounded-lg transition ${coupon.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                          >
                            {coupon.isActive ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditCoupon(coupon)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-sm text-gray-500">
                {pagination.total} coupon{pagination.total > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-white"
                >
                  Préc.
                </button>
                <span className="text-sm text-gray-600">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-white"
                >
                  Suiv.
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
