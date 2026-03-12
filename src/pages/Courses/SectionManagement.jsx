import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
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
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { coursesAPI } from "../../API/Courses";
import AdminMediaViewer from "../../components/Common/AdminMediaViewer";
import { RichTextEditor } from "../../components/Common/RichTextEditor";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

// ─── Video File Uploader ───────────────────────────────────────────────────────
const VideoFileUpload = ({ currentUrl, onUploaded }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(!!currentUrl);
  const [fileName, setFileName] = useState(
    currentUrl ? currentUrl.split("/").pop() : "",
  );
  const inputRef = useRef(null);

  useEffect(() => {
    if (currentUrl) {
      setDone(true);
      setFileName(currentUrl.split("/").pop());
    }
  }, [currentUrl]);

  const handleFile = useCallback(
    async (file) => {
      setError(null);
      const allowed = ["video/mp4", "video/webm", "video/quicktime"];
      if (!allowed.includes(file.type)) {
        setError("Seules les vidéos MP4, WebM et MOV sont acceptées.");
        return;
      }
      if (file.size > 2000 * 1024 * 1024) {
        setError("Fichier trop volumineux (max 2 GB).");
        return;
      }
      setUploading(true);
      setProgress(0);
      setDone(false);
      try {
        const fd = new FormData();
        fd.append("CourseVideo", file);
        const result = await coursesAPI.uploadSectionVideo(fd, (evt) => {
          if (evt.total)
            setProgress(Math.round((evt.loaded / evt.total) * 100));
        });
        setDone(true);
        setFileName(file.name);
        onUploaded(result.url);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Échec de l'upload. Réessayez.",
        );
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : done
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {uploading ? (
          <>
            <ArrowUpTrayIcon className="w-8 h-8 text-blue-500 animate-bounce" />
            <p className="text-sm font-medium text-blue-700">
              Téléversement… {progress}%
            </p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : done ? (
          <>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <p className="text-sm font-medium text-green-700 text-center break-all">
              {fileName}
            </p>
            <p className="text-xs text-green-600">
              Vidéo téléversée · cliquer pour remplacer
            </p>
          </>
        ) : (
          <>
            <PlayIcon className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 text-center">
              Cliquez ou glissez-déposez votre vidéo
            </p>
            <p className="text-xs text-gray-400">MP4, WebM, MOV · max 2 GB</p>
          </>
        )}
      </div>
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

VideoFileUpload.propTypes = {
  currentUrl: PropTypes.string,
  onUploaded: PropTypes.func.isRequired,
};

// ─── PDF File Uploader ─────────────────────────────────────────────────────────
const PdfFileUpload = ({ currentUrl, onUploaded }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(!!currentUrl);
  const [fileName, setFileName] = useState(
    currentUrl ? currentUrl.split("/").pop() : "",
  );
  const inputRef = useRef(null);

  useEffect(() => {
    if (currentUrl) {
      setDone(true);
      setFileName(currentUrl.split("/").pop());
    }
  }, [currentUrl]);

  const handleFile = useCallback(
    async (file) => {
      setError(null);
      if (file.type !== "application/pdf") {
        setError("Seuls les fichiers PDF sont acceptés.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("Fichier trop volumineux (max 50 MB).");
        return;
      }
      setUploading(true);
      setProgress(0);
      setDone(false);
      try {
        const fd = new FormData();
        fd.append("SectionPDF", file);
        const result = await coursesAPI.uploadSectionPDF(fd, (evt) => {
          if (evt.total)
            setProgress(Math.round((evt.loaded / evt.total) * 100));
        });
        setDone(true);
        setFileName(file.name);
        onUploaded(result.url);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Échec de l'upload. Réessayez.",
        );
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          dragging
            ? "border-red-500 bg-red-50"
            : done
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {uploading ? (
          <>
            <ArrowUpTrayIcon className="w-8 h-8 text-red-500 animate-bounce" />
            <p className="text-sm font-medium text-red-700">
              Uploading… {progress}%
            </p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : done ? (
          <>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <p className="text-sm font-medium text-green-700 text-center break-all">
              {fileName}
            </p>
            <p className="text-xs text-green-600">
              PDF uploadé · cliquer pour remplacer
            </p>
          </>
        ) : (
          <>
            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Glisser un PDF ici ou{" "}
              <span className="text-red-600 underline">parcourir</span>
            </p>
            <p className="text-xs text-gray-400">PDF uniquement · max 50 MB</p>
          </>
        )}
      </div>
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

PdfFileUpload.propTypes = {
  currentUrl: PropTypes.string,
  onUploaded: PropTypes.func.isRequired,
};

// ─── Inline Quiz Editor ────────────────────────────────────────────────────────
const makeId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;

const normalizeQuizData = (value) => {
  if (!value) return { type: "multiple-choice", questions: [] };
  if (Array.isArray(value))
    return { type: "multiple-choice", questions: value };
  if (typeof value === "object" && value) {
    return {
      type: value.type || "multiple-choice",
      questions: Array.isArray(value.questions) ? value.questions : [],
    };
  }
  return { type: "multiple-choice", questions: [] };
};

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options
    .map((opt, idx) => {
      if (opt && typeof opt === "object") {
        const id = String(opt.id || opt.value || opt.label || opt.text || "");
        const label = String(
          opt.label || opt.text || opt.value || opt.id || "",
        );
        return {
          id: id || `opt_${idx + 1}`,
          label,
        };
      }
      const label = String(opt ?? "");
      return { id: label || `opt_${idx + 1}`, label };
    })
    .filter((o) => o.id);
};

const buildTrueFalseOptionsFr = () => [
  { id: "Vrai", label: "Vrai" },
  { id: "Faux", label: "Faux" },
];

const normalizeQuizType = (type) => {
  if (type === "multiple_choice") return "multiple-choice";
  if (type === "true_false") return "true-false";
  if (type === "short_answer") return "short-answer";
  if (
    type === "multiple-choice" ||
    type === "true-false" ||
    type === "short-answer"
  )
    return type;
  return "multiple-choice";
};

const parsePossiblyJson = (value) => {
  let current = value;
  for (let i = 0; i < 2; i++) {
    if (typeof current !== "string") break;
    try {
      current = JSON.parse(current);
    } catch {
      break;
    }
  }
  return current;
};

const toSectionQuizCanonical = (rawQuizData) => {
  const normalized = normalizeQuizData(rawQuizData);
  const quizType = normalizeQuizType(rawQuizData?.type || normalized.type);
  const rawQuestions = Array.isArray(normalized.questions)
    ? normalized.questions
    : [];

  const questions = rawQuestions.map((q, idx) => {
    const qId = q?.id || makeId("q");
    const inferredType = normalizeQuizType(q?.type || quizType);
    const text = String(q?.text ?? q?.question ?? "").trim();
    const explanation = String(q?.explanation || "");

    if (inferredType === "short-answer") {
      const correctText = String(
        q?.correctAnswer ?? q?.correct_answer ?? "",
      ).trim();
      return {
        id: qId,
        order: q?.order ?? idx,
        type: "short_answer",
        text,
        correctAnswer: correctText,
        correct_answer: correctText,
        explanation,
      };
    }

    if (inferredType === "true-false") {
      const correctRaw =
        q?.correctAnswer ?? q?.correct_answer ?? q?.correctOptionId ?? null;
      const mapped =
        correctRaw === "True"
          ? "Vrai"
          : correctRaw === "False"
            ? "Faux"
            : correctRaw;

      return {
        id: qId,
        order: q?.order ?? idx,
        type: "true_false",
        text,
        options: buildTrueFalseOptionsFr(),
        correctOptionId: mapped ?? null,
        correctAnswer: mapped ?? null,
        correct_answer: mapped ?? null,
        explanation,
      };
    }

    // multiple-choice
    const options = Array.isArray(q?.options)
      ? q.options.every((o) => typeof o === "string")
        ? q.options.map((label, i) => ({
            id: String.fromCharCode(65 + i),
            label: String(label ?? ""),
          }))
        : normalizeOptions(q.options)
      : [];

    const correctAnswers =
      Array.isArray(q?.correctAnswers) && q.correctAnswers.length > 0
        ? q.correctAnswers
            .map((val) => {
              if (typeof val === "number") {
                const opt = options[val];
                return opt?.id ?? null;
              }
              return val;
            })
            .filter(Boolean)
        : null;

    const singleCorrect =
      q?.correctOptionId ?? q?.correctAnswer ?? q?.correct_answer ?? null;

    const correctIds = Array.isArray(correctAnswers)
      ? correctAnswers
      : singleCorrect
        ? [singleCorrect]
        : [];

    const primary = correctIds[0] ?? null;
    return {
      id: qId,
      order: q?.order ?? idx,
      type: "multiple_choice",
      text,
      options,
      correctAnswers: correctIds,
      correctOptionId: primary,
      correctAnswer: primary,
      correct_answer: primary,
      explanation,
    };
  });

  return { type: quizType, questions };
};

const toQuizBuilderData = (rawQuizData) => {
  // Converts existing stored quiz shapes to the EditQuiz-style builder shape
  const canonical = toSectionQuizCanonical(rawQuizData);
  const quizType = normalizeQuizType(canonical.type);

  const builderQuestions = (canonical.questions || []).map((q) => {
    const qType = normalizeQuizType(q.type);
    if (qType === "short-answer") {
      return {
        id: q.id,
        type: "short-answer",
        question: q.text,
        options: ["", "", "", ""],
        correctAnswer: String(q.correctAnswer || ""),
        correctAnswers: [],
      };
    }
    if (qType === "true-false") {
      return {
        id: q.id,
        type: "true-false",
        question: q.text,
        options: ["Vrai", "Faux"],
        correctAnswer:
          q.correctAnswer === "True"
            ? "Vrai"
            : q.correctAnswer === "False"
              ? "Faux"
              : String(q.correctAnswer || ""),
        correctAnswers: [],
      };
    }

    const options = Array.isArray(q.options)
      ? q.options.map((o) =>
          typeof o === "string" ? o : o.label || o.text || o.value || "",
        )
      : ["", "", "", ""]; // keep 4 inputs like old UI

    const correctIds =
      Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0
        ? q.correctAnswers
        : [q.correctOptionId || q.correctAnswer || q.correct_answer].filter(
            Boolean,
          );
    const indices = correctIds
      .map((id) => {
        const idx = Array.isArray(q.options)
          ? q.options.findIndex((o) =>
              typeof o === "string" ? o === id : String(o.id) === String(id),
            )
          : -1;
        return idx;
      })
      .filter((n) => n >= 0);

    return {
      id: q.id,
      type: "multiple-choice",
      question: q.text,
      options:
        options.length === 4
          ? options
          : [
              ...options,
              ...Array(Math.max(0, 4 - options.length)).fill(""),
            ].slice(0, 4),
      correctAnswer: "",
      correctAnswers: indices,
    };
  });

  return {
    title: "",
    description: "",
    type: quizType,
    questions: builderQuestions,
  };
};

const QuizEditor = ({
  quizData,
  onChange,
  passingScore,
  onPassingScoreChange,
  maxAttempts,
  onMaxAttemptsChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  onRequestClose,
  onSave,
}) => {
  const normalized = normalizeQuizData(quizData);
  const quizType = normalizeQuizType(normalized.type);
  const questions = Array.isArray(normalized.questions)
    ? normalized.questions
    : [];

  const [errors, setErrors] = useState({});
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    correctAnswers: [],
  });

  const commit = (patch) => onChange({ ...normalized, ...patch });

  const resetQuestionForm = () => {
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      correctAnswers: [],
    });
    setErrors({});
    setEditingQuestionId(null);
  };

  const validateQuestion = () => {
    const nextErrors = {};
    if (!String(newQuestion.question || "").trim()) {
      nextErrors.question = "La question est requise";
    }
    if (quizType === "multiple-choice") {
      const trimmed = (newQuestion.options || []).map((o) =>
        String(o || "").trim(),
      );
      const nonEmptyIndices = trimmed
        .map((val, idx) => (val ? idx : null))
        .filter((v) => v !== null);

      if (nonEmptyIndices.length < 2) {
        nextErrors.options = "Entrez au moins 2 options";
      }

      const selected = Array.isArray(newQuestion.correctAnswers)
        ? newQuestion.correctAnswers.filter((i) => nonEmptyIndices.includes(i))
        : [];

      if (selected.length === 0) {
        nextErrors.correctAnswer = "Sélectionnez au moins une bonne réponse";
      }
    } else if (quizType === "true-false") {
      if (!newQuestion.correctAnswer) {
        nextErrors.correctAnswer = "Sélectionnez la bonne réponse";
      }
    } else if (quizType === "short-answer") {
      if (!String(newQuestion.correctAnswer || "").trim()) {
        nextErrors.correctAnswer = "La réponse correcte est requise";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleQuizTypeChange = (type) => {
    commit({ type: normalizeQuizType(type) });
    resetQuestionForm();
  };

  const handleOptionChange = (index, value) => {
    const next = [...newQuestion.options];
    next[index] = value;
    setNewQuestion({ ...newQuestion, options: next });
  };

  const handleCorrectAnswerToggle = (index) => {
    const current = Array.isArray(newQuestion.correctAnswers)
      ? [...newQuestion.correctAnswers]
      : [];
    const idx = current.indexOf(index);
    if (idx > -1) current.splice(idx, 1);
    else current.push(index);
    setNewQuestion({ ...newQuestion, correctAnswers: current });
  };

  const handleTrueFalseClick = (value) => {
    setNewQuestion({ ...newQuestion, correctAnswer: value });
  };

  const handleAddOrUpdateQuestion = async () => {
    if (!validateQuestion()) {
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez corriger les erreurs dans la question.",
      });
      return;
    }

    const questionText = String(newQuestion.question || "").trim();

    const questionToAdd = {
      id: editingQuestionId || makeId("q"),
      question: questionText,
      type: quizType,
      options:
        quizType === "multiple-choice"
          ? [...newQuestion.options]
          : quizType === "true-false"
            ? ["Vrai", "Faux"]
            : null,
      correctAnswer:
        quizType === "multiple-choice" ? null : newQuestion.correctAnswer,
      correctAnswers:
        quizType === "multiple-choice" ? [...newQuestion.correctAnswers] : null,
    };

    if (quizType === "multiple-choice") {
      const trimmed = (newQuestion.options || []).map((o) =>
        String(o || "").trim(),
      );
      const keptOldIndices = trimmed
        .map((val, idx) => (val ? idx : null))
        .filter((v) => v !== null);
      const oldToNew = new Map();
      keptOldIndices.forEach((oldIdx, newIdx) => oldToNew.set(oldIdx, newIdx));

      const filteredOptions = keptOldIndices.map((oldIdx) => trimmed[oldIdx]);
      const selectedOld = Array.isArray(newQuestion.correctAnswers)
        ? newQuestion.correctAnswers.filter((i) => oldToNew.has(i))
        : [];
      const selectedNew = selectedOld.map((oldIdx) => oldToNew.get(oldIdx));

      questionToAdd.options = filteredOptions;
      questionToAdd.correctAnswers = selectedNew;
    }

    const updated = [...questions];
    if (editingQuestionId) {
      const idx = updated.findIndex((q) => q.id === editingQuestionId);
      if (idx !== -1) updated[idx] = questionToAdd;
    } else {
      updated.push(questionToAdd);
    }
    commit({ questions: updated });
    resetQuestionForm();
  };

  const handleEditQuestion = (question) => {
    const rawOptions = Array.isArray(question?.options) ? question.options : [];
    const optionLabels = rawOptions.map((o) =>
      typeof o === "string" ? o : o?.label || o?.text || o?.value || "",
    );
    const paddedOptions = (
      optionLabels.length === 4
        ? optionLabels
        : [
            ...optionLabels,
            ...Array(Math.max(0, 4 - optionLabels.length)).fill(""),
          ].slice(0, 4)
    ).map((s) => String(s || ""));

    let correctAnswers = [];
    if (Array.isArray(question?.correctAnswers)) {
      if (question.correctAnswers.every((v) => typeof v === "number")) {
        correctAnswers = question.correctAnswers;
      } else if (rawOptions.some((o) => o && typeof o === "object" && o.id)) {
        const idToIndex = new Map(
          rawOptions
            .map((o, idx) =>
              o && typeof o === "object" ? [String(o.id), idx] : null,
            )
            .filter(Boolean),
        );
        correctAnswers = question.correctAnswers
          .map((id) => idToIndex.get(String(id)))
          .filter((n) => Number.isInteger(n));
      }
    }

    setNewQuestion({
      question: question.question || question.text || "",
      options: paddedOptions,
      correctAnswer: question.correctAnswer || "",
      correctAnswers,
    });
    setEditingQuestionId(question.id);
  };

  const handleDeleteQuestion = async (questionId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Supprimer la question",
      text: "Êtes-vous sûr de vouloir supprimer cette question ?",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    commit({ questions: questions.filter((q) => q.id !== questionId) });
    if (editingQuestionId === questionId) resetQuestionForm();
  };

  const handleSaveQuizDraft = async () => {
    if (typeof onSave === "function") {
      onSave();
      return;
    }
    if (!String(title || "").trim()) {
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Le titre du quiz est requis",
      });
      return;
    }
    if (questions.length === 0) {
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Ajoutez au moins une question",
      });
      return;
    }
    await Swal.fire({
      icon: "success",
      title: "Quiz sauvegardé",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  const renderQuestionForm = () => {
    if (quizType === "multiple-choice") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Options de Réponse *
            </label>
            {errors.options && (
              <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {errors.options}
              </p>
            )}
            <div className="space-y-3">
              {newQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleCorrectAnswerToggle(index)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      newQuestion.correctAnswers.includes(index)
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-400"
                    }`}
                  >
                    {newQuestion.correctAnswers.includes(index) && (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                  </button>
                  <span className="text-gray-600 font-medium w-6">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            {errors.correctAnswer && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {errors.correctAnswer}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              💡 Cliquez sur les cases à cocher pour sélectionner les bonnes
              réponses
            </p>
          </div>
        </div>
      );
    }

    if (quizType === "true-false") {
      return (
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            Réponse Correcte *
          </label>
          {errors.correctAnswer && (
            <p className="text-red-500 text-sm mb-3 flex items-center gap-1">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {errors.correctAnswer}
            </p>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTrueFalseClick("Vrai")}
              className={`flex-1 px-6 py-4 rounded-xl border-2 font-medium transition-all transform hover:scale-105 ${
                newQuestion.correctAnswer === "Vrai"
                  ? "bg-green-500 border-green-500 text-white shadow-lg"
                  : "bg-white border-gray-300 text-gray-700 hover:border-green-400"
              }`}
            >
              ✓ Vrai
            </button>
            <button
              type="button"
              onClick={() => handleTrueFalseClick("Faux")}
              className={`flex-1 px-6 py-4 rounded-xl border-2 font-medium transition-all transform hover:scale-105 ${
                newQuestion.correctAnswer === "Faux"
                  ? "bg-red-500 border-red-500 text-white shadow-lg"
                  : "bg-white border-gray-300 text-gray-700 hover:border-red-400"
              }`}
            >
              ✗ Faux
            </button>
          </div>
        </div>
      );
    }

    // short-answer
    return (
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Réponse Correcte *
        </label>
        {errors.correctAnswer && (
          <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {errors.correctAnswer}
          </p>
        )}
        <input
          type="text"
          value={newQuestion.correctAnswer}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })
          }
          placeholder="Entrez la réponse correcte"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    );
  };

  const renderQuestionDisplay = (question) => {
    const qType = normalizeQuizType(question?.type);

    if (qType === "multiple-choice") {
      return (
        <div className="space-y-2">
          {(question.options || []).map((option, optIndex) => (
            <div key={optIndex} className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  question.correctAnswers?.includes(optIndex)
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {question.correctAnswers?.includes(optIndex) && (
                  <CheckCircleIcon className="w-3 h-3" />
                )}
              </div>
              <span className="text-gray-600 text-sm">
                {String.fromCharCode(65 + optIndex)}.
              </span>
              <span
                className={`text-sm ${
                  question.correctAnswers?.includes(optIndex)
                    ? "text-green-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                {option}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (qType === "true-false") {
      return (
        <div className="flex gap-4">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              question.correctAnswer === "Vrai"
                ? "bg-green-100 text-green-800 font-medium"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            ✓ Vrai
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              question.correctAnswer === "Faux"
                ? "bg-red-100 text-red-800 font-medium"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            ✗ Faux
          </span>
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <span className="text-green-800 font-medium">
          Réponse: {question.correctAnswer}
        </span>
      </div>
    );
  };

  return (
    <section className="mb-2">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <AcademicCapIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-800">
            Quiz d&apos;Évaluation
          </h2>
          <p className="text-gray-600 mt-1">
            Créez un quiz interactif pour évaluer les connaissances de vos
            étudiants
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestClose}
          className="px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <XMarkIcon className="w-5 h-5" />
          Fermer
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 mb-6 shadow-lg">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Titre du Quiz *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange?.(e.target.value)}
                placeholder="Entrez le titre du quiz"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Type de Quiz
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "multiple-choice",
                    label: "Choix Multiple",
                    icon: "☑️",
                  },
                  { value: "true-false", label: "Vrai/Faux", icon: "⚖️" },
                  {
                    value: "short-answer",
                    label: "Réponse Courte",
                    icon: "✍️",
                  },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleQuizTypeChange(type.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      quizType === type.value
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange?.(e.target.value)}
              placeholder="Décrivez le quiz et ses objectifs"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
            />
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {questions.length + 1}
              </span>
              {editingQuestionId
                ? "Modifier la Question"
                : "Ajouter une Question"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Question *
                </label>
                {errors.question && (
                  <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {errors.question}
                  </p>
                )}
                <textarea
                  value={newQuestion.question}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question: e.target.value })
                  }
                  placeholder="Entrez votre question"
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {renderQuestionForm()}

              <button
                type="button"
                onClick={handleAddOrUpdateQuestion}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
              >
                <PlusIcon className="w-5 h-5" />
                {editingQuestionId
                  ? "Modifier la Question"
                  : "Ajouter la Question"}
              </button>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  {questions.length}
                </span>
                Questions du Quiz
              </h3>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        Question {index + 1}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          aria-label="Modifier"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          aria-label="Supprimer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 pl-8">
                      {question.question || question.text}
                    </p>
                    <div className="pl-8">
                      {renderQuestionDisplay(question)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Score de réussite (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) =>
                  onPassingScoreChange?.(parseInt(e.target.value))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tentatives max
              </label>
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) =>
                  onMaxAttemptsChange?.(parseInt(e.target.value))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveQuizDraft}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Sauvegarder le Quiz
          </button>
        </div>
      </div>
    </section>
  );
};

