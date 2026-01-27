import apiClient from "../utils/apiClient";

const handleLogout = async ({
    setAuth,
    setUser,
    storeLogout,
    setIsDropdownOpen = null,
}) => {
    try {
        // Send a request to the logout endpoint on the server
        await apiClient.post(
            `/Admin_Logout`,
            {},
            {
                validateStatus: () => true,
            },
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
