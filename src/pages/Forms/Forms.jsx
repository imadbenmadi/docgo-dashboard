import { useCallback, useEffect, useState } from "react";
import { RichTextEditor } from "../../components/Common/RichTextEditor";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Copy,
  GripVertical,
  Inbox,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { FormsAPI, FIELD_TYPES } from "../../API/Workplace";

/**
 * Building forms, and reading what came back.
 *
 * A field's `key` is what an answer is stored under, so the builder treats it
 * as fixed once the form has responses: renaming a label is safe, renaming a
 * key orphans every answer already collected.
 */

const SITE = import.meta.env.VITE_FRONTEND_URL || "";

const blankField = (n) => ({
  key: `question_${n}`,
  label: "",
  type: "text",
  required: false,
  options: [],
});

const Forms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await FormsAPI.list();
    if (r.success) setForms(r.forms);
    else toast.error(r.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (form) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Supprimer ce formulaire ?",
      text: form.title,
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Supprimer",
    });
    if (!ok.isConfirmed) return;
    const r = await FormsAPI.remove(form.id);
    if (r.success) {
      toast.success("Supprimé");
      load();
      return;
    }

    // The server refuses once when people have answered, because closing the
    // form does everything deleting was meant to. Saying it again deletes the
    // answers too — which is the admin's call, not the server's.
    if (r.code !== "HAS_RESPONSES") {
      Swal.fire({ icon: "error", title: "Non supprimé", text: r.message });
      return;
    }

    const again = await Swal.fire({
      icon: "warning",
      title: "Supprimer aussi les réponses ?",
      text: r.message,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Tout supprimer",
      denyButtonText: "Désactiver plutôt",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#e11d48",
    });

    if (again.isDenied) {
      await toggle({ ...form, isActive: true });
      toast.success("Formulaire désactivé");
      return;
    }
    if (!again.isConfirmed) return;

    const forced = await FormsAPI.remove(form.id, { force: true });
    if (forced.success) {
      toast.success("Supprimé");
      load();
    } else {
      Swal.fire({ icon: "error", title: "Non supprimé", text: forced.message });
    }
  };

  const toggle = async (form) => {
    const r = await FormsAPI.save({ id: form.id, isActive: !form.isActive });
    if (r.success) load();
    else toast.error(r.message);
  };

  const copyLink = (form) => {
    const url = `${SITE}/forms/${form.slug}`;
    navigator.clipboard?.writeText(url);
    toast.success("Lien copié");
  };

  if (viewing) {
    return <Responses form={viewing} onBack={() => setViewing(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Formulaires</h1>
          <p className="mt-1 text-sm text-slate-600">
            Créez un formulaire, partagez son lien, lisez les réponses.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing({ fields: [blankField(1)] })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" /> Nouveau formulaire
          </button>
          <button
            onClick={load}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((f) => (
          <div
            key={f.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-slate-900">{f.title}</h2>
              <button
                onClick={() => toggle(f)}
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                  f.isActive
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-slate-200"
                }`}
              >
                {f.isActive ? "Ouvrir" : "Fermé"}
              </button>
            </div>

            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {f.description
                ? String(f.description)
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                : `${f.fields?.length || 0} questions`}
            </p>

            <p className="mt-2 font-mono text-xs text-slate-400">
              /forms/{f.slug}
            </p>

            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setViewing(f)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                <Inbox className="h-3.5 w-3.5" />
                {f.responseCount} réponse{f.responseCount === 1 ? "" : "s"}
              </button>
              <button
                onClick={() => setEditing(f)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                Modifier
              </button>
              <button
                onClick={() => copyLink(f)}
                title="Copier le lien"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => remove(f)}
                className="ml-auto rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {!forms.length && !loading && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
            Aucun formulaire.
          </div>
        )}
      </div>

      {createPortal(
        editing ? (
          <Builder
            initial={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        ) : null,
        document.body,
      )}
    </div>
  );
};

/** The builder. One question per row, and the key is fixed once answered. */
const Builder = ({ initial, onClose, onSaved }) => {
  const [form, setForm] = useState(() => {
    let fields = initial?.fields || [blankField(1)];
    if (typeof fields === "string") {
      try {
        fields = JSON.parse(fields);
      } catch (e) {
        fields = [blankField(1)];
      }
    }
    if (!Array.isArray(fields)) fields = [blankField(1)];
    return {
      title: "",
      description: "",
      audience: "everyone",
      successMessage: "",
      ...initial,
      fields,
    };
  });
  const [saving, setSaving] = useState(false);
  const locked = (initial.responseCount || 0) > 0;

  const setField = (i, patch) =>
    setForm((f) => ({
      ...f,
      fields: f.fields.map((x, n) => (n === i ? { ...x, ...patch } : x)),
    }));

  const addField = () =>
    setForm((f) => ({
      ...f,
      fields: [...f.fields, blankField(f.fields.length + 1)],
    }));

  const removeField = (i) =>
    setForm((f) => ({ ...f, fields: f.fields.filter((_, n) => n !== i) }));

  const move = (i, by) =>
    setForm((f) => {
      const next = [...f.fields];
      const j = i + by;
      if (j < 0 || j >= next.length) return f;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, fields: next };
    });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    let r = await FormsAPI.save(form);

    // The server refuses to drop a question that has answers unless told to.
    if (!r.success && r.code === "FIELDS_REMOVED") {
      const ok = await Swal.fire({
        icon: "warning",
        title: "Suppression d'une question",
        text: r.message,
        showCancelButton: true,
        confirmButtonText: "Continuer",
        confirmButtonColor: "#d97706",
      });
      if (ok.isConfirmed) {
        r = await FormsAPI.save({ ...form, confirmRemovingFields: true });
      } else {
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    if (r.success) {
      toast.success("Enregistré");
      onSaved();
    } else toast.error(r.message);
  };

  const input = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="my-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {initial.id ? "Modifier le formulaire" : "Nouveau formulaire"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Nom du formulaire"
            className={`${input} font-medium`}
          />
          <RichTextEditor
            value={form.description || ""}
            onChange={(html) => setForm((f) => ({ ...f, description: html }))}
            placeholder="Une explication pour les personnes qui remplissent le formulaire (facultatif)"
            height="140px"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">
                Who can send it
              </span>
              <select
                value={form.audience}
                onChange={(e) =>
                  setForm((f) => ({ ...f, audience: e.target.value }))
                }
                className={`mt-1 ${input}`}
              >
                <option value="everyone">Tout le monde</option>
                <option value="users">Utilisateurs connectés uniquement</option>
                <option value="guests">Invités uniquement</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">
                Say this afterwards
              </span>
              <input
                value={form.successMessage || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, successMessage: e.target.value }))
                }
                placeholder="Merci, nous avons bien reçu vos réponses."
                className={`mt-1 ${input}`}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Questions
          </p>

          {form.fields.map((field, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="flex flex-col pt-1.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="text-slate-300 hover:text-slate-600"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid flex-1 gap-2 sm:grid-cols-[1fr,10rem]">
                  <input
                    value={field.label}
                    onChange={(e) => setField(i, { label: e.target.value })}
                    placeholder="Quelle est la question ?"
                    className={input}
                  />
                  <select
                    value={field.type}
                    onChange={(e) => setField(i, { type: e.target.value })}
                    className={input}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {["select", "radio"].includes(field.type) && (
                    <input
                      value={(field.options || []).join(", ")}
                      onChange={(e) =>
                        setField(i, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Les choix, séparés par des virgules"
                      className={`${input} sm:col-span-2`}
                    />
                  )}

                  <div className="flex items-center gap-3 sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={Boolean(field.required)}
                        onChange={(e) =>
                          setField(i, { required: e.target.checked })
                        }
                      />
                      Required
                    </label>
                    <input
                      value={field.key}
                      onChange={(e) =>
                        setField(i, { key: e.target.value.replace(/\W/g, "_") })
                      }
                      disabled={
                        locked &&
                        initial.fields?.some((f) => f.key === field.key)
                      }
                      title={
                        locked
                          ? "Ce formulaire a des réponses. Renommer une clé les détacherait."
                          : "Les réponses sont enregistrées sous cette clé"
                      }
                      className="w-40 rounded-lg border border-slate-200 px-2 py-1 font-mono text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="ml-auto rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addField}
            className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:bg-slate-50"
          >
            <Plus className="mr-1 inline h-4 w-4" /> Ajouter une question
          </button>
        </div>

        {locked && (
          <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
            Ce formulaire a déjà des réponses. Les libellés peuvent être
            modifiés ; les clés des questions restent fixes, car les réponses y
            sont rattachées.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer le formulaire"}
        </button>
      </form>
    </div>
  );
};

/** What came back. One column per question, in the order they were asked. */
/** A line of text for any answer shape: list, tick, number or prose. */
const answerText = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return String(value);
};

const who = (r) =>
  r.user
    ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Utilisateur"
    : r.submitterName || "Invité";

/** The first answers, joined — enough to tell two responses apart in a list. */
const preview = (r, fields) =>
  fields
    .map((f) => r.answers?.[f.key])
    .filter((v) => v !== undefined && v !== null && v !== "")
    .map((v) => answerText(v))
    .join(" · ")
    .slice(0, 180) || "—";

const Responses = ({ form, onBack }) => {
  const [open, setOpen] = useState(null);
  const [data, setData] = useState({ responses: [], form: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FormsAPI.responses(form.id).then((r) => {
      if (r.success) setData(r);
      else toast.error(r.message);
      setLoading(false);
    });
  }, [form.id]);

  let rawFields = data.form?.fields || form.fields || [];
  if (typeof rawFields === "string") {
    try {
      rawFields = JSON.parse(rawFields);
    } catch (e) {
      rawFields = [];
    }
  }
  const fields = Array.isArray(rawFields) ? rawFields : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Tous les formulaires
      </button>

      <h1 className="text-2xl font-bold text-slate-900">{form.title}</h1>
      <p className="mb-5 mt-1 text-sm text-slate-600">
        {data.responses.length} réponse{data.responses.length === 1 ? "" : "s"}
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Qui</th>
              <th className="px-4 py-3 font-medium">Aperçu</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.responses.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 align-top">
                  <p className="text-slate-800">{who(r)}</p>
                  <p className="text-xs text-slate-500">
                    {r.user?.email || r.submitterEmail || "—"}
                  </p>
                </td>
                <td className="max-w-md px-4 py-3 align-top text-slate-700">
                  <span className="line-clamp-2">{preview(r, fields)}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-right align-top">
                  <button
                    onClick={() => setOpen(r)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Voir
                  </button>
                </td>
              </tr>
            ))}
            {!data.responses.length && !loading && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                  Aucune réponse pour l'instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 sm:p-8"
          onClick={() => setOpen(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{who(open)}</h2>
                <p className="text-sm text-slate-500">
                  {open.user?.email || open.submitterEmail || "—"} ·{" "}
                  {new Date(open.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <dl className="space-y-4">
              {/* The questions as they were asked of this person, not as the
                  form reads today. */}
              {(open.fieldsSnapshot?.length ? open.fieldsSnapshot : fields).map(
                (f) => (
                  <div key={f.key} className="border-b border-slate-100 pb-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {f.label}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
                      {answerText(open.answers?.[f.key])}
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;