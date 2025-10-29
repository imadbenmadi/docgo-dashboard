import apiClient from "../utils/apiClient";

// Courses API
export const coursesAPI = {
  // Get all courses with pagination and filters
  getCourses: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });

    const response = await apiClient.get(`/Admin/Courses?${queryParams}`);
    return response.data;
  },

  // Get single course details
  getCourseDetails: async (courseId) => {
    try {
      const response = await apiClient.get(`/Courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    try {
      const response = await apiClient.post("/Admin/Courses", courseData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error creating course:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Create complete course with videos, PDFs, and quiz
  createCompleteCourse: async (formData) => {
    try {
      const response = await apiClient.post(
        "/Admin/Courses/complete-course",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      const response = await apiClient.delete(`/Admin/Courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Video Management APIs
  // Get all videos for a course
  getCourseVideos: async (courseId) => {
    try {
      const response = await apiClient.get(`/Admin/Courses/${courseId}/videos`);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  // Fix video counts (utility)
  fixVideoCounts: async () => {
    try {
      const response = await apiClient.post("/Admin/Courses/fix-video-counts");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload course Image
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
      throw error;
    }
  },

  // Upload cover Image
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
      throw error;
    }
  },

  // Delete course Image
  deleteCourseImage: async (courseId) => {
    try {
      const response = await apiClient.delete(
        `/Admin/upload/Courses/${courseId}/Image`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete cover Image
  deleteCoverImage: async (courseId) => {
    try {
      const response = await apiClient.delete(
        `/Admin/upload/Courses/${courseId}/CoverImage`
      );
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  deleteSection: async (sectionId) => {
    try {
      const response = await apiClient.delete(`/Admin/sections/${sectionId}`);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  deleteSectionItem: async (itemId) => {
    const response = await apiClient.delete(`/Admin/sections/items/${itemId}`);
    return response.data;
  },
};
