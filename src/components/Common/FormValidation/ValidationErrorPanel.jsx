import { AnimatePresence, motion } from "framer-motion";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    X,
    XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * ValidationErrorPanel
 * A beautiful floating slide-in panel that shows all form validation errors at once.
 *
 * Props:
 *  - errors: Array<{ field: string, message: string, section?: string, scrollToId?: string }>
 *  - warnings: Array<{ field: string, message: string, section?: string }>
 *  - isVisible: boolean
 *  - onClose: () => void
 *  - title?: string
 *  - onFixError?: (error) => void  -- optional callback when "go to field" is clicked
 */
export default function ValidationErrorPanel({
    errors = [],
    warnings = [],
    isVisible = false,
    onClose,
    title = "Champs manquants ou invalides",
    onFixError,
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [dismissedErrors, setDismissedErrors] = useState(new Set());
    const panelRef = useRef(null);

    const visibleErrors = errors.filter(
        (e) => !dismissedErrors.has(e.field + e.message),
    );
    const visibleWarnings = warnings.filter(
        (w) => !dismissedErrors.has(w.field + w.message),
    );

    const totalCount = visibleErrors.length + visibleWarnings.length;

    // Reset dismissed when errors change completely
    useEffect(() => {
        setDismissedErrors(new Set());
        if (errors.length > 0 || warnings.length > 0) {
            setIsExpanded(true);
        }
    }, [errors.length, warnings.length]);

    const dismissItem = (e, item) => {
        e.stopPropagation();
        setDismissedErrors(
            (prev) => new Set([...prev, item.field + item.message]),
        );
    };

    const scrollToField = (item) => {
        if (item.scrollToId) {
            const el = document.getElementById(item.scrollToId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.focus?.();
                // Flash highlight
                el.classList.add("ring-2", "ring-red-400", "ring-offset-2");
                setTimeout(() => {
                    el.classList.remove(
                        "ring-2",
                        "ring-red-400",
                        "ring-offset-2",
                    );
                }, 2000);
            }
        }
        onFixError?.(item);
    };

    // Group errors by section
    const grouped = {};
    [
        ...visibleErrors.map((e) => ({ ...e, type: "error" })),
        ...visibleWarnings.map((w) => ({ ...w, type: "warning" })),
    ].forEach((item) => {
        const section = item.section || "Général";
        if (!grouped[section]) grouped[section] = [];
        grouped[section].push(item);
    });

    if (!isVisible && totalCount === 0) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop blur on mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 pointer-events-none"
                    />

                    {/* Panel */}
                    <motion.div
                        ref={panelRef}
                        initial={{ x: 420, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 420, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="fixed top-6 right-6 z-50 w-[380px] max-h-[85vh] flex flex-col"
                        style={{ maxWidth: "calc(100vw - 24px)" }}
                    >
                        {/* Glass card */}
                        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden flex flex-col max-h-[85vh]">
                            {/* Header */}
                            <div
                                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none border-b ${
                                    visibleErrors.length > 0
                                        ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-100"
                                        : "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100"
                                }`}
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {/* Icon */}
                                <div
                                    className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                                        visibleErrors.length > 0
                                            ? "bg-red-100 text-red-600"
                                            : "bg-yellow-100 text-yellow-600"
                                    }`}
                                >
                                    {visibleErrors.length > 0 ? (
                                        <XCircle className="w-5 h-5" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Title + count */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`font-semibold text-sm truncate ${
                                                visibleErrors.length > 0
                                                    ? "text-red-800"
                                                    : "text-yellow-800"
                                            }`}
                                        >
                                            {title}
                                        </span>
                                        <span
                                            className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                                                visibleErrors.length > 0
                                                    ? "bg-red-600 text-white"
                                                    : "bg-yellow-500 text-white"
                                            }`}
                                        >
                                            {totalCount}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {visibleErrors.length > 0
                                            ? `${visibleErrors.length} erreur${visibleErrors.length > 1 ? "s" : ""} à corriger`
                                            : `${visibleWarnings.length} avertissement${visibleWarnings.length > 1 ? "s" : ""}`}
                                    </p>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsExpanded(!isExpanded);
                                        }}
                                        className="w-7 h-7 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClose?.();
                                        }}
                                        className="w-7 h-7 rounded-lg hover:bg-red-100 hover:text-red-600 text-gray-400 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-y-auto custom-scrollbar"
                                    >
                                        <div className="p-3 space-y-3">
                                            {Object.entries(grouped).map(
                                                ([section, items]) => (
                                                    <div key={section}>
                                                        {/* Section header */}
                                                        {Object.keys(grouped)
                                                            .length > 1 && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                                    {section}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Error items */}
                                                        <div className="space-y-1.5">
                                                            {items.map(
                                                                (item, idx) => (
                                                                    <ErrorItem
                                                                        key={`${item.field}-${idx}`}
                                                                        item={
                                                                            item
                                                                        }
                                                                        onDismiss={
                                                                            dismissItem
                                                                        }
                                                                        onScrollTo={
                                                                            scrollToField
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {/* Footer hint */}
                                        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                                            <p className="text-xs text-gray-400 text-center">
                                                Cliquez sur un champ pour aller
                                                directement à la correction
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Single error/warning item row
 */
function ErrorItem({ item, onDismiss, onScrollTo }) {
    const isError = item.type === "error";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => onScrollTo(item)}
            className={`group flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                isError
                    ? "bg-red-50 border-red-100 hover:bg-red-100/70 hover:border-red-200"
                    : "bg-yellow-50 border-yellow-100 hover:bg-yellow-100/70 hover:border-yellow-200"
            }`}
        >
            {/* Icon */}
            <div
                className={`flex-shrink-0 mt-0.5 ${isError ? "text-red-500" : "text-yellow-500"}`}
            >
                {isError ? (
                    <AlertCircle className="w-4 h-4" />
                ) : (
                    <AlertTriangle className="w-4 h-4" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {item.field && (
                    <p
                        className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${
                            isError ? "text-red-700" : "text-yellow-700"
                        }`}
                    >
                        {item.field}
                    </p>
                )}
                <p
                    className={`text-sm leading-snug ${
                        isError ? "text-red-800" : "text-yellow-800"
                    }`}
                >
                    {item.message}
                </p>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-1">
                {item.scrollToId && (
                    <span
                        className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium px-1.5 py-0.5 rounded ${
                            isError
                                ? "text-red-600 bg-red-100"
                                : "text-yellow-600 bg-yellow-100"
                        }`}
                    >
                        ↗ Aller
                    </span>
                )}
                <button
                    onClick={(e) => onDismiss(e, item)}
                    className={`w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                        isError
                            ? "hover:bg-red-200 text-red-400 hover:text-red-700"
                            : "hover:bg-yellow-200 text-yellow-400 hover:text-yellow-700"
                    }`}
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
}

/**
 * ValidationSuccessBanner - shows briefly when validation passes
 */
export function ValidationSuccessBanner({
    isVisible,
    message = "Tout est en ordre ! Soumission en cours...",
}) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed top-6 right-6 z-50"
                >
                    <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Inline field-level error indicator
 */
export function FieldError({ message, className = "" }) {
    if (!message) return null;
    return (
        <AnimatePresence>
            <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-1.5 text-xs text-red-600 mt-1 font-medium ${className}`}
            >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {message}
            </motion.p>
        </AnimatePresence>
    );
}

/**
 * Submit button with validation status badge
 */
export function ValidatedSubmitButton({
    errorCount = 0,
    isSubmitting = false,
    onClick,
    children,
    className = "",
    disabled = false,
}) {
    const hasErrors = errorCount > 0;

    return (
        <div className="relative inline-flex">
            <button
                type={onClick ? "button" : "submit"}
                onClick={onClick}
                disabled={isSubmitting || disabled}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                    hasErrors
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                } ${className}`}
            >
                {isSubmitting ? (
                    <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                ) : hasErrors ? (
                    <XCircle className="w-4 h-4" />
                ) : null}
                {children}
            </button>

            {/* Error count badge */}
            <AnimatePresence>
                {hasErrors && !isSubmitting && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 border-2 border-white text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                    >
                        {errorCount > 9 ? "9+" : errorCount}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
