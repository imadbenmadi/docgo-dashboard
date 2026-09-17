/**
 * Certificate template editor.
 *
 * A background (colour or image) and a list of elements - text, the
 * placeholders filled in when a certificate is issued, lines and the QR code
 * - each placed by position and size, with a live preview. Elements can be
 * dragged on the preview.
 *
 * Saved as the object list helpers/generateCertificatePDF.js draws: text
 * boxes, lines and a QR box, in canvas pixels.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import AdminCertificatesAPI from "../../API/AdminCertificates";
import apiClient from "../../utils/apiClient";

const SIZES = {
  landscape: { w: 900, h: 630 },
  portrait: { w: 630, h: 900 },
};

const PLACEHOLDERS = {
  STUDENT_NAME: "Nom de l'étudiant",
  COURSE_TITLE: "Titre du cours",
  ISSUE_DATE: "Date de délivrance",
  CERTIFICATE_ID: "Identifiant du certificat",
  VERIFICATION_URL: "Lien de vérification",
};

const SAMPLE = {
  STUDENT_NAME: "Amina Benali",
  COURSE_TITLE: "Introduction à la pharmacologie",
  ISSUE_DATE: new Date().toLocaleDateString("fr-FR"),
  CERTIFICATE_ID: "CERT-2026-0001",
  VERIFICATION_URL: "healthpathglobal.com/verify/…",
};

let seq = 0;
const uid = () => `el-${Date.now()}-${seq++}`;

const textEl = (over = {}) => ({
  id: uid(),
  kind: "text",
  text: "Texte",
  left: 250,
  top: 100,
  width: 400,
  fontSize: 20,
  color: "#111827",
  bold: false,
  align: "center",
  ...over,
});

const defaultElements = ({ w }) => [
  textEl({
    text: "Certificat de réussite",
    top: 70,
    left: 50,
    width: w - 100,
    fontSize: 44,
    bold: true,
    color: "#1e3a8a",
  }),
  textEl({
    text: "Ce certificat est décerné à",
    top: 170,
    left: 50,
    width: w - 100,
    fontSize: 18,
    color: "#374151",
  }),
  textEl({
    kind: "STUDENT_NAME",
    top: 220,
    left: 50,
    width: w - 100,
    fontSize: 38,
    bold: true,
    color: "#1e3a8a",
  }),
  textEl({
    text: "pour avoir terminé avec succès le cours",
    top: 300,
    left: 50,
    width: w - 100,
    fontSize: 18,
    color: "#374151",
  }),
  textEl({
    kind: "COURSE_TITLE",
    top: 340,
    left: 50,
    width: w - 100,
    fontSize: 26,
    bold: true,
  }),
  textEl({
    kind: "ISSUE_DATE",
    top: 520,
    left: 60,
    width: 250,
    fontSize: 14,
    align: "left",
    color: "#4b5563",
  }),
  { id: uid(), kind: "qr", left: w - 170, top: 460, width: 110 },
];

/** Stored object list -> editor elements. Anything else is kept as it is. */
const fromStored = (json) => {
  const elements = [];
  const kept = [];
  for (const o of json?.objects || []) {
    const type = String(o.type || "").toLowerCase();
    const sx = typeof o.scaleX === "number" ? o.scaleX : 1;
    const width = (o.width || 0) * sx;
    let left = o.left || 0;
    if (o.originX === "center") left -= width / 2;
    if (o.customType === "QR_CODE") {
      elements.push({
        id: uid(),
        kind: "qr",
        left,
        top: o.top || 0,
        width: width || 100,
      });
    } else if (["text", "i-text", "textbox"].includes(type)) {
      const placeholder =
        PLACEHOLDERS[o.customType] !== undefined
          ? o.customType
          : Object.keys(PLACEHOLDERS).find((k) =>
              String(o.text || "").includes(`{{${k}}}`),
            );
      elements.push(
        textEl({
          kind: placeholder || "text",
          text: placeholder ? "" : o.text || "",
          left,
          top: o.top || 0,
          width: width || 300,
          fontSize:
            (o.fontSize || 16) * (typeof o.scaleY === "number" ? o.scaleY : 1),
          color: o.fill || "#111827",
          bold:
            String(o.fontWeight || "") === "bold" ||
            Number(o.fontWeight) >= 600,
          align: o.textAlign || "left",
        }),
      );
    } else if (type === "line") {
      const len = Math.abs((o.x2 ?? width) - (o.x1 ?? 0)) || width || 200;
      elements.push({
        id: uid(),
        kind: "line",
        left,
        top: o.top || 0,
        width: len,
        color: o.stroke || "#374151",
        thickness: o.strokeWidth || 2,
      });
    } else {
      kept.push(o);
    }
  }
  return { elements, kept };
};

