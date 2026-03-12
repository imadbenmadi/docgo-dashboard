import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dashboard SPA routes that share a prefix with backend proxy paths.
// On refresh the browser sends a GET with Accept: text/html — we must serve
// index.html instead of forwarding to the Express server.
// API calls (fetch/axios) always carry Accept: application/json and are
// NOT intercepted here, so they still reach the backend.
const SPA_ROUTE_PREFIXES = [
  "/verify",
  "/statistics",
  "/Courses",
  "/Programs",
  "/Users",
  "/Favorites",
  "/payments",
  "/payment",
  "/notifications",
  "/HomePageManagement",
  "/ContactInfo",
  "/RegisterOptions",
  "/Applications",
  "/Enrollments",
  "/AllPayments",
  "/PaymentInfo",
  "/FAQ",
  "/Contact",
  "/Certificates",
  "/CertificateDesigner",
  "/Moderation",
  "/ErrorLogs",
  "/ForgotPasswordRequests",
  "/DeleteAccountRequests",
  "/AllSpecialties",
  "/AddCountrySpecialty",
  "/DatabaseManagement",
  "/Security",
];

const spaFallbackPlugin = {
  name: "spa-fallback-for-shared-routes",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = req.url?.split("?")[0] ?? "";
      const isSpaRoute = SPA_ROUTE_PREFIXES.some(
        (p) =>
          url.toLowerCase() === p.toLowerCase() ||
          url.toLowerCase().startsWith(p.toLowerCase() + "/"),
      );
      if (isSpaRoute) {
        // Never intercept static asset requests — let them proxy through to the backend
        const staticExts =
          /\.(jpg|jpeg|png|gif|webp|avif|svg|ico|mp4|webm|mov|pdf|woff2?|ttf|eot|otf|js|css|json)$/i;
        if (staticExts.test(url)) return next();

        // Never intercept backend image/media serving endpoints (path ends with /image, /thumbnail, etc.)
        const isMediaEndpoint =
          /\/(image|thumbnail|photo|avatar|preview|download)(\/|$)/i.test(url);
        if (isMediaEndpoint) return next();

        const accept = req.headers["accept"] || "";
        const contentType = req.headers["content-type"] || "";
        const isApiCall =
          accept.includes("application/json") ||
          contentType.includes("application/json") ||
          (req.headers["x-requested-with"] || "") === "XMLHttpRequest";
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
      "/enrollment": "http://localhost:3000",
      "/verify": "http://localhost:3000",
    },
  },
});
