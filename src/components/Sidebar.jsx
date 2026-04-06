import {
  Archive,
  Award,
  BarChart2,
  BarChart3,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Home,
  KeyRound,
  LogOut,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  Settings,
  Shield,
  Trash2,
  Users,
  ClipboardList,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  Filter,
  Pencil,
  Globe,
  TrendingUp,
  FileWarning,
  Eye,
  CreditCard,
  Heart,
  Search,
  FileText,
  Database,
  LayoutDashboard,
  Megaphone,
  Wrench,
  QrCode,
  Tag,
  Mail,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { useAppContext } from "../AppContext";
import { useNavigation } from "../context/NavigationContext";
import { useBranding } from "../context/BrandingContext";
import { getMenuItems } from "../constants/menuItems";

const Sidebar = ({ closeSidebar, isCollapsed, onToggleCollapse }) => {
  const uploadsCheckEnabled =
    String(import.meta.env.VITE_CHECK_UPLOADS || "").toLowerCase() === "true";
  const navigate = useNavigate();
  const { store_logout } = useAppContext();
  const { activeItem, isParentActive } = useNavigation();
  const { branding, logoSrc } = useBranding();

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Déconnexion",
      text: "Êtes-vous sûr de vouloir vous déconnecter?",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await store_logout();
        navigate("/Login", { replace: true });

        Swal.fire({
          icon: "success",
          title: "Déconnecté",
          text: "Vous avez été déconnecté avec succès",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la déconnexion",
        });
      }
    }
  };

  const handleRouteNavigation = () => {
    if (closeSidebar) closeSidebar();
  };

  const itemBaseClass =
    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm";

  const itemActiveClass = "bg-blue-50 text-blue-600 border-l-4 border-blue-600";

  const itemIdleClass = "text-zinc-800 hover:bg-gray-50";

  const menuItems = getMenuItems(uploadsCheckEnabled);

  return (
    <nav
      className={`w-full bg-white h-screen flex flex-col shadow-lg select-none transition-all duration-300 ${
        isCollapsed ? "items-center" : ""
      }`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center border-b bg-gradient-to-r from-blue-600 to-blue-700 ${
          isCollapsed ? "justify-center p-3" : "justify-between px-4 py-3"
        }`}
      >
        {/* Logo + Brand Name */}
        <div
          className={`flex items-center gap-3 min-w-0 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <img
            src={logoSrc}
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover border-2 border-white/40 shadow-sm shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">
                {branding.brandName || "Admin"}
              </p>
              <p className="text-blue-200 text-xs">Tableau de bord</p>
            </div>
          )}
        </div>

        {/* Mobile close / Desktop collapse */}
        <div className="flex items-center shrink-0">
          <button
            onClick={closeSidebar}
            className="p-1.5 hover:bg-white/20 rounded-md md:hidden text-white"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 hover:bg-white/20 rounded-md text-white"
            title={isCollapsed ? "Développer" : "Réduire"}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto pt-4 pb-4">
        <div className={`${isCollapsed ? "px-2" : "px-4 md:px-6"} space-y-1`}>
          {menuItems.map((item, index) => {
            // Determine if this item (or its children) is active
            const isActive = activeItem === item.id || isParentActive(item.id);

            // For items with submenu, navigate to first child or the item link
            const navigationLink = item.hasSubmenu
              ? item.subItems?.[0]?.link || item.link || "#"
              : item.link;

            return (
              <div key={item.id}>
                {item.above_break && index > 0 && (
                  <hr className="my-3 border-gray-200" />
                )}

                <NavLink
                  to={navigationLink}
                  onClick={handleRouteNavigation}
                  className={({ isActive: routeIsActive }) =>
                    `${itemBaseClass} ${
                      routeIsActive || isActive
                        ? itemActiveClass
                        : itemIdleClass
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                  title={isCollapsed ? item.label : ""}
                  end={!item.hasSubmenu}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.hasSubmenu && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          className={`flex items-center gap-3 text-red-500 hover:bg-red-50 p-3 rounded-lg w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
          onClick={handleLogout}
          title={isCollapsed ? "Se déconnecter" : ""}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="text-sm font-semibold">Se déconnecter</span>
          )}
        </button>
      </div>
    </nav>
  );
};

Sidebar.propTypes = {
  closeSidebar: PropTypes.func,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

export default Sidebar;
