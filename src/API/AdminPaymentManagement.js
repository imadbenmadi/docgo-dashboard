import apiClient from "../utils/apiClient";

const AdminPaymentAPI = {
    // Get all payments with filters
    getAllPayments: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.status) params.append("status", filters.status);
            if (filters.paymentMethod)
                params.append("paymentMethod", filters.paymentMethod);
            if (filters.itemType) params.append("itemType", filters.itemType);
            if (filters.page) params.append("page", filters.page);
            if (filters.limit) params.append("limit", filters.limit);
            if (filters.startDate)
                params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);

            const response = await apiClient.get(
                `/payments/admin/all?${params.toString()}`
            );

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            console.error("Get all payments error:", error);
            console.error("Error response:", error.response);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to fetch payments",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get pending CCP payments
    getPendingCCPPayments: async (page = 1, limit = 20) => {
        try {
            const response = await apiClient.get(
                `/payments/admin/ccp/pending?page=${page}&limit=${limit}`
            );
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            console.error("Get pending CCP payments error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch pending payments",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get all CCP payments - NEW ENDPOINT
    getAllCCPPayments: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.status) params.append("status", filters.status);
            if (filters.itemType) params.append("itemType", filters.itemType);
            if (filters.page) params.append("page", filters.page);
            if (filters.limit) params.append("limit", filters.limit);

            const response = await apiClient.get(
                `/Admin/Payments/ccp?${params.toString()}`
            );
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            console.error("Get all CCP payments error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch CCP payments",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Approve Course CCP payment - NEW ENDPOINT
    approveCoursePayment: async (paymentId, notes = "") => {
        try {
            const response = await apiClient.post(
                `/Admin/Payments/courses/${paymentId}/approve`,
                { notes }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Approve course payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to approve payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Reject Course CCP payment - NEW ENDPOINT
    rejectCoursePayment: async (paymentId, rejectionReason) => {
        try {
            const response = await apiClient.post(
                `/Admin/Payments/courses/${paymentId}/reject`,
                { rejectionReason }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Reject course payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to reject payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Approve Program CCP payment - NEW ENDPOINT
    approveProgramPayment: async (paymentId, notes = "") => {
        try {
            const response = await apiClient.post(
                `/Admin/Payments/programs/${paymentId}/approve`,
                { notes }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Approve program payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to approve payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Reject Program CCP payment - NEW ENDPOINT
    rejectProgramPayment: async (paymentId, rejectionReason) => {
        try {
            const response = await apiClient.post(
                `/Admin/Payments/programs/${paymentId}/reject`,
                { rejectionReason }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Reject program payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to reject payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // OLD METHODS - Keep for backward compatibility
    // Verify/Approve CCP payment (OLD)
    verifyCCPPayment: async (paymentId, notes = "") => {
        try {
            const response = await apiClient.put(
                `/payments/admin/ccp/${paymentId}/verify`,
                { notes }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Verify CCP payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to verify payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Reject CCP payment (OLD)
    rejectCCPPayment: async (paymentId, rejectionReason) => {
        try {
            const response = await apiClient.put(
                `/payments/admin/ccp/${paymentId}/reject`,
                { rejectionReason }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Reject CCP payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to reject payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get payment statistics
    getPaymentStatistics: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.startDate)
                params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);

            const response = await apiClient.get(
                `/payments/admin/statistics?${params.toString()}`
            );
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            console.error("Get payment statistics error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch statistics",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get payment receipt image (for CCP payments)
    getPaymentReceiptUrl: (itemType, transactionId) => {
        // Return the API endpoint URL for the receipt image
        return `/comprehensive-payments/image/${itemType}/${transactionId}`;
    },

    // Delete Course CCP payment - NEW
    deleteCoursePayment: async (paymentId, deletionReason) => {
        try {
            const response = await apiClient.delete(
                `/Admin/Payments/courses/${paymentId}`,
                { data: { deletionReason } }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Delete course payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to delete payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Delete Program CCP payment - NEW
    deleteProgramPayment: async (paymentId, deletionReason) => {
        try {
            const response = await apiClient.delete(
                `/Admin/Payments/programs/${paymentId}`,
                { data: { deletionReason } }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Delete program payment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to delete payment",
                error: error.response?.data?.error || error.message,
            };
        }
    },
};

export default AdminPaymentAPI;
