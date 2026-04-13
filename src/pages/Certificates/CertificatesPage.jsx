import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Download,
  Loader,
} from "lucide-react";
import axios from "axios";

/**
 * ============================================================================
 * CERTIFICATE TEMPLATES MANAGEMENT PAGE
 * ============================================================================
 * Admin dashboard page to view, edit, delete, and manage certificate templates
 */

const CertificatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/Admin/certificates/templates", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTemplates(response.data.data || []);
      setError(null);
    } catch {
      setError("Failed to load certificate templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId, templateName) => {
    const result = await Swal.fire({
      title: "Delete Template?",
      text: `Are you sure you want to delete "${templateName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await axios.delete(`/Admin/certificates/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTemplates(templates.filter((t) => t.id !== templateId));
      Swal.fire({
        title: "Success!",
        text: "Template deleted successfully",
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.error || "Failed to delete template",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleSetDefault = async (templateId) => {
    try {
      await axios.put(
        `/Admin/certificates/templates/${templateId}/set-default`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      fetchTemplates();
      alert("Default certificate updated successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to set default template");
    }
  };

  const handleDownloadPreview = (template) => {
    if (!template.previewImage) {
      alert("No preview available for this template");
      return;
    }

    const link = document.createElement("a");
    link.href = template.previewImage;
    link.download = `${template.name}-preview.png`;
    link.click();
  };

  const defaultTemplate = templates.find((t) => t.isDefault);
  const courseTemplates = templates.filter((t) => t.courseId && !t.isDefault);
  const filteredTemplates =
    filter === "default"
      ? [defaultTemplate].filter(Boolean)
      : filter === "course"
        ? courseTemplates
        : templates;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
            <p className="text-gray-600 mt-2">
              Manage certificate templates for your courses
            </p>
          </div>
          <button
            onClick={() => navigate("/Certificates/Designer")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Template
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading templates...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && templates.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Templates Found
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first certificate template to get started
            </p>
            <button
              onClick={() => navigate("/Certificates/Designer")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Template
            </button>
          </div>
        )}

        {/* Filters */}
        {!loading && templates.length > 0 && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              All ({templates.length})
            </button>
            <button
              onClick={() => setFilter("default")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "default"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Default ({defaultTemplate ? 1 : 0})
            </button>
            <button
              onClick={() => setFilter("course")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "course"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Course-Specific ({courseTemplates.length})
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Preview Image */}
                <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {template.previewImage ? (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {template.canvasWidth}x{template.canvasHeight}px
                      </p>
                    </div>
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>

                  {template.Course && (
                    <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                      <span className="text-blue-700 font-medium">
                        Course: {template.Course.Title}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/Certificates/Edit/${template.id}`)
                      }
                      className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-lg transition flex items-center justify-center gap-1"
                      title="Edit template"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDownloadPreview(template)}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition flex items-center justify-center gap-1"
                      title="Download preview"
                    >
                      <Download className="w-4 h-4" />
                      Preview
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={() => handleSetDefault(template.id)}
                        className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm rounded-lg transition"
                        title="Set as default"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(template.id, template.name)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition"
                      title="Delete template"
                      disabled={template.isDefault}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredTemplates.length === 0 && templates.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              No templates match the selected filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
