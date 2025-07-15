import React from "react";

const FormInput = ({
  label,
  value,
  onChange,
  multiline = false,
  className = "",
  placeholder = "",
  type = "text",
  error = null,
  name,
}) => (
  <div className={`w-full max-md:max-w-full ${className}`}>
    {label && (
      <label
        htmlFor={name}
        className="block text-xl font-semibold text-gray-800 mb-3"
      >
        {label}
      </label>
    )}
    {multiline ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className={`w-full px-6 py-3 text-base rounded-2xl border ${
          error ? "border-red-500" : "border-gray-300"
        } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors resize-none`}
        aria-label={label}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-6 py-3 text-base rounded-2xl border ${
          error ? "border-red-500" : "border-gray-300"
        } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
        aria-label={label}
      />
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default FormInput;
