import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

// Default countries fallback
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
];

export default function ProgramTypesWizard({
  isOpen,
  onClose,
  onSave,
  programSpecialtiesPerCountry,
  allCountries,
  existingTypes,
}) {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [programTypes, setProgramTypes] = useState([]);
  const [newType, setNewType] = useState("");

  // Use provided countries or fall back to defaults
  const countries =
    allCountries && allCountries.length > 0 ? allCountries : DEFAULT_COUNTRIES;

  const availableSpecialties =
    programSpecialtiesPerCountry[selectedCountry] || [];

  const handleNext = () => {
    if (step === 1) {
      if (!selectedCountry) {
        toast.error("Please select a country");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedSpecialty) {
        toast.error("Please select a specialty");
        return;
      }
      // Pre-load existing types for this country::specialty combo
      const key = `${selectedCountry}::${selectedSpecialty}`;
      if (existingTypes[key]) {
        setProgramTypes([...existingTypes[key]]);
      } else {
        setProgramTypes([]);
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAddType = () => {
    const trimmed = newType.trim();
    if (!trimmed) {
      toast.error("Please enter a program type");
      return;
    }
    if (programTypes.includes(trimmed)) {
      toast.error("Type already added");
      return;
    }
    setProgramTypes([...programTypes, trimmed]);
    setNewType("");
  };

  const handleRemoveType = (idx) => {
    setProgramTypes(programTypes.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (programTypes.length === 0) {
      toast.error("Add at least one program type");
      return;
    }
    const key = `${selectedCountry}::${selectedSpecialty}`;
    onSave(key, programTypes);
    setStep(1);
    setSelectedCountry("");
    setSelectedSpecialty("");
    setProgramTypes([]);
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCountry("");
    setSelectedSpecialty("");
    setProgramTypes([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Program Types</h2>
            <p className="text-pink-100 text-sm mt-1">Step {step} of 4</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-80">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                📍 Select Country
              </h3>
              <p className="text-gray-600 text-sm">
                Choose a country to add program types for
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                      selectedCountry === country
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                🎓 Select Specialty for {selectedCountry}
              </h3>
              <p className="text-gray-600 text-sm">
                Choose a specialty to add program types for
              </p>
              {availableSpecialties.length === 0 ? (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  ⚠️ No specialties found for {selectedCountry}. Add specialties
                  first in Program Specialties tab.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {availableSpecialties.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                        selectedSpecialty === spec
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                📋 Add Program Types
              </h3>
              <p className="text-gray-600 text-sm">
                For {selectedCountry} • {selectedSpecialty}
              </p>

              {/* Add new type */}
              <div className="flex gap-2 mt-6">
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddType()}
                  placeholder="e.g., Bachelors, Masters..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddType}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Add
                </button>
              </div>

              {/* List of added types */}
              <div className="space-y-2 mt-6">
                {programTypes.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">
                    No program types added yet
                  </p>
                ) : (
                  programTypes.map((type, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200"
                    >
                      <span className="font-medium text-purple-900">
                        {type}
                      </span>
                      <button
                        onClick={() => handleRemoveType(idx)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                ✅ Review & Save
              </h3>
              <p className="text-gray-600 text-sm">
                Confirm the details before saving
              </p>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Country
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedCountry}
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Specialty
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedSpecialty}
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                    Program Types ({programTypes.length})
                  </p>
                  <div className="space-y-1">
                    {programTypes.map((type, idx) => (
                      <p key={idx} className="text-gray-700 flex items-center">
                        <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2" />
                        {type}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-8 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !selectedCountry) ||
                  (step === 2 && !selectedSpecialty)
                }
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
