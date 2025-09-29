import apiClient from "../utils/apiClient";

const statisticsAPI = {
    // Get overview statistics
    getOverview: (period = "30d") => {
        return apiClient.get(`/Admin/statistics/overview?period=${period}`);
    },

    // Get visit analytics
    getVisitAnalytics: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.startDate)
            searchParams.append("startDate", params.startDate);
        if (params.endDate) searchParams.append("endDate", params.endDate);
        if (params.page) searchParams.append("page", params.page);
        if (params.groupBy) searchParams.append("groupBy", params.groupBy);
        if (params.limit) searchParams.append("limit", params.limit);

        return apiClient.get(
            `/Admin/statistics/visits?${searchParams.toString()}`
        );
    },

    // Get content analytics
    getContentAnalytics: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.startDate)
            searchParams.append("startDate", params.startDate);
        if (params.endDate) searchParams.append("endDate", params.endDate);
        if (params.type) searchParams.append("type", params.type);

        return apiClient.get(
            `/Admin/statistics/content?${searchParams.toString()}`
        );
    },

    // Get user analytics
    getUserAnalytics: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.startDate)
            searchParams.append("startDate", params.startDate);
        if (params.endDate) searchParams.append("endDate", params.endDate);
        if (params.groupBy) searchParams.append("groupBy", params.groupBy);

        return apiClient.get(
            `/Admin/statistics/users?${searchParams.toString()}`
        );
    },

    // Get payment analytics
    getPaymentAnalytics: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.startDate)
            searchParams.append("startDate", params.startDate);
        if (params.endDate) searchParams.append("endDate", params.endDate);
        if (params.groupBy) searchParams.append("groupBy", params.groupBy);

        return apiClient.get(
            `/Admin/statistics/payments?${searchParams.toString()}`
        );
    },

    // Get favorites analytics
    getFavoritesAnalytics: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.startDate)
            searchParams.append("startDate", params.startDate);
        if (params.endDate) searchParams.append("endDate", params.endDate);
        if (params.type) searchParams.append("type", params.type);
        if (params.limit) searchParams.append("limit", params.limit);

        return apiClient.get(
            `/Admin/statistics/favorites?${searchParams.toString()}`
        );
    },
};

export default statisticsAPI;
