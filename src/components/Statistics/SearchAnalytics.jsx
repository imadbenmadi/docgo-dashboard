import { useState, useEffect, useCallback } from "react";
import {
    MagnifyingGlassIcon,
    MapPinIcon,
    AcademicCapIcon,
    ClockIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import statisticsAPI from "../../API/Statistics";

const SearchAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await statisticsAPI.getSearchAnalytics({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setData(res.data.data);
            setError(null);
        } catch (err) {
            setError("Échec du chargement des données de recherche");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );

    if (error)
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Réessayer
                </button>
            </div>
        );

    const {
        totalSearches,
        topWhat,
        topWhere,
        searchesOverTime,
        recentSearches,
    } = data || {};

    return (
        <div className="space-y-6">
            {/* Header + Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Analyses des recherches
                    </h2>
                    <p className="text-sm text-gray-500">
                        Ce que les visiteurs cherchent sur la page
                        d&apos;accueil
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <span className="text-gray-400 text-sm">→</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                        onClick={fetchData}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        title="Actualiser"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Total count */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">
                        Total des recherches
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                        {(totalSearches || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Top What + Top Where */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top "What" */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AcademicCapIcon className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold text-gray-800 text-sm">
                            Top — Que souhaitez-vous étudier ?
                        </h3>
                    </div>
                    {!topWhat?.length ? (
                        <p className="text-sm text-gray-400 py-4 text-center">
                            Aucune donnée
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {topWhat.map((item, i) => {
                                const max = topWhat[0]?.count || 1;
                                const pct = Math.round(
                                    (item.count / max) * 100,
                                );
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-700 truncate max-w-[70%]">
                                                {item.what || "—"}
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                            <div
                                                className="h-1.5 bg-indigo-400 rounded-full"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top "Where" */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPinIcon className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold text-gray-800 text-sm">
                            Top — Où voulez-vous étudier ?
                        </h3>
                    </div>
                    {!topWhere?.length ? (
                        <p className="text-sm text-gray-400 py-4 text-center">
                            Aucune donnée
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {topWhere.map((item, i) => {
                                const max = topWhere[0]?.count || 1;
                                const pct = Math.round(
                                    (item.count / max) * 100,
                                );
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-700 truncate max-w-[70%]">
                                                {item.where || "—"}
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                            <div
                                                className="h-1.5 bg-emerald-400 rounded-full"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Trend chart (simple text-based bars) */}
            {searchesOverTime?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 text-sm mb-4">
                        Recherches par jour (30 derniers jours)
                    </h3>
                    <div className="flex items-end gap-1 h-28">
                        {(() => {
                            const max = Math.max(
                                ...searchesOverTime.map((d) => Number(d.count)),
                                1,
                            );
                            return searchesOverTime.map((d, i) => {
                                const h = Math.max(
                                    4,
                                    Math.round((Number(d.count) / max) * 100),
                                );
                                return (
                                    <div
                                        key={i}
                                        className="flex-1 flex flex-col items-center gap-1 group relative"
                                        title={`${d.date}: ${d.count}`}
                                    >
                                        <div
                                            className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600"
                                            style={{ height: `${h}%` }}
                                        />
                                        {/* tooltip */}
                                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                                            {d.date}: {d.count}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}

            {/* Recent searches table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-800 text-sm">
                        Recherches récentes
                    </h3>
                </div>
                {!recentSearches?.length ? (
                    <p className="text-sm text-gray-400 py-8 text-center">
                        Aucune recherche enregistrée
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Ce qu&apos;il veut étudier
                                    </th>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Où
                                    </th>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Langue
                                    </th>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentSearches.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-5 py-3 text-gray-700">
                                            {s.what || (
                                                <span className="text-gray-300">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-gray-700">
                                            {s.where || (
                                                <span className="text-gray-300">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium uppercase">
                                                {s.lang || "—"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-400">
                                            {new Date(
                                                s.createdAt,
                                            ).toLocaleString("fr-FR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchAnalytics;
