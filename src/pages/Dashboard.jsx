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
} from "lucide-react";
import Swal from "sweetalert2";

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

const ApplicationsTable = ({ applications, setApplications }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const getStatusStyles = (status) => {
    switch (status) {
      case "Refuser":
        return "bg-red-100 text-red-500";
      case "Accepter":
        return "bg-green-100 text-green-600";
      case "En attente":
        return "bg-yellow-100 text-orange-500";
      case "On going":
        return "bg-red-100 text-red-500";
      case "Done":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusPadding = (status) => {
    switch (status) {
      case "Accepter":
        return "px-5 py-1.5";
      case "En attente":
        return "px-4 py-1.5";
      case "Refuser":
        return "px-6 py-1.5";
      case "On going":
        return "py-1.5 pr-4 pl-5";
      case "Done":
        return "px-6 py-1.5";
      default:
        return "px-4 py-1.5";
    }
  };

  const StatusBadge = ({ status, onClick, showDropdown = false }) => (
    <div className="relative">
      <button
        className={`flex gap-2 justify-center items-center my-auto rounded-2xl w-[90px] transition-all duration-200 hover:opacity-80 ${getStatusPadding(
          status
        )} ${getStatusStyles(status)}`}
        onClick={onClick}
      >
        <span className="self-stretch my-auto text-xs">{status}</span>
        {showDropdown &&
          (activeDropdown ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          ))}
      </button>
    </div>
  );

  const StatusDropdown = ({ currentStatus, onStatusChange, isOpen }) => {
    const statusOptions = ["Accepter", "Refuser", "En attente"];
    const filteredOptions = statusOptions.filter(
      (option) => option !== currentStatus
    );

    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 mt-1 w-[93px] z-50 bg-white rounded-lg shadow-lg border border-gray-200">
        {filteredOptions.map((option, index) => (
          <button
            key={option}
            className={`w-full px-4 py-2 text-xs text-zinc-800 hover:bg-gray-50 transition-colors duration-150 ${
              index === 0 ? "rounded-t-lg" : ""
            } ${
              index === filteredOptions.length - 1
                ? "rounded-b-lg"
                : "border-b border-gray-100"
            }`}
            onClick={() => onStatusChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  const handleStatusChange = (applicationId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
    setActiveDropdown(null);
  };

  const handleViberStatusChange = (applicationId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, viberStatus: newStatus } : app
      )
    );
    setActiveDropdown(null);
  };

  const toggleDropdown = (applicationId, type) => {
    const dropdownId = `${applicationId}-${type}`;
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="flex bg-gray-50 border-b border-gray-200">
              <div className="flex-1 min-w-[120px] px-4 py-3 text-xs font-bold text-neutral-600 text-center">
                Nom
              </div>
              <div className="flex-1 min-w-[140px] px-4 py-3 text-xs font-bold text-neutral-600 text-center">
                Numéro de téléphone
              </div>
              <div className="flex-1 min-w-[120px] px-4 py-3 text-xs font-bold text-neutral-600 text-center">
                Spécialité
              </div>
              <div className="flex-1 min-w-[140px] px-4 py-3 text-xs font-bold text-neutral-600 text-center">
                My applications
              </div>
              <div className="flex-1 min-w-[130px] px-4 py-3 text-xs font-bold text-neutral-600 text-center">
                Registration date
              </div>
              <div className="flex-1 min-w-[140px] px-4 py-3 text-xs font-bold text-neutral-600 text-center">
                Study abroad place
              </div>
              <div className="flex-1 min-w-[120px] px-4 py-3 text-xs font-bold text-neutral-600 text-center">
                Viber status
              </div>
            </div>

            {/* Rows */}
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex-1 min-w-[120px] px-4 py-6 text-xs text-neutral-600 text-center">
                  {app.name}
                </div>
                <div className="flex-1 min-w-[140px] px-4 py-6 text-xs text-neutral-600 text-center">
                  {app.phone}
                </div>
                <div className="flex-1 min-w-[120px] px-4 py-6 text-xs text-neutral-600 text-center">
                  {app.specialty}
                </div>
                <div className="flex-1 min-w-[140px] px-4 py-6 text-xs text-center relative">
                  <div className="flex justify-center">
                    <StatusBadge
                      status={app.status}
                      onClick={() => toggleDropdown(app.id, "status")}
                      showDropdown={true}
                    />
                    <StatusDropdown
                      currentStatus={app.status}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(app.id, newStatus)
                      }
                      isOpen={activeDropdown === `${app.id}-status`}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[130px] px-4 py-6 text-xs text-neutral-600 text-center">
                  {app.registrationDate}
                </div>
                <div className="flex-1 min-w-[140px] px-4 py-6 text-xs text-neutral-600 text-center">
                  {app.studyPlace}
                </div>
                <div className="flex-1 min-w-[120px] px-4 py-6 text-xs text-center relative">
                  <div className="flex justify-center">
                    <StatusBadge
                      status={app.viberStatus}
                      onClick={() => toggleDropdown(app.id, "viber")}
                      showDropdown={true}
                    />
                    <StatusDropdown
                      currentStatus={app.viberStatus}
                      onStatusChange={(newStatus) =>
                        handleViberStatusChange(app.id, newStatus)
                      }
                      isOpen={activeDropdown === `${app.id}-viber`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden">
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600">
                    Name:
                  </span>
                  <span className="text-xs text-neutral-600">{app.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600">
                    Phone:
                  </span>
                  <span className="text-xs text-neutral-600">{app.phone}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600">
                    Specialty:
                  </span>
                  <span className="text-xs text-neutral-600">
                    {app.specialty}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600">
                    Application:
                  </span>
                  <div className="relative">
                    <StatusBadge
                      status={app.status}
                      onClick={() => toggleDropdown(app.id, "status")}
                      showDropdown={true}
                    />
                    <StatusDropdown
                      currentStatus={app.status}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(app.id, newStatus)
                      }
                      isOpen={activeDropdown === `${app.id}-status`}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600">
                    Registration:
                  </span>
                  <span className="text-xs text-neutral-600">
                    {app.registrationDate}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600">
                    Study Place:
                  </span>
                  <span className="text-xs text-neutral-600">
                    {app.studyPlace}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600">
                    Viber Status:
                  </span>
                  <div className="relative">
                    <StatusBadge
                      status={app.viberStatus}
                      onClick={() => toggleDropdown(app.id, "viber")}
                      showDropdown={true}
                    />
                    <StatusDropdown
                      currentStatus={app.viberStatus}
                      onStatusChange={(newStatus) =>
                        handleViberStatusChange(app.id, newStatus)
                      }
                      isOpen={activeDropdown === `${app.id}-viber`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 bg-gray-50 border-b border-gray-200 p-4">
              <div className="text-xs font-bold text-neutral-600 text-center">
                Name & Phone
              </div>
              <div className="text-xs font-bold text-neutral-600 text-center">
                Specialty
              </div>
              <div className="text-xs font-bold text-neutral-600 text-center">
                Application Status
              </div>
              <div className="text-xs font-bold text-neutral-600 text-center">
                Details
              </div>
            </div>

            {/* Rows */}
            {applications.map((app) => (
              <div
                key={app.id}
                className="grid grid-cols-4 gap-4 border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="text-center">
                  <div className="text-xs font-medium text-neutral-600">
                    {app.name}
                  </div>
                  <div className="text-xs text-neutral-500">{app.phone}</div>
                </div>

                <div className="text-xs text-neutral-600 text-center">
                  {app.specialty}
                </div>

                <div className="text-center relative">
                  <div className="flex justify-center mb-2">
                    <StatusBadge
                      status={app.status}
                      onClick={() => toggleDropdown(app.id, "status")}
                      showDropdown={true}
                    />
                    <StatusDropdown
                      currentStatus={app.status}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(app.id, newStatus)
                      }
                      isOpen={activeDropdown === `${app.id}-status`}
                    />
                  </div>
                  <div className="flex justify-center relative">
                    <StatusBadge
                      status={app.viberStatus}
                      onClick={() => toggleDropdown(app.id, "viber")}
                      showDropdown={true}
                    />
                    <StatusDropdown
                      currentStatus={app.viberStatus}
                      onStatusChange={(newStatus) =>
                        handleViberStatusChange(app.id, newStatus)
                      }
                      isOpen={activeDropdown === `${app.id}-viber`}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-neutral-600">
                    {app.registrationDate}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {app.studyPlace}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// SweetAlert simulation
const showAlert = (type, title, text) => {
  if (type === "success") {
    Swal.fire({
      icon: "success",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
      timer: 1500,
      showConfirmButton: false,
    });
  }
  if (type === "error") {
    Swal.fire({
      icon: "error",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
    });
  }
  if (type === "warning") {
    Swal.fire({
      icon: "warning",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
    });
  }
  if (type === "info") {
    Swal.fire({
      icon: "info",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
    });
  }
  if (type === "question") {
    Swal.fire({
      icon: "question",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
    });
  }
  if (type === "loading") {
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }
  if (type === "close") {
    Swal.close();
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

const UsersCourseTable = ({ users, loading }) => {
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
    <div className="bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden">
      {/* Desktop Table (visible on md screens and up) */}
      <div className="hidden md:block w-full overflow-x-auto">
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

      {/* Mobile Cards (visible on sm screens and down) */}
      <div className="md:hidden space-y-4 p-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="relative group">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                <div className="absolute right-0 top-8 w-40 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleUserAction(user, "Voir le profil")}
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
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Cours</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.course}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Paiement</p>
                <StatusBadge status={user.paymentStatus} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Inscription</p>
                <p className="text-sm text-gray-900">
                  {new Date(user.registrationDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Statut</p>
                <StatusBadge status={user.courseStatus} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1">Progrès</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${user.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{user.progress}%</span>
              </div>
            </div>
          </div>
        ))}
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
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: "Mohamed",
      phone: "0786598765",
      specialty: "Designer",
      status: "Refuser",
      registrationDate: "25 Oct 2024",
      studyPlace: "France",
      viberStatus: "On going",
    },
    {
      id: 2,
      name: "Mohamed",
      phone: "0786598765",
      specialty: "Designer",
      status: "Refuser",
      registrationDate: "25 Oct 2024",
      studyPlace: "France",
      viberStatus: "On going",
    },
    {
      id: 3,
      name: "Mohamed",
      phone: "0786598765",
      specialty: "Designer",
      status: "Accepter",
      registrationDate: "25 Oct 2024",
      studyPlace: "France",
      viberStatus: "On going",
    },
    {
      id: 4,
      name: "Mohamed",
      phone: "0786598765",
      specialty: "Designer",
      status: "En attente",
      registrationDate: "25 Oct 2024",
      studyPlace: "France",
      viberStatus: "Done",
    },
    {
      id: 5,
      name: "Mohamed",
      phone: "0786598765",
      specialty: "Designer",
      status: "Accepter",
      registrationDate: "25 Oct 2024",
      studyPlace: "France",
      viberStatus: "On going",
    },
    {
      id: 6,
      name: "Mohamed",
      phone: "0786598765",
      specialty: "Designer",
      status: "Accepter",
      registrationDate: "25 Oct 2024",
      studyPlace: "France",
      viberStatus: "On going",
    },
  ]);

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
    <div className=" w-full bg-gray-50 p-4">
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
        {/* <UsersCourseTable users={filteredUsers} loading={loading} /> */}
        <ApplicationsTable
          applications={applications}
          setApplications={setApplications}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
