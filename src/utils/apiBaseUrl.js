export const getApiBaseUrl = () => {
  // In local dev, use same-origin relative URLs so requests go through the
  // Vite dev proxy (vite.config.js). This keeps auth cookies first-party on
  // localhost and avoids cross-origin/SameSite issues.
  if (import.meta.env.DEV) return "";
  return import.meta.env.VITE_API_URL || "https://localhost:3000";
};

export const buildApiUrl = (path) => {
  if (!path) return null;

  const value = String(path);
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${base}${normalizedPath}`;
};
