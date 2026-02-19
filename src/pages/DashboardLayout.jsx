import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { NavigationProvider } from "../context/NavigationContext";
import { BrandingProvider } from "../context/BrandingContext";
import PageHeader from "../components/PageHeader";

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isSidebarOpen &&
                !event.target.closest(".sidebar") &&
                !event.target.closest(".mobile-menu-button")
            ) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSidebarOpen]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <BrandingProvider>
            <NavigationProvider>
                <div className="flex h-screen bg-gray-50 overflow-hidden">
                    {/* Mobile backdrop */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            onClick={closeSidebar}
                        />
                    )}

                    {/* Sidebar */}
                    <div
                        className={`sidebar fixed md:relative z-50 h-full transition-all duration-300 ${
                            isSidebarOpen
                                ? "translate-x-0"
                                : "-translate-x-full"
                        } md:translate-x-0 ${
                            isSidebarCollapsed ? "md:w-16" : "md:w-64"
                        } w-64`}
                    >
                        <Sidebar
                            closeSidebar={closeSidebar}
                            isCollapsed={isSidebarCollapsed}
                            onToggleCollapse={toggleSidebarCollapse}
                        />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Navbar - Only shown on mobile */}
                        <div className="md:hidden">
                            <Navbar
                                toggleSidebar={toggleSidebar}
                                isSidebarOpen={isSidebarOpen}
                            />
                        </div>

                        {/* Page content */}
                        <main
                            className={`flex-1 overflow-y-auto p-4 md:p-6 ${
                                isSidebarCollapsed ? "md:ml-0" : "md:ml-0"
                            } transition-all duration-300`}
                        >
                            <div className="max-w-7xl mx-auto">
                                <PageHeader />
                                <Outlet />
                            </div>
                        </main>
                    </div>
                </div>
            </NavigationProvider>
        </BrandingProvider>
    );
};

export default DashboardLayout;