/** Editor elements -> the object list the PDF renderer draws. */
const toStored = ({ elements, kept, background, backgroundImage }) => ({
  version: "simple-1",
  background,
  backgroundColor: background,
  ...(backgroundImage ? { backgroundImage: { src: backgroundImage } } : {}),
  objects: [
    ...kept,
    ...elements.map((e) => {
      if (e.kind === "qr") {
        return {
          type: "group",
          customType: "QR_CODE",
          left: e.left,
          top: e.top,
          width: e.width,
          height: e.width,
        };
      }
      if (e.kind === "line") {
        return {
          type: "line",
          left: e.left,
          top: e.top,
          x1: 0,
          y1: 0,
          x2: e.width,
          y2: 0,
          width: e.width,
          stroke: e.color,
          strokeWidth: e.thickness || 2,
        };
      }
      const placeholder = e.kind !== "text";
      return {
        type: "textbox",
        left: e.left,
        top: e.top,
        width: e.width,
        fontSize: Number(e.fontSize) || 16,
        fill: e.color,
        fontWeight: e.bold ? "bold" : "normal",
        fontFamily: "Helvetica",
        textAlign: e.align,
        text: placeholder ? `{{${e.kind}}}` : e.text,
        customType: placeholder ? e.kind : "staticText",
      };
    }),
  ],
});

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const Field = ({ label, children }) => (
  <label className="block text-xs font-medium text-slate-600">
    {label}
    <div className="mt-1">{children}</div>
  </label>
);

const input =
  "w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none";

