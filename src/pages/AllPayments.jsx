import { useEffect, useState } from "react";
import ApplicationsTablePayments from "../components/Payments/ApplicationsTablePayments";
import PaymentProofModal from "../components/Payments/PaymentProofModal";
import UsersCourseTablePayments from "../components/Payments/UsersCourseTablePayments";

// mock API with approval/rejection functions
const mockAPI = {
    async getUsers(page = 1, pageSize = 10, filters = {}) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const allUsers = [
            {
                id: 1,
                name: "Ahmed Benali",
                email: "ahmed.benali@email.com",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                course: "Conception d'interface utilisateur",
                paymentStatus: "Paid",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Ahmed",
                registrationDate: "2024-10-25",
                paymentMethod: "Stripe",
                country: "France",
            },
            {
                id: 2,
                name: "Fatima Zahra",
                email: "fatima.zahra@email.com",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b0619791?w=40&h=40&fit=crop&crop=face",
                course: "Développement Web Full Stack",
                paymentStatus: "Pending",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Fatima",
                registrationDate: "2024-10-20",
                paymentMethod: "Stripe",

                country: "Maroc",
            },
            {
                id: 3,
                name: "Mohamed Salah",
                email: "mohamed.salah@email.com",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                course: "Marketing Digital",
                paymentStatus: "Pending",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Mohamed",
                registrationDate: "2024-10-15",
                paymentMethod: "Baridi Mob",
                country: "Tunisie",
            },
            {
                id: 5,
                name: "Omar Khalil",
                email: "omar.khalil@email.com",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
                course: "Cybersécurité",
                paymentStatus: "Failed",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Omar",
                registrationDate: "2024-10-05",
                paymentMethod: "Baridi Mob",

                country: "Liban",
            },
            {
                id: 7,
                name: "Youssef Karim",
                email: "youssef.karim@email.com",
                avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
                course: "Développement Mobile",
                paymentStatus: "Pending",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Youssef",
                registrationDate: "2024-09-20",
                paymentMethod: "Stripe",
                country: "Maroc",
            },
            {
                id: 9,
                name: "Karim Zidane",
                email: "karim.zidane@email.com",
                avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=40&h=40&fit=crop&crop=face",
                course: "Analyse Financière",
                paymentStatus: "Failed",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Karim",
                registrationDate: "2024-09-10",
                paymentMethod: "Baridi Mob",
                country: "France",
            },
            {
                id: 11,
                name: "Hassan El Fassi",
                email: "hassan.elfassi@email.com",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                course: "Commerce International",
                paymentStatus: "Pending",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Hassan",
                registrationDate: "2024-08-28",
                paymentMethod: "Stripe",
                country: "Maroc",
            },
        ];

        // Filter to show only users that need acceptance (Pending or Failed)
        let filteredUsers = allUsers.filter(
            (user) =>
                user.paymentStatus === "Pending" ||
                user.paymentStatus === "Failed"
        );

        // Apply additional filters
        if (filters.paymentStatus) {
            filteredUsers = filteredUsers.filter(
                (user) => user.paymentStatus === filters.paymentStatus
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
                paymentStatus: "Pending",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Mohamed",
                registrationDate: "25 Oct 2024",
                paymentMethod: "Stripe",
                studyPlace: "France",
                country: "France",
            },
            {
                id: 3,
                name: "Karim Ben",
                phone: "0698765432",
                specialty: "Médecin",
                paymentStatus: "Pending",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Karim",
                registrationDate: "15 Oct 2024",
                paymentMethod: "Baridi Mob",
                studyPlace: "Allemagne",
                country: "Algérie",
            },
            {
                id: 5,
                name: "Youssef Khalid",
                phone: "0623456789",
                specialty: "Architecte",
                paymentStatus: "Failed",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Youssef",
                registrationDate: "05 Oct 2024",
                paymentMethod: "Baridi Mob",
                studyPlace: "Italie",

                country: "Maroc",
            },
            {
                id: 7,
                name: "Hassan El",
                phone: "0645678901",
                specialty: "Designer",
                paymentStatus: "Pending",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Hassan",
                registrationDate: "20 Sep 2024",
                paymentMethod: "Stripe",
                studyPlace: "Suisse",
                country: "Maroc",
            },
            {
                id: 9,
                name: "Samir Ahmed",
                phone: "0667890123",
                specialty: "Ingénieur",
                paymentStatus: "Failed",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Samir",
                registrationDate: "10 Sep 2024",
                paymentMethod: "Baridi Mob",
                studyPlace: "Suède",
                country: "Algérie",
            },
            {
                id: 11,
                name: "Khalid Ben",
                phone: "0689012345",
                specialty: "Architecte",
                paymentStatus: "Pending",
                paymentProofImage:
                    "https://via.placeholder.com/800x600?text=Payment+Proof+Khalid",
                registrationDate: "28 Aug 2024",
                paymentMethod: "Stripe",
                studyPlace: "Danemark",
                country: "Tunisie",
            },
        ];

        // Filter to show only applications that need acceptance (Pending or Failed)
        let filteredApps = allApplications.filter(
            (app) =>
                app.paymentStatus === "Pending" ||
                app.paymentStatus === "Failed"
        );

        // Apply additional filters
        if (filters.paymentStatus) {
            filteredApps = filteredApps.filter(
                (app) => app.paymentStatus === filters.paymentStatus
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

        const totalItems = filteredApps.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const paginatedApps = filteredApps.slice(
            startIndex,
            startIndex + pageSize
        );

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

    async approvePayment(userId, type = "user") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Approved payment for ${type} ID: ${userId}`);
        return { success: true };
    },

    async rejectPayment(userId, type = "user") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Rejected payment for ${type} ID: ${userId}`);
        return { success: true };
    },
};

