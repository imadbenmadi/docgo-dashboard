import apiClient from "../utils/apiClient";

const AdminsAPI = {
  getAdmins: async () => {
    const res = await apiClient.get("/Admin/admins");
    return res.data;
  },

  createAdmin: async (payload) => {
    const res = await apiClient.post("/Admin/admins", payload);
    return res.data;
  },
};

export default AdminsAPI;
