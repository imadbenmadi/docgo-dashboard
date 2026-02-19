import { useCallback, useState } from "react";

/**
 * useFormValidation
 * Shared hook for managing form validation errors and the validation panel state.
 *
 * Usage:
 *   const { errors, warnings, showPanel, validate, clearErrors, setErrors } = useFormValidation();
 *
 * Then call: validate(myValidationRules, formValues) to run validation.
 *
 * Validation rule shape:
 *   {
 *     field: string,        -- human-readable field label
 *     message: string,      -- error message when invalid
 *     type?: "error"|"warning",  -- default "error"
 *     section?: string,     -- groups errors by section (e.g. "Informations générales")
 *     scrollToId?: string,  -- DOM id to scroll to on click
 *     condition: (values) => boolean, -- returns TRUE when there IS an error
 *   }
 */
export function useFormValidation() {
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    /**
     * Run validation rules against form values.
     * @param {Array} rules - validation rules
     * @returns {boolean} true if valid (no errors)
     */
    const validate = useCallback((rules) => {
        const newErrors = [];
        const newWarnings = [];

        rules.forEach((rule) => {
            const hasIssue =
                typeof rule.condition === "function"
                    ? rule.condition()
                    : !!rule.condition;
            if (hasIssue) {
                const item = {
                    field: rule.field,
                    message: rule.message,
                    section: rule.section,
                    scrollToId: rule.scrollToId,
                };
                if (rule.type === "warning") {
                    newWarnings.push(item);
                } else {
                    newErrors.push(item);
                }
            }
        });

        setErrors(newErrors);
        setWarnings(newWarnings);

        if (newErrors.length > 0) {
            setShowPanel(true);
            setShowSuccess(false);
            return false;
        }

        // Optional warnings - still valid but show if any
        if (newWarnings.length > 0) {
            setShowPanel(true);
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        return true;
    }, []);

    const clearErrors = useCallback(() => {
        setErrors([]);
        setWarnings([]);
        setShowPanel(false);
        setShowSuccess(false);
    }, []);

    const hidePanel = useCallback(() => {
        setShowPanel(false);
    }, []);

    const openPanel = useCallback(() => {
        setShowPanel(true);
    }, []);

    return {
        errors,
        warnings,
        showPanel,
        showSuccess,
        validate,
        clearErrors,
        hidePanel,
        openPanel,
        setErrors,
        setWarnings,
        errorCount: errors.length,
        warningCount: warnings.length,
        hasErrors: errors.length > 0,
    };
}

// ─── Pre-built validation rule factories ─────────────────────────────────────

/**
 * Required string field
 */
export function requiredString(field, value, options = {}) {
    return {
        field: options.label || field,
        message: options.message || `${options.label || field} est requis(e)`,
        section: options.section,
        scrollToId:
            options.scrollToId || field.toLowerCase().replace(/\s+/g, "-"),
        type: "error",
        condition: () => !value || String(value).trim().length === 0,
    };
}

/**
 * Min-length string
 */
export function minLength(field, value, min, options = {}) {
    return {
        field: options.label || field,
        message:
            options.message ||
            `${options.label || field} doit contenir au moins ${min} caractères`,
        section: options.section,
        scrollToId: options.scrollToId,
        type: "error",
        condition: () =>
            value &&
            String(value)
                .replace(/<[^>]*>/g, "")
                .trim().length < min,
    };
}

/**
 * Required file
 */
export function requiredFile(field, value, options = {}) {
    return {
        field: options.label || field,
        message: options.message || `${options.label || field} est requis(e)`,
        section: options.section,
        scrollToId: options.scrollToId,
        type: "error",
        condition: () => !value,
    };
}

/**
 * Required array (min 1 item)
 */
export function requiredArray(field, arr, options = {}) {
    return {
        field: options.label || field,
        message:
            options.message ||
            `Au moins 1 ${options.label || field} est requis`,
        section: options.section,
        scrollToId: options.scrollToId,
        type: "error",
        condition: () => !arr || arr.length === 0,
    };
}

/**
 * Positive number
 */
export function positiveNumber(field, value, options = {}) {
    return {
        field: options.label || field,
        message:
            options.message || `${options.label || field} doit être positif`,
        section: options.section,
        scrollToId: options.scrollToId,
        type: "error",
        condition: () =>
            value !== "" &&
            value !== null &&
            value !== undefined &&
            parseFloat(value) < 0,
    };
}

/**
 * Date must be after another date
 */
export function dateAfter(field, date, afterDate, options = {}) {
    return {
        field: options.label || field,
        message:
            options.message ||
            `${options.label || field} doit être après la date de début`,
        section: options.section,
        scrollToId: options.scrollToId,
        type: "error",
        condition: () =>
            date && afterDate && new Date(date) <= new Date(afterDate),
    };
}

/**
 * Discount must be less than price
 */
export function discountLessThanPrice(discountValue, priceValue, options = {}) {
    return {
        field: options.label || "Prix réduit",
        message:
            options.message ||
            "Le prix réduit doit être inférieur au prix normal",
        section: options.section,
        scrollToId: options.scrollToId || "discountPrice",
        type: "error",
        condition: () =>
            discountValue &&
            priceValue &&
            parseFloat(discountValue) >= parseFloat(priceValue),
    };
}

/**
 * Custom rule
 */
export function customRule(field, condition, message, options = {}) {
    return {
        field: options.label || field,
        message,
        section: options.section,
        scrollToId: options.scrollToId,
        type: options.type || "error",
        condition,
    };
}
