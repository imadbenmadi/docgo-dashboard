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
            const user = response.data.user;
            if (!user) {
                throw new Error("User data not found in response");
            }

            // Update authentication state
            setAuth(true);
            setUser(user);
            Swal.fire({
                title: "Login Successful",
                text: "You have successfully logged in.",
                icon: "success",
                confirmButtonText: "OK",
                // automatically redirect after 2 seconds
                timer: 2000,
                timerProgressBar: true,
            }).then(() => {
                // Redirect to profile page after successful login
                window.location.href = "/Profile";
            });
            // window.location.href = "/Profile";

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
