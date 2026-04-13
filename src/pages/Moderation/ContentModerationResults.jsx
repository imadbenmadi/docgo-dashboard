/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { adminUsersAPI } from "../../API/AdminUsers";
import { getApiBaseUrl } from "../../utils/apiBaseUrl";
import UserAvatar from "../../components/Common/UserAvatar";

// ── Decision helpers ────────────────────────────────────────────────────────

const DECISION_META = {
  block: {
    label: "Block",
    badge: "bg-red-100 text-red-700 border border-red-300",
    row: "bg-red-50",
  },
  flag: {
    label: "Flag",
    badge: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    row: "bg-yellow-50",
  },
  allow: {
    label: "Allow",
    badge: "bg-green-100 text-green-700 border border-green-300",
    row: "",
  },
};

function DecisionBadge({ decision }) {
  const meta = DECISION_META[decision] || {
    badge: "bg-gray-100 text-gray-600",
    label: decision,
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}

// ── Score bar component ─────────────────────────────────────────────────────

function ScoreBar({ scores }) {
  const nsfw = scores?.nsfw ?? scores?.NSFW ?? 0;
  const pct = Math.round(nsfw * 100);
  const color =
    pct >= 75 ? "bg-red-500" : pct >= 45 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-10 text-right">{pct}%</span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

const FILTERS = ["all", "block", "flag", "allow"];

export default function ContentModerationResults() {
  const fileInputRef = useRef(null);
  const [scanInfo, setScanInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState("all");
  const [blockedIds, setBlockedIds] = useState(new Set());

  // ── Load JSON ─────────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed)) {
          // flat array format
          setScanInfo(null);
          setResults(parsed);
        } else {
          setScanInfo(parsed.scan_info ?? null);
          setResults(parsed.results ?? []);
        }
        setBlockedIds(new Set());
        setFilter("all");
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Invalid JSON",
          text: err.message,
        });
      }
    };
    reader.readAsText(file);
    // reset so the same file can be re-uploaded
    e.target.value = "";
  };

  // ── Block user ────────────────────────────────────────────────────────────

  const handleBlock = async (result) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Block user?",
      html: `User <strong>#${result.userId}</strong> will be blocked and unable to log in.<br/><small class="text-gray-500">${result.filename}</small>`,
      showCancelButton: true,
      confirmButtonText: "Block",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      await adminUsersAPI.toggleUserStatus(result.userId, "blocked");
      setBlockedIds((prev) => new Set([...prev, result.userId]));
      Swal.fire({
        icon: "success",
        title: "User blocked",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to block",
        text: err?.message || String(err),
      });
    }
  };

  // ── Unblock user ──────────────────────────────────────────────────────────

  const handleUnblock = async (result) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Unblock user?",
      text: `Restore access for user #${result.userId}?`,
      showCancelButton: true,
      confirmButtonText: "Unblock",
      confirmButtonColor: "#22c55e",
    });
    if (!confirm.isConfirmed) return;
    try {
      await adminUsersAPI.toggleUserStatus(result.userId, "active");
      setBlockedIds((prev) => {
        const next = new Set(prev);
        next.delete(result.userId);
        return next;
      });
      Swal.fire({
        icon: "success",
        title: "User unblocked",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to unblock",
        text: err?.message || String(err),
      });
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const filtered =
    filter === "all" ? results : results.filter((r) => r.decision === filter);

  const api = getApiBaseUrl();
  const imgSrc = (r) => `${api}/${r.imagePath}`;

  const counts = {
    all: results.length,
    block: results.filter((r) => r.decision === "block").length,
    flag: results.filter((r) => r.decision === "flag").length,
    allow: results.filter((r) => r.decision === "allow").length,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">
          Content Moderation – Batch Scan
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload the{" "}
          <code className="bg-gray-100 px-1 rounded">
            moderation_results.json
          </code>{" "}
          file produced by the Kaggle or Colab notebook to review and act on
          flagged profile pictures.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-white border rounded-lg shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-700">Load scan results</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Accepts the JSON output from the Python notebooks. Results are
            processed locally — nothing is sent to the server just by uploading
            the file.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Scan summary */}
      {scanInfo && (
        <div className="bg-white border rounded-lg shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Scan Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard
              value={scanInfo.total_scanned ?? results.length}
              label="Scanned"
              color="blue"
            />
            <StatCard
              value={scanInfo.blocked_count ?? counts.block}
              label="To Block"
              color="red"
            />
            <StatCard
              value={scanInfo.flagged_count ?? counts.flag}
              label="Flagged"
              color="yellow"
            />
            <StatCard
              value={scanInfo.allow_count ?? counts.allow}
              label="Clean"
              color="green"
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            {scanInfo.model && (
              <span>
                Model: <strong>{scanInfo.model}</strong>
              </span>
            )}
            {scanInfo.folder && (
              <span>
                Folder: <strong>{scanInfo.folder}</strong>
              </span>
            )}
            {scanInfo.block_threshold != null && (
              <span>
                Thresholds: block ≥ {Math.round(scanInfo.block_threshold * 100)}
                %, flag ≥ {Math.round(scanInfo.flag_threshold * 100)}%
              </span>
            )}
            {scanInfo.scanned_at && (
              <span>
                Scanned: {new Date(scanInfo.scanned_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {/* Filter tabs */}
          <div className="flex border-b px-4 pt-3 gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-t text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 text-xs opacity-70">
                  (
                  {counts[f] ??
                    (f === "all"
                      ? results.length
                      : results.filter((r) => r.decision === f).length)}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="p-3 w-16">Avatar</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Filename</th>
                  <th className="p-3">Decision</th>
                  <th className="p-3">NSFW Score</th>
                  <th className="p-3">All Scores</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-400">
                      No results for this filter.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => {
                  const rowMeta = DECISION_META[r.decision];
                  const isBlocked = blockedIds.has(r.userId);
                  return (
                    <tr
                      key={r.filename}
                      className={`border-t transition-colors ${rowMeta?.row ?? ""}`}
                    >
                      {/* Avatar */}
                      <td className="p-3">
                        <UserAvatar
                          src={imgSrc(r)}
                          name={`User ${r.userId}`}
                          size={40}
                        />
                      </td>

                      {/* User ID */}
                      <td className="p-3 font-mono font-semibold">
                        #{r.userId}
                      </td>

                      {/* Filename */}
                      <td className="p-3 max-w-[200px] truncate text-gray-600 text-xs">
                        {r.filename}
                      </td>

                      {/* Decision */}
                      <td className="p-3">
                        <DecisionBadge decision={r.decision} />
                      </td>

                      {/* NSFW score bar */}
                      <td className="p-3">
                        <ScoreBar scores={r.scores} />
                      </td>

                      {/* All scores */}
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        {Object.entries(r.scores ?? {})
                          .map(
                            ([label, score]) =>
                              `${label}: ${(score * 100).toFixed(1)}%`,
                          )
                          .join(" · ")}
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <div className="flex gap-2">
                          {isBlocked ? (
                            <button
                              className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border"
                              onClick={() => handleUnblock(r)}
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                              onClick={() => handleBlock(r)}
                              disabled={r.decision === "allow"}
                              title={
                                r.decision === "allow"
                                  ? "Score is below flag threshold"
                                  : "Block this user"
                              }
                            >
                              Block
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

          <p className="text-xs text-gray-400 px-4 py-2 border-t">
            Showing {filtered.length} of {results.length} result
            {results.length !== 1 ? "s" : ""}.
            {blockedIds.size > 0 && (
              <span className="ml-2 text-red-500">
                {blockedIds.size} user
                {blockedIds.size !== 1 ? "s" : ""} blocked this session.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && (
        <div className="bg-white border rounded-lg shadow-sm p-10 text-center text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-gray-600">No results loaded</p>
          <p className="text-sm mt-1">
            Run the Kaggle or Colab notebook, then upload{" "}
            <code className="bg-gray-100 px-1 rounded">
              moderation_results.json
            </code>
            .
          </p>
        </div>
      )}
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ value, label, color }) {
  const colorMap = {
    blue: "text-blue-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
  };
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg border">
      <p className={`text-2xl font-bold ${colorMap[color] ?? "text-gray-700"}`}>
        {value ?? 0}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
