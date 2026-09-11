import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Crown,
  Eye,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { HRAPI, DEPARTMENTS, CONTRACTS } from "../../API/Workplace";

/**
 * HR: the people who work here, and what each dashboard login may open.
 *
 * Two tabs because they are two different things. An employee is a person; an
 * admin is a login. A bookkeeper has a record here and no login; a shared
 * support account is a login with nobody behind it.
 */

const money = (n) =>
  n === null || n === undefined || n === ""
    ? "—"
    : `${Number(n).toLocaleString("fr-FR")} DZD`;

const STATUS_STYLE = {
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  on_leave: "bg-amber-50 text-amber-800 ring-amber-200",
  left: "bg-slate-100 text-slate-600 ring-slate-200",
};

const title = (s) => String(s || "").replace(/_/g, " ");

const HR = () => {
  const [tab, setTab] = useState("people");
  const [data, setData] = useState({ employees: [], counts: {}, monthlyPayroll: 0 });
  const [access, setAccess] = useState({ admins: [], areas: [], configured: false });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [e, a] = await Promise.all([HRAPI.employees(), HRAPI.adminAccess()]);
    if (e.success) setData(e);
    else toast.error(e.message);
    if (a.success) setAccess(a);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeEmployee = async (emp) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Supprimer cette fiche ?",
      html: `<p class="text-sm text-slate-600">${emp.firstName} ${emp.lastName}</p>`,
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      confirmButtonColor: "#e11d48",
      footer:
        "<span class='text-xs text-slate-500'>Uniquement pour une fiche saisie par erreur. Pour un départ, mettez le statut sur « parti » : la personne reste ainsi dans la paie de l'an dernier.</span>",
    });
    if (!ok.isConfirmed) return;
    const r = await HRAPI.removeEmployee(emp.id);
    if (r.success) {
      toast.success("Supprimé");
      load();
    } else toast.error(r.message);
  };

  const togglePermission = async (admin, area, level) => {
    const next = { ...admin.permissions };
    if (level === "none") delete next[area];
    else next[area] = level;

    const r = await HRAPI.setPermissions(admin.id, next);
    if (r.success) {
      toast.success(r.message);
      load();
    } else toast.error(r.message);
  };

  const toggleOwner = async (admin) => {
    const r = await HRAPI.setOwner(admin.id, !admin.isOwner);
    if (r.success) {
      toast.success(r.message);
      load();
    } else {
      toast.error(r.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">RH</h1>
          <p className="mt-1 text-sm text-slate-600">
            Les personnes qui travaillent ici, et ce que chaque compte peut ouvrir.
          </p>
        </div>
        <div className="flex gap-2">
          {tab === "people" && (
            <button
              onClick={() => setEditing({})}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" /> Ajouter une personne
            </button>
          )}
          <button
            onClick={load}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <div className="mb-5 flex gap-2">
        {[
          ["people", `People (${data.employees.length})`],
          ["access", `Who can open what (${access.admins.length})`],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === k
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "people" && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Masse salariale mensuelle
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {money(data.monthlyPayroll)}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Personnes encore présentes — un départ sort du total mais reste dans la liste.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Présents</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {data.counts.active || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                En congé / parti
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {(data.counts.on_leave || 0) + (data.counts.left || 0)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nom</th>
                    <th className="px-4 py-3 font-medium">Poste</th>
                    <th className="px-4 py-3 font-medium">Contrat</th>
                    <th className="px-4 py-3 font-medium">Salaire</th>
                    <th className="px-4 py-3 font-medium">Depuis</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.employees.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {e.firstName} {e.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{e.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{e.jobTitle || "—"}</p>
                        <p className="text-xs capitalize text-slate-400">
                          {title(e.department)}
                        </p>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">
                        {title(e.contractType)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700">
                        {money(e.monthlySalary)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {e.hiredAt || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${STATUS_STYLE[e.status]}`}
                        >
                          {title(e.status)}
                        </span>
                        {e.leftAt && (
                          <p className="mt-0.5 text-xs text-slate-400">{e.leftAt}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditing(e)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeEmployee(e)}
                            className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data.employees.length && !loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-400"
                      >
                        Aucune personne enregistrée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "access" && (
        <div className="space-y-4">
          {!access.configured && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <b>Personne n'a encore de droits restreints : tous les administrateurs peuvent tout ouvrir.</b> Cela cesse dès que vous accordez le premier droit ci-dessous : à partir de là, aucune case cochée signifie aucun accès.
            </div>
          )}

          {access.admins.map((admin) => (
            <section
              key={admin.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-800">
                    {admin.name || admin.email}
                  </p>
                  {admin.name && (
                    <p className="text-xs text-slate-500">{admin.email}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleOwner(admin)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    admin.isOwner
                      ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                      : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Crown className="h-3.5 w-3.5" />
                  {admin.isOwner ? "Owner" : "Nommer propriétaire"}
                </button>
              </header>

              {admin.isOwner ? (
                <p className="flex items-center gap-2 px-4 py-4 text-sm text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  Un propriétaire accède à tout. C'est ce qui empêche cet écran de verrouiller le dernier administrateur hors de lui-même.
                </p>
              ) : (
                <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
                  {access.areas.map((area) => {
                    const level = admin.permissions[area.key];
                    return (
                      <div
                        key={area.key}
                        className="flex items-center justify-between gap-2 bg-white px-4 py-2.5"
                      >
                        <span className="flex items-center gap-1.5 text-sm text-slate-700">
                          {area.sensitive && (
                            <Lock className="h-3 w-3 text-amber-500" />
                          )}
                          {area.label}
                        </span>
                        <div className="flex gap-1">
                          {[
                            ["none", "—"],
                            ["view", <Eye key="v" className="h-3 w-3" />],
                            ["manage", <Pencil key="m" className="h-3 w-3" />],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              title={value}
                              onClick={() =>
                                togglePermission(admin, area.key, value)
                              }
                              className={`grid h-6 w-7 place-items-center rounded text-xs ${
                                (level || "none") === value
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

          <p className="text-xs text-slate-500">
            <Lock className="mr-1 inline h-3 w-3 text-amber-500" />
            signale les sections confidentielles, et pas seulement destructrices — la finance montre ce que gagne l'entreprise, les RH ce que gagnent les gens. Un administrateur ayant tout le reste n'y accède pas sans votre accord.
          </p>
        </div>
      )}

      {createPortal(
        editing ? (
          <EmployeeForm
            employee={editing}
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

const EmployeeForm = ({ employee, onClose, onSaved }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    jobTitle: "",
    department: "other",
    contractType: "full_time",
    monthlySalary: "",
    hiredAt: "",
    status: "active",
    ...employee,
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Le prénom et le nom sont obligatoires");
      return;
    }
    setSaving(true);
    const r = await HRAPI.saveEmployee(form);
    setSaving(false);
    if (r.success) {
      toast.success("Enregistré");
      onSaved();
    } else toast.error(r.message);
  };

  const Field = ({ label, children }) => (
    <label className="block">
      <span className="text-xs font-medium uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );

  const input =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="my-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {employee?.id ? "Modifier" : "Ajouter une personne"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom">
            <input value={form.firstName} onChange={set("firstName")} className={input} />
          </Field>
          <Field label="Nom">
            <input value={form.lastName} onChange={set("lastName")} className={input} />
          </Field>
          <Field label="E-mail">
            <input type="email" value={form.email || ""} onChange={set("email")} className={input} />
          </Field>
          <Field label="Téléphone">
            <input value={form.phoneNumber || ""} onChange={set("phoneNumber")} className={input} />
          </Field>
          <Field label="Intitulé du poste">
            <input value={form.jobTitle || ""} onChange={set("jobTitle")} className={input} />
          </Field>
          <Field label="Service">
            <select value={form.department} onChange={set("department")} className={input}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {title(d)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Contrat">
            <select value={form.contractType} onChange={set("contractType")} className={input}>
              {CONTRACTS.map((c) => (
                <option key={c} value={c}>
                  {title(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Salaire mensuel (DZD)">
            <input
              type="number"
              min="0"
              value={form.monthlySalary ?? ""}
              onChange={set("monthlySalary")}
              className={`${input} tabular-nums`}
              placeholder="Laisser vide si non mensuel"
            />
          </Field>
          <Field label="Arrivée">
            <input type="date" value={form.hiredAt || ""} onChange={set("hiredAt")} className={input} />
          </Field>
          <Field label="Statut">
            <select value={form.status} onChange={set("status")} className={input}>
              <option value="active">Active</option>
              <option value="on_leave">En congé</option>
              <option value="left">Left</option>
            </select>
          </Field>
        </div>

        {form.status === "left" && (
          <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
            They stay on the list and come off the payroll total. Today&apos;s
            date is recorded as their last day unless one is already set.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
};

export default HR;
