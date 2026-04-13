import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Trash, Search, Upload, Check } from "lucide-react";
import toast from "react-hot-toast";
import { getCountryCode } from "../../utils/countryCodeMap";
// CSS is bundled with the component in newer versions
// import "react-flags-select/css/react-flags-select.css";

// Helper to get flag emoji from country code
const getFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return "🚩";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

const getEmojiFlagForCountry = (countryName) =>
  getFlagEmoji(getCountryCode(countryName) || "");

// Default countries with French names (fallback when programCountries is empty)
const DEFAULT_COUNTRIES = [
  "France",
  "Canada",
  "Belgique",
  "Suisse",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Sénégal",
  "Côte d'Ivoire",
  "Luxembourg",
  "États-Unis",
  "Royaume-Uni",
  "Allemagne",
  "Espagne",
  "Italie",
  "Pays-Bas",
  "Autriche",
  "Portugal",
  "Grèce",
  "Suède",
  "Norvège",
  "Danemark",
  "Finlande",
  "Pologne",
  "Turquie",
  "Japon",
  "Chine",
  "Inde",
  "Brésil",
  "Mexique",
  "Afrique du Sud",
  "Australie",
];

CountryFlagsWizard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentFlags: PropTypes.object,
  availableCountries: PropTypes.array,
};

