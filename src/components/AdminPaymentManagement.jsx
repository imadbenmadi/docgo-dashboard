import { useEffect, useState, useCallback } from "react";
import { FaEye, FaCheck, FaTimes, FaSpinner, FaSearch } from "react-icons/fa";
import { AdminPaymentAPI } from "../API/AdminPayments";
import Swal from "sweetalert2";

const AdminPaymentManagement = () => {
    const [activeTab, setActiveTab] = useState("ccp-pending");
    const [ccpPayments, setCcpPayments] = useState([]);
    const [applications, setApplications] = useState([]);
    const [allPayments, setAllPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    
    // Pagination states
    const [ccpPagination, setCcpPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        total: 0
    });
    
    const [appsPagination, setAppsPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        total: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        paymentMethod: "",
        itemType: ""
    });

    useEffect(() => {
        const loadTabData = async () => {
            setLoading(true);
            try {
                if (activeTab === "ccp-pending") {
                    await loadPendingCCPPayments();
                } else if (activeTab === "applications") {
                    await loadApplications();
                } else if (activeTab === "all-payments") {
                    await loadAllPayments();
                } else if (activeTab === "statistics") {
                    await loadStatistics();
                }
            } finally {
                setLoading(false);
            }
        };
        
        loadTabData();
    }, [activeTab, loadAllPayments, loadApplications, loadPendingCCPPayments, loadStatistics]);

    const loadPendingCCPPayments = useCallback(async () => {
        const result = await AdminPaymentAPI.getPendingCCPPayments({
            page: ccpPagination.page,
            limit: ccpPagination.limit
        });
        
        if (result.success) {
            setCcpPayments(result.data.payments || []);
            setCcpPagination(prev => ({
                ...prev,
                totalPages: result.data.pagination?.totalPages || 1,
                total: result.data.pagination?.total || 0
            }));
        } else {
            console.error("Error loading pending CCP payments:", result.message);
        }
    }, [ccpPagination.page, ccpPagination.limit]);

    const loadApplications = useCallback(async () => {
        const result = await AdminPaymentAPI.getCourseApplications({
            page: appsPagination.page,
            limit: appsPagination.limit,
            ...filters
        });
        
        if (result.success) {
            setApplications(result.data.applications || []);
            setAppsPagination(prev => ({
                ...prev,
                totalPages: result.data.pagination?.totalPages || 1,
                total: result.data.pagination?.totalApplications || 0
            }));
        } else {
            console.error("Error loading applications:", result.message);
        }
    }, [appsPagination.page, appsPagination.limit, filters]);

    const loadAllPayments = useCallback(async () => {
        const result = await AdminPaymentAPI.getAllPayments({
            ...filters,
            page: 1,
            limit: 50
        });
        
        if (result.success) {
            setAllPayments(result.data.payments || []);
        } else {
            console.error("Error loading all payments:", result.message);
        }
    }, [filters]);

    const loadStatistics = useCallback(async () => {
        const result = await AdminPaymentAPI.getPaymentStatistics();
        
        if (result.success) {
            setStats(result.data);
        } else {
            console.error("Error loading statistics:", result.message);
        }
    }, []);

    const handleVerifyCCPPayment = async (paymentId) => {
        const { value: notes } = await Swal.fire({
            title: "Verify CCP Payment",
            text: "Add verification notes (optional):",
            input: "textarea",
            inputPlaceholder: "Payment verified successfully...",
            showCancelButton: true,
            confirmButtonText: "Verify Payment",
            confirmButtonColor: "#10B981"
        });

        if (notes !== undefined) {
            setLoading(true);
            const result = await AdminPaymentAPI.verifyCCPPayment(paymentId, notes);
            
            if (result.success) {
                Swal.fire("Success!", "CCP Payment verified successfully", "success");
                await loadPendingCCPPayments();
            } else {
                Swal.fire("Error!", result.message, "error");
            }
            setLoading(false);
        }
    };

    const handleRejectCCPPayment = async (paymentId) => {
        const { value: reason } = await Swal.fire({
            title: "Reject CCP Payment",
            text: "Rejection reason:",
            input: "textarea",
            inputPlaceholder: "Please provide a reason for rejection...",
            inputValidator: (value) => {
                if (!value) return "You need to provide a rejection reason!";
            },
            showCancelButton: true,
            confirmButtonText: "Reject Payment",
            confirmButtonColor: "#EF4444"
        });

        if (reason) {
            setLoading(true);
            const result = await AdminPaymentAPI.rejectCCPPayment(paymentId, reason);
            
            if (result.success) {
                Swal.fire("Rejected!", "CCP Payment rejected successfully", "success");
                await loadPendingCCPPayments();
            } else {
                Swal.fire("Error!", result.message, "error");
            }
            setLoading(false);
        }
    };

    const handleApproveApplication = async (applicationId) => {
        const { value: notes } = await Swal.fire({
            title: "Approve Application",
            text: "Add approval notes (optional):",
            input: "textarea",
            inputPlaceholder: "Application approved...",
            showCancelButton: true,
            confirmButtonText: "Approve",
            confirmButtonColor: "#10B981"
        });

        if (notes !== undefined) {
            setLoading(true);
            const result = await AdminPaymentAPI.approveCourseApplication(applicationId, notes);
            
            if (result.success) {
                Swal.fire("Success!", "Application approved successfully", "success");
                await loadApplications();
            } else {
                Swal.fire("Error!", result.message, "error");
            }
            setLoading(false);
        }
    };

    const handleRejectApplication = async (applicationId) => {
        const { value: formValues } = await Swal.fire({
            title: "Reject Application",
            html: `
                <textarea id="reason" class="swal2-textarea" placeholder="Rejection reason..." required></textarea>
                <textarea id="notes" class="swal2-textarea" placeholder="Additional notes (optional)..."></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Reject",
            confirmButtonColor: "#EF4444",
            preConfirm: () => {
                const reason = document.getElementById('reason').value;
                const notes = document.getElementById('notes').value;
                if (!reason) {
                    Swal.showValidationMessage('Please provide a rejection reason');
                    return false;
                }
                return { reason, notes };
            }
        });

        if (formValues) {
            setLoading(true);
            const result = await AdminPaymentAPI.rejectCourseApplication(
                applicationId, 
                formValues.reason, 
                formValues.notes
            );
            
            if (result.success) {
                Swal.fire("Rejected!", "Application rejected successfully", "success");
                await loadApplications();
            } else {
                Swal.fire("Error!", result.message, "error");
            }
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <FaSpinner className="animate-spin text-2xl text-blue-600" />
                    <span className="ml-2">Loading...</span>
                </div>
            );
        }

        switch (activeTab) {
            case "ccp-pending":
                return renderPendingCCPPayments();
            case "applications":
                return renderApplications();
            case "all-payments":
                return renderAllPayments();
            case "statistics":
                return renderStatistics();
            default:
                return null;
        }
    };

    const renderPendingCCPPayments = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Pending CCP Payments</h3>
                <span className="text-sm text-gray-500">
                    {ccpPayments.length} pending payments
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                CCP Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Screenshot
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ccpPayments.map((payment) => (
                            <tr key={payment.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {payment.User?.firstName} {payment.User?.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {payment.User?.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {payment.itemType}: {payment.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {payment.amount} {payment.currency}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono text-gray-900">
                                        {payment.CCPPayment?.CCP_number}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {payment.CCPPayment?.screenShot && (
                                        <button
                                            onClick={() => window.open(`http://localhost:3000${payment.CCPPayment.screenShot}`, '_blank')}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <FaEye />
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleVerifyCCPPayment(payment.id)}
                                            className="text-green-600 hover:text-green-800"
                                            title="Verify Payment"
                                        >
                                            <FaCheck />
                                        </button>
                                        <button
                                            onClick={() => handleRejectCCPPayment(payment.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Reject Payment"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderApplications = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Course Applications</h3>
                <div className="flex space-x-2">
                    <select 
                        value={filters.status} 
                        onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                        className="px-3 py-1 border rounded"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button
                        onClick={loadApplications}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <FaSearch />
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Course
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applied Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((app) => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {app.User?.FirstName} {app.User?.LastName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {app.User?.Email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {app.Course?.Title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {app.Course?.Price} {app.Course?.Currency || 'DZD'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        app.paymentType === 'ccp' ? 'bg-green-100 text-green-800' : 
                                        app.paymentType === 'paypal' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {app.paymentType?.toUpperCase() || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {app.status === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleApproveApplication(app.id)}
                                                className="text-green-600 hover:text-green-800"
                                                title="Approve Application"
                                            >
                                                <FaCheck />
                                            </button>
                                            <button
                                                onClick={() => handleRejectApplication(app.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Reject Application"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAllPayments = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Payments</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {allPayments.map((payment) => (
                            <tr key={payment.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {payment.User?.firstName} {payment.User?.lastName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {payment.itemType}: {payment.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {payment.amount} {payment.currency}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        payment.paymentMethod === 'ccp' ? 'bg-green-100 text-green-800' : 
                                        payment.paymentMethod === 'paypal' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {payment.paymentMethod?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(payment.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderStatistics = () => {
        if (!stats) return null;
        
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold">Payment Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900">Total Payments</h4>
                        <p className="text-2xl font-bold text-blue-600">{stats.overview?.totalPayments || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-900">Total Revenue</h4>
                        <p className="text-2xl font-bold text-green-600">{stats.overview?.totalRevenue || 0} DZD</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-900">Pending</h4>
                        <p className="text-2xl font-bold text-yellow-600">{stats.overview?.pendingPayments || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-900">Completed</h4>
                        <p className="text-2xl font-bold text-purple-600">{stats.overview?.completedPayments || 0}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                <p className="text-gray-600">Manage payments, applications, and verify CCP transfers</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: "ccp-pending", label: "Pending CCP Payments" },
                        { id: "applications", label: "Course Applications" },
                        { id: "all-payments", label: "All Payments" },
                        { id: "statistics", label: "Statistics" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminPaymentManagement;
