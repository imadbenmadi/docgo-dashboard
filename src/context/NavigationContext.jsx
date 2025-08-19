import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const NavigationContext = createContext();

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error(
            "useNavigation must be used within a NavigationProvider"
        );
    }
    return context;
};

export const NavigationProvider = ({ children }) => {
    const [activeItem, setActiveItem] = useState("statistics");
    const [openDropdown, setOpenDropdown] = useState(null);
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
        }),
        []
    );

    // Parent menu items for dropdown management - memoized to prevent useEffect warnings
    const parentMapping = useMemo(
        () => ({
            "all-courses": "courses",
            "add-course": "courses",
            "all-programs": "programs",
            "add-program": "programs",
            "study-abroad-courses": "users",
            "all-payments": "users",
            "all-specialties": "specialties",
            "add-country-specialty": "specialties",
        }),
        []
    );

    // Update active item based on current route
    useEffect(() => {
        const currentPath = location.pathname;

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

        // Check for other patterns
        if (currentPath.startsWith("/statistics")) {
            setActiveItem("statistics");
            setOpenDropdown(null);
            return;
        }

        // Default fallback
        setActiveItem("statistics");
        setOpenDropdown(null);
    }, [location.pathname, routeMapping, parentMapping]);

    const handleItemClick = (itemId) => {
        setActiveItem(itemId);
    };

    const toggleDropdown = (itemId) => {
        setOpenDropdown(openDropdown === itemId ? null : itemId);
    };

    const isParentActive = (parentId) => {
        const childItems = Object.keys(parentMapping).filter(
            (child) => parentMapping[child] === parentId
        );
        return childItems.includes(activeItem);
    };

    const value = {
        activeItem,
        setActiveItem: handleItemClick,
        openDropdown,
        toggleDropdown,
        isParentActive,
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
