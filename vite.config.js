import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Intercepts /Courses/* and /Programs/* browser navigations BEFORE the proxy
// so Vite serves index.html (React SPA). Axios/fetch API calls that send
// Accept: application/json are NOT intercepted and pass through to the backend.
const spaFallbackPlugin = {
    name: "spa-fallback-for-shared-routes",
    configureServer(server) {
        server.middlewares.use((req, _res, next) => {
            const url = req.url?.split("?")[0] ?? "";
            if (/^\/(Courses|Programs)(\/|$)/i.test(url)) {
                const accept = req.headers["accept"] || "";
                const contentType = req.headers["content-type"] || "";
                const isApiCall =
                    accept.includes("application/json") ||
                    contentType.includes("application/json") ||
                    (req.headers["x-requested-with"] || "") ===
                        "XMLHttpRequest";
                if (!isApiCall) {
                    req.url = "/index.html";
                }
            }
            next();
        });
    },
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), spaFallbackPlugin],
    server: {
        // Dev proxy so cookies remain first-party on localhost
        proxy: {
            "/Admin_Login": "http://localhost:3000",
            "/Admin_CheckAuth": "http://localhost:3000",
            "/Admin_Logout": "http://localhost:3000",
            "/Admin": "http://localhost:3000",

            // API calls to /Courses and /Programs come here only when they carry
            // Accept: application/json (fetch/axios). Browser navigations are
            // intercepted by spaFallbackPlugin above and never reach the proxy.
            "/Courses": "http://localhost:3000",
            "/Programs": "http://localhost:3000",
            "/Users": "http://localhost:3000",
            "/Favorites": "http://localhost:3000",
            "/payments": "http://localhost:3000",
            "/payment": "http://localhost:3000",
            "/payment-status": "http://localhost:3000",
            "/notifications": "http://localhost:3000",
            "/upload": "http://localhost:3000",
            "/media": "http://localhost:3000",
            "/public": "http://localhost:3000",
            "/faqs": "http://localhost:3000",
            "/contacts": "http://localhost:3000",
            "/statistics": "http://localhost:3000",
            "/logs": "http://localhost:3000",
        },
    },
});
