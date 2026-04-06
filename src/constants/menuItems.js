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
  Star,
  Pencil,
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

/**
 * Default menu items configuration
 * Used by Sidebar and SubNavigation components
 * @param {boolean} uploadsCheckEnabled - Whether uploads are enabled
 * @returns {Array} Array of menu item objects
 */
export const getMenuItems = (uploadsCheckEnabled = true) => [
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
    ],
  },
  {
    id: "contact-info",
    label: "Informations de contact",
    icon: Phone,
    link: "/ContactInfo",
  },
  {
    id: "user-options",
    label: "User Options",
    icon: Settings,
    hasSubmenu: true,
    subItems: [
      {
        id: "user-options",
        label: "Manage Options",
        icon: Settings,
        link: "/UserOptions",
      },
      {
        id: "user-options-insights",
        label: "Analyses des Options",
        icon: TrendingUp,
        link: "/UserOptions/Insights",
      },
    ],
  },
  {
    id: "statistics",
    label: "Statistiques",
    above_break: true,
    icon: BarChart3,
    hasSubmenu: true,
    subItems: [
      {
        id: "statistics-overview",
        label: "Vue d'ensemble",
        icon: LayoutDashboard,
        link: "/statistics",
      },
      {
        id: "statistics-visits",
        label: "Trafic & Visites",
        icon: Eye,
        link: "/statistics/visits",
      },
      {
        id: "statistics-content",
        label: "Vues du contenu",
        icon: FileText,
        link: "/statistics/content",
      },
      {
        id: "statistics-payments",
        label: "Revenus",
        icon: CreditCard,
        link: "/statistics/payments",
      },
      {
        id: "statistics-favorites",
        label: "Favoris",
        icon: Heart,
        link: "/statistics/favorites",
      },
      {
        id: "statistics-searches",
        label: "Recherches",
        icon: Search,
        link: "/statistics/searches",
      },
      {
        id: "statistics-registrations",
        label: "Analyse de la demande",
        icon: TrendingUp,
        link: "/statistics/registrations",
      },
      {
        id: "statistics-logins",
        label: "Connexions utilisateurs",
        icon: Search,
        link: "/statistics/logins",
      },
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    above_break: true,
    icon: HelpCircle,
    link: "/FAQ",
  },
  {
    id: "ratings",
    label: "Les avis",
    icon: Star,
    link: "/Ratings",
  },
  {
    id: "contact",
    label: "Messages de contact",
    icon: MessageCircle,
    link: "/Contact",
  },
  {
    id: "courses",
    label: "Les cours",
    icon: BookOpen,
    above_break: true,
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
      {
        id: "deleted-courses",
        label: "Cours supprimés",
        icon: Trash2,
        link: "/Courses/Deleted",
      },
      {
        id: "course-progress",
        label: "Progression des étudiants",
        icon: BarChart2,
        link: "/Courses/progress",
      },
      {
        id: "certificates",
        label: "Certificats",
        icon: Award,
        link: "/Certificates",
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
      {
        id: "deleted-programs",
        label: "Programmes supprimés",
        icon: Trash2,
        link: "/Programs/Deleted",
      },
    ],
  },
  {
    id: "applications",
    label: "Applications",
    above_break: true,
    icon: ClipboardList,
    hasSubmenu: true,
    subItems: [
      {
        id: "course-applications",
        label: "Course Applications",
        icon: BookOpen,
        link: "/Applications/Courses",
      },
      {
        id: "program-applications",
        label: "Program Applications",
        icon: GraduationCap,
        link: "/Applications/Programs",
      },
    ],
  },
  {
    id: "enrollments",
    label: "Enrollments",
    icon: UserCheck,
    hasSubmenu: true,
    subItems: [
      {
        id: "active-enrollments",
        label: "Active Enrollments",
        icon: UserCheck,
        link: "/Enrollments",
      },
      {
        id: "removed-enrollments",
        label: "Removed Enrollments",
        icon: Archive,
        link: "/Enrollments/Removed",
      },
    ],
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
  {
    id: "coupons",
    label: "Coupons",
    icon: Tag,
    link: "/Coupons",
  },
  {
    id: "emails",
    label: "Emails",
    icon: Mail,
    hasSubmenu: true,
    subItems: [
      {
        id: "emails-welcome",
        label: "Welcome",
        icon: Mail,
        link: "/Emails/Welcome",
      },
      {
        id: "emails-login-attempts",
        label: "Login Attempts",
        icon: Shield,
        link: "/Emails/LoginAttempts",
      },
      {
        id: "emails-payment-approved",
        label: "Payment Approved",
        icon: Receipt,
        link: "/Emails/PaymentApproved",
      },
      {
        id: "emails-payment-rejected",
        label: "Payment Rejected",
        icon: Receipt,
        link: "/Emails/PaymentRejected",
      },
      {
        id: "emails-marketing",
        label: "Marketing",
        icon: Megaphone,
        link: "/Emails/Marketing",
      },
    ],
  },
  {
    id: "users",
    label: "Gestion des Utilisateurs",
    above_break: true,
    icon: Users,
    link: "/Users",
  },
  {
    id: "admins",
    label: "Gestion des Admins",
    icon: Shield,
    link: "/Admins",
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
    id: "user-requests",
    label: "Demandes utilisateurs",
    icon: Users,
    hasSubmenu: true,
    subItems: [
      {
        id: "forgot-password-requests",
        label: "Mot de passe oublié",
        icon: KeyRound,
        link: "/ForgotPasswordRequests",
      },
      {
        id: "delete-account-requests",
        label: "Suppression de compte",
        icon: Trash2,
        link: "/DeleteAccountRequests",
      },
    ],
  },
  {
    id: "error-logs",
    label: "Logs du serveur",
    above_break: true,
    icon: FileWarning,
    link: "/ErrorLogs",
  },
  {
    id: "database-backup",
    label: "Sauvegarde DB",
    icon: Database,
    link: "/DatabaseBackup",
  },
  {
    id: "tools",
    label: "Outils",
    above_break: true,
    icon: Wrench,
    hasSubmenu: true,
    subItems: [
      {
        id: "qrcode-builder",
        label: "QR Code Builder",
        icon: QrCode,
        link: "/Tools/QRCode",
      },
    ],
  },
];

export default getMenuItems;
