import apiClient from "../utils/apiClient";

const emailsAPI = {
  getTemplate: async (type) => {
    const res = await apiClient.get(`/Admin/Emails/templates/${type}`);
    return res.data;
  },

  saveTemplate: async (type, payload) => {
    const res = await apiClient.put(`/Admin/Emails/templates/${type}`, payload);
    return res.data;
  },

  getMarketingCampaigns: async () => {
    const res = await apiClient.get("/Admin/Emails/marketing");
    return res.data;
  },

  getMarketingCampaign: async (id) => {
    const res = await apiClient.get(`/Admin/Emails/marketing/${id}`);
    return res.data;
  },

  createMarketingCampaign: async (payload) => {
    const res = await apiClient.post("/Admin/Emails/marketing", payload);
    return res.data;
  },

  updateMarketingCampaign: async (id, payload) => {
    const res = await apiClient.put(`/Admin/Emails/marketing/${id}`, payload);
    return res.data;
  },

  sendMarketingCampaign: async (id, payload) => {
    const res = await apiClient.post(
      `/Admin/Emails/marketing/${id}/send`,
      payload,
    );
    return res.data;
  },

  getUsersForCampaign: async ({ search = "", page = 1, limit = 50 } = {}) => {
    const query = new URLSearchParams({
      search,
      page: String(page),
      limit: String(limit),
    });
    const res = await apiClient.get(`/Admin/Emails/users?${query.toString()}`);
    return res.data;
  },

  sendEmailToUser: async (userId, subject, htmlContent, textContent = "") => {
    const res = await apiClient.post("/Admin/Emails/send-to-user", {
      userId,
      subject,
      htmlContent,
      textContent,
    });
    return res.data;
  },
};

export default emailsAPI;
