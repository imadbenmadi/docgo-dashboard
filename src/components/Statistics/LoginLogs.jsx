import { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  ShieldOff,
  Monitor,
  Smartphone,
  Globe,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  User,
  MapPin,
  Download,
} from "lucide-react";
import statisticsAPI from "../../API/Statistics";
import { exportToExcel } from "../../utils/exportToExcel";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SUCCESS: {
    label: "Succès",
    color: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-500",
    Icon: CheckCircle,
  },
  FAILED: {
    label: "Échoué",
    color: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
    Icon: XCircle,
  },
  BLOCKED: {
    label: "Bloqué",
    color: "bg-orange-100 text-orange-700 border border-orange-200",
    dot: "bg-orange-500",
    Icon: ShieldOff,
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.FAILED;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const DeviceIcon = ({ type }) =>
  typeof type === "string" && type.toLowerCase().includes("mobile") ? (
    <Smartphone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
  ) : (
    <Monitor className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
  );

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SummaryCard = ({ label, value, sub, Icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800">
        {(value ?? 0).toLocaleString()}
      </div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      {sub !== undefined && (
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      )}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function LoginLogs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await statisticsAPI.getLoginLogs({
          page,
          limit: 50,
          search: debouncedSearch,
          status,
          startDate,
          endDate,
        });
        if (res?.data?.success) {
          setLogs(res.data.data.logs || []);
          setPagination(res.data.data.pagination || {});
          setSummary(res.data.data.summary || null);
        }
      } catch {
        // silent — leave existing data
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, debouncedSearch, status, startDate, endDate],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, startDate, endDate]);

  const handleExportCSV = () => {
    try {
      const exportData = logs.map((l) => ({
        Date: fmtDate(l.createdAt),
        Email: l.email || l.user?.email || "-",
        Nom: l.user ? `${l.user.firstName} ${l.user.lastName}` : "-",
        IP: l.ipAddress || "-",
        Statut: l.loginStatus || "-",
        Navigateur: l.browser || "-",
        OS: l.os || "-",
        Appareil: l.deviceType || "-",
        Pays: l.country || "-",
        Ville: l.city || "-",
        "Raison d'échec": l.failureReason || "-",
      }));

      if (exportData.length === 0) {
        alert("Aucune donnée à exporter");
        return;
      }

      exportToExcel(exportData, "Journaux de connexion", "login_logs_export");
    } catch (error) {
      console.error("Export error:", error);
      alert("Erreur lors de l'export");
    }
  };

  const successRate =
    summary && summary.total > 0
      ? Math.round((summary.success / summary.total) * 100)
      : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Journaux de connexion
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Historique de toutes les tentatives de connexion des utilisateurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total connexions"
            value={summary.total}
            sub={`Taux de succès: ${successRate}%`}
            Icon={Globe}
            color="bg-blue-500"
          />
          <SummaryCard
            label="Succès"
            value={summary.success}
            Icon={CheckCircle}
            color="bg-green-500"
          />
          <SummaryCard
            label="Échecs"
            value={summary.failed}
            Icon={XCircle}
            color="bg-red-500"
          />
          <SummaryCard
            label="Bloqués"
            value={summary.blocked}
            Icon={ShieldOff}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Top countries */}
      {summary?.topCountries?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            Top pays de connexion
          </h3>
          <div className="flex flex-wrap gap-2">
            {summary.topCountries.map((c) => (
              <button
                key={c.country}
                onClick={() =>
                  setSearch((prev) => (prev === c.country ? "" : c.country))
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-xs text-gray-600 hover:text-blue-700 transition-all"
              >
                <span className="font-medium">{c.country || "Inconnu"}</span>
                <span className="bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Email, nom, IP..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 appearance-none bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="SUCCESS">Succès</option>
              <option value="FAILED">Échoué</option>
              <option value="BLOCKED">Bloqué</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              />
            </div>
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            />
          </div>

          {/* Clear filters */}
          {(search || status || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setStartDate("");
                setEndDate("");
              }}
              className="px-3 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
            >
              Effacer filtres
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <User className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Aucun journal trouvé</p>
            {(search || status) && (
              <p className="text-xs mt-1">Essayez de modifier vos filtres</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Date",
                    "Utilisateur",
                    "IP",
                    "Statut",
                    "Navigateur / OS",
                    "Appareil",
                    "Localisation",
                    "Raison",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const u = log.user;
                  const displayEmail = log.email || u?.email || "—";
                  const displayName = u
                    ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                    : null;
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">
                        {fmtDate(log.createdAt)}
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {displayName && (
                            <span className="font-medium text-gray-800 text-xs">
                              {displayName}
                            </span>
                          )}
                          <span className="text-gray-500 text-xs">
                            {displayEmail}
                          </span>
                          {u?.id && (
                            <span className="text-gray-400 text-[10px]">
                              ID #{u.id}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                        {log.ipAddress}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={log.loginStatus} />
                      </td>

                      {/* Browser / OS */}
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[160px]">
                        <div className="truncate">{log.browser || "—"}</div>
                        <div className="text-gray-400 truncate">
                          {log.os || "—"}
                        </div>
                      </td>

                      {/* Device */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <DeviceIcon type={log.deviceType} />
                          <span className="capitalize">
                            {log.deviceType || "desktop"}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span>{log.country || "—"}</span>
                          {log.city && log.city !== "Unknown" && (
                            <span className="text-gray-400">{log.city}</span>
                          )}
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px]">
                        {log.failureReason ? (
                          <span className="text-red-500">
                            {log.failureReason}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">
              {pagination.total.toLocaleString()} entités au total — page{" "}
              {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {/* Page numbers */}
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const mid = Math.min(
                    Math.max(page, 3),
                    pagination.totalPages - 2,
                  );
                  return i + Math.max(1, mid - 2);
                },
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-white"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
