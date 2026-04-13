import { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";
import { FileText, Save, ToggleLeft, ToggleRight } from "lucide-react";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";
import { buildApiUrl } from "../../utils/apiBaseUrl";

export default function CVServiceSettings() {
  const [cvService, setCVService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "Professional CV Creation",
    description: "",
    introductoryImage: "",
    introductoryVideo: "",
  });

  const [introImageFile, setIntroImageFile] = useState(null);
  const [introVideoFile, setIntroVideoFile] = useState(null);
  const [introImagePreviewUrl, setIntroImagePreviewUrl] = useState(null);

  useEffect(() => {
    fetchCVService();
  }, []);

  const fetchCVService = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/Admin/OtherServices/cv-service");
      if (response.data.data) {
        setCVService(response.data.data);
        setFormData({
          title: response.data.data.title || "",
          description: response.data.data.description || "",
          introductoryImage: response.data.data.introductoryImage || "",
          introductoryVideo: response.data.data.introductoryVideo || "",
        });
        setIntroImageFile(null);
        setIntroVideoFile(null);
        setIntroImagePreviewUrl(null);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger les paramètres du CV Service",
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
      const payload = new FormData();
      payload.append("title", formData.title || "");
      payload.append("description", formData.description || "");
      if (introImageFile) payload.append("introductoryImage", introImageFile);
      if (introVideoFile) payload.append("introductoryVideo", introVideoFile);

      const response = await apiClient.patch(
        "/Admin/OtherServices/cv-service",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.data.success) {
        setCVService(response.data.data);
        setFormData((prev) => ({
          ...prev,
          title: response.data.data.title || "",
          description: response.data.data.description || "",
          introductoryImage: response.data.data.introductoryImage || "",
          introductoryVideo: response.data.data.introductoryVideo || "",
        }));
        setIntroImageFile(null);
        setIntroVideoFile(null);
        setIntroImagePreviewUrl(null);
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "CV Service mis à jour avec succès",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message || "Failed to save CV service",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await apiClient.patch(
        "/Admin/OtherServices/cv-service/toggle-status",
      );

      if (response.data.success) {
        setCVService(response.data.data);
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: response.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de changer le statut",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">CV Service</h2>
            <p className="text-sm text-gray-600">
              Configuration unique (un seul service global)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleStatus}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
            cvService?.isActive
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {cvService?.isActive ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
          {cvService?.isActive ? "Actif" : "Inactif"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <label className="block text-sm font-semibold text-blue-800 mb-2">
              Titre
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Titre du service"
            />
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <label className="block text-sm font-semibold text-purple-800 mb-2">
              Image d'introduction (upload)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setIntroImageFile(file);
                setIntroImagePreviewUrl(
                  file ? URL.createObjectURL(file) : null,
                );
              }}
              className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
            {introImagePreviewUrl || formData.introductoryImage ? (
              <img
                src={
                  introImagePreviewUrl ||
                  buildApiUrl(formData.introductoryImage)
                }
                alt="Intro"
                className="mt-3 w-full max-w-md h-40 object-cover rounded-xl border border-purple-200"
              />
            ) : null}
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl border border-cyan-200">
            <label className="block text-sm font-semibold text-cyan-800 mb-2">
              Vidéo d'introduction (upload)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setIntroVideoFile(file);
              }}
              className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
            {formData.introductoryVideo ? (
              <video
                className="mt-3 w-full max-w-md rounded-xl border border-cyan-200"
                controls
                src={buildApiUrl(formData.introductoryVideo)}
              />
            ) : null}
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
          <label className="block text-sm font-semibold text-violet-800 mb-2">
            Description du service
          </label>
          <div className="bg-white rounded-lg border border-violet-200 overflow-hidden">
            <RichTextEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Décrivez le service..."
              height="260px"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={() => fetchCVService()}
          className="px-6 py-2 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
          disabled={isSaving}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
