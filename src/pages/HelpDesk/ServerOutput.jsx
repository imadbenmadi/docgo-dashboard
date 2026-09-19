import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileWarning,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import apiClient from "../../utils/apiClient";

/**
 * The host's stderr file.
 *
 * When the server dies on boot it cannot write to its own log page — the
 * process that would have done it is the one that died. What it printed goes
 * to stderr.log in the application root, and until now reading it meant
 * opening cPanel's file manager. This shows the tail of it, filtered.
 *
 * Read only: the page never writes to or clears a file the host owns.
 */

const LEVELS = {
  error: "text-red-300",
  warn: "text-amber-300",
  info: "text-slate-300",
};

const FILTERS = [
  { value: "", label: "Tout" },
  { value: "error", label: "Erreurs" },
  { value: "warn", label: "Avertissements" },
];

const bytes = (n) => {
  if (!n && n !== 0) return "—";
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
};

const ServerOutput = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState(300);
  const [auto, setAuto] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: body } = await apiClient.get("/Admin/stderr", {
        params: { lines, ...(level ? { level } : {}), ...(search ? { search } : {}) },
      });
      setData(body);
    } catch (err) {
      setData({
        success: false,
        message:
          err?.response?.data?.message || "Impossible de lire le fichier.",
      });
    } finally {
      setLoading(false);
    }
  }, [lines, level, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!auto) return undefined;
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [auto, load]);

  const download = () => {
    window.open(
      `${apiClient.defaults.baseURL || ""}/Admin/stderr/download`,
      "_blank",
      "noopener",
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <FileWarning className="h-6 w-6 text-amber-600" />
            Sortie du serveur (stderr)
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Ce que le processus Node écrit sur la sortie d&apos;erreur, tel que
            l&apos;hébergeur l&apos;enregistre. C&apos;est ici qu&apos;atterrit
            un plantage au démarrage, que la page « Logs du serveur » ne peut pas
            montrer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-gray-200">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
            />
            Actualiser seul
          </label>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher dans les lignes…"
            className="w-72 rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          value={lines}
          onChange={(e) => setLines(Number(e.target.value))}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          {[100, 300, 1000, 2000].map((n) => (
            <option key={n} value={n}>
              {n} dernières lignes
            </option>
          ))}
        </select>

        {data?.exists && (
          <span className="text-xs text-gray-500">
            {bytes(data.size)} ·{" "}
            {data.modifiedAt
              ? new Date(data.modifiedAt).toLocaleString("fr-FR")
              : "—"}
            {data.counts ? (
              <>
                {" · "}
                <span className="font-semibold text-red-600">
                  {data.counts.error} erreur(s)
                </span>
                {", "}
                <span className="font-semibold text-amber-600">
                  {data.counts.warn} avertissement(s)
                </span>
              </>
            ) : null}
          </span>
        )}
      </div>

      {data && !data.success && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          <XCircle className="h-4 w-4" />
          {data.message}
        </div>
      )}

      {data?.success && !data.exists && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{data.message}</p>
            <p className="mt-1 text-xs text-amber-700">
              Chemin attendu : <code>{data.path}</code> — réglable avec
              STDERR_LOG_PATH.
            </p>
          </div>
        </div>
      )}

      {data?.success && data.exists && (
        <div className="overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
          {data.truncated && (
            <p className="border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
              Fichier volumineux : seule la fin est lue.
            </p>
          )}
          <div className="max-h-[65vh] overflow-auto p-4 font-mono text-xs leading-relaxed">
            {!data.lines.length ? (
              <p className="text-slate-500">Rien ne correspond.</p>
            ) : (
              data.lines.map((l) => (
                <div
                  key={`${l.n}-${l.content.slice(0, 24)}`}
                  className={`whitespace-pre-wrap ${LEVELS[l.level] || LEVELS.info}`}
                >
                  {l.content}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {loading && !data && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ServerOutput;
