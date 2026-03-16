import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import emailsAPI from "../../API/Emails";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";

const TemplateEditorPage = ({
  templateType,
  title,
  description,
  sampleData,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTemplate = async () => {
      setLoading(true);
      try {
        const res = await emailsAPI.getTemplate(templateType);
        if (!isMounted || !res?.success) return;

        const tpl = res.template || {};
        setSubject(tpl.subject || "");
        setHtmlContent(tpl.htmlContent || "");
        setTextContent(tpl.textContent || "");
        setTokens(Array.isArray(res.tokens) ? res.tokens : []);
      } catch (error) {
        toast.error("Impossible de charger le modèle d'email");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTemplate();

    return () => {
      isMounted = false;
    };
  }, [templateType]);

  const handleSave = async () => {
    if (!subject.trim() || !htmlContent.trim()) {
      toast.error("Le sujet et le contenu HTML sont obligatoires");
      return;
    }

    setSaving(true);
    try {
      const res = await emailsAPI.saveTemplate(templateType, {
        subject,
        htmlContent,
        textContent,
      });

      if (res?.success) {
        toast.success("Template enregistré avec succès");
      } else {
        toast.error(res?.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du template");
    } finally {
      setSaving(false);
    }
  };

  const sampleRenderedHtml = htmlContent.replace(
    /{{\s*([a-zA-Z0-9_.]+)\s*}}/g,
    (_, key) => sampleData?.[key] || "",
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-gray-600">Chargement du template...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tokens.map((token) => (
            <span
              key={token}
              className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium"
            >
              {`{{${token}}}`}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sujet de l'email
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Sujet de l'email"
          />
        </div>

        <div>
          <RichTextEditor
            label="Contenu HTML (éditeur riche)"
            value={htmlContent}
            onChange={setHtmlContent}
            height="300px"
            required
            placeholder="Rédigez le contenu de votre email..."
          />
        </div>

        <div className="mat-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Version texte (optionnelle)
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Version texte brute (sinon le backend génère automatiquement à partir du HTML)."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Aperçu</h3>
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <p className="text-sm text-gray-500 mb-2">Sujet:</p>
          <p className="font-semibold text-gray-900 mb-4">
            {subject || "(vide)"}
          </p>

          <p className="text-sm text-gray-500 mb-2">Corps:</p>
          <div className="prose max-w-none">
            <RichTextDisplay content={sampleRenderedHtml} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorPage;
