import apiClient from "../utils/apiClient";

const HomePageAPI = {
    /** GET full CMS content */
    getContent: async () => {
        try {
            const res = await apiClient.get("/Admin/HomePage");
            return { success: true, content: res.data.content };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur serveur",
            };
        }
    },

    /** PATCH any subset of CMS fields */
    updateContent: async (payload) => {
        try {
            const res = await apiClient.patch("/Admin/HomePage", payload);
            return { success: true, content: res.data.content };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur serveur",
            };
        }
    },

    /** GET all courses with featured flag */
    getFeaturedCourses: async () => {
        try {
            const res = await apiClient.get("/Admin/HomePage/featured-courses");
            return { success: true, courses: res.data.courses };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur serveur",
            };
        }
    },

    /** Toggle isFeatured on a single course */
    toggleFeaturedCourse: async (id, isFeatured) => {
        try {
            const res = await apiClient.patch(
                `/Admin/HomePage/featured-courses/${id}`,
                { isFeatured },
            );
            return { success: true, course: res.data.course };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur serveur",
            };
        }
    },

    /** GET all programs with featured flag */
    getFeaturedPrograms: async () => {
        try {
            const res = await apiClient.get(
                "/Admin/HomePage/featured-programs",
            );
            return { success: true, programs: res.data.programs };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur serveur",
            };
        }
    },

    /** Toggle isFeatured on a single program */
    toggleFeaturedProgram: async (id, isFeatured) => {
        try {
            const res = await apiClient.patch(
                `/Admin/HomePage/featured-programs/${id}`,
                { isFeatured },
            );
            return { success: true, program: res.data.program };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur serveur",
            };
        }
    },
};

export default HomePageAPI;
