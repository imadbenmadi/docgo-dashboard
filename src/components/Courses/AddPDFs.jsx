import { useState } from "react";
import { FileText, Plus, X, Upload, Trash2, Edit, Check } from "lucide-react";
import ValidationErrorPanel from "../Common/FormValidation/ValidationErrorPanel";
import { useFormValidation } from "../Common/FormValidation/useFormValidation";

export default function AddPDFs({ formik, showAlert }) {
    const [showPDFSection, setShowPDFSection] = useState(false);
    const [pdfs, setPdfs] = useState(formik.values.pdfs || []);
    const [newPDF, setNewPDF] = useState({
        title: "",
        description: "",
        file: null,
    });
    const [editingPDF, setEditingPDF] = useState(null);
    const [editingPDFData, setEditingPDFData] = useState({
        title: "",
        description: "",
        file: null,
    });
    const {
        errors: panelErrors,
        showPanel,
        validate,
        hidePanel,
    } = useFormValidation();

    const handleAddPDF = () => {
        const isValid = validate([
            {
                field: "Titre du PDF",
                message: "Le titre du PDF est requis",
                section: "Informations PDF",
                scrollToId: "pdf-title-input",
                condition: !newPDF.title.trim(),
            },
            {
                field: "Fichier PDF",
                message: "Veuillez sélectionner un fichier PDF",
                section: "Informations PDF",
                scrollToId: "pdf-file-input",
                condition: !newPDF.file,
            },
        ]);
        if (!isValid) return;

        const pdfToAdd = {
            id: Date.now(),
            title: newPDF.title,
            description: newPDF.description,
            file: newPDF.file,
            fileName: newPDF.file.name,
        };

        const updatedPdfs = [...pdfs, pdfToAdd];
        setPdfs(updatedPdfs);
        setNewPDF({ title: "", description: "", file: null });

        // Update Formik values
        formik.setFieldValue("pdfs", updatedPdfs);
        showAlert("success", "Succès", "PDF ajouté avec succès !");
    };

    const handleEditPDF = (pdf) => {
        setEditingPDF(pdf.id);
        setEditingPDFData({
            title: pdf.title,
            description: pdf.description,
            file: pdf.file,
        });
    };

    const handleSaveEditPDF = () => {
        const isValid = validate([
            {
                field: "Titre du PDF",
                message: "Le titre du PDF est requis",
                section: "Modification PDF",
                condition: !editingPDFData.title.trim(),
            },
        ]);
        if (!isValid) return;

        const updatedPdfs = pdfs.map((pdf) =>
            pdf.id === editingPDF
                ? {
                      ...pdf,
                      title: editingPDFData.title,
                      description: editingPDFData.description,
                      file: editingPDFData.file || pdf.file,
                      fileName: editingPDFData.file?.name || pdf.fileName,
                  }
                : pdf,
        );

        setPdfs(updatedPdfs);
        formik.setFieldValue("pdfs", updatedPdfs);
        setEditingPDF(null);
        setEditingPDFData({ title: "", description: "", file: null });
        showAlert("success", "Succès", "PDF modifié avec succès !");
    };

    const handleCancelEdit = () => {
        setEditingPDF(null);
        setEditingPDFData({ title: "", description: "", file: null });
    };

    const handleDeletePDF = (id) => {
        const updatedPdfs = pdfs.filter((pdf) => pdf.id !== id);
        setPdfs(updatedPdfs);

        // Update Formik values
        formik.setFieldValue("pdfs", updatedPdfs);
        showAlert("success", "Succès", "PDF supprimé avec succès !");
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                validate([
                    {
                        field: "Fichier PDF",
                        message: "Seuls les fichiers PDF sont autorisés",
                        section: "Upload de fichier",
                        scrollToId: "pdf-file-input",
                        condition: true,
                    },
                ]);
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                validate([
                    {
                        field: "Fichier PDF",
                        message:
                            "Le fichier est trop volumineux. Maximum 50MB.",
                        section: "Upload de fichier",
                        scrollToId: "pdf-file-input",
                        condition: true,
                    },
                ]);
                return;
            }
            setNewPDF({ ...newPDF, file });
        }
    };

    const handleEditFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                validate([
                    {
                        field: "Fichier PDF",
                        message: "Seuls les fichiers PDF sont autorisés",
                        section: "Modification PDF",
                        condition: true,
                    },
                ]);
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                validate([
                    {
                        field: "Fichier PDF",
                        message:
                            "Le fichier est trop volumineux. Maximum 50MB.",
                        section: "Modification PDF",
                        condition: true,
                    },
                ]);
                return;
            }
            setEditingPDFData({ ...editingPDFData, file });
        }
    };

    return (
        <section className="mb-12">
            <ValidationErrorPanel
                errors={panelErrors}
                isVisible={showPanel}
                onClose={hidePanel}
                title="Vérifiez les informations PDF"
            />
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Ressources PDF
                    </h2>
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
                                id="pdf-title-input"
                                type="text"
                                value={newPDF.title}
                                onChange={(e) =>
                                    setNewPDF({
                                        ...newPDF,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Entrez le titre du PDF"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            {formik.touched.pdfs && formik.errors.pdfs && (
                                <p className="text-red-500 text-sm mt-2">
                                    {formik.errors.pdfs}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-gray-800 mb-2">
                                Description
                            </label>
                            <textarea
                                value={newPDF.description}
                                onChange={(e) =>
                                    setNewPDF({
                                        ...newPDF,
                                        description: e.target.value,
                                    })
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
                            <div id="pdf-file-input" className="relative">
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
                                                {(
                                                    newPDF.file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                MB
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
                            {editingPDF === pdf.id ? (
                                // Edit mode
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Titre du PDF *
                                        </label>
                                        <input
                                            type="text"
                                            value={editingPDFData.title}
                                            onChange={(e) =>
                                                setEditingPDFData({
                                                    ...editingPDFData,
                                                    title: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Titre du PDF"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={editingPDFData.description}
                                            onChange={(e) =>
                                                setEditingPDFData({
                                                    ...editingPDFData,
                                                    description: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                            rows="2"
                                            placeholder="Description"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Remplacer le fichier (optionnel)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleEditFileSelect}
                                                className="hidden"
                                                id={`pdf-edit-upload-${pdf.id}`}
                                            />
                                            <label
                                                htmlFor={`pdf-edit-upload-${pdf.id}`}
                                                className="flex flex-col justify-center items-center p-4 w-full text-center rounded-lg border-2 border-dashed border-red-300 hover:border-red-400 transition-colors cursor-pointer bg-white hover:bg-red-50"
                                            >
                                                {editingPDFData.file ? (
                                                    <div className="text-center">
                                                        <FileText className="w-6 h-6 text-red-600 mb-1 mx-auto" />
                                                        <p className="text-gray-800 font-medium text-sm">
                                                            {
                                                                editingPDFData
                                                                    .file.name
                                                            }
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            {(
                                                                editingPDFData
                                                                    .file.size /
                                                                1024 /
                                                                1024
                                                            ).toFixed(2)}{" "}
                                                            MB
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-red-600 mb-1" />
                                                        <p className="text-gray-800 font-medium text-sm">
                                                            Changer le fichier
                                                            PDF
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            Fichier actuel:{" "}
                                                            {pdf.fileName}
                                                        </p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveEditPDF}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                        >
                                            <Check className="w-4 h-4" />
                                            Sauvegarder
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-1"
                                        >
                                            <X className="w-4 h-4" />
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Display mode
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FileText className="w-6 h-6 text-red-600" />
                                            <h4 className="text-lg font-semibold text-gray-800">
                                                {pdf.title}
                                            </h4>
                                        </div>
                                        {pdf.description && (
                                            <p className="text-gray-600 mb-2">
                                                {pdf.description}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            Fichier: {pdf.fileName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => handleEditPDF(pdf)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeletePDF(pdf.id)
                                            }
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
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
