import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Plus } from "lucide-react";

/**
 * Admin component to manage featured countries for the homepage
 * Allows adding/removing countries that display with flags
 */
export default function FeaturedCountriesManager({ value = [], onChange }) {
  const [countries, setCountries] = useState(value);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name_en: "",
    name_fr: "",
    name_ar: "",
  });

  useEffect(() => {
    setCountries(value || []);
  }, [value]);

  const handleAddCountry = (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name_en.trim()) {
      toast.error("Country code and English name are required");
      return;
    }

    const newCountry = {
      code: formData.code.toLowerCase().trim(),
      name_en: formData.name_en.trim(),
      name_fr: formData.name_fr.trim() || formData.name_en.trim(),
      name_ar: formData.name_ar.trim() || formData.name_en.trim(),
    };

    // Check for duplicates
    if (countries.some((c) => c.code === newCountry.code)) {
      toast.error("Country already added");
      return;
    }

    const updated = [...countries, newCountry];
    setCountries(updated);
    onChange(updated);
    setFormData({ code: "", name_en: "", name_fr: "", name_ar: "" });
    setShowForm(false);
    toast.success("Country added");
  };

  const handleRemoveCountry = (index) => {
    const updated = countries.filter((_, i) => i !== index);
    setCountries(updated);
    onChange(updated);
    toast.success("Country removed");
  };

  const flagUrl = (code) =>
    `https://flagcdn.com/256x192/${code.toLowerCase()}.png`;

  return (
    <div className="space-y-4">
      {/* List of Current Countries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Featured Countries
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {countries.length > 0 ? (
            countries.map((country, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <img
                  src={flagUrl(country.code)}
                  alt={country.name_en}
                  className="w-12 h-9 rounded object-cover"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 192'%3E%3Crect fill='%23e5e7eb' width='256' height='192'/%3E%3C/svg%3E`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {country.name_en}
                  </p>
                  <p className="text-xs text-gray-500">
                    {country.code.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveCountry(index)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Remove country"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">No countries added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Country Form */}
      {showForm ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-blue-900">
            Add New Country
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Country Code (e.g., "fr" for France) *
              </label>
              <input
                type="text"
                placeholder="e.g., fr, ca, gb, de, be, us"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                English Name *
              </label>
              <input
                type="text"
                placeholder="e.g., France"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData({ ...formData, name_en: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                French Name
              </label>
              <input
                type="text"
                placeholder="e.g., France"
                value={formData.name_fr}
                onChange={(e) =>
                  setFormData({ ...formData, name_fr: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Arabic Name
              </label>
              <input
                type="text"
                placeholder="e.g., فرنسا"
                value={formData.name_ar}
                onChange={(e) =>
                  setFormData({ ...formData, name_ar: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({
                  code: "",
                  name_en: "",
                  name_fr: "",
                  name_ar: "",
                });
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCountry}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Country
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Country
        </button>
      )}

      {/* Common Countries Quick Add */}
      <div>
        <p className="text-xs text-gray-500 mb-2">
          Quick add popular countries:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            {
              code: "fr",
              name_en: "France",
              name_fr: "France",
              name_ar: "فرنسا",
            },
            {
              code: "ca",
              name_en: "Canada",
              name_fr: "Canada",
              name_ar: "كندا",
            },
            {
              code: "gb",
              name_en: "England",
              name_fr: "Angleterre",
              name_ar: "إنجلترا",
            },
            {
              code: "de",
              name_en: "Germany",
              name_fr: "Allemagne",
              name_ar: "ألمانيا",
            },
            {
              code: "be",
              name_en: "Belgium",
              name_fr: "Belgique",
              name_ar: "بلجيكا",
            },
            {
              code: "us",
              name_en: "United States",
              name_fr: "États-Unis",
              name_ar: "الولايات المتحدة",
            },
            {
              code: "au",
              name_en: "Australia",
              name_fr: "Australie",
              name_ar: "أستراليا",
            },
            {
              code: "nz",
              name_en: "New Zealand",
              name_fr: "Nouvelle-Zélande",
              name_ar: "نيوزيلندا",
            },
          ].map((country) => (
            <button
              key={country.code}
              onClick={() => {
                if (!countries.some((c) => c.code === country.code)) {
                  const updated = [...countries, country];
                  setCountries(updated);
                  onChange(updated);
                  toast.success(`${country.name_en} added`);
                } else {
                  toast.error("Already added");
                }
              }}
              className="flex items-center gap-2 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <img
                src={flagUrl(country.code)}
                alt={country.name_en}
                className="w-6 h-4 rounded"
              />
              <span className="truncate">{country.name_en}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
