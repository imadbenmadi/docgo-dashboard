import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Users,
  Plus,
  BookOpen,
  Settings,
  Globe,
  FileText,
  LogOut,
} from "lucide-react";
import { ChevronDown, X } from "lucide-react";

const Sidebar = ({ activeItem, setActiveItem, closeSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const showAlert = (type, title, text) => {
    Swal.fire({
      icon: type,
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
    });
  };

  const handleItemClick = (itemId, link) => {
    setActiveItem(itemId);
    if (closeSidebar) closeSidebar();
    if (link) navigate(link);
  };

  const toggleDropdown = (itemId) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const menuItems = [
    {
      id: "users",
      label: "Tous les utilisateurs and payments",
      icon: Users,
      hasSubmenu: true,
      subItems: [
        {
          id: "study-abroad-courses",
          label: "Cours et les applications à l'étranger",
          icon: Globe,
          link: "/",
        },
        {
          id: "all-payments",
          label: "Tous les paiements",
          icon: FileText,
          link: "/AllPayments",
        },
      ],
    },
    {
      id: "courses",
      label: "Ajouter un nouveau cours",
      icon: Plus,
      link: "/AddCourse",
      hasSubmenu: true,
      subItems: [
        {
          id: "add-course",
          label: "Ajouter un cours",
          icon: Plus,
          link: "/AddCourse",
        },
        {
          id: "all-courses",
          label: "Voir tous les cours",
          icon: BookOpen,
          link: "/AllCourses",
        },
        {
          id: "add-quiz",
          label: "Ajouter un quiz",
          icon: Plus,
          link: "/AddQuiz",
        },
        {
          id: "add-pdf",
          label: "Ajouter un PDF",
          icon: Plus,
          link: "/AddPDF",
        },
      ],
    },

    {
      id: "specialties",
      label: "Ajouter des spécialités / pays",
      icon: Settings,
      hasSubmenu: true,
      subItems: [
        {
          id: "add-specialty",
          label: "Ajouter une spécialité",
          icon: Settings,
          link: "/AddSpecialty",
        },
        {
          id: "add-country",
          label: "Ajouter un pays",
          icon: Globe,
          link: "/AddCountry",
        },
      ],
    },
  ];

  return (
    <nav className="w-full bg-white h-screen flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b md:hidden">
        <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
        <button
          onClick={closeSidebar}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto pt-4 pb-4">
        <div className="px-4 md:px-6 space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              <div
                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                  activeItem === item.id
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-zinc-800 hover:bg-gray-50"
                }`}
                onClick={() =>
                  item.hasSubmenu
                    ? toggleDropdown(item.id)
                    : handleItemClick(item.id, item.link)
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-sm">{item.label}</span>
                {item.hasSubmenu && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === item.id ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {item.hasSubmenu && openDropdown === item.id && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <div
                      key={subItem.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                        activeItem === subItem.id
                          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                          : "text-zinc-800 hover:bg-gray-50"
                      }`}
                      onClick={() => handleItemClick(subItem.id, subItem.link)}
                    >
                      <subItem.icon className="w-5 h-5" />
                      <span className="flex-1 text-sm">{subItem.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          className="flex items-center gap-3 text-red-500 hover:bg-red-50 p-3 rounded-lg w-full"
          onClick={() =>
            showAlert(
              "warning",
              "Déconnexion",
              "Êtes-vous sûr de vouloir vous déconnecter?"
            )
          }
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Se déconnecter</span>
        </button>
      </div>
    </nav>
  );
};
export default Sidebar;
