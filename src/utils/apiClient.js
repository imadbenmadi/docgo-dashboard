import axios from "axios";
import Swal from "sweetalert2";

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    // Log all PUT requests to see what's being sent
    if (config.method === "put" || config.method === "PUT") {
      console.log("🌐 API Request Interceptor:");
      console.log("   Method:", config.method);
      console.log("   URL:", config.url);
      console.log("   Data:", config.data);
      if (config.data && config.data.quiz) {
        console.log("   Quiz in request:", config.data.quiz);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) responses
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // Show error message
      Swal.fire({
        icon: "warning",
        title: "Session expirée",
        text: "Votre session a expiré. Veuillez vous reconnecter.",
        confirmButtonText: "Se reconnecter",
        allowOutsideClick: false,
      }).then(() => {
        // Redirect to login page
        window.location.href = "/Login";
      });
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
  }
);

export default apiClient;
