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
            console.log("📤 Sending course data (JSON):", courseData);

            const response = await apiClient.post(
                `/Admin/complete-course`,
                { courseData }, // Wrap in courseData object
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            console.log("✅ Course created:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error creating course (JSON):", {
                message: error.response?.data?.error || error.message,
                details: error.response?.data?.details,
                status: error.response?.status,
            });
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
            console.log("📤 Uploading course with files...");

            // Log what we're sending (for debugging)
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(
                        `  📎 ${key}:`,
                        value.name,
                        `(${(value.size / 1024).toFixed(2)} KB)`,
                    );
                } else {
                    console.log(
                        `  📝 ${key}:`,
                        value.length > 100
                            ? value.substring(0, 100) + "..."
                            : value,
                    );
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
                        console.log(`📊 Upload progress: ${percentCompleted}%`);
                    },
                },
            );

            console.log("✅ Course uploaded successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error uploading course:", {
                message: error.response?.data?.error || error.message,
                details: error.response?.data?.details,
                status: error.response?.status,
            });

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
            console.log(`📥 Fetching course ${courseId}...`);

            const response = await apiClient.get(
                `/Admin/complete-course/${courseId}`,
            );

            console.log("✅ Course fetched:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching course:", {
                message: error.response?.data?.error || error.message,
                status: error.response?.status,
            });
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

            console.log(`📥 Fetching courses with filters...`);
            console.log("Query params:", queryParams.toString());

            const response = await apiClient.get(
                `/Admin/complete-course?${queryParams}`,
            );

            console.log("✅ Raw response:", response);
            console.log("✅ Response data:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching courses:", {
                message: error.response?.data?.error || error.message,
                status: error.response?.status,
                fullError: error,
            });
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
            console.log(`📤 Updating course ${courseId}...`, courseData);

            const response = await apiClient.put(
                `/Admin/complete-course/${courseId}`,
                { courseData },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            console.log("✅ Course updated:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error updating course:", {
                message: error.response?.data?.error || error.message,
                details: error.response?.data?.details,
                status: error.response?.status,
            });
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
            console.log(`📤 Updating course ${courseId} with files...`);

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

            console.log("✅ Course updated with files:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error updating course:", {
                message: error.response?.data?.error || error.message,
                status: error.response?.status,
            });
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
            console.log(`🗑️ Deleting course ${courseId}...`);

            const response = await apiClient.delete(
                `/Admin/complete-course/${courseId}`,
            );

            console.log("✅ Course deleted:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error deleting course:", {
                message: error.response?.data?.error || error.message,
                status: error.response?.status,
            });
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
