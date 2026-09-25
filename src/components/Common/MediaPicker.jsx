import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Trash2, Upload, Video } from "lucide-react";
import { buildApiUrl } from "../../utils/apiBaseUrl";

/**
 * Pick an image or a video, and see what you picked.
 *
 * The forms behind this used to print the stored path as text — "Actuelle :
 * uploads/cv/intro-3f2a.png" — which tells an admin that something is there
 * and nothing about what it is. Picking a new file said nothing at all until
 * after saving, so the only way to check you had chosen the right one was to
 * save and look at the site.
 *
 * So both states are shown here: what is stored, and what is about to replace
 * it. The pending file is previewed from an object URL, which is revoked when
 * it is replaced or the form closes — a video left holding one keeps the file
 * open.
 */
export default function MediaPicker({
    kind = "image",
    label,
    hint,
    /** The stored path, as the API returns it. */
    current,
    /**
     * Where to fetch the stored file from, when the stored path is not
     * directly servable. Intro videos live in a protected bucket, so their
     * saved path answers 404 and only /public/intro/<product>/<id>/<kind>
     * plays them.
     */
    currentUrl,
    /** The File the admin has just picked, if any. */
    file,
    onPick,
    /** Called when the admin clears the stored one. Omit to hide that button. */
    onRemove,
    disabled = false,
}) {
    const isVideo = kind === "video";
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setObjectUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const storedUrl = useMemo(
        () => (current ? currentUrl || buildApiUrl(current) : null),
        [current, currentUrl],
    );
    const shown = objectUrl || storedUrl;

    const Icon = isVideo ? Video : ImageIcon;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {label}
                </label>
                {current && !file && onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={disabled}
                        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Retirer
                    </button>
                )}
            </div>

            {shown ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {isVideo ? (
                        <video
                            src={shown}
                            controls
                            preload="metadata"
                            className="max-h-48 w-full bg-black object-contain"
                        />
                    ) : (
                        <img
                            src={shown}
                            alt=""
                            className="max-h-48 w-full object-contain"
                        />
                    )}
                </div>
            ) : (
                <div className="mb-3 flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
                    Rien pour l'instant
                </div>
            )}

            <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 ${
                    disabled ? "pointer-events-none opacity-50" : ""
                }`}
            >
                <Upload className="h-4 w-4" />
                {current || file ? "Remplacer" : "Choisir un fichier"}
                <input
                    type="file"
                    accept={isVideo ? "video/*" : "image/*"}
                    disabled={disabled}
                    onChange={(e) => onPick(e.target.files?.[0] || null)}
                    className="hidden"
                />
            </label>

            {file && (
                <button
                    type="button"
                    onClick={() => onPick(null)}
                    className="ml-2 text-xs text-slate-500 underline hover:text-slate-700"
                >
                    Annuler ce choix
                </button>
            )}

            <p className="mt-2 text-xs text-slate-500">
                {file
                    ? `À enregistrer : ${file.name}`
                    : hint ||
                      (isVideo
                          ? "Une courte vidéo de présentation, visible avant l'achat."
                          : "L'image de la carte, visible avant l'achat.")}
            </p>
        </div>
    );
}
