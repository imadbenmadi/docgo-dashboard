import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    GripVertical,
    Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import HomePageAPI from "../../API/HomePageManagement";

let nextId = Date.now();
const uid = () => String(++nextId);

const LANGS = [
    { code: "en", flag: "🇬🇧", label: "Anglais" },
    { code: "fr", flag: "🇫🇷", label: "Français" },
    { code: "ar", flag: "🇸🇦", label: "Arabe", rtl: true },
];

const FilterOptions = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [drag, setDrag] = useState(null); // dragged uid

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await HomePageAPI.getContent();
            if (res.success) {
                const raw = res.content.filterStudyFields;
                const arr = Array.isArray(raw) ? raw : [];
                // Ensure each item has a local uid
                setItems(arr.map((it) => ({ ...it, _uid: it._uid || uid() })));
            } else toast.error("Erreur de chargement");
            setLoading(false);
        })();
    }, []);

    const addItem = () =>
        setItems((p) => [
            ...p,
            { _uid: uid(), id: uid(), en: "", fr: "", ar: "" },
        ]);

    const removeItem = (u) => setItems((p) => p.filter((it) => it._uid !== u));

    const updateField = (u, lang, value) =>
        setItems((p) =>
            p.map((it) => (it._uid === u ? { ...it, [lang]: value } : it)),
        );

    // ── drag & drop reorder ──────────────────────────────────────────────────
    const handleDragStart = (e, u) => {
        setDrag(u);
        e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (e, u) => {
        e.preventDefault();
        if (drag === u) return;
        setItems((prev) => {
            const from = prev.findIndex((i) => i._uid === drag);
            const to = prev.findIndex((i) => i._uid === u);
            if (from < 0 || to < 0) return prev;
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    };
    const handleDragEnd = () => setDrag(null);

    const handleSave = async () => {
        // Validate
        const empty = items.some((it) => !it.en && !it.fr && !it.ar);
        if (empty) {
            toast.error("Chaque option doit avoir au moins un texte");
            return;
        }
        setSaving(true);
        // Strip client-only _uid before saving
        // eslint-disable-next-line no-unused-vars
        const payload = items.map(({ _uid, ...rest }) => rest);
        const res = await HomePageAPI.updateContent({
            filterStudyFields: payload,
        });
        if (res.success) toast.success("Options de filtre enregistrées !");
        else toast.error(res.message || "Erreur lors de la sauvegarde");
        setSaving(false);
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Filtre &quot;Que souhaitez-vous étudier&quot;
                        </h1>
                        <p className="text-xs text-gray-400">
                            Gérez les options du filtre affiché sur la page
                            d&apos;accueil
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
                >
                    {saving ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Enregistrer
                </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-xs text-blue-700">
                <strong>Conseil :</strong> Glissez-déposez les lignes pour
                changer l&apos;ordre d&apos;affichage. Remplissez au moins la
                version EN ou FR.
            </div>

            {/* Items */}
            <div className="space-y-3">
                {items.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-sm">
                            Aucune option — cliquez &quot;Ajouter&quot; pour
                            commencer
                        </p>
                    </div>
                )}
                {items.map((item, idx) => (
                    <div
                        key={item._uid}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item._uid)}
                        onDragOver={(e) => handleDragOver(e, item._uid)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-2xl border ${
                            drag === item._uid
                                ? "border-blue-400 shadow-lg opacity-50"
                                : "border-gray-100 shadow-sm"
                        } transition-all`}
                    >
                        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                            <div
                                className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
                                title="Glisser pour réordonner"
                            >
                                <GripVertical className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 w-5 text-center">
                                {idx + 1}
                            </span>
                            <div className="flex-1" />
                            <button
                                onClick={() => removeItem(item._uid)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {LANGS.map(({ code, flag, label, rtl }) => (
                                <div key={code} className="flex flex-col gap-1">
                                    <label className="text-[10px] font-medium text-gray-500">
                                        {flag} {label}
                                    </label>
                                    <input
                                        type="text"
                                        dir={rtl ? "rtl" : "ltr"}
                                        value={item[code] ?? ""}
                                        onChange={(e) =>
                                            updateField(
                                                item._uid,
                                                code,
                                                e.target.value,
                                            )
                                        }
                                        placeholder={`Option en ${label.toLowerCase()}…`}
                                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add button */}
            <button
                onClick={addItem}
                className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 py-3 rounded-2xl text-sm font-medium transition-all"
            >
                <Plus className="w-4 h-4" />
                Ajouter une option
            </button>

            {/* Bottom save */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
                >
                    {saving ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Enregistrer les options
                </button>
            </div>
        </div>
    );
};

export default FilterOptions;
