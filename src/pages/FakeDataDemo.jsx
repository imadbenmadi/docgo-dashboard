import React from "react";
import {
    getFakeSecurityData,
    getEmptySecurityData,
    sampleSecurityData,
} from "../data/fakeSecurityData";

const FakeDataDemo = () => {
    const [data, setData] = React.useState(sampleSecurityData);

    const generateNewData = () => {
        const newData = getFakeSecurityData({
            totalLogins: Math.floor(Math.random() * 100) + 50,
            currentPage: 1,
            limit: 20,
        });
        setData(newData);
    };

    const generateFilteredData = (filters) => {
        const filteredData = getFakeSecurityData({
            totalLogins: 100,
            currentPage: 1,
            limit: 20,
            filters,
        });
        setData(filteredData);
    };

    const showEmptyData = () => {
        setData(getEmptySecurityData());
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Security Fake Data Demo
                </h1>
                <p className="text-gray-600 mb-6">
                    This demo shows the fake data generator for the Security
                    component. You can generate different datasets and see how
                    the data structure works.
                </p>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        onClick={generateNewData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Generate New Data
                    </button>
                    <button
                        onClick={() =>
                            generateFilteredData({ isThreat: "true" })
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Show Only Threats
                    </button>
                    <button
                        onClick={() =>
                            generateFilteredData({ status: "SUCCESS" })
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Show Only Success
                    </button>
                    <button
                        onClick={() =>
                            generateFilteredData({ threatLevel: "HIGH" })
                        }
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                        Show High Threats
                    </button>
                    <button
                        onClick={showEmptyData}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Empty State
                    </button>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-600">
                        Total Logins
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {data.stats.totalLogins}
                    </p>
                    <p className="text-sm text-gray-500">
                        {data.stats.successRate}% success
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <h3 className="text-sm font-medium text-gray-600">
                        Threats
                    </h3>
                    <p className="text-3xl font-bold text-red-600">
                        {data.stats.threatenedLogins}
                    </p>
                    <p className="text-sm text-gray-500">
                        {data.stats.threatRate}% threat rate
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-gray-600">
                        Last 24h
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                        {data.stats.recentActivity?.last24Hours}
                    </p>
                    <p className="text-sm text-gray-500">Recent attempts</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="text-sm font-medium text-gray-600">
                        Unique IPs
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">
                        {data.stats.uniqueIPs}
                    </p>
                    <p className="text-sm text-gray-500">Different locations</p>
                </div>
            </div>

            {/* Sample Data Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Sample Login Attempts ({data.logins.length} items)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Admin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Threat
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.logins.slice(0, 10).map((login) => (
                                <tr
                                    key={login.id}
                                    className={
                                        login.isThreat
                                            ? "bg-red-50"
                                            : "hover:bg-gray-50"
                                    }
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {login.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(
                                            login.timestamp
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {login.admin?.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                login.loginStatus === "SUCCESS"
                                                    ? "text-green-600 bg-green-100"
                                                    : login.loginStatus ===
                                                      "FAILED"
                                                    ? "text-red-600 bg-red-100"
                                                    : "text-red-800 bg-red-200"
                                            }`}
                                        >
                                            {login.loginStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {login.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {login.isThreat ? (
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    login.threatLevel === "LOW"
                                                        ? "text-yellow-600 bg-yellow-100"
                                                        : login.threatLevel ===
                                                          "MEDIUM"
                                                        ? "text-orange-600 bg-orange-100"
                                                        : login.threatLevel ===
                                                          "HIGH"
                                                        ? "text-red-600 bg-red-100"
                                                        : "text-red-800 bg-red-200"
                                                }`}
                                            >
                                                {login.threatLevel}
                                            </span>
                                        ) : (
                                            <span className="text-green-600 text-xs">
                                                Normal
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Info */}
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                    Pagination Data:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Current Page:</span>
                        <span className="ml-2 font-medium">
                            {data.pagination.currentPage}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Total Pages:</span>
                        <span className="ml-2 font-medium">
                            {data.pagination.totalPages}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Total Count:</span>
                        <span className="ml-2 font-medium">
                            {data.pagination.totalCount}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Has Next:</span>
                        <span className="ml-2 font-medium">
                            {data.pagination.hasNext ? "Yes" : "No"}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Has Prev:</span>
                        <span className="ml-2 font-medium">
                            {data.pagination.hasPrev ? "Yes" : "No"}
                        </span>
                    </div>
                </div>
            </div>

            {/* JSON Data Preview */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sample Data Structure (First Login Item)
                </h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(data.logins[0] || {}, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default FakeDataDemo;
