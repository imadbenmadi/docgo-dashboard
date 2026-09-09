import apiClient from "../utils/apiClient";

const BASE = "/Admin/cloud-storage";

const cloudStorageAPI = {
  list: async (path = "") => {
    const response = await apiClient.get(BASE, { params: { path } });
    return response.data;
  },

  usage: async (path = "") => {
    const response = await apiClient.get(`${BASE}/usage`, { params: { path } });
    return response.data;
  },

  preview: async (path) => {
    const response = await apiClient.get(`${BASE}/preview`, { params: { path } });
    return response.data;
  },

  createFolder: async (path, name) => {
    const response = await apiClient.post(`${BASE}/folder`, { path, name });
    return response.data;
  },

  // onProgress receives 0-100 so the caller can show a bar; large files are
  // the normal case here, not the exception.
  upload: async (path, file, onProgress) => {
    const form = new FormData();
    form.append("path", path);
    form.append("file", file);

    const response = await apiClient.post(`${BASE}/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return response.data;
  },

  remove: async (path) => {
    const response = await apiClient.delete(BASE, { params: { path } });
    return response.data;
  },
};

export default cloudStorageAPI;
