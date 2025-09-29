import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
    ChartBarIcon,
    UsersIcon,
    CurrencyDollarIcon,
    HeartIcon,
    EyeIcon,
    DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import OverviewStats from "../components/Statistics/OverviewStats";
import VisitAnalytics from "../components/Statistics/VisitAnalytics";
import ContentAnalytics from "../components/Statistics/ContentAnalytics";
import UserAnalytics from "../components/Statistics/UserAnalytics";
import PaymentAnalytics from "../components/Statistics/PaymentAnalytics";
import FavoritesAnalytics from "../components/Statistics/FavoritesAnalytics";

const Statistics = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("overview");

    // Update active tab based on current path
    useEffect(() => {
        const path = location.pathname.split("/").pop();
        if (
            [
                "overview",
                "visits",
                "content",
                "users",
                "payments",
                "favorites",
            ].includes(path)
        ) {
            setActiveTab(path);
        }
    }, [location]);

    const tabs = [
        {
            id: "overview",
            name: "Overview",
            icon: ChartBarIcon,
            path: "/statistics",
            description: "General platform statistics",
        },
        {
            id: "visits",
            name: "Page Analytics",
            icon: EyeIcon,
            path: "/statistics/visits",
            description: "Page visits and traffic analysis",
        },
        {
            id: "content",
            name: "Content Views",
            icon: DocumentDuplicateIcon,
            path: "/statistics/content",
            description: "Course and program analytics",
        },
        {
            id: "users",
            name: "User Growth",
            icon: UsersIcon,
            path: "/statistics/users",
            description: "User registration and activity",
        },
        {
            id: "payments",
            name: "Revenue",
            icon: CurrencyDollarIcon,
            path: "/statistics/payments",
            description: "Payment and revenue analytics",
        },
        {
            id: "favorites",
            name: "Favorites",
            icon: HeartIcon,
            path: "/statistics/favorites",
            description: "Most favorited content",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Platform Statistics
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Comprehensive analytics and insights for your DocGo
                        platform
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <Link
                                        key={tab.id}
                                        to={tab.path}
                                        className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                            isActive
                                                ? "border-blue-500 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    >
                                        <Icon
                                            className={`-ml-0.5 mr-2 h-5 w-5 ${
                                                isActive
                                                    ? "text-blue-500"
                                                    : "text-gray-400 group-hover:text-gray-500"
                                            }`}
                                        />
                                        {tab.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm">
                    <Routes>
                        <Route index element={<OverviewStats />} />
                        <Route path="visits" element={<VisitAnalytics />} />
                        <Route path="content" element={<ContentAnalytics />} />
                        <Route path="users" element={<UserAnalytics />} />
                        <Route path="payments" element={<PaymentAnalytics />} />
                        <Route
                            path="favorites"
                            element={<FavoritesAnalytics />}
                        />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
