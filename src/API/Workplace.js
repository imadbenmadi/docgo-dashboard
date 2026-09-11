import apiClient from "../utils/apiClient";

/** HR, the help desk and forms. One API because they mount together. */

const fail = (error, fallback) => ({
  success: false,
  status: error?.response?.status ?? null,
  code: error?.response?.data?.code || null,
  message: error?.response?.data?.message || fallback,
});

const qs = (f = {}) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  }
  return p.toString();
};

const get = async (url, fallback, shape = (d) => d) => {
  try {
    const { data } = await apiClient.get(url);
    return { success: true, ...shape(data) };
  } catch (error) {
    return fail(error, fallback);
  }
};

export const HRAPI = {
  employees: (f) =>
    get(`/Admin/hr/employees?${qs(f)}`, "Could not load the employees", (d) => ({
      employees: d.data || [],
      counts: d.counts || {},
      monthlyPayroll: d.monthlyPayroll || 0,
    })),

  saveEmployee: async (employee) => {
    try {
      const { data } = employee.id
        ? await apiClient.patch(`/Admin/hr/employees/${employee.id}`, employee)
        : await apiClient.post("/Admin/hr/employees", employee);
      return { success: true, employee: data.data };
    } catch (error) {
      return fail(error, "Could not save that employee");
    }
  },

  removeEmployee: async (id) => {
    try {
      const { data } = await apiClient.delete(`/Admin/hr/employees/${id}`);
      return { success: true, message: data.message };
    } catch (error) {
      return fail(error, "Could not remove that record");
    }
  },

  adminAccess: () =>
    get("/Admin/hr/admins", "Could not load the permissions", (d) => ({
      admins: d.data || [],
      areas: d.areas || [],
      configured: d.configured,
    })),

  setPermissions: async (adminId, permissions) => {
    try {
      const { data } = await apiClient.put(
        `/Admin/hr/admins/${adminId}/permissions`,
        { permissions },
      );
      return { success: true, message: data.message };
    } catch (error) {
      return fail(error, "Could not save those permissions");
    }
  },

  setOwner: async (adminId, isOwner) => {
    try {
      const { data } = await apiClient.put(`/Admin/hr/admins/${adminId}/owner`, {
        isOwner,
      });
      return { success: true, message: data.message };
    } catch (error) {
      return fail(error, "Could not change that");
    }
  },

  myAccess: () => get("/Admin/my-access", "Could not read your access"),
};

export const HelpDeskAPI = {
  list: (f) =>
    get(`/Admin/helpdesk?${qs(f)}`, "Could not load the tickets", (d) => ({
      tickets: d.data || [],
      pagination: d.pagination,
      countsByStatus: d.countsByStatus || {},
      unassigned: d.unassigned || 0,
    })),

  one: (id) => get(`/Admin/helpdesk/${id}`, "Could not load that ticket"),

  assignees: () =>
    get("/Admin/helpdesk/assignees", "Could not load the admins", (d) => ({
      admins: d.data || [],
    })),

  update: async (id, patch) => {
    try {
      const { data } = await apiClient.patch(`/Admin/helpdesk/${id}`, patch);
      return { success: true, ticket: data.data };
    } catch (error) {
      return fail(error, "Could not update that ticket");
    }
  },
};

export const FormsAPI = {
  list: () =>
    get("/Admin/forms", "Could not load the forms", (d) => ({
      forms: d.data || [],
    })),

  save: async (form) => {
    try {
      const { data } = form.id
        ? await apiClient.patch(`/Admin/forms/${form.id}`, form)
        : await apiClient.post("/Admin/forms", form);
      return { success: true, form: data.data };
    } catch (error) {
      return fail(error, "Could not save that form");
    }
  },

  remove: async (id) => {
    try {
      await apiClient.delete(`/Admin/forms/${id}`);
      return { success: true };
    } catch (error) {
      return fail(error, "Could not delete that form");
    }
  },

  responses: (id) =>
    get(`/Admin/forms/${id}/responses`, "Could not load the responses", (d) => ({
      form: d.form,
      responses: d.data || [],
      count: d.count,
    })),
};

export const FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Choose one" },
  { value: "checkbox", label: "Tick box" },
  { value: "file_link", label: "Link to a file" },
];

export const DEPARTMENTS = [
  "management",
  "teaching",
  "support",
  "marketing",
  "finance",
  "technical",
  "other",
];

export const CONTRACTS = ["full_time", "part_time", "freelance", "intern"];