QuizEditor.propTypes = {
  quizData: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  passingScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onPassingScoreChange: PropTypes.func,
  maxAttempts: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onMaxAttemptsChange: PropTypes.func,
  title: PropTypes.string,
  onTitleChange: PropTypes.func,
  description: PropTypes.string,
  onDescriptionChange: PropTypes.func,
  onRequestClose: PropTypes.func,
  onSave: PropTypes.func,
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
    quizData: { type: "multiple-choice", questions: [] },
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
    } catch {
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
    let parsedQuiz = { type: "multiple-choice", questions: [] };
    try {
      const raw = parsePossiblyJson(item.quizData);
      const builder = toQuizBuilderData(raw);
      parsedQuiz = { type: builder.type, questions: builder.questions };
    } catch {
      parsedQuiz = { type: "multiple-choice", questions: [] };
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
      // Validate quiz before sending to backend
      let canonicalQuizForSave = null;
      if (itemForm.type === "quiz") {
        if (!String(itemForm.title || "").trim()) {
          await Swal.fire({
            icon: "error",
            title: "Quiz incomplet",
            text: "Le titre du quiz est requis.",
          });
          return;
        }

        canonicalQuizForSave = toSectionQuizCanonical(itemForm.quizData);
        const questions = Array.isArray(canonicalQuizForSave.questions)
          ? canonicalQuizForSave.questions
          : [];

        if (questions.length === 0) {
          await Swal.fire({
            icon: "error",
            title: "Quiz incomplet",
            text: "Ajoutez au moins une question.",
          });
          return;
        }

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i] || {};
          const text = String(q.text || "").trim();
          const type = q.type;
          const options = Array.isArray(q.options) ? q.options : [];

          if (!text) {
            await Swal.fire({
              icon: "error",
              title: "Quiz incomplet",
              text: `La question #${i + 1} est vide.`,
            });
            return;
          }

          if (type === "multiple_choice") {
            if (options.length < 2) {
              await Swal.fire({
                icon: "error",
                title: "Quiz incomplet",
                text: `La question #${i + 1} doit avoir au moins 2 options.`,
              });
              return;
            }
            const hasEmpty = options.some((o) => !String(o.label || "").trim());
            if (hasEmpty) {
              await Swal.fire({
                icon: "error",
                title: "Quiz incomplet",
                text: `Remplissez toutes les options de la question #${i + 1}.`,
              });
              return;
            }
            const correctAnswers = Array.isArray(q.correctAnswers)
              ? q.correctAnswers
              : [];
            if (correctAnswers.length === 0) {
              await Swal.fire({
                icon: "error",
                title: "Quiz incomplet",
                text: `Choisissez au moins une bonne réponse pour la question #${i + 1}.`,
              });
              return;
            }
            const optionIds = new Set(options.map((o) => String(o.id)));
            const invalid = correctAnswers.some(
              (id) => !optionIds.has(String(id)),
            );
            if (invalid) {
              await Swal.fire({
                icon: "error",
                title: "Quiz incomplet",
                text: `Les bonnes réponses de la question #${i + 1} ne correspondent à aucune option.`,
              });
              return;
            }
          } else if (type === "true_false") {
            const correct =
              q.correctAnswer || q.correctOptionId || q.correct_answer;
            if (correct !== "Vrai" && correct !== "Faux") {
              await Swal.fire({
                icon: "error",
                title: "Quiz incomplet",
                text: `Choisissez Vrai ou Faux pour la question #${i + 1}.`,
              });
              return;
            }
          } else if (type === "short_answer") {
            const correct = String(
              q.correctAnswer || q.correct_answer || "",
            ).trim();
            if (!correct) {
              await Swal.fire({
                icon: "error",
                title: "Quiz incomplet",
                text: `La réponse correcte est requise pour la question #${i + 1}.`,
              });
              return;
            }
          }
        }
      }

      const payload = {
        ...itemForm,
        quizData:
          itemForm.type === "quiz"
            ? JSON.stringify(
                canonicalQuizForSave ||
                  toSectionQuizCanonical(itemForm.quizData),
              )
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
    } catch {
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
      } catch {
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
      } catch {
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
                          aria-label="Monter la section"
                        >
                          <ArrowUpIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(index, 1)}
                          disabled={index === sections.length - 1}
                          className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                          title="Descendre"
                          aria-label="Descendre la section"
                        >
                          <ArrowDownIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleEditSection(section)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Modifier la section"
                        aria-label="Modifier la section"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer la section"
                        aria-label="Supprimer la section"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={
                          expandedSections.has(section.id)
                            ? "Réduire"
                            : "Développer"
                        }
                        aria-label={
                          expandedSections.has(section.id)
                            ? "Réduire la section"
                            : "Développer la section"
                        }
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
                                    aria-label="Monter l'élément"
                                  >
                                    <ArrowUpIcon className="w-3 h-3" />
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
                                    aria-label="Descendre l'élément"
                                  >
                                    <ArrowDownIcon className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => setViewingItem(item)}
                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Prévisualiser"
                                  aria-label="Prévisualiser"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Modifier l'élément"
                                  aria-label="Modifier l'élément"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Supprimer l'élément"
                                  aria-label="Supprimer l'élément"
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
                        <RichTextEditor
                          value={sectionForm.description}
                          onChange={(val) =>
                            setSectionForm({
                              ...sectionForm,
                              description: val,
                            })
                          }
                          placeholder="Description de la section"
                          height="160px"
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

                      {itemForm.type === "video" && (
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow">
                              <PlayIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-gray-800">
                                Vidéos du Cours
                              </h2>
                              <p className="text-sm text-gray-600">
                                Ajoutez ou remplacez une vidéo pour cette
                                section
                              </p>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-5 border border-blue-100 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {editingItem
                                ? "Modifier la vidéo"
                                : "Ajouter une nouvelle vidéo"}
                            </h3>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Titre de la vidéo *
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Titre de la vidéo"
                              />
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Description de la vidéo"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fichier vidéo *
                              </label>
                              <VideoFileUpload
                                currentUrl={itemForm.videoUrl}
                                onUploaded={(url) =>
                                  setItemForm({ ...itemForm, videoUrl: url })
                                }
                              />
                            </div>
                          </div>
                        </div>
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
                          title={itemForm.title}
                          onTitleChange={(val) =>
                            setItemForm({ ...itemForm, title: val })
                          }
                          description={itemForm.description}
                          onDescriptionChange={(val) =>
                            setItemForm({ ...itemForm, description: val })
                          }
                          onRequestClose={() => setShowItemModal(false)}
                          onSave={handleSaveItem}
                        />
                      )}

                      {itemForm.type !== "video" &&
                        itemForm.type !== "quiz" && (
                          <>
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
                              {itemForm.type === "text" && (
                                <RichTextEditor
                                  value={itemForm.textContent}
                                  onChange={(val) =>
                                    setItemForm({
                                      ...itemForm,
                                      textContent: val,
                                    })
                                  }
                                  placeholder="Rédigez votre contenu ici…"
                                  height="260px"
                                />
                              )}
                              {itemForm.type === "pdf" && (
                                <PdfFileUpload
                                  currentUrl={itemForm.pdfUrl}
                                  onUploaded={(url) =>
                                    setItemForm({ ...itemForm, pdfUrl: url })
                                  }
                                />
                              )}
                            </div>
                          </>
                        )}

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
