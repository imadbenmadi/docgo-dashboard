import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import Routers from "./Router.jsx";
import MainLoading from "./MainLoading.jsx";
import { RouterProvider } from "react-router-dom";

import { AppProvider } from "./AppContext";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AppProvider>
            <Suspense fallback={<MainLoading />}>
                <RouterProvider router={Routers} />
            </Suspense>
        </AppProvider>
    </StrictMode>
);
