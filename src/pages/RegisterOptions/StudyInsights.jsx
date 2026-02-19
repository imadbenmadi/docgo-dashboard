import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
} from "recharts";
import {
    TrendingUp,
    Users,
    Globe,
    BookOpen,
    Layers,
    ArrowLeft,
    RefreshCw,
    Flame,
    Target,
    Award,
} from "lucide-react";
import toast from "react-hot-toast";
import RegisterOptionsAPI from "../../API/RegisterOptions";

function StatCard({ icon: Icon, label, value, color, subtitle }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                <div className="text-sm font-medium text-gray-600">{label}</div>
                {subtitle && (
                    <div className="text-xs text-gray-400 mt-0.5">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    );
}

function DemandBadge({ rank }) {
    if (rank === 0)
        return (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">
                <Flame className="w-3 h-3" /> Très forte demande
            </span>
        );
    if (rank <= 2)
        return (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-semibold">
                <Flame className="w-3 h-3" /> Forte demande
            </span>
        );
    if (rank <= 5)
        return (
            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                Demande moyenne
            </span>
        );
    return null;
}

function HorizontalDemandList({ data, label, colorClass, icon: Icon }) {
    const max = data[0]?.count || 1;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">{label}</h3>
                <span className="ml-auto text-xs text-gray-400">
                    {data.length} résultats
                </span>
            </div>
            <div className="space-y-3">
                {data.map((item, idx) => (
                    <div key={item.value} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                        idx === 0
                                            ? "bg-yellow-400 text-white"
                                            : idx === 1
                                              ? "bg-gray-300 text-white"
                                              : idx === 2
                                                ? "bg-amber-600 text-white"
                                                : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {idx + 1}
                                </span>
                                <span className="text-gray-700 font-medium">
                                    {item.value}
                                </span>
                                <DemandBadge rank={idx} />
                            </div>
                            <span className="font-semibold text-gray-800">
                                {item.count}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    idx === 0
                                        ? "bg-gradient-to-r from-red-500 to-orange-400"
                                        : idx <= 2
                                          ? "bg-gradient-to-r from-orange-400 to-yellow-400"
                                          : "bg-gradient-to-r from-blue-400 to-cyan-400"
                                }`}
                                style={{
                                    width: `${Math.round((item.count / max) * 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Aucune donnée disponible
                    </div>
                )}
            </div>
        </div>
    );
}

function RecommendationCard({ studyFields, studyDomains, countries }) {
    const topField = studyFields[0];
    const topDomain = studyDomains[0];
    const topCountry = countries[0];

    if (!topField && !topDomain) return null;

    return (
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5" />
                <h3 className="font-semibold text-lg">
                    Recommandations stratégiques
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topField && (
                    <div className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-yellow-300" />
                            <span className="text-xs font-semibold text-yellow-200">
                                DOMAINE PRIORITAIRE
                            </span>
                        </div>
                        <p className="font-bold text-base">{topField.value}</p>
                        <p className="text-xs text-white/70 mt-1">
                            {topField.count} utilisateurs intéressés — Ajoutez
                            plus de programmes
                        </p>
                    </div>
                )}
                {topDomain && (
                    <div className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-yellow-300" />
                            <span className="text-xs font-semibold text-yellow-200">
                                SPÉCIALISATION CLEF
                            </span>
                        </div>
                        <p className="font-bold text-base">{topDomain.value}</p>
                        <p className="text-xs text-white/70 mt-1">
                            {topDomain.count} utilisateurs — Forte
                            spécialisation à développer
                        </p>
                    </div>
                )}
                {topCountry && (
                    <div className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-yellow-300" />
                            <span className="text-xs font-semibold text-yellow-200">
                                MARCHÉ CIBLE
                            </span>
                        </div>
                        <p className="font-bold text-base">
                            {topCountry.value}
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                            {topCountry.count} utilisateurs ciblent ce pays
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function StudyInsightsPage() {
    const navigate = useNavigate();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const data = await RegisterOptionsAPI.getInsights();
            setInsights(data);
        } catch (e) {
            toast.error("Erreur de chargement : " + (e.message || "inconnue"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const topFields = insights?.topStudyFields || [];
    const topDomains = insights?.topStudyDomains || [];
    const topCountries = insights?.topCountries || [];
    const monthly = (insights?.registrationsPerMonth || []).map((d) => ({
        ...d,
        month: d.month || d.period,
    }));
    const totalUsers = insights?.totalUsers || 0;
    const usersWithField = insights?.usersWithStudyField || 0;
    const usersWithDomain = insights?.usersWithStudyDomain || 0;
    const usersWithCountry = insights?.usersWithCountry || 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/RegisterOptions")}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Analyse de la demande
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Ce que vos utilisateurs veulent étudier — données
                            extraites des inscriptions
                        </p>
                    </div>
                </div>
                <button
                    onClick={load}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                    <RefreshCw
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Actualiser
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                    Chargement des analyses...
                </div>
            ) : (
                <>
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={Users}
                            label="Utilisateurs total"
                            value={totalUsers.toLocaleString()}
                            color="from-blue-500 to-cyan-600"
                        />
                        <StatCard
                            icon={BookOpen}
                            label="Ont un domaine d'études"
                            value={usersWithField.toLocaleString()}
                            color="from-violet-500 to-purple-600"
                            subtitle={
                                totalUsers
                                    ? `${Math.round((usersWithField / totalUsers) * 100)}% des inscrits`
                                    : ""
                            }
                        />
                        <StatCard
                            icon={Layers}
                            label="Ont une spécialisation"
                            value={usersWithDomain.toLocaleString()}
                            color="from-emerald-500 to-teal-600"
                            subtitle={
                                totalUsers
                                    ? `${Math.round((usersWithDomain / totalUsers) * 100)}% des inscrits`
                                    : ""
                            }
                        />
                        <StatCard
                            icon={Globe}
                            label="Ont un pays cible"
                            value={usersWithCountry.toLocaleString()}
                            color="from-orange-500 to-amber-600"
                            subtitle={
                                totalUsers
                                    ? `${Math.round((usersWithCountry / totalUsers) * 100)}% des inscrits`
                                    : ""
                            }
                        />
                    </div>

                    {/* Recommendations */}
                    <RecommendationCard
                        studyFields={topFields}
                        studyDomains={topDomains}
                        countries={topCountries}
                    />

                    {/* Top demand lists */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <HorizontalDemandList
                            data={topFields}
                            label="Domaines d'études"
                            colorClass="bg-gradient-to-br from-violet-500 to-purple-600"
                            icon={BookOpen}
                        />
                        <HorizontalDemandList
                            data={topDomains}
                            label="Spécialisations"
                            colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                            icon={Layers}
                        />
                        <HorizontalDemandList
                            data={topCountries}
                            label="Pays cibles"
                            colorClass="bg-gradient-to-br from-blue-500 to-cyan-600"
                            icon={Globe}
                        />
                    </div>

                    {/* Bar charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {topFields.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-violet-500" />
                                    Top domaines d&apos;études
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={topFields.slice(0, 10)}
                                        layout="vertical"
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="value"
                                            width={130}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <Tooltip
                                            formatter={(v) => [
                                                `${v} utilisateurs`,
                                                "Inscrits",
                                            ]}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#8b5cf6"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {topDomains.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-emerald-500" />
                                    Top spécialisations
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={topDomains.slice(0, 10)}
                                        layout="vertical"
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="value"
                                            width={130}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <Tooltip
                                            formatter={(v) => [
                                                `${v} utilisateurs`,
                                                "Inscrits",
                                            ]}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#10b981"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Monthly registrations line chart */}
                    {monthly.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Inscriptions mensuelles (12 derniers mois)
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={monthly}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(v) => [
                                            `${v} inscriptions`,
                                            "Inscrits",
                                        ]}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        name="Inscriptions"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Countries bar chart */}
                    {topCountries.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500" />
                                Top pays cibles (Top 15)
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topCountries.slice(0, 15)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="value"
                                        tick={{ fontSize: 11 }}
                                        angle={-35}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(v) => [
                                            `${v} utilisateurs`,
                                            "Inscrits",
                                        ]}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {!topFields.length &&
                        !topDomains.length &&
                        !topCountries.length && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
                                <p className="text-lg font-medium">
                                    Aucune donnée disponible
                                </p>
                                <p className="text-sm mt-1">
                                    Les insights apparaîtront au fur et à mesure
                                    que les utilisateurs s&apos;inscriront.
                                </p>
                            </div>
                        )}
                </>
            )}
        </div>
    );
}
