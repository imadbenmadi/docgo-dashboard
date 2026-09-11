import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bug, LifeBuoy, RefreshCw, UserPlus, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { HelpDeskAPI } from "../../API/Workplace";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";

/**
 * IT tickets and bug reports.
 *
 * These are messages, not a separate system: a ticket is a contact message
 * whose subject type is 'support' or 'bug', threaded by the same replies as
 * everything else. What this screen adds is the screenshot, who is dealing
 * with it, and a queue that puts anything nobody has picked up at the top.
 */

const KIND = {
  support: { label: "Support", Icon: LifeBuoy, style: "bg-sky-50 text-sky-700 ring-sky-200" },
  bug: { label: "Bug", Icon: Bug, style: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const STATUS_STYLE = {
  unread: "bg-amber-50 text-amber-800 ring-amber-200",
  read: "bg-sky-50 text-sky-800 ring-sky-200",
  responded: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

const PRIORITY_STYLE = {
  low: "text-slate-400",
  medium: "text-slate-600",
  high: "text-amber-600",
  urgent: "text-rose-600 font-semibold",
};

const when = (d) =>
  d
    ? new Date(d).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const HelpDesk = () => {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({});
  const [unassigned, setUnassigned] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [filters, setFilters] = useState({ kind: "", status: "", assignedTo: "" });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await HelpDeskAPI.list(filters);
    if (r.success) {
      setTickets(r.tickets);
      setCounts(r.countsByStatus);
      setUnassigned(r.unassigned);
    } else toast.error(r.message);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    HelpDeskAPI.assignees().then((r) => r.success && setAdmins(r.admins));
  }, []);

  const openTicket = async (id) => {
    setOpen({ loading: true });
    const r = await HelpDeskAPI.one(id);
    if (r.success) setOpen(r.data);
    else {
      toast.error(r.message);
      setOpen(null);
    }
  };

  const patch = async (id, body) => {
    const r = await HelpDeskAPI.update(id, body);
    if (r.success) {
      toast.success("Mis à jour");
      load();
      if (open?.ticket?.id === id) openTicket(id);
    } else toast.error(r.message);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support technique</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tickets et signalements de bugs. Ce que personne n'a pris en charge apparaît en premier.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-700">
            Nobody has picked up
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900">
            {unassigned}
          </p>
        </div>
        {["unread", "read", "resolved"].map((s) => (
          <div key={s} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{s}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{counts[s] || 0}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["kind", ["", "support", "bug"], "Tous les types"],
          ["status", ["", "unread", "read", "responded", "resolved"], "Tous les statuts"],
        ].map(([key, options, blank]) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm capitalize"
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o || blank}
              </option>
            ))}
          </select>
        ))}
        <select
          value={filters.assignedTo}
          onChange={(e) =>
            setFilters((f) => ({ ...f, assignedTo: e.target.value }))
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tout le monde</option>
          <option value="nobody">Personne</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name || a.email}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => {
              const kind = KIND[t.kind] || KIND.support;
              return (
                <tr
                  key={t.id}
                  onClick={() => openTicket(t.id)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="w-24 px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${kind.style}`}
                    >
                      <kind.Icon className="h-3 w-3" />
                      {kind.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {t.subject || "(sans objet)"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.reporter.name || t.reporter.email || "Anonyme"}
                    </p>
                  </td>
                  <td className={`px-4 py-3 text-xs capitalize ${PRIORITY_STYLE[t.priority] || ""}`}>
                    {t.priority}
                  </td>
                  <td className="px-4 py-3">
                    {t.assignee ? (
                      <span className="text-xs text-slate-600">
                        {t.assignee.name || t.assignee.email}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <UserPlus className="h-3 w-3" /> nobody
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${STATUS_STYLE[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {when(t.createdAt)}
                  </td>
                </tr>
              );
            })}
            {!tickets.length && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  Aucun ticket. Une demande d'assistance ou un signalement envoyé depuis le site arrive ici.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {createPortal(
        open ? (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4"
            onClick={() => setOpen(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="my-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
            >
              {open.loading ? (
                <div className="flex h-40 items-center justify-center text-slate-400">
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Chargement
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {open.ticket.subject || "(sans objet)"}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {open.ticket.reporter.name}{" "}
                        <span className="text-slate-400">
                          {open.ticket.reporter.email}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setOpen(null)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <select
                      value={open.ticket.assignedTo || ""}
                      onChange={(e) =>
                        patch(open.ticket.id, { assignedTo: e.target.value })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    >
                      <option value="">Personne ne l'a pris en charge</option>
                      {admins.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name || a.email}
                        </option>
                      ))}
                    </select>
                    <select
                      value={open.ticket.priority || "medium"}
                      onChange={(e) =>
                        patch(open.ticket.id, { priority: e.target.value })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm capitalize"
                    >
                      {["low", "medium", "high", "urgent"].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <select
                      value={open.ticket.status}
                      onChange={(e) =>
                        patch(open.ticket.id, { status: e.target.value })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm capitalize"
                    >
                      {["unread", "read", "responded", "resolved"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-800">
                    {open.ticket.bodyHtml ? (
                      <RichTextDisplay content={open.ticket.bodyHtml} />
                    ) : (
                      <p className="whitespace-pre-wrap">{open.ticket.body}</p>
                    )}
                  </div>

                  {open.ticket.screenshot && (
                    <a
                      href={open.ticket.screenshot}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block"
                    >
                      <img
                        src={open.ticket.screenshot}
                        alt="Capture d'écran"
                        className="max-h-80 w-full rounded-lg border border-slate-200 object-contain"
                      />
                    </a>
                  )}

                  {open.ticket.kind === "bug" && open.ticket.userAgent && (
                    <p className="mt-3 rounded-lg bg-slate-50 p-2.5 font-mono text-xs text-slate-500">
                      {open.ticket.userAgent}
                    </p>
                  )}

                  {open.replies?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {open.replies.length} repl
                        {open.replies.length === 1 ? "y" : "ies"}
                      </p>
                      {open.replies.map((r) => (
                        <div
                          key={r.id}
                          className={`rounded-lg p-3 text-sm ${
                            r.authorType === "admin"
                              ? "bg-sky-50 text-sky-900"
                              : "bg-slate-50 text-slate-800"
                          }`}
                        >
                          <p className="mb-1 text-xs opacity-60">
                            {r.authorName} · {when(r.createdAt)}
                          </p>
                          {r.bodyHtml ? (
                            <RichTextDisplay content={r.bodyHtml} />
                          ) : (
                            <p className="whitespace-pre-wrap">{r.body}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    Les réponses passent par le même fil que les autres messages, sur l'écran Messages — il n'y a qu'un seul système de conversation.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : null,
        document.body,
      )}
    </div>
  );
};

export default HelpDesk;
