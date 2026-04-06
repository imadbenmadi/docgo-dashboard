import { useEffect, useState } from "react";
import axios from "../utils/axios";

/**
 * Hook to fetch program options (countries, specialties, types)
 * Used in AddProgram and EditProgram pages
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

        // Fetch from RegisterOptions endpoint
        const response = await axios.get("/RegisterOptions");
        const data = response.data?.data || {};

        // Extract program countries
        const programCountries = data.programCountries || [];

        // Build specialties and types maps
        const specialtiesMap = {};
        const typesMap = {};

        data.programSpecialtiesPerCountry &&
          Object.entries(data.programSpecialtiesPerCountry).forEach(
            ([country, specialties]) => {
              specialtiesMap[country] = specialties || [];
            },
          );

        data.programTypesPerCountrySpecialty &&
          Object.entries(data.programTypesPerCountrySpecialty).forEach(
            ([key, types]) => {
              typesMap[key] = types || [];
            },
          );

        setOptions((prev) => ({
          ...prev,
          countries: programCountries,
          specialtiesPerCountry: specialtiesMap,
          typesPerCountrySpecialty: typesMap,
          loading: false,
        }));
      } catch (err) {
        console.error("Error fetching program options:", err);
        setOptions((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to fetch options",
        }));
      }
    };

    fetchOptions();
  }, []);

  return options;
};
