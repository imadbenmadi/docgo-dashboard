import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Loader,
  BookOpen,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import HomePageAPI from "../../API/HomePageManagement";

let nextId = Date.now();
const uid = () => String(++nextId);

const LANGS = [
  { code: "en", flag: "🇬🇧", label: "Anglais" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "ar", flag: "🇸🇦", label: "Arabe", rtl: true },
];

// Reusable drag-and-drop list editor for a single filter type
// relatedItems: optional array of study-field objects used to build linked-field checkboxes
const FilterList = ({
  items,
  setItems,
  saving,
  onSave,
  subtitle,
  relatedItems,
}) => {
  const [drag, setDrag] = useState(null);

  const addItem = () =>
    setItems((p) => [
      ...p,
      { _uid: uid(), id: uid(), en: "", fr: "", ar: "", fields: [] },
    ]);

  const removeItem = (u) => setItems((p) => p.filter((it) => it._uid !== u));

  const updateField = (u, lang, value) =>
    setItems((p) =>
      p.map((it) => (it._uid === u ? { ...it, [lang]: value } : it)),
    );

  // Toggle a linked field value inside item.fields[]
  const toggleLinkedField = (u, fieldValue) =>
    setItems((p) =>
      p.map((it) => {
        if (it._uid !== u) return it;
        const current = Array.isArray(it.fields) ? it.fields : [];
        const next = current.includes(fieldValue)
          ? current.filter((v) => v !== fieldValue)
          : [...current, fieldValue];
        return { ...it, fields: next };
      }),
    );

  const handleDragStart = (e, u) => {
    setDrag(u);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, u) => {
    e.preventDefault();
    if (drag === u) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i._uid === drag);
      const to = prev.findIndex((i) => i._uid === u);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };
  const handleDragEnd = () => setDrag(null);

  return (
    <div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-xs text-blue-700">
        <strong>Conseil :</strong> Glissez-déposez les lignes pour changer
        l&apos;ordre d&apos;affichage. Remplissez au moins la version EN ou FR.
        {subtitle ? ` ${subtitle}` : ""}
        {relatedItems && relatedItems.length > 0 && (
          <span>
            {" "}
            Cochez les spécialités disponibles pour chaque destination.
          </span>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">
              Aucune option — cliquez &quot;Ajouter&quot; pour commencer
            </p>
          </div>
        )}
        {items.map((item, idx) => (
          <div
            key={item._uid}
            draggable
            onDragStart={(e) => handleDragStart(e, item._uid)}
            onDragOver={(e) => handleDragOver(e, item._uid)}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-2xl border ${
              drag === item._uid
                ? "border-blue-400 shadow-lg opacity-50"
                : "border-gray-100 shadow-sm"
            } transition-all`}
          >
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
              <div
                className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
                title="Glisser pour réordonner"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-400 w-5 text-center">
                {idx + 1}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => removeItem(item._uid)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LANGS.map(({ code, flag, label, rtl }) => (
                <div key={code} className="flex flex-col gap-1">
                  <label className="text-[10px] font-medium text-gray-500">
                    {flag} {label}
                  </label>
                  <input
                    type="text"
                    dir={rtl ? "rtl" : "ltr"}
                    value={item[code] ?? ""}
                    onChange={(e) =>
                      updateField(item._uid, code, e.target.value)
                    }
                    placeholder={`Option en ${label.toLowerCase()}…`}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300"
                  />
                </div>
              ))}
            </div>

            {/* Linked fields section — only shown in Locations tab */}
            {relatedItems && relatedItems.length > 0 && (
              <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                <p className="text-[10px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Spécialités disponibles dans cette destination
                  <span className="ml-1 font-normal text-gray-400">
                    (laissez tout décoché = visible pour toutes les spécialités)
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {relatedItems.map((field) => {
                    const fVal = field.en || field.fr || field.ar || "";
                    const checked =
                      Array.isArray(item.fields) && item.fields.includes(fVal);
                    return (
                      <label
                        key={field._uid || field.id || fVal}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all select-none ${
                          checked
                            ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-200 hover:bg-blue-50/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={() => toggleLinkedField(item._uid, fVal)}
                        />
                        <span
                          className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${checked ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"}`}
                        >
                          {checked && (
                            <svg
                              className="w-2 h-2 text-white"
                              fill="none"
                              viewBox="0 0 8 8"
                            >
                              <path
                                d="M1 4l2 2 4-4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        {field.fr || field.en || field.ar || "—"}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 py-3 rounded-2xl text-sm font-medium transition-all"
      >
        <Plus className="w-4 h-4" />
        Ajouter une option
      </button>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
        >
          {saving ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Enregistrer les options
        </button>
      </div>
    </div>
  );
};

const TABS = [
  {
    id: "fields",
    label: 'Filtre "Que souhaitez-vous étudier"',
    icon: BookOpen,
    key: "filterStudyDomains",
    subtitle:
      "Ces options apparaissent dans le menu déroulant « Que souhaitez-vous étudier ? ».",
  },
  {
    id: "locations",
    label: 'Filtre "Où voulez-vous étudier"',
    icon: MapPin,
    key: "filterStudyLocations",
    subtitle:
      "Ces options apparaissent dans le menu déroulant « Où voulez-vous étudier ? ».",
  },
];

const FilterOptions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("fields");
  const [fields, setFields] = useState([]);
  const [locations, setLocations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await HomePageAPI.getContent();
      if (res.success) {
        const toList = (raw) =>
          (Array.isArray(raw) ? raw : []).map((it) => ({
            ...it,
            _uid: it._uid || uid(),
          }));
        setFields(toList(res.content.filterStudyDomains));
        setLocations(toList(res.content.filterStudyLocations));
      } else {
        toast.error("Erreur de chargement");
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async (type) => {
    const items = type === "fields" ? fields : locations;
    const setItems = type === "fields" ? setFields : setLocations;
    const key =
      type === "domains" ? "filterStudyDomains" : "filterStudyLocations";

    const empty = items.some((it) => !it.en && !it.fr && !it.ar);
    if (empty) {
      toast.error("Chaque option doit avoir au moins un texte");
      return;
    }

    setSaving(true);
    // eslint-disable-next-line no-unused-vars
    const payload = items.map(({ _uid, ...rest }) => rest);
    const res = await HomePageAPI.updateContent({ [key]: payload });
    if (res.success) {
      toast.success("Options de filtre enregistrées !");
      setItems(
        (res.content?.[key] || payload).map((it) => ({
          ...it,
          _uid: it._uid || uid(),
        })),
      );
    } else {
      toast.error(res.message || "Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );

  const current = TABS.find((t) => t.id === activeTab);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Options de filtre
            </h1>
            <p className="text-xs text-gray-400">
              Gérez les options des filtres affichés sur la page d&apos;accueil
            </p>
          </div>
        </div>
        <button
          onClick={() => handleSave(activeTab)}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
        >
          {saving ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Enregistrer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {tab.id === "fields"
                  ? "Que souhaitez-vous étudier"
                  : "Où voulez-vous étudier"}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="text-base font-semibold text-gray-800 mb-4">
        {current.label}
      </h2>

      {activeTab === "fields" ? (
        <FilterList
          items={fields}
          setItems={setFields}
          saving={saving}
          onSave={() => handleSave("fields")}
          subtitle={TABS[0].subtitle}
        />
      ) : (
        <FilterList
          items={locations}
          setItems={setLocations}
          saving={saving}
          onSave={() => handleSave("locations")}
          subtitle={TABS[1].subtitle}
          relatedItems={fields}
        />
      )}
    </div>
  );
};

export default FilterOptions;
