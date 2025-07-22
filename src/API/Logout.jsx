import axios from "axios";

const handleLogout = async ({
    setAuth,
    setUser,
    storeLogout,
    setIsDropdownOpen = null,
}) => {
    const API_URL = import.meta.env.VITE_API_URL;

    try {
        // Send a request to the logout endpoint on the server
        await axios.post(
            `${API_URL}/Admin_Logout`,
            {},
            {
                withCredentials: true,
                validateStatus: () => true,
            }
        );
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        // Close dropdown if function was provided
        if (setIsDropdownOpen) {
            setIsDropdownOpen(false);
        }

        // Clear user data and authentication state
        storeLogout();
        setAuth(false);
        setUser(null);
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        window.location.href = "/";
    }
};

export default handleLogout;
