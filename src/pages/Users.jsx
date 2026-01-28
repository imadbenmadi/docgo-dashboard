import {
    Calendar,
    Mail,
    Search,
    UserCheck,
    Users as UsersIcon,
    UserX,
    BookOpen,
    Briefcase,
    Edit2,
    Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import usersAPI from "../API/Users";
import adminUsersAPI from "../API/AdminUsers";

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

    // Modal states
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
    const [showAssignProgramModal, setShowAssignProgramModal] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

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

        try {
            const response = await usersAPI.getUsers(requestParams);

            // Handle different response formats
            let usersData = [];
            let paginationData = {
                currentPage: parseInt(requestParams.page) || 1,
                totalPages: 1,
                totalUsers: 0,
            };

            if (response) {
                // Format 1: { users: [...], pagination: {...} }
                if (response.users && Array.isArray(response.users)) {
                    usersData = response.users;
                    paginationData = {
                        currentPage:
                            response.pagination?.currentPage ||
                            paginationData.currentPage,
                        totalPages: response.pagination?.totalPages || 1,
                        totalUsers:
                            response.pagination?.totalUsers ||
                            response.users.length,
                    };
                }
                // Format 2: { data: { users: [...], pagination: {...} } }
                else if (
                    response.data?.users &&
                    Array.isArray(response.data.users)
                ) {
                    usersData = response.data.users;
                    paginationData = {
                        currentPage:
                            response.data.pagination?.currentPage ||
                            paginationData.currentPage,
                        totalPages: response.data.pagination?.totalPages || 1,
                        totalUsers:
                            response.data.pagination?.totalUsers ||
                            response.data.users.length,
                    };
                }
                // Format 3: Direct array of users
                else if (Array.isArray(response)) {
                    usersData = response;
                    paginationData.totalUsers = response.length;
                    paginationData.totalPages = 1;
                }
                // Format 4: { data: [...] }
                else if (response.data && Array.isArray(response.data)) {
                    usersData = response.data;
                    paginationData.totalUsers = response.data.length;
                    paginationData.totalPages = 1;
                }
                // Format 5: Object with other keys that might contain users
                else {
                    // Try to find users in any property
                    for (const key of Object.keys(response)) {
                        if (Array.isArray(response[key])) {
                            usersData = response[key];
                            paginationData.totalUsers = response[key].length;
                            break;
                        }
                    }
                }
            }

            // Filter out admin users
            const nonAdminUsers = usersData.filter(
                (user) => user.role?.toLowerCase() !== "admin",
            );

            setUsers(nonAdminUsers);
            setPagination({
                ...pagination,
                totalPages: paginationData.totalPages,
                totalUsers: paginationData.totalUsers,
            });
        } catch (error) {
            if (error.response?.status === 404) {
                toast.error(
                    "L'endpoint /Admin/users n'existe pas sur le backend",
                );
            } else if (error.response?.status === 500) {
                const backendError =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.response?.data?.details ||
                    "Erreur serveur - vérifier les logs backend";
                toast.error(`Erreur backend: ${backendError}`);
            } else {
                toast.error("Erreur lors du chargement des utilisateurs");
            }
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        setLoadingDetails(true);
        try {
            const details = await adminUsersAPI.getUserDetails(userId);
            setUserDetails(details.data || details);
        } catch (error) {
            toast.error(
                "Erreur lors du chargement des détails de l'utilisateur",
            );
        } finally {
            setLoadingDetails(false);
        }
    };

    const fetchCoursesAndPrograms = async () => {
        try {
            // Fetch courses and programs from correct backend endpoints
            const coursesRes = await fetch("/Courses");
            const programsRes = await fetch("/Programs");

            if (coursesRes.ok) {
                const data = await coursesRes.json();
                setCourses(data.data || data || []);
            }
            if (programsRes.ok) {
                const data = await programsRes.json();
                setPrograms(data.data || data || []);
            }
        } catch (error) {
            console.error("Error fetching courses/programs:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchCoursesAndPrograms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.currentPage, filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, currentPage: 1 });
        fetchUsers();
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
        fetchUserDetails(user.id || user._id);
    };

    const handleAssignCourse = (user) => {
        setSelectedUser(user);
        fetchAssignmentCourses();
        setShowAssignCourseModal(true);
    };

    const handleAssignProgram = (user) => {
        setSelectedUser(user);
        fetchAssignmentPrograms();
        setShowAssignProgramModal(true);
    };

    const fetchAssignmentCourses = async () => {
        try {
            const response = await adminUsersAPI.getAllCoursesForAssignment();
            setCourses(response.data || []);
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Erreur lors du chargement des cours");
        }
    };

    const fetchAssignmentPrograms = async () => {
        try {
            const response = await adminUsersAPI.getAllProgramsForAssignment();
            setPrograms(response.data || []);
        } catch (error) {
            console.error("Error fetching programs:", error);
            toast.error("Erreur lors du chargement des programmes");
        }
    };

    const confirmAssignCourse = async (courseId) => {
        try {
            await adminUsersAPI.assignCourseToUser(
                selectedUser.id || selectedUser._id,
                courseId,
            );
            toast.success("Cours assigné avec succès");
            setShowAssignCourseModal(false);
            fetchUsers();
            if (userDetails)
                fetchUserDetails(selectedUser.id || selectedUser._id);
        } catch (error) {
            toast.error(
                error.message ||
                    error.response?.data?.message ||
                    "Erreur lors de l'assignation du cours",
            );
        }
    };

    const confirmAssignProgram = async (programId) => {
        try {
            await adminUsersAPI.assignProgramToUser(
                selectedUser.id || selectedUser._id,
                programId,
            );
            toast.success("Programme assigné avec succès");
            setShowAssignProgramModal(false);
            fetchUsers();
            if (userDetails)
                fetchUserDetails(selectedUser.id || selectedUser._id);
        } catch (error) {
            toast.error(
                error.message ||
                    error.response?.data?.message ||
                    "Erreur lors de l'assignation du programme",
            );
        }
    };

    const handleRemoveFromCourse = async (courseId) => {
        const result = await Swal.fire({
            title: "Retirer du cours ?",
            text: "L'utilisateur sera retiré de ce cours",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Retirer",
            cancelButtonText: "Annuler",
        });

        if (!result.isConfirmed) return;

        try {
            await adminUsersAPI.removeUserFromCourse(
                selectedUser.id || selectedUser._id,
                courseId,
            );
            toast.success("Utilisateur retiré du cours");
            fetchUserDetails(selectedUser.id || selectedUser._id);
        } catch (error) {
            toast.error("Erreur lors du retrait du cours");
        }
    };

    const handleRemoveFromProgram = async (programId) => {
        const result = await Swal.fire({
            title: "Retirer du programme ?",
            text: "L'utilisateur sera retiré de ce programme",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Retirer",
            cancelButtonText: "Annuler",
        });

        if (!result.isConfirmed) return;

        try {
            await adminUsersAPI.removeUserFromProgram(
                selectedUser.id || selectedUser._id,
                programId,
            );
            toast.success("Utilisateur retiré du programme");
            fetchUserDetails(selectedUser.id || selectedUser._id);
        } catch (error) {
            toast.error("Erreur lors du retrait du programme");
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        const result = await Swal.fire({
            title: "⚠️ Supprimer l'utilisateur ?",
            html: `
        <div style="text-align: left; padding: 10px;">
          <p style="font-weight: bold; color: #dc3545; margin-bottom: 15px;">
            Vous êtes sur le point de supprimer <strong>${userName}</strong>
          </p>
          <p style="margin-bottom: 10px;">Cette action est <strong>IRRÉVERSIBLE</strong> et supprimera :</p>
          <ul style="text-align: left; color: #666;">
            <li>✗ Le compte utilisateur</li>
            <li>✗ Toutes les inscriptions aux cours</li>
            <li>✗ Toute la progression des cours</li>
            <li>✗ Tous les avis</li>
            <li>✗ Toutes les notifications</li>
            <li>✗ Toutes les données du programme</li>
          </ul>
          <p style="margin-top: 15px; font-weight: bold; color: #dc3545;">
            Êtes-vous ABSOLUMENT SÛR de vouloir continuer ?
          </p>
        </div>
      `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Oui, supprimer définitivement",
            cancelButtonText: "Annuler",
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        Swal.fire({
            title: "Suppression en cours...",
            html: "Veuillez patienter",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await adminUsersAPI.deleteUser(userId);

            Swal.fire({
                title: "Supprimé !",
                text:
                    response.message ||
                    "Utilisateur et toutes ses données supprimés avec succès",
                icon: "success",
                confirmButtonColor: "#28a745",
                timer: 3000,
            });

            setShowDetailsModal(false);
            fetchUsers();
        } catch (error) {
            const errorMessage =
                error.message ||
                error.response?.data?.message ||
                "Erreur lors de la suppression de l'utilisateur";

            Swal.fire({
                title: "Erreur !",
                text: errorMessage,
                icon: "error",
                confirmButtonColor: "#dc3545",
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
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
                                <p className="text-sm text-gray-600">
                                    Total Utilisateurs
                                </p>
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
                                    {
                                        users.filter(
                                            (u) => u.status === "active",
                                        ).length
                                    }
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
                                    {
                                        users.filter(
                                            (u) => u.status !== "active",
                                        ).length
                                    }
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
                    {/*
                        <select
                            value={filters.role}
                            onChange={(e) =>
                                setFilters({ ...filters, role: e.target.value })
                            }
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tous les rôles</option>
                            <option value="student">Étudiant</option>
                            <option value="teacher">Enseignant</option>
                            <option value="admin">Admin</option>
                        </select>
                        */}

                    {/* <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="blocked">Bloqué</option>
                    </select> */}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <Search className="w-4 h-4" />
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
                        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                            Vérifiez la console du navigateur (F12) pour plus de
                            détails.
                        </p>
                        <button
                            onClick={fetchUsers}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Recharger
                        </button>
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
                                    {users.map((user, index) => (
                                        <tr
                                            key={user.id || user._id || index}
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
                                                            {user.firstName &&
                                                            user.lastName
                                                                ? `${user.firstName} ${user.lastName}`
                                                                : user.name ||
                                                                  "N/A"}
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
                                                {getStatusBadge(user.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleViewDetails(user)
                                                    }
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Voir
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id || user._id,
                                                            user.firstName &&
                                                                user.lastName
                                                                ? `${user.firstName} ${user.lastName}`
                                                                : user.name ||
                                                                      user.email ||
                                                                      "cet utilisateur",
                                                        )
                                                    }
                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    Supprimer
                                                </button>
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
                                        <span className="font-medium">
                                            {pagination.totalPages}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setPagination({
                                                    ...pagination,
                                                    currentPage:
                                                        pagination.currentPage -
                                                        1,
                                                })
                                            }
                                            disabled={
                                                pagination.currentPage === 1
                                            }
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            onClick={() =>
                                                setPagination({
                                                    ...pagination,
                                                    currentPage:
                                                        pagination.currentPage +
                                                        1,
                                                })
                                            }
                                            disabled={
                                                pagination.currentPage ===
                                                pagination.totalPages
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

            {/* User Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {loadingDetails ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">
                                        Détails de l'utilisateur
                                    </h2>
                                    <button
                                        onClick={() =>
                                            setShowDetailsModal(false)
                                        }
                                        className="text-white hover:text-gray-200"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* User Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">
                                            Informations personnelles
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Nom
                                                </p>
                                                <p className="font-semibold text-gray-800">
                                                    {selectedUser?.firstName &&
                                                    selectedUser?.lastName
                                                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                                                        : selectedUser?.name ||
                                                          "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Email
                                                </p>
                                                <p className="font-semibold text-gray-800">
                                                    {selectedUser?.email ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Statut
                                                </p>
                                                <p className="font-semibold">
                                                    {getStatusBadge(
                                                        selectedUser?.status,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Date d'inscription
                                                </p>
                                                <p className="font-semibold text-gray-800">
                                                    {formatDate(
                                                        selectedUser?.createdAt,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Courses */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <BookOpen className="w-5 h-5" />
                                                Cours (
                                                {userDetails?.enrollments
                                                    ?.courses?.length || 0}
                                                )
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    handleAssignCourse(
                                                        selectedUser,
                                                    )
                                                }
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                Assigner
                                            </button>
                                        </div>
                                        {userDetails?.enrollments?.courses
                                            ?.length > 0 ? (
                                            <div className="space-y-2">
                                                {userDetails.enrollments.courses.map(
                                                    (course) => (
                                                        <div
                                                            key={course.id}
                                                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                                        >
                                                            <div>
                                                                <p className="font-semibold text-gray-800">
                                                                    {course.title ||
                                                                        "Sans titre"}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {course.category ||
                                                                        "Sans catégorie"}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveFromCourse(
                                                                        course.courseId,
                                                                    )
                                                                }
                                                                className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                                                            >
                                                                Retirer
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-600">
                                                Aucun cours assigné
                                            </p>
                                        )}
                                    </div>

                                    {/* Programs */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <Briefcase className="w-5 h-5" />
                                                Programmes (
                                                {userDetails?.enrollments
                                                    ?.programs?.length || 0}
                                                )
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    handleAssignProgram(
                                                        selectedUser,
                                                    )
                                                }
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                Assigner
                                            </button>
                                        </div>
                                        {userDetails?.enrollments?.programs
                                            ?.length > 0 ? (
                                            <div className="space-y-2">
                                                {userDetails.enrollments.programs.map(
                                                    (program) => (
                                                        <div
                                                            key={program.id}
                                                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                                        >
                                                            <div>
                                                                <p className="font-semibold text-gray-800">
                                                                    {program.title ||
                                                                        "Sans titre"}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {program.category ||
                                                                        "Sans catégorie"}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveFromProgram(
                                                                        program.programId,
                                                                    )
                                                                }
                                                                className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                                                            >
                                                                Retirer
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-600">
                                                Aucun programme assigné
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() =>
                                                handleDeleteUser(
                                                    selectedUser.id ||
                                                        selectedUser._id,
                                                    `${selectedUser.firstName} ${selectedUser.lastName}`,
                                                )
                                            }
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            Supprimer l'utilisateur
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowDetailsModal(false)
                                            }
                                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Assign Course Modal */}
            {showAssignCourseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                Assigner un cours
                            </h2>
                            <button
                                onClick={() => setShowAssignCourseModal(false)}
                                className="text-white hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            {courses.length === 0 ? (
                                <p className="text-gray-600">
                                    Aucun cours disponible
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {courses.map((course) => (
                                        <button
                                            key={course.id}
                                            onClick={() =>
                                                confirmAssignCourse(course.id)
                                            }
                                            className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                                        >
                                            <p className="font-semibold text-gray-800">
                                                {course.Title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {course.Category ||
                                                    "Sans catégorie"}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowAssignCourseModal(false)}
                                className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Program Modal */}
            {showAssignProgramModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                Assigner un programme
                            </h2>
                            <button
                                onClick={() => setShowAssignProgramModal(false)}
                                className="text-white hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            {programs.length === 0 ? (
                                <p className="text-gray-600">
                                    Aucun programme disponible
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {programs.map((program) => (
                                        <button
                                            key={program.id}
                                            onClick={() =>
                                                confirmAssignProgram(program.id)
                                            }
                                            className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                                        >
                                            <p className="font-semibold text-gray-800">
                                                {program.title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {program.category ||
                                                    "Sans catégorie"}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowAssignProgramModal(false)}
                                className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
