import {
    AlertCircle,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Info,
    RefreshCw,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import logsAPI from "../API/Logs";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const LEVEL_CONFIG = {
    error: {
        label: "Error",
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
        dot: "bg-red-500",
        icon: AlertCircle,
    },
    warn: {
        label: "Warning",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
        dot: "bg-yellow-500",
        icon: AlertTriangle,
    },
    info: {
        label: "Info",
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        dot: "bg-blue-500",
        icon: Info,
    },
};

const METHOD_COLORS = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-yellow-100 text-yellow-700",
    PATCH: "bg-orange-100 text-orange-700",
    DELETE: "bg-red-100 text-red-700",
};

function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function StatCard({ level, count, active, onClick }) {
    const cfg = LEVEL_CONFIG[level] || {};
    const Icon = cfg.icon || Info;
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 transition-all hover:shadow-md ${
                active
                    ? `${cfg.bg} ${cfg.border} shadow-md`
                    : "bg-white border-gray-200 hover:border-gray-300"
            }`}
        >
            <span className={`rounded-full p-2 ${cfg.bg}`}>
                <Icon size={18} className={cfg.text} />
            </span>
            <div className="text-left">
                <p className="text-2xl font-bold text-gray-800">
                    {count ?? "—"}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {cfg.label || level}
                </p>
            </div>
        </button>
    );
}

function LevelBadge({ level }) {
    const cfg = LEVEL_CONFIG[level] || {
        bg: "bg-gray-100",
        text: "text-gray-600",
        dot: "bg-gray-400",
        label: level,
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function MethodBadge({ method }) {
    if (!method) return <span className="text-gray-400">—</span>;
    const cls =
        METHOD_COLORS[method.toUpperCase()] || "bg-gray-100 text-gray-600";
    return (
        <span
            className={`rounded px-1.5 py-0.5 text-xs font-mono font-bold ${cls}`}
        >
            {method}
        </span>
    );
}

function LogRow({ entry, onDelete }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Expand toggle */}
                <td className="px-3 py-3 text-gray-400">
                    {expanded ? (
                        <ChevronDown size={14} />
                    ) : (
                        <ChevronRight size={14} />
                    )}
                </td>

                {/* Level */}
                <td className="px-3 py-3">
                    <LevelBadge level={entry.level} />
                </td>

                {/* Timestamp */}
                <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(entry.timestamp)}
                </td>

                {/* Method */}
                <td className="px-3 py-3">
                    <MethodBadge method={entry.method} />
                </td>

                {/* Path */}
                <td className="px-3 py-3 max-w-[200px] truncate text-xs font-mono text-gray-600">
                    {entry.path || "—"}
                </td>

                {/* Status */}
                <td className="px-3 py-3 text-center">
                    {entry.status ? (
                        <span
                            className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                                entry.status >= 500
                                    ? "bg-red-100 text-red-700"
                                    : entry.status >= 400
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                            }`}
                        >
                            {entry.status}
                        </span>
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </td>

                {/* Message */}
                <td className="px-3 py-3 text-sm text-gray-700 max-w-[320px] truncate">
                    {entry.message || "—"}
                </td>

                {/* Delete */}
                <td
                    className="px-3 py-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => onDelete(entry.id)}
                        className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete this entry"
                    >
                        <Trash2 size={14} />
                    </button>
                </td>
            </tr>

            {/* Expanded detail row */}
            {expanded && (
                <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={8} className="px-6 py-4">
                        <div className="space-y-3">
                            {/* Full message */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Message
                                </p>
                                <p className="text-sm text-gray-800">
                                    {entry.message}
                                </p>
                            </div>

                            {/* Stack trace */}
                            {entry.stack && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                        Stack Trace
                                    </p>
                                    <pre className="bg-gray-900 text-green-400 rounded-lg px-4 py-3 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                        {entry.stack}
                                    </pre>
                                </div>
                            )}

                            {/* Meta */}
                            {entry.meta && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                        Meta
                                    </p>
                                    <pre className="bg-gray-100 rounded-lg px-4 py-3 text-xs overflow-x-auto">
                                        {JSON.stringify(entry.meta, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Entry ID */}
                            <p className="text-xs text-gray-400 font-mono">
                                ID: {entry.id}
                            </p>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ─────────────────────────────────────────
// Main page
// ─────────────────────────────────────────

const ITEMS_PER_PAGE = 50;

export default function ErrorLogs() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
    });

    // Filters
    const [levelFilter, setLevelFilter] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // ─ Data fetching ─────────────────────

    const fetchStats = useCallback(async () => {
        try {
            const data = await logsAPI.getStats();
            if (data.success) setStats(data.stats);
        } catch {
            // Non-critical
        }
    }, []);

    const fetchLogs = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const data = await logsAPI.getLogs({
                    level: levelFilter || undefined,
                    search: search || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    page,
                    limit: ITEMS_PER_PAGE,
                });
                if (data.success) {
                    setLogs(data.items);
                    setPagination({
                        page: data.page,
                        totalPages: data.totalPages,
                        total: data.total,
                    });
                }
            } catch (error) {
                toast.error("Failed to load logs");
            } finally {
                setLoading(false);
            }
        },
        [levelFilter, search, startDate, endDate],
    );

    useEffect(() => {
        fetchStats();
        fetchLogs(1);
    }, [fetchLogs, fetchStats]);

    // ─ Actions ───────────────────────────

    const handleRefresh = () => {
        fetchStats();
        fetchLogs(pagination.page);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
    };

    const handleLevelClick = (level) => {
        setLevelFilter((prev) => (prev === level ? "" : level));
    };

    const handleDeleteOne = async (id) => {
        try {
            await logsAPI.deleteLog(id);
            toast.success("Entry deleted");
            fetchStats();
            fetchLogs(pagination.page);
        } catch {
            toast.error("Failed to delete entry");
        }
    };

    const handleClearAll = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Clear all logs?",
            text: "This will permanently delete all log entries. This cannot be undone.",
            showCancelButton: true,
            confirmButtonText: "Yes, clear all",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#ef4444",
        });

        if (!result.isConfirmed) return;

        try {
            await logsAPI.clearLogs();
            toast.success("All logs cleared");
            setLogs([]);
            setStats({ total: 0, error: 0, warn: 0, info: 0 });
            setPagination({ page: 1, totalPages: 1, total: 0 });
        } catch {
            toast.error("Failed to clear logs");
        }
    };

    // ─ Render ────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Server Logs
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        All errors and events captured by the server
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                    >
                        <Trash2 size={15} />
                        Clear All
                    </button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Total */}
                <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-5 py-4">
                    <div className="text-left">
                        <p className="text-2xl font-bold text-gray-800">
                            {stats?.total ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Total
                        </p>
                    </div>
                </div>

                {["error", "warn", "info"].map((lvl) => (
                    <StatCard
                        key={lvl}
                        level={lvl}
                        count={stats?.[lvl]}
                        active={levelFilter === lvl}
                        onClick={() => handleLevelClick(lvl)}
                    />
                ))}
            </div>

            {/* Filters */}
            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2"
                    >
                        <Search size={15} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search message or path…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                        />
                        {searchInput && (
                            <button type="button" onClick={handleClearSearch}>
                                <X
                                    size={13}
                                    className="text-gray-400 hover:text-gray-600"
                                />
                            </button>
                        )}
                    </form>

                    {/* Start date */}
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                        placeholder="From"
                    />

                    {/* End date */}
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                        placeholder="To"
                    />

                    {/* Level select */}
                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    >
                        <option value="">All levels</option>
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                    </select>

                    {/* Reset */}
                    {(levelFilter || search || startDate || endDate) && (
                        <button
                            onClick={() => {
                                setLevelFilter("");
                                setSearch("");
                                setSearchInput("");
                                setStartDate("");
                                setEndDate("");
                            }}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <RefreshCw size={22} className="animate-spin mr-2" />
                        Loading logs…
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Info size={40} className="mb-3 opacity-40" />
                        <p className="text-sm">No log entries found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-3 py-3 w-8" />
                                        <th className="px-3 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide">
                                            Level
                                        </th>
                                        <th className="px-3 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide whitespace-nowrap">
                                            Timestamp
                                        </th>
                                        <th className="px-3 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide">
                                            Method
                                        </th>
                                        <th className="px-3 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide">
                                            Path
                                        </th>
                                        <th className="px-3 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide text-center">
                                            Status
                                        </th>
                                        <th className="px-3 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide">
                                            Message
                                        </th>
                                        <th className="px-3 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((entry) => (
                                        <LogRow
                                            key={entry.id}
                                            entry={entry}
                                            onDelete={handleDeleteOne}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                            <p className="text-xs text-gray-500">
                                Showing {logs.length} of {pagination.total}{" "}
                                entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={pagination.page <= 1}
                                    onClick={() =>
                                        fetchLogs(pagination.page - 1)
                                    }
                                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ← Prev
                                </button>
                                <span className="text-xs text-gray-600">
                                    Page {pagination.page} /{" "}
                                    {pagination.totalPages}
                                </span>
                                <button
                                    disabled={
                                        pagination.page >= pagination.totalPages
                                    }
                                    onClick={() =>
                                        fetchLogs(pagination.page + 1)
                                    }
                                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
