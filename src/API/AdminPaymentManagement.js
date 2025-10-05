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

    // Verify/Approve CCP payment
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

    // Reject CCP payment
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
};

export default AdminPaymentAPI;
