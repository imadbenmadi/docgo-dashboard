import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { Navbar } from "../components/Navbar";

const DashboardLayout = () => {
    const [activeItem, setActiveItem] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen w-full bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-200  opacity-40 bg-opacity-75 z-40 md:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
        fixed md:relative 
        top-0 left-0 z-50 
        w-64 h-full 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        bg-white shadow-lg
      `}
            >
                <Sidebar
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                    closeSidebar={() => setIsSidebarOpen(false)}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full  flex flex-col ">
                {/* Navbar */}
                <div className="bg-white shadow-sm border-b border-gray-200 z-30">
                    <Navbar
                        toggleSidebar={toggleSidebar}
                        isSidebarOpen={isSidebarOpen}
                    />
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-scroll h-screen    p-4 md:p-6 lg:p-8">
                    <div className="mx-auto ">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
