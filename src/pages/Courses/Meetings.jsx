import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  CalendarClock,
  ExternalLink,
  Plus,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import apiClient from "../../utils/apiClient";

/**
 * Live meetings for a course or a programme. Whoever is enrolled sees them in
 * their space and is notified when one is scheduled; this page is where an
 * admin schedules, moves, cancels and deletes them.
 */

const EMPTY = {
  itemType: "course",
  itemId: "",
  title: "",
  description: "",
  scheduledTime: "",
  duration: 60,
  link: "",
};

const ITEM_LISTS = {
  course: "/Admin/Courses?limit=500",
  program: "/Admin/Programs?limit=500",
};

const ITEM_LABEL = { course: "Cours", program: "Programme" };

const STATE = {
  live: { label: "En direct", className: "bg-emerald-50 text-emerald-700" },
  scheduled: { label: "À venir", className: "bg-blue-50 text-blue-700" },
  ended: { label: "Terminée", className: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Annulée", className: "bg-red-50 text-red-700" },
};

const STATUS = {
  scheduled: { label: "Programmée", className: "bg-blue-50 text-blue-700" },
  ongoing: { label: "En cours", className: "bg-emerald-50 text-emerald-700" },
  completed: { label: "Terminée", className: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Annulée", className: "bg-red-50 text-red-700" },
};

const rowsIn = (data) => {
  const queue = [data];
  while (queue.length) {
    const v = queue.shift();
    if (Array.isArray(v)) {
      if (!v.length || v.every((r) => r && typeof r === "object" && "id" in r))
        return v;
    } else if (v && typeof v === "object") queue.push(...Object.values(v));
  }
  return [];
};

const when = (value) =>
  value
    ? new Date(value).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [items, setItems] = useState({ course: [], program: [] });
  const [loading, setLoading] = useState(true);
  const [itemFilter, setItemFilter] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [type, id] = itemFilter ? itemFilter.split(":") : [];
      const { data } = await apiClient.get("/Admin/Meetings", {
        params: { limit: 200, ...(id ? { itemType: type, itemId: id } : {}) },
      });
      setMeetings(data?.meetings || []);
    } catch {
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [itemFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    Promise.all(
      Object.entries(ITEM_LISTS).map(([type, url]) =>
        apiClient
          .get(url)
          .then(({ data }) => [type, rowsIn(data)])
          .catch(() => [type, []]),
      ),
    ).then((pairs) => setItems(Object.fromEntries(pairs)));
  }, []);

  const titleOf = (m) =>
    m.itemTitle ||
    items[m.itemType]?.find((r) => String(r.id) === String(m.itemId))?.Title ||
    m.itemId;

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiClient.post("/Admin/Meetings", form);
      const notified = data?.notified || 0;
      setOpen(false);
      setForm(EMPTY);
      load();
      Swal.fire({
        icon: "success",
        title: "Réunion programmée",
        text: notified
          ? `${notified} inscrit(s) ont reçu une notification.`
          : "Personne n'est encore inscrit à cet élément.",
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Impossible de programmer",
        text: err?.response?.data?.error || "Réessayez.",
      });
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (m) => {
    const { value, isConfirmed } = await Swal.fire({
      title: "Annuler la réunion ?",
      input: "text",
      inputPlaceholder: "Motif (facultatif)",
      showCancelButton: true,
      confirmButtonText: "Annuler la réunion",
      cancelButtonText: "Retour",
      confirmButtonColor: "#dc2626",
    });
    if (!isConfirmed) return;
    await apiClient.patch(`/Admin/Meetings/${m.id}/cancel`, { reason: value || null });
    load();
  };

  const remove = async (m) => {
    const { isConfirmed } = await Swal.fire({
      title: "Supprimer définitivement ?",
      text: "La réunion disparaît pour les étudiants inscrits.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Retour",
      confirmButtonColor: "#dc2626",
    });
    if (!isConfirmed) return;
    await apiClient.delete(`/Admin/Meetings/${m.id}`);
    load();
  };

  const attendees = async (m) => {
    const { data } = await apiClient.get(`/Admin/Meetings/${m.id}/attendees`);
    const list = data?.attendees || [];
    Swal.fire({
      title: `${list.length} inscrit(s) attendu(s)`,
      html: list.length
        ? `<ul style="text-align:left;max-height:50vh;overflow:auto">${list
            .map(
              (a) =>
                `<li>${[a.firstName, a.lastName].filter(Boolean).join(" ")} — ${a.email}</li>`,
            )
            .join("")}</ul>`
        : "Personne n'est encore inscrit à cet élément.",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CalendarClock className="h-6 w-6 text-blue-600" />
            Réunions en direct
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Visibles par les inscrits du cours ou du programme, qui reçoivent
            une notification.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Tout</option>
            {Object.entries(ITEM_LISTS).map(([type]) => (
              <optgroup key={type} label={ITEM_LABEL[type]}>
                {(items[type] || []).map((r) => (
                  <option key={`${type}:${r.id}`} value={`${type}:${r.id}`}>
                    {r.Title || r.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Programmer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Réunion</th>
              <th className="px-4 py-3">Rattachée à</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Durée</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  Chargement…
                </td>
              </tr>
            )}
            {!loading && !meetings.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  Aucune réunion programmée.
                </td>
              </tr>
            )}
            {meetings.map((m) => {
              const s = STATE[m.state] || STATUS[m.status] || STATUS.scheduled;
              return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{m.title || "Sans titre"}</p>
                    {m.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{m.description}</p>
                    )}
                    {m.link && (
                      <a
                        href={m.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ouvrir le lien
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <span className="mr-2 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                      {ITEM_LABEL[m.itemType] || m.itemType}
                    </span>
                    {titleOf(m)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{when(m.scheduledTime)}</td>
                  <td className="px-4 py-3 text-gray-700">{m.duration} min</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.className}`}
                    >
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => attendees(m)}
                        title="Participants attendus"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      {m.status !== "cancelled" && (
                        <button
                          onClick={() => cancel(m)}
                          title="Annuler"
                          className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => remove(m)}
                        title="Supprimer"
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={create}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-gray-900">Programmer une réunion</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Type
                <select
                  value={form.itemType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, itemType: e.target.value, itemId: "" }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                >
                  {Object.entries(ITEM_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">
                {ITEM_LABEL[form.itemType]}
                <select
                  required
                  value={form.itemId}
                  onChange={(e) => setForm((f) => ({ ...f, itemId: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Choisir…</option>
                  {(items[form.itemType] || []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.Title || r.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Titre
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Description
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Date et heure
                <input
                  type="datetime-local"
                  required
                  value={form.scheduledTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledTime: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Durée (minutes)
                <input
                  type="number"
                  min={5}
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Lien (Google Meet, Zoom…)
              <input
                type="url"
                required
                placeholder="https://meet.google.com/…"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "…" : "Programmer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Meetings;
