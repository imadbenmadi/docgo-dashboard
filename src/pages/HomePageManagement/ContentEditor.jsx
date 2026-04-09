import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  ChevronDown,
  ChevronRight,
  Loader,
  Zap,
  Info,
  ListChecks,
  Gift,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import HomePageAPI from "../../API/HomePageManagement";

const LANGS = [
  { code: "en", label: "English", flag: "🇬🇧", color: "blue" },
  { code: "fr", label: "Français", flag: "🇫🇷", color: "indigo" },
  { code: "ar", label: "العربية", flag: "🇸🇦", color: "purple" },
];

// Sections organized by landing page order
const SECTIONS = [
  {
    order: 1,
    id: "hero",
    title: "Hero Section",
    icon: Zap,
    color: "blue",
    bgGradient: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    fields: [
      {
        key: "heroBadge",
        label: "Badge / Hook",
        type: "input",
      },
      {
        key: "heroTitle",
        label: "Main Title",
        type: "input",
      },
      {
        key: "heroSubtitle",
        label: "Subtitle",
        type: "textarea",
      },
      {
        key: "heroCta",
        label: "CTA Button Text",
        type: "input",
      },
    ],
  },
  {
    order: 2,
    id: "about",
    title: "About Section",
    icon: Info,
    color: "emerald",
    bgGradient: "from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
    fields: [
      {
        key: "aboutTitle",
        label: "Section Title",
        type: "input",
      },
      {
        key: "aboutDescription",
        label: "Description",
        type: "textarea",
      },
      {
        key: "studyQuote",
        label: "Study Quote",
        type: "textarea",
      },
      {
        key: "showAboutSection",
        label: "Show This Section",
        type: "checkbox",
        languageAgnostic: true,
      },
    ],
  },
  {
    order: 3,
    id: "steps",
    title: "Steps Section (What We Do)",
    icon: ListChecks,
    color: "rose",
    bgGradient: "from-rose-50 to-rose-100",
    borderColor: "border-rose-200",
    fields: [
      {
        key: "stepsTitle",
        label: "Section Title",
        type: "input",
      },
      {
        key: "step1Title",
        label: "Step 1 — Title",
        type: "input",
      },
      {
        key: "step1Desc",
        label: "Step 1 — Description",
        type: "textarea",
      },
      {
        key: "step2Title",
        label: "Step 2 — Title",
        type: "input",
      },
      {
        key: "step2Desc",
        label: "Step 2 — Description",
        type: "textarea",
      },
      {
        key: "step3Title",
        label: "Step 3 — Title",
        type: "input",
      },
      {
        key: "step3Desc",
        label: "Step 3 — Description",
        type: "textarea",
      },
      {
        key: "step4Title",
        label: "Step 4 — Title",
        type: "input",
      },
      {
        key: "step4Desc",
        label: "Step 4 — Description",
        type: "textarea",
      },
    ],
  },
  {
    order: 4,
    id: "services",
    title: "Services Section",
    icon: Gift,
    color: "amber",
    bgGradient: "from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
    fields: [
      {
        key: "servicesTitle",
        label: "Section Title",
        type: "input",
      },
      {
        key: "service1Title",
        label: "Service 1 — Title",
        type: "input",
      },
      {
        key: "service1Desc",
        label: "Service 1 — Description",
        type: "textarea",
      },
      {
        key: "service1Cta",
        label: "Service 1 — Button Text",
        type: "input",
      },
      {
        key: "service2Title",
        label: "Service 2 — Title",
        type: "input",
      },
      {
        key: "service2Desc",
        label: "Service 2 — Description",
        type: "textarea",
      },
      {
        key: "service2Cta",
        label: "Service 2 — Button Text",
        type: "input",
      },
    ],
  },
  {
    order: 5,
    id: "programSearcher",
    title: "Program Search Engine",
    icon: Search,
    color: "violet",
    bgGradient: "from-violet-50 to-violet-100",
    borderColor: "border-violet-200",
    fields: [
      {
        key: "programSearcherTitle",
        label: "Section Title",
        type: "input",
      },
      {
        key: "programSearcherDescription",
        label: "Description",
        type: "textarea",
      },
      {
        key: "programSearcherPlaceholder",
        label: "Search Input Placeholder",
        type: "input",
      },
      {
        key: "programSearcherButtonText",
        label: "Search Button Text",
        type: "input",
      },
      {
        key: "showProgramSearcher",
        label: "Show This Section",
        type: "checkbox",
        languageAgnostic: true,
      },
    ],
  },
];

