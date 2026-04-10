import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useBranding } from "./BrandingContext";

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [activeItem, setActiveItem] = useState("statistics-overview");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [pageTitle, setPageTitle] = useState("");
  const location = useLocation();
  const { branding } = useBranding();

  // Route to menu item mapping - memoized to prevent useEffect warnings
  const routeMapping = useMemo(
    () => ({
      "/": "statistics-overview",
      "/Statistics": "statistics-overview",
      // Statistics sub-routes
      "/statistics": "statistics-overview",
      "/statistics/visits": "statistics-visits",
      "/statistics/content": "statistics-content",
      "/statistics/users": "statistics-users",
      "/statistics/payments": "statistics-payments",
      "/statistics/favorites": "statistics-favorites",
      "/statistics/searches": "statistics-searches",
      "/statistics/registrations": "statistics-registrations",
      "/statistics/logins": "statistics-logins",
      "/Security": "security",
      "/ContactInfo": "contact-info",
      // Homepage management
      "/HomePageManagement": "homepage-overview",
      "/HomePageManagement/Content": "homepage-content",
      "/HomePageManagement/Featured": "homepage-featured",
      // User/Register options
      "/UserOptions": "user-options",
      "/UserOptions/Insights": "user-options-insights",
      "/RegisterOptions/Insights": "user-options-insights", // Legacy route support
      // Courses
      "/Courses": "all-courses",
      "/Courses/Add": "add-course",
      "/Courses/Deleted": "deleted-courses",
      "/Courses/progress": "course-progress",
      "/Certificates": "certificates",
      "/CertificateDesigner": "certificate-designer",
      // Programs
      "/Programs": "all-programs",
      "/Programs/Add": "add-program",
      "/Programs/Deleted": "deleted-programs",
      // Applications
      "/Applications/Programs": "program-applications",
      "/Applications/Courses": "course-applications",
      // Enrollments
      "/Enrollments": "active-enrollments",
      "/Enrollments/Removed": "removed-enrollments",
      // Payments
      "/AllPayments": "all-payments",
      "/PaymentInfo": "payment-config",
      // FAQ & Contact
      "/FAQ": "faq",
      "/Ratings": "ratings",
      "/Contact": "contact",
      "/Contact/statistics": "contact",
      // Users & system
      "/Users": "users",
      "/Admins": "admins",
      "/Moderation": "moderation",
      "/ErrorLogs": "error-logs",
      "/DatabaseBackup": "database-backup",
      // User requests
      "/ForgotPasswordRequests": "forgot-password-requests",
      "/DeleteAccountRequests": "delete-account-requests",
      // Coupons
      "/Coupons": "coupons",
      // Emails
      "/Emails": "emails-welcome",
      "/Emails/Welcome": "emails-welcome",
      "/Emails/LoginAttempts": "emails-login-attempts",
      "/Emails/PaymentApproved": "emails-payment-approved",
      "/Emails/PaymentRejected": "emails-payment-rejected",
      "/Emails/Marketing": "emails-marketing",
      // Tools
      "/Tools/QRCode": "qrcode-builder",
      // Legacy / aliases
      "/PaymentManagement": "all-payments",
      "/AllSpecialties": "all-specialties",
      "/AddCountrySpecialty": "add-country-specialty",
      "/DatabaseManagement": "database-management",
    }),
    [],
  );

  // Helper function to generate title with brand name
  const getTitle = useCallback(
    (suffix) => {
      const brand = branding?.brandName || "Dashboard";
      return `${brand} - ${suffix}`;
    },
    [branding?.brandName],
  );

  // Helper function to get base title
  const getBaseTitle = useCallback(() => {
    return branding?.brandName || "Dashboard";
  }, [branding?.brandName]);

  // Route to page title mapping - uses getTitle callback
  const getTitleMapping = useCallback(() => {
    return {
      "/": getTitle("Statistiques"),
      "/Statistics": getTitle("Analytics & Statistics"),
      // Statistics sub-routes
      "/statistics": getTitle("Vue d'ensemble"),
      "/statistics/visits": getTitle("Trafic & Visites"),
      "/statistics/content": getTitle("Vues du contenu"),
      "/statistics/users": getTitle("Croissance utilisateurs"),
      "/statistics/payments": getTitle("Revenus"),
      "/statistics/favorites": getTitle("Favoris"),
      "/statistics/searches": getTitle("Recherches"),
      "/statistics/registrations": getTitle("Analyse de la demande"),
      "/statistics/logins": getTitle("Connexions utilisateurs"),
      "/Security": getTitle("Security Management"),
      "/ContactInfo": getTitle("Contact Information"),
      "/HomePageManagement": getTitle("Homepage Overview"),
      "/HomePageManagement/Content": getTitle("Content Editor"),
      "/HomePageManagement/Featured": getTitle("Featured Items"),
      "/UserOptions": getTitle("Gestion des Options Utilisateur"),
      "/UserOptions/Insights": getTitle("Analyses des Options Utilisateur"),
      "/RegisterOptions/Insights": getTitle("Analyses des Options Utilisateur"),
      "/Courses": getTitle("Courses Management"),
      "/Courses/Add": getTitle("Create New Course"),
      "/Courses/Deleted": getTitle("Deleted Courses"),
      "/Courses/progress": getTitle("Course Progress"),
      "/Certificates": getTitle("Certificates"),
      "/CertificateDesigner": getTitle("Certificate Designer"),
      "/Programs": getTitle("Programs Management"),
      "/Programs/Add": getTitle("Create New Program"),
      "/Programs/Deleted": getTitle("Deleted Programs"),
      "/Applications/Programs": getTitle("Program Applications"),
      "/Applications/Courses": getTitle("Course Applications"),
      "/Enrollments": getTitle("Active Enrollments"),
      "/Enrollments/Removed": getTitle("Removed Enrollments"),
      "/AllPayments": getTitle("Payment Management"),
      "/PaymentInfo": getTitle("Payment Configuration"),
      "/FAQ": getTitle("FAQ Management"),
      "/Ratings": getTitle("Les avis"),
      "/Contact": getTitle("Contact Messages"),
      "/Contact/statistics": getTitle("Contact Statistics"),
      "/Users": getTitle("Users Management"),
      "/Admins": getTitle("Admins Management"),
      "/Moderation": getTitle("Media Moderation"),
      "/ErrorLogs": getTitle("Server Logs"),
      "/DatabaseBackup": getTitle("Database Backup"),
      "/ForgotPasswordRequests": getTitle("Forgot Password Requests"),
      "/DeleteAccountRequests": getTitle("Delete Account Requests"),
      "/Coupons": getTitle("Coupons"),
      "/Emails": getTitle("Emails"),
      "/Emails/Welcome": getTitle("Welcome Email Template"),
      "/Emails/LoginAttempts": getTitle("Login Attempts Email Template"),
      "/Emails/PaymentApproved": getTitle("Payment Approved Email Template"),
      "/Emails/PaymentRejected": getTitle("Payment Rejected Email Template"),
      "/Emails/PasswordReset": getTitle("Password Reset Email Template"),
      "/Emails/Marketing": getTitle("Marketing Emails"),
      "/Tools/QRCode": getTitle("QR Code Builder"),
      "/PaymentManagement": getTitle("Payment Management"),
      "/AllSpecialties": getTitle("Specialties"),
      "/AddCountrySpecialty": getTitle("Configure Countries & Specialties"),
      "/DatabaseManagement": getTitle("Database Management"),
    };
  }, [getTitle]);

  // Parent menu items for dropdown management - memoized to prevent useEffect warnings
  const parentMapping = useMemo(
    () => ({
      // Statistics submenu
      "statistics-overview": "statistics",
      "statistics-visits": "statistics",
      "statistics-content": "statistics",
      "statistics-users": "statistics",
      "statistics-payments": "statistics",
      "statistics-favorites": "statistics",
      "statistics-searches": "statistics",
      "statistics-registrations": "statistics",
      "statistics-logins": "statistics",
      // Homepage submenu
      "homepage-overview": "homepage",
      "homepage-content": "homepage",
      "homepage-featured": "homepage",
      "homepage-filter": "homepage",
      // User Options submenu
      "user-options-insights": "user-options", // Insights is submenu of User Options
      // Courses submenu
      "all-courses": "courses",
      "add-course": "courses",
      "deleted-courses": "courses",
      "course-progress": "courses",
      certificates: "courses",
      "certificate-designer": "courses",
      // Programs submenu
      "all-programs": "programs",
      "add-program": "programs",
      "deleted-programs": "programs",
      // Applications submenu
      "program-applications": "applications",
      "course-applications": "applications",
      // Enrollments submenu
      "active-enrollments": "enrollments",
      "removed-enrollments": "enrollments",
      // Payments submenu
      "all-payments": "paiements",
      "payment-config": "paiements",
      // Legacy specialties
      "all-specialties": "specialties",
      "add-country-specialty": "specialties",
      // User requests submenu
      "forgot-password-requests": "user-requests",
      "delete-account-requests": "user-requests",
      // Tools submenu
      "qrcode-builder": "tools",
      // Emails submenu
      "emails-welcome": "emails",
      "emails-login-attempts": "emails",
      "emails-payment-approved": "emails",
      "emails-payment-rejected": "emails",
      "emails-marketing": "emails",
    }),
    [],
  );

  // Update active item and page title based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const titleMapping = getTitleMapping();

    // Update page title - handle dynamic routes
    if (titleMapping[currentPath]) {
      setPageTitle(titleMapping[currentPath]);
      document.title = titleMapping[currentPath];
    } else if (
      currentPath.startsWith("/Courses/") &&
      currentPath !== "/Courses"
    ) {
      if (currentPath.includes("/Edit")) {
        const title = getTitle("Edit Course");
        setPageTitle(title);
        document.title = title;
      } else if (currentPath.includes("/sections")) {
        const title = getTitle("Manage Sections");
        setPageTitle(title);
        document.title = title;
      } else {
        const title = getTitle("Course Details");
        setPageTitle(title);
        document.title = title;
      }
    } else if (
      currentPath.startsWith("/Programs/") &&
      currentPath !== "/Programs/Add"
    ) {
      const title = currentPath.includes("/Edit")
        ? getTitle("Edit Program")
        : getTitle("Program Details");
      setPageTitle(title);
      document.title = title;
    } else {
      const baseTitle = getBaseTitle();
      setPageTitle(baseTitle);
      document.title = baseTitle;
    }

    // Check for exact route match first
    if (routeMapping[currentPath]) {
      const newActiveItem = routeMapping[currentPath];
      setActiveItem(newActiveItem);

      // Open parent dropdown if this is a submenu item
      if (parentMapping[newActiveItem]) {
        setOpenDropdown(parentMapping[newActiveItem]);
      } else {
        setOpenDropdown(null);
      }
      return;
    }

    // Check for dynamic routes (e.g., /Courses/:id, /Programs/:id/Edit)
    if (currentPath.startsWith("/Courses/progress")) {
      setActiveItem("course-progress");
      setOpenDropdown("courses");
      return;
    }

    if (currentPath.startsWith("/Courses/") && currentPath !== "/Courses") {
      setActiveItem("all-courses");
      setOpenDropdown("courses");
      return;
    }

    // CertificateDesigner dynamic routes (e.g., /CertificateDesigner/:templateId)
    if (currentPath.startsWith("/CertificateDesigner/")) {
      setActiveItem("certificate-designer");
      setOpenDropdown("courses");
      return;
    }

    // Tools sub-routes (e.g., /Tools/QRCode and future tools)
    if (currentPath.startsWith("/Tools/")) {
      setActiveItem("qrcode-builder");
      setOpenDropdown("tools");
      return;
    }

    if (
      currentPath.startsWith("/Programs/") &&
      currentPath !== "/Programs/Add"
    ) {
      setActiveItem("all-programs");
      setOpenDropdown("programs");
      return;
    }

    // HomePageManagement sub-routes (dynamic)
    if (currentPath.startsWith("/HomePageManagement")) {
      setActiveItem("homepage-overview");
      setOpenDropdown("homepage");
      return;
    }

    // UserOptions sub-routes (dynamic)
    if (currentPath.startsWith("/UserOptions")) {
      if (currentPath.includes("/Insights")) {
        setActiveItem("user-options-insights");
        setOpenDropdown("user-options");
      } else {
        setActiveItem("user-options");
        setOpenDropdown(null);
      }
      return;
    }

    // RegisterOptions insights sub-routes (dynamic) - legacy redirect
    if (currentPath.startsWith("/RegisterOptions")) {
      setActiveItem("user-options-insights");
      setOpenDropdown("user-options");
      return;
    }

    // Applications sub-routes (dynamic)
    if (currentPath.startsWith("/Applications")) {
      setActiveItem("program-applications");
      setOpenDropdown("applications");
      return;
    }

    // Check for Contact routes
    if (currentPath.startsWith("/Contact")) {
      setActiveItem("contact");
      setOpenDropdown(null);
      return;
    }

    if (currentPath.startsWith("/Admins")) {
      setActiveItem("admins");
      setOpenDropdown(null);
      return;
    }

    if (currentPath.startsWith("/DatabaseBackup")) {
      setActiveItem("database-backup");
      setOpenDropdown(null);
      return;
    }

    // Check for Emails routes
    if (currentPath.startsWith("/Emails")) {
      const emailRouteMap = {
        "/Emails/Welcome": "emails-welcome",
        "/Emails/LoginAttempts": "emails-login-attempts",
        "/Emails/PaymentApproved": "emails-payment-approved",
        "/Emails/PaymentRejected": "emails-payment-rejected",
        "/Emails/Marketing": "emails-marketing",
      };
      const matched = emailRouteMap[currentPath] || "emails-welcome";
      setActiveItem(matched);
      setOpenDropdown("emails");
      return;
    }

    // Check for other patterns
    if (currentPath.startsWith("/statistics")) {
      // Find the most specific matching sub-route
      const statsRouteMap = {
        "/statistics/visits": "statistics-visits",
        "/statistics/content": "statistics-content",
        "/statistics/users": "statistics-users",
        "/statistics/payments": "statistics-payments",
        "/statistics/favorites": "statistics-favorites",
        "/statistics/searches": "statistics-searches",
        "/statistics/registrations": "statistics-registrations",
        "/statistics/logins": "statistics-logins",
      };
      const matched = statsRouteMap[currentPath];
      setActiveItem(matched || "statistics-overview");
      setOpenDropdown("statistics");
      return;
    }

    // Default fallback
    setActiveItem("statistics-overview");
    setOpenDropdown(null);
  }, [
    location.pathname,
    routeMapping,
    parentMapping,
    getTitleMapping,
    getTitle,
    getBaseTitle,
  ]);

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
  };

  const toggleDropdown = (itemId) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const isParentActive = (parentId) => {
    const childItems = Object.keys(parentMapping).filter(
      (child) => parentMapping[child] === parentId,
    );
    return childItems.includes(activeItem);
  };

  const value = {
    activeItem,
    setActiveItem: handleItemClick,
    openDropdown,
    toggleDropdown,
    isParentActive,
    pageTitle,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

NavigationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
