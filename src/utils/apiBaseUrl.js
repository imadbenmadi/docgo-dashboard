/**
 * Where the API lives.
 *
 * This used to be a hardcoded `return "https://localhost:3000"`, with
 * VITE_API_URL sitting in .env being read by nobody. That is two bugs, not one:
 *
 *   - in development every request failed with ERR_SSL_PROTOCOL_ERROR, because
 *     the dev server speaks http and this asked for https;
 *   - in production the built bundle would have pointed at localhost, so the
 *     deployed dashboard would call whatever happened to be running on the
 *     visitor's own machine.
 *
 * The env variable decides, which is what it was always there for. The
 * localhost fallback applies only when nothing is configured.
 */

const FALLBACK = "http://localhost:3000";

export const getApiBaseUrl = () => {
  const configured = String(import.meta.env?.VITE_API_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (import.meta.env?.PROD) {
    // Shipping a build that quietly calls localhost is worse than shipping one
    // that says why it cannot work.
    console.error(
      "VITE_API_URL is not set. The dashboard has no API to talk to. " +
        "Set it in .env before building for production.",
    );
  }
  return FALLBACK;
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
