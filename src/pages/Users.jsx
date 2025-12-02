import {
  Calendar,
  Mail,
  Search,
  Shield,
  UserCheck,
  Users as UsersIcon,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import usersAPI from "../API/Users";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const [pageSize] = useState(20);

  const fetchUsers = async () => {
    setLoading(true);

    const requestParams = {
      page: pagination.currentPage,
      limit: pageSize,
      search: searchTerm,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filters,
    };

    console.log("🚀 === FETCHING USERS ===");
    console.log("📤 Request params:", requestParams);
    console.log(
      "🔗 Request URL:",
      `/Admin/users?${new URLSearchParams(requestParams).toString()}`
    );

    try {
      const response = await usersAPI.getUsers(requestParams);

      const usersData = response?.users || response?.data?.users || [];
      const paginationData = response?.pagination ||
        response?.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
        };

      // Log users data to console
      console.log("✅ Users fetched successfully:");
      console.log("📊 Total users:", paginationData.totalUsers);
      console.log("👥 Users data:", usersData);
      console.log("📄 Pagination:", paginationData);
      console.log("🔗 Full API Response:", response);

      setUsers(usersData);
      setPagination(paginationData);
    } catch (error) {
      console.error("❌ === ERROR FETCHING USERS ===");
      console.error("❌ Error object:", error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error config:", error.config);
      console.error("❌ Request URL that failed:", error.config?.url);
      console.error("❌ Request params that failed:", error.config?.params);

      if (error.response?.status === 404) {
        toast.error("L'endpoint /Admin/users n'existe pas sur le backend");
      } else if (error.response?.status === 500) {
        toast.error(
          `Erreur serveur 500: ${
            error.response?.data?.error || "Erreur interne du serveur"
          }`
        );
      } else {
        toast.error("Erreur lors du chargement des utilisateurs");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    try {
      await usersAPI.toggleUserStatus(userId);
      toast.success("Statut de l'utilisateur mis à jour");
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      toast.success("Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "teacher":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <UserCheck className="w-3 h-3" />
          Actif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <UserX className="w-3 h-3" />
        Bloqué
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600">
              Gérez tous les utilisateurs de la plateforme
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {pagination.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bloqués</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter((u) => u.status !== "active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les rôles</option>
            <option value="student">Étudiant</option>
            <option value="teacher">Enseignant</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="blocked">Bloqué</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              Aucun utilisateur trouvé
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Assurez-vous que l&apos;endpoint{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                GET /Admin/users
              </code>
              existe sur votre backend et retourne les données au bon format.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d&apos;inscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id || user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.firstName?.[0]?.toUpperCase() ||
                              user.name?.[0]?.toUpperCase() ||
                              "U"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          <Shield className="w-3 h-3 inline mr-1" />
                          {user.role || "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(user.id || user._id)
                            }
                            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                              user.status === "active"
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {user.status === "active" ? "Bloquer" : "Activer"}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(user.id || user._id)
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page{" "}
                    <span className="font-medium">
                      {pagination.currentPage}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          currentPage: pagination.currentPage - 1,
                        })
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          currentPage: pagination.currentPage + 1,
                        })
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
