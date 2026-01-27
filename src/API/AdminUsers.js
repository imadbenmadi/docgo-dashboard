/**
 * Admin User Management API
 * Frontend API calls for admin user management
 */

import axios from "../utils/axios.jsx";

const ADMIN_BASE_URL = "/api/v1/admin";

export const adminUsersAPI = {
    /**
     * Get detailed user information with all enrollments and data
     */
    getUserDetails: async (userId) => {
        try {
            const response = await axios.get(
                `${ADMIN_BASE_URL}/users/${userId}`,
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Assign a course to a user manually (without payment)
     */
    assignCourseToUser: async (userId, courseId, enrollmentData = {}) => {
        try {
            const response = await axios.post(
                `${ADMIN_BASE_URL}/users/courses/assign`,
                {
                    userId,
                    courseId,
                    ...enrollmentData,
                },
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Assign a program to a user manually (without payment)
     */
    assignProgramToUser: async (userId, programId, enrollmentData = {}) => {
        try {
            const response = await axios.post(
                `${ADMIN_BASE_URL}/users/programs/assign`,
                {
                    userId,
                    programId,
                    ...enrollmentData,
                },
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Remove user from a course
     */
    removeUserFromCourse: async (userId, courseId) => {
        try {
            const response = await axios.post(
                `${ADMIN_BASE_URL}/users/courses/remove`,
                {
                    userId,
                    courseId,
                },
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Remove user from a program
     */
    removeUserFromProgram: async (userId, programId) => {
        try {
            const response = await axios.post(
                `${ADMIN_BASE_URL}/users/programs/remove`,
                {
                    userId,
                    programId,
                },
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Delete user with cascade delete of all related data
     */
    deleteUser: async (userId, reason = "") => {
        try {
            const response = await axios.delete(
                `${ADMIN_BASE_URL}/users/${userId}`,
                {
                    data: { reason },
                },
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update user information
     */
    updateUserInfo: async (userId, userData) => {
        try {
            const response = await axios.put(
                `${ADMIN_BASE_URL}/users/${userId}`,
                userData,
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Toggle user status (active/blocked)
     */
    toggleUserStatus: async (userId, status) => {
        try {
            const response = await axios.patch(
                `${ADMIN_BASE_URL}/users/${userId}/status`,
                { status },
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default adminUsersAPI;
