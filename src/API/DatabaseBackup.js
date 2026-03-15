import apiClient from "../utils/apiClient";

const BASE = "/Admin/database_backup";

const databaseBackupAPI = {
  getStatus: async () => {
    const response = await apiClient.get(`${BASE}/status`);
    return response.data;
  },

  runBackup: async () => {
    const response = await apiClient.post(`${BASE}/run`);
    return response.data;
  },
};

export default databaseBackupAPI;
