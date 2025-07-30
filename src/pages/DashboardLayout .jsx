import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { NavigationProvider } from "../context/NavigationContext";

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.mobile-menu-button')) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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
        <NavigationProvider>
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
        </NavigationProvider>
    );
};

export default DashboardLayout;
