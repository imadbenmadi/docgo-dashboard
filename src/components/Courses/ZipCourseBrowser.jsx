import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import apiClient from "../../utils/apiClient";
import { buildApiUrl } from "../../utils/apiBaseUrl";

const getExtension = (name = "") => {
  const idx = name.lastIndexOf(".");
  if (idx === -1) return "";
  return name.slice(idx + 1).toLowerCase();
};

const isProbablyText = (file) => {
  const mime = String(file?.mimeType || "").toLowerCase();
  if (mime.startsWith("text/")) return true;

  const ext = getExtension(file?.name);
  return ["txt", "md", "csv", "json", "log", "xml", "yml", "yaml"].includes(
    ext,
  );
};

const getPreviewKind = (file) => {
  const mime = String(file?.mimeType || "").toLowerCase();
  const ext = getExtension(file?.name);

  if (mime.startsWith("video/") || ["mp4", "webm", "mov"].includes(ext)) {
    return "video";
  }
  if (mime === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  if (
    mime.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
  ) {
    return "image";
  }
  if (isProbablyText(file)) {
    return "text";
  }
  if (["doc", "docx"].includes(ext)) {
    return "doc";
  }
  return "unknown";
};

export default function ZipCourseBrowser({ courseId }) {
  const { t } = useTranslation();

  const [files, setFiles] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [textPreview, setTextPreview] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  const currentPath = useMemo(
    () => (breadcrumb.length ? breadcrumb[breadcrumb.length - 1].path : null),
    [breadcrumb],
  );

  const listEndpoint = useMemo(() => {
    const base = `/Admin/courses/${courseId}/zip/files`;
    return currentPath
      ? `${base}?parentPath=${encodeURIComponent(currentPath)}`
      : base;
  }, [courseId, currentPath]);

  const contentPath = useMemo(() => {
    if (!selectedFile?.id) return null;
    return `/Admin/courses/${courseId}/zip/files/${selectedFile.id}/content`;
  }, [courseId, selectedFile?.id]);

  const contentUrl = useMemo(() => {
    if (!contentPath) return null;
    return buildApiUrl(contentPath);
  }, [contentPath]);

  const fetchFiles = async () => {
    if (!courseId) return;

    setLoading(true);
    setError("");

    try {
      const res = await apiClient.get(listEndpoint);
      if (res.data?.success) {
        setFiles(res.data.data?.files || []);
      } else {
        setFiles([]);
        setError(
          res.data?.message || t("failedLoadFiles", "Failed to load files"),
        );
      }
    } catch (err) {
      setFiles([]);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t("failedLoadFiles", "Failed to load files");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEndpoint]);

  useEffect(() => {
    const loadTextPreview = async () => {
      setTextPreview("");
      if (!selectedFile || selectedFile.isDirectory) return;

      const kind = getPreviewKind(selectedFile);
      if (kind !== "text" || !contentPath) return;

      setTextLoading(true);
      try {
        const res = await apiClient.get(contentPath, {
          responseType: "text",
          transformResponse: [(data) => data],
        });
        setTextPreview(String(res.data || ""));
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          t("failedLoadFiles", "Failed to load files");
        setTextPreview(message);
      } finally {
        setTextLoading(false);
      }
    };

    loadTextPreview();
  }, [contentPath, contentUrl, selectedFile, t]);

  const handleOpen = (file) => {
    if (file.isDirectory) {
      setSelectedFile(null);
      setBreadcrumb((prev) => [...prev, { name: file.name, path: file.path }]);
      return;
    }

    setSelectedFile(file);
  };

  const handleRootClick = () => {
    setSelectedFile(null);
    setBreadcrumb([]);
  };

  const handleBreadcrumbClick = (idx) => {
    setSelectedFile(null);
    setBreadcrumb((prev) => prev.slice(0, idx + 1));
  };

  const previewKind = useMemo(() => {
    if (!selectedFile || selectedFile.isDirectory) return null;
    return getPreviewKind(selectedFile);
  }, [selectedFile]);

  const canTogglePreviewExpand = useMemo(() => {
    // Keep it simple: allow expand for any selected file (even when preview is unavailable)
    // so the admin can still use the larger panel for download/open actions.
    return Boolean(selectedFile);
  }, [selectedFile]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div
        className={`${
          isPreviewExpanded ? "lg:col-span-1" : "lg:col-span-2"
        } border border-gray-200 rounded-lg overflow-hidden`}
      >
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900">
              {t("zipExplorer", "ZIP Explorer")}
            </div>
            <div className="text-xs text-gray-600">
              {t(
                "zipExplorerHint",
                "Click folders to navigate and files to preview.",
              )}
            </div>
          </div>
          {breadcrumb.length > 0 && (
            <button
              type="button"
              onClick={handleRootClick}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {t("backToRoot", "Back to root")}
            </button>
          )}
        </div>

        {breadcrumb.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-200 text-sm">
            <button
              type="button"
              onClick={handleRootClick}
              className="text-blue-600 hover:text-blue-700"
            >
              {t("root", "Root")}
            </button>
            {breadcrumb.map((b, idx) => (
              <span key={b.path}>
                <span className="mx-2 text-gray-400">/</span>
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(idx)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {b.name}
                </button>
              </span>
            ))}
          </div>
        )}

        {loading && (
          <div className="p-4 text-sm text-gray-600">
            {t("loading", "Loading...")}
          </div>
        )}

        {error && !loading && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="divide-y divide-gray-100">
            {files.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">
                {t("noFiles", "No files in this directory")}
              </div>
            ) : (
              files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleOpen(file)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {file.isDirectory ? "📁" : "📄"} {file.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {file.isDirectory
                        ? t("folder", "Folder")
                        : file.mimeType || t("file", "File")}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 ml-3 shrink-0">
                    {file.isDirectory ? "" : "Preview"}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div
        className={`${
          isPreviewExpanded ? "lg:col-span-2" : "lg:col-span-1"
        } border border-gray-200 rounded-lg overflow-hidden`}
      >
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">
              {t("preview", "Preview")}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {selectedFile
                ? selectedFile.name
                : t("selectFile", "Select a file")}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewExpanded((v) => !v)}
            disabled={!canTogglePreviewExpand}
            className={`text-sm px-3 py-1.5 rounded-md border ${
              canTogglePreviewExpand
                ? "border-gray-300 text-gray-800 hover:bg-gray-100"
                : "border-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            title={
              isPreviewExpanded
                ? t("collapsePreview", "Collapse preview")
                : t("expandPreview", "Expand preview")
            }
          >
            {isPreviewExpanded
              ? t("collapse", "Collapse")
              : t("expand", "Expand")}
          </button>
        </div>

        <div className="p-4">
          {!selectedFile && (
            <div className="text-sm text-gray-600">
              {t("previewHint", "Select a file to preview it here.")}
            </div>
          )}

          {selectedFile && selectedFile.isDirectory && (
            <div className="text-sm text-gray-600">
              {t("folderSelected", "Folder selected. Open it to browse.")}
            </div>
          )}

          {selectedFile && !selectedFile.isDirectory && !contentUrl && (
            <div className="text-sm text-gray-600">
              {t("previewUnavailable", "Preview unavailable")}
            </div>
          )}

          {selectedFile &&
            !selectedFile.isDirectory &&
            contentUrl &&
            (() => {
              const kind = previewKind;

              if (kind === "video") {
                return (
                  <video
                    src={contentUrl}
                    controls
                    className={`${
                      isPreviewExpanded ? "h-[70vh]" : ""
                    } w-full rounded-md bg-black`}
                  />
                );
              }

              if (kind === "pdf") {
                return (
                  <iframe
                    title={selectedFile.name}
                    src={contentUrl}
                    className={`w-full ${
                      isPreviewExpanded ? "h-[70vh]" : "h-96"
                    } rounded-md border border-gray-200`}
                  />
                );
              }

              if (kind === "image") {
                return (
                  <img
                    src={contentUrl}
                    alt={selectedFile.name}
                    className={`${
                      isPreviewExpanded ? "max-h-[70vh]" : ""
                    } w-full rounded-md border border-gray-200 object-contain`}
                  />
                );
              }

              if (kind === "text") {
                return (
                  <div>
                    {textLoading ? (
                      <div className="text-sm text-gray-600">
                        {t("loading", "Loading...")}
                      </div>
                    ) : (
                      <pre
                        className={`text-xs whitespace-pre-wrap break-words bg-gray-50 border border-gray-200 rounded-md p-3 ${
                          isPreviewExpanded ? "max-h-[70vh]" : "max-h-96"
                        } overflow-auto`}
                      >
                        {textPreview}
                      </pre>
                    )}
                  </div>
                );
              }

              if (kind === "doc") {
                return (
                  <div className="text-sm text-gray-700 space-y-2">
                    <div>
                      {t(
                        "docPreviewNotAvailable",
                        "DOC/DOCX preview isn't available in the browser. Download the file.",
                      )}
                    </div>
                    <a
                      href={contentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {t("download", "Download")}
                    </a>
                  </div>
                );
              }

              return (
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    {t(
                      "unsupportedPreview",
                      "This file type isn't supported for preview.",
                    )}
                  </div>
                  <a
                    href={contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t("open", "Open")}
                  </a>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}

ZipCourseBrowser.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
