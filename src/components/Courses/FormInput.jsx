import React from "react";

const FormInput = ({
  label,
  value,
  onChange,
  multiline = false,
  className = "",
  placeholder = "",
  type = "text",
}) => (
  <div className={`w-full max-md:max-w-full ${className}`}>
    {label && (
      <label className="block text-xl font-semibold text-gray-800 mb-3">
        {label}
      </label>
    )}
    {multiline ? (
      <textarea
        value={value}
        onChange={onChange} // pass the full event object
        placeholder={placeholder}
        rows={4}
        className="w-full px-6 py-3 text-base rounded-2xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
        aria-label={label}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange} // pass the full event object
        placeholder={placeholder}
        className="w-full px-6 py-3 text-base rounded-2xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        aria-label={label}
      />
    )}
  </div>
);

export default FormInput;
