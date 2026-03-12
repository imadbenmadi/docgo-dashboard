/**
 * Complete Course Creation API
 *
 * This file provides functions to interact with the Complete Course Creation API.
 * Supports both JSON-only and file upload modes.
 *
 * Location: src/API/CompleteCourseAPI.js
 */

import apiClient from "../utils/apiClient";

/**
 * Complete Course API
 * Handles creating and retrieving courses with all their content
 */
export const completeCourseAPI = {
    /**
     * Create a course with JSON data (no file uploads)
     *
     * Use this when:
     * - You don't have any files to upload
     * - Files are already hosted and you're just providing URLs
     *
     * @param {Object} courseData - Complete course data
     * @returns {Promise<Object>} Created course with all sections and items
     */
    async createCourseJSON(courseData) {
        try {

            const response = await apiClient.post(
                `/Admin/complete-course`,
                { courseData }, // Wrap in courseData object
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a course with file uploads
     *
     * Use this when:
     * - You have files to upload (thumbnail, videos, PDFs)
     * - Files are File objects from file input
     *
     * @param {FormData} formData - FormData containing courseData (JSON string) and files
     * @returns {Promise<Object>} Created course with uploaded files
     */
    async createCourseWithUploads(formData) {
        try {

            // Log what we're sending (for debugging)
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                } else {
                }
            }

            const response = await apiClient.post(
                `/Admin/Courses/complete-course`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 60000, // 60 seconds for file uploads
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        );
                    },
                },
            );

            return response.data;
        } catch (error) {

            // Enhanced error handling
            if (error.code === "ERR_NETWORK") {
                throw new Error(
                    "Backend server not reachable. Please ensure the server is running.",
                );
            } else if (error.code === "ECONNABORTED") {
                throw new Error("Request timeout - file upload took too long");
            } else if (error.response) {
                throw new Error(
                    error.response.data?.error ||
                        `Server error: ${error.response.status}`,
                );
            }

            throw error;
        }
    },

    /**
     * Get a complete course by ID
     *
     * @param {number} courseId - The ID of the course to retrieve
     * @returns {Promise<Object>} Complete course with all sections and items
     */
    async getCourse(courseId) {
        try {

            const response = await apiClient.get(
                `/Admin/complete-course/${courseId}`,
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all courses with filters (for listing page)
     *
     * @param {Object} params - Query parameters for filtering
     * @returns {Promise<Object>} Courses list with pagination
     */
    async getCourses(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== "") {
                    queryParams.append(key, params[key]);
                }
            });


            const response = await apiClient.get(
                `/Admin/complete-course?${queryParams}`,
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update a course (JSON only)
     *
     * @param {number} courseId - Course ID to update
     * @param {Object} courseData - Updated course data
     * @returns {Promise<Object>} Updated course
     */
    async updateCourse(courseId, courseData) {
        try {

            const response = await apiClient.put(
                `/Admin/complete-course/${courseId}`,
                { courseData },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update a course with file uploads
     *
     * @param {number} courseId - Course ID to update
     * @param {FormData} formData - FormData with courseData and files
     * @returns {Promise<Object>} Updated course
     */
    async updateCourseWithUploads(courseId, formData) {
        try {

            const response = await apiClient.put(
                `/Admin/complete-course/${courseId}/with-uploads`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 60000,
                },
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a course
     *
     * @param {number} courseId - Course ID to delete
     * @returns {Promise<Object>} Deletion result
     */
    async deleteCourse(courseId) {
        try {

            const response = await apiClient.delete(
                `/Admin/complete-course/${courseId}`,
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

/**
 * Helper function to prepare FormData from your course form
 *
 * @param {Object} courseData - Course data object
 * @param {Object} files - Object containing file uploads { thumbnail, courseImage, coverImage }
 * @returns {FormData} Ready to send FormData
 */
export function prepareCompleteCourseFormData(courseData, files = {}) {
    const formData = new FormData();

    // Add course data as JSON string
    formData.append("courseData", JSON.stringify(courseData));

    // Add thumbnail if exists
    if (files.thumbnail) {
        formData.append("thumbnail", files.thumbnail);
    }

    // Add course image if exists
    if (files.courseImage) {
        formData.append("courseImage", files.courseImage);
    }

    // Add cover image if exists
    if (files.coverImage) {
        formData.append("coverImage", files.coverImage);
    }

    return formData;
}

export default completeCourseAPI;
