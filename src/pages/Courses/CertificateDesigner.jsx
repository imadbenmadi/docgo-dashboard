/* eslint-disable react/prop-types */
/**
 * CertificateDesigner.jsx
 * A professional Fabric.js-based certificate template designer for admins.
 *
 * Placeholders (always present, cannot be deleted, can be moved/styled):
 *   STUDENT_NAME   — replaced with the student's real name on issuance
 *   COURSE_TITLE   — replaced with the course title
 *   ISSUE_DATE     — replaced with the certificate issue date
 *   QR_CODE        — replaced with a QR code image
 *   VERIFICATION_URL — replaced with the raw verification URL text
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fabric } from "fabric";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import {
    Save,
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
    Grid3X3,
    Trash2,
    Type,
    Square,
    Circle,
    Triangle,
    Minus,
    Image,
    ChevronUp,
    ChevronDown,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Star,
    ArrowLeft,
    Eye,
    Copy,
    Lock,
    RefreshCw,
    Settings,
} from "lucide-react";
import AdminCertificatesAPI from "../../API/AdminCertificates";

/* ─────────────────────────────── constants ─────────────────────────────── */
const CANVAS_W = 900;
const CANVAS_H = 630;

const PLACEHOLDER_CONFIG = {
    STUDENT_NAME: {
        label: "Student Name",
        color: "#8b5cf6",
        bg: "#ede9fe",
        defaultText: "{{STUDENT_NAME}}",
        defaultProps: {
            left: CANVAS_W / 2 - 180,
            top: CANVAS_H / 2 - 20,
            fontSize: 38,
            fontFamily: "Georgia",
            fill: "#1e1b4b",
            fontWeight: "bold",
            textAlign: "center",
        },
    },
    COURSE_TITLE: {
        label: "Course Title",
        color: "#f59e0b",
        bg: "#fef3c7",
        defaultText: "{{COURSE_TITLE}}",
        defaultProps: {
            left: CANVAS_W / 2 - 180,
            top: CANVAS_H / 2 + 40,
            fontSize: 20,
            fontFamily: "Georgia",
            fill: "#78350f",
            fontStyle: "italic",
            textAlign: "center",
        },
    },
    ISSUE_DATE: {
        label: "Issue Date",
        color: "#3b82f6",
        bg: "#dbeafe",
        defaultText: "{{ISSUE_DATE}}",
        defaultProps: {
            left: CANVAS_W / 2 - 100,
            top: CANVAS_H - 100,
            fontSize: 14,
            fontFamily: "Helvetica",
            fill: "#1e3a8a",
            textAlign: "center",
        },
    },
    QR_CODE: {
        label: "QR Code",
        color: "#10b981",
        bg: "#d1fae5",
        defaultText: "{{QR_CODE}}",
        defaultProps: {
            left: CANVAS_W - 130,
            top: CANVAS_H - 140,
            width: 110,
            height: 110,
            fontSize: 12,
            fontFamily: "Helvetica",
            fill: "#064e3b",
            textAlign: "center",
        },
    },
    VERIFICATION_URL: {
        label: "Verification URL",
        color: "#ef4444",
        bg: "#fee2e2",
        defaultText: "{{VERIFICATION_URL}}",
        defaultProps: {
            left: 20,
            top: CANVAS_H - 30,
            fontSize: 10,
            fontFamily: "Courier New",
            fill: "#7f1d1d",
            textAlign: "left",
        },
    },
};

const FONT_FAMILIES = [
    "Arial",
    "Georgia",
    "Times New Roman",
    "Helvetica",
    "Courier New",
    "Verdana",
    "Trebuchet MS",
    "Palatino",
    "Garamond",
    "Comic Sans MS",
];

/* ─────────────────────────────── helpers ─────────────────────────────── */
function isPlaceholder(obj) {
    return obj && obj.customType && obj.customType in PLACEHOLDER_CONFIG;
}

function makeTextPlaceholder(type, config) {
    const cfg = PLACEHOLDER_CONFIG[type];
    const props = { ...cfg.defaultProps };
    if (config) Object.assign(props, config);
    const textbox = new fabric.Textbox(cfg.defaultText, {
        ...props,
        width: props.width || (type === "QR_CODE" ? 110 : 360),
        editable: false,
        lockScalingFlip: true,
        borderColor: cfg.color,
        cornerColor: cfg.color,
        cornerSize: 8,
        transparentCorners: false,
    });
    textbox.set("customType", type);
    textbox.set("customLabel", cfg.label);
    return textbox;
}

