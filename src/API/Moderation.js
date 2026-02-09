import axios from "../utils/axios.jsx";

const ADMIN_BASE_URL = "/Admin";

export const moderationAPI = {
    list: async ({
        page = 1,
        limit = 25,
        status,
        decision,
        mediaKind,
    } = {}) => {
        const params = { page, limit };
        if (status) params.status = status;
        if (decision) params.decision = decision;
        if (mediaKind) params.mediaKind = mediaKind;
        const res = await axios.get(`${ADMIN_BASE_URL}/Moderation`, { params });
        return res.data;
    },

    markSafe: async (id, adminNotes = "") => {
        const res = await axios.patch(
            `${ADMIN_BASE_URL}/Moderation/${id}/mark-safe`,
            { adminNotes },
        );
        return res.data;
    },

    removeMedia: async (id) => {
        const res = await axios.delete(
            `${ADMIN_BASE_URL}/Moderation/${id}/remove-media`,
        );
        return res.data;
    },

    blockUser: async (id) => {
        const res = await axios.post(
            `${ADMIN_BASE_URL}/Moderation/${id}/block-user`,
        );
        return res.data;
    },
};
