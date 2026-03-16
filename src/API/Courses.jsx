import apiClient from "../utils/apiClient";
import { buildApiUrl } from "../utils/apiBaseUrl";

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
      const response = await apiClient.get(`/Admin/Courses/${courseId}`);
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
        },
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
        courseData,
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

  restoreCourse: async (courseId) => {
    try {
      const response = await apiClient.patch(
        `/Admin/Courses/${courseId}/restore`,
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
        },
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
        },
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
        `/Admin/upload/Courses/${courseId}/Image`,
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
        `/Admin/upload/Courses/${courseId}/CoverImage`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload course intro video
  uploadCourseIntroVideo: async (courseId, formData) => {
    try {
      const response = await apiClient.post(
        `/Admin/upload/Courses/${courseId}/IntroVideo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete course intro video
  deleteCourseIntroVideo: async (courseId) => {
    try {
      const response = await apiClient.delete(
        `/Admin/upload/Courses/${courseId}/IntroVideo`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAdminMediaStreamUrl: async (courseId, kind, mediaPathOrFilename) => {
    const rawValue = String(mediaPathOrFilename || "");
    if (/^https?:\/\//i.test(rawValue)) {
      return rawValue;
    }

    const normalizedPath = rawValue.split("?")[0].split("#")[0].trim();
    const normalizedNoSlash = normalizedPath.replace(/^\/+/, "").toLowerCase();

    // Intro/program videos are public assets. They should not go through
    // the protected /media/stream token flow used for course lesson videos.
    if (
      kind === "video" &&
      (normalizedNoSlash.startsWith("courses_intro/") ||
        normalizedNoSlash.startsWith("programs/"))
    ) {
      const pathValue = normalizedPath.startsWith("/")
        ? normalizedPath
        : `/${normalizedPath}`;
      return buildApiUrl(pathValue);
    }

    const filename = rawValue
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .filter(Boolean)
      .pop();

    if (!filename) {
      return null;
    }

    const response = await apiClient.get(
      `/Admin/Courses/${courseId}/media-token`,
      {
        params: {
          kind,
          filename,
        },
      },
    );

    return buildApiUrl(response.data?.streamPath);
  },

  // Course sections API
  getCourseSections: async (courseId) => {
    try {
      const response = await apiClient.get(
        `/Admin/Courses/${courseId}/sections`,
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
        sectionData,
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
        sectionData,
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
        `/Admin/sections/${sectionId}/items`,
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
        itemData,
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
        itemData,
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

  // Upload a raw video file for a section item (no DB record created)
  // Returns { url: "/Courses_Videos/<filename>" }
  uploadSectionVideo: async (formData, onUploadProgress) => {
    const response = await apiClient.post(
      `/Admin/upload/sections/video`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
        timeout: 600000, // 10 min for large files
      },
    );
    return response.data;
  },

  // Upload a raw PDF file for a section item (no DB record created)
  // Returns { url: "/Courses_PDFs/<filename>" }
  uploadSectionPDF: async (formData, onUploadProgress) => {
    const response = await apiClient.post(
      `/Admin/upload/sections/pdf`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
        timeout: 120000,
      },
    );
    return response.data;
  },

  // Add videos and PDFs to existing course
  addCourseFiles: async (courseId, formData) => {
    try {
      const response = await apiClient.post(
        `/Admin/Courses/${courseId}/add-files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 300000, // 5 minutes timeout for large files
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course videos and PDFs
  getCourseFiles: async (courseId) => {
    try {
      const response = await apiClient.get(`/Admin/Courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a short-lived signed stream token so the dashboard can preview
  // protected videos and PDFs without enrolling in the course.
  // kind: "video" | "pdf"
  // filename: basename of the stored file (e.g. "Course-1-123456.mp4")
  getAdminStreamToken: async (courseId, kind, filename) => {
    const response = await apiClient.get(
      `/Admin/Courses/${courseId}/media-token`,
      { params: { kind, filename } },
    );
    return response.data; // { token, streamPath }
  },
};

// =============================================================================
// Progress API — admin views for user progress across courses
// =============================================================================
export const courseProgressAPI = {
  // GET /Admin/CourseProgress — all courses with avg progress stats
  getAllCoursesProgress: async () => {
    const response = await apiClient.get("/Admin/CourseProgress");
    return response.data;
  },

  // GET /Admin/CourseProgress/:courseId — per-user progress for one course
  getCourseUserProgress: async (courseId) => {
    const response = await apiClient.get(`/Admin/CourseProgress/${courseId}`);
    return response.data;
  },
};
