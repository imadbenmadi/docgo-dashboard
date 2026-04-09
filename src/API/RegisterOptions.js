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

      const topStudyDomains = norm(d.topStudyDomains);
      const topCountries = norm(d.topCountries);

      return {
        totalUsers: d.totalUsers || 0,
        topStudyDomains: topStudyDomains,
        topStudyFields: topStudyDomains, // Same as domains - system uses studyDomain only
        topCountries: topCountries,
        registrationsPerMonth: (d.registrationsPerMonth || []).map((r) => ({
          month: r.month || r.period,
          count: Number(r.count),
        })),
        // derived counts — users who filled in each field
        usersWithStudyField: topStudyDomains.reduce(
          (s, r) => s + Number(r.count),
          0,
        ),
        usersWithStudyDomain: topStudyDomains.reduce(
          (s, r) => s + Number(r.count),
          0,
        ),
        usersWithTargetCountry: topCountries.reduce(
          (s, r) => s + Number(r.count),
          0,
        ),
      };
    } catch (err) {
      return {
        totalUsers: 0,
        topStudyDomains: [],
        topStudyFields: [],
        topCountries: [],
        registrationsPerMonth: [],
        usersWithStudyField: 0,
        usersWithStudyDomain: 0,
        usersWithTargetCountry: 0,
      };
    }
  },
};

export default RegisterOptionsAPI;
