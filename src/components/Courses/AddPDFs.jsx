import React, { useState, useEffect } from "react";
import { Loader2, Upload, Eye, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ReactPaginate from "react-paginate";

const MySwal = withReactContent(Swal);

const AddPDFs = () => {
  const { id } = useParams(); // Course ID from URL
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 5,
  });

  // Fetch PDFs
  useEffect(() => {
    const fetchPDFs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/courses/${id}/pdfs?page=${pagination.currentPage}&pageSize=${pagination.pageSize}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des PDFs");
        // const data = await response.json();
        const data = {
          pdfs: [
            {
              id: 1,
              name: "Sample PDF 1",
              size: 2048000,
              createdAt: "2023-10-01T12:00:00Z",
              url: "/path/to/sample1.pdf",
            },
            {
              id: 2,
              name: "Sample PDF 2",
              size: 3072000,
              createdAt: "2023-10-02T12:00:00Z",
              url: "/path/to/sample2.pdf",
            },
          ],
          totalPages: 1,
        };

        setPdfs(data.pdfs || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.totalPages || 1,
        }));
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "Erreur",
          text: error.message,
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPDFs();
  }, [id, pagination.currentPage]);

  // Handle PDF upload
  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes("pdf")) {
      MySwal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez sélectionner un fichier PDF.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      MySwal.fire({
        icon: "error",
        title: "Erreur",
        text: "Le fichier est trop volumineux. Maximum 50MB.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("file", file);

      const response = await fetch(`/api/courses/${id}/pdfs`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Erreur lors du téléchargement du PDF");
      const newPDF = await response.json();
      setPdfs((prev) => [...prev, newPDF]);
      setUploadProgress(100);
      MySwal.fire({
        icon: "success",
        title: "Succès",
        text: "PDF téléchargé avec succès!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Erreur",
        text: error.message,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      const fileInput = document.getElementById("pdf-upload");
      if (fileInput) fileInput.value = "";
    }
  };

  // Handle PDF deletion
  const handleDeletePDF = async (pdfId, pdfName) => {
    const result = await MySwal.fire({
      icon: "warning",
      title: "Confirmer la suppression",
      text: `Voulez-vous supprimer le PDF "${pdfName}" ?`,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/courses/${id}/pdfs/${pdfId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression du PDF");
      setPdfs((prev) => prev.filter((pdf) => pdf.id !== pdfId));
      MySwal.fire({
        icon: "success",
        title: "Succès",
        text: "PDF supprimé avec succès!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Erreur",
        text: error.message,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Handle PDF preview
  const handleViewPDF = (pdf) => {
    setSelectedPDF(pdf);
    setIsModalOpen(true);
  };

  // Handle pagination
  const handlePageChange = (selectedPage) => {
    setPagination((prev) => ({ ...prev, currentPage: selectedPage }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* PDF Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <h2 className="text-lg font-semibold mb-4">
              Aperçu du PDF - {selectedPDF?.name}
            </h2>
            {selectedPDF ? (
              <iframe
                src={selectedPDF.url}
                title={selectedPDF.name}
                className="w-full h-96 border rounded"
              />
            ) : (
              <p className="text-gray-500 mb-4">Aucun PDF disponible</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gérer les PDFs du Cours
        </h1>
        <p className="text-gray-600 mt-1">
          Ajoutez, visualisez ou supprimez des PDFs pour ce cours.
        </p>
      </div>

      {/* PDF Upload */}
      <div className="mb-6">
        <label
          htmlFor="pdf-upload"
          className="block text-lg font-semibold text-gray-800 mb-3"
        >
          Télécharger un PDF
        </label>
        <div className="relative">
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePDFUpload}
            className="hidden"
            id="pdf-upload"
            disabled={isUploading}
            aria-label="Télécharger un fichier PDF"
          />
          <label
            htmlFor="pdf-upload"
            className={`flex flex-col justify-center items-center p-6 w-full text-center rounded-2xl border-2 border-dashed border-blue-600 hover:border-blue-700 transition-colors cursor-pointer bg-blue-50/50 hover:bg-blue-100/50 ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="w-12 h-12 text-blue-600 mb-3" />
            <p className="text-gray-800 text-lg">Télécharger un fichier PDF</p>
            <p className="text-gray-500 text-sm mt-1">PDF jusqu'à 50MB</p>
            {isUploading && (
              <div className="w-full mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* PDF List */}
      {pdfs.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="text-lg">Aucun PDF ajouté</p>
          <p className="text-sm">Ajoutez des PDFs pour enrichir votre cours.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-4 gap-4 bg-gray-100 border-b border-gray-200 px-6 py-4 text-sm font-semibold text-gray-700 rounded-t-lg">
                  <div>Nom du PDF</div>
                  <div>Taille</div>
                  <div>Date d'ajout</div>
                  <div className="text-center">Actions</div>
                </div>
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="grid grid-cols-4 gap-4 border-b border-gray-200 py-4 px-6 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <div>{pdf.name}</div>
                    <div>{(pdf.size / (1024 * 1024)).toFixed(2)} MB</div>
                    <div>
                      {new Date(pdf.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        onClick={() => handleViewPDF(pdf)}
                        aria-label={`Voir le PDF ${pdf.name}`}
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                      <button
                        className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        onClick={() => handleDeletePDF(pdf.id, pdf.name)}
                        aria-label={`Supprimer le PDF ${pdf.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:hidden space-y-4">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="font-semibold">Nom:</div>
                  <div>{pdf.name}</div>
                  <div className="font-semibold">Taille:</div>
                  <div>{(pdf.size / (1024 * 1024)).toFixed(2)} MB</div>
                  <div className="font-semibold">Date d'ajout:</div>
                  <div>
                    {new Date(pdf.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                  <div className="font-semibold">Actions:</div>
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      onClick={() => handleViewPDF(pdf)}
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      onClick={() => handleDeletePDF(pdf.id, pdf.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <ReactPaginate
          previousLabel={"Précédent"}
          nextLabel={"Suivant"}
          breakLabel={"..."}
          pageCount={pagination.totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={({ selected }) => handlePageChange(selected + 1)}
          containerClassName={"flex items-center justify-center mt-6 gap-2"}
          pageClassName={
            "px-3 py-1 rounded-lg border border-gray-200 text-sm hover:bg-gray-100"
          }
          pageLinkClassName={"text-gray-700"}
          activeClassName={"bg-blue-500 text-white border-blue-500"}
          previousClassName={`px-3 py-1 rounded-lg border text-sm ${
            pagination.currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          nextClassName={`px-3 py-1 rounded-lg border text-sm ${
            pagination.currentPage === pagination.totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          breakClassName={"px-3 py-1 text-sm"}
          forcePage={pagination.currentPage - 1}
        />
      )}
    </div>
  );
};

export default AddPDFs;
