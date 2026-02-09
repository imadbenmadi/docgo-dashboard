import {
    BarChart3,
    BookOpen,
    Database,
    GraduationCap,
    HelpCircle,
    LogOut,
    MessageCircle,
    Phone,
    Plus,
    Receipt,
    Settings,
    Shield,
    Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAppContext } from "../AppContext";
import { useNavigation } from "../context/NavigationContext";

import { ChevronDown, ChevronLeft, X } from "lucide-react";

const Sidebar = ({ closeSidebar, isCollapsed, onToggleCollapse }) => {
    const uploadsCheckEnabled =
        String(import.meta.env.VITE_CHECK_UPLOADS || "").toLowerCase() ===
        "true";
    const navigate = useNavigate();
    const { store_logout } = useAppContext();
    const {
        activeItem,
        setActiveItem,
        openDropdown,
        toggleDropdown,
        isParentActive,
    } = useNavigation();

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
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Une erreur s'est produite lors de la déconnexion",
                });
            }
        }
    };

    const handleItemClick = (itemId, link) => {
        setActiveItem(itemId);
        if (closeSidebar) closeSidebar();
        if (link) navigate(link);
    };

    const menuItems = [
        {
            id: "statistics",
            label: "Statistiques",
            icon: BarChart3,
            link: "/Statistics",
        },
        // {
        //   id: "security",
        //   label: "Sécurité",
        //   icon: Shield,
        //   link: "/Security",
        // },
        {
            id: "contact-info",
            label: "Informations de contact",
            icon: Phone,
            link: "/ContactInfo",
        },

        {
            id: "courses",
            label: "Les cours",
            icon: BookOpen,
            hasSubmenu: true,
            subItems: [
                {
                    id: "all-courses",
                    label: "Voir tous les cours",
                    icon: BookOpen,
                    link: "/Courses",
                },
                {
                    id: "add-course",
                    label: "Ajouter un cours",
                    icon: Plus,
                    link: "/Courses/Add",
                },
            ],
        },
        {
            id: "programs",
            label: "Les programmes",
            icon: GraduationCap,
            hasSubmenu: true,
            subItems: [
                {
                    id: "all-programs",
                    label: "Voir tous les programmes",
                    icon: GraduationCap,
                    link: "/Programs",
                },
                {
                    id: "add-program",
                    label: "Ajouter un programme",
                    icon: Plus,
                    link: "/Programs/Add",
                },
            ],
        },
        {
            id: "faq",
            label: "FAQ",
            icon: HelpCircle,
            link: "/FAQ",
        },
        {
            id: "contact",
            label: "Messages de contact",
            icon: MessageCircle,
            link: "/Contact",
        },
        {
            id: "paiements",
            label: "paiements",
            icon: Receipt,
            hasSubmenu: true,
            subItems: [
                {
                    id: "all-payments",
                    label: "les paiements",
                    icon: Receipt,
                    link: "/AllPayments",
                },
                {
                    id: "payment-config",
                    label: "Configuration des paiements",
                    icon: Settings,
                    link: "/PaymentInfo",
                },
            ],
        },
        // {
        //   id: "database",
        //   label: "Gestion Base de Données",
        //   icon: Database,
        //   link: "/DatabaseManagement",
        // },
        {
            id: "users",
            label: "Gestion des Utilisateurs",
            icon: Users,
            link: "/Users",
        },

        ...(uploadsCheckEnabled
            ? [
                  {
                      id: "moderation",
                      label: "Modération média",
                      icon: Shield,
                      link: "/Moderation",
                  },
              ]
            : []),

        // {
        //     id: "specialties",
        //     label: "paramètres du plateforme",
        //     icon: Settings,
        //     hasSubmenu: true,
        //     subItems: [
        //         {
        //             id: "all-specialties",
        //             label: "Voir toutes les spécialités",
        //             icon: Binoculars,
        //             link: "/AllSpecialties",
        //         },
        //         {
        //             id: "add-country-specialty",
        //             label: "Ajouter un pays ou une spécialité",
        //             icon: Plus,
        //             link: "/AddCountrySpecialty",
        //         },
        //     ],
        // },
        // {
        //     id: "other Pramitares ",
        //     label: "Autres Paramètres",
        //     icon: Settings,
        //     hasSubmenu: true,
        //     subItems: [
        //         {
        //             id: "add-country-specialty",
        //             label: "Ajouter un pays spécialisé",
        //             icon: Plus,
        //             link: "/AddCountrySpecialty",
        //         },
        //     ],
        // },
    ];
    return (
        <nav
            className={`w-full bg-white h-screen flex flex-col shadow-lg select-none transition-all duration-300 ${
                isCollapsed ? "items-center" : ""
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                {!isCollapsed && (
                    <h2 className="text-lg font-semibold text-gray-800 ">
                        Menu
                    </h2>
                )}

                {/* Mobile close button */}
                <button
                    onClick={closeSidebar}
                    className="p-2 hover:bg-gray-100 rounded-md md:hidden"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Desktop collapse button */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex p-2 hover:bg-gray-100 rounded-md ml-auto"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronLeft
                        className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                            isCollapsed ? "rotate-180" : ""
                        }`}
                    />
                </button>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto pt-4 pb-4">
                <div
                    className={`${isCollapsed ? "px-2" : "px-4 md:px-6"} space-y-1`}
                >
                    {menuItems.map((item) => (
                        <div key={item.id}>
                            <div
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                                    activeItem === item.id ||
                                    (item.hasSubmenu && isParentActive(item.id))
                                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                                        : "text-zinc-800 hover:bg-gray-50"
                                } ${isCollapsed ? "justify-center" : ""}`}
                                onClick={() =>
                                    item.hasSubmenu
                                        ? toggleDropdown(item.id)
                                        : handleItemClick(item.id, item.link)
                                }
                                title={isCollapsed ? item.label : ""}
                            >
                                <item.icon className="w-5 h-5" />
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 text-sm">
                                            {item.label}
                                        </span>
                                        {item.hasSubmenu && (
                                            <ChevronDown
                                                className={`w-4 h-4 transition-transform ${
                                                    openDropdown === item.id
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            {!isCollapsed &&
                                item.hasSubmenu &&
                                openDropdown === item.id && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {item.subItems.map((subItem) => (
                                            <div
                                                key={subItem.id}
                                                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                                                    activeItem === subItem.id
                                                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                                                        : "text-zinc-800 hover:bg-gray-50"
                                                }`}
                                                onClick={() =>
                                                    handleItemClick(
                                                        subItem.id,
                                                        subItem.link,
                                                    )
                                                }
                                            >
                                                <subItem.icon className="w-5 h-5" />
                                                <span className="flex-1 text-sm">
                                                    {subItem.label}
                                                </span>
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
                    className={`flex items-center gap-3 text-red-500 hover:bg-red-50 p-3 rounded-lg w-full ${
                        isCollapsed ? "justify-center" : ""
                    }`}
                    onClick={handleLogout}
                    title={isCollapsed ? "Se déconnecter" : ""}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && (
                        <span className="text-sm font-semibold">
                            Se déconnecter
                        </span>
                    )}
                </button>
            </div>
        </nav>
    );
};
export default Sidebar;
