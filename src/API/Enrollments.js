import apiClient from "../utils/apiClient";

const EnrollmentsAPI = {
    // =========================================================================
    // COURSE ENROLLMENTS
    // =========================================================================

    /** Get all course enrollments (admin) */
    getCourseEnrollments: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append("status", filters.status);
            if (filters.paymentType)
                params.append("paymentType", filters.paymentType);
            if (filters.search) params.append("search", filters.search);
            if (filters.page) params.append("page", filters.page);
            if (filters.limit) params.append("limit", filters.limit);

            const response = await apiClient.get(
                `/enrollment/admin/courses/enrollments?${params.toString()}`,
            );
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error("Get course enrollments error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch course enrollments",
            };
        }
    },

    /** Remove a user from a course (delete enrollment) */
    removeCourseEnrollment: async (enrollmentId) => {
        try {
            const response = await apiClient.delete(
                `/enrollment/admin/courses/enrollments/${enrollmentId}`,
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Remove course enrollment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to remove user from course",
            };
        }
    },

    // =========================================================================
    // PROGRAM ENROLLMENTS
    // =========================================================================

    /** Get all program enrollments (admin) */
    getProgramEnrollments: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append("status", filters.status);
            if (filters.paymentType)
                params.append("paymentType", filters.paymentType);
            if (filters.search) params.append("search", filters.search);
            if (filters.page) params.append("page", filters.page);
            if (filters.limit) params.append("limit", filters.limit);

            const response = await apiClient.get(
                `/enrollment/admin/programs/enrollments?${params.toString()}`,
            );
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error("Get program enrollments error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch program enrollments",
            };
        }
    },

    /** Remove a user from a program (delete enrollment) */
    removeProgramEnrollment: async (enrollmentId) => {
        try {
            const response = await apiClient.delete(
                `/enrollment/admin/programs/enrollments/${enrollmentId}`,
            );
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Remove program enrollment error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to remove user from program",
            };
        }
    },
};

export default EnrollmentsAPI;
