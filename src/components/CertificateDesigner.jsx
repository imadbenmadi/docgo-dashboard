import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";
import Swal from "sweetalert2";
import {
  Save,
  Plus,
  Trash2,
  Copy,
  Type,
  Square,
  Circle,
  Image,
  Undo2,
} from "lucide-react";

/**
 * ============================================================================
 * CERTIFICATE DESIGNER COMPONENT
 * ============================================================================
 * Professional Fabric.js based certificate template designer
 * Allows admins to:
 * - Design certificate layouts visually
 * - Add text, shapes, images
 * - Place dynamic placeholders ([STUDENT NAME], [COURSE TITLE], [DATE])
 * - Preview and save designs
 */

const CertificateDesigner = ({ onSave, initialTemplate }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(900);
  const [canvasHeight, setCanvasHeight] = useState(630);
  const [history, setHistory] = useState([]);
  const [templateName, setTemplateName] = useState("");

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#ffffff",
      border: "2px solid #e5e7eb",
    });

    // Load existing template if provided
    if (initialTemplate?.fabricJson) {
      const json =
        typeof initialTemplate.fabricJson === "string"
          ? JSON.parse(initialTemplate.fabricJson)
          : initialTemplate.fabricJson;
      newCanvas.loadFromJSON(json, () => {
        newCanvas.renderAll();
      });
      setTemplateName(initialTemplate.name || "");
    }

    // Handle object selection
    newCanvas.on("selection:created", (e) => {
      setSelectedObject(e.selected[0]);
    });
    newCanvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected[0]);
    });
    newCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    setCanvas(newCanvas);

    return () => newCanvas.dispose();
  }, [canvasWidth, canvasHeight, initialTemplate]);

  // ──────────────────────────────────────────────────────────────
  // Text Tools
  // ──────────────────────────────────────────────────────────────

  const addStaticText = () => {
    if (!canvas) return;
    const text = new fabric.Text("Edit this text", {
      left: 50,
      top: 50,
      fontSize: 20,
      fontFamily: "Georgia",
      fill: "#000000",
      editable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addPlaceholder = (placeholderType) => {
    if (!canvas) return;

    const placeholders = {
      studentName: "[STUDENT NAME]",
      courseTitle: "[COURSE TITLE]",
      issueDate: "[DATE]",
      verificationUrl: "[VERIFICATION URL]",
    };

    const text = new fabric.Text(
      placeholders[placeholderType] || "[PLACEHOLDER]",
      {
        left: 50,
        top: 50,
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: "Georgia",
        fill: "#1e3a8a",
        editable: true,
        customType: placeholderType,
      },
    );

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // ──────────────────────────────────────────────────────────────
  // Shape Tools
  // ──────────────────────────────────────────────────────────────

  const addRectangle = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      width: 200,
      height: 100,
      fill: "transparent",
      stroke: "#1e3a8a",
      strokeWidth: 2,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 50,
      top: 50,
      radius: 50,
      fill: "transparent",
      stroke: "#1e3a8a",
      strokeWidth: 2,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const addLine = () => {
    if (!canvas) return;
    const line = new fabric.Line([0, 0, 200, 0], {
      left: 50,
      top: 50,
      stroke: "#374151",
      strokeWidth: 2,
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  };

  // ──────────────────────────────────────────────────────────────
  // Object Properties
  // ──────────────────────────────────────────────────────────────

  const updateObjectProperty = (property, value) => {
    if (!selectedObject) return;

    if (property === "fontSize") {
      selectedObject.set({ fontSize: parseInt(value) });
    } else if (property === "color") {
      selectedObject.set({ fill: value });
    } else if (property === "stroke") {
      selectedObject.set({ stroke: value });
    } else if (property === "fontFamily") {
      selectedObject.set({ fontFamily: value });
    } else if (property === "fontWeight") {
      selectedObject.set({ fontWeight: value });
    } else if (property === "opacity") {
      selectedObject.set({ opacity: parseFloat(value) });
    }

    canvas.renderAll();
  };

  const deleteSelectedObject = () => {
    if (!selectedObject) return;
    canvas.remove(selectedObject);
    setSelectedObject(null);
    canvas.renderAll();
  };

  const duplicateObject = () => {
    if (!selectedObject) return;
    selectedObject.clone((cloned) => {
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  // ──────────────────────────────────────────────────────────────
  // Canvas Operations
  // ──────────────────────────────────────────────────────────────

  const downloadPreview = () => {
    if (!canvas) return;
    const png = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = png;
    link.download = `certificate-preview-${Date.now()}.png`;
    link.click();
  };

  const saveTemplate = () => {
    if (!canvas || !templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    const fabricJson = canvas.toJSON();
    const previewImage = canvas.toDataURL("image/png");

    if (onSave) {
      onSave({
        name: templateName,
        canvasWidth,
        canvasHeight,
        fabricJson: JSON.stringify(fabricJson),
        previewImage,
      });
    }
  };

  const clearCanvas = () => {
    Swal.fire({
      title: "Clear Canvas?",
      text: "Are you sure you want to clear the entire canvas?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clear",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        canvas.clear();
        setSelectedObject(null);
        canvas.renderAll();
      }
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Certificate Designer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <canvas
                ref={canvasRef}
                className="border-4 border-gray-300 mx-auto"
              />

              {/* Canvas Info */}
              <div className="mt-4 text-center text-sm text-gray-600">
                Canvas: {canvasWidth}x{canvasHeight}px
              </div>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Template Name */}
            <div className="bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Default Certificate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Add Text Section */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Add Text
              </h3>
              <div className="space-y-2">
                <button
                  onClick={addStaticText}
                  className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-lg transition"
                >
                  Static Text
                </button>
                <button
                  onClick={() => addPlaceholder("studentName")}
                  className="w-full px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm rounded-lg transition"
                >
                  Student Name
                </button>
                <button
                  onClick={() => addPlaceholder("courseTitle")}
                  className="w-full px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm rounded-lg transition"
                >
                  Course Title
                </button>
                <button
                  onClick={() => addPlaceholder("issueDate")}
                  className="w-full px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm rounded-lg transition"
                >
                  Issue Date
                </button>
              </div>
            </div>

            {/* Add Shapes Section */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Square className="w-4 h-4" />
                Add Shapes
              </h3>
              <div className="space-y-2">
                <button
                  onClick={addRectangle}
                  className="w-full px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm rounded-lg transition"
                >
                  Rectangle
                </button>
                <button
                  onClick={addCircle}
                  className="w-full px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm rounded-lg transition"
                >
                  Circle
                </button>
                <button
                  onClick={addLine}
                  className="w-full px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm rounded-lg transition"
                >
                  Line
                </button>
              </div>
            </div>

            {/* Selected Object Properties */}
            {selectedObject && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Properties
                </h3>

                {/* Font Size */}
                {selectedObject.fontSize !== undefined && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Font Size
                    </label>
                    <input
                      type="number"
                      value={selectedObject.fontSize}
                      onChange={(e) =>
                        updateObjectProperty("fontSize", e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}

                {/* Fill Color */}
                {selectedObject.fill !== undefined && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedObject.fill}
                        onChange={(e) =>
                          updateObjectProperty("color", e.target.value)
                        }
                        className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">
                        {selectedObject.fill}
                      </span>
                    </div>
                  </div>
                )}

                {/* Opacity */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Opacity
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedObject.opacity || 1}
                    onChange={(e) =>
                      updateObjectProperty("opacity", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                {/* Object Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={duplicateObject}
                    className="flex-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3 mx-auto" />
                  </button>
                  <button
                    onClick={deleteSelectedObject}
                    className="flex-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Actions */}
            <div className="bg-white rounded-lg shadow p-4 space-y-2">
              <button
                onClick={downloadPreview}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition flex items-center justify-center gap-2"
              >
                <Image className="w-4 h-4" />
                Download Preview
              </button>
              <button
                onClick={clearCanvas}
                className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Canvas
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={saveTemplate}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Template
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How to use:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use the right panel to add text, shapes, and placeholders</li>
            <li>Click on canvas objects to select and edit their properties</li>
            <li>
              Placeholders like [STUDENT NAME] will automatically populate with
              actual data
            </li>
            <li>Design in standard landscape (900x630) format</li>
            <li>Download preview before saving to verify design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CertificateDesigner;
