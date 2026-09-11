import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Layers,
  RefreshCw,
  RotateCcw,
  Search,
  Undo2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import OrdersAPI, { ITEM_TYPES, ORDER_STATUSES } from "../../API/Orders";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";

/**
 * One queue for every order on the platform.
 *
 * This page replaces six: course applications, program applications, CV
 * applications, internship applications, all payments and service payments.
 * They were separate because the data was separate; it is one table now, so
 * this is one screen, and an admin stops having to remember which of six
 * places a particular kind of payment turns up in.
 */

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  refunded: "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
};

const TYPE_STYLE = {
  course: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  program: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  cv: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  internship: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};

const TYPE_LABEL = Object.fromEntries(
  ITEM_TYPES.map((t) => [t.value, t.label]),
);

const money = (n, currency = "DZD") =>
  n === null || n === undefined
    ? "—"
    : `${Number(n).toLocaleString("fr-FR")} ${currency}`;

const when = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const Pill = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

/**
 * The receipt. Loaded only when somebody asks to see one, because the queue
 * deliberately does not carry image bytes.
 */
const Receipt = ({ orderId }) => {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    OrdersAPI.receipt(orderId).then((r) => {
      if (alive) setState({ loading: false, ...r });
    });
    return () => {
      alive = false;
    };
  }, [orderId]);

  if (state.loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Chargement du reçu
      </div>
    );
  }

  if (!state.success) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg bg-slate-50 text-sm text-slate-500">
        <FileText className="h-6 w-6" />
        {state.message}
      </div>
    );
  }

  const { receipt } = state;
  const isPdf = receipt.mimeType === "application/pdf";

  return (
    <div className="space-y-2">
      {isPdf ? (
        <iframe
          title="Reçu"
          src={receipt.url}
          className="h-[28rem] w-full rounded-lg border border-slate-200"
        />
      ) : (
        <a href={receipt.url} target="_blank" rel="noreferrer">
          <img
            src={receipt.url}
            alt="Preuve de paiement"
            className="max-h-[28rem] w-full rounded-lg border border-slate-200 object-contain"
          />
        </a>
      )}
      <p className="text-xs text-slate-500">
        {receipt.kind === "bunny"
          ? "Depuis le CDN, via un lien signé."
          : receipt.kind === "blob"
            ? "Depuis la copie conservée dans la ligne. Les reçus en stockage local sont protégés par authentification ; c'est donc cette copie qui peut être affichée ici."
            : "Depuis le stockage local."}
      </p>
    </div>
  );
};