function makeQrPlaceholder(config) {
    const cfg = PLACEHOLDER_CONFIG.QR_CODE;
    const props = { ...cfg.defaultProps, ...config };
    const w = props.width || 110;
    const h = props.height || 110;
    const group = new fabric.Group(
        [
            new fabric.Rect({
                width: w,
                height: h,
                left: -w / 2,
                top: -h / 2,
                fill: "#f0fdf4",
                stroke: cfg.color,
                strokeWidth: 2,
                strokeDashArray: [6, 3],
                rx: 6,
                ry: 6,
            }),
            new fabric.Text("QR", {
                left: -14,
                top: -20,
                fontSize: 26,
                fill: cfg.color,
                fontWeight: "bold",
                fontFamily: "Arial",
            }),
            new fabric.Text("Code", {
                left: -20,
                top: 8,
                fontSize: 14,
                fill: cfg.color,
                fontFamily: "Arial",
            }),
            new fabric.Rect({
                width: 14,
                height: 14,
                left: -w / 2 + 6,
                top: -h / 2 + 6,
                fill: cfg.color,
            }),
            new fabric.Rect({
                width: 14,
                height: 14,
                left: w / 2 - 20,
                top: -h / 2 + 6,
                fill: cfg.color,
            }),
            new fabric.Rect({
                width: 14,
                height: 14,
                left: -w / 2 + 6,
                top: h / 2 - 20,
                fill: cfg.color,
            }),
        ],
        {
            left: props.left,
            top: props.top,
            lockScalingFlip: true,
            borderColor: cfg.color,
            cornerColor: cfg.color,
            cornerSize: 8,
            transparentCorners: false,
        },
    );
    group.set("customType", "QR_CODE");
    group.set("customLabel", cfg.label);
    return group;
}

