import React, { useState } from "react";
import PropTypes from "prop-types";
import apiClient from "../utils/apiClient";
import {
    FiDatabase,
    FiTrash2,
    FiInfo,
    FiLoader,
    FiCheck,
    FiAlertTriangle,
    FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const DataSeederPanel = ({ onDataSeeded }) => {
    const [loading, setLoading] = useState(false);
    const [seedingInfo, setSeedingInfo] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    // Fetch seeding information
    const fetchSeedingInfo = async () => {
        try {
            const response = await apiClient.get("/Admin/seeding-info");
            setSeedingInfo(response.data);
        } catch (error) {
            console.error("Error fetching seeding info:", error);
            toast.error("Failed to load seeding information");
        }
    };

    // Seed login data
    const handleSeedData = async (count = 150) => {
        if (
            !window.confirm(
                `Are you sure you want to seed ${count} login records? This will clear existing data.`
            )
        ) {
            return;
        }

        setLoading(true);
        try {
            await apiClient.post("/Admin/seed-logins", { count });
            toast.success(`Successfully seeded ${count} login records!`);

            // Refresh seeding info
            await fetchSeedingInfo();

            // Notify parent component to refresh data
            if (onDataSeeded) {
                onDataSeeded();
            }
        } catch (error) {
            console.error("Error seeding data:", error);
            toast.error("Failed to seed login data");
        } finally {
            setLoading(false);
        }
    };

    // Clear all login data
    const handleClearData = async () => {
        if (
            !window.confirm(
                "Are you sure you want to clear ALL login records? This action cannot be undone!"
            )
        ) {
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.delete("/Admin/clear-logins");
            toast.success(
                `Cleared ${response.data.deletedCount} login records`
            );

            // Refresh seeding info
            await fetchSeedingInfo();

            // Notify parent component to refresh data
            if (onDataSeeded) {
                onDataSeeded();
            }
        } catch (error) {
            console.error("Error clearing data:", error);
            toast.error("Failed to clear login data");
        } finally {
            setLoading(false);
        }
    };

    // Load seeding info on first render
    React.useEffect(() => {
        fetchSeedingInfo();
    }, []);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <FiDatabase className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Database Seeding
                    </h3>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Show seeding information"
                    >
                        <FiInfo className="h-4 w-4" />
                    </button>
                </div>

                <button
                    onClick={fetchSeedingInfo}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title="Refresh information"
                >
                    <FiRefreshCw className="h-4 w-4" />
                </button>
            </div>

            {/* Current Status */}
            {seedingInfo && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-gray-600">
                            Total Logins
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                            {seedingInfo.currentStats.totalLogins.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-gray-600">
                            Admin Accounts
                        </div>
                        <div className="text-xl font-bold text-green-600">
                            {seedingInfo.currentStats.totalAdmins}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-gray-600">Data Status</div>
                        <div
                            className={`text-xl font-bold ${
                                seedingInfo.currentStats.hasData
                                    ? "text-green-600"
                                    : "text-gray-400"
                            }`}
                        >
                            {seedingInfo.currentStats.hasData
                                ? "Available"
                                : "Empty"}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-gray-600">Date Range</div>
                        <div className="text-sm font-medium text-gray-700">
                            {seedingInfo.currentStats.hasData
                                ? "Last 30 days"
                                : "No data"}
                        </div>
                    </div>
                </div>
            )}

            {/* Information Panel */}
            {showInfo && seedingInfo && (
                <div className="bg-white p-4 rounded-lg border mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                        Seeding Features:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        {seedingInfo.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <FiCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-start gap-2">
                            <FiAlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <strong>Note:</strong>{" "}
                                {seedingInfo.seedingOptions.description}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => handleSeedData(150)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <FiLoader className="h-4 w-4 animate-spin" />
                    ) : (
                        <FiDatabase className="h-4 w-4" />
                    )}
                    Seed 150 Records
                </button>

                <button
                    onClick={() => handleSeedData(500)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <FiLoader className="h-4 w-4 animate-spin" />
                    ) : (
                        <FiDatabase className="h-4 w-4" />
                    )}
                    Seed 500 Records
                </button>

                <button
                    onClick={() => handleSeedData(50)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <FiLoader className="h-4 w-4 animate-spin" />
                    ) : (
                        <FiDatabase className="h-4 w-4" />
                    )}
                    Seed 50 Records
                </button>

                {seedingInfo?.currentStats.hasData && (
                    <button
                        onClick={handleClearData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <FiLoader className="h-4 w-4 animate-spin" />
                        ) : (
                            <FiTrash2 className="h-4 w-4" />
                        )}
                        Clear All Data
                    </button>
                )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
                💡 Tip: Start with 150 records for testing, use 500+ for
                performance testing
            </div>
        </div>
    );
};

DataSeederPanel.propTypes = {
    onDataSeeded: PropTypes.func,
};

export default DataSeederPanel;
