import { useEffect, useState } from "react";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { coursesAPI } from "../../API/Courses";
import VideoPlayer from "./VideoPlayer";
import { buildApiUrl } from "../../utils/apiBaseUrl";
import apiClient from "../../utils/apiClient";
import RichTextDisplay from "./RichTextEditor/RichTextDisplay";

/** Extract just the filename from a stored path that may be a full URL or
 *  a server-relative path like /uploads/videos/Course-1-abc.mp4 */
function extractFilename(urlOrPath) {
  if (!urlOrPath) return "";
  const parts = urlOrPath.split(/[\\/]/);
  return parts[parts.length - 1].split("?")[0];
}

/** Read-only quiz question viewer */
const QuizViewer = ({ quizData, quizPassingScore, maxAttempts }) => {
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

  const normalizedQuiz = parsePossiblyJson(quizData);

  const questions = Array.isArray(normalizedQuiz)
    ? normalizedQuiz
    : Array.isArray(normalizedQuiz?.questions)
      ? normalizedQuiz.questions
      : [];

  const normalizeType = (type) => {
    if (type === "multiple-choice" || type === "multiple_choice")
      return "multiple_choice";
    if (type === "true-false" || type === "true_false") return "true_false";
    if (type === "short-answer" || type === "short_answer")
      return "short_answer";
    return "multiple_choice";
  };

  const getOptionId = (opt, idx) => {
    if (opt && typeof opt === "object") {
      return String(opt.id || opt.value || opt.label || opt.text || idx);
    }
    return String(opt ?? idx);
  };

  const getOptionLabel = (opt) => {
    if (opt && typeof opt === "object") {
      return String(opt.label || opt.text || opt.value || opt.id || "");
    }
    return String(opt ?? "");
  };

  const correctIdsForQuestion = (q, opts) => {
    // Multi-correct support (IDs)
    if (Array.isArray(q?.correctAnswers) && q.correctAnswers.length > 0) {
      // correctAnswers may be indices (from builder) or ids
      if (q.correctAnswers.every((v) => typeof v === "number")) {
        return q.correctAnswers
          .map((i) => {
            const opt = opts?.[i];
            return opt ? getOptionId(opt, i) : null;
          })
          .filter(Boolean);
      }
      return q.correctAnswers.map((v) => String(v));
    }

    const single =
      q?.correctOptionId ?? q?.correctAnswer ?? q?.correct_answer ?? null;
    if (typeof single === "number") {
      const opt = opts?.[single];
      return opt ? [getOptionId(opt, single)] : [];
    }
    return single ? [String(single)] : [];
  };

  const formatTrueFalse = (value) => {
    if (typeof value === "boolean") return value ? "Vrai" : "Faux";
    const v = String(value ?? "")
      .trim()
      .toLowerCase();
    if (v === "true" || v === "vrai") return "Vrai";
    if (v === "false" || v === "faux") return "Faux";
    return String(value ?? "").trim();
  };

  if (typeof quizData === "string" && typeof normalizedQuiz === "string") {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        Données du quiz invalides (JSON malformé)
      </div>
    );
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Aucune question dans ce quiz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz meta */}
      <div className="flex gap-6 pb-4 border-b border-gray-200 text-sm text-gray-600">
        <span>
          <span className="font-medium text-gray-800">Score de passage :</span>{" "}
          {quizPassingScore ?? 80}%
        </span>
        <span>
          <span className="font-medium text-gray-800">Tentatives max :</span>{" "}
          {maxAttempts ?? 3}
        </span>
        <span>
          <span className="font-medium text-gray-800">Questions :</span>{" "}
          {questions.length}
        </span>
      </div>

      {questions.map((q, qi) => {
        const qType = normalizeType(q?.type);
        const title = q?.text || q?.question || "";
        const opts = Array.isArray(q?.options) ? q.options : [];
        const correctIds = new Set(correctIdsForQuestion(q, opts));

        return (
          <div key={q.id || qi} className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-3">
              <span className="text-blue-600 mr-2">Q{qi + 1}.</span>
              {title}
            </p>

            {qType === "short_answer" ? (
              <div className="p-3 bg-white border border-gray-200 rounded-md text-sm">
                <span className="font-medium text-gray-700">Réponse :</span>{" "}
                <span className="text-green-700 font-semibold">
                  {String(q?.correctAnswer ?? q?.correct_answer ?? "").trim() ||
                    "—"}
                </span>
              </div>
            ) : qType === "true_false" ? (
              <div className="p-3 bg-white border border-gray-200 rounded-md text-sm">
                <span className="font-medium text-gray-700">Correct :</span>{" "}
                <span className="text-green-700 font-semibold">
                  {formatTrueFalse(
                    q?.correctAnswer ?? q?.correct_answer ?? q?.correctOptionId,
                  ) || "—"}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {opts.map((opt, idx) => {
                  const optId = getOptionId(opt, idx);
                  const label = getOptionLabel(opt);
                  const isCorrect = correctIds.has(String(optId));
                  return (
                    <div
                      key={optId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md border text-sm ${
                        isCorrect
                          ? "bg-green-50 border-green-400 text-green-800 font-semibold"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center text-xs font-bold ${
                          isCorrect
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isCorrect && "✓"}
                      </span>
                      {label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * AdminMediaViewer
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - courseId: string | number
 *  - item: { type, title, videoUrl, pdfUrl, textContent, textContent_ar,
 *            quizData, quizPassingScore, maxAttempts }
 */
const AdminMediaViewer = ({ isOpen, onClose, courseId, item }) => {
  const [streamUrl, setStreamUrl] = useState(null);
  const [loadingStream, setLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdfPreview, setLoadingPdfPreview] = useState(false);

  // Fetch signed stream URL whenever the modal opens for a video or pdf
  useEffect(() => {
    if (!isOpen || !item) return;
    if (item.type !== "video" && item.type !== "pdf") return;

    const rawPath = item.type === "video" ? item.videoUrl : item.pdfUrl;
    const filename = extractFilename(rawPath);

    if (!filename) {
      setStreamError("Aucun fichier associé à cet élément.");
      return;
    }

    let cancelled = false;
    setStreamUrl(null);
    setStreamError(null);
    setLoadingStream(true);

    coursesAPI
      .getAdminStreamToken(courseId, item.type, filename)
      .then(({ streamPath }) => {
        if (!cancelled) setStreamUrl(buildApiUrl(streamPath));
      })
      .catch((err) => {
        if (!cancelled)
          setStreamError(
            err?.response?.data?.error ||
              "Impossible de charger le flux sécurisé.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingStream(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, item, courseId]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setStreamUrl(null);
      setStreamError(null);
      setLoadingStream(false);
      setPdfBlobUrl(null);
      setLoadingPdfPreview(false);
    }
  }, [isOpen]);

  // Build a same-origin blob URL for PDF preview to avoid frame-policy issues.
  useEffect(() => {
    if (!isOpen || item?.type !== "pdf" || !streamUrl) {
      return;
    }

    let active = true;
    let objectUrl = null;
    setLoadingPdfPreview(true);
    setPdfBlobUrl(null);

    apiClient
      .get(streamUrl, { responseType: "blob" })
      .then((response) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(response.data);
        setPdfBlobUrl(objectUrl);
      })
      .catch(() => {
        if (active) {
          setPdfBlobUrl(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingPdfPreview(false);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, item?.type, streamUrl]);

  if (!isOpen || !item) return null;

  const { type, title, textContent, quizData, quizPassingScore, maxAttempts } =
    item;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden
                    ${type === "video" ? "w-[90vw] max-w-5xl" : "w-[90vw] max-w-3xl"}
                    max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full
                                ${type === "video" ? "bg-red-100 text-red-700" : ""}
                                ${type === "pdf" ? "bg-blue-100 text-blue-700" : ""}
                                ${type === "text" ? "bg-green-100 text-green-700" : ""}
                                ${type === "quiz" ? "bg-purple-100 text-purple-700" : ""}
                            `}
            >
              {type === "video" && "Vidéo"}
              {type === "pdf" && "PDF"}
              {type === "text" && "Texte"}
              {type === "quiz" && "Quiz"}
            </span>
            <h2 className="text-base font-semibold text-gray-900 truncate max-w-md">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto min-h-0">
          {/* ── VIDEO ─────────────────────────────────────── */}
          {type === "video" && (
            <div className="bg-black">
              {loadingStream && (
                <div className="flex items-center justify-center h-72 gap-3 text-white">
                  <ArrowPathIcon className="w-6 h-6 animate-spin" />
                  <span>Chargement du flux sécurisé...</span>
                </div>
              )}
              {streamError && (
                <div className="flex flex-col items-center justify-center h-72 gap-3 text-red-400 px-4 text-center">
                  <span className="text-4xl">⚠</span>
                  <p>{streamError}</p>
                </div>
              )}
              {streamUrl && !loadingStream && (
                <VideoPlayer src={streamUrl} title={title} />
              )}
            </div>
          )}

          {/* ── PDF ────────────────────────────────────────── */}
          {type === "pdf" && (
            <div className="h-[75vh]">
              {(loadingStream || loadingPdfPreview) && (
                <div className="flex items-center justify-center h-full gap-3 text-gray-600">
                  <ArrowPathIcon className="w-6 h-6 animate-spin" />
                  <span>Chargement du PDF sécurisé...</span>
                </div>
              )}
              {streamError && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-red-600 px-4 text-center">
                  <span className="text-4xl">⚠</span>
                  <p>{streamError}</p>
                </div>
              )}
              {pdfBlobUrl && !loadingStream && !loadingPdfPreview && (
                <iframe
                  src={pdfBlobUrl}
                  className="w-full h-full border-0"
                  title={title}
                />
              )}
              {streamUrl &&
                !pdfBlobUrl &&
                !loadingStream &&
                !loadingPdfPreview && (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
                    <p className="text-sm text-gray-600">
                      Prévisualisation intégrée indisponible. Ouvrez le PDF dans
                      un nouvel onglet.
                    </p>
                    <a
                      href={streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Ouvrir le PDF
                    </a>
                  </div>
                )}
            </div>
          )}

          {/* ── TEXT ───────────────────────────────────────── */}
          {type === "text" && (
            <div className="p-6">
              {textContent ? (
                <RichTextDisplay
                  content={textContent}
                  textClassName="prose prose-sm max-w-none text-gray-800"
                />
              ) : (
                <p className="text-gray-500 italic">
                  Aucun contenu textuel disponible.
                </p>
              )}
            </div>
          )}

          {/* ── QUIZ ───────────────────────────────────────── */}
          {type === "quiz" && (
            <div className="p-6">
              <QuizViewer
                quizData={quizData}
                quizPassingScore={quizPassingScore}
                maxAttempts={maxAttempts}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMediaViewer;
