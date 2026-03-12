// Centralized API base URL resolution for Vite dev/prod.
//
// In development, Vite's proxy forwards requests to the backend on localhost,
// so we use same-origin ("") to keep cookies first-party.
// In production, VITE_API_URL must be set to the real backend origin.

export const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL;

  if (import.meta.env.DEV) return "";

  if (!configured) {
    console.error(
      "[apiBaseUrl] VITE_API_URL is not set — API calls will fail!",
    );
  }
  return configured ?? "";
};
