import axios from "axios";
import Swal from "sweetalert2";
import { getApiBaseUrl } from "./apiBaseUrl";

let refreshPromise = null;

const getSafeNextPath = () => {
  try {
    return `${window.location.pathname}${window.location.search}${window.location.hash || ""}`;
  } catch {
    return "/";
  }
};

const redirectToLogin = async () => {
  const next = getSafeNextPath();
  if (next && !next.toLowerCase().startsWith("/login")) {
    sessionStorage.setItem("postLoginRedirect", next);
  }

  localStorage.removeItem("user");
  sessionStorage.removeItem("user");

  await Swal.fire({
    icon: "warning",
    title: "Session expirée",
    text: "Votre session a expiré. Veuillez vous reconnecter.",
    confirmButtonText: "Se reconnecter",
    allowOutsideClick: false,
  });

  const safeNext = sessionStorage.getItem("postLoginRedirect");
  const nextParam = safeNext ? `?next=${encodeURIComponent(safeNext)}` : "";
  window.location.href = `/Login${nextParam}`;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    // Log all PUT requests to see what's being sent
    if (config.method === "put" || config.method === "PUT") {
      if (config.data && config.data.quiz) {
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle authentication errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 (Unauthorized) responses
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const originalUrl = String(originalRequest?.url || "");

      const shouldSkipRefresh =
        originalRequest?.__skipAuthRefresh === true ||
        originalRequest?._retry === true ||
        /\/Admin_CheckAuth\b/i.test(originalUrl) ||
        /\/Admin_Login\b/i.test(originalUrl) ||
        /\/Login\b/i.test(originalUrl);

      if (!shouldSkipRefresh && originalRequest) {
        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = apiClient
              .get("/Admin_CheckAuth", {
                __skipAuthRefresh: true,
                validateStatus: () => true,
                timeout: 10000,
              })
              .then((res) => res?.status === 200)
              .catch(() => false)
              .finally(() => {
                refreshPromise = null;
              });
          }

          const refreshed = await refreshPromise;
          if (refreshed) {
            return apiClient(originalRequest);
          }
        } catch {
          // Fall through to forced re-login
        }
      }

      await redirectToLogin();
    }

    // Handle 403 (Forbidden) responses
    if (error.response?.status === 403) {
      Swal.fire({
        icon: "error",
        title: "Accès refusé",
        text: "Vous n'avez pas les permissions pour effectuer cette action.",
        confirmButtonColor: "#ef4444",
      });
    }

    // Handle 500 (Server Error) responses
    if (error.response?.status >= 500) {
      Swal.fire({
        icon: "error",
        title: "Erreur du serveur",
        text: "Une erreur serveur s'est produite. Veuillez réessayer plus tard.",
        confirmButtonColor: "#ef4444",
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
