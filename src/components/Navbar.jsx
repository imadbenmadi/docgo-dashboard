"use client";
import * as React from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png"; // Adjust the path as necessary

export const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 lg:px-8 w-full bg-white min-h-[69px] border-b border-gray-200">
      {/* Left side - Mobile menu button + Logo */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger menu */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
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

      {/* Right side - Notifications and Profile */}
      <div className="flex gap-3 md:gap-6 items-center">
        {/* Notification Icon */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/47772183695e79f75a24ea680465ac3728722683?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
            className="object-contain w-6 h-6 md:w-8 md:h-8"
            alt="Notification"
          />
        </button>

        {/* Profile Section */}
        <div className="flex gap-2 md:gap-4 items-center">
          {/* User Name - Hidden on small screens */}
          <span className="hidden sm:block text-sm text-zinc-800 font-medium">
            Huda Dadoune
          </span>

          {/* Profile Avatar */}
          <div className="flex items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/6f93e652498918034ac8fdfe653b49f7ed89eaf7?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
              className="object-contain rounded-full w-8 h-8 md:w-[45px] md:h-[45px] border-2 border-gray-200"
              alt="Profile"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
