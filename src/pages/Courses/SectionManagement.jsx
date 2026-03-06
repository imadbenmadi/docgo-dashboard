import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  DocumentTextIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { coursesAPI } from "../../API/Courses";
import AdminMediaViewer from "../../components/Common/AdminMediaViewer";
import Swal from "sweetalert2";

// ─── Inline Quiz Editor ────────────────────────────────────────────────────────
const newOption = (idx) => ({ id: `opt_${Date.now()}_${idx}`, label: "" });
const newQuestion = () => ({
  id: `q_${Date.now()}`,
  text: "",
  type: "multiple_choice",
  options: [newOption(0), newOption(1)],
  correctOptionId: null,
});

const QuizEditor = ({
  quizData,
  onChange,
  passingScore,
  onPassingScoreChange,
  maxAttempts,
  onMaxAttemptsChange,
}) => {
  const addQuestion = () => onChange([...quizData, newQuestion()]);

  const removeQuestion = (qi) => onChange(quizData.filter((_, i) => i !== qi));

  const updateQuestion = (qi, field, val) =>
    onChange(quizData.map((q, i) => (i === qi ? { ...q, [field]: val } : q)));

  const addOption = (qi) =>
    onChange(
      quizData.map((q, i) =>
        i === qi
          ? { ...q, options: [...q.options, newOption(q.options.length)] }
          : q,
      ),
    );

  const removeOption = (qi, optId) =>
    onChange(
      quizData.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.filter((o) => o.id !== optId) }
          : q,
      ),
    );

  const updateOption = (qi, optId, val) =>
    onChange(
      quizData.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optId ? { ...o, label: val } : o,
              ),
            }
          : q,
      ),
    );

  const setCorrect = (qi, optId) =>
    onChange(
      quizData.map((q, i) => (i === qi ? { ...q, correctOptionId: optId } : q)),
    );

  return (
    <div className="space-y-4">
      {/* Meta settings */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-purple-50 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Score de passage (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={passingScore}
            onChange={(e) => onPassingScoreChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tentatives max
          </label>
          <input
            type="number"
            min="1"
            value={maxAttempts}
            onChange={(e) => onMaxAttemptsChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Questions */}
      {quizData.map((q, qi) => (
        <div
          key={q.id}
          className="border border-gray-200 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
              {qi + 1}
            </span>
            <input
              type="text"
              value={q.text}
              onChange={(e) => updateQuestion(qi, "text", e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Texte de la question"
            />
            <button
              type="button"
              onClick={() => removeQuestion(qi)}
              className="p-1 text-red-400 hover:text-red-600 transition-colors"
              title="Supprimer la question"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="ml-8 space-y-2">
            {q.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct_${q.id}`}
                  checked={q.correctOptionId === opt.id}
                  onChange={() => setCorrect(qi, opt.id)}
                  className="text-purple-600 flex-shrink-0"
                  title="Réponse correcte"
                />
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateOption(qi, opt.id, e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-400"
                  placeholder="Libellé de l'option"
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(qi, opt.id)}
                    className="p-0.5 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(qi)}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              + Ajouter une option
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-600 text-sm rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
      >
        + Ajouter une question
      </button>
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

const SectionManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState(new Set());

  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);

  // Form states
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    order: 0,
    estimatedDuration: "",
  });

  const EMPTY_ITEM_FORM = {
    title: "",
    title_ar: "",
    description: "",
    type: "video",
    videoUrl: "",
    pdfUrl: "",
    textContent: "",
    quizData: [],
    quizPassingScore: 80,
    maxAttempts: 3,
    itemOrder: 0,
    estimatedDuration: "",
    isRequired: false,
  };
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);

  // Viewer state
  const [viewingItem, setViewingItem] = useState(null);

  const fetchCourseAndSections = useCallback(async () => {
    try {
      setLoading(true);
      const [courseResponse, sectionsResponse] = await Promise.all([
        coursesAPI.getCourseDetails(courseId),
        coursesAPI.getCourseSections(courseId),
      ]);
      setCourse(courseResponse.course);
      setSections(sectionsResponse.sections || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger les données du cours",
      });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseAndSections();
  }, [fetchCourseAndSections]);

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getItemIcon = (type) => {
    switch (type) {
      case "video":
        return PlayIcon;
      case "pdf":
        return DocumentTextIcon;
      case "text":
        return BookOpenIcon;
      case "quiz":
        return AcademicCapIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getItemTypeColor = (type) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-700";
      case "pdf":
        return "bg-blue-100 text-blue-700";
      case "text":
        return "bg-green-100 text-green-700";
      case "quiz":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getItemTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Vidéo";
      case "pdf":
        return "PDF";
      case "text":
        return "Texte";
      case "quiz":
        return "Quiz";
      default:
        return type;
    }
  };

  const handleAddSection = () => {
    setEditingSection(null);
    setSectionForm({
      title: "",
      description: "",
      order: sections.length + 1,
      estimatedDuration: "",
    });
    setShowSectionModal(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionForm({
      title: section.title,
      description: section.description || "",
      order: section.order || 0,
      estimatedDuration: section.estimatedDuration || "",
    });
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    try {
      if (editingSection) {
        await coursesAPI.updateSection(editingSection.id, sectionForm);
        Swal.fire({
          icon: "success",
          title: "Section mise à jour",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await coursesAPI.createSection(courseId, sectionForm);
        Swal.fire({
          icon: "success",
          title: "Section créée",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setShowSectionModal(false);
      await fetchCourseAndSections();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: editingSection
          ? "Impossible de mettre à jour la section"
          : "Impossible de créer la section",
      });
    }
  };

  const handleAddItem = (sectionId) => {
    setCurrentSectionId(sectionId);
    setEditingItem(null);
    setItemForm(EMPTY_ITEM_FORM);
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    let parsedQuiz = [];
    try {
      parsedQuiz =
        typeof item.quizData === "string"
          ? JSON.parse(item.quizData)
          : item.quizData || [];
    } catch {
      parsedQuiz = [];
    }
    setItemForm({
      title: item.title || "",
      title_ar: item.title_ar || "",
      description: item.description || "",
      type: item.type || "video",
      videoUrl: item.videoUrl || "",
      pdfUrl: item.pdfUrl || "",
      textContent: item.textContent || "",
      quizData: parsedQuiz,
      quizPassingScore: item.quizPassingScore ?? 80,
      maxAttempts: item.maxAttempts ?? 3,
      itemOrder: item.itemOrder ?? item.order ?? 0,
      estimatedDuration: item.estimatedDuration || "",
      isRequired: item.isRequired || false,
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    try {
      const payload = {
        ...itemForm,
        quizData:
          itemForm.type === "quiz"
            ? JSON.stringify(itemForm.quizData)
            : undefined,
      };
      if (editingItem) {
        await coursesAPI.updateSectionItem(editingItem.id, payload);
        Swal.fire({
          icon: "success",
          title: "Élément mis à jour",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await coursesAPI.createSectionItem(currentSectionId, payload);
        Swal.fire({
          icon: "success",
          title: "Élément créé",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setShowItemModal(false);
      await fetchCourseAndSections();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: editingItem
          ? "Impossible de mettre à jour l'élément"
          : "Impossible de créer l'élément",
      });
    }
  };

  const handleDeleteSection = async (sectionId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Supprimer la section",
      text: "Êtes-vous sûr de vouloir supprimer cette section et tout son contenu ?",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });

    if (result.isConfirmed) {
      try {
        await coursesAPI.deleteSection(sectionId);
        await fetchCourseAndSections();
        Swal.fire({
          icon: "success",
          title: "Section supprimée",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de supprimer la section",
        });
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Supprimer l'élément",
      text: "Êtes-vous sûr de vouloir supprimer cet élément ?",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });

    if (result.isConfirmed) {
      try {
        await coursesAPI.deleteSectionItem(itemId);
        await fetchCourseAndSections();
        Swal.fire({
          icon: "success",
          title: "Élément supprimé",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de supprimer l'élément",
        });
      }
    }
  };

  const handleMoveSection = async (sectionIndex, direction) => {
    const newSections = [...sections];
    const swapIndex = sectionIndex + direction;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;

    const aOrder = newSections[sectionIndex].order;
    const bOrder = newSections[swapIndex].order;

    // Swap optimistically in state
    const temp = { ...newSections[sectionIndex] };
    newSections[sectionIndex] = {
      ...newSections[swapIndex],
      order: aOrder,
    };
    newSections[swapIndex] = { ...temp, order: bOrder };
    setSections(newSections);

    try {
      await Promise.all([
        coursesAPI.updateSection(newSections[sectionIndex].id, {
          order: aOrder,
        }),
        coursesAPI.updateSection(newSections[swapIndex].id, {
          order: bOrder,
        }),
      ]);
    } catch {
      // Revert on error
      await fetchCourseAndSections();
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de réordonner les sections",
      });
    }
  };

  const handleMoveItem = async (sectionId, itemIndex, direction) => {
    const sectionIdx = sections.findIndex((s) => s.id === sectionId);
    if (sectionIdx === -1) return;
    const items = [...sections[sectionIdx].items];
    const swapIndex = itemIndex + direction;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    const aOrder =
      items[itemIndex].itemOrder ?? items[itemIndex].order ?? itemIndex;
    const bOrder =
      items[swapIndex].itemOrder ?? items[swapIndex].order ?? swapIndex;

    // Swap optimistically
    const temp = { ...items[itemIndex] };
    items[itemIndex] = {
      ...items[swapIndex],
      itemOrder: aOrder,
      order: aOrder,
    };
    items[swapIndex] = { ...temp, itemOrder: bOrder, order: bOrder };
    const newSections = sections.map((s, i) =>
      i === sectionIdx ? { ...s, items } : s,
    );
    setSections(newSections);

    try {
      await Promise.all([
        coursesAPI.updateSectionItem(items[itemIndex].id, {
          itemOrder: aOrder,
        }),
        coursesAPI.updateSectionItem(items[swapIndex].id, {
          itemOrder: bOrder,
        }),
      ]);
    } catch {
      await fetchCourseAndSections();
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de réordonner les éléments",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/Courses/${courseId}`)}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Retour au cours
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des sections
                </h1>
                <p className="text-gray-600">
                  {course?.Title} - Organisez votre contenu en sections
                </p>
              </div>
            </div>

            <button
              onClick={handleAddSection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Ajouter une section
            </button>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{course?.Title}</h3>
              <p className="text-sm text-gray-600">
                {sections.length} section
                {sections.length !== 1 ? "s" : ""} •{" "}
                {sections.reduce(
                  (total, section) => total + (section.items?.length || 0),
                  0,
                )}{" "}
                élément
                {sections.reduce(
                  (total, section) => total + (section.items?.length || 0),
                  0,
                ) !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Statut</p>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  course?.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {course?.status === "published" ? "Publié" : "Brouillon"}
              </span>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune section créée
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer votre première section pour organiser votre
                contenu
              </p>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Créer la première section
              </button>
            </div>
          ) : (
            sections.map((section, index) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {section.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            {section.items?.length || 0} élément
                            {section.items?.length !== 1 ? "s" : ""}
                          </span>
                          {section.estimatedDuration && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {section.estimatedDuration} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleMoveSection(index, -1)}
                          disabled={index === 0}
                          className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                          title="Monter"
                        >
                          <ChevronUpIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(index, 1)}
                          disabled={index === sections.length - 1}
                          className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                          title="Descendre"
                        >
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleEditSection(section)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                {expandedSections.has(section.id) && (
                  <div className="p-4">
                    {/* Section Description */}
                    {section.description && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: section.description,
                          }}
                        />
                      </div>
                    )}

                    {/* Add Item Button */}
                    <div className="mb-4">
                      <button
                        onClick={() => handleAddItem(section.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Ajouter un élément
                      </button>
                    </div>

                    {/* Section Items */}
                    <div className="space-y-3">
                      {section.items && section.items.length > 0 ? (
                        section.items.map((item, itemIndex) => {
                          const IconComponent = getItemIcon(item.type);
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                              <div className="flex-shrink-0 text-gray-400">
                                <span className="text-xs">{itemIndex + 1}</span>
                              </div>
                              <div className="flex-shrink-0">
                                <IconComponent className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900">
                                  {item.title}
                                </h6>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded ${getItemTypeColor(
                                      item.type,
                                    )}`}
                                  >
                                    {getItemTypeLabel(item.type)}
                                  </span>
                                  {item.estimatedDuration && (
                                    <span className="flex items-center gap-1">
                                      <ClockIcon className="w-3 h-3" />
                                      {item.estimatedDuration} min
                                    </span>
                                  )}
                                  {item.isRequired && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                      Obligatoire
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <button
                                    onClick={() =>
                                      handleMoveItem(section.id, itemIndex, -1)
                                    }
                                    disabled={itemIndex === 0}
                                    className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                                    title="Monter"
                                  >
                                    <ChevronUpIcon className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleMoveItem(section.id, itemIndex, 1)
                                    }
                                    disabled={
                                      itemIndex ===
                                      (section.items?.length ?? 0) - 1
                                    }
                                    className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                                    title="Descendre"
                                  >
                                    <ChevronDownIcon className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => setViewingItem(item)}
                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Prévisualiser"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">
                            Aucun élément dans cette section
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {editingSection
                        ? "Modifier la section"
                        : "Nouvelle section"}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre *
                        </label>
                        <input
                          type="text"
                          value={sectionForm.title}
                          onChange={(e) =>
                            setSectionForm({
                              ...sectionForm,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Titre de la section"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={sectionForm.description}
                          onChange={(e) =>
                            setSectionForm({
                              ...sectionForm,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Description de la section"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durée estimée (minutes)
                        </label>
                        <input
                          type="number"
                          value={sectionForm.estimatedDuration}
                          onChange={(e) =>
                            setSectionForm({
                              ...sectionForm,
                              estimatedDuration: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ordre
                        </label>
                        <input
                          type="number"
                          value={sectionForm.order}
                          onChange={(e) =>
                            setSectionForm({
                              ...sectionForm,
                              order: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveSection}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingSection ? "Mettre à jour" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {editingItem ? "Modifier l'élément" : "Nouvel élément"}
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titre *
                          </label>
                          <input
                            type="text"
                            value={itemForm.title}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Titre de l'élément"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type *
                          </label>
                          <select
                            value={itemForm.type}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="video">Vidéo</option>
                            <option value="text">Texte</option>
                            <option value="pdf">PDF</option>
                            <option value="quiz">Quiz</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={itemForm.description}
                          onChange={(e) =>
                            setItemForm({
                              ...itemForm,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Description de l'élément"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contenu *
                        </label>
                        {itemForm.type === "video" && (
                          <input
                            type="text"
                            value={itemForm.videoUrl}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                videoUrl: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom de fichier ou chemin de la vidéo (ex: Course-1-abc.mp4)"
                          />
                        )}
                        {itemForm.type === "text" && (
                          <textarea
                            value={itemForm.textContent}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                textContent: e.target.value,
                              })
                            }
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contenu textuel (HTML supporté)"
                          />
                        )}
                        {itemForm.type === "pdf" && (
                          <input
                            type="text"
                            value={itemForm.pdfUrl}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                pdfUrl: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom de fichier ou chemin du PDF (ex: Course-1-abc.pdf)"
                          />
                        )}
                        {itemForm.type === "quiz" && (
                          <QuizEditor
                            quizData={itemForm.quizData}
                            onChange={(quizData) =>
                              setItemForm({ ...itemForm, quizData })
                            }
                            passingScore={itemForm.quizPassingScore}
                            onPassingScoreChange={(val) =>
                              setItemForm({
                                ...itemForm,
                                quizPassingScore: val,
                              })
                            }
                            maxAttempts={itemForm.maxAttempts}
                            onMaxAttemptsChange={(val) =>
                              setItemForm({ ...itemForm, maxAttempts: val })
                            }
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Durée estimée (min)
                          </label>
                          <input
                            type="number"
                            value={itemForm.estimatedDuration}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                estimatedDuration: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="10"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ordre
                          </label>
                          <input
                            type="number"
                            value={itemForm.itemOrder}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                itemOrder: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={itemForm.isRequired}
                              onChange={(e) =>
                                setItemForm({
                                  ...itemForm,
                                  isRequired: e.target.checked,
                                })
                              }
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              Obligatoire
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveItem}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingItem ? "Mettre à jour" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Media / Quiz preview modal */}
      <AdminMediaViewer
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        courseId={courseId}
        item={viewingItem}
      />
    </div>
  );
};

export default SectionManagement;
