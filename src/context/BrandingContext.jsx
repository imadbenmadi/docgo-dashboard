/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import apiClient from "../utils/apiClient";
import defaultLogo from "../assets/logo.png";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

const BrandingContext = createContext(null);

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used inside BrandingProvider");
  return ctx;
};

export const BrandingProvider = ({ children }) => {
  const API_URL = getApiBaseUrl();

  const [branding, setBranding] = useState({
    brandName: "",
    logoUrl: null,
    logoUpdatedAt: null,
  });

  const getLogoSrc = useCallback(
    (logoUrl, logoUpdatedAt) => {
      if (!logoUrl) return defaultLogo;
      const base = `${API_URL}${logoUrl}`;
      if (!logoUpdatedAt) return base;
      const v = new Date(logoUpdatedAt).getTime();
      return `${base}?v=${v}`;
    },
    [API_URL],
  );

  const fetchBranding = useCallback(async () => {
    try {
      const res = await apiClient.get("/Admin/SiteSettings");
      const s = res.data?.settings;
      if (s) {
        setBranding({
          brandName: s.brandName || "",
          logoUrl: s.logoUrl || null,
          logoUpdatedAt: s.logoUpdatedAt || null,
        });
      }
    } catch {
      // silently fall back to defaults
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const logoSrc = getLogoSrc(branding.logoUrl, branding.logoUpdatedAt);

  // Keep browser tab title and favicon in sync with the saved settings
  useEffect(() => {
    if (branding.brandName) {
      document.title = `${branding.brandName} - Admin`;
    }
    if (branding.logoUrl) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.type = "image/png";
      link.href = logoSrc;
    }
  }, [branding.brandName, branding.logoUrl, branding.logoUpdatedAt, logoSrc]);

  return (
    <BrandingContext.Provider
      value={{
        branding,
        logoSrc,
        refreshBranding: fetchBranding,
        setBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};
BrandingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
