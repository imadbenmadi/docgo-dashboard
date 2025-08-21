import apiClient from "../utils/apiClient";

// Admin Payment Management API
export const AdminPaymentAPI = {
    // =================================================================
    // ADMIN PAYMENT MANAGEMENT METHODS
    // =================================================================

    // Get all payments (paginated)
    getAllPayments: async (params = {}) => {
        try {
            const response = await apiClient.get("/payments/admin/all", { params });
            return {
                success: true,
                data: response.data.data,
                message: "Payments fetched successfully",
            };
        } catch (error) {
            console.error("Get all payments error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch payments",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get pending CCP payments for verification
    getPendingCCPPayments: async (params = {}) => {
        try {
            const response = await apiClient.get("/payments/admin/ccp/pending", { params });
            return {
                success: true,
                data: response.data.data,
                message: "Pending CCP payments fetched successfully",
            };
        } catch (error) {
            console.error("Get pending CCP payments error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch pending CCP payments",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Verify CCP payment
    verifyCCPPayment: async (paymentId, notes = "") => {
        try {
            const response = await apiClient.put(
                `/payments/admin/ccp/${paymentId}/verify`,
                { notes }
            );
            return {
                success: true,
                data: response.data.data,
                message: "CCP payment verified successfully",
            };
        } catch (error) {
            console.error("Verify CCP payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to verify CCP payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Reject CCP payment
    rejectCCPPayment: async (paymentId, rejectionReason = "") => {
        try {
            const response = await apiClient.put(
                `/payments/admin/ccp/${paymentId}/reject`,
                { rejectionReason }
            );
            return {
                success: true,
                data: response.data.data,
                message: "CCP payment rejected successfully",
            };
        } catch (error) {
            console.error("Reject CCP payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to reject CCP payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get payment statistics
    getPaymentStatistics: async () => {
        try {
            const response = await apiClient.get("/payments/admin/statistics");
            return {
                success: true,
                data: response.data.data,
                message: "Payment statistics fetched successfully",
            };
        } catch (error) {
            console.error("Get payment statistics error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch payment statistics",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // =================================================================
    // COURSE AND PROGRAM APPLICATION MANAGEMENT
    // =================================================================

    // Get all course applications
    getCourseApplications: async (params = {}) => {
        try {
            const response = await apiClient.get("/Admin/Courses/payment-applications", { params });
            return {
                success: true,
                data: response.data,
                message: "Course applications fetched successfully",
            };
        } catch (error) {
            console.error("Get course applications error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Failed to fetch course applications",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get course application details
    getCourseApplicationDetails: async (applicationId) => {
        try {
            const response = await apiClient.get(`/Admin/Courses/payment-applications/${applicationId}`);
            return {
                success: true,
                data: response.data,
                message: "Course application details fetched successfully",
            };
        } catch (error) {
            console.error("Get course application details error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.error ||
                    "Failed to fetch course application details",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Approve course application
    approveCourseApplication: async (applicationId, notes = "") => {
        try {
            const response = await apiClient.post(`/Admin/Courses/payment-applications/${applicationId}/approve`, {
                notes,
            });
            return {
                success: true,
                data: response.data,
                message: "Course application approved successfully",
            };
        } catch (error) {
            console.error("Approve course application error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.error ||
                    "Failed to approve course application",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Reject course application
    rejectCourseApplication: async (applicationId, reason = "", notes = "") => {
        try {
            const response = await apiClient.post(`/Admin/Courses/payment-applications/${applicationId}/reject`, {
                reason,
                notes,
            });
            return {
                success: true,
                data: response.data,
                message: "Course application rejected successfully",
            };
        } catch (error) {
            console.error("Reject course application error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.error ||
                    "Failed to reject course application",
                error: error.response?.data?.error || error.message,
            };
        }
    },
};

export default AdminPaymentAPI;
