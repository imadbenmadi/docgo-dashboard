import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import axios from "axios";
import CertificateDesigner from "../../components/CertificateDesigner";

/**
 * ============================================================================
 * CERTIFICATE DESIGNER PAGE
 * ============================================================================
 * Full-page view for creating and editing certificate templates
 * Integrates CertificateDesigner component with backend API
 */

const CertificateDesignerPage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(!!templateId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [assignToCourse, setAssignToCourse] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    }
    fetchCourses();
  }, [templateId]);

  const fetchTemplate = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/Admin/certificates/templates/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTemplate(response.data.data);
      setIsDefault(response.data.data.isDefault);
      setError(null);
    } catch {
      setError("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      // Fetch courses that need certificates
      const response = await axios.get(
        "/Admin/certificates/courses-without-templates",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setCourses(response.data.data || []);
    } catch {
      setCourses([]);
    }
  };

  const handleSave = async (designData) => {
    try {
      setSaving(true);
      setError(null);

      if (assignToCourse && !courseId) {
        setError("Please select a course to assign this template.");
        return;
      }

      const payload = {
        ...designData,
        isDefault,
        courseId: assignToCourse ? courseId : null,
      };

      if (templateId) {
        // Update existing template
        await axios.put(
          `/Admin/certificates/templates/${templateId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      } else {
        // Create new template
        await axios.post("/Admin/certificates/templates", payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      alert(
        templateId
          ? "Template updated successfully!"
          : "Template created successfully!",
      );

      // Redirect to certificates page
      setTimeout(() => {
        navigate("/Certificates");
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to save template";
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading template...</span>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-red-900">{error}</h2>
              <button
                onClick={() => navigate("/Certificates")}
                className="mt-2 text-red-700 hover:text-red-800 underline"
              >
                Go back to certificates
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full px-6 py-4">
          <button
            onClick={() => navigate("/Certificates")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Certificates
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {templateId
              ? "Edit Certificate Template"
              : "Create New Certificate"}
          </h1>
        </div>
      </div>

      {/* Options Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="max-w-full flex flex-wrap items-center gap-6">
          {/* Default Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              disabled={template?.isDefault}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
            />
            <span className="text-gray-700 font-medium">
              Set as Default Certificate
            </span>
            <span className="text-xs text-gray-600">
              (Used for all courses without a specific template)
            </span>
          </label>

          {/* Assign to Course */}
          {courses.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assignToCourse}
                  onChange={(e) => setAssignToCourse(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                />
                <span className="text-gray-700 font-medium">
                  Assign to Course:
                </span>
              </label>
              {assignToCourse && (
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.Title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 mx-6 mt-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Designer */}
      <div className="p-6">
        <CertificateDesigner initialTemplate={template} onSave={handleSave} />
      </div>

      {/* Saving Indicator */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-gray-700">Saving template...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateDesignerPage;
