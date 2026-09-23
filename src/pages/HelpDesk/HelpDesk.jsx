/**
 * IT tickets: internal work between admins.
 *
 * A ticket is a title, a description, a priority, an optional deadline and
 * any screenshots that explain it. The list is ordered by hand - flagged
 * tickets first, then the order set with the arrows - and each row carries
 * the actions that move work along: assign, start, resolve.
 */
import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flag,
  Loader2,
  Paperclip,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { HelpDeskAPI } from "../../API/Workplace";
import { RichTextEditor } from "../../components/Common/RichTextEditor";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";

const PRIORITY = {
  urgent: { label: "Urgente", cls: "bg-red-100 text-red-700" },
  high: { label: "Haute", cls: "bg-orange-100 text-orange-700" },
  medium: { label: "Moyenne", cls: "bg-blue-100 text-blue-700" },
  low: { label: "Basse", cls: "bg-slate-100 text-slate-600" },
};

const STATUS = {
  unread: { label: "Nouveau", cls: "bg-amber-100 text-amber-800" },
  read: { label: "À faire", cls: "bg-amber-100 text-amber-800" },
  in_progress: { label: "En cours", cls: "bg-violet-100 text-violet-700" },
  responded: { label: "En cours", cls: "bg-violet-100 text-violet-700" },
  resolved: { label: "Résolu", cls: "bg-emerald-100 text-emerald-700" },
};

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

const toLocalInput = (d) => (d ? new Date(d).toISOString().slice(0, 16) : "");

/** An attached image, loaded with the admin session. */
const Attachment = ({ file, onRemove }) => {
  const [src, setSrc] = useState(null);
  const isImage = String(file.mimeType || "").startsWith("image/");

  useEffect(() => {
    let url = null;
    let cancelled = false;
    HelpDeskAPI.attachmentUrl(file)
      .then((u) => {
        url = u;
        if (!cancelled) setSrc(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      {isImage && src ? (
        <a href={src} target="_blank" rel="noreferrer">
          <img src={src} alt={file.name || ""} className="h-24 w-32 object-cover" />
        </a>
      ) : (
        <a
          href={src || "#"}
          download={file.name || "fichier"}
          className="flex h-24 w-32 items-center justify-center p-2 text-center text-xs text-slate-600"
        >
          {file.name || "Fichier"}
        </a>
      )}
      <button
        type="button"
        onClick={onRemove}
        title="Retirer"
        className="absolute right-1 top-1 hidden rounded bg-white/90 p-1 text-red-600 shadow group-hover:block"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

Attachment.propTypes = {
  file: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
};

const NewTicket = ({ admins, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    kind: "bug",
    priority: "medium",
    assignedTo: "",
    dueAt: "",
    messageHtml: "",
    flagged: false,
  });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) return toast.error("Donnez un titre au ticket");
    setSaving(true);
    const text = form.messageHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const r = await HelpDeskAPI.create({
      ...form,
      message: text,
      assignedTo: form.assignedTo || null,
      dueAt: form.dueAt || null,
    });
    if (r.success && files.length) {
      const up = await HelpDeskAPI.attach(r.ticket.id, files);
      if (!up.success) toast.error(up.message);
    }
    setSaving(false);
    if (!r.success) return toast.error(r.message);
    toast.success("Ticket créé");
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl overflow-x-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Nouveau ticket</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            className={`${input} font-medium`}
            placeholder="Titre"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <select className={input} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="bug">Bug</option>
              <option value="support">Demande</option>
            </select>
            <select className={input} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {Object.entries(PRIORITY).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select className={input} value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Non assigné</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>{a.name || a.email}</option>
              ))}
            </select>
            <input type="datetime-local" className={input} value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
          </div>
          <RichTextEditor
            value={form.messageHtml}
            onChange={(html) => setForm((f) => ({ ...f, messageHtml: html }))}
            placeholder="Ce qui se passe, et comment le reproduire"
            height="180px"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              <Paperclip className="h-4 w-4" /> Pièces jointes
              <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => setFiles([...e.target.files])} />
            </label>
            {files.length > 0 && <span className="text-sm text-slate-500">{files.length} fichier(s)</span>}
            <label className="ml-auto inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.flagged} onChange={(e) => setForm({ ...form, flagged: e.target.checked })} />
              Signaler comme important
            </label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Créer
          </button>
        </div>
      </div>
    </div>
  );
};

