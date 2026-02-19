import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Globe,
    ChevronDown,
    ChevronRight,
    Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import HomePageAPI from "../../API/HomePageManagement";

const LANGS = [
    { code: "en", label: "EN", flag: "🇬🇧", dir: "ltr" },
    { code: "fr", label: "FR", flag: "🇫🇷", dir: "ltr" },
    { code: "ar", label: "AR", flag: "🇸🇦", dir: "rtl" },
];

// All editable sections + their fields per language
const SECTIONS = [
    {
        id: "hero",
        title: "Section Hero (Bannière principale)",
        color: "from-blue-500 to-indigo-600",
        fields: [
            {
                key: "heroBadge",
                label: "Badge / Accroche",
                type: "input",
                placeholder: "ex: Plateforme e-learning #1",
            },
            {
                key: "heroTitle",
                label: "Titre principal",
                type: "input",
                placeholder: "ex: Étudiez à l'étranger avec DocGo",
            },
            {
                key: "heroSubtitle",
                label: "Sous-titre",
                type: "textarea",
                placeholder: "Décrivez brièvement la plateforme…",
            },
            {
                key: "heroCta",
                label: "Bouton CTA (texts)",
                type: "input",
                placeholder: "ex: Commencer maintenant",
            },
        ],
    },
    {
        id: "about",
        title: "Section À propos",
        color: "from-emerald-500 to-teal-600",
        fields: [
            {
                key: "aboutTitle",
                label: "Titre",
                type: "input",
                placeholder: "",
            },
            {
                key: "aboutDescription",
                label: "Description",
                type: "textarea",
                placeholder: "",
            },
        ],
    },
    {
        id: "steps",
        title: "Section Étapes (Que faisons-nous ?)",
        color: "from-pink-500 to-rose-600",
        fields: [
            {
                key: "stepsTitle",
                label: "Titre de la section",
                type: "input",
                placeholder: "",
            },
            {
                key: "step1Title",
                label: "Étape 1 — Titre",
                type: "input",
                placeholder: "",
            },
            {
                key: "step1Desc",
                label: "Étape 1 — Description",
                type: "textarea",
                placeholder: "",
            },
            {
                key: "step2Title",
                label: "Étape 2 — Titre",
                type: "input",
                placeholder: "",
            },
            {
                key: "step2Desc",
                label: "Étape 2 — Description",
                type: "textarea",
                placeholder: "",
            },
            {
                key: "step3Title",
                label: "Étape 3 — Titre",
                type: "input",
                placeholder: "",
            },
            {
                key: "step3Desc",
                label: "Étape 3 — Description",
                type: "textarea",
                placeholder: "",
            },
            {
                key: "step4Title",
                label: "Étape 4 — Titre",
                type: "input",
                placeholder: "",
            },
            {
                key: "step4Desc",
                label: "Étape 4 — Description",
                type: "textarea",
                placeholder: "",
            },
        ],
    },
    {
        id: "services",
        title: "Section Services (Nos services)",
        color: "from-orange-500 to-amber-600",
        fields: [
            {
                key: "servicesTitle",
                label: "Titre de la section",
                type: "input",
                placeholder: "",
            },
            {
                key: "service1Title",
                label: "Service 1 — Titre",
                type: "input",
                placeholder: "",
            },
            {
                key: "service1Desc",
                label: "Service 1 — Description",
                type: "textarea",
                placeholder: "",
            },
            {
                key: "service1Cta",
                label: "Service 1 — Bouton CTA",
                type: "input",
                placeholder: "",
            },
            {
                key: "service2Title",
                label: "Service 2 — Titre",
                type: "input",
                placeholder: "",
            },
            {
                key: "service2Desc",
                label: "Service 2 — Description",
                type: "textarea",
                placeholder: "",
            },
            {
                key: "service2Cta",
                label: "Service 2 — Bouton CTA",
                type: "input",
                placeholder: "",
            },
        ],
    },
];

const ContentEditor = () => {
    const navigate = useNavigate();
    const [lang, setLang] = useState("en");
    const [open, setOpen] = useState({ hero: true });
    const [fields, setFields] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await HomePageAPI.getContent();
            if (res.success) {
                // Flatten the model into { heroBadge_en: "...", heroBadge_fr: "...", ... }
                const flat = {};
                SECTIONS.forEach((s) =>
                    s.fields.forEach(({ key }) => {
                        LANGS.forEach(({ code }) => {
                            const dbKey = `${key}_${code}`;
                            flat[dbKey] = res.content[dbKey] ?? "";
                        });
                    }),
                );
                setFields(flat);
            } else {
                toast.error("Erreur lors du chargement");
            }
            setLoading(false);
        })();
    }, []);

    const handleChange = (key, value) => {
        const dbKey = `${key}_${lang}`;
        setFields((p) => ({ ...p, [dbKey]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const res = await HomePageAPI.updateContent(fields);
        if (res.success) toast.success("Contenu enregistré !");
        else toast.error(res.message || "Erreur lors de la sauvegarde");
        setSaving(false);
    };

    const currentLang = LANGS.find((l) => l.code === lang);

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Éditeur de contenu
                        </h1>
                        <p className="text-xs text-gray-400">
                            Modifiez les textes de la page d&apos;accueil en 3
                            langues
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
                    Enregistrer tout
                </button>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
                {LANGS.map((l) => (
                    <button
                        key={l.code}
                        onClick={() => setLang(l.code)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            lang === l.code
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                        {l.dir === "rtl" && (
                            <Globe className="w-3 h-3 text-purple-400" />
                        )}
                    </button>
                ))}
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {SECTIONS.map((section) => {
                    const isOpen = !!open[section.id];
                    return (
                        <div
                            key={section.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* Section header */}
                            <button
                                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                                onClick={() =>
                                    setOpen((p) => ({
                                        ...p,
                                        [section.id]: !isOpen,
                                    }))
                                }
                            >
                                <div
                                    className={`w-3 h-8 rounded-full bg-gradient-to-b ${section.color}`}
                                />
                                <span className="flex-1 font-semibold text-gray-800 text-sm">
                                    {section.title}
                                </span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {currentLang.flag} {currentLang.label}
                                </span>
                                {isOpen ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {/* Fields */}
                            {isOpen && (
                                <div
                                    className="px-5 pb-5 grid gap-4 border-t border-gray-50"
                                    dir={currentLang.dir}
                                >
                                    {section.fields.map(
                                        ({ key, label, type, placeholder }) => {
                                            const dbKey = `${key}_${lang}`;
                                            return (
                                                <div
                                                    key={key}
                                                    className="flex flex-col gap-1.5 mt-4"
                                                >
                                                    <label className="text-xs font-medium text-gray-600">
                                                        {label}
                                                    </label>
                                                    {type === "textarea" ? (
                                                        <textarea
                                                            rows={3}
                                                            value={
                                                                fields[dbKey] ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    key,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={
                                                                placeholder
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none placeholder-gray-300"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={
                                                                fields[dbKey] ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    key,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={
                                                                placeholder
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom save bar */}
            <div className="mt-8 flex justify-end">
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
                    Enregistrer tout
                </button>
            </div>
        </div>
    );
};

export default ContentEditor;
