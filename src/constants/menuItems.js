import {
  Archive,
  Award,
  BarChart2,
  BarChart3,
  BookOpen,
  Briefcase,
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
  HardDrive,
  LayoutDashboard,
  Megaphone,
  Wrench,
  QrCode,
  Tag,
  Mail,
  Link,
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
    // CV and internships were one entry called "Other Services", which is a
    // name for "the two we had not thought about properly". They are two of
    // the four products and each gets its own entry, with its own pages --
    // which also removes the tab bar the combined page had to grow.
    id: "cv-services",
    above_break: true,
    label: "Service CV",
    icon: FileText,
    hasSubmenu: true,
    subItems: [
      {
        id: "cv-catalogue",
        label: "Les services",
        icon: FileText,
        link: "/CV/services",
      },
      {
        id: "cv-applications",
        label: "Candidatures",
        icon: ClipboardList,
        link: "/Orders",
      },
    ],
  },
  {
    id: "internships",
    label: "Stages",
    icon: Briefcase,
    hasSubmenu: true,
    subItems: [
      {
        id: "internship-list",
        label: "Les stages",
        icon: Briefcase,
        link: "/Internships",
      },
      {
        id: "internship-applications",
        label: "Candidatures",
        icon: ClipboardList,
        link: "/Orders",
      },
    ],
  },
  // One queue for every order and one list of who has what. These used to be
  // six entries -- course applications, program applications, CV candidatures,
  // internship candidatures, all payments, service payments -- because the
  // data was in six tables. It is in one now.
  {
    id: "hr",
    label: "RH",
    icon: Users,
    link: "/HR",
  },
  {
    id: "helpdesk",
    label: "Support",
    icon: ClipboardList,
    link: "/HelpDesk",
  },
  {
    id: "forms",
    label: "Formulaires",
    icon: FileText,
    link: "/Forms",
  },
  {
    id: "finance",
    label: "Finance",
    above_break: true,
    icon: Receipt,
    link: "/Finance",
  },
  {
    id: "orders",
    label: "Commandes",
    above_break: true,
    icon: ClipboardList,
    link: "/Orders",
  },
  {
    id: "enrolments",
    label: "Accès accordés",
    icon: UserCheck,
    link: "/Enrolments",
  },
  {
    id: "removed-enrollments",
    label: "Accès retirés (archive)",
    icon: Archive,
    link: "/Enrollments/Removed",
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
        link: "/Orders",
      },
      {
        id: "payment-history",
        label: "Historique des paiements",
        icon: Receipt,
        link: "/PaymentHistory",
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
    id: "users",
    label: "Gestion des Utilisateurs",
    above_break: true,
    icon: Users,
    link: "/Users",
  },
  {
    id: "user-drive-links",
    label: "Drive Links Management",
    icon: Link,
    link: "/UserDriveLinks",
  },
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
      {
        id: "emails-contact-user",
        label: "Email Specific User",
        icon: Mail,
        link: "/Emails/ContactUser",
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
    id: "admins",
    above_break: true,

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
    id: "error-logs",
    label: "Logs du serveur",
    above_break: true,
    icon: FileWarning,
    link: "/ErrorLogs",
  },
  {
    id: "cloud-storage",
    label: "Stockage cloud",
    icon: HardDrive,
    link: "/CloudStorage",
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
