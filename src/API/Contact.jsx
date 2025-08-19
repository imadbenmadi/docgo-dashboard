import apiClient from "../utils/apiClient";

const contactAPI = {
    // Get all contact messages with filters and pagination
    getContactMessages: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", params.page);
        if (params.limit) searchParams.append("limit", params.limit);
        if (params.status) searchParams.append("status", params.status);
        if (params.priority) searchParams.append("priority", params.priority);
        if (params.context) searchParams.append("context", params.context);
        if (params.userType) searchParams.append("userType", params.userType);
        if (params.search) searchParams.append("search", params.search);
        if (params.sortBy) searchParams.append("sortBy", params.sortBy);
        if (params.sortOrder)
            searchParams.append("sortOrder", params.sortOrder);

        return apiClient.get(
            `/Admin/Contact/admin/messages?${searchParams.toString()}`
        );
    },

    // Get contact statistics
    getContactStatistics: (timeRange = "30d") => {
        return apiClient.get(
            `/Admin/Contact/admin/statistics?timeRange=${timeRange}`
        );
    },

    // Update contact message (status, priority, response)
    updateContactMessage: (id, data) => {
        return apiClient.put(`/Admin/Contact/admin/messages/${id}`, data);
    },

    // Delete contact message
    deleteContactMessage: (id) => {
        return apiClient.delete(`/Admin/Contact/admin/messages/${id}`);
    },

    // Bulk actions
    bulkUpdateStatus: (ids, status) => {
        return apiClient.put(`/Admin/Contact/admin/messages/bulk-status`, {
            ids,
            status,
        });
    },

    // Get message details
    getMessageDetails: (id) => {
        return apiClient.get(`/Admin/Contact/admin/messages/${id}`);
    },
};

export default contactAPI;