/** Every attempt at one item, oldest first. */
const Attempts = ({ attempts, currentId }) => {
  if (!attempts || attempts.length < 2) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Layers className="h-3.5 w-3.5" />
        {attempts.length} attempts at this
      </p>
      <ol className="space-y-2">
        {attempts.map((a) => (
          <li
            key={a.id}
            className={`rounded-md border p-2 text-sm ${
              a.id === currentId
                ? "border-sky-300 bg-white"
                : "border-slate-200 bg-white/60"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-500">
                #{a.attemptNumber}
              </span>
              <span className="font-mono text-xs">{a.reference}</span>
              <Pill className={STATUS_STYLE[a.status]}>{a.status}</Pill>
              <span className="text-xs text-slate-400">{when(a.placedAt)}</span>
            </div>
            {a.rejectionReason && (
              <p className="mt-1 text-xs text-rose-700">{a.rejectionReason}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [open, setOpen] = useState(null);

  const [filters, setFilters] = useState({
    status: "pending",
    itemType: "",
    search: "",
    page: 1,
    limit: 20,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const r = await OrdersAPI.list(filters);
    if (r.success) {
      setOrders(r.orders);
      setCounts(r.countsByStatus);
      setPagination(r.pagination);
    } else {
      toast.error(r.message);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    OrdersAPI.summary().then((r) => r.success && setSummary(r));
  }, []);

  const setFilter = (patch) => setFilters((f) => ({ ...f, page: 1, ...patch }));

  const openOrder = async (id) => {
    setOpen({ loading: true });
    const r = await OrdersAPI.get(id);
    if (r.success) setOpen(r);
    else {
      toast.error(r.message);
      setOpen(null);
    }
  };

  const approve = async (order) => {
    const ok = await Swal.fire({
      title: `Approve ${order.reference}?`,
      html: `<p class="text-sm text-slate-600">This grants <b>${
        order.itemTitle || TYPE_LABEL[order.itemType]
      }</b> to ${order.user?.firstName || "the user"} straight away.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approuver",
      confirmButtonColor: "#059669",
    });
    if (!ok.isConfirmed) return;

    setBusy(order.id);
    const r = await OrdersAPI.approve(order.id);
    setBusy(null);
    if (r.success) {
      toast.success(r.message);
      setOpen(null);
      load();
    } else {
      toast.error(r.message);
    }
  };

  const reject = async (order) => {
    const { value: reason } = await Swal.fire({
      title: `Reject ${order.reference}?`,
      input: "textarea",
      inputLabel: "Why? The user is shown this.",
      inputPlaceholder: "The receipt is unreadable…",
      inputValidator: (v) =>
        !v?.trim() &&
        "Un motif est obligatoire — « refusé » seul ne dit rien à l'utilisateur.",
      showCancelButton: true,
      confirmButtonText: "Refuser",
      confirmButtonColor: "#e11d48",
      footer:
        "<span class='text-xs text-slate-500'>Rien n'est supprimé. L'utilisateur peut envoyer un nouveau reçu, ce qui ouvre une nouvelle tentative.</span>",
    });
    if (!reason) return;

    setBusy(order.id);
    const r = await OrdersAPI.reject(order.id, reason);
    setBusy(null);
    if (r.success) {
      toast.success(r.message);
      setOpen(null);
      load();
    } else {
      toast.error(r.message);
    }
  };

  const refund = async (order) => {
    const { value: form } = await Swal.fire({
      title: `Refund ${order.reference}?`,
      html:
        `<input id="amt" class="swal2-input" type="number" value="${
          order.amountPaid ?? order.price
        }" placeholder="Montant">` +
        `<textarea id="rsn" class="swal2-textarea" placeholder="Motif ?"></textarea>`,
      showCancelButton: true,
      confirmButtonText: "Enregistrer le remboursement",
      confirmButtonColor: "#7c3aed",
      footer:
        "<span class='text-xs text-slate-500'>Ceci enregistre un remboursement. L'accès n'est pas retiré — faites-le séparément si c'est votre intention.</span>",
      preConfirm: () => ({
        amount: Number(document.getElementById("amt").value),
        reason: document.getElementById("rsn").value,
      }),
    });
    if (!form) return;

    setBusy(order.id);
    const r = await OrdersAPI.refund(order.id, form);
    setBusy(null);
    if (r.success) {
      toast.success(r.message);
      setOpen(null);
      load();
    } else {
      toast.error(r.message);
    }
  };

  const waiting = counts.pending || 0;

  const tabs = useMemo(
    () => [
      { value: "", label: "Toutes", n: pagination.total },
      ...ORDER_STATUSES.map((s) => ({
        value: s.value,
        label: s.label,
        n: counts[s.value] || 0,
      })),
    ],
    [counts, pagination.total],
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Commandes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Toutes les commandes de la plateforme, pour les quatre produits. C'est l'approbation qui donne l'accès.
        </p>
      </header>

      {summary && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber-700">
              <Clock className="h-3.5 w-3.5" /> Waiting on you
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900">
              {summary.waitingOnYou}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Taken in
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {money(summary.income)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Refunded
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {money(summary.refunded)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              By product
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
              {(summary.byType || []).map((t) => (
                <li key={t.itemType} className="flex justify-between gap-3">
                  <span>{TYPE_LABEL[t.itemType] || t.itemType}</span>
                  <span className="tabular-nums">{t.orders}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.value || "all"}
            onClick={() => setFilter({ status: t.value })}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              filters.status === t.value
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {t.label}
            <span className="ml-1.5 tabular-nums opacity-60">{t.n}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[14rem]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="Référence, numéro CCP, transaction…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <select
          value={filters.itemType}
          onChange={(e) => setFilter({ itemType: e.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Tous les produits</option>
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
                <th className="px-4 py-3 font-medium">Référence</th>
                <th className="px-4 py-3 font-medium">Qui</th>
                <th className="px-4 py-3 font-medium">Quoi</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Passée le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Chargement
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    Rien ici.
                  </td>
                </tr>
              )}

              {!loading &&
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{o.reference}</span>
                      {o.attemptNumber > 1 && (
                        <span className="ml-1.5 text-xs text-slate-400">
                          attempt {o.attemptNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {o.user ? (
                        <>
                          <p className="font-medium text-slate-800">
                            {o.user.firstName} {o.user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {o.user.email}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs italic text-slate-400">
                          account removed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Pill className={TYPE_STYLE[o.itemType]}>
                        {TYPE_LABEL[o.itemType]}
                      </Pill>
                      <p className="mt-1 max-w-[18rem] truncate text-slate-700">
                        {o.itemTitle || (
                          <span className="italic text-slate-400">
                            item deleted
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {o.isFree ? (
                        <span className="text-slate-500">Gratuit</span>
                      ) : (
                        <>
                          {money(o.price, o.currency)}
                          {o.discountAmount > 0 && (
                            <p className="text-xs text-emerald-600">
                              −{money(o.discountAmount, o.currency)}{" "}
                              {o.couponCode}
                            </p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Pill className={STATUS_STYLE[o.status]}>{o.status}</Pill>
                      {o.status === "pending" && !o.hasReceipt && !o.isFree && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <AlertCircle className="h-3 w-3" /> no receipt yet
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {when(o.placedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openOrder(o.id)}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
            <span className="text-slate-500">
              {pagination.total} orders, page {pagination.page} of{" "}
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

      {/*
        Rendered into document.body rather than in place. The dashboard layout
        wraps its content in a transformed element, and a transform makes an
        ancestor the containing block for position:fixed - so the overlay was
        laid out inside the page rather than over it, and the table drew on top
        of it. A portal is the fix; raising z-index is not, because the problem
        is which box the coordinates are relative to.
      */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4"
              onClick={() => setOpen(null)}
            >
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
              >
                {open.loading ? (
                  <div className="flex h-48 items-center justify-center text-slate-400">
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Chargement
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-mono text-lg font-bold">
                            {open.order.reference}
                          </h2>
                          <Pill className={STATUS_STYLE[open.order.status]}>
                            {open.order.status}
                          </Pill>
                          <Pill className={TYPE_STYLE[open.order.itemType]}>
                            {TYPE_LABEL[open.order.itemType]}
                          </Pill>
                        </div>
                        <p className="mt-1 text-slate-700">
                          {open.order.itemTitle || "article supprimé"}
                        </p>
                      </div>
                      <button
                        onClick={() => setOpen(null)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <dl className="mb-4 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase text-slate-500">
                          Who
                        </dt>
                        <dd className="text-slate-800">
                          {open.order.user
                            ? `${open.order.user.firstName} ${open.order.user.lastName}`
                            : "compte supprimé"}
                          <br />
                          <span className="text-xs text-slate-500">
                            {open.order.user?.email}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-slate-500">
                          Price
                        </dt>
                        <dd className="tabular-nums text-slate-800">
                          {open.order.isFree
                            ? "Gratuit"
                            : money(open.order.price, open.order.currency)}
                          {open.order.couponCode && (
                            <span className="ml-1 text-xs text-emerald-600">
                              {open.order.couponCode}
                            </span>
                          )}
                        </dd>
                      </div>
                      {open.order.CCP_number && (
                        <div>
                          <dt className="text-xs uppercase text-slate-500">
                            CCP number
                          </dt>
                          <dd className="font-mono text-slate-800">
                            {open.order.CCP_number}
                          </dd>
                        </div>
                      )}
                      {open.order.phoneNumber && (
                        <div>
                          <dt className="text-xs uppercase text-slate-500">
                            Phone
                          </dt>
                          <dd className="text-slate-800">
                            {open.order.phoneNumber}
                          </dd>
                        </div>
                      )}
                      {open.order.content && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase text-slate-500">
                            What they wrote
                          </dt>
                          {/*
                            The applicant writes this in the rich text editor,
                            so it arrives as HTML. Printing it raw showed the
                            admin "<h2>My CV</h2><p>..." instead of the
                            message. This renders it, sanitised.
                          */}
                          <dd className="text-slate-800">
                            <RichTextDisplay content={open.order.content} />
                          </dd>
                        </div>
                      )}
                      {open.order.rejectionReason && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase text-slate-500">
                            Reason given
                          </dt>
                          <dd className="text-rose-700">
                            {open.order.rejectionReason}
                          </dd>
                        </div>
                      )}
                      {open.order.refundedAt && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase text-slate-500">
                            Refunded
                          </dt>
                          <dd className="text-violet-700">
                            {money(
                              open.order.refundAmount,
                              open.order.currency,
                            )}{" "}
                            on {when(open.order.refundedAt)}
                            {open.order.refundReason
                              ? ` — ${open.order.refundReason}`
                              : ""}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {!open.order.isFree && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Preuve de paiement
                        </p>
                        <Receipt orderId={open.order.id} />
                      </div>
                    )}

                    <div className="mb-4">
                      <Attempts
                        attempts={open.attempts}
                        currentId={open.order.id}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                      {open.order.status === "pending" && (
                        <>
                          <button
                            disabled={busy === open.order.id}
                            onClick={() => approve(open.order)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" /> Approuver
                          </button>
                          <button
                            disabled={busy === open.order.id}
                            onClick={() => reject(open.order)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" /> Refuser
                          </button>
                        </>
                      )}
                      {open.order.status === "approved" &&
                        !open.order.isFree &&
                        !open.order.refundedAt && (
                          <button
                            disabled={busy === open.order.id}
                            onClick={() => refund(open.order)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                          >
                            <Undo2 className="h-4 w-4" /> Enregistrer un remboursement
                          </button>
                        )}
                      <button
                        onClick={() => setOpen(null)}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" /> Retour à la file
                      </button>
                    </div>

                    <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
                      <RotateCcw className="mt-0.5 h-3 w-3 shrink-0" />
                      Refuser conserve la commande, son reçu et le motif. L'utilisateur envoie un nouveau reçu, ce qui ouvre une nouvelle tentative au lieu d'écraser celle-ci.
                    </p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {waiting > 0 && filters.status !== "pending" && (
        <button
          onClick={() => setFilter({ status: "pending" })}
          className="fixed bottom-6 right-6 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-amber-600"
        >
          {waiting} waiting on you
        </button>
      )}
    </div>
  );
};

export default Orders;