// Main AllPayments Component
const AllPayments = () => {
    const [users, setUsers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [activeTab, setActiveTab] = useState("Apprendre des cours");
    const [filters, setFilters] = useState({
        paymentStatus: "",
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPaymentProof, setSelectedPaymentProof] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);

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
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

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
            console.error("Error loading applications:", error);
        } finally {
            setLoadingApplications(false);
        }
    };

    const handleUsersPageChange = (page) => {
        setUsersPagination((prev) => ({ ...prev, currentPage: page }));
    };

    const handleAppsPageChange = (page) => {
        setAppsPagination((prev) => ({ ...prev, currentPage: page }));
    };

    const handleViewPaymentProof = (Image, userName, userId) => {
        setSelectedPaymentProof(Image);
        setSelectedUserName(userName);
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const handleApprovePayment = async (userId) => {
        try {
            const type =
                activeTab === "Apprendre des cours" ? "user" : "application";
            await mockAPI.approvePayment(userId, type);

            // Remove the approved user/application from the list
            if (activeTab === "Apprendre des cours") {
                setUsers((prev) => prev.filter((user) => user.id !== userId));
            } else {
                setApplications((prev) =>
                    prev.filter((app) => app.id !== userId)
                );
            }

            // Show success message
            alert("Payment approved successfully!");

            // Reload data to update pagination
            if (activeTab === "Apprendre des cours") {
                loadUsers();
            } else {
                loadApplications();
            }
        } catch (error) {
            console.error("Error approving payment:", error);
            alert("Error approving payment. Please try again.");
        }
    };

    const handleRejectPayment = async (userId) => {
        try {
            const type =
                activeTab === "Apprendre des cours" ? "user" : "application";
            await mockAPI.rejectPayment(userId, type);

            // Remove the rejected user/application from the list
            if (activeTab === "Apprendre des cours") {
                setUsers((prev) => prev.filter((user) => user.id !== userId));
            } else {
                setApplications((prev) =>
                    prev.filter((app) => app.id !== userId)
                );
            }

            // Show success message
            alert("Payment rejected successfully!");

            // Reload data to update pagination
            if (activeTab === "Apprendre des cours") {
                loadUsers();
            } else {
                loadApplications();
            }
        } catch (error) {
            console.error("Error rejecting payment:", error);
            alert("Error rejecting payment. Please try again.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPaymentProof(null);
        setSelectedUserName("");
        setSelectedUserId(null);
    };

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

    useEffect(() => {
        loadUsers();
        loadApplications();
    }, []);

    return (
        <div className="w-full bg-gray-50 p-4">
            <PaymentProofModal
                isOpen={isModalOpen}
                onClose={closeModal}
                Image={selectedPaymentProof}
                userName={selectedUserName}
                userId={selectedUserId}
                onApprove={handleApprovePayment}
                onReject={handleRejectPayment}
            />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Payment Approvals
                </h1>
                <p className="text-gray-600">
                    Review and approve pending payments
                </p>
            </div>

            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "Apprendre des cours"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab("Apprendre des cours")}
                >
                    Courses ({users.length})
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "Applications"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab("Applications")}
                >
                    Applications ({applications.length})
                </button>
            </div>

            <div className="mb-4 flex gap-4">
                <select
                    value={filters.paymentStatus}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            paymentStatus: e.target.value,
                        }))
                    }
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                </select>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            search: e.target.value,
                        }))
                    }
                    placeholder="Search by name, email, or course..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200">
                {activeTab === "Apprendre des cours" ? (
                    <UsersCourseTablePayments
                        users={users}
                        setUsers={setUsers}
                        loading={loading}
                        pagination={usersPagination}
                        onPageChange={handleUsersPageChange}
                        onViewPaymentProof={handleViewPaymentProof}
                    />
                ) : (
                    <ApplicationsTablePayments
                        applications={applications}
                        setApplications={setApplications}
                        loading={loadingApplications}
                        pagination={appsPagination}
                        onPageChange={handleAppsPageChange}
                        onViewPaymentProof={handleViewPaymentProof}
                    />
                )}
            </div>
        </div>
    );
};

export default AllPayments;
