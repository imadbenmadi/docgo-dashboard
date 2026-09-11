import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Gift,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import FinanceAPI, { EXPENSE_CATEGORIES } from "../../API/Finance";

/**
 * What came in, what went out, and what is left.
 *
 * Income is never typed in here. An approved order is a payment received, so
 * every figure on this page is read back from the orders table - the only
 * thing a person enters is an expense, because outgoings are the half the
 * platform had no record of.
 */

const money = (n) =>
  `${Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} DZD`;

const TYPE_LABEL = {
  course: "Cours",
  program: "Programmes",
  cv: "Services CV",
  internship: "Stages",
};

const thisYear = new Date().getFullYear();

const Card = ({ tone = "slate", icon: Icon, label, value, note }) => {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    slate: "border-slate-200 bg-white text-slate-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide opacity-70">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {note && <p className="mt-0.5 text-xs opacity-60">{note}</p>}
    </div>
  );
};

/** The twelve-month bars. Drawn from the same numbers as the cards. */
const MonthlyChart = ({ months }) => {
  const peak = Math.max(
    1,
    ...months.map((m) => Math.max(m.income, m.expenses + m.refunds)),
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[36rem] items-end gap-2" style={{ height: 180 }}>
        {months.map((m) => {
          const out = m.expenses + m.refunds;
          return (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="flex w-full items-end justify-center gap-0.5"
                style={{ height: 150 }}
                title={`${m.label}: in ${money(m.income)}, out ${money(out)}`}
              >
                <div
                  className="w-1/2 rounded-t bg-emerald-500"
                  style={{ height: `${(m.income / peak) * 100}%` }}
                />
                <div
                  className="w-1/2 rounded-t bg-rose-400"
                  style={{ height: `${(out / peak) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500">{m.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /> entrées
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-400" /> sorties
        </span>
      </div>
    </div>
  );
};

const Finance = () => {
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(thisYear);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, m, t] = await Promise.all([
      FinanceAPI.summary({ from: `${year}-01-01`, to: `${year}-12-31` }),
      FinanceAPI.monthly(year),
      FinanceAPI.transactions({ from: `${year}-01-01`, to: `${year}-12-31` }),
    ]);
    if (s.success) setSummary(s);
    else toast.error(s.message);
    if (m.success) setReport(m);
    if (t.success) setRows(t.rows);
    setLoading(false);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const removeExpense = async (row) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Supprimer cette dépense ?",
      text: row.label,
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Supprimer",
      footer:
        "<span class='text-xs text-slate-500'>Seule une dépense peut être supprimée. Une commande atteste qu'un paiement réel est arrivé : elle reste.</span>",
    });
    if (!ok.isConfirmed) return;
    const r = await FinanceAPI.deleteExpense(row.id);
    if (r.success) {
      toast.success("Supprimé");
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
          <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
          <p className="mt-1 text-sm text-slate-600">
            Les revenus sont lus depuis les commandes — ils ne se saisissent jamais. Seules les dépenses sont saisies ici.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {[thisYear, thisYear - 1, thisYear - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" /> Enregistrer une dépense
          </button>
          <button
            onClick={load}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {summary && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              tone="emerald"
              icon={ArrowUpRight}
              label="Encaissé"
              value={money(summary.income.total)}
              note={`${summary.income.orders} paid orders`}
            />
            <Card
              tone="rose"
              icon={ArrowDownRight}
              label="Décaissé"
              value={money(summary.expenses.total + summary.refunds.total)}
              note={`${money(summary.refunds.total)} of it refunds`}
            />
            <Card
              tone={summary.net >= 0 ? "slate" : "rose"}
              label="Net"
              value={money(summary.net)}
              note="encaissé, moins remboursements et dépenses"
            />
            <Card
              tone="amber"
              icon={Clock}
              label="Restant dû"
              value={money(summary.outstanding.total)}
              note={`${summary.outstanding.count} orders awaiting payment`}
            />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <section className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                {year}, month by month
              </h2>
              {report && <MonthlyChart months={report.months} />}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                D'où vient l'argent
              </h2>
              <ul className="space-y-2 text-sm">
                {summary.income.byProduct.map((p) => (
                  <li key={p.itemType} className="flex justify-between gap-3">
                    <span className="text-slate-600">
                      {TYPE_LABEL[p.itemType] || p.itemType}
                      <span className="ml-1.5 text-xs text-slate-400">
                        {p.orders}
                      </span>
                    </span>
                    <span className="tabular-nums text-slate-900">
                      {money(p.total)}
                    </span>
                  </li>
                ))}
                {!summary.income.byProduct.length && (
                  <li className="text-slate-400">Rien pour l'instant.</li>
                )}
              </ul>

              <h2 className="mb-3 mt-5 text-sm font-semibold text-slate-700">
                Où il est parti
              </h2>
              <ul className="space-y-2 text-sm">
                {summary.expenses.byCategory.map((c) => (
                  <li key={c.category} className="flex justify-between gap-3">
                    <span className="capitalize text-slate-600">{c.category}</span>
                    <span className="tabular-nums text-slate-900">
                      {money(c.total)}
                    </span>
                  </li>
                ))}
                {!summary.expenses.byCategory.length && (
                  <li className="text-slate-400">Rien d'enregistré.</li>
                )}
              </ul>

              <p className="mt-5 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <Gift className="h-3.5 w-3.5" />
                {summary.freeEnrolments} free enrolments this year — reach, not
                revenue.
              </p>
            </section>
          </div>
        </>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          Tous les mouvements
        </h2>
        <div className="max-h-[28rem] overflow-y-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="w-24 px-4 py-2.5 text-xs text-slate-500">
                    {new Date(r.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-slate-800">{r.label}</span>
                    {r.reference && (
                      <span className="ml-2 font-mono text-xs text-slate-400">
                        {r.reference}
                      </span>
                    )}
                    {r.paidTo && (
                      <span className="ml-2 text-xs text-slate-500">
                        → {r.paidTo}
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right tabular-nums ${
                      r.amount >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {r.amount >= 0 ? "+" : "−"}
                    {money(Math.abs(r.amount))}
                  </td>
                  <td className="w-10 px-2 py-2.5 text-right">
                    {r.kind === "out" && r.category !== "refund" && (
                      <button
                        onClick={() => removeExpense(r)}
                        title="Supprimer"
                        className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Nothing moved in {year}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {createPortal(
        adding ? (
          <ExpenseForm
            onClose={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              load();
            }}
          />
        ) : null,
        document.body,
      )}
    </div>
  );
};

/** Recording an outgoing. The only thing on this page a person types in. */
const ExpenseForm = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    spentAt: new Date().toISOString().slice(0, 10),
    amount: "",
    category: "other",
    description: "",
    paidTo: "",
    reference: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !(Number(form.amount) > 0)) {
      toast.error("Une description et un montant positif sont obligatoires");
      return;
    }
    setSaving(true);
    const r = await FinanceAPI.addExpense({
      ...form,
      amount: Number(form.amount),
    });
    setSaving(false);
    if (r.success) {
      toast.success("Enregistré");
      onSaved();
    } else {
      toast.error(r.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="my-12 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-bold text-slate-900">Enregistrer une dépense</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium uppercase text-slate-500">
              When the money left
            </span>
            <input
              type="date"
              value={form.spentAt}
              onChange={set("spentAt")}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">
                Amount (DZD)
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.amount}
                onChange={set("amount")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">
                Category
              </span>
              <select
                value={form.category}
                onChange={set("category")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium uppercase text-slate-500">
              What it was for
            </span>
            <input
              value={form.description}
              onChange={set("description")}
              placeholder="Publicités Facebook, octobre"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">
                Paid to
              </span>
              <input
                value={form.paidTo}
                onChange={set("paidTo")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">
                Reference
              </span>
              <input
                value={form.reference}
                onChange={set("reference")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

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

export default Finance;
