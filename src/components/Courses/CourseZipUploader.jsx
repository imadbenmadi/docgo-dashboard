import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../utils/apiClient";
import "../../styles/ZipCourseUploader.css";

/**
 * CourseZipUploader Component
 *
 * Allows admin to upload and extract ZIP files for courses.
 * Handles file validation, upload progress, and error states.
 */
export const CourseZipUploader = ({ courseId, onUploadSuccess, onError }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadInfo, setUploadInfo] = useState(null);

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    // Validate file type
    if (
      !selected.type.includes("zip") &&
      !selected.name.toLowerCase().endsWith(".zip")
    ) {
      setError(t("invalidZipFile", "Please select a valid ZIP file"));
      setFile(null);
      return;
    }

    // Validate file size
    if (selected.size > MAX_FILE_SIZE) {
      setError(t("fileTooLarge", "File size exceeded. Maximum size is 500MB."));
      setFile(null);
      return;
    }

    setFile(selected);
    setError("");
    setProgress(0);
    setUploadInfo(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError(t("selectFile", "Please select a file"));
      return;
    }

    setLoading(true);
    setError("");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("zipFile", file);

      const response = await axios.post(
        `/Admin/courses/${courseId}/upload-zip`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            if (event.total) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress(percent);
            }
          },
        },
      );

      if (response.data.success) {
        setUploadInfo(response.data.data);
        setFile(null);
        setProgress(0);
        onUploadSuccess?.(response.data.data);
      } else {
        setError(response.data.message || t("uploadFailed", "Upload failed"));
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        t("uploadError", "Upload failed");
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError("");
    setProgress(0);
    setUploadInfo(null);
  };

  return (
    <div className="zip-uploader-container">
      <div className="zip-uploader-card">
        <h3>{t("uploadZipCourse", "Upload Course Content (ZIP)")}</h3>
        <p className="description">
          {t(
            "zipCourseDescription",
            "Upload a ZIP file containing course materials. The system will extract and index all files for students to browse.",
          )}
        </p>

        {/* Success State */}
        {uploadInfo && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <div className="success-content">
              <h4>{t("uploadSuccess", "Upload Successful!")}</h4>
              <p>
                {t("fileName", "File")}: {uploadInfo.fileName}
              </p>
              <p>
                {t("fileSize", "Size")}:{" "}
                {(uploadInfo.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
              <p>
                {t("filesIndexed", "Files indexed")}: {uploadInfo.fileCount}
              </p>
              <button className="btn-reset" onClick={handleReset}>
                {t("uploadAnother", "Upload Another")}
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Upload Form */}
        {!uploadInfo && (
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-wrapper">
              <label htmlFor="zip-input" className="file-label">
                {file ? (
                  <span className="file-selected">📁 {file.name}</span>
                ) : (
                  <>
                    <span className="upload-icon">📦</span>
                    <span className="upload-text">
                      {t(
                        "dragDropZip",
                        "Drag and drop your ZIP file here, or click to select",
                      )}
                    </span>
                    <span className="file-info">
                      {t("maxSize", "Maximum size: 500MB")}
                    </span>
                  </>
                )}
              </label>
              <input
                id="zip-input"
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                disabled={loading}
                className="file-input-hidden"
              />
            </div>

            {file && (
              <div className="file-preview">
                <div className="file-info-detail">
                  <p>
                    <strong>{t("fileName", "File")}:</strong> {file.name}
                  </p>
                  <p>
                    <strong>{t("fileSize", "Size")}:</strong>{" "}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {loading && progress > 0 && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="progress-text">{progress}%</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={!file || loading}
                className="btn-submit"
              >
                {loading
                  ? t("uploading", "Uploading...")
                  : t("uploadZip", "Upload ZIP")}
              </button>
              {file && !loading && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-cancel"
                >
                  {t("cancel", "Cancel")}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CourseZipUploader;
