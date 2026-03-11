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
  const [pageTitle, setPageTitle] = useState("DocGo");
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
      "/Certificates": "certificates",
      "/CertificateDesigner": "certificate-designer",
      // Programs
      "/Programs": "all-programs",
      "/Programs/Add": "add-program",
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
      "/Moderation": "moderation",
      "/ErrorLogs": "error-logs",
      // User requests
      "/ForgotPasswordRequests": "forgot-password-requests",
      "/DeleteAccountRequests": "delete-account-requests",
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
      "/": "DocGo - Statistiques",
      "/Statistics": "DocGo - Analytics & Statistics",
      // Statistics sub-routes
      "/statistics": "DocGo - Vue d'ensemble",
      "/statistics/visits": "DocGo - Trafic & Visites",
      "/statistics/content": "DocGo - Vues du contenu",
      "/statistics/users": "DocGo - Croissance utilisateurs",
      "/statistics/payments": "DocGo - Revenus",
      "/statistics/favorites": "DocGo - Favoris",
      "/statistics/searches": "DocGo - Recherches",
      "/statistics/registrations": "DocGo - Analyse de la demande",
      "/statistics/logins": "DocGo - Connexions utilisateurs",
      "/Security": "DocGo - Security Management",
      "/ContactInfo": "DocGo - Contact Information",
      "/HomePageManagement": "DocGo - Homepage Overview",
      "/HomePageManagement/Content": "DocGo - Content Editor",
      "/HomePageManagement/Featured": "DocGo - Featured Items",
      "/HomePageManagement/FilterOptions": "DocGo - Filter Options",
      "/RegisterOptions": "DocGo - Register Form Options",
      "/RegisterOptions/Insights": "DocGo - Register Insights",
      "/Courses": "DocGo - Courses Management",
      "/Courses/Add": "DocGo - Create New Course",
      "/Certificates": "DocGo - Certificates",
      "/CertificateDesigner": "DocGo - Certificate Designer",
      "/Programs": "DocGo - Programs Management",
      "/Programs/Add": "DocGo - Create New Program",
      "/Applications/Programs": "DocGo - Program Applications",
      "/Applications/Courses": "DocGo - Course Applications",
      "/Enrollments": "DocGo - Active Enrollments",
      "/Enrollments/Removed": "DocGo - Removed Enrollments",
      "/AllPayments": "DocGo - Payment Management",
      "/PaymentInfo": "DocGo - Payment Configuration",
      "/FAQ": "DocGo - FAQ Management",
      "/Ratings": "DocGo - Les avis",
      "/Contact": "DocGo - Contact Messages",
      "/Contact/statistics": "DocGo - Contact Statistics",
      "/Users": "DocGo - Users Management",
      "/Moderation": "DocGo - Media Moderation",
      "/ErrorLogs": "DocGo - Server Logs",
      "/ForgotPasswordRequests": "DocGo - Forgot Password Requests",
      "/DeleteAccountRequests": "DocGo - Delete Account Requests",
      "/Tools/QRCode": "DocGo - QR Code Builder",
      "/PaymentManagement": "DocGo - Payment Management",
      "/AllSpecialties": "DocGo - Specialties",
      "/AddCountrySpecialty": "DocGo - Configure Countries & Specialties",
      "/DatabaseManagement": "DocGo - Database Management",
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
      certificates: "courses",
      "certificate-designer": "courses",
      // Programs submenu
      "all-programs": "programs",
      "add-program": "programs",
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
        const title = "DocGo - Edit Course";
        setPageTitle(title);
        document.title = title;
      } else if (currentPath.includes("/Videos")) {
        const title = "DocGo - Manage Videos";
        setPageTitle(title);
        document.title = title;
      } else if (currentPath.includes("/sections")) {
        const title = "DocGo - Manage Sections";
        setPageTitle(title);
        document.title = title;
      } else {
        const title = "DocGo - Course Details";
        setPageTitle(title);
        document.title = title;
      }
    } else if (
      currentPath.startsWith("/Programs/") &&
      currentPath !== "/Programs/Add"
    ) {
      const title = currentPath.includes("/Edit")
        ? "DocGo - Edit Program"
        : "DocGo - Program Details";
      setPageTitle(title);
      document.title = title;
    } else {
      setPageTitle("DocGo");
      document.title = "DocGo";
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
