import { useEffect, useState } from "react";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { coursesAPI } from "../../API/Courses";
import VideoPlayer from "./VideoPlayer";

const API_URL = import.meta.env.VITE_API_URL || "";

/** Extract just the filename from a stored path that may be a full URL or
 *  a server-relative path like /uploads/videos/Course-1-abc.mp4 */
function extractFilename(urlOrPath) {
  if (!urlOrPath) return "";
  const parts = urlOrPath.split(/[\\/]/);
  return parts[parts.length - 1].split("?")[0];
}

/** Read-only quiz question viewer */
const QuizViewer = ({ quizData, quizPassingScore, maxAttempts }) => {
  let questions = [];
  try {
    questions =
      typeof quizData === "string" ? JSON.parse(quizData) : quizData || [];
  } catch {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        Données du quiz invalides (JSON malformé)
      </div>
    );
  }

  if (!questions.length) {
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

      {questions.map((q, qi) => (
        <div key={q.id || qi} className="bg-gray-50 rounded-lg p-4">
          <p className="font-medium text-gray-900 mb-3">
            <span className="text-blue-600 mr-2">Q{qi + 1}.</span>
            {q.text}
          </p>
          <div className="space-y-2">
            {(q.options || []).map((opt) => {
              const isCorrect = opt.id === q.correctOptionId;
              return (
                <div
                  key={opt.id}
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
                  {opt.label}
                </div>
              );
            })}
          </div>
        </div>
      ))}
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
        if (!cancelled) setStreamUrl(`${API_URL}${streamPath}`);
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
    }
  }, [isOpen]);

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
              {loadingStream && (
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
              {streamUrl && !loadingStream && (
                <iframe
                  src={streamUrl}
                  className="w-full h-full border-0"
                  title={title}
                />
              )}
            </div>
          )}

          {/* ── TEXT ───────────────────────────────────────── */}
          {type === "text" && (
            <div className="p-6">
              {textContent ? (
                <div
                  className="prose prose-sm max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{ __html: textContent }}
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
