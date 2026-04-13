import { useEffect, useState } from "react";
import axios from "../utils/axios";

/**
 * Hook to fetch program options (countries, specialties, types) from admin panel
 * Data structure managed by admin:
 *   - programCountries: Array of country names
 *   - programSpecialtiesPerCountry: { "CountryName": ["Specialty1", "Specialty2"] }
 *   - programTypesPerCountrySpecialty: { "CountryName::Specialty": ["Type1", "Type2"] }
 */
export const useProgramOptions = () => {
  const [options, setOptions] = useState({
    countries: [],
    specialtiesPerCountry: {},
    typesPerCountrySpecialty: {},
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptions((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch from public register options endpoint (admin-managed)
        const response = await axios.get("/public/register-options");
        const data = response.data?.options || {};

        // Extract admin-managed program configuration
        const programCountries = data.programCountries || [];
        const specialtiesMap = data.programSpecialtiesPerCountry || {};
        const typesMap = data.programTypesPerCountrySpecialty || {};

        setOptions((prev) => ({
          ...prev,
          countries: programCountries,
          specialtiesPerCountry: specialtiesMap,
          typesPerCountrySpecialty: typesMap,
          loading: false,
        }));
      } catch (err) {
        setOptions((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to fetch program options",
          // Keep any previously loaded data as fallback
        }));
      }
    };

    fetchOptions();
  }, []);

  return options;
};
