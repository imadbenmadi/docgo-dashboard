import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const NavigationContext = createContext();

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error(
            "useNavigation must be used within a NavigationProvider",
        );
    }
    return context;
};

export const NavigationProvider = ({ children }) => {
    const [activeItem, setActiveItem] = useState("statistics");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [pageTitle, setPageTitle] = useState("DocGo");
    const location = useLocation();

    // Route to menu item mapping - memoized to prevent useEffect warnings
    const routeMapping = useMemo(
        () => ({
            "/": "statistics",
            "/Statistics": "statistics",
            "/Security": "security",
            "/ContactInfo": "contact-info",
            "/Courses": "all-courses",
            "/Courses/Add": "add-course",
            "/AllPayments": "all-payments",
            "/AllSpecialties": "all-specialties",
            "/AddCountrySpecialty": "add-country-specialty",
            "/Programs": "all-programs",
            "/Programs/Add": "add-program",
            "/FAQ": "faq",
            "/Contact": "contact",
            "/Contact/statistics": "contact",
            "/DatabaseManagement": "database-management",
            "/PaymentInfo": "payment-config",
            "/Users": "users",
        }),
        [],
    );

    // Route to page title mapping - memoized
    const titleMapping = useMemo(
        () => ({
            "/": "DocGo - Dashboard",
            "/Statistics": "DocGo - Analytics & Statistics",
            "/Security": "DocGo - Security Management",
            "/ContactInfo": "DocGo - Contact Information",
            "/Courses": "DocGo - Courses Management",
            "/Courses/Add": "DocGo - Create New Course",
            "/AllPayments": "DocGo - Payment Management",
            "/AllSpecialties": "DocGo - Specialties",
            "/AddCountrySpecialty": "DocGo - Configure Countries & Specialties",
            "/Programs": "DocGo - Programs Management",
            "/Programs/Add": "DocGo - Create New Program",
            "/FAQ": "DocGo - FAQ Management",
            "/Contact": "DocGo - Contact Messages",
            "/Contact/statistics": "DocGo - Contact Statistics",
            "/DatabaseManagement": "DocGo - Database Management",
            "/PaymentInfo": "DocGo - Payment Configuration",
            "/Users": "DocGo - Users Management",
        }),
        [],
    );

    // Parent menu items for dropdown management - memoized to prevent useEffect warnings
    const parentMapping = useMemo(
        () => ({
            "all-courses": "courses",
            "add-course": "courses",
            "all-programs": "programs",
            "add-program": "programs",
            "all-payments": "paiements",
            "payment-config": "paiements",
            "all-specialties": "specialties",
            "add-country-specialty": "specialties",
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

        if (
            currentPath.startsWith("/Programs/") &&
            currentPath !== "/Programs/Add"
        ) {
            if (currentPath.includes("/Edit")) {
                setActiveItem("all-programs");
            } else {
                setActiveItem("all-programs");
            }
            setOpenDropdown("programs");
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
            setActiveItem("statistics");
            setOpenDropdown(null);
            return;
        }

        // Default fallback
        setActiveItem("statistics");
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
