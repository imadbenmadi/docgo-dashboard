import axios from "../utils/axios.jsx";

const BASE = "/Admin/logs";

const logsAPI = {
    /**
     * Fetch log entries with optional filters and pagination.
     *
     * @param {object} params
     * @param {string}  [params.level]     "error"|"warn"|"info"
     * @param {string}  [params.search]    free-text search
     * @param {string}  [params.startDate] ISO / YYYY-MM-DD
     * @param {string}  [params.endDate]   ISO / YYYY-MM-DD
     * @param {number}  [params.page]      1-based (default 1)
     * @param {number}  [params.limit]     items per page (default 50)
     */
    getLogs: async (params = {}) => {
        const response = await axios.get(BASE, { params });
        return response.data; // { success, items, total, page, totalPages, limit }
    },

    /** Return per-level counts. */
    getStats: async () => {
        const response = await axios.get(`${BASE}/stats`);
        return response.data; // { success, stats: { total, error, warn, info } }
    },

    /** Delete ALL log entries. */
    clearLogs: async () => {
        const response = await axios.delete(BASE);
        return response.data;
    },

    /** Delete a single log entry by id. */
    deleteLog: async (id) => {
        const response = await axios.delete(`${BASE}/${id}`);
        return response.data;
    },
};

export default logsAPI;
