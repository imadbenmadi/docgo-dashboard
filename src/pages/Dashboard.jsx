import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  Globe,
  Bell,
  ChevronDown,
  Filter,
  Search,
  MoreVertical,
  Plus,
  FileText,
  LogOut,
  Home,
  GraduationCap,
  Settings,
  Check,
  X,
  Loader2,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  X as XIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import ReactPaginate from "react-paginate";
import showAlert from "../components/AllUsers/showAlert";
import StatsCardDashboard from "../components/AllUsers/StatsCardDashboard";
import FilterControls from "../components/AllUsers/FilterControls";
import UsersCourseTable from "../components/AllUsers/UsersCourseTable";
import ApplicationsTable from "../components/AllUsers/ApplicationsTable";

// Mock API simulation with pagination
const mockAPI = {
  async getUsers(page = 1, pageSize = 10, filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allUsers = [
      {
        id: 1,
        name: "Ahmed Benali",
        email: "ahmed.benali@email.com",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        course: "Conception d'interface utilisateur",
        specialty: "Concepteur UI/UX",
        paymentStatus: "Paid",
        registrationDate: "2024-10-25",
        courseStatus: "Completed",
        coursesFinished: 54,
        country: "France",
        progress: 100,
      },
      {
        id: 2,
        name: "Fatima Zahra",
        email: "fatima.zahra@email.com",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b0619791?w=40&h=40&fit=crop&crop=face",
        course: "Développement Web Full Stack",
        specialty: "Développeur",
        paymentStatus: "Pending",
        registrationDate: "2024-10-20",
        courseStatus: "In Progress",
        coursesFinished: 32,
        country: "Maroc",
        progress: 65,
      },
      {
        id: 3,
        name: "Mohamed Salah",
        email: "mohamed.salah@email.com",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        course: "Marketing Digital",
        specialty: "Marketeur",
        paymentStatus: "Paid",
        registrationDate: "2024-10-15",
        courseStatus: "Completed",
        coursesFinished: 28,
        country: "Tunisie",
        progress: 100,
      },
      {
        id: 4,
        name: "Aisha Hassan",
        email: "aisha.hassan@email.com",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        course: "Data Science",
        specialty: "Analyste de données",
        paymentStatus: "Paid",
        registrationDate: "2024-10-10",
        courseStatus: "In Progress",
        coursesFinished: 45,
        country: "Égypte",
        progress: 75,
      },
      {
        id: 5,
        name: "Omar Khalil",
        email: "omar.khalil@email.com",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
        course: "Cybersécurité",
        specialty: "Expert Sécurité",
        paymentStatus: "Failed",
        registrationDate: "2024-10-05",
        courseStatus: "Suspended",
        coursesFinished: 12,
        country: "Liban",
        progress: 20,
      },
      {
        id: 6,
        name: "Leila Ahmed",
        email: "leila.ahmed@email.com",
        avatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face",
        course: "Gestion de Projet",
        specialty: "Chef de projet",
        paymentStatus: "Paid",
        registrationDate: "2024-09-28",
        courseStatus: "Completed",
        coursesFinished: 38,
        country: "Algérie",
        progress: 100,
      },
      {
        id: 7,
        name: "Youssef Karim",
        email: "youssef.karim@email.com",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
        course: "Développement Mobile",
        specialty: "Développeur",
        paymentStatus: "Pending",
        registrationDate: "2024-09-20",
        courseStatus: "In Progress",
        coursesFinished: 25,
        country: "Maroc",
        progress: 60,
      },
      {
        id: 8,
        name: "Nadia Belkacem",
        email: "nadia.belkacem@email.com",
        avatar:
          "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=40&h=40&fit=crop&crop=face",
        course: "Design Graphique",
        specialty: "Designer",
        paymentStatus: "Paid",
        registrationDate: "2024-09-15",
        courseStatus: "Completed",
        coursesFinished: 42,
        country: "Tunisie",
        progress: 100,
      },
      {
        id: 9,
        name: "Karim Zidane",
        email: "karim.zidane@email.com",
        avatar:
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=40&h=40&fit=crop&crop=face",
        course: "Analyse Financière",
        specialty: "Analyste financier",
        paymentStatus: "Failed",
        registrationDate: "2024-09-10",
        courseStatus: "Suspended",
        coursesFinished: 18,
        country: "France",
        progress: 30,
      },
      {
        id: 10,
        name: "Samira Nouri",
        email: "samira.nouri@email.com",
        avatar:
          "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=40&h=40&fit=crop&crop=face",
        course: "Ressources Humaines",
        specialty: "Responsable RH",
        paymentStatus: "Paid",
        registrationDate: "2024-09-05",
        courseStatus: "In Progress",
        coursesFinished: 35,
        country: "Maroc",
        progress: 70,
      },
      {
        id: 11,
        name: "Hassan El Fassi",
        email: "hassan.elfassi@email.com",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        course: "Commerce International",
        specialty: "Responsable Export",
        paymentStatus: "Pending",
        registrationDate: "2024-08-28",
        courseStatus: "In Progress",
        coursesFinished: 22,
        country: "Maroc",
        progress: 55,
      },
      {
        id: 12,
        name: "Amina Bouchra",
        email: "amina.bouchra@email.com",
        avatar:
          "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=40&h=40&fit=crop&crop=face",
        course: "Communication Digitale",
        specialty: "Community Manager",
        paymentStatus: "Paid",
        registrationDate: "2024-08-20",
        courseStatus: "Completed",
        coursesFinished: 48,
        country: "Algérie",
        progress: 100,
      },
    ];

    // Apply filters
    let filteredUsers = [...allUsers];
    if (filters.paymentStatus) {
      filteredUsers = filteredUsers.filter(
        (user) => user.paymentStatus === filters.paymentStatus
      );
    }
    if (filters.country) {
      filteredUsers = filteredUsers.filter(
        (user) => user.country === filters.country
      );
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.course.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate pagination
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(
      startIndex,
      startIndex + pageSize
    );

    return {
      data: paginatedUsers,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  },

  async getApplications(page = 1, pageSize = 10, filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allApplications = [
      {
        id: 1,
        name: "Mohamed Ali",
        phone: "0786598765",
        specialty: "Designer",
        status: "Refuser",
        registrationDate: "25 Oct 2024",
        studyPlace: "France",
        viberStatus: "On going",
        country: "France",
      },
      {
        id: 2,
        name: "Fatima Zahra",
        phone: "0612345678",
        specialty: "Ingénieur",
        status: "Accepter",
        registrationDate: "20 Oct 2024",
        studyPlace: "Canada",
        viberStatus: "Done",
        country: "Maroc",
      },
      {
        id: 3,
        name: "Karim Ben",
        phone: "0698765432",
        specialty: "Médecin",
        status: "En attente",
        registrationDate: "15 Oct 2024",
        studyPlace: "Allemagne",
        viberStatus: "On going",
        country: "Algérie",
      },
      {
        id: 4,
        name: "Amina Toumi",
        phone: "0712345678",
        specialty: "Avocate",
        status: "Accepter",
        registrationDate: "10 Oct 2024",
        studyPlace: "Espagne",
        viberStatus: "Done",
        country: "Tunisie",
      },
      {
        id: 5,
        name: "Youssef Khalid",
        phone: "0623456789",
        specialty: "Architecte",
        status: "Refuser",
        registrationDate: "05 Oct 2024",
        studyPlace: "Italie",
        viberStatus: "On going",
        country: "Maroc",
      },
      {
        id: 6,
        name: "Leila Mansour",
        phone: "0634567890",
        specialty: "Ingénieur",
        status: "Accepter",
        registrationDate: "28 Sep 2024",
        studyPlace: "Belgique",
        viberStatus: "Done",
        country: "Algérie",
      },
      {
        id: 7,
        name: "Hassan El",
        phone: "0645678901",
        specialty: "Designer",
        status: "En attente",
        registrationDate: "20 Sep 2024",
        studyPlace: "Suisse",
        viberStatus: "On going",
        country: "Maroc",
      },
      {
        id: 8,
        name: "Nadia Bel",
        phone: "0656789012",
        specialty: "Médecin",
        status: "Accepter",
        registrationDate: "15 Sep 2024",
        studyPlace: "Pays-Bas",
        viberStatus: "Done",
        country: "Tunisie",
      },
      {
        id: 9,
        name: "Samir Ahmed",
        phone: "0667890123",
        specialty: "Ingénieur",
        status: "Refuser",
        registrationDate: "10 Sep 2024",
        studyPlace: "Suède",
        viberStatus: "On going",
        country: "Algérie",
      },
      {
        id: 10,
        name: "Zahra El",
        phone: "0678901234",
        specialty: "Avocate",
        status: "Accepter",
        registrationDate: "05 Sep 2024",
        studyPlace: "Norvège",
        viberStatus: "Done",
        country: "Maroc",
      },
      {
        id: 11,
        name: "Khalid Ben",
        phone: "0689012345",
        specialty: "Architecte",
        status: "En attente",
        registrationDate: "28 Aug 2024",
        studyPlace: "Danemark",
        viberStatus: "On going",
        country: "Tunisie",
      },
      {
        id: 12,
        name: "Lina Mansour",
        phone: "0690123456",
        specialty: "Ingénieur",
        status: "Accepter",
        registrationDate: "20 Aug 2024",
        studyPlace: "Finlande",
        viberStatus: "Done",
        country: "Algérie",
      },
    ];

    // Apply filters
    let filteredApps = [...allApplications];
    if (filters.country) {
      filteredApps = filteredApps.filter(
        (app) => app.country === filters.country
      );
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredApps = filteredApps.filter(
        (app) =>
          app.name.toLowerCase().includes(searchTerm) ||
          app.specialty.toLowerCase().includes(searchTerm) ||
          app.studyPlace.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate pagination
    const totalItems = filteredApps.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedApps = filteredApps.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedApps,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  },

  async getStats() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      totalUsers: 225,
      completedCourses: 13,
      earnings: 1357,
      internationalUsers: 136,
    };
  },
};

// Main Dashboard Component
const Dashboard = () => {
  const [users, setUsers] = useState([]);

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Apprendre des cours");
  const [filters, setFilters] = useState({
    category: "Apprendre des cours",
    paymentStatus: "",
    country: "",
    search: "",
  });
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [appsPagination, setAppsPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Load users data
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await mockAPI.getUsers(
        usersPagination.currentPage,
        usersPagination.pageSize,
        filters
      );
      setUsers(response.data);
      setUsersPagination(response.pagination);
    } catch (error) {
      showAlert("error", "Erreur", "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Load applications data
  const loadApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await mockAPI.getApplications(
        appsPagination.currentPage,
        appsPagination.pageSize,
        filters
      );
      setApplications(response.data);
      setAppsPagination(response.pagination);
    } catch (error) {
      showAlert("error", "Erreur", "Impossible de charger les applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await mockAPI.getStats();
      setStats(statsData);
    } catch (error) {
      showAlert("error", "Erreur", "Impossible de charger les statistiques");
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle page change for users
  const handleUsersPageChange = (page) => {
    setUsersPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Handle page change for applications
  const handleAppsPageChange = (page) => {
    setAppsPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Load data when filters or pagination changes
  useEffect(() => {
    if (activeTab === "Apprendre des cours") {
      loadUsers();
    } else {
      loadApplications();
    }
  }, [
    filters,
    usersPagination.currentPage,
    activeTab,
    appsPagination.currentPage,
  ]);

  // Load stats on first render
  useEffect(() => {
    loadStats();
    loadUsers();
    loadApplications();
  }, []);

  const statsData = stats
    ? [
        {
          icon: Users,
          title: "Utilisateurs",
          value: stats.totalUsers,
          percentage: "15%",
          trend: "positive",
          trendText: "vs mois dernier",
        },
        {
          icon: BookOpen,
          title: "Cours terminés",
          value: stats.completedCourses,
          percentage: "10%",
          trend: "positive",
          trendText: "vs mois dernier",
        },
        {
          icon: DollarSign,
          title: "Gains",
          value: `${stats.earnings}$`,
          percentage: "40%",
          trend: "negative",
          trendText: "vs mois dernier",
        },
        {
          icon: Globe,
          title: "Internationaux",
          value: stats.internationalUsers,
          percentage: "15%",
          trend: "positive",
          trendText: "vs mois dernier",
        },
      ]
    : [];

  return (
    <div className="w-full bg-gray-50 p-4">
      {/* Stats Cards */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statsData.map((stat, index) => (
          <StatsCardDashboard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            percentage={stat.percentage}
            trend={stat.trend}
            trendText={stat.trendText}
            loading={statsLoading}
          />
        ))}
      </div>

      {/* Users/Applications Section */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4">
        <FilterControls
          filters={filters}
          setFilters={setFilters}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === "Apprendre des cours" ? (
          <UsersCourseTable
            users={users}
            loading={loading}
            pagination={usersPagination}
            onPageChange={handleUsersPageChange}
            filters={filters}
            setFilters={setFilters}
          />
        ) : (
          <ApplicationsTable
            applications={applications}
            setApplications={setApplications}
            loading={loadingApplications}
            pagination={appsPagination}
            onPageChange={handleAppsPageChange}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
