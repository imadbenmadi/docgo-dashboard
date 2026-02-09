import { useState, useEffect } from "react";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaEye,
    FaMoneyBillWave,
    FaFilter,
    FaSearch,
    FaSpinner,
    FaUniversity,
    FaUser,
    FaTrash,
    FaDownload,
    FaExpand,
} from "react-icons/fa";
import AdminPaymentAPI from "../API/AdminPaymentManagement";
import Swal from "sweetalert2";

const AdminPaymentDashboard = () => {
    const [payments, setPayments] = useState([]);
    useEffect(() => {
        console.log("payements changed:", payments);
    }, [payments]);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    // Filters
    const [filters, setFilters] = useState({
        status: "", // Default to all statuses
        paymentMethod: "",
        itemType: "",
        search: "",
        page: 1,
        limit: 20,
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });

    useEffect(() => {
        fetchPayments();
        fetchStatistics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.paymentMethod, filters.itemType, filters.page]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            let response;

            // Use the NEW endpoint for CCP payments
            if (
                filters.paymentMethod === "ccp" ||
                filters.paymentMethod === ""
            ) {
                response = await AdminPaymentAPI.getAllCCPPayments({
                    status: filters.status,
                    itemType: filters.itemType,
                    page: filters.page,
                    limit: filters.limit,
                });
            } else {
                // Fallback to old endpoint for other payment methods
                response = await AdminPaymentAPI.getAllPayments(filters);
            }

            console.log("Fetch payments response:", response);

            if (response.success) {
                setPayments(response.data.payments || []);
                setPagination(
                    response.data.pagination || {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: 0,
                    },
                );
                // Update statistics from the response if available
                if (response.data.statistics) {
                    setStatistics(response.data.statistics);
                }
            } else {
                console.error("Failed to fetch payments:", response.message);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text:
                        response.message ||
                        "Impossible de charger les paiements",
                });
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Une erreur s'est produite lors du chargement des paiements",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await AdminPaymentAPI.getPaymentStatistics();
            if (response.success) {
                setStatistics(response.data);
            }
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    const handleApprovePayment = async (payment) => {
        const result = await Swal.fire({
            title: "Approuver le paiement ?",
            html: `
                <div class="text-left">
                    <p class="mb-2"><strong>Utilisateur :</strong> ${
                        payment.User?.firstName
                    } ${payment.User?.lastName}</p>
                    <p class="mb-2"><strong>Montant :</strong> ${
                        payment.amount
                    } ${payment.currency}</p>
                    <p class="mb-2"><strong>Numéro CCP :</strong> ${
                        payment.CCPPayment?.CCP_number || "N/A"
                    }</p>
                    <p class="mb-4"><strong>Type d'élément :</strong> ${
                        payment.itemType
                    }</p>
                    <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                        Notes d'approbation (optionnel) :
                    </label>
                    <textarea 
                        id="notes" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows="3"
                        placeholder="Saisir des notes concernant cette approbation..."
                    ></textarea>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Oui, approuver",
            cancelButtonText: "Annuler",
            preConfirm: () => {
                const notes = document.getElementById("notes").value;
                return notes;
            },
        });

        if (result.isConfirmed) {
            setProcessing(true);
            try {
                let response;

                // Use NEW endpoints based on item type
                if (payment.itemType === "course") {
                    response = await AdminPaymentAPI.approveCoursePayment(
                        payment.CCPPayment?.id || payment.id,
                        result.value,
                    );
                } else if (payment.itemType === "program") {
                    response = await AdminPaymentAPI.approveProgramPayment(
                        payment.ProgramCCPPayment?.id || payment.id,
                        result.value,
                    );
                } else {
                    // Fallback to old method for other payment types
                    response = await AdminPaymentAPI.verifyCCPPayment(
                        payment.id,
                        result.value,
                    );
                }

                if (response.success) {
                    // First refresh the data
                    await Promise.all([fetchPayments(), fetchStatistics()]);

                    // Then show success message
                    await Swal.fire({
                        icon: "success",
                        title: "Approuvé !",
                        text: "Le paiement a été approuvé avec succès. L'utilisateur a été inscrit.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Erreur",
                        text:
                            response.message ||
                            "Échec de l'approbation du paiement",
                    });
                }
            } catch (error) {
                console.error("Error approving payment:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Une erreur s'est produite lors de l'approbation du paiement",
                });
            } finally {
                setProcessing(false);
            }
        }
    };

    const handleRejectPayment = async (payment) => {
        const result = await Swal.fire({
            title: "Rejeter le paiement ?",
            html: `
                <div class="text-left">
                    <p class="mb-2"><strong>Utilisateur :</strong> ${
                        payment.User?.firstName
                    } ${payment.User?.lastName}</p>
                    <p class="mb-2"><strong>Montant :</strong> ${
                        payment.amount
                    } ${payment.currency}</p>
                    <p class="mb-4"><strong>Numéro CCP :</strong> ${
                        payment.CCPPayment?.CCP_number || "N/A"
                    }</p>
                    <label for="rejectionReason" class="block text-sm font-medium text-gray-700 mb-2">
                        Motif du rejet <span class="text-red-500">*</span> :
                    </label>
                    <textarea 
                        id="rejectionReason" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        rows="3"
                        placeholder="Veuillez expliquer pourquoi ce paiement est rejeté..."
                        required
                    ></textarea>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Oui, rejeter",
            cancelButtonText: "Annuler",
            preConfirm: () => {
                const reason = document.getElementById("rejectionReason").value;
                if (!reason || reason.trim() === "") {
                    Swal.showValidationMessage("Le motif du rejet est requis");
                    return false;
                }
                return reason;
            },
        });

        if (result.isConfirmed) {
            setProcessing(true);
            try {
                let response;

                // Use NEW endpoints based on item type
                if (payment.itemType === "course") {
                    response = await AdminPaymentAPI.rejectCoursePayment(
                        payment.CCPPayment?.id || payment.id,
                        result.value,
                    );
                } else if (payment.itemType === "program") {
                    response = await AdminPaymentAPI.rejectProgramPayment(
                        payment.ProgramCCPPayment?.id || payment.id,
                        result.value,
                    );
                } else {
                    // Fallback to old method for other payment types
                    response = await AdminPaymentAPI.rejectCCPPayment(
                        payment.id,
                        result.value,
                    );
                }

                if (response.success) {
                    // First refresh the data
                    await Promise.all([fetchPayments(), fetchStatistics()]);

                    // Then show success message
                    await Swal.fire({
                        icon: "success",
                        title: "Rejeté !",
                        text: "Le paiement a été rejeté. L'utilisateur peut soumettre à nouveau.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Erreur",
                        text: response.message || "Échec du rejet du paiement",
                    });
                }
            } catch (error) {
                console.error("Error rejecting payment:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Une erreur s'est produite lors du rejet du paiement",
                });
            } finally {
                setProcessing(false);
            }
        }
    };

    const handleDeletePayment = async (payment) => {
        const result = await Swal.fire({
            title: "Supprimer le paiement ?",
            html: `
                <p>Cette action supprimera définitivement ce paiement et retirera l'accès de l'utilisateur s'il est inscrit.</p>
                <p class="text-sm text-gray-600 mt-2">ID de transaction : ${payment.transactionId}</p>
                <textarea 
                    id="deletion-reason" 
                    class="w-full mt-3 p-2 border rounded" 
                    placeholder="Saisir le motif de suppression (requis)"
                    rows="3"
                ></textarea>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
            preConfirm: () => {
                const reason = document.getElementById("deletion-reason").value;
                if (!reason || reason.trim() === "") {
                    Swal.showValidationMessage(
                        "Le motif de suppression est requis",
                    );
                    return false;
                }
                return reason.trim();
            },
        });

        if (result.isConfirmed) {
            const deletionReason = result.value;
            setProcessing(true);

            try {
                let response;
                if (payment.itemType === "course") {
                    response = await AdminPaymentAPI.deleteCoursePayment(
                        payment.id,
                        deletionReason,
                    );
                } else {
                    response = await AdminPaymentAPI.deleteProgramPayment(
                        payment.id,
                        deletionReason,
                    );
                }

                if (response.success) {
                    // Refresh data before showing success message
                    await Promise.all([fetchPayments(), fetchStatistics()]);

                    await Swal.fire({
                        icon: "success",
                        title: "Supprimé !",
                        text: "Le paiement a été supprimé avec succès.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error("Delete payment error:", error);
                await Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text:
                        error.message ||
                        "Une erreur s'est produite lors de la suppression du paiement",
                });
            } finally {
                setProcessing(false);
            }
        }
    };

    const handleViewReceipt = (payment) => {
        setSelectedPayment(payment);
        setShowImageModal(true);
    };

    const handleDownloadReceipt = async (payment) => {
        try {
            const imageUrl =
                payment.imageUrl ||
                `${API_URL}/comprehensive-payments/image/${
                    payment.itemType || "course"
                }/${
                    payment.transactionId || payment.CCPPayment?.transactionId
                }`;

            // Fetch the image
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error("Failed to download image");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `payment_receipt_${
                payment.transactionId || "unknown"
            }.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: "success",
                title: "Téléchargé !",
                text: "Le reçu a été téléchargé avec succès",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Download error:", error);
            Swal.fire({
                icon: "error",
                title: "Échec du téléchargement",
                text: "Impossible de télécharger le reçu. Veuillez essayer de l'ouvrir dans un nouvel onglet.",
            });
        }
    };

    const handleViewFullSize = (payment) => {
        const imageUrl =
            payment.imageUrl ||
            `${API_URL}/comprehensive-payments/image/${
                payment.itemType || "course"
            }/${payment.transactionId || payment.CCPPayment?.transactionId}`;

        window.open(imageUrl, "_blank");
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                icon: FaClock,
                text: "Pending",
                bgColor: "bg-yellow-100",
                textColor: "text-yellow-800",
                borderColor: "border-yellow-200",
            },
            approved: {
                icon: FaCheckCircle,
                text: "Approved",
                bgColor: "bg-green-100",
                textColor: "text-green-800",
                borderColor: "border-green-200",
            },
            completed: {
                icon: FaCheckCircle,
                text: "Completed",
                bgColor: "bg-green-100",
                textColor: "text-green-800",
                borderColor: "border-green-200",
            },
            rejected: {
                icon: FaTimesCircle,
                text: "Rejected",
                bgColor: "bg-red-100",
                textColor: "text-red-800",
                borderColor: "border-red-200",
            },
            failed: {
                icon: FaTimesCircle,
                text: "Rejected",
                bgColor: "bg-red-100",
                textColor: "text-red-800",
                borderColor: "border-red-200",
            },
            cancelled: {
                icon: FaTimesCircle,
                text: "Cancelled",
                bgColor: "bg-gray-100",
                textColor: "text-gray-800",
                borderColor: "border-gray-200",
            },
            deleted: {
                icon: FaTrash,
                text: "Deleted",
                bgColor: "bg-red-50",
                textColor: "text-red-900",
                borderColor: "border-red-300",
            },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
            >
                <Icon className="text-sm" />
                <span className="text-sm font-medium">{config.text}</span>
            </div>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount, currency) => {
        const value = Number(amount || 0);
        return `${value.toFixed(2)} DZD`;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    <FaMoneyBillWave className="inline-block mr-3 text-green-600" />
                    Payment Management
                </h1>
                <p className="text-gray-600">
                    Manage and verify CCP screenshot payments
                </p>

                {/* Debug Info */}
                {/* <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <strong>Debug Info:</strong> Filters:{" "}
                        {JSON.stringify(filters)} | Payments: {payments.length}{" "}
                        | Loading: {loading.toString()}
                    </p>
                    <button
                        onClick={() => {
                            fetchPayments();
                        }}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                        Refresh Payments
                    </button>
                </div> */}
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">
                                    Total Payments
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {statistics.overview?.totalPayments || 0}
                                </p>
                            </div>
                            <FaMoneyBillWave className="text-3xl text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">
                                    Completed
                                </p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {statistics.overview?.completedPayments ||
                                        0}
                                </p>
                            </div>
                            <FaCheckCircle className="text-3xl text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">
                                    Pending
                                </p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">
                                    {statistics.overview?.pendingPayments || 0}
                                </p>
                            </div>
                            <FaClock className="text-3xl text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">
                                    Failed
                                </p>
                                <p className="text-2xl font-bold text-red-600 mt-1">
                                    {statistics.overview?.failedPayments || 0}
                                </p>
                            </div>
                            <FaTimesCircle className="text-3xl text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">
                                    Total Revenue
                                </p>
                                <p className="text-2xl font-bold text-purple-600 mt-1">
                                    {formatCurrency(
                                        statistics.overview?.totalRevenue || 0,
                                        "DZD",
                                    )}
                                </p>
                            </div>
                            <FaMoneyBillWave className="text-3xl text-purple-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FaFilter className="text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                        Filters
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    status: e.target.value,
                                    page: 1,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                        </label>
                        <select
                            value={filters.paymentMethod}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    paymentMethod: e.target.value,
                                    page: 1,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Methods</option>
                            <option value="ccp">CCP</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Type
                        </label>
                        <select
                            value={filters.itemType}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    itemType: e.target.value,
                                    page: 1,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="course">Course</option>
                            <option value="program">Program</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        search: e.target.value,
                                    })
                                }
                                placeholder="Search..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={fetchPayments}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <FaSearch />
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner className="animate-spin text-4xl text-blue-600" />
                            <span className="ml-3 text-gray-600">
                                Loading payments...
                            </span>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12">
                            <FaMoneyBillWave className="mx-auto text-6xl text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">
                                No payments found
                            </p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {payment.User?.firstName?.charAt(
                                                        0,
                                                    ) || "U"}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {
                                                            payment.User
                                                                ?.firstName
                                                        }{" "}
                                                        {payment.User?.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {payment.User?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {formatCurrency(
                                                    payment.amount,
                                                    payment.currency,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaUniversity className="text-green-600" />
                                                <span className="text-sm text-gray-900">
                                                    CCP
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                                {payment.itemType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(payment.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                {/* View Receipt Button - Show for ALL CCP payments */}
                                                {(payment.paymentMethod ===
                                                    "ccp" ||
                                                    payment.CCP_number ||
                                                    payment.transactionId?.startsWith(
                                                        "CCP_",
                                                    )) && (
                                                    <button
                                                        onClick={() =>
                                                            handleViewReceipt(
                                                                payment,
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                                                        title="View Payment Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                )}
                                                {(payment.status ===
                                                    "pending" ||
                                                    payment.status ===
                                                        "cancelled") && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleApprovePayment(
                                                                    payment,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 disabled:opacity-50"
                                                            title={
                                                                payment.status ===
                                                                "cancelled"
                                                                    ? "Reconsider & Approve"
                                                                    : "Approve"
                                                            }
                                                        >
                                                            <FaCheckCircle />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleRejectPayment(
                                                                    payment,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 disabled:opacity-50"
                                                            title={
                                                                payment.status ===
                                                                "cancelled"
                                                                    ? "Reconsider & Reject"
                                                                    : "Reject"
                                                            }
                                                        >
                                                            <FaTimesCircle />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeletePayment(
                                                                    payment,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50 disabled:opacity-50"
                                                            title="Delete Payment"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                )}
                                                {payment.status ===
                                                    "rejected" && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleApprovePayment(
                                                                    payment,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 disabled:opacity-50"
                                                            title="Reconsider & Approve"
                                                        >
                                                            <FaCheckCircle />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeletePayment(
                                                                    payment,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50 disabled:opacity-50"
                                                            title="Delete Payment"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                )}
                                                {payment.status ===
                                                    "approved" && (
                                                    <button
                                                        onClick={() =>
                                                            handleDeletePayment(
                                                                payment,
                                                            )
                                                        }
                                                        disabled={processing}
                                                        className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50 disabled:opacity-50"
                                                        title="Delete Payment & Remove Access"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                                {payment.status ===
                                                    "deleted" && (
                                                    <span className="text-gray-400 text-sm">
                                                        Deleted
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() =>
                                    setFilters({
                                        ...filters,
                                        page: Math.max(1, filters.page - 1),
                                    })
                                }
                                disabled={filters.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() =>
                                    setFilters({
                                        ...filters,
                                        page: Math.min(
                                            pagination.totalPages,
                                            filters.page + 1,
                                        ),
                                    })
                                }
                                disabled={
                                    filters.page === pagination.totalPages
                                }
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {(filters.page - 1) * filters.limit + 1}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {Math.min(
                                            filters.page * filters.limit,
                                            pagination.totalItems,
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {pagination.totalItems}
                                    </span>{" "}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={() =>
                                            setFilters({
                                                ...filters,
                                                page: Math.max(
                                                    1,
                                                    filters.page - 1,
                                                ),
                                            })
                                        }
                                        disabled={filters.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    {[...Array(pagination.totalPages)].map(
                                        (_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setFilters({
                                                        ...filters,
                                                        page: idx + 1,
                                                    })
                                                }
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    filters.page === idx + 1
                                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ),
                                    )}
                                    <button
                                        onClick={() =>
                                            setFilters({
                                                ...filters,
                                                page: Math.min(
                                                    pagination.totalPages,
                                                    filters.page + 1,
                                                ),
                                            })
                                        }
                                        disabled={
                                            filters.page ===
                                            pagination.totalPages
                                        }
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Receipt Image Modal */}
            {showImageModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Payment Receipt
                                </h3>
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimesCircle className="text-2xl" />
                                </button>
                            </div>

                            {/* Student Contact Information - Prominent Display */}
                            <div className="mb-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaUser className="text-blue-600 text-xl" />
                                    <h3 className="text-lg font-bold text-blue-900">
                                        Student Contact Information
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-600 block mb-1">
                                            Full Name
                                        </span>
                                        <p className="text-gray-900 font-semibold text-lg">
                                            {selectedPayment.User?.firstName}{" "}
                                            {selectedPayment.User?.lastName}
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-600 block mb-1">
                                            User ID
                                        </span>
                                        <p className="text-gray-900 font-mono font-semibold">
                                            #{selectedPayment.userId}
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-600 block mb-1">
                                            📧 Email Address
                                        </span>
                                        <a
                                            href={`mailto:${selectedPayment.User?.email}`}
                                            className="text-blue-600 hover:text-blue-800 font-semibold underline break-all"
                                        >
                                            {selectedPayment.User?.email}
                                        </a>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-600 block mb-1">
                                            📱 Phone Number
                                        </span>
                                        <a
                                            href={`tel:${selectedPayment.User?.phoneNumber}`}
                                            className="text-blue-600 hover:text-blue-800 font-semibold underline"
                                        >
                                            {selectedPayment.User
                                                ?.phoneNumber || "Not provided"}
                                        </a>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-800 mt-3 italic">
                                    💡 You can contact this student directly via
                                    email or phone after verification
                                </p>
                            </div>

                            {/* Payment Details */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">
                                    Payment Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Amount:
                                        </span>
                                        <p className="text-gray-900 font-bold text-lg">
                                            {formatCurrency(
                                                selectedPayment.amount,
                                                selectedPayment.currency,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Payment Method:
                                        </span>
                                        <p className="text-gray-900 font-semibold">
                                            CCP (Manual Verification)
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            CCP Number:
                                        </span>
                                        <p className="text-gray-900 font-mono">
                                            {selectedPayment.CCP_number ||
                                                selectedPayment.CCPPayment
                                                    ?.CCP_number ||
                                                "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Transaction ID:
                                        </span>
                                        <p className="text-gray-900 font-mono">
                                            {selectedPayment.transactionId ||
                                                selectedPayment.CCPPayment
                                                    ?.transactionId ||
                                                "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Receipt Image Display */}
                            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold text-gray-800">
                                        Payment Receipt
                                    </h4>
                                    {(selectedPayment.transactionId ||
                                        selectedPayment.CCPPayment
                                            ?.transactionId) && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleViewFullSize(
                                                        selectedPayment,
                                                    )
                                                }
                                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                                title="View Full Size"
                                            >
                                                <FaExpand />
                                                View Full Size
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDownloadReceipt(
                                                        selectedPayment,
                                                    )
                                                }
                                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                                title="Download Receipt"
                                            >
                                                <FaDownload />
                                                Download
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {selectedPayment.transactionId ||
                                selectedPayment.CCPPayment?.transactionId ? (
                                    <>
                                        <img
                                            src={
                                                selectedPayment.imageUrl ||
                                                `${API_URL}/comprehensive-payments/image/${
                                                    selectedPayment.itemType ||
                                                    "course"
                                                }/${
                                                    selectedPayment.transactionId ||
                                                    selectedPayment.CCPPayment
                                                        .transactionId
                                                }`
                                            }
                                            alt="Payment Receipt"
                                            className="w-full h-auto rounded shadow-lg cursor-pointer hover:opacity-90 transition"
                                            onClick={() =>
                                                handleViewFullSize(
                                                    selectedPayment,
                                                )
                                            }
                                            onError={(e) => {
                                                console.error(
                                                    "Image load error:",
                                                    {
                                                        transactionId:
                                                            selectedPayment.transactionId ||
                                                            selectedPayment
                                                                .CCPPayment
                                                                ?.transactionId,
                                                        itemType:
                                                            selectedPayment.itemType,
                                                        url: e.target.src,
                                                        hasImageUrl:
                                                            !!selectedPayment.imageUrl,
                                                    },
                                                );

                                                // If primary source (imageUrl from DB) fails, try server path
                                                if (
                                                    selectedPayment.imageUrl &&
                                                    e.target.src ===
                                                        selectedPayment.imageUrl
                                                ) {
                                                    e.target.src = `${API_URL}/comprehensive-payments/image/${
                                                        selectedPayment.itemType ||
                                                        "course"
                                                    }/${
                                                        selectedPayment.transactionId ||
                                                        selectedPayment
                                                            .CCPPayment
                                                            .transactionId
                                                    }`;
                                                } else {
                                                    // All sources failed, show placeholder
                                                    e.target.src =
                                                        "https://via.placeholder.com/800x600?text=Receipt+Not+Available";
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-gray-600 mt-3 text-center bg-blue-50 p-2 rounded">
                                            💡 <strong>Tip:</strong> Click image
                                            to view full size, or use the
                                            buttons above to view/download
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                                        <p className="text-gray-500">
                                            No receipt image available
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center gap-3 mt-6">
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Close
                                </button>
                                {selectedPayment.status === "pending" && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowImageModal(false);
                                                handleRejectPayment(
                                                    selectedPayment,
                                                );
                                            }}
                                            disabled={processing}
                                            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold text-lg shadow-lg transition disabled:opacity-50"
                                        >
                                            <FaTimesCircle className="text-xl" />
                                            Reject Payment
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowImageModal(false);
                                                handleApprovePayment(
                                                    selectedPayment,
                                                );
                                            }}
                                            disabled={processing}
                                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold text-lg shadow-lg transition disabled:opacity-50"
                                        >
                                            <FaCheckCircle className="text-xl" />
                                            Approve & Grant Access
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPaymentDashboard;
