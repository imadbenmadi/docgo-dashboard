import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { useLocation } from "react-router-dom";

const DashboardLayout = () => {
    const location = useLocation();
    const [activeItem, setActiveItem] = useState("statistics");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Update active item based on current route
    useEffect(() => {
        const path = location.pathname;

        if (
            path === "/" ||
            path === "/Statistics" ||
            path.startsWith("/statistics")
        ) {
            setActiveItem("statistics");
        } else if (path === "/Security") {
            setActiveItem("security");
        } else if (path === "/Courses") {
            setActiveItem("all-courses");
        } else if (path === "/AddCourse") {
            setActiveItem("add-course");
        } else if (path.startsWith("/Courses/") && path.includes("/Edit")) {
            setActiveItem("all-courses");
        } else if (path.startsWith("/Courses/")) {
            setActiveItem("all-courses");
        } else if (path === "/AllPayments") {
            setActiveItem("all-payments");
        } else if (path === "/AllSpecialties") {
            setActiveItem("all-specialties");
        } else if (path === "/AddCountrySpecialty") {
            setActiveItem("add-country-specialty");
        }
    }, [location.pathname]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex h-screen w-full bg-gray-100">
            {/* Mobile Sidebar Overlay - Only visible on mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar - Always visible on desktop, toggleable on mobile */}
            <div
                className={`
                    fixed md:relative 
                    top-0 left-0 z-50 
                    h-full 
                    transform transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                    ${isSidebarCollapsed ? "md:w-16" : "md:w-64"}
                    w-64
                    bg-white shadow-lg
                `}
            >
                <Sidebar
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                    closeSidebar={() => setIsSidebarOpen(false)}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={toggleSidebarCollapse}
                />
            </div>

            {/* Main Content Area */}
            <div
                className={`flex-1 w-full flex flex-col transition-all duration-300 ${
                    isSidebarCollapsed ? "md:ml-0" : ""
                }`}
            >
                {/* Navbar - Only visible on mobile */}
                <div className="md:hidden bg-white shadow-sm border-b border-gray-200 z-30">
                    <Navbar
                        toggleSidebar={toggleSidebar}
                        isSidebarOpen={isSidebarOpen}
                    />
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
