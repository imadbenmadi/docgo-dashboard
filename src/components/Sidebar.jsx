import {
    BarChart3,
    BookOpen,
    GraduationCap,
    HelpCircle,
    Home,
    LogOut,
    MessageCircle,
    Phone,
    Plus,
    Receipt,
    Settings,
    Shield,
    Users,
    ClipboardList,
    UserCheck,
    ChevronDown,
    ChevronLeft,
    X,
    Star,
    Filter,
    Pencil,
    Globe,
    TrendingUp,
    FileWarning,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAppContext } from "../AppContext";
import { useNavigation } from "../context/NavigationContext";
import { useBranding } from "../context/BrandingContext";

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
        {
            id: "homepage",
            label: "Page d'accueil",
            icon: Home,
            hasSubmenu: true,
            subItems: [
                {
                    id: "homepage-overview",
                    label: "Vue d'ensemble",
                    icon: Home,
                    link: "/HomePageManagement",
                },
                {
                    id: "homepage-content",
                    label: "Éditeur de contenu",
                    icon: Pencil,
                    link: "/HomePageManagement/Content",
                },
                {
                    id: "homepage-featured",
                    label: "Éléments en vedette",
                    icon: Star,
                    link: "/HomePageManagement/Featured",
                },
                {
                    id: "homepage-filter",
                    label: "Options de filtre",
                    icon: Filter,
                    link: "/HomePageManagement/FilterOptions",
                },
            ],
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
            id: "register-options",
            label: "Inscription",
            icon: Globe,
            hasSubmenu: true,
            subItems: [
                {
                    id: "register-options-manage",
                    label: "Options du formulaire",
                    icon: Globe,
                    link: "/RegisterOptions",
                },
                {
                    id: "register-options-insights",
                    label: "Analyse de la demande",
                    icon: TrendingUp,
                    link: "/RegisterOptions/Insights",
                },
            ],
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
            id: "applications",
            label: "Candidatures",
            icon: ClipboardList,
            hasSubmenu: true,
            subItems: [
                {
                    id: "program-applications",
                    label: "Candidatures programmes",
                    icon: GraduationCap,
                    link: "/Applications/Programs",
                },
                {
                    id: "course-applications",
                    label: "Candidatures cours",
                    icon: BookOpen,
                    link: "/Applications/Courses",
                },
            ],
        },
        {
            id: "enrollments",
            label: "Inscriptions",
            icon: UserCheck,
            link: "/Enrollments",
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

        {
            id: "error-logs",
            label: "Logs du serveur",
            icon: FileWarning,
            link: "/ErrorLogs",
        },
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
            {/* Brand Header */}
            <div
                className={`flex items-center border-b bg-gradient-to-r from-blue-600 to-blue-700 ${
                    isCollapsed
                        ? "justify-center p-3"
                        : "justify-between px-4 py-3"
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
                            <p className="text-blue-200 text-xs">
                                Tableau de bord
                            </p>
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
