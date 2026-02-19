import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Star,
    StarOff,
    Loader,
    BookOpen,
    Layers,
    Search,
} from "lucide-react";
import toast from "react-hot-toast";
import HomePageAPI from "../../API/HomePageManagement";
/* eslint-disable react/prop-types */

const TABS = [
    { id: "courses", label: "Cours", icon: BookOpen },
    { id: "programs", label: "Programmes", icon: Layers },
];

const ItemCard = ({ item, type, onToggle, busy }) => {
    const isCourse = type === "courses";
    const title = isCourse
        ? item.title_en || item.title_ar || "Sans titre"
        : item.title || item.name || "Sans titre";
    const subtitle = isCourse
        ? item.category || item.level || ""
        : item.university || item.country || "";
    const thumb = item.thumbnail || item.image || item.coverImage;
    const featured = !!item.isFeatured;

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                featured
                    ? "border-amber-200 bg-amber-50"
                    : "border-gray-100 bg-white"
            }`}
        >
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {thumb ? (
                    <img
                        src={thumb}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        {isCourse ? (
                            <BookOpen className="w-6 h-6" />
                        ) : (
                            <Layers className="w-6 h-6" />
                        )}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                    {title}
                </p>
                {subtitle && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {subtitle}
                    </p>
                )}
                <span
                    className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        featured
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {featured ? "⭐ En vedette" : "Non visible"}
                </span>
            </div>

            {/* Toggle button */}
            <button
                onClick={() => onToggle(item.id, !featured)}
                disabled={busy}
                title={
                    featured
                        ? "Retirer de la page d'accueil"
                        : "Afficher sur la page d'accueil"
                }
                className={`p-2.5 rounded-xl transition-all disabled:opacity-50 ${
                    featured
                        ? "bg-amber-400 hover:bg-amber-500 text-white"
                        : "bg-gray-100 hover:bg-amber-100 text-gray-400 hover:text-amber-500"
                }`}
            >
                {busy ? (
                    <Loader className="w-4 h-4 animate-spin" />
                ) : featured ? (
                    <Star className="w-4 h-4 fill-white" />
                ) : (
                    <StarOff className="w-4 h-4" />
                )}
            </button>
        </div>
    );
};

const FeaturedItems = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState("courses");
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState({});
    const [query, setQuery] = useState("");

    const fetchAll = async () => {
        setLoading(true);
        const [c, p] = await Promise.all([
            HomePageAPI.getFeaturedCourses(),
            HomePageAPI.getFeaturedPrograms(),
        ]);
        if (c.success) setCourses(c.courses);
        if (p.success) setPrograms(p.programs);
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleToggleCourse = async (id, newState) => {
        setBusy((p) => ({ ...p, [`c-${id}`]: true }));
        const res = await HomePageAPI.toggleFeaturedCourse(id, newState);
        if (res.success) {
            setCourses((prev) =>
                prev.map((c) =>
                    c.id === id ? { ...c, isFeatured: newState } : c,
                ),
            );
            toast.success(
                newState
                    ? "Cours ajouté à la page d'accueil"
                    : "Cours retiré de la page d'accueil",
            );
        } else toast.error(res.message);
        setBusy((p) => ({ ...p, [`c-${id}`]: false }));
    };

    const handleToggleProgram = async (id, newState) => {
        setBusy((p) => ({ ...p, [`p-${id}`]: true }));
        const res = await HomePageAPI.toggleFeaturedProgram(id, newState);
        if (res.success) {
            setPrograms((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, isFeatured: newState } : p,
                ),
            );
            toast.success(
                newState
                    ? "Programme ajouté à la page d'accueil"
                    : "Programme retiré de la page d'accueil",
            );
        } else toast.error(res.message);
        setBusy((p) => ({ ...p, [`p-${id}`]: false }));
    };

    const items = tab === "courses" ? courses : programs;
    const filtered = items.filter((i) => {
        const t =
            tab === "courses"
                ? i.title_en || i.title_ar || ""
                : i.title || i.name || "";
        return t.toLowerCase().includes(query.toLowerCase());
    });
    const featuredCount = items.filter((i) => i.isFeatured).length;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Éléments en vedette
                    </h1>
                    <p className="text-xs text-gray-400">
                        Sélectionnez les cours et programmes affichés sur la
                        page d&apos;accueil
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const count = (
                        id === "courses" ? courses : programs
                    ).filter((i) => i.isFeatured).length;
                    return (
                        <button
                            key={id}
                            onClick={() => {
                                setTab(id);
                                setQuery("");
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                tab === id
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {count > 0 && (
                                <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                        tab === id
                                            ? "bg-white/20 text-white"
                                            : "bg-amber-100 text-amber-600"
                                    }`}
                                >
                                    {count} ⭐
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Rechercher un ${tab === "courses" ? "cours" : "programme"}…`}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>

            {/* Count banner */}
            <p className="text-xs text-gray-500 mb-3">
                {featuredCount} élément{featuredCount !== 1 ? "s" : ""} en
                vedette · {filtered.length} résultat
                {filtered.length !== 1 ? "s" : ""}
            </p>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun élément trouvé</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            type={tab}
                            busy={
                                !!busy[
                                    `${tab === "courses" ? "c" : "p"}-${item.id}`
                                ]
                            }
                            onToggle={
                                tab === "courses"
                                    ? handleToggleCourse
                                    : handleToggleProgram
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeaturedItems;
