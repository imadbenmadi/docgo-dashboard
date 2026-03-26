/**
 * Validates and sanitizes numeric input
 * Allows only digits (0-9) and a single decimal point
 * Rejects: minus signs, commas, multiple decimals
 * @param {string} value - The input value to validate
 * @returns {string} - The sanitized value
 */
export const sanitizeNumericInput = (value) => {
  if (!value) return "";

  // Remove all characters except digits and decimal point
  let sanitized = value.replace(/[^0-9.]/g, "");

  // Remove all but the first decimal point
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }

  return sanitized;
};

/**
 * Handles numeric input change events
 * Call this in the onChange handler of numeric input fields
 * @param {Event} event - The input change event
 * @param {Function} setFieldValue - Formik's setFieldValue function (optional)
 * @returns {string} - The sanitized value
 */
export const handleNumericInput = (event, setFieldValue = null) => {
  const sanitized = sanitizeNumericInput(event.target.value);

  if (setFieldValue) {
    // For Formik
    setFieldValue(event.target.name, sanitized);
  } else {
    // For regular onChange handlers, just return the value
    event.target.value = sanitized;
  }

  return sanitized;
};

/**
 * Handles paste events to prevent invalid characters
 * @param {ClipboardEvent} event - The paste event
 * @param {Function} setFieldValue - Formik's setFieldValue function (optional)
 */
export const handleNumericPaste = (
  event,
  fieldName = null,
  setFieldValue = null,
) => {
  event.preventDefault();

  const pastedText = (event.clipboardData || window.clipboardData).getData(
    "text",
  );
  const sanitized = sanitizeNumericInput(pastedText);

  if (setFieldValue && fieldName) {
    setFieldValue(fieldName, sanitized);
  } else if (event.target) {
    event.target.value = sanitized;
  }
};
