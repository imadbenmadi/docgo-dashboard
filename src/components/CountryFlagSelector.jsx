import React, { useMemo } from "react";
import ReactFlagsSelect from "react-flags-select";
import { useTranslation } from "react-i18next";
import {
  COUNTRY_CODE_MAP,
  getCountryCode,
  getCountryName,
  getCountryDisplayName,
} from "../../utils/countryCodeMap";
// CSS is bundled with the component in newer versions
// import "react-flags-select/css/react-flags-select.css";

// Helper to get flag emoji from country code
const getFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return "🚩";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

/**
 * Reusable Country Flag Selector Component for Dashboard
 * Displays Unicode flag emojis for international support
 */
const CountryFlagSelector = ({
  value,
  onChange,
  countries = [],
  placeholder = "Select Country",
  disabled = false,
  className = "",
  showLabel = true,
  label = "Country",
  required = false,
  ...props
}) => {
  const { i18n } = useTranslation();

  // Convert French country names to ISO codes for the component
  const countryCodesArray = useMemo(() => {
    if (!countries || countries.length === 0) return [];
    return countries
      .filter((c) => COUNTRY_CODE_MAP[c])
      .map((c) => COUNTRY_CODE_MAP[c]);
  }, [countries]);

  // Get current ISO code from French name
  const currentCode = value ? getCountryCode(value) : "";

  // Handle change - convert ISO code back to French name
  const handleChange = (code) => {
    const frenchName = getCountryName(code);
    onChange(frenchName);
  };

  // Get display text in current language
  const displayName = value
    ? getCountryDisplayName(value, i18n.language?.split("-")[0] || "fr")
    : placeholder;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="react-flags-select-wrapper">
        <ReactFlagsSelect
          selected={currentCode}
          onSelect={handleChange}
          countries={countryCodesArray}
          customLabels={{
            ...Object.entries(COUNTRY_CODE_MAP).reduce((acc, [name, code]) => {
              const displayText = getCountryDisplayName(
                name,
                i18n.language?.split("-")[0] || "fr",
              );
              acc[code] = `${getFlagEmoji(code)} ${displayText}`;
              return acc;
            }, {}),
          }}
          placeholder={
            displayName
              ? `${getFlagEmoji(currentCode)} ${displayName}`
              : placeholder
          }
          disabled={disabled}
          showOptionLabel={true}
          showSelectedLabel={true}
          {...props}
        />
      </div>
      <style>{`
        .react-flags-select-wrapper {
          width: 100%;
        }

        .react-flags-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          color: #111827;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .react-flags-select:hover:not(:disabled) {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .react-flags-select:focus-visible {
          outline: 2px solid transparent;
          outline-offset: 2px;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .react-flags-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f3f4f6;
        }

        .react-flags-select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          max-height: 300px;
          overflow-y: auto;
          z-index: 50;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-top: 0.25rem;
        }

        .react-flags-select-dropdown-item {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.15s ease;
        }

        .react-flags-select-dropdown-item:hover {
          background-color: #f3f4f6;
        }

        .react-flags-select-dropdown-item.selected {
          background-color: #eff6ff;
          color: #1e40af;
          font-weight: 500;
        }

        .react-flags-select .flag {
          width: 1.25rem;
          height: 0.75rem;
          margin-right: 0.5rem;
          border-radius: 0.125rem;
        }
      `}</style>
    </div>
  );
};

export default CountryFlagSelector;
