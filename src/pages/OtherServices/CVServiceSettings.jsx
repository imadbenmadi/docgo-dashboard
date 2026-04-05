import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";
import Swal from "sweetalert2";
import "./OtherServices.css";

export default function CVServiceSettings() {
  const { t } = useTranslation();
  const [cvService, setCVService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "Professional CV Creation",
    description: "",
    introductoryImage: "",
    introductoryVideo: "",
    estimatedPrice: "",
  });

  useEffect(() => {
    fetchCVService();
  }, []);

  const fetchCVService = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/Admin/OtherServices/cv-service");
      if (response.data.data) {
        setCVService(response.data.data);
        setFormData({
          title: response.data.data.title || "",
          description: response.data.data.description || "",
          introductoryImage: response.data.data.introductoryImage || "",
          introductoryVideo: response.data.data.introductoryVideo || "",
          estimatedPrice: response.data.data.estimatedPrice || "",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load CV service settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      description: val || "",
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await axios.patch(
        "/api/Admin/OtherServices/cv-service",
        formData,
      );

      if (response.data.success) {
        setCVService(response.data.data);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "CV service updated successfully",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to save CV service",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await axios.patch(
        "/api/Admin/OtherServices/cv-service/toggle-status",
      );

      if (response.data.success) {
        setCVService(response.data.data);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to toggle status",
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Professional CV Creation Service</h1>
        <button
          onClick={handleToggleStatus}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            cvService?.isActive
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
        >
          {cvService?.isActive ? "Active" : "Inactive"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Introductory Image */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Introductory Image URL
          </label>
          <input
            type="text"
            name="introductoryImage"
            value={formData.introductoryImage}
            onChange={handleInputChange}
            placeholder="https://example.com/cv-image.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.introductoryImage && (
            <img
              src={formData.introductoryImage}
              alt="Preview"
              className="mt-2 max-w-xs h-32 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Introductory Video */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Introductory Video URL
          </label>
          <input
            type="text"
            name="introductoryVideo"
            value={formData.introductoryVideo}
            onChange={handleInputChange}
            placeholder="https://example.com/cv-video.mp4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Estimated Price */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Estimated Price (USD)
          </label>
          <input
            type="number"
            name="estimatedPrice"
            value={formData.estimatedPrice}
            onChange={handleInputChange}
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Service Description (Rich Text)
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              height={300}
              preview="live"
              hideToolbar={false}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => fetchCVService()}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-400"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
