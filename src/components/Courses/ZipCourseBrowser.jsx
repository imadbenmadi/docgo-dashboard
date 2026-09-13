import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import apiClient from "../../utils/apiClient";
import FilePreview from "../Common/FilePreview";

export default function ZipCourseBrowser({ courseId }) {
  const { t } = useTranslation();

  const [files, setFiles] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
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

      {/* The file itself.

          This column used to point <iframe>, <img> and <video> straight at the
          content endpoint. That endpoint checks the caller, and a subresource
          request does not carry the session, so every preview came back 401 -
          reported by the browser as a framing refusal, because the error page
          carries X-Frame-Options. FilePreview fetches through the API client
          and renders from a blob, which also renders Word documents instead of
          offering to download them.

          It is the same component the user website uses, and it opens full
          screen, so reading a course here is not a squint through a sidebar. */}
      <div
        className={`${
          isPreviewExpanded ? "lg:col-span-2" : "lg:col-span-1"
        } min-w-0`}
      >
        <div className="mb-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsPreviewExpanded((v) => !v)}
            disabled={!canTogglePreviewExpand}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              canTogglePreviewExpand
                ? "border-gray-300 text-gray-800 hover:bg-gray-100"
                : "cursor-not-allowed border-gray-200 text-gray-400"
            }`}
          >
            {isPreviewExpanded
              ? t("collapse", "Réduire")
              : t("expand", "Agrandir")}
          </button>
        </div>

        {selectedFile && selectedFile.isDirectory ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
            {t("folderSelected", "Dossier sélectionné. Ouvrez-le pour parcourir.")}
          </div>
        ) : (
          <FilePreview
            path={contentPath}
            name={selectedFile?.name}
            mimeType={selectedFile?.mimeType}
            size={selectedFile?.size}
            height={isPreviewExpanded ? "78vh" : "62vh"}
            emptyLabel={t(
              "previewHint",
              "Sélectionnez un fichier pour l'afficher ici.",
            )}
          />
        )}
      </div>
    </div>
  );
}

ZipCourseBrowser.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
