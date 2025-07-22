import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./AppContext";
import MainLoading from "./MainLoading";

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const { loading: authLoading, isAuth } = useAppContext();

    useEffect(() => {
        // If authentication check is complete and user is not authenticated
        if (!authLoading && !isAuth ) {
            navigate("/Login", { replace: true });
        }

        // If user is authenticated and trying to access login page, redirect to dashboard
        if (!authLoading && isAuth && location.pathname === "/Login") {
            navigate("/", { replace: true });
        }
    }, [isAuth, authLoading, location.pathname, navigate]);

    // Show loading while authentication is being checked
    if (authLoading) {
        return <MainLoading />;
    }

    return (
        <div>
            <Outlet />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: "#10B981",
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: "#EF4444",
                        },
                    },
                }}
            />
        </div>
    );
}

export default App;
