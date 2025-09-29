import axios from "axios";
import Swal from "sweetalert2";
const handleLogin = async ({ userData, setAuth, setUser, onError = null }) => {
    const API_URL = import.meta.env.VITE_API_URL;

    try {
        const response = await axios.post(`${API_URL}/Admin_Login`, userData, {
            withCredentials: true,
            validateStatus: () => true,
        });

        if (response.status === 200) {
            // Update authentication state
            setAuth(true);
            Swal.fire({
                title: "Login Successful",
                text: "Redirecting to dashboard...",
                icon: "success",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
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
            const errorMessage = response.data?.message || "Login failed";

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
            error.response?.data?.message || "Login failed. Please try again.";

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
