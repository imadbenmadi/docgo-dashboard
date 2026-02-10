import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // Dev proxy so cookies remain first-party on localhost
        proxy: {
            "/Admin_Login": "http://localhost:3000",
            "/Admin_CheckAuth": "http://localhost:3000",
            "/Admin_Logout": "http://localhost:3000",
            "/Admin": "http://localhost:3000",

            // Some dashboard pages call shared API prefixes
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
        },
    },
});
