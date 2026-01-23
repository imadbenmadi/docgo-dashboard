import apiClient from "../utils/apiClient";

const usersAPI = {
  // Get all users
  getUsers: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();

      // Only add params that have values
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== "") {
          searchParams.append(key, params[key]);
        }
      });
      
      const response = await apiClient.get(`/Admin/users?${searchParams.toString()}`);
      
      // Return the data directly, axios wraps response in { data: ... }
      return response.data;
    } catch (error) {
      throw error;
    }
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
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/Admin/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Block/Unblock user
  toggleUserStatus: (userId) => {
    return apiClient.patch(`/Admin/users/${userId}/toggle-status`);
  },
};

export default usersAPI;
