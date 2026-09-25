/**
 * API origin, from VITE_API_URL.
 *
 * The localhost fallback is a development convenience only; note the dev
 * server speaks http, not https.
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

/**
 * The public route that serves a product's intro image or video.
 *
 * Intro videos are stored in a protected bucket, so the path saved on the row
 * answers 404 on its own; this route asks MediaStore where the file actually
 * is, which is also what makes it work when the file lives on Bunny rather
 * than on disk.
 */
export const introMediaUrl = (product, id, kind = "video") => {
  if (!product || id === undefined || id === null || id === "") return null;
  return buildApiUrl(`/public/intro/${product}/${encodeURIComponent(id)}/${kind}`);
};
