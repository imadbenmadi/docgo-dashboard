import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { moderationAPI } from "../../API/Moderation";

const isEnabled =
    String(import.meta.env.VITE_CHECK_UPLOADS || "").toLowerCase() === "true";

const MediaModerationCenter = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
    });

    const [status, setStatus] = useState("flagged");

    const canRender = useMemo(() => isEnabled, []);

    const load = async (page = 1) => {
        setLoading(true);
        try {
            const data = await moderationAPI.list({
                page,
                limit: pagination.limit,
                status,
            });
            setItems(data.items || []);
            setPagination((p) => ({
                ...p,
                page: (data.pagination && data.pagination.page) || page,
                total: (data.pagination && data.pagination.total) || 0,
            }));
        } catch (e) {
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: (e && e.message) || "Failed to load moderation items",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!canRender) return;
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, canRender]);

    if (!canRender) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold mb-2">
                    Media Moderation Center
                </h1>
                <p className="text-gray-600">
                    This feature is disabled (VITE_CHECK_UPLOADS=false).
                </p>
            </div>
        );
    }

    const handleMarkSafe = async (id) => {
        const result = await Swal.fire({
            title: "Mark as safe?",
            input: "text",
            inputLabel: "Admin notes (optional)",
            showCancelButton: true,
            confirmButtonText: "Mark safe",
        });
        if (!result.isConfirmed) return;
        await moderationAPI.markSafe(id, result.value || "");
        await load(pagination.page);
    };

    const handleRemove = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Remove media?",
            text: "This will delete the stored file (if present).",
            showCancelButton: true,
            confirmButtonText: "Remove",
            confirmButtonColor: "#ef4444",
        });
        if (!result.isConfirmed) return;
        await moderationAPI.removeMedia(id);
        await load(pagination.page);
    };

    const handleBlockUser = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Block user?",
            text: "This will set user isActive=false (login blocked).",
            showCancelButton: true,
            confirmButtonText: "Block",
            confirmButtonColor: "#ef4444",
        });
        if (!result.isConfirmed) return;
        await moderationAPI.blockUser(id);
        await load(pagination.page);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-xl font-semibold">
                        Media Moderation Center
                    </h1>
                    <p className="text-sm text-gray-600">
                        Review flagged/blocked uploads.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="border rounded-md px-3 py-2"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="flagged">flagged</option>
                        <option value="blocked">blocked</option>
                        <option value="api_error">api_error</option>
                        <option value="safe">safe</option>
                        <option value="removed">removed</option>
                    </select>

                    <button
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => load(pagination.page)}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr className="text-left">
                            <th className="p-3">ID</th>
                            <th className="p-3">User</th>
                            <th className="p-3">Kind</th>
                            <th className="p-3">Decision</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Score</th>
                            <th className="p-3">Path</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className="p-4" colSpan={8}>
                                    Loading...
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td className="p-4" colSpan={8}>
                                    No items.
                                </td>
                            </tr>
                        ) : (
                            items.map((it) => (
                                <tr key={it.id} className="border-t">
                                    <td className="p-3">{it.id}</td>
                                    <td className="p-3">
                                        {it.user?.email || it.uploaderId || "-"}
                                    </td>
                                    <td className="p-3">{it.mediaKind}</td>
                                    <td className="p-3">{it.decision}</td>
                                    <td className="p-3">{it.status}</td>
                                    <td className="p-3">
                                        {it.scores?.maxScore != null
                                            ? Number(
                                                  it.scores.maxScore,
                                              ).toFixed(3)
                                            : "-"}
                                    </td>
                                    <td className="p-3 max-w-[280px] truncate">
                                        {it.publicPath || it.storagePath || "-"}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                                                onClick={() =>
                                                    handleMarkSafe(it.id)
                                                }
                                            >
                                                Safe
                                            </button>
                                            <button
                                                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                                onClick={() =>
                                                    handleRemove(it.id)
                                                }
                                            >
                                                Remove
                                            </button>
                                            <button
                                                className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-black"
                                                onClick={() =>
                                                    handleBlockUser(it.id)
                                                }
                                            >
                                                Block user
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div>
                    Total:{" "}
                    <span className="font-medium">{pagination.total}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => load(Math.max(1, pagination.page - 1))}
                        disabled={loading || pagination.page <= 1}
                    >
                        Prev
                    </button>
                    <div className="px-3 py-1">Page {pagination.page}</div>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => load(pagination.page + 1)}
                        disabled={loading || items.length < pagination.limit}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaModerationCenter;