export default function CertificateDesigner() {
  const { templateId } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState("Nouveau modèle");
  const [courseId, setCourseId] = useState(search.get("courseId") || "");
  const [isDefault, setIsDefault] = useState(!search.get("courseId"));
  const [orientation, setOrientation] = useState("landscape");
  const [background, setBackground] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [elements, setElements] = useState(() =>
    defaultElements(SIZES.landscape),
  );
  const [kept, setKept] = useState([]);
  const [selected, setSelected] = useState(null);
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);

  const size = SIZES[orientation];
  const previewRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    apiClient
      .get("/Admin/Courses?limit=500")
      .then(({ data }) => {
        const list = data?.courses || data?.data?.courses || data?.data || [];
        setCourses(Array.isArray(list) ? list : []);
      })
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!templateId) return;
    AdminCertificatesAPI.getTemplate(templateId)
      .then((res) => {
        const tpl = res?.data?.template || res?.data?.data;
        if (!tpl) return;
        setName(tpl.name || "");
        setIsDefault(Boolean(tpl.isDefault));
        setCourseId(tpl.courseId || "");
        setOrientation(
          tpl.canvasHeight > tpl.canvasWidth ? "portrait" : "landscape",
        );
        let json = null;
        try {
          json =
            typeof tpl.fabricJson === "string"
              ? JSON.parse(tpl.fabricJson)
              : tpl.fabricJson;
        } catch {
          json = null;
        }
        if (json) {
          const { elements: els, kept: rest } = fromStored(json);
          setElements(els);
          setKept(rest);
          setBackground(json.background || json.backgroundColor || "#ffffff");
          setBackgroundImage(json.backgroundImage?.src || null);
        }
      })
      .catch(() => toast.error("Impossible de charger ce modèle"));
  }, [templateId]);

  // Fit the preview to its column.
  useEffect(() => {
    const fit = () => {
      const box = previewRef.current?.parentElement;
      if (box) setScale(Math.min(1, box.clientWidth / size.w));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [size.w]);

  const current = elements.find((e) => e.id === selected) || null;
  const update = (id, patch) =>
    setElements((list) =>
      list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  const add = (el) => {
    setElements((list) => [...list, el]);
    setSelected(el.id);
  };
  const remove = (id) => {
    setElements((list) => list.filter((e) => e.id !== id));
    setSelected(null);
  };
  const move = (id, dir) =>
    setElements((list) => {
      const i = list.findIndex((e) => e.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  // Drag on the preview.
  const drag = useRef(null);
  const onPointerDown = (e, el) => {
    e.preventDefault();
    setSelected(el.id);
    drag.current = {
      id: el.id,
      x: e.clientX,
      y: e.clientY,
      left: el.left,
      top: el.top,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const left = Math.round(d.left + (e.clientX - d.x) / scale);
    const top = Math.round(d.top + (e.clientY - d.y) / scale);
    update(d.id, { left, top });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Donnez un nom au modèle");
    setSaving(true);

    // Generate preview image
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = background || "#ffffff";
    ctx.fillRect(0, 0, size.w, size.h);

    if (backgroundImage) {
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0, size.w, size.h);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = backgroundImage;
      });
    }

    elements.forEach((el) => {
      if (el.kind === "qr") {
        ctx.strokeStyle = "#94a3b8";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.strokeRect(el.left, el.top, el.width, el.width);
        ctx.setLineDash([]);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px Helvetica";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("QR", el.left + el.width / 2, el.top + el.width / 2);
      } else if (el.kind === "line") {
        ctx.beginPath();
        ctx.moveTo(el.left, el.top);
        ctx.lineTo(el.left + el.width, el.top);
        ctx.strokeStyle = el.color || "#374151";
        ctx.lineWidth = el.thickness || 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = el.color || "#000000";
        const fw = el.bold ? "bold" : "normal";
        ctx.font = `${fw} ${el.fontSize}px Helvetica, Arial, sans-serif`;
        ctx.textAlign = el.align || "left";
        ctx.textBaseline = "top";
        const text =
          (el.kind === "text" ? el.text : SAMPLE[el.kind]) || "Texte";
        let x = el.left;
        if (el.align === "center") x += el.width / 2;
        else if (el.align === "right") x += el.width;
        ctx.fillText(text, x, el.top);
      }
    });

    let generatedPreview = null;
    try {
      generatedPreview = canvas.toDataURL("image/jpeg", 0.85);
    } catch (e) {
      console.error("Could not generate preview image", e);
    }

    const payload = {
      name: name.trim(),
      courseId: courseId || null,
      isDefault: courseId ? false : isDefault,
      canvasWidth: size.w,
      canvasHeight: size.h,
      orientation,
      previewImage: generatedPreview,
      fabricJson: JSON.stringify(
        toStored({ elements, kept, background, backgroundImage }),
      ),
    };
    try {
      if (templateId) {
        await AdminCertificatesAPI.updateTemplate(templateId, payload);
        toast.success("Modèle enregistré");
      } else {
        const res = await AdminCertificatesAPI.createTemplate(payload);
        const id = res?.data?.template?.id || res?.data?.data?.id;
        toast.success("Modèle créé");
        if (id) navigate(`/CertificateDesigner/${id}`, { replace: true });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  const labelOf = (el) =>
    el.kind === "qr"
      ? "Code QR"
      : el.kind === "line"
        ? "Ligne"
        : el.kind === "text"
          ? el.text || "Texte"
          : PLACEHOLDERS[el.kind];

  const previewText = useMemo(
    () => (el) => (el.kind === "text" ? el.text : SAMPLE[el.kind]),
    [],
  );

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/Certificates")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Modèles de certificat
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />{" "}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Settings and elements */}
        <div className="space-y-4">
          <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <Field label="Nom">
              <input
                className={input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Cours (vide = modèle général)">
              <select
                className={input}
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">— Aucun cours —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.Title || c.title}
                  </option>
                ))}
              </select>
            </Field>
            {!courseId && (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                Modèle par défaut
              </label>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Field label="Format">
                <select
                  className={input}
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                >
                  <option value="landscape">Paysage</option>
                  <option value="portrait">Portrait</option>
                </select>
              </Field>
              <Field label="Fond">
                <input
                  type="color"
                  className="h-9 w-full rounded-lg border border-slate-300"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                />
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                <ImagePlus className="h-4 w-4" /> Image de fond
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (file.size > 3 * 1024 * 1024)
                      return toast.error("Image trop lourde (3 Mo max)");
                    setBackgroundImage(await readAsDataUrl(file));
                  }}
                />
              </label>
              {backgroundImage && (
                <button
                  type="button"
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => setBackgroundImage(null)}
                >
                  Retirer
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ajouter
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                className="rounded-md bg-slate-100 px-2 py-1 text-xs hover:bg-slate-200"
                onClick={() => add(textEl())}
              >
                <Plus className="mr-1 inline h-3 w-3" />
                Texte
              </button>
              {Object.entries(PLACEHOLDERS).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  className="rounded-md bg-violet-50 px-2 py-1 text-xs text-violet-700 hover:bg-violet-100"
                  onClick={() => add(textEl({ kind: k, text: "" }))}
                >
                  <Plus className="mr-1 inline h-3 w-3" />
                  {label}
                </button>
              ))}
              <button
                type="button"
                className="rounded-md bg-slate-100 px-2 py-1 text-xs hover:bg-slate-200"
                onClick={() =>
                  add({
                    id: uid(),
                    kind: "line",
                    left: 100,
                    top: 480,
                    width: 250,
                    color: "#374151",
                    thickness: 2,
                  })
                }
              >
                <Plus className="mr-1 inline h-3 w-3" />
                Ligne
              </button>
              {!elements.some((e) => e.kind === "qr") && (
                <button
                  type="button"
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs hover:bg-slate-200"
                  onClick={() =>
                    add({
                      id: uid(),
                      kind: "qr",
                      left: size.w - 170,
                      top: size.h - 170,
                      width: 110,
                    })
                  }
                >
                  <Plus className="mr-1 inline h-3 w-3" />
                  Code QR
                </button>
              )}
            </div>

            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto overflow-x-auto">
              {elements.map((el) => (
                <li
                  key={el.id}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm ${el.id === selected ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left"
                    onClick={() => setSelected(el.id)}
                  >
                    {labelOf(el)}
                  </button>
                  <button
                    type="button"
                    title="Monter"
                    onClick={() => move(el.id, -1)}
                    className="p-0.5 text-slate-400 hover:text-slate-700"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Descendre"
                    onClick={() => move(el.id, 1)}
                    className="p-0.5 text-slate-400 hover:text-slate-700"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() => remove(el.id)}
                    className="p-0.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {current && (
            <div className="space-y-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {labelOf(current)}
              </p>
              {current.kind === "text" && (
                <Field label="Texte">
                  <input
                    className={input}
                    value={current.text}
                    onChange={(e) =>
                      update(current.id, { text: e.target.value })
                    }
                  />
                </Field>
              )}
              <div className="grid grid-cols-3 gap-2">
                <Field label="X">
                  <input
                    type="number"
                    className={input}
                    value={current.left}
                    onChange={(e) =>
                      update(current.id, { left: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Y">
                  <input
                    type="number"
                    className={input}
                    value={current.top}
                    onChange={(e) =>
                      update(current.id, { top: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label={current.kind === "qr" ? "Taille" : "Largeur"}>
                  <input
                    type="number"
                    className={input}
                    value={current.width}
                    onChange={(e) =>
                      update(current.id, { width: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>
              {current.kind !== "qr" && (
                <div className="grid grid-cols-3 gap-2">
                  {current.kind === "line" ? (
                    <Field label="Épaisseur">
                      <input
                        type="number"
                        className={input}
                        value={current.thickness}
                        onChange={(e) =>
                          update(current.id, {
                            thickness: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                  ) : (
                    <Field label="Police">
                      <input
                        type="number"
                        className={input}
                        value={current.fontSize}
                        onChange={(e) =>
                          update(current.id, {
                            fontSize: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                  )}
                  <Field label="Couleur">
                    <input
                      type="color"
                      className="h-9 w-full rounded-lg border border-slate-300"
                      value={current.color}
                      onChange={(e) =>
                        update(current.id, { color: e.target.value })
                      }
                    />
                  </Field>
                  {current.kind !== "line" && (
                    <Field label="Alignement">
                      <select
                        className={input}
                        value={current.align}
                        onChange={(e) =>
                          update(current.id, { align: e.target.value })
                        }
                      >
                        <option value="left">Gauche</option>
                        <option value="center">Centre</option>
                        <option value="right">Droite</option>
                      </select>
                    </Field>
                  )}
                </div>
              )}
              {current.kind !== "qr" && current.kind !== "line" && (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={current.bold}
                    onChange={(e) =>
                      update(current.id, { bold: e.target.checked })
                    }
                  />{" "}
                  Gras
                </label>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="min-w-0 rounded-xl bg-slate-100 p-3">
          <div style={{ height: size.h * scale }}>
            <div
              ref={previewRef}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="relative origin-top-left overflow-hidden shadow-lg"
              style={{
                width: size.w,
                height: size.h,
                transform: `scale(${scale})`,
                background,
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : undefined,
                backgroundSize: "100% 100%",
              }}
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) setSelected(null);
              }}
            >
              {elements.map((el) => {
                const ring =
                  el.id === selected
                    ? "outline outline-2 outline-blue-500"
                    : "hover:outline hover:outline-1 hover:outline-blue-300";
                if (el.kind === "qr") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => onPointerDown(e, el)}
                      className={`absolute flex cursor-move items-center justify-center bg-white text-[10px] text-slate-500 ${ring}`}
                      style={{
                        left: el.left,
                        top: el.top,
                        width: el.width,
                        height: el.width,
                        border: "2px dashed #94a3b8",
                      }}
                    >
                      QR
                    </div>
                  );
                }
                if (el.kind === "line") {
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => onPointerDown(e, el)}
                      className={`absolute cursor-move ${ring}`}
                      style={{
                        left: el.left,
                        top: el.top - 4,
                        width: el.width,
                        height: 8,
                      }}
                    >
                      <div
                        style={{
                          marginTop: 4 - (el.thickness || 2) / 2,
                          height: el.thickness || 2,
                          background: el.color,
                        }}
                      />
                    </div>
                  );
                }
                return (
                  <div
                    key={el.id}
                    onPointerDown={(e) => onPointerDown(e, el)}
                    className={`absolute cursor-move select-none whitespace-pre-wrap leading-tight ${ring}`}
                    style={{
                      left: el.left,
                      top: el.top,
                      width: el.width,
                      fontSize: el.fontSize,
                      color: el.color,
                      fontWeight: el.bold ? 700 : 400,
                      textAlign: el.align,
                      fontFamily: "Helvetica, Arial, sans-serif",
                    }}
                  >
                    {previewText(el)}
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Glissez les éléments pour les déplacer. Les champs en violet sont
            remplis automatiquement à la délivrance.
          </p>
        </div>
      </div>
    </div>
  );
}
