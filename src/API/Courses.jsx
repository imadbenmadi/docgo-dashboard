import apiClient from "../utils/apiClient";

// Courses API
export const coursesAPI = {
    // Get all courses with pagination and filters
    getCourses: async (params = {}) => {
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

    // Video Management APIs
    // Get all videos for a course
    getCourseVideos: async (courseId) => {
        try {
            const response = await apiClient.get(
                `/Admin/Courses/${courseId}/videos`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching course videos:", error);
            throw error;
        }
    },

    // Get video details
    getVideoDetails: async (courseId, videoId) => {
        try {
            const response = await apiClient.get(
                `/Admin/Courses/${courseId}/videos/${videoId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching video details:", error);
            throw error;
        }
    },

    // Add video metadata
    addVideoMetadata: async (courseId, videoData) => {
        try {
            const response = await apiClient.post(
                `/Admin/Courses/${courseId}/videos`,
                videoData
            );
            return response.data;
        } catch (error) {
            console.error("Error adding video metadata:", error);
            throw error;
        }
    },

    // Update video
    updateVideo: async (courseId, videoId, videoData) => {
        try {
            const response = await apiClient.put(
                `/Admin/Courses/${courseId}/videos/${videoId}`,
                videoData
            );
            return response.data;
        } catch (error) {
            console.error("Error updating video:", error);
            throw error;
        }
    },

    // Delete video
    deleteVideo: async (courseId, videoId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/Courses/${courseId}/videos/${videoId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting video:", error);
            throw error;
        }
    },

    // Reorder videos
    reorderVideos: async (courseId, videoOrders) => {
        try {
            const response = await apiClient.put(
                `/Admin/Courses/${courseId}/videos/reorder`,
                { videoOrders }
            );
            return response.data;
        } catch (error) {
            console.error("Error reordering videos:", error);
            throw error;
        }
    },

    // Fix video counts (utility)
    fixVideoCounts: async () => {
        try {
            const response = await apiClient.post(
                "/Admin/Courses/fix-video-counts"
            );
            return response.data;
        } catch (error) {
            console.error("Error fixing video counts:", error);
            throw error;
        }
    },

    // Upload course image
    uploadCourseImage: async (courseId, formData) => {
        try {
            const response = await apiClient.post(
                `/Admin/upload/Courses/${courseId}/Image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error uploading course image:", error);
            throw error;
        }
    },

    // Upload cover image
    uploadCoverImage: async (courseId, formData) => {
        try {
            const response = await apiClient.post(
                `/Admin/upload/Courses/${courseId}/CoverImage`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error uploading cover image:", error);
            throw error;
        }
    },

    // Delete course image
    deleteCourseImage: async (courseId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/upload/Courses/${courseId}/Image`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting course image:", error);
            throw error;
        }
    },

    // Delete cover image
    deleteCoverImage: async (courseId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/upload/Courses/${courseId}/CoverImage`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting cover image:", error);
            throw error;
        }
    },

    // Course sections API
    getCourseSections: async (courseId) => {
        try {
            const response = await apiClient.get(
                `/Admin/Courses/${courseId}/sections`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching course sections:", error);
            throw error;
        }
    },

    createSection: async (courseId, sectionData) => {
        try {
            const response = await apiClient.post(
                `/Admin/Courses/${courseId}/sections`,
                sectionData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating section:", error);
            throw error;
        }
    },

    updateSection: async (sectionId, sectionData) => {
        try {
            const response = await apiClient.put(
                `/Admin/sections/${sectionId}`,
                sectionData
            );
            return response.data;
        } catch (error) {
            console.error("Error updating section:", error);
            throw error;
        }
    },

    deleteSection: async (sectionId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/sections/${sectionId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting section:", error);
            throw error;
        }
    },

    // Section items API
    getSectionItems: async (sectionId) => {
        try {
            const response = await apiClient.get(
                `/Admin/sections/${sectionId}/items`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching section items:", error);
            throw error;
        }
    },

    createSectionItem: async (sectionId, itemData) => {
        try {
            const response = await apiClient.post(
                `/Admin/sections/${sectionId}/items`,
                itemData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating section item:", error);
            throw error;
        }
    },

    updateSectionItem: async (itemId, itemData) => {
        try {
            const response = await apiClient.put(
                `/Admin/sections/items/${itemId}`,
                itemData
            );
            return response.data;
        } catch (error) {
            console.error("Error updating section item:", error);
            throw error;
        }
    },

    deleteSectionItem: async (itemId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/sections/items/${itemId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting section item:", error);
            throw error;
        }
    },
};
