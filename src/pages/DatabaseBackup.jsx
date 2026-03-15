import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import databaseBackupAPI from "../API/DatabaseBackup";

const CONFIRM_PHRASE = "BACKUP NOW";

function maskHost(host) {
  const raw = String(host || "").trim();
  if (!raw) return "—";
  if (raw.length <= 6) return "***";
  return `${raw.slice(0, 2)}***${raw.slice(-2)}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms) {
  const value = Number(ms || 0);
  if (!value) return "—";
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(2)} s`;
}

export default function DatabaseBackup() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [lastBackup, setLastBackup] = useState(null);

  const [confirmText, setConfirmText] = useState("");
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [showSensitiveDetails, setShowSensitiveDetails] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await databaseBackupAPI.getStatus();
      setStatus(res?.data?.status || null);
      setLastBackup(res?.data?.lastBackup || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Impossible de charger le statut de sauvegarde",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const canRunBackup = useMemo(() => {
    return (
      riskAccepted &&
      String(confirmText || "")
        .trim()
        .toUpperCase() === CONFIRM_PHRASE &&
      !running
    );
  }, [riskAccepted, confirmText, running]);

  const handleRunBackup = async () => {
    if (!canRunBackup) {
      toast.error(
        `Action bloquee: cochez la case et tapez exactement ${CONFIRM_PHRASE}`,
      );
      return;
    }

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Operation sensible",
      html: `
        <div style="text-align:left">
          <p><strong>Cette action va lancer une copie complete de la base de donnees.</strong></p>
          <p style="margin-top:8px">Ne lancez pas plusieurs sauvegardes en meme temps.</p>
          <p style="margin-top:8px">Continuez uniquement si vous etes autorise.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Lancer la sauvegarde",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#b91c1c",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setRunning(true);
      const res = await databaseBackupAPI.runBackup();
      const summary = res?.data || null;
      setLastBackup(summary);

      toast.success("Sauvegarde terminee avec succes");
      await fetchStatus();

      setConfirmText("");
      setRiskAccepted(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Echec de la sauvegarde");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <section className="relative overflow-hidden rounded-2xl border border-red-300 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-200/40 blur-2xl" />
        <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center rounded-full border border-red-300 bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
            Zone critique
          </p>
          <h2 className="mt-3 text-2xl font-bold text-red-900">
            Gestion de sauvegarde base de donnees
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-red-800">
            Cette page manipule des donnees sensibles. L acces doit etre reserve
            aux administrateurs autorises. Ne partagez jamais les details
            internes de la base.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Database className="h-4 w-4" />
            <p className="text-sm font-semibold">Base source</p>
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {status?.source?.database || status?.sourceDatabase || "—"}
          </p>
          <p className="text-xs text-gray-500">
            Host: {maskHost(status?.source?.host)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-sm font-semibold">Base backup</p>
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {status?.backup?.database || status?.backupDatabase || "—"}
          </p>
          <p className="text-xs text-gray-500">
            Host: {maskHost(status?.backup?.host)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock3 className="h-4 w-4" />
            <p className="text-sm font-semibold">Derniere sauvegarde</p>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {formatDate(lastBackup?.finishedAt)}
          </p>
          <p className="text-xs text-gray-500">
            Duree: {formatDuration(lastBackup?.durationMs)}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Execution manuelle
            </h3>
          </div>

          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading || running}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Lancez la sauvegarde uniquement pendant une plage de faible trafic.
          Evitez les executions concurrentes.
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="inline-flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 md:col-span-2">
            <input
              type="checkbox"
              checked={riskAccepted}
              onChange={(e) => setRiskAccepted(e.target.checked)}
              className="mt-1"
            />
            <span>
              Je confirme etre autorise et comprendre que cette action manipule
              des informations sensibles.
            </span>
          </label>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tapez exactement: {CONFIRM_PHRASE}
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              autoComplete="off"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="button"
            onClick={handleRunBackup}
            disabled={!canRunBackup || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde en
                cours...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" /> Lancer la sauvegarde
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            {status?.ok ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Configuration backup valide.
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Configuration incomplete.
              </>
            )}
          </div>
        </div>

        {!status?.ok &&
        Array.isArray(status?.missing) &&
        status.missing.length > 0 ? (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-800">
              Variables manquantes
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
              {status.missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Resume de la derniere execution
          </h3>
          <button
            type="button"
            onClick={() => setShowSensitiveDetails((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {showSensitiveDetails ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showSensitiveDetails
              ? "Masquer details sensibles"
              : "Afficher details sensibles"}
          </button>
        </div>

        {!lastBackup ? (
          <p className="text-sm text-gray-500">
            Aucune sauvegarde enregistree pour le moment.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Base source</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {lastBackup.sourceDatabase || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Base backup</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {lastBackup.backupDatabase || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Tables copiees</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {lastBackup.tableCount ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-3">
              <p className="text-xs text-gray-500">Fin d&apos;execution</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatDate(lastBackup.finishedAt)}
              </p>
            </div>

            {showSensitiveDetails ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 md:col-span-3">
                <p className="text-sm font-semibold text-red-900">
                  Details sensibles
                </p>
                <pre className="mt-2 overflow-x-auto rounded bg-white p-3 text-xs text-gray-700">
                  {JSON.stringify(lastBackup, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
