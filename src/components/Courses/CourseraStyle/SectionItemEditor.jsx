import { useState, useEffect } from "react";
import {
    Save,
    ArrowLeft,
    Upload,
    Video,
    FileText,
    Type,
    Brain,
    Plus,
    Trash2,
    Eye,
} from "lucide-react";
import  apiClient  from "../../../utils/apiClient";
import { RichTextEditor } from "../../Common/RichTextEditor";
import PropTypes from "prop-types";

const SectionItemEditor = ({ itemId, sectionId }) => {
    const [item, setItem] = useState({
        title: "",
        title_ar: "",
        description: "",
        description_ar: "",
        type: "text",
        textContent: "",
        textContent_ar: "",
        videoUrl: "",
        videoDuration: 0,
        pdfUrl: "",
        quizData: {
            questions: [],
        },
        quizPassingScore: 80,
        maxAttempts: 3,
        estimatedDuration: 0,
        isRequired: true,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    const itemTypes = [
        { value: "video", label: "Video", icon: Video, color: "text-red-500" },
        {
            value: "pdf",
            label: "PDF Reading",
            icon: FileText,
            color: "text-blue-500",
        },
        {
            value: "text",
            label: "Text Content",
            icon: Type,
            color: "text-green-500",
        },
        { value: "quiz", label: "Quiz", icon: Brain, color: "text-purple-500" },
    ];

    useEffect(() => {
        if (itemId) {
            loadItem();
        } else if (sectionId) {
            // Creating new item
            setItem((prev) => ({ ...prev, SectionId: sectionId }));
        }
    }, [itemId, sectionId]);

    const loadItem = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(
                `/admin/CourseraStyleCourses/items/${itemId}`
            );
            if (response.data.success) {
                setItem(response.data.data);
            }
        } catch (error) {
            console.error("Error loading item:", error);
            setError("Failed to load item data");
        } finally {
            setLoading(false);
        }
    };

    const saveItem = async () => {
        try {
            setSaving(true);
            setError(null);

            let response;
            if (itemId) {
                response = await apiClient.put(
                    `/admin/CourseraStyleCourses/items/${itemId}`,
                    item
                );
            } else {
                response = await apiClient.post(
                    `/admin/CourseraStyleCourses/sections/${sectionId}/items`,
                    item
                );
            }

            if (response.data.success) {
                if (!itemId) {
                    // Redirect to edit mode for new item
                    window.location.href = `/admin/courses/items/${response.data.data.id}/edit`;
                } else {
                    alert("Item saved successfully!");
                }
            }
        } catch (error) {
            console.error("Error saving item:", error);
            setError("Failed to save item");
        } finally {
            setSaving(false);
        }
    };

    const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploadingVideo(true);
            const formData = new FormData();
            formData.append("video", file);
            formData.append("title", item.title || "Uploaded Video");
            formData.append("description", item.description || "");

            const response = await apiClient.post(
                `/admin/CourseraStyleCourses/sections/${sectionId}/items/video`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                setItem((prev) => ({
                    ...prev,
                    videoUrl: response.data.data.videoUrl,
                    type: "video",
                }));
            }
        } catch (error) {
            console.error("Error uploading video:", error);
            setError("Failed to upload video");
        } finally {
            setUploadingVideo(false);
        }
    };

    const handlePdfUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploadingPdf(true);
            const formData = new FormData();
            formData.append("pdf", file);
            formData.append("title", item.title || "Uploaded PDF");
            formData.append("description", item.description || "");

            const response = await apiClient.post(
                `/admin/CourseraStyleCourses/sections/${sectionId}/items/pdf`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                setItem((prev) => ({
                    ...prev,
                    pdfUrl: response.data.data.pdfUrl,
                    type: "pdf",
                }));
            }
        } catch (error) {
            console.error("Error uploading PDF:", error);
            setError("Failed to upload PDF");
        } finally {
            setUploadingPdf(false);
        }
    };

    // Quiz management functions
    const addQuestion = () => {
        setItem((prev) => ({
            ...prev,
            quizData: {
                ...prev.quizData,
                questions: [
                    ...prev.quizData.questions,
                    {
                        question: "",
                        options: ["", "", "", ""],
                        correctAnswer: 0,
                        explanation: "",
                    },
                ],
            },
        }));
    };

    const updateQuestion = (questionIndex, field, value) => {
        setItem((prev) => {
            const newQuestions = [...prev.quizData.questions];
            newQuestions[questionIndex] = {
                ...newQuestions[questionIndex],
                [field]: value,
            };
            return {
                ...prev,
                quizData: {
                    ...prev.quizData,
                    questions: newQuestions,
                },
            };
        });
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        setItem((prev) => {
            const newQuestions = [...prev.quizData.questions];
            const newOptions = [...newQuestions[questionIndex].options];
            newOptions[optionIndex] = value;
            newQuestions[questionIndex] = {
                ...newQuestions[questionIndex],
                options: newOptions,
            };
            return {
                ...prev,
                quizData: {
                    ...prev.quizData,
                    questions: newQuestions,
                },
            };
        });
    };

    const removeQuestion = (questionIndex) => {
        setItem((prev) => ({
            ...prev,
            quizData: {
                ...prev.quizData,
                questions: prev.quizData.questions.filter(
                    (_, index) => index !== questionIndex
                ),
            },
        }));
    };

    const renderTypeSpecificContent = () => {
        switch (item.type) {
            case "video":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Video File
                            </label>
                            {item.videoUrl ? (
                                <div className="space-y-2">
                                    <video
                                        controls
                                        className="w-full max-w-lg rounded-lg"
                                        src={item.videoUrl}
                                    >
                                        Your browser does not support the video
                                        tag.
                                    </video>
                                    <p className="text-sm text-gray-600">
                                        Current video: {item.videoUrl}
                                    </p>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        disabled={uploadingVideo}
                                        className="sr-only"
                                        id="video-upload"
                                    />
                                    <label
                                        htmlFor="video-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">
                                            {uploadingVideo
                                                ? "Uploading..."
                                                : "Click to upload video"}
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (seconds)
                            </label>
                            <input
                                type="number"
                                value={item.videoDuration}
                                onChange={(e) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        videoDuration:
                                            parseInt(e.target.value) || 0,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                );

            case "pdf":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PDF File
                            </label>
                            {item.pdfUrl ? (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm text-gray-600">
                                            Current PDF: {item.pdfUrl}
                                        </span>
                                        <button
                                            onClick={() =>
                                                window.open(
                                                    item.pdfUrl,
                                                    "_blank"
                                                )
                                            }
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handlePdfUpload}
                                        disabled={uploadingPdf}
                                        className="sr-only"
                                        id="pdf-upload"
                                    />
                                    <label
                                        htmlFor="pdf-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">
                                            {uploadingPdf
                                                ? "Uploading..."
                                                : "Click to upload PDF"}
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "text":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content (English)
                            </label>
                            <RichTextEditor
                                value={item.textContent}
                                onChange={(value) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        textContent: value,
                                    }))
                                }
                                placeholder="Enter your content here..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content (Arabic)
                            </label>
                            <RichTextEditor
                                value={item.textContent_ar}
                                onChange={(value) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        textContent_ar: value,
                                    }))
                                }
                                placeholder="أدخل المحتوى هنا..."
                            />
                        </div>
                    </div>
                );

            case "quiz":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Passing Score (%)
                                </label>
                                <input
                                    type="number"
                                    value={item.quizPassingScore}
                                    onChange={(e) =>
                                        setItem((prev) => ({
                                            ...prev,
                                            quizPassingScore:
                                                parseInt(e.target.value) || 80,
                                        }))
                                    }
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Attempts
                                </label>
                                <input
                                    type="number"
                                    value={item.maxAttempts}
                                    onChange={(e) =>
                                        setItem((prev) => ({
                                            ...prev,
                                            maxAttempts:
                                                parseInt(e.target.value) || 3,
                                        }))
                                    }
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">
                                    Quiz Questions
                                </h3>
                                <button
                                    onClick={addQuestion}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Question
                                </button>
                            </div>

                            <div className="space-y-6">
                                {item.quizData.questions.map(
                                    (question, questionIndex) => (
                                        <div
                                            key={questionIndex}
                                            className="bg-gray-50 p-4 rounded-lg"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-medium">
                                                    Question {questionIndex + 1}
                                                </h4>
                                                <button
                                                    onClick={() =>
                                                        removeQuestion(
                                                            questionIndex
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Question
                                                    </label>
                                                    <textarea
                                                        value={
                                                            question.question
                                                        }
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                questionIndex,
                                                                "question",
                                                                e.target.value
                                                            )
                                                        }
                                                        rows="2"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter your question..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Answer Options
                                                    </label>
                                                    <div className="space-y-2">
                                                        {question.options.map(
                                                            (
                                                                option,
                                                                optionIndex
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        optionIndex
                                                                    }
                                                                    className="flex items-center space-x-2"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct-${questionIndex}`}
                                                                        checked={
                                                                            question.correctAnswer ===
                                                                            optionIndex
                                                                        }
                                                                        onChange={() =>
                                                                            updateQuestion(
                                                                                questionIndex,
                                                                                "correctAnswer",
                                                                                optionIndex
                                                                            )
                                                                        }
                                                                        className="text-blue-600"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            option
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateOption(
                                                                                questionIndex,
                                                                                optionIndex,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                        placeholder={`Option ${String.fromCharCode(
                                                                            65 +
                                                                                optionIndex
                                                                        )}`}
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Explanation (Optional)
                                                    </label>
                                                    <textarea
                                                        value={
                                                            question.explanation
                                                        }
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                questionIndex,
                                                                "explanation",
                                                                e.target.value
                                                            )
                                                        }
                                                        rows="2"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Explain why this is the correct answer..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}

                                {item.quizData.questions.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">
                                            No questions yet
                                        </h3>
                                        <p>
                                            Add your first question to start
                                            building the quiz
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => window.history.back()}
                        className="mr-4 p-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {itemId
                                ? "Edit Section Item"
                                : "Create Section Item"}
                        </h1>
                        <p className="text-gray-600">
                            {itemTypes.find((t) => t.value === item.type)
                                ?.label || "Section Item"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={saveItem}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Item"}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                {/* Basic Information */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title (Arabic)
                            </label>
                            <input
                                type="text"
                                value={item.title_ar}
                                onChange={(e) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        title_ar: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Item Type *
                            </label>
                            <select
                                value={item.type}
                                onChange={(e) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        type: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {itemTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={item.estimatedDuration}
                                onChange={(e) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        estimatedDuration:
                                            parseInt(e.target.value) || 0,
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={item.description}
                                onChange={(e) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Arabic)
                            </label>
                            <textarea
                                value={item.description_ar}
                                onChange={(e) =>
                                    setItem((prev) => ({
                                        ...prev,
                                        description_ar: e.target.value,
                                    }))
                                }
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center mt-4">
                        <input
                            type="checkbox"
                            id="required"
                            checked={item.isRequired}
                            onChange={(e) =>
                                setItem((prev) => ({
                                    ...prev,
                                    isRequired: e.target.checked,
                                }))
                            }
                            className="mr-2"
                        />
                        <label htmlFor="required" className="text-sm">
                            This item is required for course completion
                        </label>
                    </div>
                </div>

                {/* Type-specific Content */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Content</h2>
                    {renderTypeSpecificContent()}
                </div>
            </div>
        </div>
    );
};

SectionItemEditor.propTypes = {
    itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SectionItemEditor;
