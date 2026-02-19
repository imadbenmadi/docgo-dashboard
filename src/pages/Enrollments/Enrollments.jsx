import { useEffect, useState } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Trash2,
    RefreshCw,
    BookOpen,
    GraduationCap,
    UserX,
    User,
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import EnrollmentsAPI from "../../API/Enrollments";

const STATUS_COLORS = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    suspended: "bg-orange-100 text-orange-800",
    expired: "bg-gray-100 text-gray-600",
};

const PAYMENT_TYPE_LABELS = {
    free: "Gratuit",
    ccp: "CCP / Baridi",
    paypal: "PayPal",
    admin_enrolled: "Inscription admin",
};

const PAYMENT_TYPE_COLORS = {
    free: "bg-purple-100 text-purple-700",
    ccp: "bg-yellow-100 text-yellow-700",
    paypal: "bg-blue-100 text-blue-700",
    admin_enrolled: "bg-gray-100 text-gray-700",
};

const Enrollments = () => {
    const [activeTab, setActiveTab] = useState("courses"); // "courses" | "programs"
    const [paymentFilter, setPaymentFilter] = useState(""); // "" | "free" | "ccp" | "paypal"
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 20;

    // Data
    const [courseEnrollments, setCourseEnrollments] = useState([]);
    const [programEnrollments, setProgramEnrollments] = useState([]);
    const [coursePagination, setCoursePagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1,
    });
    const [programPagination, setProgramPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1,
    });
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [removing, setRemoving] = useState(false);

    const fetchCourseEnrollments = async () => {
        setLoadingCourses(true);
        try {
            const res = await EnrollmentsAPI.getCourseEnrollments({
                paymentType: paymentFilter || undefined,
                status: statusFilter || undefined,
                search: search || undefined,
                page,
                limit,
            });
            if (res.success) {
                setCourseEnrollments(res.data.enrollments || []);
                setCoursePagination(
                    res.data.pagination || { total: 0, page: 1, totalPages: 1 },
                );
            } else {
                toast.error(
                    res.message || "Erreur chargement inscriptions cours",
                );
            }
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchProgramEnrollments = async () => {
        setLoadingPrograms(true);
        try {
            const res = await EnrollmentsAPI.getProgramEnrollments({
                paymentType: paymentFilter || undefined,
                status: statusFilter || undefined,
                search: search || undefined,
                page,
                limit,
            });
            if (res.success) {
                setProgramEnrollments(res.data.enrollments || []);
                setProgramPagination(
                    res.data.pagination || { total: 0, page: 1, totalPages: 1 },
                );
            } else {
                toast.error(
                    res.message || "Erreur chargement inscriptions programmes",
                );
            }
        } finally {
            setLoadingPrograms(false);
        }
    };

    useEffect(() => {
        fetchCourseEnrollments();
        fetchProgramEnrollments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentFilter, statusFilter, page]);

    // Reset page when search/filters change
    const handleSearch = (val) => {
        setSearch(val);
        setPage(1);
    };

    const handleFilter = (type, val) => {
        if (type === "payment") setPaymentFilter(val);
        if (type === "status") setStatusFilter(val);
        setPage(1);
    };

    const handleRefresh = () => {
        fetchCourseEnrollments();
        fetchProgramEnrollments();
    };

    const handleRemoveCourse = async (enrollment) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Retirer l'utilisateur ?",
            html: `<p>Retirer <b>${enrollment.User?.firstName} ${enrollment.User?.lastName}</b> du cours <b>${enrollment.Course?.title}</b> ?</p><p class="text-sm text-red-600 mt-2">Cette action est irréversible.</p>`,
            showCancelButton: true,
            confirmButtonText: "Oui, retirer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#ef4444",
        });
        if (!result.isConfirmed) return;

        setRemoving(true);
        const res = await EnrollmentsAPI.removeCourseEnrollment(enrollment.id);
        setRemoving(false);

        if (res.success) {
            toast.success("Utilisateur retiré du cours");
            fetchCourseEnrollments();
        } else {
            Swal.fire("Erreur", res.message, "error");
        }
    };

    const handleRemoveProgram = async (enrollment) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Retirer l'utilisateur ?",
            html: `<p>Retirer <b>${enrollment.User?.firstName} ${enrollment.User?.lastName}</b> du programme <b>${enrollment.Program?.title}</b> ?</p><p class="text-sm text-red-600 mt-2">Cette action est irréversible.</p>`,
            showCancelButton: true,
            confirmButtonText: "Oui, retirer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#ef4444",
        });
        if (!result.isConfirmed) return;

        setRemoving(true);
        const res = await EnrollmentsAPI.removeProgramEnrollment(enrollment.id);
        setRemoving(false);

        if (res.success) {
            toast.success("Utilisateur retiré du programme");
            fetchProgramEnrollments();
        } else {
            Swal.fire("Erreur", res.message, "error");
        }
    };

    const isCourseTab = activeTab === "courses";
    const currentData = isCourseTab ? courseEnrollments : programEnrollments;
    const currentPagination = isCourseTab
        ? coursePagination
        : programPagination;
    const isLoading = isCourseTab ? loadingCourses : loadingPrograms;

    // Apply client-side search
    const displayData = search
        ? currentData.filter((e) => {
              const q = search.toLowerCase();
              return (
                  e.User?.firstName?.toLowerCase().includes(q) ||
                  e.User?.lastName?.toLowerCase().includes(q) ||
                  e.User?.email?.toLowerCase().includes(q) ||
                  (isCourseTab
                      ? e.Course?.title?.toLowerCase().includes(q)
                      : e.Program?.title?.toLowerCase().includes(q))
              );
          })
        : currentData;

    return (
        <div className="p-6 space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Inscriptions
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gérez les inscriptions aux cours et programmes
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Rafraîchir
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Cours (total)",
                        value: coursePagination.total,
                        color: "bg-indigo-50 text-indigo-700",
                        icon: BookOpen,
                    },
                    {
                        label: "Programmes (total)",
                        value: programPagination.total,
                        color: "bg-purple-50 text-purple-700",
                        icon: GraduationCap,
                    },
                    {
                        label: "Gratuits (cours)",
                        value: courseEnrollments.filter(
                            (e) => e.paymentType === "free",
                        ).length,
                        color: "bg-green-50 text-green-700",
                        icon: User,
                    },
                    {
                        label: "Payants (cours)",
                        value: courseEnrollments.filter(
                            (e) =>
                                e.paymentType !== "free" &&
                                e.paymentType !== "admin_enrolled",
                        ).length,
                        color: "bg-yellow-50 text-yellow-700",
                        icon: User,
                    },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-sm">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {[
                    {
                        key: "courses",
                        label: `Cours (${coursePagination.total})`,
                        icon: BookOpen,
                    },
                    {
                        key: "programs",
                        label: `Programmes (${programPagination.total})`,
                        icon: GraduationCap,
                    },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setPage(1);
                        }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === tab.key
                                ? "bg-white text-blue-600 shadow"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <select
                    value={paymentFilter}
                    onChange={(e) => handleFilter("payment", e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tous les types</option>
                    <option value="free">Gratuit</option>
                    <option value="ccp">CCP / Baridi</option>
                    <option value="paypal">PayPal</option>
                    <option value="admin_enrolled">Admin</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => handleFilter("status", e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="completed">Complété</option>
                    <option value="suspended">Suspendu</option>
                    <option value="expired">Expiré</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Chargement...
                    </div>
                ) : displayData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <UserX className="w-10 h-10 mb-2 opacity-50" />
                        <p>Aucune inscription trouvée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Utilisateur
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        {isCourseTab ? "Cours" : "Programme"}
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Type
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Statut
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Montant
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                                        Date
                                    </th>
                                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayData.map((enrollment) => (
                                    <motion.tr
                                        key={enrollment.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        {/* User */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {enrollment.User?.firstName?.[0]?.toUpperCase() ||
                                                        "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {
                                                            enrollment.User
                                                                ?.firstName
                                                        }{" "}
                                                        {
                                                            enrollment.User
                                                                ?.lastName
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {enrollment.User?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Course/Program */}
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 max-w-[180px] truncate">
                                                {isCourseTab
                                                    ? enrollment.Course
                                                          ?.title ||
                                                      `Cours #${enrollment.CourseId}`
                                                    : enrollment.Program
                                                          ?.title ||
                                                      `Programme #${enrollment.ProgramId}`}
                                            </p>
                                        </td>

                                        {/* Payment Type */}
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    PAYMENT_TYPE_COLORS[
                                                        enrollment.paymentType
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {PAYMENT_TYPE_LABELS[
                                                    enrollment.paymentType
                                                ] || enrollment.paymentType}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    STATUS_COLORS[
                                                        enrollment.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {enrollment.status}
                                            </span>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-3 text-gray-600">
                                            {enrollment.paymentAmount
                                                ? `${enrollment.paymentAmount} DZD`
                                                : enrollment.paymentType ===
                                                        "free" ||
                                                    enrollment.paymentType ===
                                                        "admin_enrolled"
                                                  ? "—"
                                                  : "—"}
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {enrollment.enrollmentDate
                                                ? new Date(
                                                      enrollment.enrollmentDate,
                                                  ).toLocaleDateString("fr-FR")
                                                : enrollment.createdAt
                                                  ? new Date(
                                                        enrollment.createdAt,
                                                    ).toLocaleDateString(
                                                        "fr-FR",
                                                    )
                                                  : "—"}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() =>
                                                        isCourseTab
                                                            ? handleRemoveCourse(
                                                                  enrollment,
                                                              )
                                                            : handleRemoveProgram(
                                                                  enrollment,
                                                              )
                                                    }
                                                    disabled={removing}
                                                    title="Retirer l'utilisateur"
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Retirer
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {currentPagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Total: {currentPagination.total} inscription
                        {currentPagination.total !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-700">
                            {page} / {currentPagination.totalPages}
                        </span>
                        <button
                            disabled={page >= currentPagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enrollments;
