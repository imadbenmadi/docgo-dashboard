import apiClient from "../utils/apiClient";

/**
 * The order queue and everything an admin can do to one.
 *
 * This replaces four separate application APIs and three payment ones. There
 * is a single orders table on the server, so there is a single API here, and
 * the product is a value in `itemType` rather than a different endpoint.
 */

const fail = (error, fallback) => ({
  success: false,
  status: error?.response?.status ?? null,
  message: error?.response?.data?.message || fallback,
  code: error?.response?.data?.code || null,
});

const OrdersAPI = {
  /**
   * The queue. Every filter is optional.
   * @param {{status?, itemType?, paymentStatus?, search?, page?, limit?}} filters
   */
  list: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== null && v !== "") params.append(k, v);
      }
      const { data } = await apiClient.get(`/Admin/orders?${params}`);
      return {
        success: true,
        orders: data.data || [],
        pagination: data.pagination,
        countsByStatus: data.countsByStatus || {},
      };
    } catch (error) {
      return fail(error, "Could not load the orders");
    }
  },

  /** One order, plus every earlier attempt at the same item. */
  get: async (id) => {
    try {
      const { data } = await apiClient.get(`/Admin/orders/${id}`);
      return {
        success: true,
        order: data.data.order,
        attempts: data.data.attempts || [],
      };
    } catch (error) {
      return fail(error, "Could not load that order");
    }
  },

  /**
   * The receipt, fetched on its own so the queue never carries image bytes.
   * Comes back as a signed Bunny URL when the file is there, and as the row's
   * own copy when it is not.
   */
  receipt: async (id) => {
    try {
      const { data } = await apiClient.get(`/Admin/orders/${id}/receipt`);
      return { success: true, receipt: data.data };
    } catch (error) {
      return fail(error, "No receipt was sent for this order");
    }
  },

  /** Approve it. This is what grants access. */
  approve: async (id, notes) => {
    try {
      const { data } = await apiClient.post(`/Admin/orders/${id}/approve`, {
        notes,
      });
      return { success: true, message: data.message, ...data.data };
    } catch (error) {
      return fail(error, "Could not approve that order");
    }
  },

  /**
   * Reject it. A reason is required by the server, because the user is shown
   * it and "rejected" on its own tells them nothing.
   */
  reject: async (id, reason) => {
    try {
      const { data } = await apiClient.post(`/Admin/orders/${id}/reject`, {
        reason,
      });
      return { success: true, message: data.message, ...data.data };
    } catch (error) {
      return fail(error, "Could not reject that order");
    }
  },

  /** Record that money went back. Does not take access away. */
  refund: async (id, { amount, reason, proof } = {}) => {
    try {
      const { data } = await apiClient.post(`/Admin/orders/${id}/refund`, {
        amount,
        reason,
        proof,
      });
      return { success: true, message: data.message, ...data.data };
    } catch (error) {
      return fail(error, "Could not record that refund");
    }
  },

  /** Income by product, and how many orders are waiting on somebody. */
  summary: async () => {
    try {
      const { data } = await apiClient.get("/Admin/orders/summary");
      return { success: true, ...data.data };
    } catch (error) {
      return fail(error, "Could not load the summary");
    }
  },

  // ---- enrolments --------------------------------------------------------

  listEnrollments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== null && v !== "") params.append(k, v);
      }
      const { data } = await apiClient.get(`/Admin/enrollments?${params}`);
      return {
        success: true,
        enrollments: data.data || [],
        pagination: data.pagination,
      };
    } catch (error) {
      return fail(error, "Could not load the enrolments");
    }
  },

  /** Hand something over directly. Places an order recording why. */
  grant: async ({ userId, itemType, itemId, notes }) => {
    try {
      const { data } = await apiClient.post("/Admin/enrollments/grant", {
        userId,
        itemType,
        itemId,
        notes,
      });
      return { success: true, message: data.message, ...data.data };
    } catch (error) {
      return fail(error, "Could not grant that");
    }
  },

  /** Take access away. Deletes nothing - the order and the payment stay. */
  revoke: async (enrollmentId, reason) => {
    try {
      const { data } = await apiClient.post(
        `/Admin/enrollments/${enrollmentId}/revoke`,
        { reason },
      );
      return { success: true, message: data.message, ...data.data };
    } catch (error) {
      return fail(error, "Could not remove that access");
    }
  },

  reinstate: async (enrollmentId) => {
    try {
      const { data } = await apiClient.post(
        `/Admin/enrollments/${enrollmentId}/reinstate`,
      );
      return { success: true, message: data.message, ...data.data };
    } catch (error) {
      return fail(error, "Could not restore that access");
    }
  },

  suspend: async (enrollmentId, reason) => {
    try {
      const { data } = await apiClient.post(
        `/Admin/enrollments/${enrollmentId}/suspend`,
        { reason },
      );
      return { success: true, message: data.message, ...data.data };
    } catch (error) {
      return fail(error, "Could not suspend that");
    }
  },
};

/** The four products, named the way an admin would say them. */
export const ITEM_TYPES = [
  { value: "course", label: "Cours" },
  { value: "program", label: "Programme" },
  { value: "cv", label: "Service CV" },
  { value: "internship", label: "Stage" },
];

export const ORDER_STATUSES = [
  { value: "pending", label: "En attente de vous" },
  { value: "approved", label: "Approuvée" },
  { value: "rejected", label: "Refusée" },
  { value: "cancelled", label: "Annulée" },
  { value: "refunded", label: "Remboursée" },
];

export default OrdersAPI;
