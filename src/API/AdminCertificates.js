import apiClient from "../utils/apiClient";

const AdminCertificatesAPI = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page);
        if (filters.limit) params.append("limit", filters.limit);
        if (filters.courseId) params.append("courseId", filters.courseId);
        if (filters.revoked !== undefined)
            params.append("revoked", filters.revoked);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.order) params.append("order", filters.order);
        return apiClient.get(`/Admin/certificates?${params.toString()}`);
    },

    revoke: async (certificateId, reason = "") => {
        return apiClient.patch(`/Admin/certificates/${certificateId}/revoke`, {
            reason,
        });
    },

    restore: async (certificateId) => {
        return apiClient.patch(
            `/Admin/certificates/${certificateId}/restore`,
            {},
        );
    },

    manualIssue: async (userId, courseId, notes = "") => {
        return apiClient.post("/Admin/certificates/issue", {
            userId,
            courseId,
            notes,
        });
    },

    // ── Certificate Template methods ─────────────────────────────────────
    getTemplates: async () => {
        return apiClient.get("/Admin/certificate-templates");
    },

    getTemplate: async (id) => {
        return apiClient.get(`/Admin/certificate-templates/${id}`);
    },

    getTemplateForCourse: async (courseId) => {
        return apiClient.get(
            `/Admin/certificate-templates/for-course/${courseId}`,
        );
    },

    createTemplate: async (data) => {
        return apiClient.post("/Admin/certificate-templates", data);
    },

    updateTemplate: async (id, data) => {
        return apiClient.put(`/Admin/certificate-templates/${id}`, data);
    },

    deleteTemplate: async (id) => {
        return apiClient.delete(`/Admin/certificate-templates/${id}`);
    },
};

export default AdminCertificatesAPI;
