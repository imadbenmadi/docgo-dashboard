import apiClient from "../utils/apiClient";

const RegisterOptionsAPI = {
    // Get current options (admin)
    getOptions: async () => {
        try {
            const res = await apiClient.get("/Admin/RegisterOptions");
            return res.data;
        } catch (err) {
            return {
                success: false,
                message: err?.response?.data?.message || err.message,
            };
        }
    },

    // Update one or more lists
    updateOptions: async (payload) => {
        try {
            const res = await apiClient.patch(
                "/Admin/RegisterOptions",
                payload,
            );
            return res.data;
        } catch (err) {
            return {
                success: false,
                message: err?.response?.data?.message || err.message,
            };
        }
    },

    // BI insights
    getInsights: async () => {
        try {
            const res = await apiClient.get("/Admin/RegisterOptions/insights");
            return res.data;
        } catch (err) {
            return {
                success: false,
                message: err?.response?.data?.message || err.message,
            };
        }
    },
};

export default RegisterOptionsAPI;
