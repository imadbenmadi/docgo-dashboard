import { useCallback, useEffect, useState } from "react";
import {
    AlertTriangle,
    Eye,
    EyeOff,
    FileText,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    Users,
} from "lucide-react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import cvCatalogueAPI from "../../API/CVCatalogue";

/**
 * The CV catalogue.
 *
 * This screen used to be a single form headed "Configuration unique (un seul
 * service global)" - a settings page for the one CV service that could exist,
 * because every controller behind it called findOne() and updated whatever came
 * back. Services are rows now, priced individually and shown as cards, the way
 * courses are.
 */

const emptyDraft = {
    title: "",
    description: "",
    price: "",
    currency: "DZD",
    isPaid: true,
    deliveryDays: "",
    displayOrder: 0,
    isActive: true,
};

const money = (service) => {
    if (!service.isPaid) return "Gratuit";
    const value = Number(service.price ?? 0);
    if (!value) return "Prix non défini";
    return `${value.toLocaleString("fr-FR")} ${service.currency || "DZD"}`;
};

export default function CVCatalogue() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | "new" | service
    const [draft, setDraft] = useState(emptyDraft);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await cvCatalogueAPI.list();
            setServices(data?.data || []);
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Impossible de charger les services",
            );
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openNew = () => {
        setDraft(emptyDraft);
        setEditing("new");
    };

    const openEdit = (service) => {
        setDraft({
            title: service.title ?? "",
            description: service.description ?? "",
            price: service.price ?? "",
            currency: service.currency || "DZD",
            isPaid: Boolean(service.isPaid),
            deliveryDays: service.deliveryDays ?? "",
            displayOrder: service.displayOrder ?? 0,
            isActive: Boolean(service.isActive),
        });
        setEditing(service);
    };

    const save = async (e) => {
        e.preventDefault();
        if (!draft.title.trim()) {
            toast.error("Le titre est requis");
            return;
        }
        if (draft.isPaid && !Number(draft.price)) {
            toast.error("Un service payant a besoin d'un prix");
            return;
        }

        setSaving(true);
        try {
            const fields = {
                ...draft,
                price: draft.isPaid ? Number(draft.price) : 0,
                deliveryDays: draft.deliveryDays === "" ? null : Number(draft.deliveryDays),
                displayOrder: Number(draft.displayOrder) || 0,
            };

            const result =
                editing === "new"
                    ? await cvCatalogueAPI.create(fields)
                    : await cvCatalogueAPI.update(editing.id, fields);

            // A price change never blocks, but it does say what is already in
            // flight at the old price - the admin decides, not the code.
            if (result?.warning) {
                await Swal.fire({
                    icon: "warning",
                    title: "Modification enregistrée",
                    text: result.warning,
                    confirmButtonText: "Compris",
                });
            } else {
                toast.success(editing === "new" ? "Service créé" : "Service mis à jour");
            }

            setEditing(null);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Enregistrement impossible");
        } finally {
            setSaving(false);
        }
    };

    const toggle = async (service) => {
        try {
            await cvCatalogueAPI.toggle(service.id);
            toast.success(service.isActive ? "Masqué" : "Affiché");
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Action impossible");
        }
    };

    const remove = async (service) => {
        const count = service.applications?.total || 0;
        const result = await Swal.fire({
            icon: "warning",
            title: count ? "Ce service sera masqué" : "Supprimer ce service ?",
            html: count
                ? `<b>${service.title}</b> a ${count} candidature${count === 1 ? "" : "s"}. ` +
                  `Il sera masqué plutôt que supprimé — les candidatures sont la trace des paiements.`
                : `<b>${service.title}</b> sera supprimé définitivement.`,
            showCancelButton: true,
            confirmButtonText: count ? "Masquer" : "Supprimer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#dc2626",
        });
        if (!result.isConfirmed) return;

        try {
            const res = await cvCatalogueAPI.remove(service.id);
            toast.success(res?.message || "Supprimé");
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Suppression impossible");
        }
    };

    return (
        <div className="mx-auto max-w-7xl p-2">
            <Toaster position="top-right" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2.5">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Services CV
                        </h1>
                        <p className="text-sm text-gray-500">
                            {services.length} service{services.length === 1 ? "" : "s"},
                            chacun avec son prix
                        </p>
                    </div>
                </div>
                <button
                    onClick={openNew}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Nouveau service
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-20 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Chargement…
                </div>
            ) : services.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white py-20 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    <p className="font-medium text-gray-900">Aucun service pour le moment</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Ajoutez-en un pour qu&apos;il apparaisse sur le site.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className={`flex flex-col rounded-xl border bg-white p-5 ${
                                service.isActive ? "border-gray-200" : "border-dashed border-gray-300"
                            }`}
                        >
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <h2 className="min-w-0 break-words font-semibold text-gray-900">
                                    {service.title || "Sans titre"}
                                </h2>
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                                        service.isActive
                                            ? "bg-green-50 text-green-700"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {service.isActive ? "Visible" : "Masqué"}
                                </span>
                            </div>

                            <p className="mb-4 text-lg font-semibold text-gray-900">
                                {money(service)}
                            </p>

                            <div className="mb-4 space-y-1 text-sm text-gray-500">
                                {service.deliveryDays ? (
                                    <p>Livraison en {service.deliveryDays} jour(s)</p>
                                ) : null}
                                <p className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    {service.applications?.total || 0} candidature
                                    {(service.applications?.total || 0) === 1 ? "" : "s"}
                                    {service.applications?.pending ? (
                                        <span className="text-amber-600">
                                            · {service.applications.pending} en attente
                                        </span>
                                    ) : null}
                                </p>
                            </div>

                            <div className="mt-auto flex items-center gap-1 border-t border-gray-100 pt-3">
                                <button
                                    onClick={() => openEdit(service)}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Modifier
                                </button>
                                <button
                                    onClick={() => toggle(service)}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    {service.isActive ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                    {service.isActive ? "Masquer" : "Afficher"}
                                </button>
                                <button
                                    onClick={() => remove(service)}
                                    className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                    title="Supprimer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => !saving && setEditing(null)}
                >
                    <form
                        onSubmit={save}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
                    >
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            {editing === "new" ? "Nouveau service" : "Modifier le service"}
                        </h2>

                        <label className="mb-4 block">
                            <span className="mb-1 block text-sm font-medium text-gray-700">
                                Titre
                            </span>
                            <input
                                value={draft.title}
                                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                placeholder="CV professionnel"
                            />
                        </label>

                        <label className="mb-4 block">
                            <span className="mb-1 block text-sm font-medium text-gray-700">
                                Description
                            </span>
                            <textarea
                                rows={3}
                                value={draft.description}
                                onChange={(e) =>
                                    setDraft({ ...draft, description: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="mb-4 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={draft.isPaid}
                                onChange={(e) =>
                                    setDraft({ ...draft, isPaid: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Service payant</span>
                        </label>

                        {draft.isPaid && (
                            <div className="mb-4 grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-medium text-gray-700">
                                        Prix
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={draft.price}
                                        onChange={(e) =>
                                            setDraft({ ...draft, price: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-medium text-gray-700">
                                        Devise
                                    </span>
                                    <input
                                        value={draft.currency}
                                        onChange={(e) =>
                                            setDraft({ ...draft, currency: e.target.value })
                                        }
                                        maxLength={3}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </label>
                            </div>
                        )}

                        <div className="mb-5 grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="mb-1 block text-sm font-medium text-gray-700">
                                    Délai (jours)
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    value={draft.deliveryDays}
                                    onChange={(e) =>
                                        setDraft({ ...draft, deliveryDays: e.target.value })
                                    }
                                    placeholder="optionnel"
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-medium text-gray-700">
                                    Ordre d&apos;affichage
                                </span>
                                <input
                                    type="number"
                                    value={draft.displayOrder}
                                    onChange={(e) =>
                                        setDraft({ ...draft, displayOrder: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                />
                            </label>
                        </div>

                        {editing !== "new" && editing.applications?.pending ? (
                            <p className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                {editing.applications.pending} candidature
                                {editing.applications.pending === 1 ? "" : "s"} en attente au
                                prix actuel. Changer le prix ne les modifie pas — elles
                                gardent le montant soumis.
                            </p>
                        ) : null}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                disabled={saving}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
