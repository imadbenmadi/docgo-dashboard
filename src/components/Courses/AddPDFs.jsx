import { useState } from "react";
import { FileText, Plus, X, Upload, Edit, Trash2 } from "lucide-react";

export default function AddPDFs({ courseId, formik }) {
  const [showPDFSection, setShowPDFSection] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [newPDF, setNewPDF] = useState({
    title: "",
    description: "",
    file: null,
  });

  const handleAddPDF = () => {
    if (!newPDF.title.trim()) {
      alert("Le titre du PDF est requis");
      return;
    }
    if (!newPDF.file) {
      alert("Veuillez sélectionner un fichier PDF");
      return;
    }

    const pdfToAdd = {
      id: Date.now(),
      title: newPDF.title,
      description: newPDF.description,
      file: newPDF.file,
      fileName: newPDF.file.name,
    };

    setPdfs([...pdfs, pdfToAdd]);
    setNewPDF({ title: "", description: "", file: null });

    // Update formik values
    if (formik) {
      formik.setFieldValue("pdfs", [...pdfs, pdfToAdd]);
    }
  };

  const handleDeletePDF = (id) => {
    const updatedPdfs = pdfs.filter((pdf) => pdf.id !== id);
    setPdfs(updatedPdfs);

    // Update formik values
    if (formik) {
      formik.setFieldValue("pdfs", updatedPdfs);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Seuls les fichiers PDF sont autorisés");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        alert("Le fichier est trop volumineux. Maximum 50MB.");
        return;
      }
      setNewPDF({ ...newPDF, file });
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-800">Ressources PDF</h2>
          <p className="text-gray-600 mt-1">
            Ajoutez des documents PDF pour enrichir votre cours
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPDFSection(!showPDFSection)}
          className={`px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg ${
            showPDFSection
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {showPDFSection ? (
            <>
              <X className="w-5 h-5" />
              Fermer
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Ajouter des PDFs
            </>
          )}
        </button>
      </div>

      {showPDFSection && (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Titre du PDF *
              </label>
              <input
                type="text"
                value={newPDF.title}
                onChange={(e) =>
                  setNewPDF({ ...newPDF, title: e.target.value })
                }
                placeholder="Entrez le titre du PDF"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={newPDF.description}
                onChange={(e) =>
                  setNewPDF({ ...newPDF, description: e.target.value })
                }
                placeholder="Décrivez le contenu du PDF"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Fichier PDF *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex flex-col justify-center items-center p-6 w-full text-center rounded-xl border-2 border-dashed border-red-300 hover:border-red-400 transition-colors cursor-pointer bg-white hover:bg-red-50"
                >
                  {newPDF.file ? (
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-red-600 mb-2 mx-auto" />
                      <p className="text-gray-800 font-medium">
                        {newPDF.file.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {(newPDF.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-red-600 mb-2" />
                      <p className="text-gray-800 font-medium">
                        Télécharger un fichier PDF
                      </p>
                      <p className="text-gray-500 text-sm">
                        PDF uniquement, maximum 50MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddPDF}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ajouter le PDF
            </button>
          </div>
        </div>
      )}

      {/* PDF List */}
      {pdfs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            PDFs ajoutés ({pdfs.length})
          </h3>
          {pdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6 text-red-600" />
                    <h4 className="text-lg font-semibold text-gray-800">
                      {pdf.title}
                    </h4>
                  </div>
                  {pdf.description && (
                    <p className="text-gray-600 mb-2">{pdf.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Fichier: {pdf.fileName}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleDeletePDF(pdf.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pdfs.length === 0 && showPDFSection && (
        <div className="text-center text-gray-500 py-8">
          <FileText className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg">Aucun PDF ajouté</p>
          <p className="text-sm">
            Ajoutez des ressources PDF pour enrichir votre cours
          </p>
        </div>
      )}
    </section>
  );
}
