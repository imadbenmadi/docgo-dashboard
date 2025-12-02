import apiClient from "../utils/apiClient";

// Programs API
const programsAPI = {
    // Get all programs with pagination and filters
    getPrograms: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== "") {
                    queryParams.append(key, params[key]);
                }
            });

            const response = await apiClient.get(
                `/Admin/Programs?${queryParams}`
            );
            
            return response.data;
        } catch (error) {
            console.error("Error fetching programs:", error);
            throw error;
        }
    },

    // Get single program details
    getProgramDetails: async (programId) => {
        try {
            const response = await apiClient.get(
                `/Admin/Programs/${programId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching program details:", error);
            throw error;
        }
    },

    // Alias for getProgramDetails
    getProgram: async (programId) => {
        return programsAPI.getProgramDetails(programId);
    },

    // Create new program
    createProgram: async (programData) => {
        try {
            const response = await apiClient.post(
                "/Admin/Programs",
                programData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating program:", error);
            throw error;
        }
    },

    // Update program
    updateProgram: async (programId, programData) => {
        try {
            const response = await apiClient.put(
                `/Admin/Programs/${programId}`,
                programData
            );
            return response.data;
        } catch (error) {
            console.error("Error updating program:", error);
            throw error;
        }
    },

    // Delete program
    deleteProgram: async (programId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/Programs/${programId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting program:", error);
            throw error;
        }
    },

    // Toggle program status
    toggleProgramStatus: async (programId, status) => {
        try {
            const response = await apiClient.patch(
                `/Admin/Programs/${programId}/status`,
                { status }
            );
            return response.data;
        } catch (error) {
            console.error("Error toggling program status:", error);
            throw error;
        }
    },

    // Get program statistics
    getProgramStats: async () => {
        try {
            const response = await apiClient.get("/Admin/Programs/stats");
            return response.data;
        } catch (error) {
            console.error("Error fetching program statistics:", error);
            throw error;
        }
    },

    // Video Management APIs
    // Get all videos for a program
    getProgramVideos: async (programId) => {
        try {
            const response = await apiClient.get(
                `/Admin/Programs/${programId}/videos`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching program videos:", error);
            throw error;
        }
    },

    // Get video details
    getVideoDetails: async (programId, videoId) => {
        try {
            const response = await apiClient.get(
                `/Admin/Programs/${programId}/videos/${videoId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching video details:", error);
            throw error;
        }
    },

    // Add video metadata
    addVideoMetadata: async (programId, videoData) => {
        try {
            const response = await apiClient.post(
                `/Admin/Programs/${programId}/videos`,
                videoData
            );
            return response.data;
        } catch (error) {
            console.error("Error adding video metadata:", error);
            throw error;
        }
    },

    // Update video
    updateVideo: async (programId, videoId, videoData) => {
        try {
            const response = await apiClient.put(
                `/Admin/Programs/${programId}/videos/${videoId}`,
                videoData
            );
            return response.data;
        } catch (error) {
            console.error("Error updating video:", error);
            throw error;
        }
    },

    // Delete video
    deleteVideo: async (programId, videoId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/Programs/${programId}/videos/${videoId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting video:", error);
            throw error;
        }
    },

    // Remove main video from program
    removeVideo: async (programId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/Programs/${programId}/video`
            );
            return response.data;
        } catch (error) {
            console.error("Error removing video:", error);
            throw error;
        }
    },

    // Reorder videos
    reorderVideos: async (programId, videoOrders) => {
        try {
            const response = await apiClient.put(
                `/Admin/Programs/${programId}/videos/reorder`,
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
                "/Admin/Programs/fix-video-counts"
            );
            return response.data;
        } catch (error) {
            console.error("Error fixing video counts:", error);
            throw error;
        }
    },

    // Upload program Image
    uploadProgramImage: async (programId, formData) => {
        try {
            const response = await apiClient.post(
                `/Admin/upload/Programs/${programId}/Image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error uploading program Image:", error);
            throw error;
        }
    },

    // Upload program video
    uploadProgramVideo: async (programId, formData) => {
        try {
            const response = await apiClient.post(
                `/Admin/upload/Programs/${programId}/Video`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error uploading program video:", error);
            throw error;
        }
    },

    // Upload cover Image
    uploadCoverImage: async (programId, formData) => {
        try {
            const response = await apiClient.post(
                `/Admin/upload/Programs/${programId}/CoverImage`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error uploading cover Image:", error);
            throw error;
        }
    },

    // Delete program Image
    deleteProgramImage: async (programId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/upload/Programs/${programId}/Image`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting program Image:", error);
            throw error;
        }
    },

    // Delete cover Image
    deleteCoverImage: async (programId) => {
        try {
            const response = await apiClient.delete(
                `/Admin/upload/Programs/${programId}/CoverImage`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting cover Image:", error);
            throw error;
        }
    },
};

// Client-side Programs API (for public access)
export const clientProgramsAPI = {
    // Get all programs for clients (public)
    getPrograms: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== "") {
                    queryParams.append(key, params[key]);
                }
            });

            const response = await apiClient.get(`/Programs?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching programs:", error);
            throw error;
        }
    },

    // Get single program details for clients
    getProgramDetails: async (programId) => {
        try {
            const response = await apiClient.get(`/Programs/${programId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching program details:", error);
            throw error;
        }
    },

    // Get featured programs
    getFeaturedPrograms: async (limit = 6) => {
        try {
            const response = await apiClient.get(
                `/Programs/featured?limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching featured programs:", error);
            throw error;
        }
    },

    // Get program categories and organizations
    getProgramCategories: async () => {
        try {
            const response = await apiClient.get(`/Programs/categories`);
            return response.data;
        } catch (error) {
            console.error("Error fetching program categories:", error);
            throw error;
        }
    },

    // Get applicants for a program
    getProgramApplicants: async (programId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== "") {
                    queryParams.append(key, params[key]);
                }
            });

            const response = await apiClient.get(
                `/Admin/Programs/${programId}/applicants?${queryParams}`
            );
            console.log('Program applicants API response:', response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching program applicants:", error);
            throw error;
        }
    },

    // Alias methods for consistency
    getProgram: async (programId) => {
        return clientProgramsAPI.getProgramDetails(programId);
    },
};
export default programsAPI;
export { programsAPI };
