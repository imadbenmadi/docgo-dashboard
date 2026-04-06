import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";
import MDEditor from "@uiw/react-md-editor";

export default function InternshipManagement() {
  const { t } = useTranslation();
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    field: "",
    type: "work",
    isPaid: false,
    price: "",
    currency: "USD",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    introductoryImage: "",
    introductoryVideo: "",
    companyName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    requirements: "",
  });

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/Admin/OtherServices/internships");
      setInternships(response.data.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load internships",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      field: "",
      type: "work",
      isPaid: false,
      price: "",
      currency: "USD",
      startDate: "",
      endDate: "",
      applicationDeadline: "",
      introductoryImage: "",
      introductoryVideo: "",
      companyName: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      requirements: "",
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDescriptionChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      description: val || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.location) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Title, description, and location are required",
      });
      return;
    }

    try {
      if (editingId) {
        const response = await apiClient.patch(
          `/Admin/OtherServices/internships/${editingId}`,
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Internship updated successfully",
        });
      } else {
        const response = await apiClient.post(
          "/Admin/OtherServices/internships",
          formData,
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Internship created successfully",
        });
      }
      resetForm();
      setShowForm(false);
      await fetchInternships();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to save internship",
      });
    }
  };

  const handleEdit = (internship) => {
    setFormData(internship);
    setEditingId(internship.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: "Are you sure you want to delete this internship?",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Admin/OtherServices/internships/${id}`);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Internship deleted successfully",
        });
        await fetchInternships();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete internship",
        });
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Internship Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          {showForm ? "Cancel" : "Add New Internship"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? "Edit Internship" : "Create New Internship"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Field
                </label>
                <input
                  type="text"
                  name="field"
                  value={formData.field}
                  onChange={handleInputChange}
                  placeholder="e.g., Marketing, IT, HR"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">Is Paid</span>
                </label>
              </div>

              {formData.isPaid && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Application Deadline
                </label>
                <input
                  type="datetime-local"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Introductory Image URL
                </label>
                <input
                  type="text"
                  name="introductoryImage"
                  value={formData.introductoryImage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Introductory Video URL
                </label>
                <input
                  type="text"
                  name="introductoryVideo"
                  value={formData.introductoryVideo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description *
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  height={300}
                  preview="live"
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Requirements
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={formData.requirements}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: val || "",
                    }))
                  }
                  height={200}
                  preview="live"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                {editingId ? "Update Internship" : "Create Internship"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Internships List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{internship.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {internship.companyName} • {internship.location}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Type: {internship.type} •{" "}
                    {internship.isPaid ? `$${internship.price}` : "Unpaid"}
                  </p>
                  {internship.startDate && (
                    <p className="text-gray-600 text-sm">
                      {new Date(internship.startDate).toLocaleDateString()} -{" "}
                      {new Date(internship.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(internship)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(internship.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
