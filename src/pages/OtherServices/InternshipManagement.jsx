import { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";
import {
  Briefcase,
  Plus,
  X,
  Save,
  Pencil,
  Trash2,
  MapPin,
  Building2,
  DollarSign,
  RotateCcw,
  Search,
} from "lucide-react";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";

// What the form sends. The intro files go separately, as uploads.
const FIELDS = [
  "title",
  "description",
  "location",
  "field",
  "type",
  "isPaid",
  "price",
  "currency",
  "startDate",
  "endDate",
  "applicationDeadline",
  "companyName",
  "contactPerson",
  "contactEmail",
  "contactPhone",
  "requirements",
];

export default function InternshipManagement() {
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // Deleted internships are their own list, the way deleted courses are.
  const [showDeleted, setShowDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    field: "",
    type: "work",
    isPaid: false,
    price: "",
    currency: "DZD",
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

  // The public intro files, picked in the form and sent with it.
  const [introImageFile, setIntroImageFile] = useState(null);
  const [introVideoFile, setIntroVideoFile] = useState(null);

  // Debounced, so typing a word is one request rather than one per letter.
  useEffect(() => {
    const timer = setTimeout(fetchInternships, search ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted, search, fieldFilter, typeFilter]);

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        "/Admin/OtherServices/internships",
        {
          params: {
            deleted: showDeleted ? "true" : undefined,
            search: search.trim() || undefined,
            field: fieldFilter || undefined,
            type: typeFilter || undefined,
          },
        },
      );
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
      currency: "DZD",
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
    setIntroImageFile(null);
    setIntroVideoFile(null);
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

  const handleRequirementsChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      requirements: val || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Le titre est requis.",
      });
      return;
    }

    try {
      const body = new FormData();
      for (const key of FIELDS) {
        const value = formData[key];
        if (value === undefined || value === null) continue;
        body.append(key, value);
      }
      if (introImageFile) body.append("introductoryImage", introImageFile);
      if (introVideoFile) body.append("introductoryVideo", introVideoFile);

      if (editingId) {
        await apiClient.patch(
          `/Admin/OtherServices/internships/${editingId}`,
          body,
        );
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Stage mis à jour avec succès",
        });
      } else {
        await apiClient.post("/Admin/OtherServices/internships", body);
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Stage créé avec succès",
        });
      }
      resetForm();
      setShowForm(false);
      await fetchInternships();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message || "Failed to save internship",
      });
    }
  };

  const handleEdit = (internship) => {
    setFormData(internship);
    setIntroImageFile(null);
    setIntroVideoFile(null);
    setEditingId(internship.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Supprimer ce stage ?",
      text:
        "Il quitte le site. Les commandes et les accès déjà accordés sont " +
        "conservés, et le stage peut être restauré.",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!confirmed.isConfirmed) return;

    const done = (message) => {
      Swal.fire({ icon: "success", title: "Succès", text: message });
      fetchInternships();
    };

    try {
      const { data } = await apiClient.delete(
        `/Admin/OtherServices/internships/${id}`,
      );
      done(data?.message || "Stage supprimé");
    } catch (error) {
      const body = error?.response?.data;
      // The server refuses once when people hold it, and says who. Answering
      // that is the admin's decision.
      if (body?.code !== "HAS_PEOPLE") {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: body?.message || "Impossible de supprimer le stage",
        });
        return;
      }

      const again = await Swal.fire({
        icon: "warning",
        title: "Des personnes sont concernées",
        html:
          `${body.message}<br><br>` +
          "Supprimer quand même ? Rien de ce qu'elles ont payé n'est perdu.",
        showCancelButton: true,
        confirmButtonText: "Supprimer quand même",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#dc2626",
      });
      if (!again.isConfirmed) return;

      try {
        const { data } = await apiClient.delete(
          `/Admin/OtherServices/internships/${id}?confirm=true`,
        );
        done(data?.message || "Stage supprimé");
      } catch (e2) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: e2?.response?.data?.message || "Suppression impossible",
        });
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      const { data } = await apiClient.post(
        `/Admin/OtherServices/internships/${id}/restore`,
      );
      Swal.fire({
        icon: "success",
        title: "Restauré",
        text: data?.message || "Stage restauré",
      });
      fetchInternships();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error?.response?.data?.message || "Restauration impossible",
      });
    }
  };


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Internships
              </h2>
              <p className="text-sm text-gray-600">
                Créez et gérez plusieurs offres de stage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm((s) => !s);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
              showForm
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
            }`}
          >
            {showForm ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {showForm ? "Fermer" : "Ajouter un stage"}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un stage"
              className="w-56 rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <input
            type="text"
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            placeholder="Domaine"
            className="w-40 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tous les types</option>
            <option value="work">Travail</option>
            <option value="study">Étude</option>
          </select>
          <button
            type="button"
            onClick={() => setShowDeleted((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${
              showDeleted
                ? "bg-gray-900 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {showDeleted ? "Voir les stages actifs" : "Supprimés"}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? "Modifier le stage" : "Créer un stage"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Remplissez les informations principales et la description.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
                  placeholder="Titre du stage"
                />
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <label className="block text-sm font-semibold text-emerald-800 mb-2">
                  {/* Only the title is required now. A stage is often
                      created from an announcement that says where it is but
                      not much else, and the rest gets filled in later. */}
                  Localisation
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ville, pays..."
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <label className="block text-sm font-semibold text-purple-800 mb-2">
                  Entreprise
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  Domaine
                </label>
                <input
                  type="text"
                  name="field"
                  value={formData.field}
                  onChange={handleInputChange}
                  placeholder="Marketing, IT, RH..."
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm"
                >
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                </select>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200 flex items-center">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">Payant</span>
                </label>
              </div>

              {formData.isPaid && (
                <>
                  <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-xl border border-rose-200">
                    <label className="block text-sm font-semibold text-rose-800 mb-2">
                      Prix
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-rose-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-xl border border-rose-200">
                    <label className="block text-sm font-semibold text-rose-800 mb-2">
                      Devise
                    </label>
                    <input
                      type="text"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                      placeholder="DZD"
                    />
                  </div>
                </>
              )}

              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl border border-cyan-200">
                <label className="block text-sm font-semibold text-cyan-800 mb-2">
                  Début
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white shadow-sm"
                />
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl border border-cyan-200">
                <label className="block text-sm font-semibold text-cyan-800 mb-2">
                  Fin
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white shadow-sm"
                />
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl border border-cyan-200">
                <label className="block text-sm font-semibold text-cyan-800 mb-2">
                  Date limite
                </label>
                <input
                  type="datetime-local"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-cyan-300 rounded-xl bg-white shadow-sm"
                />
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <label className="block text-sm font-semibold text-purple-800 mb-2">
                  Image d'introduction (publique)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIntroImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
                {formData.introductoryImage && !introImageFile && (
                  <p className="mt-1 truncate text-xs text-purple-700">
                    Actuelle : {formData.introductoryImage}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <label className="block text-sm font-semibold text-purple-800 mb-2">
                  Vidéo d'introduction (publique)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setIntroVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
                {formData.introductoryVideo && !introVideoFile && (
                  <p className="mt-1 truncate text-xs text-purple-700">
                    Actuelle : {formData.introductoryVideo}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="contact@..."
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="+..."
                />
              </div>

              <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  Personne de contact
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Nom..."
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
              <label className="block text-sm font-semibold text-violet-800 mb-2">
                Description
              </label>
              <div className="bg-white rounded-lg border border-violet-200 overflow-hidden">
                <RichTextEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Décrivez le stage..."
                  height="240px"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
              <label className="block text-sm font-semibold text-violet-800 mb-2">
                Exigences
              </label>
              <div className="bg-white rounded-lg border border-violet-200 overflow-hidden">
                <RichTextEditor
                  value={formData.requirements}
                  onChange={handleRequirementsChange}
                  placeholder="Listez les exigences..."
                  height="200px"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition"
              >
                <Save className="w-4 h-4" />
                {editingId ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Internships List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Liste des stages
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {internships.length} élément{internships.length !== 1 ? "s" : ""}
        </p>

        {isLoading ? (
          <div className="mt-4 text-gray-600">Chargement...</div>
        ) : internships.length === 0 ? (
          <div className="mt-4 text-gray-500">Aucun stage pour le moment.</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4">
            {internships.map((internship) => (
              <div
                key={internship.id}
                className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {internship.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      {internship.companyName ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {internship.companyName}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {internship.location}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {internship.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-700">
                        {internship.isPaid
                          ? `${internship.currency || "DZD"} ${internship.price || ""}`
                          : "Non payant"}
                      </span>
                    </div>
                    {internship.startDate && internship.endDate ? (
                      <p className="mt-2 text-sm text-gray-600">
                        {new Date(internship.startDate).toLocaleDateString()} —{" "}
                        {new Date(internship.endDate).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(internship)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 font-semibold"
                    >
                      <Pencil className="w-4 h-4" />
                      Modifier
                    </button>
                    {showDeleted ? (
                      <button
                        type="button"
                        onClick={() => handleRestore(internship.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restaurer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(internship.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