const getColorClasses = (color) => {
  const map = {
    blue: "focus:ring-blue-300 border-blue-200",
    indigo: "focus:ring-indigo-300 border-indigo-200",
    emerald: "focus:ring-emerald-300 border-emerald-200",
    rose: "focus:ring-rose-300 border-rose-200",
    amber: "focus:ring-amber-300 border-amber-200",
    violet: "focus:ring-violet-300 border-violet-200",
    purple: "focus:ring-purple-300 border-purple-200",
  };
  return map[color] || "focus:ring-blue-300 border-blue-200";
};

const ContentEditor = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState({ hero: true });
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await HomePageAPI.getContent();
      if (res.success) {
        const flat = {};
        SECTIONS.forEach((s) =>
          s.fields.forEach(({ key, languageAgnostic }) => {
            if (languageAgnostic) {
              // For language-agnostic fields (like checkboxes), just store the value directly
              flat[key] = res.content[key] ?? false;
            } else {
              // For language-specific fields, create keys for each language
              LANGS.forEach(({ code }) => {
                const dbKey = `${key}_${code}`;
                flat[dbKey] = res.content[dbKey] ?? "";
              });
            }
          }),
        );
        setFields(flat);
      } else {
        toast.error("Error loading content");
      }
      setLoading(false);
    })();
  }, []);

  const handleChange = (key, langCode, value) => {
    const dbKey = `${key}_${langCode}`;
    setFields((p) => ({ ...p, [dbKey]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await HomePageAPI.updateContent(fields);
    if (res.success) toast.success("Content saved successfully!");
    else toast.error(res.message || "Error saving content");
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4 md:p-6 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Homepage Editor
              </h1>
              <p className="text-xs text-gray-400">
                Edit content in all 3 languages side by side
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save All
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const isOpen = !!open[section.id];
            const IconComponent = section.icon;

            return (
              <div
                key={section.id}
                className={`bg-white rounded-2xl border ${section.borderColor} shadow-sm overflow-hidden transition-all`}
              >
                {/* Section header */}
                <button
                  className={`w-full flex items-center gap-3 px-6 py-4 hover:${section.bgGradient} transition-colors text-left`}
                  onClick={() =>
                    setOpen((p) => ({
                      ...p,
                      [section.id]: !isOpen,
                    }))
                  }
                >
                  <div className={`p-2 rounded-lg bg-${section.color}-100`}>
                    <IconComponent
                      className={`w-5 h-5 text-${section.color}-600`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                        {section.order}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {section.title}
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Fields */}
                {isOpen && (
                  <div className="px-6 py-5 border-t border-gray-100 space-y-6">
                    {section.fields.map(
                      ({ key, label, type, languageAgnostic }) => (
                        <div key={key} className="flex flex-col gap-3">
                          <label className="text-sm font-semibold text-gray-800">
                            {label}
                          </label>

                          {/* Language-agnostic fields (e.g., checkboxes) */}
                          {languageAgnostic ? (
                            <div className="flex items-center gap-3">
                              {type === "checkbox" && (
                                <input
                                  type="checkbox"
                                  checked={fields[key] ?? false}
                                  onChange={(e) =>
                                    setFields((p) => ({
                                      ...p,
                                      [key]: e.target.checked,
                                    }))
                                  }
                                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-300 cursor-pointer"
                                />
                              )}
                              <span className="text-sm text-gray-600">
                                {fields[key] ? "Visible" : "Hidden"}
                              </span>
                            </div>
                          ) : (
                            /* Language inputs grid */
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {LANGS.map(
                                ({ code, label: langLabel, flag, color }) => {
                                  const dbKey = `${key}_${code}`;
                                  const value = fields[dbKey] ?? "";

                                  return (
                                    <div
                                      key={code}
                                      className="flex flex-col gap-2"
                                    >
                                      {/* Language label with flag */}
                                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                        <span className="text-lg">{flag}</span>
                                        <span className="text-xs font-medium text-gray-700">
                                          {langLabel}
                                        </span>
                                      </div>

                                      {/* Input field */}
                                      {type === "textarea" ? (
                                        <textarea
                                          rows={4}
                                          value={value}
                                          onChange={(e) =>
                                            handleChange(
                                              key,
                                              code,
                                              e.target.value,
                                            )
                                          }
                                          className={`w-full px-3 py-2 border ${getColorClasses(color)} rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 resize-none placeholder-gray-300`}
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={value}
                                          onChange={(e) =>
                                            handleChange(
                                              key,
                                              code,
                                              e.target.value,
                                            )
                                          }
                                          className={`w-full px-3 py-2 border ${getColorClasses(color)} rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 placeholder-gray-300`}
                                        />
                                      )}
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom save bar */}
        <div className="mt-8 flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-8 py-3 rounded-xl transition-colors disabled:opacity-60 shadow-md hover:shadow-lg"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
