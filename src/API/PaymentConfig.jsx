import apiClient from "../utils/apiClient";

// Payment Configuration API
export const PaymentConfigAPI = {
    // Get all payment configurations
    getPaymentConfigs: async () => {
        try {
            const response = await apiClient.get("/Admin/PaymentConfig");
            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message ||
                    "Payment configurations fetched successfully",
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch payment configurations",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get payment configuration by ID
    getPaymentConfigById: async (id) => {
        try {
            const response = await apiClient.get(`/Admin/PaymentConfig/${id}`);
            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message ||
                    "Payment configuration fetched successfully",
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch payment configuration",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Create or update payment configuration
    createPaymentConfig: async (configData) => {
        try {
            const response = await apiClient.post(
                "/Admin/PaymentConfig",
                configData
            );
            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message ||
                    "Payment configuration saved successfully",
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to save payment configuration",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Update payment configuration
    updatePaymentConfig: async (id, updateData) => {
        try {
            const response = await apiClient.put(
                `/Admin/PaymentConfig/${id}`,
                updateData
            );
            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message ||
                    "Payment configuration updated successfully",
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to update payment configuration",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Delete payment configuration
    deletePaymentConfig: async (id) => {
        try {
            const response = await apiClient.delete(
                `/Admin/PaymentConfig/${id}`
            );
            return {
                success: true,
                message:
                    response.data.message ||
                    "Payment configuration deleted successfully",
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to delete payment configuration",
                error: error.response?.data?.error || error.message,
            };
        }
    },

    // Get payment configuration by method (public route)
    getPaymentConfigByMethod: async (method) => {
        try {
            const response = await apiClient.get(
                `/Admin/PaymentConfig/public/${method}`
            );
            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message ||
                    `${method} configuration fetched successfully`,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch payment configuration",
                error: error.response?.data?.error || error.message,
            };
        }
    },
};

export default PaymentConfigAPI;
