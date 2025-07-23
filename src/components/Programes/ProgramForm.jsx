import React, { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import TextEditor from "./TextEditor";

const ProgramForm = ({
  isEditing,
  selectedProgram,
  handleSubmit,
  setCurrentPage,
  setIsEditing,
  setSelectedProgram,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    country: "",
    duration: "",
    university: "",
    description: "",
    requirements: "",
    applicationDeadline: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const descriptionRef = useRef(null);
  const requirementsRef = useRef(null);

  useEffect(() => {
    if (isEditing && selectedProgram) {
      setFormData(selectedProgram);
    }
  }, [isEditing, selectedProgram]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Program title is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required";
    if (!formData.university.trim())
      newErrors.university = "University is required";

    const description = descriptionRef.current?.innerHTML || "";
    const requirements = requirementsRef.current?.innerHTML || "";

    // if (!description.trim() || description === "<br>") {
    //   newErrors.description = "Description is required";
    // }
    // if (!requirements.trim() || requirements === "<br>") {
    //   newErrors.requirements = "Requirements are required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const description = descriptionRef.current?.innerHTML || "";
    const requirements = requirementsRef.current?.innerHTML || "";

    const submissionData = {
      ...formData,
      description,
      requirements,
      id: isEditing ? selectedProgram.id : Date.now(),
    };

    handleSubmit(submissionData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0">
          <div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 leading-tight">
              {isEditing ? "Edit Program" : "Add Program"}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 rounded-full"></div>
          </div>

          <button
            onClick={() => {
              setCurrentPage("programs");
              setIsEditing(false);
              setSelectedProgram(null);
            }}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            Back to Programs
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Program Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Program Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter program title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-2">{errors.title}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Price *
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., $25,000"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-2">{errors.price}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Country *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                  errors.country ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter country"
              />
              {errors.country && (
                <p className="text-red-500 text-sm mt-2">{errors.country}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Duration *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                  errors.duration ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 1 Year, 2 Years"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-2">{errors.duration}</p>
              )}
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                University *
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                  errors.university ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter university name"
              />
              {errors.university && (
                <p className="text-red-500 text-sm mt-2">{errors.university}</p>
              )}
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Application Deadline
              </label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicationDeadline: e.target.value,
                  })
                }
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-10">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Program Image
            </label>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                <Upload size={20} />
                Upload Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {formData.image && (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description Editor */}
          <TextEditor
            label="Program Description"
            content={formData.description}
            onChange={(content) =>
              setFormData({ ...formData, description: content })
            }
            error={errors.description}
            editorRef={descriptionRef}
          />

          {/* Requirements Editor */}
          <TextEditor
            label="Requirements"
            content={formData.requirements}
            onChange={(content) =>
              setFormData({ ...formData, requirements: content })
            }
            error={errors.requirements}
            editorRef={requirementsRef}
          />

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] font-bold text-lg shadow-xl"
          >
            {isEditing ? "Update Program" : "Create Program"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramForm;
