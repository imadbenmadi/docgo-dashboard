import Swal from "sweetalert2";

const INTERNAL_KEYS = new Set([
  "stack",
  "trace",
  "sql",
  "sqlMessage",
  "sqlState",
]);

const safeString = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const extractAdminApiError = (error) => {
  const status = error?.response?.status ?? null;
  const data = error?.response?.data;

  let message =
    data?.message ??
    data?.error ??
    data?.details ??
    error?.message ??
    "Request failed";

  message = safeString(message).trim();

  const details = [];

  if (Array.isArray(data?.errors)) {
    for (const e of data.errors) {
      const line = safeString(e?.message ?? e).trim();
      if (line) details.push(line);
    }
  } else if (data?.errors && typeof data.errors === "object") {
    for (const [k, v] of Object.entries(data.errors)) {
      if (INTERNAL_KEYS.has(k)) continue;
      const line = safeString(v).trim();
      if (line) details.push(`${k}: ${line}`);
    }
  }

  // Some endpoints return { fieldErrors: { title: "required" } }
  if (data?.fieldErrors && typeof data.fieldErrors === "object") {
    for (const [k, v] of Object.entries(data.fieldErrors)) {
      const line = safeString(v).trim();
      if (line) details.push(`${k}: ${line}`);
    }
  }

  // Avoid showing huge blobs
  if (message.length > 800) message = `${message.slice(0, 800)}…`;

  return { status, message, details };
};

export const formatAdminApiError = (error, fallbackMessage) => {
  const { status, message, details } = extractAdminApiError(error);
  const head = message || fallbackMessage || "Request failed";
  const statusPart = status ? ` (${status})` : "";

  if (!details.length) return `${head}${statusPart}`;

  return `${head}${statusPart}\n\n${details.map((d) => `- ${d}`).join("\n")}`;
};

export const showAdminApiError = async (error, options = {}) => {
  const { title = "Erreur", fallbackMessage = "Request failed" } = options;
  const text = formatAdminApiError(error, fallbackMessage);

  await Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#ef4444",
  });
};
