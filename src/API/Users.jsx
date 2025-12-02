import apiClient from "../utils/apiClient";

const usersAPI = {
  // Get all users
  getUsers: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.search) searchParams.append("search", params.search);
    if (params.role) searchParams.append("role", params.role);
    if (params.status) searchParams.append("status", params.status);
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    return apiClient.get(`/Admin/users?${searchParams.toString()}`);
  },

  // Get user by ID
  getUserById: (userId) => {
    return apiClient.get(`/Admin/users/${userId}`);
  },

  // Update user
  updateUser: (userId, userData) => {
    return apiClient.put(`/Admin/users/${userId}`, userData);
  },

  // Delete user
  deleteUser: (userId) => {
    return apiClient.delete(`/Admin/users/${userId}`);
  },

  // Block/Unblock user
  toggleUserStatus: (userId) => {
    return apiClient.patch(`/Admin/users/${userId}/toggle-status`);
  },
};

export default usersAPI;
