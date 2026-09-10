import apiClient from "../utils/apiClient";

/**
 * Money in, money out.
 *
 * Nothing here caches or stores a total. Income is read from orders at the
 * moment it is asked for, because an approved order already is a payment
 * received - a second table holding "revenue" would be a second version of
 * the truth, and the two would disagree within a month.
 */

const fail = (error, fallback) => ({
  success: false,
  status: error?.response?.status ?? null,
  message: error?.response?.data?.message || fallback,
});

const qs = (filters = {}) => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== "") params.append(k, v);
  }
  return params.toString();
};

const FinanceAPI = {
  summary: async (filters = {}) => {
    try {
      const { data } = await apiClient.get(`/Admin/finance/summary?${qs(filters)}`);
      return { success: true, ...data.data };
    } catch (error) {
      return fail(error, "Could not load the figures");
    }
  },

  monthly: async (year) => {
    try {
      const { data } = await apiClient.get(`/Admin/finance/monthly?year=${year}`);
      return { success: true, ...data.data };
    } catch (error) {
      return fail(error, "Could not load the monthly report");
    }
  },

  transactions: async (filters = {}) => {
    try {
      const { data } = await apiClient.get(
        `/Admin/finance/transactions?${qs(filters)}`,
      );
      return { success: true, rows: data.data || [], count: data.count };
    } catch (error) {
      return fail(error, "Could not load the transactions");
    }
  },

  addExpense: async (expense) => {
    try {
      const { data } = await apiClient.post("/Admin/finance/expenses", expense);
      return { success: true, expense: data.data };
    } catch (error) {
      return fail(error, "Could not record that expense");
    }
  },

  deleteExpense: async (id) => {
    try {
      await apiClient.delete(`/Admin/finance/expenses/${id}`);
      return { success: true };
    } catch (error) {
      return fail(error, "Could not remove that expense");
    }
  },
};

export const EXPENSE_CATEGORIES = [
  { value: "salaries", label: "Salaries" },
  { value: "marketing", label: "Marketing" },
  { value: "hosting", label: "Hosting" },
  { value: "software", label: "Software" },
  { value: "office", label: "Office" },
  { value: "taxes", label: "Taxes" },
  { value: "other", label: "Other" },
];

export default FinanceAPI;
