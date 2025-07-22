import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../AppContext";
import MainLoading from "../MainLoading";

const ProtectedRoute = ({ children }) => {
    const { isAuth, loading } = useAppContext();
    const location = useLocation();

    // Show loading while checking authentication
    if (loading) {
        return <MainLoading />;
    }

    // If not authenticated, redirect to login
    if (!isAuth) {
        return <Navigate to="/Login" state={{ from: location }} replace />;
    }

    // If authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
