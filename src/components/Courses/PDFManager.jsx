import { useState } from "react";
import {
    DocumentTextIcon,
    TrashIcon,
    EyeIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const PDFManager = ({ pdfFiles = [], onUpdate, disabled = false }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Please select a PDF file");
            return;
        }

        setUploading(true);
        try {
            // TODO: Implement actual PDF upload logic
            console.log("Uploading PDF:", file.name);

            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock response
            const mockPDFData = {
                id: Date.now(), // Temporary ID
                name: file.name,
                url: `https://example.com/pdfs/${file.name}`,
                size: file.size,
                uploadedAt: new Date().toISOString(),
            };

            const updatedFiles = [...pdfFiles, mockPDFData];
            if (onUpdate) {
                onUpdate(updatedFiles);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePDF = (pdfId) => {
        const updatedFiles = pdfFiles.filter((pdf) => pdf.id !== pdfId);
        if (onUpdate) {
            onUpdate(updatedFiles);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                    PDF Resources
                </h4>
                <label
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        disabled || uploading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    }`}
                >
                    <PlusIcon className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Add PDF"}
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        disabled={disabled || uploading}
                        className="hidden"
                    />
                </label>
            </div>

            {pdfFiles.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                        No PDF files uploaded yet
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {pdfFiles.map((pdf) => (
                        <div
                            key={pdf.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <DocumentTextIcon className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {pdf.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(pdf.size)} •{" "}
                                        {new Date(
                                            pdf.uploadedAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() =>
                                        window.open(pdf.url, "_blank")
                                    }
                                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                    title="View PDF"
                                >
                                    <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleRemovePDF(pdf.id)}
                                    disabled={disabled}
                                    className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                                    title="Remove PDF"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="text-xs text-gray-500">
                <p>• Supported format: PDF</p>
                <p>• Maximum file size: 50MB</p>
                <p>• Files will be available for download by students</p>
            </div>
        </div>
    );
};

PDFManager.propTypes = {
    pdfFiles: PropTypes.array,
    onUpdate: PropTypes.func,
    disabled: PropTypes.bool,
};

export default PDFManager;
