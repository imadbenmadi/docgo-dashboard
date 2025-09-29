"use client";
import { useState, useEffect } from "react";
import { Menu, X, ChevronUp } from "lucide-react";
import logo from "../assets/logo.png"; // Adjust the path as necessary

export const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Check if we're at the top
            setIsAtTop(currentScrollY < 10);

            // Show/hide navbar based on scroll direction
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                // Scrolling up or near top - show navbar
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down and not near top - hide navbar
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        // Add scroll event listener
        window.addEventListener("scroll", handleScroll, { passive: true });

        // Cleanup
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 lg:px-8 w-full bg-white min-h-[69px] border-b border-gray-200 transition-transform duration-300 ${
                    isVisible ? "translate-y-0" : "-translate-y-full"
                } ${!isAtTop ? "shadow-lg" : ""}`}
            >
                {/* Left side - Mobile menu button + Logo */}
                <div className="flex items-center gap-4">
                    {/* Mobile hamburger menu - Only visible on mobile */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors md:hidden"
                        aria-label="Toggle menu"
                    >
                        {isSidebarOpen ? (
                            <X className="h-6 w-6 text-gray-600" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-600" />
                        )}
                    </button>

                    {/* Logo */}
                    <img
                        src={logo}
                        className="object-contain shrink-0 aspect-square shadow-[0px_4px_4px_rgba(123, 123, 123, 0.25)] w-[51px] h-[51px]"
                        alt="Logo"
                    />
                </div>

                {/* Right side - Actions */}
                <div className="flex gap-3 md:gap-6 items-center">
                    {/* Scroll to top button - Only show when not at top */}
                    {!isAtTop && (
                        <button
                            onClick={scrollToTop}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 md:hidden"
                            aria-label="Scroll to top"
                            title="Scroll to top"
                        >
                            <ChevronUp className="h-5 w-5" />
                        </button>
                    )}

                    {/* Hide navbar button - Only show on mobile when scrolled */}
                    {!isAtTop && (
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 md:hidden"
                            aria-label="Hide navbar"
                            title="Hide navbar"
                        >
                            <ChevronUp className="h-5 w-5 rotate-180" />
                        </button>
                    )}

                    {/* Notification Icon */}
                    {/* <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <img
                            src="https://cdn.builder.io/api/v1/Image/assets/TEMP/47772183695e79f75a24ea680465ac3728722683?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
                            className="object-contain w-6 h-6 md:w-8 md:h-8"
                            alt="Notification"
                        />
                    </button> */}

                    {/* Profile Section */}
                    {/* <div className="flex gap-2 md:gap-4 items-center">
                      <span className="hidden sm:block text-sm text-zinc-800 font-medium">
                        Huda Dadoune
                      </span>

                      <div className="flex items-center">
                        <img
                          src="https://cdn.builder.io/api/v1/Image/assets/TEMP/6f93e652498918034ac8fdfe653b49f7ed89eaf7?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
                          className="object-contain rounded-full w-8 h-8 md:w-[45px] md:h-[45px] border-2 border-gray-200"
                          alt="Profile"
                        />
                      </div>
                    </div> */}
                </div>
            </header>

            {/* Spacer to prevent content from going under fixed navbar */}
            <div className="h-[69px] md:hidden"></div>

            {/* Floating show navbar button - Only show when navbar is hidden and not at top */}
            {!isVisible && !isAtTop && (
                <button
                    onClick={() => setIsVisible(true)}
                    className="fixed top-4 right-4 z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 md:hidden"
                    aria-label="Show navbar"
                    title="Show navbar"
                >
                    <ChevronUp className="h-5 w-5" />
                </button>
            )}
        </>
    );
};
