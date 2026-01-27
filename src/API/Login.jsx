import apiClient from "../utils/apiClient";
import Swal from "sweetalert2";
const handleLogin = async ({ userData, setAuth, setUser, onError = null }) => {
    try {
        const response = await apiClient.post(`/Admin_Login`, userData, {
            validateStatus: () => true,
        });

        if (response.status === 200) {
            // Update authentication state
            setAuth(true);
            Swal.fire({
                title: "Connexion réussie",
                text: "Redirection vers le tableau de bord...",
                icon: "success",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            }).then(() => {
                window.location.href = "/";
            });

            return {
                success: true,
                message: "Login successful",
                data: response.data,
            };
        } else {
            // Handle error response
            const errorMessage =
                response.data?.message || "Échec de la connexion";

            if (onError) {
                onError({
                    message: errorMessage,
                    status: response.status,
                });
            }

            return {
                success: false,
                message: errorMessage,
                status: response.status,
                data: response.data,
            };
        }
    } catch (error) {
        const errorMessage =
            error.response?.data?.message ||
            "Échec de la connexion. Veuillez réessayer.";

        if (onError) {
            onError({
                message: errorMessage,
                error,
            });
        }

        return {
            success: false,
            message: errorMessage,
            error,
        };
    }
};

export default handleLogin;