export default function CountryFlagsWizard({
  isOpen,
  onClose,
  onSave,
  currentFlags,
  availableCountries,
}) {
  const [flags, setFlags] = useState(currentFlags || {});
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCountry, setEditingCountry] = useState(null);
  const [editingFlagImage, setEditingFlagImage] = useState("");
  const [flagsConfig, setFlagsConfig] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load flags config on mount
  useEffect(() => {
    const loadFlagsConfig = async () => {
      try {
        const res = await fetch("/flags-config.json");
        const config = await res.json();
        setFlagsConfig(config.countries || {});
        setLoading(false);
      } catch (err) {
        void err;
        toast.error("Failed to load flags configuration");
        setLoading(false);
      }
    };
    loadFlagsConfig();
  }, []);

  // Use provided countries or fall back to config keys or DEFAULT_COUNTRIES
  const countries =
    availableCountries && availableCountries.length > 0
      ? availableCountries
      : Object.keys(flagsConfig).length > 0
        ? Object.keys(flagsConfig)
        : DEFAULT_COUNTRIES;

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleStartEdit = (country) => {
    setEditingCountry(country);
    setEditingFlagImage(flags[country] || flagsConfig[country]?.flag || "");
    setImagePreview(flags[country] || flagsConfig[country]?.flag || null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only accept SVG files for consistency
      if (!file.type.includes("image") && !file.name.endsWith(".svg")) {
        toast.error("Please upload an image file (SVG, PNG, JPG)");
        return;
      }
      // Store with just the filename in /flags/ folder
      const fileName = `/flags/${file.name}`;
      setEditingFlagImage(fileName);

      // Create preview from file
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
        toast.success(`✅ Image selected: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSuggestedFlag = (country) => {
    const suggestedPath = flagsConfig[country]?.flag;
    if (suggestedPath) {
      setEditingFlagImage(suggestedPath);
      setImagePreview(suggestedPath);
    }
  };

  const handleSaveFlag = () => {
    const path = editingFlagImage.trim();

    // Allow saving with empty path (will use emoji as fallback)
    if (path) {
      // Validate path format only if provided
      if (!path.startsWith("/") && !path.startsWith("http")) {
        toast.error(
          "Path must start with / (for public folder) or http (for URL)",
        );
        return;
      }
    }

    const updated = { ...flags };
    if (path) {
      updated[editingCountry] = path;
    } else {
      // Remove custom path, will use emoji instead
      delete updated[editingCountry];
    }

    setFlags(updated);
    setEditingCountry(null);
    setEditingFlagImage("");
    setImagePreview(null);
    toast.success(`✅ ${editingCountry} set to: ${path || "emoji flag"}`);
  };

  const handleDeleteFlag = (country) => {
    const updated = { ...flags };
    delete updated[country];
    setFlags(updated);
    toast.success(`${country} flag removed`);
  };

  const handleSaveAll = () => {
    onSave(flags);
    onClose();
  };

  const handleClose = () => {
    setEditingCountry(null);
    setEditingFlagImage("");
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              🚩 Country Flags Management
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Select real flag images for each country
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin mr-3">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-gray-600">Loading flags configuration...</p>
            </div>
          ) : !editingCountry ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Countries Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredCountries.map((country) => {
                  const emoji = getEmojiFlagForCountry(country) || "🚩";
                  const hasSVGPath =
                    flags[country] && flags[country].endsWith(".svg");

                  return (
                    <div
                      key={country}
                      className={`border-2 rounded-lg p-3 hover:shadow-md transition-all flex flex-col items-center cursor-pointer ${
                        flags[country]
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="h-12 w-16 rounded mb-2 border border-gray-200 bg-white flex items-center justify-center text-3xl overflow-hidden relative">
                        <span className="text-2xl select-none">{emoji}</span>
                        {flags[country] && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-900 truncate text-center max-w-full mb-2">
                        {country}
                      </p>
                      {flags[country] && (
                        <p className="text-xs text-gray-500 truncate max-w-full mb-2">
                          {hasSVGPath ? "📄 SVG" : "🔗 Custom"}
                        </p>
                      )}
                      <div className="flex gap-1 mt-auto w-full">
                        <button
                          onClick={() => handleStartEdit(country)}
                          className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium transition-colors"
                        >
                          {flags[country] ? "Edit" : "Set"}
                        </button>
                        {flags[country] && (
                          <button
                            onClick={() => handleDeleteFlag(country)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove custom flag"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredCountries.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No countries found
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Editing: {editingCountry}
                </h3>

                {/* Flag Preview */}
                <div className="mb-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-300 h-48 flex items-center justify-center flex-col gap-4">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Flag preview"
                          className="max-h-32 max-w-full object-contain"
                          onLoad={() => {}}
                          onError={(e) => {
                            // Show emoji as fallback
                            e.target.style.display = "none";
                            if (e.target.parentElement) {
                              const emojiFlag =
                                getEmojiFlagForCountry(editingCountry) || "🚩";
                              e.target.parentElement.innerHTML = `<span class="text-6xl">${emojiFlag}</span>`;
                            }
                          }}
                        />
                      </>
                    ) : (
                      <span className="text-8xl">
                        {getEmojiFlagForCountry(editingCountry) || "🚩"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {imagePreview
                      ? `Using: ${imagePreview.includes("/") ? imagePreview.split("/").pop() : "custom image"}`
                      : `Using emoji flag: ${getEmojiFlagForCountry(editingCountry) || "🚩"}`}
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-3 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Flag Image
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">
                        Click to upload or drag & drop
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {editingFlagImage && (
                    <p className="text-xs text-green-600">
                      ✓ Image: {editingFlagImage}
                    </p>
                  )}
                </div>

                {/* Or use suggested flag */}
                {flagsConfig[editingCountry]?.flag && (
                  <div className="p-3 bg-blue-100 rounded-lg mb-4">
                    <p className="text-sm text-blue-900 mb-2">
                      Or use suggested flag from library:
                    </p>
                    <button
                      onClick={() => handleUseSuggestedFlag(editingCountry)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium text-sm"
                    >
                      Use {flagsConfig[editingCountry]?.flag}
                    </button>
                  </div>
                )}

                {/* Or use emoji flag */}
                <div className="p-3 bg-green-100 rounded-lg mb-4">
                  <p className="text-sm text-green-900 mb-2">
                    Or use emoji flag (recommended):
                  </p>
                  <button
                    onClick={() => {
                      setEditingFlagImage("");
                      setImagePreview(null);
                      toast.success(
                        `Using emoji flag: ${getEmojiFlagForCountry(editingCountry)}`,
                      );
                    }}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium text-sm"
                  >
                    {getEmojiFlagForCountry(editingCountry)} Use Emoji Flag
                  </button>
                </div>

                {/* Manual path input */}
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Or enter custom image path
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingFlagImage}
                      onChange={(e) => {
                        const path = e.target.value.trim();
                        setEditingFlagImage(path);
                        // Only update preview if it's a valid path
                        if (path.startsWith("/") || path.startsWith("http")) {
                          setImagePreview(path);
                        }
                      }}
                      placeholder="/flags/fr.svg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      💡 Use paths like: /flags/fr.svg (for public folder
                      assets)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4 flex items-center justify-between sticky bottom-0">
          <div className="text-sm text-gray-600">
            {Object.keys(flags).length} flags configured
          </div>

          <div className="flex gap-2">
            {editingCountry ? (
              <>
                <button
                  onClick={() => setEditingCountry(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFlag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Flag
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAll}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Save & Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
