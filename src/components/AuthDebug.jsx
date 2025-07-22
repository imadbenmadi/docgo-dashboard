import { useAppContext } from "../AppContext";

const AuthStatus = () => {
    const { isAuth, user, loading } = useAppContext();

    if (import.meta.env.PROD) {
        return null; // Only show in development
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border text-xs z-50">
            <div className="font-semibold mb-1">Auth Status (Dev Only)</div>
            <div>Loading: {loading ? "Yes" : "No"}</div>
            <div>Authenticated: {isAuth ? "Yes" : "No"}</div>
            <div>User: {user ? user.email || "N/A" : "None"}</div>
        </div>
    );
};

export default AuthStatus;
