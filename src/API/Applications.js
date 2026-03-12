import apiClient from "../utils/apiClient";

const ApplicationsAPI = {
  // =========================================================================
  // COURSE APPLICATIONS
  // =========================================================================

  /** Get all course applications (admin) */
  getCourseApplications: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await apiClient.get(
        `/enrollment/admin/courses/applications?${params.toString()}`,
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch course applications",
      };
    }
  },

  /** Update a course application status (approve/reject/notes) */
  updateCourseApplicationStatus: async (id, { status, notes } = {}) => {
    try {
      const response = await apiClient.put(
        `/enrollment/admin/courses/applications/${id}/status`,
        { status, notes },
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to update course application",
      };
    }
  },

  // =========================================================================
  // PROGRAM APPLICATIONS
  // =========================================================================

  /** Get all program applications (admin) */
  getProgramApplications: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await apiClient.get(
        `/enrollment/admin/programs/applications?${params.toString()}`,
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch program applications",
      };
    }
  },

  /** Approve a free program application (creates enrollment) */
  approveProgramApplication: async (
    id,
    { notes, cohort, programStartDate, programEndDate } = {},
  ) => {
    try {
      const response = await apiClient.put(
        `/enrollment/admin/programs/applications/${id}/approve`,
        { notes, cohort, programStartDate, programEndDate },
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to approve program application",
      };
    }
  },

  /** Reject a program application */
  rejectProgramApplication: async (id, { notes } = {}) => {
    try {
      const response = await apiClient.put(
        `/enrollment/admin/programs/applications/${id}/status`,
        { status: "rejected", notes },
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to reject program application",
      };
    }
  },

  // =========================================================================
  // CCP PAYMENT APPROVAL (for paid applications)
  // =========================================================================

  /** Get all CCP payments with optional filters */
  getAllCCPPayments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.itemType) params.append("itemType", filters.itemType);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await apiClient.get(
        `/Admin/Payments/ccp?${params.toString()}`,
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch CCP payments",
      };
    }
  },

  /** Approve a course CCP payment */
  approveCoursePayment: async (paymentId) => {
    try {
      const response = await apiClient.post(
        `/Admin/Payments/courses/${paymentId}/approve`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to approve course payment",
      };
    }
  },

  /** Reject a course CCP payment */
  rejectCoursePayment: async (paymentId, reason) => {
    try {
      const response = await apiClient.post(
        `/Admin/Payments/courses/${paymentId}/reject`,
        { reason },
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to reject course payment",
      };
    }
  },

  /** Approve a program CCP payment */
  approveProgramPayment: async (paymentId) => {
    try {
      const response = await apiClient.post(
        `/Admin/Payments/programs/${paymentId}/approve`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to approve program payment",
      };
    }
  },

  /** Reject a program CCP payment */
  rejectProgramPayment: async (paymentId, reason) => {
    try {
      const response = await apiClient.post(
        `/Admin/Payments/programs/${paymentId}/reject`,
        { reason },
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to reject program payment",
      };
    }
  },

  // =========================================================================
  // REMOVED ENROLLMENTS (Archive)
  // =========================================================================

  /** Get all removed (archived) course enrollments */
  getRemovedCourseEnrollments: async () => {
    try {
      const response = await apiClient.get(
        "/enrollment/admin/courses/removed-enrollments",
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch removed course enrollments",
      };
    }
  },

  /** Permanently delete a removed course enrollment record */
  permanentDeleteCourseEnrollment: async (id) => {
    try {
      const response = await apiClient.delete(
        `/enrollment/admin/courses/removed-enrollments/${id}`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete record",
      };
    }
  },

  /** Get all removed (archived) program enrollments */
  getRemovedProgramEnrollments: async () => {
    try {
      const response = await apiClient.get(
        "/enrollment/admin/programs/removed-enrollments",
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch removed program enrollments",
      };
    }
  },

  /** Permanently delete a removed program enrollment record */
  permanentDeleteProgramEnrollment: async (id) => {
    try {
      const response = await apiClient.delete(
        `/enrollment/admin/programs/removed-enrollments/${id}`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete record",
      };
    }
  },
};

export default ApplicationsAPI;
