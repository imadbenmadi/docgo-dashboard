// Centralized API base URL resolution for Vite dev/prod.
//
// In development, we prefer same-origin (""), so Vite's proxy can forward
// requests to the backend while keeping cookies first-party on localhost.
//
// In production, VITE_API_URL should point to the backend origin.

const isLocalhostUrl = (value) => {
    if (!value) return false;
    try {
        const url = new URL(value);
        return url.hostname === "localhost" || url.hostname === "127.0.0.1";
    } catch {
        return false;
    }
};

export const getApiBaseUrl = () => {
    const configured = import.meta.env.VITE_API_URL;

    if (import.meta.env.DEV) {
        if (configured && !isLocalhostUrl(configured)) return configured;
        return "";
    }

    return configured ?? "http://localhost:3000";
};
