import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Globe,
    BookOpen,
    Layers,
    Plus,
    Trash2,
    Save,
    BarChart2,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";
import RegisterOptionsAPI from "../../API/RegisterOptions";

const TABS = [
    {
        key: "countries",
        label: "Pays",
        icon: Globe,
        color: "from-blue-500 to-cyan-600",
    },
    {
        key: "studyFields",
        label: "Domaines d'études",
        icon: BookOpen,
        color: "from-violet-500 to-purple-600",
    },
    {
        key: "studyDomains",
        label: "Spécialisations",
        icon: Layers,
        color: "from-emerald-500 to-teal-600",
    },
];

function ListEditor({ items, onChange }) {
    const [newItem, setNewItem] = useState("");
    const [filter, setFilter] = useState("");

    const filtered = items.filter((i) =>
        i.toLowerCase().includes(filter.toLowerCase()),
    );

    const handleAdd = () => {
        const trimmed = newItem.trim();
        if (!trimmed) return;
        if (items.includes(trimmed)) {
            toast.error("Cet élément existe déjà");
            return;
        }
        onChange([...items, trimmed]);
        setNewItem("");
    };

    const handleRemove = (item) => {
        onChange(items.filter((i) => i !== item));
    };

    const moveUp = (idx) => {
        if (idx === 0) return;
        const arr = [...items];
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        onChange(arr);
    };

    const moveDown = (idx) => {
        if (idx === items.length - 1) return;
        const arr = [...items];
        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
        onChange(arr);
    };

    return (
        <div className="space-y-4">
            {/* Add new */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="Ajouter un élément..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter
                </button>
            </div>

            {/* Filter */}
            <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={`Filtrer parmi ${items.length} éléments...`}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            {/* List */}
            <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                {filtered.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">
                        Aucun élément trouvé
                    </div>
                ) : (
                    filtered.map((item) => {
                        const realIdx = items.indexOf(item);
                        return (
                            <div
                                key={item}
                                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 group"
                            >
                                <span className="text-sm text-gray-700 flex-1 truncate">
                                    {item}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => moveUp(realIdx)}
                                        disabled={realIdx === 0}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        title="Monter"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => moveDown(realIdx)}
                                        disabled={realIdx === items.length - 1}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        title="Descendre"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleRemove(item)}
                                        className="p-1 text-red-400 hover:text-red-600"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default function RegisterOptionsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("countries");
    const [options, setOptions] = useState({
        countries: [],
        studyFields: [],
        studyDomains: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // which key is being saved

    const load = async () => {
        setLoading(true);
        try {
            const data = await RegisterOptionsAPI.getOptions();
            setOptions({
                countries: data.countries || [],
                studyFields: data.studyFields || [],
                studyDomains: data.studyDomains || [],
            });
        } catch (e) {
            toast.error("Erreur de chargement : " + (e.message || "inconnue"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleSave = async (key) => {
        setSaving(key);
        try {
            await RegisterOptionsAPI.updateOptions({ [key]: options[key] });
            toast.success("Sauvegardé avec succès !");
        } catch (e) {
            toast.error("Erreur de sauvegarde : " + (e.message || "inconnue"));
        } finally {
            setSaving(null);
        }
    };

    const currentTab = TABS.find((t) => t.key === activeTab);
    const currentItems = options[activeTab] || [];

    const counts = {
        countries: options.countries.length,
        studyFields: options.studyFields.length,
        studyDomains: options.studyDomains.length,
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Options du formulaire d&apos;inscription
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gérez les listes déroulantes du formulaire
                        d&apos;inscription des utilisateurs
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={load}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </button>
                    <button
                        onClick={() => navigate("/RegisterOptions/Insights")}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                        <BarChart2 className="w-4 h-4" />
                        Analyse de la demande
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                activeTab === tab.key
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-transparent bg-white shadow-sm hover:shadow"
                            }`}
                        >
                            <div
                                className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${tab.color} mb-3`}
                            >
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-gray-800">
                                {counts[tab.key]}
                            </div>
                            <div className="text-sm text-gray-500">
                                {tab.label}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Editor card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tab bar */}
                <div className="flex border-b border-gray-100">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? "border-b-2 border-blue-500 text-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    {counts[tab.key]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                            Chargement...
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {currentTab && (
                                        <currentTab.icon className="w-5 h-5 text-gray-500" />
                                    )}
                                    <h2 className="font-semibold text-gray-800">
                                        {currentTab?.label}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => handleSave(activeTab)}
                                    disabled={saving === activeTab}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors text-sm font-medium"
                                >
                                    {saving === activeTab ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Sauvegarder
                                </button>
                            </div>

                            <ListEditor
                                key={activeTab}
                                items={currentItems}
                                onChange={(newList) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        [activeTab]: newList,
                                    }))
                                }
                            />
                        </>
                    )}
                </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
                Les modifications sont appliquées immédiatement sur le
                formulaire d&apos;inscription du site.
            </p>
        </div>
    );
}
