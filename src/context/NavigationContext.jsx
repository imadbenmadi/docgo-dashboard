import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

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
  const [pageTitle, setPageTitle] = useState("healthpathglobal");
  const location = useLocation();

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
      "/HomePageManagement/FilterOptions": "homepage-filter",
      // Register options
      "/RegisterOptions": "register-options-manage",
      "/RegisterOptions/Insights": "register-options-insights",
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

  // Route to page title mapping - memoized
  const titleMapping = useMemo(
    () => ({
      "/": "healthpathglobal - Statistiques",
      "/Statistics": "healthpathglobal - Analytics & Statistics",
      // Statistics sub-routes
      "/statistics": "healthpathglobal - Vue d'ensemble",
      "/statistics/visits": "healthpathglobal - Trafic & Visites",
      "/statistics/content": "healthpathglobal - Vues du contenu",
      "/statistics/users": "healthpathglobal - Croissance utilisateurs",
      "/statistics/payments": "healthpathglobal - Revenus",
      "/statistics/favorites": "healthpathglobal - Favoris",
      "/statistics/searches": "healthpathglobal - Recherches",
      "/statistics/registrations": "healthpathglobal - Analyse de la demande",
      "/statistics/logins": "healthpathglobal - Connexions utilisateurs",
      "/Security": "healthpathglobal - Security Management",
      "/ContactInfo": "healthpathglobal - Contact Information",
      "/HomePageManagement": "healthpathglobal - Homepage Overview",
      "/HomePageManagement/Content": "healthpathglobal - Content Editor",
      "/HomePageManagement/Featured": "healthpathglobal - Featured Items",
      "/HomePageManagement/FilterOptions": "healthpathglobal - Filter Options",
      "/RegisterOptions": "healthpathglobal - Register Form Options",
      "/RegisterOptions/Insights": "healthpathglobal - Register Insights",
      "/Courses": "healthpathglobal - Courses Management",
      "/Courses/Add": "healthpathglobal - Create New Course",
      "/Courses/Deleted": "healthpathglobal - Deleted Courses",
      "/Courses/progress": "healthpathglobal - Course Progress",
      "/Certificates": "healthpathglobal - Certificates",
      "/CertificateDesigner": "healthpathglobal - Certificate Designer",
      "/Programs": "healthpathglobal - Programs Management",
      "/Programs/Add": "healthpathglobal - Create New Program",
      "/Programs/Deleted": "healthpathglobal - Deleted Programs",
      "/Applications/Programs": "healthpathglobal - Program Applications",
      "/Applications/Courses": "healthpathglobal - Course Applications",
      "/Enrollments": "healthpathglobal - Active Enrollments",
      "/Enrollments/Removed": "healthpathglobal - Removed Enrollments",
      "/AllPayments": "healthpathglobal - Payment Management",
      "/PaymentInfo": "healthpathglobal - Payment Configuration",
      "/FAQ": "healthpathglobal - FAQ Management",
      "/Ratings": "healthpathglobal - Les avis",
      "/Contact": "healthpathglobal - Contact Messages",
      "/Contact/statistics": "healthpathglobal - Contact Statistics",
      "/Users": "healthpathglobal - Users Management",
      "/Admins": "healthpathglobal - Admins Management",
      "/Moderation": "healthpathglobal - Media Moderation",
      "/ErrorLogs": "healthpathglobal - Server Logs",
      "/DatabaseBackup": "healthpathglobal - Database Backup",
      "/ForgotPasswordRequests": "healthpathglobal - Forgot Password Requests",
      "/DeleteAccountRequests": "healthpathglobal - Delete Account Requests",
      "/Coupons": "healthpathglobal - Coupons",
      "/Emails": "healthpathglobal - Emails",
      "/Emails/Welcome": "healthpathglobal - Welcome Email Template",
      "/Emails/LoginAttempts":
        "healthpathglobal - Login Attempts Email Template",
      "/Emails/PaymentApproved":
        "healthpathglobal - Payment Approved Email Template",
      "/Emails/PaymentRejected":
        "healthpathglobal - Payment Rejected Email Template",
      "/Emails/Marketing": "healthpathglobal - Marketing Emails",
      "/Tools/QRCode": "healthpathglobal - QR Code Builder",
      "/PaymentManagement": "healthpathglobal - Payment Management",
      "/AllSpecialties": "healthpathglobal - Specialties",
      "/AddCountrySpecialty":
        "healthpathglobal - Configure Countries & Specialties",
      "/DatabaseManagement": "healthpathglobal - Database Management",
    }),
    [],
  );

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
      // Register options submenu
      "register-options-manage": "register-options",
      "register-options-insights": "register-options",
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

    // Update page title - handle dynamic routes
    if (titleMapping[currentPath]) {
      setPageTitle(titleMapping[currentPath]);
      document.title = titleMapping[currentPath];
    } else if (
      currentPath.startsWith("/Courses/") &&
      currentPath !== "/Courses"
    ) {
      if (currentPath.includes("/Edit")) {
        const title = "healthpathglobal - Edit Course";
        setPageTitle(title);
        document.title = title;
      } else if (currentPath.includes("/sections")) {
        const title = "healthpathglobal - Manage Sections";
        setPageTitle(title);
        document.title = title;
      } else {
        const title = "healthpathglobal - Course Details";
        setPageTitle(title);
        document.title = title;
      }
    } else if (
      currentPath.startsWith("/Programs/") &&
      currentPath !== "/Programs/Add"
    ) {
      const title = currentPath.includes("/Edit")
        ? "healthpathglobal - Edit Program"
        : "healthpathglobal - Program Details";
      setPageTitle(title);
      document.title = title;
    } else {
      setPageTitle("healthpathglobal");
      document.title = "healthpathglobal";
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

    // RegisterOptions sub-routes (dynamic)
    if (currentPath.startsWith("/RegisterOptions")) {
      setActiveItem("register-options-manage");
      setOpenDropdown("register-options");
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
  }, [location.pathname, routeMapping, parentMapping, titleMapping]);

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
