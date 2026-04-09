import {
  Award,
  RefreshCw,
  User,
  BookOpen,
  Calendar,
  QrCode,
  Eye,
  Layout,
  Plus,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import AdminCertificatesAPI from "../../API/AdminCertificates";

const AdminCertificates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "templates" ? "templates" : "certificates",
  );
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCertificates: 0,
  });
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  // Templates state
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

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

  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const res = await AdminCertificatesAPI.getTemplates();
      setTemplates(res.data.templates || []);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    if (activeTab === "templates") fetchTemplates();
  }, [activeTab, fetchTemplates]);

  const handleDeleteTemplate = async (tpl) => {
    const result = await Swal.fire({
      title: "Delete Template?",
      text: `Delete template "${tpl.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await AdminCertificatesAPI.deleteTemplate(tpl.id);
      toast.success("Template deleted");
      fetchTemplates();
    } catch {
      toast.error("Failed to delete template");
    }
  };

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
              {activeTab === "certificates"
                ? "Manage issued course certificates"
                : "Design & manage certificate templates"}
            </p>
          </div>
        </div>
        {activeTab === "certificates" ? (
          <button
            onClick={fetchCertificates}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        ) : (
          <button
            onClick={() => navigate("/CertificateDesigner")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
        <button
          onClick={() => setActiveTab("certificates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "certificates"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Award className="w-4 h-4" />
          Issued Certificates
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "templates"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Layout className="w-4 h-4" />
          Templates
          {templates.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full">
              {templates.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Templates Tab ── */}
      {activeTab === "templates" && (
        <div>
          {templatesLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center p-16">
              <Layout className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium mb-1">No templates yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Create a template to customize your certificates
              </p>
              <button
                onClick={() => navigate("/CertificateDesigner")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                New Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
                >
                  {/* Preview image */}
                  <div className="relative h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {tpl.previewImage ? (
                      <img
                        src={tpl.previewImage}
                        alt={tpl.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Layout className="w-10 h-10 text-gray-300" />
                    )}
                    {tpl.isDefault && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                        <Star className="w-3 h-3" />
                        Default
                      </span>
                    )}
                    {tpl.courseId && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        Course #{tpl.courseId}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {tpl.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {tpl.canvasWidth} × {tpl.canvasHeight}px ·{" "}
                      {tpl.orientation || "landscape"}
                    </p>
                    {!tpl.isDefault && !tpl.courseId && (
                      <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                        ⚠ Not linked — set as Default or link to a course
                      </p>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="px-3 pb-3 flex gap-2">
                    <button
                      onClick={() => navigate(`/CertificateDesigner/${tpl.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tpl)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Certificates Tab ── */}
      {activeTab === "certificates" && (
        <div>
          {/* Filters summary */}
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
      )}
    </div>
  );
};

export default AdminCertificates;
