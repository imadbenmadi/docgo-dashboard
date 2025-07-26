import apiClient from "../utils/apiClient";

// Courses API
export const coursesAPI = {
    // Get all courses with pagination and filters
    getAllCourses: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== "") {
                    queryParams.append(key, params[key]);
                }
            });

            const response = await apiClient.get(
                `/Admin/Courses?${queryParams}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching courses:", error);
            throw error;
        }
    },

    // Get single course details
    getCourseDetails: async (courseId) => {
        try {
            const response = await apiClient.get(`/Admin/Courses/${courseId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching course details:", error);
            throw error;
        }
    },

    // Create new course
    createCourse: async (courseData) => {
        try {
            const response = await apiClient.post("/Admin/Courses", courseData);
            return response.data;
        } catch (error) {
            console.error("Error creating course:", error);
            throw error;
        }
    },

    // Update course
    updateCourse: async (courseId, courseData) => {
        try {
            const response = await apiClient.put(
                `/Admin/Courses/${courseId}`,
                courseData
            );
            return response.data;
        } catch (error) {
            console.error("Error updating course:", error);
            throw error;
        }
    },

    // Delete course
    deleteCourse: async (courseId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/Courses/${courseId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting course:", error);
            throw error;
        }
    },
};
