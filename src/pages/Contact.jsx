import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import ContactMessages from "../components/Contact/ContactMessages";
import ContactStatistics from "../components/Contact/ContactStatistics";

const Contact = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("messages");

    // Update active tab based on current path
    useEffect(() => {
        const path = location.pathname.split("/").pop();
        if (["messages", "statistics"].includes(path)) {
            setActiveTab(path);
        } else if (
            location.pathname === "/Contact" ||
            location.pathname.endsWith("/Contact")
        ) {
            setActiveTab("messages");
        }
    }, [location]);

    const tabs = [
        {
            id: "messages",
            name: "All Messages",
            icon: EnvelopeIcon,
            path: "/Contact",
            description: "View and manage all contact messages",
            count: 0, // Will be updated with real data
        },
        {
            id: "statistics",
            name: "Analytics",
            icon: ChartBarIcon,
            path: "/Contact/statistics",
            description: "Contact message statistics and insights",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mr-3" />
                                Contact Management
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage customer inquiries and support requests
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex space-x-4">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Urgent
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            0
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Pending
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            0
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Resolved
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            0
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                        {tab.count > 0 && (
                                            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                                                {tab.count}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm">
                    <Routes>
                        <Route index element={<ContactMessages />} />
                        <Route
                            path="statistics"
                            element={<ContactStatistics />}
                        />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Contact;
