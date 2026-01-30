import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../AppContext";
import MainLoading from "../MainLoading";

const getSafeNextPath = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    if (!raw.startsWith("/")) return null;
    if (raw.startsWith("//")) return null;
    return raw;
};

const ProtectedRoute = ({ children }) => {
    const { isAuth, loading } = useAppContext();
    const location = useLocation();

    // Show loading while checking authentication
    if (loading) {
        return <MainLoading />;
    }

    // If not authenticated, redirect to login
    if (!isAuth) {
        const next = `${location.pathname}${location.search}${location.hash || ""}`;
        const safeNext = getSafeNextPath(next);
        if (safeNext && !safeNext.toLowerCase().startsWith("/login")) {
            sessionStorage.setItem("postLoginRedirect", safeNext);
        }

        const nextParam = safeNext
            ? `?next=${encodeURIComponent(safeNext)}`
            : "";
        return (
            <Navigate
                to={`/Login${nextParam}`}
                state={{ from: location }}
                replace
            />
        );
    }

    // If authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
