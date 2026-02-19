import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ExternalLink,
    Pencil,
    Star,
    Filter,
    Eye,
    ToggleLeft,
    ToggleRight,
    Layout,
    Image,
    Type,
    AlignLeft,
    MonitorPlay,
    Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import HomePageAPI from "../../API/HomePageManagement";

const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

const sectionMeta = [
    {
        key: "showFeaturedPrograms",
        label: "Programmes en vedette",
        icon: Layers,
        color: "from-violet-500 to-purple-600",
        desc: "Programmes marqués comme 'en vedette' affichés sur la page d'accueil",
        link: "Featured",
    },
    {
        key: "showFeaturedCourses",
        label: "Cours en vedette",
        icon: MonitorPlay,
        color: "from-blue-500 to-cyan-600",
        desc: "Cours marqués comme 'en vedette' affichés sur la page d'accueil",
        link: "Featured",
    },
    {
        key: "showAboutSection",
        label: "Section À propos",
        icon: Image,
        color: "from-emerald-500 to-teal-600",
        desc: "Section présentant l'équipe et la mission de la plateforme",
        link: "Content",
    },
    {
        key: "showServicesSection",
        label: "Section Services",
        icon: AlignLeft,
        color: "from-orange-500 to-amber-600",
        desc: "Deux cartes de service (programmes + cours en ligne)",
        link: "Content",
    },
    {
        key: "showStepsSection",
        label: "Section Étapes",
        icon: Type,
        color: "from-pink-500 to-rose-600",
        desc: "Les 4 étapes pour étudier à l'étranger",
        link: "Content",
    },
    {
        key: "showFAQSection",
        label: "Section FAQ",
        icon: Layout,
        color: "from-slate-500 to-gray-600",
        desc: "Questions fréquentes affichées en bas de la page",
        link: null,
    },
];

const HomePageManagement = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState({});

    useEffect(() => {
        (async () => {
            const res = await HomePageAPI.getContent();
            if (res.success) setContent(res.content);
            else toast.error("Erreur lors du chargement du contenu");
        })();
    }, []);

    const toggleSection = async (key, current) => {
        setSaving((p) => ({ ...p, [key]: true }));
        const res = await HomePageAPI.updateContent({ [key]: !current });
        if (res.success) {
            setContent(res.content);
            toast.success("Mis à jour");
        } else toast.error(res.message);
        setSaving((p) => ({ ...p, [key]: false }));
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestion de la Page d&apos;Accueil
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Modifiez le contenu, les sections et les éléments en
                        vedette
                    </p>
                </div>
                <a
                    href={FRONTEND_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm"
                >
                    <Eye className="w-4 h-4" />
                    Voir la page d&apos;accueil
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>

            {/* Quick-action cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {/* Edit Content */}
                <button
                    onClick={() => navigate("Content")}
                    className="group bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-blue-300 hover:shadow-md transition-all shadow-sm"
                >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Pencil className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">
                        Éditeur de contenu
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Hero, À propos, Étapes, Services — EN / FR / AR
                    </p>
                </button>

                {/* Featured Items */}
                <button
                    onClick={() => navigate("Featured")}
                    className="group bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-amber-300 hover:shadow-md transition-all shadow-sm"
                >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Star className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">
                        Éléments en vedette
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Sélectionner les cours et programmes affichés
                    </p>
                </button>

                {/* Filter Options */}
                <button
                    onClick={() => navigate("FilterOptions")}
                    className="group bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-emerald-300 hover:shadow-md transition-all shadow-sm"
                >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">
                        Filtre &quot;Que souhaitez-vous étudier&quot;
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Gérer les options du filtre d&apos;études
                    </p>
                </button>
            </div>

            {/* Section visibility toggles */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-base font-semibold text-gray-800">
                        Visibilité des sections
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Activez ou désactivez chaque section de la page
                        d&apos;accueil
                    </p>
                </div>

                <div className="divide-y divide-gray-50">
                    {sectionMeta.map(
                        ({ key, label, icon: Icon, color, desc, link }) => {
                            const isOn = content ? !!content[key] : true;
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
                                    >
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {label}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {desc}
                                        </p>
                                    </div>
                                    {link && (
                                        <button
                                            onClick={() => navigate(link)}
                                            className="text-xs text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors shrink-0"
                                        >
                                            Modifier
                                        </button>
                                    )}
                                    <button
                                        onClick={() => toggleSection(key, isOn)}
                                        disabled={saving[key] || !content}
                                        className="shrink-0 disabled:opacity-50 transition-colors"
                                        title={isOn ? "Désactiver" : "Activer"}
                                    >
                                        {isOn ? (
                                            <ToggleRight className="w-8 h-8 text-blue-600" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            );
                        },
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePageManagement;
