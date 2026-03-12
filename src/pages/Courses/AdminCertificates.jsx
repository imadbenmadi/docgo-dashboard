import {
  Award,
  RefreshCw,
  CheckCircle,
  User,
  BookOpen,
  Calendar,
  QrCode,
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AdminCertificatesAPI from "../../API/AdminCertificates";

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCertificates: 0,
  });
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  const Frontend_URL =
    import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminCertificatesAPI.getAll(filters);
      setCertificates(res.data.certificates || []);
      setPagination(res.data.pagination || {});
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleViewImage = (cert) => {
    // Use the real backend URL directly — this is a public image endpoint.
    // getApiBaseUrl() returns "" in dev (proxy mode), which causes Vite's
    // spaFallbackPlugin to intercept the new-tab navigation and serve index.html.
    const backendBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const url = `${backendBase}/verify/certificate/${cert.certificateId}/image`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyVerifyLink = (cert) => {
    const url =
      cert.verificationUrl ||
      `${Frontend_URL}/verify/certificate/${cert.certificateId}`;
    navigator.clipboard.writeText(url);
    toast.success("Verification link copied!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-7 h-7 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
            <p className="text-sm text-gray-500">
              Manage issued course certificates
            </p>
          </div>
        </div>
        <button
          onClick={fetchCertificates}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-gray-500 font-medium">
          All certificates
        </span>
        <span className="text-sm text-gray-400 ml-auto">
          {pagination.totalCertificates} total
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center p-12 text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No certificates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Student
                  </th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Course
                  </th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Issued
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {certificates.map((cert) => {
                  const user = cert.certUser || {};
                  const course = cert.certCourse || {};
                  const meta = cert.metadata || {};
                  return (
                    <tr
                      key={cert.certificateId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {user.FirstName} {user.LastName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.Email}
                            </p>
                            {meta.studentName &&
                              meta.studentName !==
                                `${user.FirstName} ${user.LastName}` && (
                                <p className="text-xs text-purple-500 italic">
                                  as &quot;
                                  {meta.studentName}
                                  &quot;
                                </p>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-800">
                              {course.Title}
                            </p>
                            {course.Category && (
                              <p className="text-xs text-gray-400">
                                {course.Category}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(cert.issueDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                        {meta.averageQuizScore != null && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Score: {Math.round(meta.averageQuizScore)}%
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {(cert.metadata?.imagePath || cert.pdfPath) && (
                            <button
                              onClick={() => handleViewImage(cert)}
                              title="View certificate image"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => copyVerifyLink(cert)}
                            title="Copy verification link"
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
