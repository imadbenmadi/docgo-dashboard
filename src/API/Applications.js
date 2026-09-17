import apiClient from "../utils/apiClient";

/**
 * The archive of enrolments an admin took away. Read-only: an archived
 * enrolment is kept for good.
 */

const toApiError = (error) => ({
  response: {
    status: error?.response?.status ?? null,
    data: error?.response?.data,
  },
});

const fetchRemoved = async (kind) => {
  try {
    const response = await apiClient.get(
      `/enrollment/admin/${kind}/removed-enrollments`,
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch removed enrollments",
      error: toApiError(error),
    };
  }
};

const ApplicationsAPI = {
  getRemovedCourseEnrollments: () => fetchRemoved("courses"),
  getRemovedProgramEnrollments: () => fetchRemoved("programs"),
};

export default ApplicationsAPI;
