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
} from "lucide-react";

// Mock API simulation
const mockAPI = {
  async getUsers() {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return [
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
    ];
  },

  async getStats() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      totalUsers: 225,
      completedCourses: 13,
      earnings: 1357,
      internationalUsers: 136,
    };
  },
};

// SweetAlert simulation
const showAlert = (type, title, text) => {
  if (type === "success") {
    alert(`✅ ${title}\n${text}`);
  } else if (type === "error") {
    alert(`❌ ${title}\n${text}`);
  } else if (type === "warning") {
    alert(`⚠️ ${title}\n${text}`);
  } else {
    alert(`ℹ️ ${title}\n${text}`);
  }
};

// Stats Card Component - Made more compact
const StatsCard = ({
  icon: Icon,
  title,
  value,
  percentage,
  trend,
  trendText,
  loading,
}) => {
  const trendColor = trend === "positive" ? "text-green-600" : "text-red-500";
  const trendBgColor = trend === "positive" ? "bg-green-100" : "bg-red-100";

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-50 rounded-md">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-xs font-medium text-zinc-600">{title}</h3>
      </div>

      <div className="mb-2">
        {loading ? (
          <div className="flex items-center gap-1">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-xl font-bold text-zinc-400">---</span>
          </div>
        ) : (
          <span className="text-2xl font-bold text-zinc-800">{value}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <div
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${trendBgColor} ${trendColor}`}
        >
          {percentage}
        </div>
        <span className={`text-xs ${trendColor}`}>{trendText}</span>
      </div>
    </div>
  );
};

// Filter Controls Component - Made more compact
const FilterControls = ({ filters, setFilters }) => {
  const categories = ["Apprendre des cours", "Étudier à l'étranger", "Tous"];

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center w-full mb-4">
      <h1 className="text-lg font-semibold text-zinc-800 whitespace-nowrap">
        Tous les utilisateurs
      </h1>

      <div className="flex flex-wrap gap-2 items-center flex-1 w-full">
        {/* Category Filter */}
        <div className="flex bg-stone-100 rounded-lg p-0.5">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                filters.category === category
                  ? "bg-white text-zinc-800 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
              onClick={() => setFilters((prev) => ({ ...prev, category }))}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Payment Status Filter */}
        <div className="relative">
          <select
            className="pl-2 pr-6 py-1 rounded-lg border border-gray-200 bg-white text-xs appearance-none"
            value={filters.paymentStatus}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))
            }
          >
            <option value="">Statut de paiement</option>
            <option value="Paid">Payé</option>
            <option value="Pending">En attente</option>
            <option value="Failed">Échoué</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Country Filter */}
        <div className="relative">
          <select
            className="pl-2 pr-6 py-1 rounded-lg border border-gray-200 bg-white text-xs appearance-none"
            value={filters.country}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, country: e.target.value }))
            }
          >
            <option value="">Pays</option>
            <option value="France">France</option>
            <option value="Maroc">Maroc</option>
            <option value="Tunisie">Tunisie</option>
            <option value="Égypte">Égypte</option>
            <option value="Liban">Liban</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-7 pr-2 py-1 rounded-lg border border-gray-200 bg-white text-xs w-full"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
};

// Status Badge Component - Made more compact
const StatusBadge = ({ status, type }) => {
  const styles = {
    Paid: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600",
    Failed: "bg-red-100 text-red-600",
    Completed: "bg-blue-100 text-blue-600",
    "In Progress": "bg-purple-100 text-purple-600",
    Suspended: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

// Users Table Component - Made more compact
const UsersTable = ({ users, loading }) => {
  const handleUserAction = (user, action) => {
    showAlert("info", "Action utilisateur", `${action} pour ${user.name}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">
            Chargement des utilisateurs...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full rounded-lg shadow-xs border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cours
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spécialité
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paiement
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inscription
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progrès
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[120px]">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-900 truncate max-w-[150px]">
                    {user.course}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-900 truncate max-w-[100px]">
                    {user.specialty}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-900">
                    {new Date(user.registrationDate).toLocaleDateString(
                      "fr-FR"
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.courseStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${user.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {user.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="relative group">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    <div className="absolute right-0 top-8 w-40 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() =>
                            handleUserAction(user, "Voir le profil")
                          }
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Voir le profil
                        </button>
                        <button
                          onClick={() => handleUserAction(user, "Modifier")}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleUserAction(user, "Supprimer")}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "Apprendre des cours",
    paymentStatus: "",
    country: "",
    search: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);

        const [usersData, statsData] = await Promise.all([
          mockAPI.getUsers(),
          mockAPI.getStats(),
        ]);

        setUsers(usersData);
        setStats(statsData);
      } catch (error) {
        showAlert("error", "Erreur", "Impossible de charger les données");
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter users based on current filters
  const filteredUsers = users.filter((user) => {
    if (filters.paymentStatus && user.paymentStatus !== filters.paymentStatus)
      return false;
    if (filters.country && user.country !== filters.country) return false;
    if (
      filters.search &&
      !user.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !user.email.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

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
    <div className="min-h-full w-full bg-gray-50 p-4">
      {/* Stats Cards */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statsData.map((stat, index) => (
          <StatsCard
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

      {/* Users Section */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4">
        <FilterControls filters={filters} setFilters={setFilters} />
        <UsersTable users={filteredUsers} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
