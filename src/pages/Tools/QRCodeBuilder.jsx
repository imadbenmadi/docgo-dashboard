import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Link2,
  Palette,
  Sliders,
  QrCode,
} from "lucide-react";
import toast from "react-hot-toast";

const ERROR_LEVELS = [
  { value: "L", label: "L — Low (7%)" },
  { value: "M", label: "M — Medium (15%)" },
  { value: "Q", label: "Q — Quartile (25%)" },
  { value: "H", label: "H — High (30%)" },
];

const PRESETS = [
  { label: "Classic", fg: "#000000", bg: "#ffffff" },
  { label: "Blue", fg: "#1d4ed8", bg: "#eff6ff" },
  { label: "Dark", fg: "#f8fafc", bg: "#0f172a" },
  { label: "Green", fg: "#15803d", bg: "#f0fdf4" },
  { label: "Purple", fg: "#7c3aed", bg: "#faf5ff" },
  { label: "Rose", fg: "#be123c", bg: "#fff1f2" },
];

const QRCodeBuilder = () => {
  const canvasRef = useRef(null);

  const [url, setUrl] = useState("https://");
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState("M");
  const [margin, setMargin] = useState(2);
  const [copied, setCopied] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const generate = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !url.trim() || url.trim() === "https://") {
      setHasContent(false);
      return;
    }
    try {
      await QRCode.toCanvas(canvas, url.trim(), {
        width: size,
        margin,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      setHasContent(true);
    } catch {
      setHasContent(false);
    }
  }, [url, size, fgColor, bgColor, errorLevel, margin]);

  useEffect(() => {
    generate();
  }, [generate]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR code téléchargé !");
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    try {
      canvas.toBlob(async (blob) => {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        toast.success("Image copiée dans le presse-papiers !");
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      toast.error("Copie non supportée par ce navigateur.");
    }
  };

  const reset = () => {
    setUrl("https://");
    setSize(300);
    setFgColor("#000000");
    setBgColor("#ffffff");
    setErrorLevel("M");
    setMargin(2);
  };

  const applyPreset = (preset) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
  };

  const isEmpty = !url.trim() || url.trim() === "https://";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-600 rounded-xl">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">QR Code Builder</h1>
        </div>
        <p className="text-gray-500 text-sm ml-12">
          Générez et téléchargez des QR codes personnalisés pour vos réseaux
          sociaux
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Controls */}
        <div className="space-y-5">
          {/* URL Input */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Lien / Texte
              </h2>
            </div>
            <textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              rows={3}
              placeholder="Collez votre lien ou texte ici..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400 font-mono"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              URL, texte, email, numéro de téléphone…
            </p>
          </div>

          {/* Colors + Presets */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Couleurs
              </h2>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${
                    fgColor === preset.fg && bgColor === preset.bg
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: preset.bg, color: preset.fg }}
                >
                  <span
                    className="w-3 h-3 rounded-full border shrink-0"
                    style={{
                      backgroundColor: preset.fg,
                      borderColor: preset.fg + "44",
                    }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-500 mb-1.5 block">
                  Couleur QR
                </span>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-300 transition-colors">
                  <span
                    className="w-5 h-5 rounded-md border border-gray-300 shrink-0"
                    style={{ backgroundColor: fgColor }}
                  />
                  <span className="text-sm font-mono text-gray-700 flex-1">
                    {fgColor}
                  </span>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-0 h-0 opacity-0 absolute"
                    id="fg-color"
                  />
                  <label
                    htmlFor="fg-color"
                    className="cursor-pointer text-xs text-blue-600 hover:underline shrink-0"
                  >
                    Changer
                  </label>
                </div>
              </label>
              <label className="block">
                <span className="text-xs text-gray-500 mb-1.5 block">Fond</span>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-300 transition-colors">
                  <span
                    className="w-5 h-5 rounded-md border border-gray-300 shrink-0"
                    style={{ backgroundColor: bgColor }}
                  />
                  <span className="text-sm font-mono text-gray-700 flex-1">
                    {bgColor}
                  </span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-0 h-0 opacity-0 absolute"
                    id="bg-color"
                  />
                  <label
                    htmlFor="bg-color"
                    className="cursor-pointer text-xs text-blue-600 hover:underline shrink-0"
                  >
                    Changer
                  </label>
                </div>
              </label>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Paramètres
              </h2>
            </div>

            <div className="space-y-4">
              {/* Size */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-gray-600 font-medium">
                    Taille
                  </span>
                  <span className="text-xs text-blue-600 font-semibold">
                    {size}px
                  </span>
                </div>
                <input
                  type="range"
                  min={128}
                  max={600}
                  step={8}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>128px</span>
                  <span>600px</span>
                </div>
              </div>

              {/* Margin */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-gray-600 font-medium">
                    Marge
                  </span>
                  <span className="text-xs text-blue-600 font-semibold">
                    {margin}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={1}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>6</span>
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <span className="text-xs text-gray-600 font-medium block mb-1.5">
                  Correction d'erreur
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {ERROR_LEVELS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setErrorLevel(value)}
                      title={label}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        errorLevel === value
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {ERROR_LEVELS.find((e) => e.value === errorLevel)?.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Preview */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="mb-4 text-center">
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Aperçu
              </h2>
            </div>

            <div
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                isEmpty ? "opacity-30 grayscale" : "opacity-100"
              }`}
              style={{
                boxShadow: isEmpty ? "none" : "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <canvas ref={canvasRef} />
            </div>

            {isEmpty && (
              <p className="mt-4 text-sm text-gray-400 text-center">
                Collez un lien pour générer votre QR code
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={download}
              disabled={isEmpty || !hasContent}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
            >
              <Download className="w-4 h-4" />
              Télécharger en PNG
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyToClipboard}
                disabled={isEmpty || !hasContent}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier l'image
                  </>
                )}
              </button>

              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Info tip */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Conseil :</span> Pour un usage sur
              les réseaux sociaux, utilisez la correction d'erreur{" "}
              <span className="font-semibold">H</span> (30%) pour que le QR code
              reste lisible même si une partie est masquée par un logo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeBuilder;
