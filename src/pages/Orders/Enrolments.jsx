import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldOff,
} from "lucide-react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import OrdersAPI, { ITEM_TYPES } from "../../API/Orders";

/**
 * Who has what, and the four things an admin can do about it.
 *
 * Access used to be spread over two enrolment tables that only covered
 * courses and programs; a CV service or an internship had no enrolment at all,
 * so there was no screen that could show who currently held one, and no button
 * that could take one away. One table now, so one page.
 */

const STATUS_STYLE = {
  active: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  completed: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  suspended: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  expired: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  cancelled: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
};

const TYPE_LABEL = Object.fromEntries(
  ITEM_TYPES.map((t) => [t.value, t.label]),
);

const PAYMENT_LABEL = {
  free: "Free",
  ccp: "CCP",
  paypal: "PayPal",
  admin_granted: "Given by an admin",
};

const money = (n) =>
  n === null || n === undefined || Number(n) === 0
    ? "—"
    : `${Number(n).toLocaleString("fr-FR")} DZD`;

const when = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const Enrolments = () => {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [filters, setFilters] = useState({
    itemType: "",
    status: "active",
    page: 1,
    limit: 20,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const r = await OrdersAPI.listEnrollments(filters);
    if (r.success) {
      setRows(r.enrollments);
      setPagination(r.pagination);
    } else {
      toast.error(r.message);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn, id, successMessage) => {
    setBusy(id);
    const r = await fn();
    setBusy(null);
    if (r.success) {
      toast.success(r.message || successMessage);
      load();
    } else {
      toast.error(r.message);
    }
  };

  const revoke = async (row) => {
    const { value: reason } = await Swal.fire({
      title: "Take this access away?",
      html: `<p class="text-sm text-slate-600">${
        row.user?.firstName || "They"
      } will lose <b>${row.itemTitle || TYPE_LABEL[row.itemType]}</b>.</p>`,
      input: "text",
      inputPlaceholder: "Why? (optional)",
      showCancelButton: true,
      confirmButtonText: "Remove access",
      confirmButtonColor: "#e11d48",
      footer:
        "<span class='text-xs text-slate-500'>Nothing is deleted. The enrolment, the order behind it and anything paid all stay — if money is owed back, record a refund on the order.</span>",
    });
    if (reason === undefined) return;
    act(() => OrdersAPI.revoke(row.id, reason), row.id, "Access removed");
  };

  const suspend = async (row) => {
    const { value: reason } = await Swal.fire({
      title: "Pause this access?",
      input: "text",
      inputPlaceholder: "Why? (optional)",
      showCancelButton: true,
      confirmButtonText: "Suspend",
      confirmButtonColor: "#d97706",
      footer:
        "<span class='text-xs text-slate-500'>A pause, not an ending. Reinstating puts it back on the same row, with progress and certificate intact.</span>",
    });
    if (reason === undefined) return;
    act(() => OrdersAPI.suspend(row.id, reason), row.id, "Suspended");
  };

  const grant = async () => {
    const { value: form } = await Swal.fire({
      title: "Give somebody something",
      html:
        `<input id="uid" class="swal2-input" placeholder="User id">` +
        `<select id="typ" class="swal2-select">${ITEM_TYPES.map(
          (t) => `<option value="${t.value}">${t.label}</option>`,
        ).join("")}</select>` +
        `<input id="iid" class="swal2-input" placeholder="Item id">` +
        `<input id="nts" class="swal2-input" placeholder="Note (optional)">`,
      showCancelButton: true,
      confirmButtonText: "Grant",
      confirmButtonColor: "#059669",
      footer:
        "<span class='text-xs text-slate-500'>This places an order recording that an admin granted it, so there is always an answer to why this person has this.</span>",
      preConfirm: () => ({
        userId: document.getElementById("uid").value.trim(),
        itemType: document.getElementById("typ").value,
        itemId: document.getElementById("iid").value.trim(),
        notes: document.getElementById("nts").value.trim(),
      }),
    });
    if (!form?.userId || !form?.itemId) return;
    act(() => OrdersAPI.grant(form), "grant", "Granted");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enrolments</h1>
          <p className="mt-1 text-sm text-slate-600">
            Who currently has what, across all four products.
          </p>
        </div>
        <button
          onClick={grant}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Give somebody something
        </button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, page: 1, status: e.target.value }))
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Every status</option>
          {Object.keys(STATUS_STYLE).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.itemType}
          onChange={(e) =>
            setFilters((f) => ({ ...f, page: 1, itemType: e.target.value }))
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Every product</option>
          {ITEM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={load}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Who</th>
                <th className="px-4 py-3 font-medium">What</th>
                <th className="px-4 py-3 font-medium">How they got it</th>
                <th className="px-4 py-3 font-medium">Since</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    Nobody here.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {e.user ? (
                        <>
                          <p className="font-medium text-slate-800">
                            {e.user.firstName} {e.user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {e.user.email}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs italic text-slate-400">
                          account removed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-500">
                        {TYPE_LABEL[e.itemType]}
                      </p>
                      <p className="max-w-[18rem] truncate text-slate-700">
                        {e.itemTitle || (
                          <span className="italic text-slate-400">
                            item deleted
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">
                        {PAYMENT_LABEL[e.paymentType] || e.paymentType}
                      </p>
                      <p className="text-xs tabular-nums text-slate-500">
                        {money(e.amountPaid)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {when(e.startedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLE[e.status]
                        }`}
                      >
                        {e.status}
                      </span>
                      {e.itemType === "course" && e.progressPercentage > 0 && (
                        <p className="mt-1 text-xs tabular-nums text-slate-400">
                          {Math.round(e.progressPercentage)}% through
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {e.status === "active" && (
                          <>
                            <button
                              disabled={busy === e.id}
                              onClick={() => suspend(e)}
                              title="Pause"
                              className="rounded-lg border border-amber-200 p-1.5 text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                            <button
                              disabled={busy === e.id}
                              onClick={() => revoke(e)}
                              title="Remove access"
                              className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                            >
                              <ShieldOff className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {["suspended", "cancelled", "expired"].includes(
                          e.status,
                        ) && (
                          <button
                            disabled={busy === e.id}
                            onClick={() =>
                              act(
                                () => OrdersAPI.reinstate(e.id),
                                e.id,
                                "Access restored",
                              )
                            }
                            title="Put it back"
                            className="rounded-lg border border-emerald-200 p-1.5 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
            <span className="text-slate-500">
              {pagination.total} enrolments, page {pagination.page} of{" "}
              {pagination.pages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={filters.page >= pagination.pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Removing access cancels the enrolment; it does not delete it, and it
        never touches the order or what was paid. A refund is recorded on the
        order, separately, because they are two different facts.
      </p>
    </div>
  );
};

export default Enrolments;
