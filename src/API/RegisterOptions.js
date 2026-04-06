import apiClient from "../utils/apiClient";

const RegisterOptionsAPI = {
  // Get current options (admin) — returns all admin-managed dropdown data
  getOptions: async () => {
    try {
      const res = await apiClient.get("/Admin/RegisterOptions");
      // Backend wraps under res.data.options
      const d = res.data?.options || res.data || {};
      return {
        // User Profile Origin
        userOriginCountries: d.userOriginCountries || [],
        userSpecialties: d.userSpecialties || [],
        // Professional/Academic Status
        professionalStatuses: d.professionalStatuses || [],
        academicStatuses: d.academicStatuses || [],
        // Program Management
        programCountries: d.programCountries || [],
        programSpecialtiesPerCountry: d.programSpecialtiesPerCountry || {},
        programTypesPerCountrySpecialty:
          d.programTypesPerCountrySpecialty || {},
        countryFlags: d.countryFlags || {},
        updatedAt: d.updatedAt,
      };
    } catch (err) {
      return {
        userOriginCountries: [],
        userSpecialties: [],
        professionalStatuses: [],
        academicStatuses: [],
        programCountries: [],
        programSpecialtiesPerCountry: {},
        programTypesPerCountrySpecialty: {},
        countryFlags: {},
      };
    }
  },

  // Update one or more lists
  updateOptions: async (payload) => {
    try {
      const res = await apiClient.patch("/Admin/RegisterOptions", payload);
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message,
      };
    }
  },

  // BI insights — returns a flat, normalised object ready for the UI
  getInsights: async () => {
    try {
      const res = await apiClient.get("/Admin/RegisterOptions/insights");
      const d = res.data?.insights || res.data || {};

      // Normalise: backend returns { label, count } — UI expects { value, count }
      const norm = (arr) =>
        (arr || []).map((r) => ({
          value: r.label ?? r.value,
          count: Number(r.count),
        }));

      return {
        totalUsers: d.totalUsers || 0,
        topStudyDomains: norm(d.topStudyDomains),
        topStudyDomains: norm(d.topStudyDomains),
        topCountries: norm(d.topCountries),
        registrationsPerMonth: (d.registrationsPerMonth || []).map((r) => ({
          month: r.month || r.period,
          count: Number(r.count),
        })),
        // derived counts — users who filled in each field
        usersWithStudyDomain: (d.topStudyDomains || []).reduce(
          (s, r) => s + Number(r.count),
          0,
        ),
        usersWithStudyDomain: (d.topStudyDomains || []).reduce(
          (s, r) => s + Number(r.count),
          0,
        ),
        usersWithCountry: (d.topCountries || []).reduce(
          (s, r) => s + Number(r.count),
          0,
        ),
      };
    } catch (err) {
      return {
        totalUsers: 0,
        topStudyDomains: [],
        topStudyDomains: [],
        topCountries: [],
        registrationsPerMonth: [],
        usersWithStudyDomain: 0,
        usersWithStudyDomain: 0,
        usersWithCountry: 0,
      };
    }
  },
};

export default RegisterOptionsAPI;
