import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import {
  Globe,
  BookOpen,
  Briefcase,
  Plus,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../utils/apiClient";
import ProgramSpecialtiesWizard from "../../components/Modals/ProgramSpecialtiesWizard";
import ProgramTypesWizard from "../../components/Modals/ProgramTypesWizard";
import CountryFlagCard from "../../components/CountryFlagCard";
import { COUNTRY_CODE_MAP } from "../../utils/countryCodeMap";

// Helper to get emoji for professional status
const getProfessionalStatusEmoji = (status) => {
  if (!status) return "";
  const lowerStatus = status.toLowerCase().trim();
  const emojiMap = {
    student: "👤",
    worker: "👔",
    professional: "💼",
    other: "🤝",
  };
  return emojiMap[lowerStatus] || "";
};

// Helper to get emoji for academic status
const getAcademicStatusEmoji = (status) => {
  if (!status) return "";
  const lowerStatus = status.toLowerCase().trim();
  const emojiMap = {
    student: "🎓",
    graduated: "🏆",
    graduate: "🏆",
    other: "📚",
  };
  return emojiMap[lowerStatus] || "";
};

// Professional tab structure
const TABS = [
  {
    key: "user-origin",
    label: "User Registration",
    icon: Globe,
    color: "from-blue-500 to-cyan-600",
    description:
      "Countries & specialties for user registration and user profiles",
  },
  {
    key: "statuses",
    label: "Professional Status",
    icon: Briefcase,
    color: "from-amber-500 to-orange-600",
    description: "Professional and academic status options",
  },
  {
    key: "programs",
    label: "Program Management",
    icon: BookOpen,
    color: "from-violet-500 to-purple-600",
    description: "Program hierarchy, specialties, types & flags",
  },
];

// Simple list editor component
function ListEditor({ items, onChange, placeholder = "Add item..." }) {
  const [newItem, setNewItem] = useState("");
  const [filter, setFilter] = useState("");

  const filtered = items.filter((i) =>
    i.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      toast.error("Item already exists");
      return;
    }
    onChange([...items, trimmed]);
    setNewItem("");
  };

  const handleRemove = (item) => {
    onChange(items.filter((i) => i !== item));
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...items];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange(arr);
  };

  const moveDown = (idx) => {
    if (idx === items.length - 1) return;
    const arr = [...items];
    [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
    onChange(arr);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={`Filter ${items.length} items...`}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      />

      <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            No items found
          </div>
        ) : (
          filtered.map((item) => {
            const realIdx = items.indexOf(item);
            return (
              <div
                key={item}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group transition"
              >
                <span className="text-sm text-gray-700 flex-1 truncate font-medium">
                  {item}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveUp(realIdx)}
                    disabled={realIdx === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-white"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(realIdx)}
                    disabled={realIdx === items.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-white"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

ListEditor.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

// Enhanced list editor with emoji support for statuses
function StatusListEditor({
  items,
  onChange,
  placeholder = "Add item...",
  getEmojiFunc = () => "•",
}) {
  const [newItem, setNewItem] = useState("");
  const [filter, setFilter] = useState("");

  const filtered = items.filter((i) =>
    i.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      toast.error("Item already exists");
      return;
    }
    onChange([...items, trimmed]);
    setNewItem("");
  };

  const handleRemove = (item) => {
    onChange(items.filter((i) => i !== item));
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...items];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange(arr);
  };

  const moveDown = (idx) => {
    if (idx === items.length - 1) return;
    const arr = [...items];
    [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
    onChange(arr);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={`Filter ${items.length} items...`}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      />

      <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            No items found
          </div>
        ) : (
          filtered.map((item) => {
            const realIdx = items.indexOf(item);
            const emoji = getEmojiFunc(item);
            return (
              <div
                key={item}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group transition"
              >
                <span className="text-sm text-gray-700 flex-1 truncate font-medium flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  {item}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveUp(realIdx)}
                    disabled={realIdx === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-white"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(realIdx)}
                    disabled={realIdx === items.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-white"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

StatusListEditor.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  getEmojiFunc: PropTypes.func,
};

export default function UserOptionsPage() {
  const [activeTab, setActiveTab] = useState("user-origin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isSpecialtiesWizardOpen, setIsSpecialtiesWizardOpen] = useState(false);
  const [isProgramTypesWizardOpen, setIsProgramTypesWizardOpen] =
    useState(false);

  const [options, setOptions] = useState({
    userOriginCountries: [],
    userSpecialties: [],
    professionalStatuses: [],
    academicStatuses: [],
    programCountries: [],
    programSpecialtiesPerCountry: {},
    programTypesPerCountrySpecialty: {},
  });

  // Normalize country names - strip bilingual format to keep only French name
  const normalizeCountries = (countries) => {
    if (!Array.isArray(countries)) return [];
    return countries.map((country) => {
      // If it's bilingual format "France / فرنسا", extract just "France"
      if (country && country.includes(" / ")) {
        return country.split(" / ")[0].trim();
      }
      return country;
    });
  };

  // Load options from backend
  const loadOptions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/Admin/RegisterOptions");
      const data = res.data?.options || {};

      // Normalize countries (strip bilingual format if present)
      const userOriginCountries = normalizeCountries(
        data.userOriginCountries || [],
      );
      const programCountries = normalizeCountries(data.programCountries || []);

      setOptions({
        userOriginCountries: userOriginCountries,
        userSpecialties: data.userSpecialties || [],
        professionalStatuses: data.professionalStatuses || [],
        academicStatuses: data.academicStatuses || [],
        programCountries: programCountries,
        programSpecialtiesPerCountry: data.programSpecialtiesPerCountry || {},
        programTypesPerCountrySpecialty:
          data.programTypesPerCountrySpecialty || {},
      });
      setLastUpdated(new Date(data.updatedAt).toLocaleString());
      toast.success("Options loaded");
    } catch (e) {
      toast.error("Failed to load: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Save specific field
  const saveField = async (fieldName, value) => {
    setSaving(fieldName);
    try {
      // Normalize country arrays before saving
      let valueToSend = value;
      if (
        fieldName === "userOriginCountries" ||
        fieldName === "programCountries"
      ) {
        valueToSend = normalizeCountries(value);
      }

      const response = await apiClient.patch("/Admin/RegisterOptions", {
        [fieldName]: valueToSend,
      });

      // Verify the response
      if (response.data?.success || response.status === 200) {
        toast.success(`✅ ${fieldName} saved successfully!`);
        setLastUpdated(new Date().toLocaleString());
        // Reload to ensure sync with backend
        await loadOptions();
      } else {
        const msg = response.data?.message || "Unknown error";
        toast.error(`Failed to save: ${msg}`);
      }
    } catch (e) {
      const errorMsg =
        e.response?.data?.message || e.message || "Connection error";
      toast.error(`❌ Save failed: ${errorMsg}`);
    } finally {
      setSaving(null);
    }
  };

  // Handle saving from Program Specialties wizard
  const handleSaveSpecialties = async (country, specialties) => {
    const updated = {
      ...options.programSpecialtiesPerCountry,
      [country]: specialties,
    };
    setOptions({
      ...options,
      programSpecialtiesPerCountry: updated,
    });
    await saveField("programSpecialtiesPerCountry", updated);
  };

  // Handle saving from Program Types wizard
  const handleSaveProgramTypes = async (key, types) => {
    const updated = {
      ...options.programTypesPerCountrySpecialty,
      [key]: types,
    };
    setOptions({
      ...options,
      programTypesPerCountrySpecialty: updated,
    });
    await saveField("programTypesPerCountrySpecialty", updated);
  };

  // Delete specialty entry (removes all specialties for a country)
  const deleteSpecialtyEntry = async (country) => {
    const updated = { ...options.programSpecialtiesPerCountry };
    delete updated[country];
    setOptions({
      ...options,
      programSpecialtiesPerCountry: updated,
    });
    await saveField("programSpecialtiesPerCountry", updated);
    toast.success(`Deleted specialties for ${country}`);
  };

  // Delete program type entry
  const deleteProgramTypeEntry = async (key) => {
    const updated = { ...options.programTypesPerCountrySpecialty };
    delete updated[key];
    setOptions({
      ...options,
      programTypesPerCountrySpecialty: updated,
    });
    await saveField("programTypesPerCountrySpecialty", updated);
    toast.success(`Deleted program types for ${key}`);
  };

  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Options Management
            </h1>
            <p className="text-gray-500 mt-2">
              Manage all dropdown data and settings for registration and user
              profiles
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-2">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
          <button
            onClick={loadOptions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  activeTab === tab.key
                    ? "border-blue-500 bg-white shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${tab.color} mb-2`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="font-semibold text-sm text-gray-900">
                  {tab.label}
                </div>
                <div className="text-xs text-gray-500">{tab.description}</div>
              </button>
            );
          })}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Content */}
          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                Loading options...
              </div>
            ) : activeTab === "user-origin" ? (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Registration Countries
                      </h3>
                      <p className="text-sm text-gray-500">
                        Countries users can select from when registering
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        saveField(
                          "userOriginCountries",
                          options.userOriginCountries,
                        )
                      }
                      disabled={saving === "userOriginCountries"}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      {saving === "userOriginCountries" ? "Saving..." : "Save"}
                    </button>
                  </div>
                  {/* Country Grid Display with Flags */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {Object.entries(COUNTRY_CODE_MAP).map(([country, code]) => {
                      const isSelected =
                        options.userOriginCountries.includes(country);
                      return (
                        <CountryFlagCard
                          key={country}
                          countryCode={code}
                          countryName={country}
                          isSelected={isSelected}
                          onClick={() => {
                            const updated = isSelected
                              ? options.userOriginCountries.filter(
                                  (c) => c !== country,
                                )
                              : [...options.userOriginCountries, country];
                            setOptions({
                              ...options,
                              userOriginCountries: updated,
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">
                        {options.userOriginCountries.length}
                      </span>{" "}
                      countries selected
                    </p>
                  </div>
                </div>

                <div className="border-t pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        User Specialties
                      </h3>
                      <p className="text-sm text-gray-500">
                        Study specialties for user profiles
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        saveField("userSpecialties", options.userSpecialties)
                      }
                      disabled={saving === "userSpecialties"}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      {saving === "userSpecialties" ? "Saving..." : "Save"}
                    </button>
                  </div>
                  <ListEditor
                    items={options.userSpecialties}
                    onChange={(items) =>
                      setOptions({
                        ...options,
                        userSpecialties: items,
                      })
                    }
                    placeholder="e.g., Engineering, Medicine, Business..."
                  />
                </div>
              </div>
            ) : activeTab === "statuses" ? (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Professional Status
                      </h3>
                      <p className="text-sm text-gray-500">
                        Professional status options for users
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        saveField(
                          "professionalStatuses",
                          options.professionalStatuses,
                        )
                      }
                      disabled={saving === "professionalStatuses"}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      {saving === "professionalStatuses" ? "Saving..." : "Save"}
                    </button>
                  </div>
                  <StatusListEditor
                    items={options.professionalStatuses}
                    onChange={(items) =>
                      setOptions({
                        ...options,
                        professionalStatuses: items,
                      })
                    }
                    placeholder="e.g., Student, Worker, Other..."
                    getEmojiFunc={getProfessionalStatusEmoji}
                  />
                </div>

                <div className="border-t pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Academic Status
                      </h3>
                      <p className="text-sm text-gray-500">
                        Academic status options for users
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        saveField("academicStatuses", options.academicStatuses)
                      }
                      disabled={saving === "academicStatuses"}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      {saving === "academicStatuses" ? "Saving..." : "Save"}
                    </button>
                  </div>
                  <StatusListEditor
                    items={options.academicStatuses}
                    onChange={(items) =>
                      setOptions({
                        ...options,
                        academicStatuses: items,
                      })
                    }
                    placeholder="e.g., Student, Graduated, Other..."
                    getEmojiFunc={getAcademicStatusEmoji}
                  />
                </div>
              </div>
            ) : activeTab === "programs" ? (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Program Countries
                      </h3>
                      <p className="text-sm text-gray-500">
                        Countries offering programs
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        saveField("programCountries", options.programCountries)
                      }
                      disabled={saving === "programCountries"}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      {saving === "programCountries" ? "Saving..." : "Save"}
                    </button>
                  </div>
                  {/* Visual Country Grid */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {Object.entries(COUNTRY_CODE_MAP).map(
                        ([country, code]) => {
                          const isSelected =
                            options.programCountries.includes(country);

                          // Check if country has specialties or types configured
                          const hasSpecialties =
                            options.programSpecialtiesPerCountry[country];
                          const hasTypes = Object.keys(
                            options.programTypesPerCountrySpecialty,
                          ).some((key) => key.startsWith(country + ":::"));
                          const hasData = hasSpecialties || hasTypes;

                          const handleCountryToggle = () => {
                            if (isSelected && hasData) {
                              // Show confirmation dialog
                              Swal.fire({
                                title: "Remove Country?",
                                html: `Are you sure you want to remove <strong>"${country}"</strong>?<br><br>⚠️ This will delete:<br>${hasSpecialties ? `• ${Object.keys(hasSpecialties).length} specialties<br>` : ""}${hasTypes ? `• Associated program types` : ""}`,
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#ef4444",
                                cancelButtonColor: "#6b7280",
                                confirmButtonText: "Yes, delete",
                                cancelButtonText: "Cancel",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  // Toggle the country
                                  setOptions({
                                    ...options,
                                    programCountries:
                                      options.programCountries.filter(
                                        (c) => c !== country,
                                      ),
                                  });
                                }
                              });
                              return;
                            }

                            // Toggle the country (add mode)
                            setOptions({
                              ...options,
                              programCountries: isSelected
                                ? options.programCountries.filter(
                                    (c) => c !== country,
                                  )
                                : [...options.programCountries, country],
                            });
                          };

                          return (
                            <div key={country} className="relative">
                              <CountryFlagCard
                                countryCode={code}
                                countryName={country}
                                isSelected={isSelected}
                                onClick={handleCountryToggle}
                              />
                              {hasData && (
                                <div
                                  className="absolute top-1 right-1 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                                  title="Has configured data"
                                >
                                  !
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {options.programCountries.length} countr
                      {options.programCountries.length === 1 ? "y" : "ies"}{" "}
                      selected
                    </div>
                  </div>
                </div>

                {/* Program Specialties Wizard Section */}
                <div className="border-t pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        🎓 Program Specialties (per Country)
                      </h3>
                      <p className="text-sm text-gray-500">
                        Add specialties for each country through a guided wizard
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSpecialtiesWizardOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Entry
                    </button>
                  </div>

                  {/* Display current entries as cards */}
                  <div className="grid grid-cols-1 gap-3">
                    {Object.keys(options.programSpecialtiesPerCountry)
                      .length === 0 ? (
                      <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-400 text-sm">
                          No entries yet. Click &quot;Add Entry&quot; to create
                          one.
                        </p>
                      </div>
                    ) : (
                      Object.entries(options.programSpecialtiesPerCountry).map(
                        ([country, specialties]) => (
                          <div
                            key={country}
                            className="bg-violet-50 border border-violet-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-violet-900">
                                  {country}
                                </h4>
                                <p className="text-xs text-violet-600 mt-1">
                                  {specialties.length} specialt
                                  {specialties.length === 1 ? "y" : "ies"}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteSpecialtyEntry(country)}
                                className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {specialties.map((spec) => (
                                <span
                                  key={spec}
                                  className="px-2 py-1 bg-white border border-violet-300 rounded text-xs text-violet-900 font-medium"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>

                {/* Program Types Wizard Section */}
                <div className="border-t pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        📋 Program Types (per Country::Specialty)
                      </h3>
                      <p className="text-sm text-gray-500">
                        Add program types for country + specialty combinations
                        through a guided wizard
                      </p>
                    </div>
                    <button
                      onClick={() => setIsProgramTypesWizardOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Entry
                    </button>
                  </div>

                  {/* Display current entries as cards */}
                  <div className="grid grid-cols-1 gap-3">
                    {Object.keys(options.programTypesPerCountrySpecialty)
                      .length === 0 ? (
                      <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-400 text-sm">
                          No entries yet. Click &quot;Add Entry&quot; to create
                          one.
                        </p>
                      </div>
                    ) : (
                      Object.entries(
                        options.programTypesPerCountrySpecialty,
                      ).map(([key, types]) => (
                        <div
                          key={key}
                          className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-purple-900">
                                {key}
                              </h4>
                              <p className="text-xs text-purple-600 mt-1">
                                {types.length} type
                                {types.length === 1 ? "" : "s"}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteProgramTypeEntry(key)}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {types.map((type) => (
                              <span
                                key={type}
                                className="px-2 py-1 bg-white border border-purple-300 rounded text-xs text-purple-900 font-medium"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Wizard Modals */}
        <ProgramSpecialtiesWizard
          isOpen={isSpecialtiesWizardOpen}
          onClose={() => setIsSpecialtiesWizardOpen(false)}
          onSave={handleSaveSpecialties}
          existingCountries={options.programSpecialtiesPerCountry}
          allCountries={options.programCountries}
        />

        <ProgramTypesWizard
          isOpen={isProgramTypesWizardOpen}
          onClose={() => setIsProgramTypesWizardOpen(false)}
          onSave={handleSaveProgramTypes}
          programSpecialtiesPerCountry={options.programSpecialtiesPerCountry}
          allCountries={options.programCountries}
          existingTypes={options.programTypesPerCountrySpecialty}
        />
      </div>
    </div>
  );
}