NewTicket.propTypes = {
  admins: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

/**
 * The same board serves two queues of the same table: the team's own tickets,
 * and what visitors wrote in. Only the first can be added to from here —
 * a user's message is answered, not raised.
 */
const HelpDesk = ({
  origin = "internal",
  heading = "Tickets IT",
  subtitle = "Le travail interne de l'équipe.",
}) => {
  const [tickets, setTickets] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [priority, setPriority] = useState("");
  const [open, setOpen] = useState(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await HelpDeskAPI.list({
      origin,
      sort: "manual",
      limit: 200,
      priority,
      status: filter === "resolved" ? "resolved" : undefined,
    });
    if (r.success) {
      const rows = filter === "open" ? r.tickets.filter((t) => t.status !== "resolved") : r.tickets;
      setTickets(filter === "flagged" ? rows.filter((t) => t.flagged) : rows);
    } else {
      toast.error(r.message);
    }
    setLoading(false);
  }, [filter, priority, origin]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    HelpDeskAPI.assignees().then((r) => r.success && setAdmins(r.admins));
  }, []);

  const act = async (id, fn, done) => {
    setBusy(id);
    const r = await fn();
    setBusy(null);
    if (!r.success) return toast.error(r.message);
    if (done) toast.success(done);
    load();
  };

  const patch = (t, body, done) => act(t.id, () => HelpDeskAPI.update(t.id, body), done);

  const editDeadline = async (t) => {
    const { value, isConfirmed } = await Swal.fire({
      title: "Échéance",
      input: "datetime-local",
      inputValue: toLocalInput(t.dueAt),
      showCancelButton: true,
      confirmButtonText: "Enregistrer",
      showDenyButton: Boolean(t.dueAt),
      denyButtonText: "Retirer",
    });
    if (isConfirmed) patch(t, { dueAt: value || null }, "Échéance enregistrée");
    else if (value === false) patch(t, { dueAt: null }, "Échéance retirée");
  };

  const counts = {
    open: tickets.filter((t) => t.status !== "resolved").length,
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{heading}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {origin === "internal" && (
          <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Nouveau ticket
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          ["open", "Ouverts"],
          ["flagged", "Signalés"],
          ["resolved", "Résolus"],
          ["all", "Tous"],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1.5 text-sm ${filter === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
          >
            {label}
            {k === "open" && filter === "open" ? ` ${counts.open}` : ""}
          </button>
        ))}
        <select className="ml-auto rounded-lg border border-slate-300 px-2 py-1.5 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITY).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">Aucun ticket ici.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map((t, i) => {
              const expanded = open === t.id;
              const status = STATUS[t.status] || STATUS.read;
              const pri = PRIORITY[t.priority] || PRIORITY.medium;
              return (
                <li key={t.id} className={t.flagged ? "bg-red-50/40" : ""}>
                  <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                    <div className="flex flex-col">
                      <button type="button" title="Monter" disabled={i === 0 || busy === t.id} onClick={() => act(t.id, () => HelpDeskAPI.move(t.id, "up"))} className="rounded p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" title="Descendre" disabled={i === tickets.length - 1 || busy === t.id} onClick={() => act(t.id, () => HelpDeskAPI.move(t.id, "down"))} className="rounded p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-30">
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button type="button" title={t.flagged ? "Retirer le signalement" : "Signaler"} onClick={() => patch(t, { flagged: !t.flagged })} className={`rounded p-1 ${t.flagged ? "text-red-600" : "text-slate-300 hover:text-slate-600"}`}>
                      <Flag className="h-4 w-4" fill={t.flagged ? "currentColor" : "none"} />
                    </button>
                    <button type="button" onClick={() => setOpen(expanded ? null : t.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                      {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                      <span className="truncate font-medium text-slate-900">{t.subject && t.subject !== "dashboard" ? t.subject : t.body || "Sans titre"}</span>
                      {t.attachments?.length > 0 && <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    </button>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pri.cls}`}>{pri.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>{status.label}</span>
                    <button type="button" onClick={() => editDeadline(t)} className={`rounded px-2 py-0.5 text-xs ${t.isOverdue ? "bg-red-100 text-red-700" : "text-slate-500 hover:bg-slate-100"}`}>
                      {t.dueAt ? new Date(t.dueAt).toLocaleDateString("fr-FR") : "Échéance"}
                    </button>
                    <select value={t.assignedTo || ""} onChange={(e) => patch(t, { assignedTo: e.target.value || null }, "Assigné")} className="max-w-[10rem] rounded-lg border border-slate-200 px-2 py-1 text-xs">
                      <option value="">Non assigné</option>
                      {admins.map((a) => (
                        <option key={a.id} value={a.id}>{a.name || a.email}</option>
                      ))}
                    </select>
                    {t.status === "resolved" ? (
                      <button type="button" onClick={() => patch(t, { status: "read" }, "Ticket rouvert")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">
                        <RotateCcw className="h-3.5 w-3.5" /> Rouvrir
                      </button>
                    ) : (
                      <>
                        {t.status !== "in_progress" && (
                          <button type="button" onClick={() => patch(t, { status: "in_progress" }, "Ticket démarré")} className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-xs text-violet-700 hover:bg-violet-100">
                            <Play className="h-3.5 w-3.5" /> Démarrer
                          </button>
                        )}
                        <button type="button" onClick={() => patch(t, { status: "resolved" }, "Ticket résolu")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Résoudre
                        </button>
                      </>
                    )}
                  </div>

                  {expanded && (
                    <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-10 py-4">
                      {t.bodyHtml ? (
                        <RichTextDisplay content={t.bodyHtml} textClassName="text-sm text-slate-700" />
                      ) : (
                        t.body && <p className="whitespace-pre-wrap text-sm text-slate-700">{t.body}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {(t.attachments || []).map((f) => (
                          <Attachment
                            key={f.id}
                            file={f}
                            onRemove={() => act(t.id, () => HelpDeskAPI.removeAttachment(f.id), "Pièce jointe retirée")}
                          />
                        ))}
                        {t.screenshot && (
                          <a href={t.screenshot} target="_blank" rel="noreferrer" className="flex h-24 w-32 items-center justify-center rounded-lg border border-slate-200 text-xs text-blue-600">
                            Capture d&apos;écran
                          </a>
                        )}
                        <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-blue-400">
                          <Paperclip className="h-4 w-4" /> Ajouter
                          <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const files = [...e.target.files];
                              e.target.value = "";
                              if (files.length) act(t.id, () => HelpDeskAPI.attach(t.id, files), "Pièce jointe ajoutée");
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-400">
                        Créé par {t.reporter?.name || t.reporter?.email || "—"} le {new Date(t.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {creating && (
        <NewTicket
          admins={admins}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
};

HelpDesk.propTypes = {
  origin: PropTypes.oneOf(["internal", "users", "all"]),
  heading: PropTypes.string,
  subtitle: PropTypes.string,
};

export default HelpDesk;
