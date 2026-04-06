/**
 * ============================================================================
 * ADMIN - HISTORICAL PAYMENTS PAGE
 * ============================================================================
 * Admin dashboard page to view all payment history
 * Grouped by users, filterable by status, course, program
 * Shows all payment details with download functionality
 */

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Check,
  X,
  Clock,
  Eye,
} from "lucide-react";
import apiClient from "../../utils/apiClient";

const HistoricalPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "all", // all, pending, approved, rejected
    itemType: "all", // all, course, program
    userId: "",
    itemId: "",
  });

  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
  });

  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.itemType !== "all")
        params.append("itemType", filters.itemType);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.itemId) params.append("itemId", filters.itemId);
      params.append("limit", pagination.limit);
      params.append("offset", pagination.offset);

      const response = await apiClient.get(
        `/Admin/payment-history/all?${params}`,
      );

      if (response.data.success) {
        setPayments(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch payments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.offset]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  // Handle download screenshot
  const handleDownload = async (paymentId, paymentName) => {
    try {
      const response = await apiClient.get(
        `/Admin/payment-history/${paymentId}/download-screenshot`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payment-${paymentName || paymentId}.png`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download payment screenshot");
      console.error(err);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <Check className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.offset / pagination.limit + 1;

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Historical Payments
          </h1>
          <p className="text-gray-600">
            View all payment history (CCP & PayPal) - All payments preserved for
            legal compliance
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Item Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Type
              </label>
              <select
                value={filters.itemType}
                onChange={(e) => handleFilterChange("itemType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="program">Programs</option>
              </select>
            </div>

            {/* User ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                placeholder="Enter user ID..."
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Item ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item ID
              </label>
              <input
                type="text"
                placeholder="Enter item ID..."
                value={filters.itemId}
                onChange={(e) => handleFilterChange("itemId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <React.Fragment key={payment.id}>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {payment.user.firstName} {payment.user.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {payment.user.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {payment.item.title || "Deleted Item"}
                              </p>
                              <p className="text-sm text-gray-500 capitalize">
                                {payment.itemType}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {payment.amount} {payment.currency}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                payment.status,
                              )}`}
                            >
                              {getStatusIcon(payment.status)}
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(payment.uploadDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                setExpandedRow(
                                  expandedRow === payment.id
                                    ? null
                                    : payment.id,
                                )
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedRow === payment.id && (
                          <tr className="bg-blue-50">
                            <td colSpan="6" className="px-6 py-4">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">
                                      CCP Number
                                    </p>
                                    <p className="text-gray-900 font-mono">
                                      {payment.ccpNumber || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">
                                      Phone
                                    </p>
                                    <p className="text-gray-900">
                                      {payment.phoneNumber || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">
                                      Transaction ID
                                    </p>
                                    <p className="text-gray-900 font-mono text-sm">
                                      {payment.transactionId || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">
                                      Verified By
                                    </p>
                                    <p className="text-gray-900">
                                      {payment.verifiedBy || "Not verified"}
                                    </p>
                                  </div>
                                </div>

                                {payment.rejectionReason && (
                                  <div className="bg-red-50 border border-red-200 rounded p-3">
                                    <p className="text-xs font-medium text-red-700 uppercase mb-1">
                                      Rejection Reason
                                    </p>
                                    <p className="text-red-800">
                                      {payment.rejectionReason}
                                    </p>
                                  </div>
                                )}

                                {payment.adminNotes && (
                                  <div className="bg-gray-100 border border-gray-300 rounded p-3">
                                    <p className="text-xs font-medium text-gray-700 uppercase mb-1">
                                      Admin Notes
                                    </p>
                                    <p className="text-gray-800">
                                      {payment.adminNotes}
                                    </p>
                                  </div>
                                )}

                                <div className="flex gap-3">
                                  {payment.hasScreenshot && (
                                    <button
                                      onClick={() =>
                                        handleDownload(
                                          payment.id,
                                          payment.ccpNumber,
                                        )
                                      }
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download Screenshot
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {pagination.offset + 1} to{" "}
                  {Math.min(
                    pagination.offset + pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} payments
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        offset: Math.max(0, prev.offset - prev.limit),
                      }))
                    }
                    disabled={pagination.offset === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        offset: prev.offset + prev.limit,
                      }))
                    }
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalPaymentsPage;