/* ═══════════════════════════ COMPONENT ════════════════════════════════ */
export default function CertificateDesigner() {
    const navigate = useNavigate();
    const { templateId } = useParams();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("courseId");

    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const historyRef = useRef([]);
    const historyIndexRef = useRef(-1);
    const isLoadingRef = useRef(false);

    const [selectedObj, setSelectedObj] = useState(null);
    const [activeTool, setActiveTool] = useState("select");
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(false);
    const [templateName, setTemplateName] = useState("New Template");
    const [isDefault, setIsDefault] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!templateId);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [bgColor, setBgColor] = useState("#ffffff");
    const [canvasSize, setCanvasSize] = useState({ w: CANVAS_W, h: CANVAS_H });

    // Per-object property state (driven from selected object)
    const [props, setProps] = useState({
        fill: "#000000",
        stroke: "#000000",
        strokeWidth: 0,
        opacity: 1,
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        underline: false,
        textAlign: "left",
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        angle: 0,
        rx: 0,
    });

    /* ── history management ── */
    const pushHistory = useCallback(() => {
        if (!fabricRef.current || isLoadingRef.current) return;
        const json = JSON.stringify(
            fabricRef.current.toJSON(["customType", "customLabel"]),
        );
        const hist = historyRef.current;
        const idx = historyIndexRef.current;
        // truncate future history when a new action is taken
        historyRef.current = hist.slice(0, idx + 1);
        historyRef.current.push(json);
        if (historyRef.current.length > 50) historyRef.current.shift();
        historyIndexRef.current = historyRef.current.length - 1;
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(false);
    }, []);

    const applyHistoryState = useCallback((json) => {
        if (!fabricRef.current) return;
        isLoadingRef.current = true;
        fabricRef.current.loadFromJSON(JSON.parse(json), () => {
            fabricRef.current.renderAll();
            reattachPlaceholderProtection();
            isLoadingRef.current = false;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const undo = useCallback(() => {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(true);
        applyHistoryState(historyRef.current[historyIndexRef.current]);
    }, [applyHistoryState]);

    const redo = useCallback(() => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        setCanUndo(true);
        setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
        applyHistoryState(historyRef.current[historyIndexRef.current]);
    }, [applyHistoryState]);

    /* ── protect placeholders from deletion ── */
    const reattachPlaceholderProtection = useCallback(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const existingTypes = new Set(
            canvas
                .getObjects()
                .filter(isPlaceholder)
                .map((o) => o.customType),
        );
        // Re-add any missing placeholders
        Object.keys(PLACEHOLDER_CONFIG).forEach((type) => {
            if (!existingTypes.has(type)) {
                const obj =
                    type === "QR_CODE"
                        ? makeQrPlaceholder()
                        : makeTextPlaceholder(type);
                canvas.add(obj);
            }
        });
    }, []);

    /* ── canvas initialisation ── */
    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: CANVAS_W,
            height: CANVAS_H,
            backgroundColor: "#ffffff",
            preserveObjectStacking: true,
            stopContextMenu: true,
            fireRightClick: false,
        });
        fabricRef.current = canvas;

        // Object selection handlers
        const syncProps = (obj) => {
            if (!obj) {
                setSelectedObj(null);
                return;
            }
            setSelectedObj({
                type: obj.type,
                customType: obj.customType,
                id: obj.__uid || Math.random(),
            });
            setProps({
                fill: obj.fill || "#000000",
                stroke: obj.stroke || "#000000",
                strokeWidth: obj.strokeWidth || 0,
                opacity: obj.opacity !== undefined ? obj.opacity : 1,
                fontSize: obj.fontSize || 20,
                fontFamily: obj.fontFamily || "Arial",
                fontWeight: obj.fontWeight || "normal",
                fontStyle: obj.fontStyle || "normal",
                underline: obj.underline || false,
                textAlign: obj.textAlign || "left",
                left: Math.round(obj.left || 0),
                top: Math.round(obj.top || 0),
                width: Math.round(
                    obj.getScaledWidth
                        ? obj.getScaledWidth()
                        : obj.width || 100,
                ),
                height: Math.round(
                    obj.getScaledHeight
                        ? obj.getScaledHeight()
                        : obj.height || 100,
                ),
                angle: Math.round(obj.angle || 0),
                rx: obj.rx || 0,
            });
        };
        canvas.on("selection:created", (e) => syncProps(e.selected?.[0]));
        canvas.on("selection:updated", (e) => syncProps(e.selected?.[0]));
        canvas.on("selection:cleared", () => setSelectedObj(null));
        canvas.on("object:modified", (e) => {
            syncProps(e.target);
            pushHistory();
        });
        canvas.on("object:added", () => pushHistory());
        canvas.on("text:changed", () => pushHistory());

        // Prevent placeholder deletion
        canvas.on("object:removed", (e) => {
            if (isPlaceholder(e.target) && !isLoadingRef.current) {
                // Re-add it
                setTimeout(() => {
                    const type = e.target.customType;
                    const removed = e.target;
                    const replacement =
                        type === "QR_CODE"
                            ? makeQrPlaceholder({
                                  left: removed.left,
                                  top: removed.top,
                              })
                            : makeTextPlaceholder(type, {
                                  left: removed.left,
                                  top: removed.top,
                              });
                    canvas.add(replacement);
                    canvas.requestRenderAll();
                    toast(
                        "Placeholder elements cannot be deleted. Move or resize them instead.",
                        {
                            icon: "🔒",
                            duration: 3000,
                        },
                    );
                }, 0);
            }
        });

        // Tool cursor handling
        canvas.on("mouse:down", () => {
            if (activeTool === "select") return;
        });

        if (!templateId) {
            // Fresh template — add default placeholders and a starter look
            addDefaultLayout(canvas);
            pushHistory();
        }

        return () => canvas.dispose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── load existing template ── */
    useEffect(() => {
        if (!templateId || !fabricRef.current) return;
        setIsLoading(true);
        AdminCertificatesAPI.getTemplate(templateId)
            .then((res) => {
                const tpl = res?.data?.template;
                if (!tpl) return;
                setTemplateName(tpl.name);
                setIsDefault(tpl.isDefault);
                setCanvasSize({ w: tpl.canvasWidth, h: tpl.canvasHeight });
                setBgColor("#ffffff");
                if (tpl.fabricJson && tpl.fabricJson !== "{}") {
                    isLoadingRef.current = true;
                    fabricRef.current.loadFromJSON(
                        JSON.parse(tpl.fabricJson),
                        () => {
                            fabricRef.current.setWidth(tpl.canvasWidth);
                            fabricRef.current.setHeight(tpl.canvasHeight);
                            fabricRef.current.renderAll();
                            reattachPlaceholderProtection();
                            pushHistory();
                            isLoadingRef.current = false;
                        },
                    );
                }
            })
            .catch(() => toast.error("Failed to load template"))
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId]);

    /* ── keyboard shortcuts ── */
    useEffect(() => {
        const onKey = (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
                return;
            if ((e.ctrlKey || e.metaKey) && e.key === "z") undo();
            if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === "y" || (e.shiftKey && e.key === "z"))
            )
                redo();
            if (e.key === "Delete" || e.key === "Backspace") {
                const active = fabricRef.current?.getActiveObject();
                if (active && !isPlaceholder(active)) {
                    fabricRef.current.remove(active);
                    fabricRef.current.renderAll();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "d") {
                e.preventDefault();
                duplicateSelected();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [undo, redo]);

    /* ── default layout helper ── */
    function addDefaultLayout(canvas) {
        // Elegant border frame
        canvas.add(
            new fabric.Rect({
                left: 15,
                top: 15,
                width: CANVAS_W - 30,
                height: CANVAS_H - 30,
                fill: "transparent",
                stroke: "#c4a35a",
                strokeWidth: 3,
                rx: 8,
                ry: 8,
            }),
        );
        canvas.add(
            new fabric.Rect({
                left: 22,
                top: 22,
                width: CANVAS_W - 44,
                height: CANVAS_H - 44,
                fill: "transparent",
                stroke: "#c4a35a",
                strokeWidth: 1,
                rx: 6,
                ry: 6,
            }),
        );
        // Header
        canvas.add(
            new fabric.Textbox("CERTIFICATE OF COMPLETION", {
                left: CANVAS_W / 2 - 250,
                top: 60,
                width: 500,
                fontSize: 28,
                fontFamily: "Georgia",
                fontWeight: "bold",
                fill: "#1a1a2e",
                textAlign: "center",
                letterSpacing: 3,
            }),
        );
        canvas.add(
            new fabric.Textbox("This is to certify that", {
                left: CANVAS_W / 2 - 150,
                top: 120,
                width: 300,
                fontSize: 16,
                fontFamily: "Georgia",
                fontStyle: "italic",
                fill: "#4a4a6a",
                textAlign: "center",
            }),
        );
        // Divider line
        canvas.add(
            new fabric.Line(
                [80, CANVAS_H / 2 + 80, CANVAS_W - 80, CANVAS_H / 2 + 80],
                {
                    stroke: "#c4a35a",
                    strokeWidth: 1,
                },
            ),
        );
        // has successfully completed the course
        canvas.add(
            new fabric.Textbox("has successfully completed the course", {
                left: CANVAS_W / 2 - 180,
                top: CANVAS_H / 2 + 10,
                width: 360,
                fontSize: 15,
                fontFamily: "Georgia",
                fontStyle: "italic",
                fill: "#4a4a6a",
                textAlign: "center",
            }),
        );
        // Signature line
        canvas.add(
            new fabric.Line([80, CANVAS_H - 80, 260, CANVAS_H - 80], {
                stroke: "#555",
                strokeWidth: 1,
            }),
        );
        canvas.add(
            new fabric.Textbox("Director / Instructor", {
                left: 80,
                top: CANVAS_H - 68,
                width: 180,
                fontSize: 11,
                fontFamily: "Arial",
                fill: "#555",
                textAlign: "center",
            }),
        );
        // Add all placeholders
        canvas.add(makeTextPlaceholder("STUDENT_NAME"));
        canvas.add(makeTextPlaceholder("COURSE_TITLE"));
        canvas.add(makeTextPlaceholder("ISSUE_DATE"));
        canvas.add(makeQrPlaceholder());
        canvas.add(makeTextPlaceholder("VERIFICATION_URL"));
        canvas.renderAll();
    }

    /* ─────────── TOOL ACTIONS ─────────── */
    const addText = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const text = new fabric.Textbox("Your text here", {
            left: 100,
            top: 100,
            width: 200,
            fontSize: 20,
            fontFamily: "Arial",
            fill: "#333333",
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const addRect = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 150,
            height: 100,
            fill: "#c4a35a22",
            stroke: "#c4a35a",
            strokeWidth: 2,
            rx: 4,
            ry: 4,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
    };

    const addCircle = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const circle = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 60,
            fill: "#c4a35a22",
            stroke: "#c4a35a",
            strokeWidth: 2,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
    };

    const addTriangle = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const tri = new fabric.Triangle({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: "#c4a35a22",
            stroke: "#c4a35a",
            strokeWidth: 2,
        });
        canvas.add(tri);
        canvas.setActiveObject(tri);
        canvas.renderAll();
    };

    const addLine = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const line = new fabric.Line([50, 50, CANVAS_W - 50, 50], {
            left: 50,
            top: 300,
            stroke: "#c4a35a",
            strokeWidth: 2,
        });
        canvas.add(line);
        canvas.setActiveObject(line);
        canvas.renderAll();
    };

    const addStar = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const points = [];
        const outerR = 40,
            innerR = 16,
            numPoints = 5;
        for (let i = 0; i < numPoints * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const a = (Math.PI / numPoints) * i - Math.PI / 2;
            points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
        const star = new fabric.Polygon(points, {
            left: 150,
            top: 150,
            fill: "#c4a35a",
            stroke: "#a07830",
            strokeWidth: 1,
        });
        canvas.add(star);
        canvas.setActiveObject(star);
        canvas.renderAll();
    };

    const addImageFromFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            fabric.Image.fromURL(evt.target.result, (img) => {
                const maxW = 300;
                if (img.width > maxW) img.scaleToWidth(maxW);
                img.set({ left: 100, top: 100 });
                fabricRef.current.add(img);
                fabricRef.current.setActiveObject(img);
                fabricRef.current.renderAll();
            });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const addPlaceholder = (type) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        // Check if already exists
        const exists = canvas.getObjects().some((o) => o.customType === type);
        if (exists) {
            toast(
                `${PLACEHOLDER_CONFIG[type].label} placeholder already on canvas`,
                { icon: "ℹ️" },
            );
            return;
        }
        const obj =
            type === "QR_CODE"
                ? makeQrPlaceholder()
                : makeTextPlaceholder(type);
        canvas.add(obj);
        canvas.setActiveObject(obj);
        canvas.renderAll();
    };

    const duplicateSelected = () => {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!active) return;
        active.clone(
            (cloned) => {
                canvas.discardActiveObject();
                cloned.set({ left: active.left + 20, top: active.top + 20 });
                if (isPlaceholder(cloned)) {
                    // Don't allow duplicating placeholders
                    toast("Cannot duplicate placeholder elements.", {
                        icon: "🔒",
                    });
                    return;
                }
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                canvas.requestRenderAll();
            },
            ["customType", "customLabel"],
        );
    };

    const deleteSelected = () => {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!active) return;
        if (isPlaceholder(active)) {
            toast("Placeholder elements cannot be deleted.", { icon: "🔒" });
            return;
        }
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.renderAll();
    };

    const bringFwd = () => {
        fabricRef.current?.getActiveObject() &&
            fabricRef.current.bringForward(fabricRef.current.getActiveObject());
        fabricRef.current?.renderAll();
    };
    const sendBwd = () => {
        fabricRef.current?.getActiveObject() &&
            fabricRef.current.sendBackwards(
                fabricRef.current.getActiveObject(),
            );
        fabricRef.current?.renderAll();
    };
    const bringFront = () => {
        fabricRef.current?.getActiveObject() &&
            fabricRef.current.bringToFront(fabricRef.current.getActiveObject());
        fabricRef.current?.renderAll();
    };
    const sendBack = () => {
        fabricRef.current?.getActiveObject() &&
            fabricRef.current.sendToBack(fabricRef.current.getActiveObject());
        fabricRef.current?.renderAll();
    };

    /* ─────────── PROPERTY UPDATES ─────────── */
    const updateProp = (key, value) => {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!active) return;
        active.set(key, value);
        canvas.renderAll();
        setProps((p) => ({ ...p, [key]: value }));
    };

    const updatePosition = (key, val) => {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!active) return;
        const num = parseFloat(val) || 0;
        if (key === "width") active.set("scaleX", num / active.width);
        else if (key === "height") active.set("scaleY", num / active.height);
        else active.set(key, num);
        canvas.renderAll();
        setProps((p) => ({ ...p, [key]: num }));
        pushHistory();
    };

    const setBackground = (color) => {
        fabricRef.current?.set("backgroundColor", color);
        fabricRef.current?.renderAll();
        setBgColor(color);
        pushHistory();
    };

    const changeCanvasSize = (w, h) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        canvas.setWidth(w);
        canvas.setHeight(h);
        canvas.renderAll();
        setCanvasSize({ w, h });
    };

    /* ─────────── ZOOM ─────────── */
    const zoomIn = () => {
        const newZ = Math.min(zoom + 0.1, 2.5);
        fabricRef.current?.setZoom(newZ);
        setZoom(newZ);
    };
    const zoomOut = () => {
        const newZ = Math.max(zoom - 0.1, 0.3);
        fabricRef.current?.setZoom(newZ);
        setZoom(newZ);
    };
    const zoomReset = () => {
        fabricRef.current?.setZoom(1);
        setZoom(1);
    };

    /* ─────────── GRID ─────────── */
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        // Remove existing grid
        canvas
            .getObjects()
            .filter((o) => o.isGrid)
            .forEach((o) => canvas.remove(o));
        if (showGrid) {
            const step = 30;
            const vLines = [];
            const hLines = [];
            for (let x = step; x < canvasSize.w; x += step) {
                vLines.push(
                    new fabric.Line([x, 0, x, canvasSize.h], {
                        stroke: "#ddd",
                        strokeWidth: 0.5,
                        selectable: false,
                        evented: false,
                    }),
                );
                vLines[vLines.length - 1].isGrid = true;
            }
            for (let y = step; y < canvasSize.h; y += step) {
                hLines.push(
                    new fabric.Line([0, y, canvasSize.w, y], {
                        stroke: "#ddd",
                        strokeWidth: 0.5,
                        selectable: false,
                        evented: false,
                    }),
                );
                hLines[hLines.length - 1].isGrid = true;
            }
            [...vLines, ...hLines].forEach((l) => {
                canvas.add(l);
                canvas.sendToBack(l);
            });
            canvas.renderAll();
        }
    }, [showGrid, canvasSize]);

    /* ─────────── SAVE ─────────── */
    const handleSave = async () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        setIsSaving(true);
        try {
            // Remove grid lines before export
            const gridObjs = canvas.getObjects().filter((o) => o.isGrid);
            gridObjs.forEach((o) => canvas.remove(o));

            const fabricJson = JSON.stringify(
                canvas.toJSON(["customType", "customLabel"]),
            );
            // Quick thumbnail (scale down)
            const previewImage = canvas.toDataURL({
                format: "png",
                quality: 0.5,
                multiplier: 0.35,
            });

            // Re-add grid if needed
            if (showGrid) {
                setShowGrid(false);
                setTimeout(() => setShowGrid(true), 100);
            }

            const payload = {
                name: templateName,
                courseId: courseId || null,
                isDefault,
                canvasWidth: canvasSize.w,
                canvasHeight: canvasSize.h,
                fabricJson,
                previewImage,
                orientation:
                    canvasSize.w > canvasSize.h ? "landscape" : "portrait",
            };

            if (templateId) {
                await AdminCertificatesAPI.updateTemplate(templateId, payload);
                toast.success("Template saved!");
            } else {
                const res = await AdminCertificatesAPI.createTemplate(payload);
                const newId = res?.data?.template?.id;
                toast.success("Template created!");
                if (newId)
                    navigate(`/CertificateDesigner/${newId}`, {
                        replace: true,
                    });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to save template");
        } finally {
            setIsSaving(false);
        }
    };

    /* ─────────── PREVIEW (open blank tab with rendered PNG) ─────────── */
    const handlePreview = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
        const win = window.open();
        win.document.write(
            `<html><body style="margin:0;background:#888;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${dataUrl}" style="max-width:100%;box-shadow:0 4px 32px #0008" /></body></html>`,
        );
    };

    /* ─────────── CLEAR ─────────── */
    const handleClear = async () => {
        const conf = await Swal.fire({
            title: "Clear canvas?",
            text: "All elements except placeholders will be removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Clear",
        });
        if (!conf.isConfirmed) return;
        const canvas = fabricRef.current;
        const toRemove = canvas
            .getObjects()
            .filter((o) => !isPlaceholder(o) && !o.isGrid);
        toRemove.forEach((o) => canvas.remove(o));
        canvas.renderAll();
        pushHistory();
    };

    /* ─────────── UI HELPERS ─────────── */
    const isText =
        selectedObj &&
        (selectedObj.type === "textbox" ||
            selectedObj.type === "text" ||
            selectedObj.type === "i-text");
    const isShape =
        selectedObj &&
        (selectedObj.type === "rect" ||
            selectedObj.type === "circle" ||
            selectedObj.type === "triangle" ||
            selectedObj.type === "polygon");
    const isPlaceholderSelected = selectedObj && selectedObj.customType;

    /* ─────────────────────────────── RENDER ─────────────────────────────── */
    if (isLoading) {
        return (
            <div className="h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading template...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 select-none">
            <Toaster position="bottom-center" />

            {/* ══════════════ LEFT SIDEBAR ══════════════ */}
            <aside className="w-[200px] flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto">
                {/* Back */}
                <button
                    onClick={() => navigate("/Certificates")}
                    className="flex items-center gap-2 px-4 py-3 text-zinc-400 hover:text-zinc-100 border-b border-zinc-800 text-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Certificates
                </button>

                {/* ─── Tools ─── */}
                <div className="px-3 pt-4 pb-2">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                        Tools
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                        {[
                            {
                                tool: "select",
                                icon: <Settings className="w-4 h-4" />,
                                label: "Select",
                            },
                        ].map(({ tool, icon, label }) => (
                            <button
                                key={tool}
                                onClick={() => setActiveTool(tool)}
                                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs transition-all ${activeTool === tool ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                            >
                                {icon}
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                        <button
                            onClick={addText}
                            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"
                        >
                            <Type className="w-4 h-4" />
                            Text
                        </button>
                        <button
                            onClick={addRect}
                            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"
                        >
                            <Square className="w-4 h-4" />
                            Rect
                        </button>
                        <button
                            onClick={addCircle}
                            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"
                        >
                            <Circle className="w-4 h-4" />
                            Circle
                        </button>
                        <button
                            onClick={addTriangle}
                            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"
                        >
                            <Triangle className="w-4 h-4" />
                            Triangle
                        </button>
                        <button
                            onClick={addLine}
                            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"
                        >
                            <Minus className="w-4 h-4" />
                            Line
                        </button>
                        <button
                            onClick={addStar}
                            className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"
                        >
                            <Star className="w-4 h-4" />
                            Star
                        </button>
                    </div>
                    {/* Image upload */}
                    <label className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all cursor-pointer mt-1 w-full">
                        <Image className="w-4 h-4" />
                        Upload Image
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={addImageFromFile}
                        />
                    </label>
                </div>

                {/* ─── Placeholders ─── */}
                <div className="px-3 pt-2 pb-4 mt-2 border-t border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                        Placeholders
                    </p>
                    <p className="text-xs text-zinc-600 mb-3 leading-relaxed">
                        Locked elements filled automatically at issuance.
                    </p>
                    {Object.entries(PLACEHOLDER_CONFIG).map(([type, cfg]) => {
                        const exists = fabricRef.current
                            ?.getObjects()
                            .some((o) => o.customType === type);
                        return (
                            <button
                                key={type}
                                onClick={() => addPlaceholder(type)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md mb-1 text-xs text-left transition-all hover:opacity-90"
                                style={{
                                    backgroundColor: cfg.bg + "33",
                                    border: `1px solid ${cfg.color}55`,
                                    color: cfg.color,
                                }}
                            >
                                <Lock className="w-3 h-3 flex-shrink-0" />
                                <span className="flex-1 truncate">
                                    {cfg.label}
                                </span>
                                {exists && (
                                    <span className="text-xs opacity-60">
                                        ✓
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ─── Background ─── */}
                <div className="px-3 pt-2 pb-4 border-t border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                        Background
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBackground(e.target.value)}
                            className="w-9 h-9 rounded cursor-pointer border-2 border-zinc-700 bg-transparent"
                        />
                        <span className="text-xs text-zinc-400">{bgColor}</span>
                    </div>
                    {/* Quick bg presets */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {[
                            "#ffffff",
                            "#fffbf0",
                            "#f0f4ff",
                            "#f5f0ff",
                            "#1a1a2e",
                            "#0f172a",
                        ].map((c) => (
                            <button
                                key={c}
                                onClick={() => setBackground(c)}
                                title={c}
                                className="w-7 h-7 rounded-md border-2 border-zinc-700 hover:border-zinc-400 transition-all"
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                {/* ─── Canvas size ─── */}
                <div className="px-3 pt-2 pb-4 border-t border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                        Canvas Size
                    </p>
                    {[
                        { label: "A4 Landscape", w: 900, h: 630 },
                        { label: "A4 Portrait", w: 630, h: 900 },
                        { label: "Letter", w: 960, h: 740 },
                        { label: "Square", w: 700, h: 700 },
                    ].map(({ label, w, h }) => (
                        <button
                            key={label}
                            onClick={() => changeCanvasSize(w, h)}
                            className={`w-full text-xs text-left px-2 py-1.5 rounded mb-0.5 transition-all ${canvasSize.w === w && canvasSize.h === h ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                        >
                            {label}{" "}
                            <span className="opacity-50">
                                ({w}×{h})
                            </span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* ══════════════ MAIN AREA ══════════════ */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* ─── Top Toolbar ─── */}
                <div className="h-12 flex-shrink-0 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-3">
                    {/* Template name */}
                    <input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 w-44"
                        placeholder="Template name"
                    />

                    {/* Separator */}
                    <div className="w-px h-6 bg-zinc-700" />

                    {/* Undo / Redo */}
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="p-1.5 rounded hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="p-1.5 rounded hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-zinc-700" />

                    {/* Zoom */}
                    <button
                        onClick={zoomOut}
                        className="p-1.5 rounded hover:bg-zinc-700 transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-zinc-400 w-10 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        className="p-1.5 rounded hover:bg-zinc-700 transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        onClick={zoomReset}
                        className="text-xs text-zinc-400 hover:text-zinc-100 px-1 transition-colors"
                    >
                        Reset
                    </button>

                    <div className="w-px h-6 bg-zinc-700" />

                    {/* Grid */}
                    <button
                        onClick={() => setShowGrid((g) => !g)}
                        className={`p-1.5 rounded transition-colors ${showGrid ? "bg-purple-600 text-white" : "hover:bg-zinc-700"}`}
                        title="Toggle grid"
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>

                    {/* Is Default */}
                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer ml-1">
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="accent-purple-600"
                        />
                        Default template
                    </label>

                    <div className="flex-1" />

                    {/* z-order actions (shown when selection) */}
                    {selectedObj && (
                        <div className="flex items-center gap-1 mr-2">
                            <button
                                onClick={bringFront}
                                className="p-1 rounded hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-100"
                                title="Bring to front"
                            >
                                <ChevronUp className="w-3 h-3" />
                                <ChevronUp className="w-3 h-3 -mt-2" />
                            </button>
                            <button
                                onClick={bringFwd}
                                className="p-1 rounded hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-100"
                                title="Bring forward"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={sendBwd}
                                className="p-1 rounded hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-100"
                                title="Send backward"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                                onClick={sendBack}
                                className="p-1 rounded hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-100"
                                title="Send to back"
                            >
                                <ChevronDown className="w-3 h-3" />
                                <ChevronDown className="w-3 h-3 -mt-2" />
                            </button>
                            <div className="w-px h-4 bg-zinc-700 mx-1" />
                            <button
                                onClick={duplicateSelected}
                                className="p-1 rounded hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-100"
                                title="Duplicate (Ctrl+D)"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            {!isPlaceholderSelected && (
                                <button
                                    onClick={deleteSelected}
                                    className="p-1 rounded hover:bg-red-900 transition-colors text-zinc-400 hover:text-red-200"
                                    title="Delete (Del)"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Clear
                    </button>
                    <button
                        onClick={handlePreview}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white transition-colors shadow-lg"
                    >
                        {isSaving ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>

                {/* ─── Canvas Viewport ─── */}
                <div className="flex-1 overflow-auto bg-zinc-800 flex items-center justify-center p-8">
                    <div className="relative shadow-2xl ring-1 ring-zinc-700">
                        {/* Placeholder badge overlays (visual indicators above canvas) */}
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </div>

            {/* ══════════════ RIGHT PROPERTIES PANEL ══════════════ */}
            <aside className="w-[220px] flex-shrink-0 bg-zinc-900 border-l border-zinc-800 overflow-y-auto flex flex-col">
                {!selectedObj ? (
                    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                        <Settings className="w-10 h-10 text-zinc-700 mb-3" />
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Select an element on the canvas to edit its
                            properties.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {/* Placeholder badge */}
                        {isPlaceholderSelected && (
                            <div
                                className="rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2"
                                style={{
                                    backgroundColor:
                                        PLACEHOLDER_CONFIG[
                                            selectedObj.customType
                                        ]?.bg + "55",
                                    color: PLACEHOLDER_CONFIG[
                                        selectedObj.customType
                                    ]?.color,
                                    border: `1px solid ${PLACEHOLDER_CONFIG[selectedObj.customType]?.color}55`,
                                }}
                            >
                                <Lock className="w-3 h-3" />
                                Placeholder:{" "}
                                {
                                    PLACEHOLDER_CONFIG[selectedObj.customType]
                                        ?.label
                                }
                            </div>
                        )}

                        {/* ─ Position & Size ─ */}
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                                Position & Size
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    ["X", "left"],
                                    ["Y", "top"],
                                    ["W", "width"],
                                    ["H", "height"],
                                ].map(([label, key]) => (
                                    <div key={key}>
                                        <label className="text-xs text-zinc-500">
                                            {label}
                                        </label>
                                        <input
                                            type="number"
                                            value={props[key]}
                                            onChange={(e) =>
                                                updatePosition(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full mt-0.5 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2">
                                <label className="text-xs text-zinc-500">
                                    Angle (°)
                                </label>
                                <input
                                    type="number"
                                    value={props.angle}
                                    onChange={(e) =>
                                        updatePosition("angle", e.target.value)
                                    }
                                    className="w-full mt-0.5 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* ─ Text Properties ─ */}
                        {isText && (
                            <div>
                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                                    Typography
                                </p>
                                <select
                                    value={props.fontFamily}
                                    onChange={(e) =>
                                        updateProp("fontFamily", e.target.value)
                                    }
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs mb-2 focus:outline-none focus:border-purple-500"
                                >
                                    {FONT_FAMILIES.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2 items-center mb-2">
                                    <div className="flex-1">
                                        <label className="text-xs text-zinc-500">
                                            Size
                                        </label>
                                        <input
                                            type="number"
                                            value={props.fontSize}
                                            onChange={(e) =>
                                                updateProp(
                                                    "fontSize",
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                            className="w-full mt-0.5 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-0.5">
                                            Color
                                        </label>
                                        <input
                                            type="color"
                                            value={props.fill}
                                            onChange={(e) =>
                                                updateProp(
                                                    "fill",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-9 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                                        />
                                    </div>
                                </div>
                                {/* Style toggles */}
                                <div className="flex gap-1 mb-2">
                                    <button
                                        onClick={() =>
                                            updateProp(
                                                "fontWeight",
                                                props.fontWeight === "bold"
                                                    ? "normal"
                                                    : "bold",
                                            )
                                        }
                                        className={`flex-1 py-1.5 rounded text-xs flex justify-center ${props.fontWeight === "bold" ? "bg-purple-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                                    >
                                        <Bold className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            updateProp(
                                                "fontStyle",
                                                props.fontStyle === "italic"
                                                    ? "normal"
                                                    : "italic",
                                            )
                                        }
                                        className={`flex-1 py-1.5 rounded text-xs flex justify-center ${props.fontStyle === "italic" ? "bg-purple-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                                    >
                                        <Italic className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            updateProp(
                                                "underline",
                                                !props.underline,
                                            )
                                        }
                                        className={`flex-1 py-1.5 rounded text-xs flex justify-center ${props.underline ? "bg-purple-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                                    >
                                        <Underline className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                {/* Alignment */}
                                <div className="flex gap-1">
                                    {[
                                        ["left", AlignLeft],
                                        ["center", AlignCenter],
                                        ["right", AlignRight],
                                    ].map(([align, Icon]) => (
                                        <button
                                            key={align}
                                            onClick={() =>
                                                updateProp("textAlign", align)
                                            }
                                            className={`flex-1 py-1.5 rounded text-xs flex justify-center ${props.textAlign === align ? "bg-purple-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─ Shape Properties ─ */}
                        {(isShape || (!isText && selectedObj)) &&
                            !selectedObj.type?.includes("group") && (
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                                        Appearance
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs text-zinc-400">
                                                Fill
                                            </label>
                                            <input
                                                type="color"
                                                value={
                                                    typeof props.fill ===
                                                        "string" &&
                                                    props.fill.startsWith("#")
                                                        ? props.fill
                                                        : "#cccccc"
                                                }
                                                onChange={(e) =>
                                                    updateProp(
                                                        "fill",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-9 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs text-zinc-400">
                                                Stroke
                                            </label>
                                            <input
                                                type="color"
                                                value={
                                                    props.stroke || "#000000"
                                                }
                                                onChange={(e) =>
                                                    updateProp(
                                                        "stroke",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-9 h-7 rounded border border-zinc-700 cursor-pointer bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-400">
                                                Stroke Width
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="20"
                                                step="0.5"
                                                value={props.strokeWidth}
                                                onChange={(e) =>
                                                    updateProp(
                                                        "strokeWidth",
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-full mt-1 accent-purple-500"
                                            />
                                            <span className="text-xs text-zinc-500">
                                                {props.strokeWidth}px
                                            </span>
                                        </div>
                                        {selectedObj.type === "rect" && (
                                            <div>
                                                <label className="text-xs text-zinc-400">
                                                    Corner Radius
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="80"
                                                    value={props.rx}
                                                    onChange={(e) => {
                                                        updateProp(
                                                            "rx",
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        );
                                                        updateProp(
                                                            "ry",
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        );
                                                    }}
                                                    className="w-full mt-1 accent-purple-500"
                                                />
                                                <span className="text-xs text-zinc-500">
                                                    {props.rx}px
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* ─ Opacity ─ */}
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">
                                Opacity
                            </p>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={props.opacity}
                                onChange={(e) =>
                                    updateProp(
                                        "opacity",
                                        parseFloat(e.target.value),
                                    )
                                }
                                className="w-full accent-purple-500"
                            />
                            <span className="text-xs text-zinc-500">
                                {Math.round(props.opacity * 100)}%
                            </span>
                        </div>

                        {/* ─ Quick preset colors for text fill ─ */}
                        {isText && (
                            <div>
                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                                    Quick Colors
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {[
                                        "#1a1a2e",
                                        "#8b6914",
                                        "#c4a35a",
                                        "#1e3a8a",
                                        "#7c3aed",
                                        "#065f46",
                                        "#4a0404",
                                        "#000000",
                                        "#ffffff",
                                        "#94a3b8",
                                    ].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() =>
                                                updateProp("fill", c)
                                            }
                                            title={c}
                                            className="w-6 h-6 rounded-full border border-zinc-600 hover:border-zinc-300 transition-all"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </aside>
        </div>
    );
}
