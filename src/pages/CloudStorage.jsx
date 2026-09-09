import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  File as FileIcon,
  FileText,
  Folder,
  FolderPlus,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import cloudStorageAPI from "../API/CloudStorage";

/**
 * Admin file manager over the Bunny storage zone.
 *
 * It only ever sees the walled-off admin-files/ prefix; course media,
 * certificates and payment receipts live elsewhere in the same zone and are
 * deliberately invisible here. The server enforces that - this page could not
 * reach them if it tried.
 */

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
const VIDEO_EXT = ["mp4", "webm", "mov", "mkv"];
const TEXT_EXT = [
  "txt", "md", "markdown", "csv", "json", "log",
  "yml", "yaml", "xml", "html", "css", "js", "ts", "sql",
];

const extensionOf = (name) => String(name).split(".").pop()?.toLowerCase() || "";

function iconFor(entry) {
  if (entry.isFolder) return Folder;
  const ext = extensionOf(entry.name);
  if (IMAGE_EXT.includes(ext)) return ImageIcon;
  if (VIDEO_EXT.includes(ext)) return Video;
  if (ext === "pdf" || TEXT_EXT.includes(ext)) return FileText;
  return FileIcon;
}

function formatSize(bytes) {
  const n = Number(bytes || 0);
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CloudStorage() {
  const [path, setPath] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);

  const breadcrumbs = useMemo(() => {
    const parts = path ? path.split("/") : [];
    return [
      { label: "Stockage", path: "" },
      ...parts.map((part, i) => ({
        label: part,
        path: parts.slice(0, i + 1).join("/"),
      })),
    ];
  }, [path]);

  const load = useCallback(async (target) => {
    setLoading(true);
    try {
      const data = await cloudStorageAPI.list(target);
      setEntries(data.entries || []);
    } catch (err) {
      // A refused path is the server doing its job; say so plainly rather than
      // leaving the previous folder's contents on screen looking current.
      setEntries([]);
      toast.error(
        err?.response?.data?.message || "Impossible de charger ce dossier",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsage = useCallback(async () => {
    try {
      setUsage(await cloudStorageAPI.usage(""));
    } catch {
      setUsage(null); // a summary failing is not worth an error toast
    }
  }, []);

  useEffect(() => {
    load(path);
  }, [path, load]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const refresh = () => {
    load(path);
    loadUsage();
  };

  const openEntry = async (entry) => {
    if (entry.isFolder) {
      setPath(entry.path);
      return;
    }
    setPreviewLoading(true);
    setPreview({ entry, data: null });
    try {
      const data = await cloudStorageAPI.preview(entry.path);
      setPreview({ entry, data });
    } catch (err) {
      setPreview(null);
      toast.error(err?.response?.data?.message || "Aperçu impossible");
    } finally {
      setPreviewLoading(false);
    }
  };

  const uploadFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    for (const file of list) {
      setUploading({ name: file.name, percent: 0 });
      try {
        await cloudStorageAPI.upload(path, file, (percent) =>
          setUploading({ name: file.name, percent }),
        );
        toast.success(`${file.name} envoyé`);
      } catch (err) {
        toast.error(
          `${file.name} : ${err?.response?.data?.message || "échec de l'envoi"}`,
        );
      }
    }
    setUploading(null);
    refresh();
  };

  const createFolder = async () => {
    const { value: name } = await Swal.fire({
      title: "Nouveau dossier",
      input: "text",
      inputPlaceholder: "Nom du dossier",
      showCancelButton: true,
      confirmButtonText: "Créer",
      cancelButtonText: "Annuler",
      inputValidator: (v) => (!v || !v.trim() ? "Le nom est requis" : undefined),
    });
    if (!name) return;

    try {
      await cloudStorageAPI.createFolder(path, name.trim());
      toast.success("Dossier créé");
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Création impossible");
    }
  };

  const remove = async (entry) => {
    // A folder delete takes everything inside it, so the confirmation says so
    // rather than asking a generic "are you sure?".
    const result = await Swal.fire({
      title: entry.isFolder ? "Supprimer le dossier ?" : "Supprimer le fichier ?",
      html: entry.isFolder
        ? `<b>${entry.name}</b> et tout son contenu seront supprimés définitivement.`
        : `<b>${entry.name}</b> sera supprimé définitivement.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      await cloudStorageAPI.remove(entry.path);
      toast.success("Supprimé");
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Suppression impossible");
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer?.files);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <HardDrive className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Stockage cloud
            </h1>
            <p className="text-sm text-gray-500">
              {usage
                ? `${usage.files} fichier${usage.files === 1 ? "" : "s"} · ${formatSize(usage.bytes)}`
                : "Espace de travail administrateur, séparé des médias de la plateforme"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={createFolder}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <FolderPlus className="w-4 h-4" />
            Nouveau dossier
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" />
            Envoyer
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <nav className="flex items-center flex-wrap gap-1 mb-4 text-sm">
        {path ? (
          <button
            onClick={() =>
              setPath(breadcrumbs[breadcrumbs.length - 2]?.path ?? "")
            }
            className="p-1.5 mr-1 text-gray-500 rounded hover:bg-gray-100"
            aria-label="Dossier parent"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : null}
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">/</span>}
            <button
              onClick={() => setPath(crumb.path)}
              className={
                i === breadcrumbs.length - 1
                  ? "px-2 py-1 font-medium text-gray-900"
                  : "px-2 py-1 text-gray-500 rounded hover:bg-gray-100 hover:text-gray-900"
              }
            >
              {crumb.label}
            </button>
          </span>
        ))}
      </nav>

      {uploading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="text-blue-900 truncate">{uploading.name}</span>
            <span className="text-blue-700 tabular-nums">{uploading.percent}%</span>
          </div>
          <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${uploading.percent}%` }}
            />
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`bg-white border rounded-xl overflow-hidden transition-colors ${
          dragging ? "border-blue-400 bg-blue-50/40" : "border-gray-200"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement…
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <Folder className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-900 font-medium">Ce dossier est vide</p>
            <p className="mt-1 text-sm text-gray-500">
              Glissez des fichiers ici, ou utilisez « Envoyer ».
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2.5 font-medium">Nom</th>
                  <th className="px-4 py-2.5 font-medium w-28">Taille</th>
                  <th className="px-4 py-2.5 font-medium w-44">Modifié</th>
                  <th className="px-4 py-2.5 font-medium w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const Icon = iconFor(entry);
                  return (
                    <tr
                      key={entry.path}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => openEntry(entry)}
                          className="flex items-center gap-2.5 text-left group"
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              entry.isFolder ? "text-blue-500" : "text-gray-400"
                            }`}
                          />
                          <span className="text-gray-900 group-hover:text-blue-600 break-all">
                            {entry.name}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 tabular-nums">
                        {entry.isFolder ? "—" : formatSize(entry.size)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {formatDate(entry.lastModified)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          {!entry.isFolder && entry.downloadUrl && (
                            <a
                              href={entry.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-400 rounded hover:bg-gray-100 hover:text-gray-700"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => remove(entry)}
                            className="p-1.5 text-gray-400 rounded hover:bg-red-50 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="font-medium text-gray-900 truncate">
                {preview.entry.name}
              </h2>
              <div className="flex items-center gap-1">
                {preview.entry.downloadUrl && (
                  <a
                    href={preview.entry.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-gray-400 rounded hover:bg-gray-100 hover:text-gray-700"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setPreview(null)}
                  className="p-1.5 text-gray-400 rounded hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-auto">
              {previewLoading || !preview.data ? (
                <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement…
                </div>
              ) : preview.data.kind === "text" ? (
                <>
                  <pre className="p-4 overflow-x-auto text-xs text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg">
                    {preview.data.text}
                  </pre>
                  {preview.data.truncated && (
                    <p className="mt-2 text-xs text-amber-600">
                      Fichier tronqué pour l&apos;aperçu — téléchargez-le pour
                      tout voir.
                    </p>
                  )}
                </>
              ) : preview.data.kind === "url" &&
                preview.data.mimeType?.startsWith("image/") ? (
                <img
                  src={preview.data.url}
                  alt={preview.entry.name}
                  className="max-w-full mx-auto rounded-lg"
                />
              ) : preview.data.kind === "url" &&
                preview.data.mimeType?.startsWith("video/") ? (
                <video
                  src={preview.data.url}
                  controls
                  className="max-w-full mx-auto rounded-lg"
                />
              ) : preview.data.kind === "url" &&
                preview.data.mimeType?.startsWith("audio/") ? (
                <audio src={preview.data.url} controls className="w-full" />
              ) : preview.data.kind === "url" ? (
                <iframe
                  src={preview.data.url}
                  title={preview.entry.name}
                  className="w-full h-[65vh] rounded-lg border border-gray-200"
                />
              ) : (
                <div className="py-12 text-center">
                  <FileIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-900 font-medium">
                    Aperçu non disponible pour ce type de fichier
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Téléchargez-le pour l&apos;ouvrir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
