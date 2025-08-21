import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    Video,
    FileText,
    Brain,
    Type,
    Save,
    ArrowLeft,
    Upload,
} from "lucide-react";
import apiClient from "../../../utils/apiClient";
import { RichTextEditor } from "../../Common/RichTextEditor";
import PropTypes from "prop-types";

const CourseBuilder = ({ courseId = null }) => {
    const [course, setCourse] = useState({
        Title: "",
        Title_ar: "",
        Description: "",
        Description_ar: "",
        shortDescription: "",
        shortDescription_ar: "",
        Category: "",
        Category_ar: "",
        Level: "beginner",
        difficulty: "beginner",
        Price: 0,
        Currency: "DZD",
        Prerequisites: "",
        objectives: [],
        status: "draft",
        certificate: false,
        isFeatured: false,
    });

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);

    const categories = [
        "Programming",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Development",
        "IT & Software",
        "Personal Development",
        "Health & Fitness",
    ];

    // Load course data if editing
    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    const loadCourse = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(
                `/admin/CourseraStyleCourses/${courseId}`
            );
            if (response.data.success) {
                setCourse(response.data.data);
                setSections(response.data.data.sections || []);
            }
        } catch (error) {
            console.error("Error loading course:", error);
            setError("Failed to load course data");
        } finally {
            setLoading(false);
        }
    };

    const saveCourse = async () => {
        try {
            setSaving(true);
            setError(null);

            const courseData = {
                ...course,
                objectives: course.objectives.filter(
                    (obj) => obj.trim() !== ""
                ),
            };

            let response;
            if (courseId) {
                response = await apiClient.put(
                    `/admin/CourseraStyleCourses/${courseId}`,
                    courseData
                );
            } else {
                response = await apiClient.post(
                    "/admin/CourseraStyleCourses",
                    courseData
                );
            }

            if (response.data.success) {
                if (!courseId) {
                    // Redirect to edit mode for new course
                    window.location.href = `/admin/courses/${response.data.data.id}/edit`;
                } else {
                    alert("Course saved successfully!");
                }
            }
        } catch (error) {
            console.error("Error saving course:", error);
            setError("Failed to save course");
        } finally {
            setSaving(false);
        }
    };

    const addObjective = () => {
        setCourse((prev) => ({
            ...prev,
            objectives: [...prev.objectives, ""],
        }));
    };

    const updateObjective = (index, value) => {
        setCourse((prev) => ({
            ...prev,
            objectives: prev.objectives.map((obj, i) =>
                i === index ? value : obj
            ),
        }));
    };

    const removeObjective = (index) => {
        setCourse((prev) => ({
            ...prev,
            objectives: prev.objectives.filter((_, i) => i !== index),
        }));
    };

    // Section management
    const addSection = async () => {
        if (!courseId) {
            alert("Please save the course first before adding sections");
            return;
        }

        try {
            const sectionData = {
                title: "New Section",
                description: "",
            };

            const response = await apiClient.post(
                `/admin/CourseraStyleCourses/${courseId}/sections`,
                sectionData
            );
            if (response.data.success) {
                setSections((prev) => [...prev, response.data.data]);
                setExpandedSection(response.data.data.id);
            }
        } catch (error) {
            console.error("Error adding section:", error);
            alert("Failed to add section");
        }
    };

    const updateSection = async (sectionId, updateData) => {
        try {
            const response = await apiClient.put(
                `/admin/CourseraStyleCourses/sections/${sectionId}`,
                updateData
            );
            if (response.data.success) {
                setSections((prev) =>
                    prev.map((section) =>
                        section.id === sectionId ? response.data.data : section
                    )
                );
            }
        } catch (error) {
            console.error("Error updating section:", error);
            alert("Failed to update section");
        }
    };

    const deleteSection = async (sectionId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this section and all its items?"
            )
        ) {
            return;
        }

        try {
            await apiClient.delete(
                `/admin/CourseraStyleCourses/sections/${sectionId}`
            );
            setSections((prev) =>
                prev.filter((section) => section.id !== sectionId)
            );
        } catch (error) {
            console.error("Error deleting section:", error);
            alert("Failed to delete section");
        }
    };

    // Section Item management
    const addSectionItem = async (sectionId, itemType) => {
        try {
            const itemData = {
                title: `New ${
                    itemType.charAt(0).toUpperCase() + itemType.slice(1)
                }`,
                type: itemType,
                ...(itemType === "text" && {
                    textContent: "<p>Enter your content here...</p>",
                }),
                ...(itemType === "quiz" && {
                    quizData: {
                        questions: [
                            {
                                question: "Sample question?",
                                options: [
                                    "Option A",
                                    "Option B",
                                    "Option C",
                                    "Option D",
                                ],
                                correctAnswer: 0,
                                explanation:
                                    "Explanation for the correct answer",
                            },
                        ],
                    },
                }),
            };

            const response = await apiClient.post(
                `/admin/CourseraStyleCourses/sections/${sectionId}/items`,
                itemData
            );
            if (response.data.success) {
                // Reload sections to get updated items
                loadCourse();
            }
        } catch (error) {
            console.error("Error adding section item:", error);
            alert("Failed to add section item");
        }
    };

    const SectionComponent = ({ section }) => {
        const [editingTitle, setEditingTitle] = useState(false);
        const [sectionTitle, setSectionTitle] = useState(section.title);
        const [sectionDescription, setSectionDescription] = useState(
            section.description || ""
        );

        const handleTitleSave = () => {
            updateSection(section.id, {
                title: sectionTitle,
                description: sectionDescription,
            });
            setEditingTitle(false);
        };

        return (
            <div className="border border-gray-200 rounded-lg mb-4">
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                    <div className="flex items-center flex-1">
                        <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
                        {editingTitle ? (
                            <div className="flex-1 mr-4">
                                <input
                                    type="text"
                                    value={sectionTitle}
                                    onChange={(e) =>
                                        setSectionTitle(e.target.value)
                                    }
                                    className="w-full px-3 py-1 border border-gray-300 rounded-md"
                                    onBlur={handleTitleSave}
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && handleTitleSave()
                                    }
                                    autoFocus
                                />
                                <textarea
                                    value={sectionDescription}
                                    onChange={(e) =>
                                        setSectionDescription(e.target.value)
                                    }
                                    placeholder="Section description..."
                                    className="w-full px-3 py-1 border border-gray-300 rounded-md mt-1"
                                    rows="2"
                                    onBlur={handleTitleSave}
                                />
                            </div>
                        ) : (
                            <div
                                className="flex-1 cursor-pointer"
                                onClick={() => setEditingTitle(true)}
                            >
                                <h3 className="font-medium">{section.title}</h3>
                                {section.description && (
                                    <p className="text-sm text-gray-600">
                                        {section.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {section.items?.length || 0} items
                        </span>
                        <button
                            onClick={() =>
                                setExpandedSection(
                                    expandedSection === section.id
                                        ? null
                                        : section.id
                                )
                            }
                            className="text-blue-600 hover:text-blue-800"
                        >
                            {expandedSection === section.id
                                ? "Collapse"
                                : "Expand"}
                        </button>
                        <button
                            onClick={() => deleteSection(section.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {expandedSection === section.id && (
                    <div className="p-4">
                        {/* Section Items */}
                        <div className="space-y-2 mb-4">
                            {section.items?.map((item, index) => (
                                <SectionItemComponent
                                    key={item.id}
                                    item={item}
                                    index={index}
                                />
                            ))}
                        </div>

                        {/* Add Item Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() =>
                                    addSectionItem(section.id, "video")
                                }
                                className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                            >
                                <Video className="w-4 h-4 mr-1" />
                                Add Video
                            </button>
                            <button
                                onClick={() =>
                                    addSectionItem(section.id, "pdf")
                                }
                                className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                            >
                                <FileText className="w-4 h-4 mr-1" />
                                Add PDF
                            </button>
                            <button
                                onClick={() =>
                                    addSectionItem(section.id, "text")
                                }
                                className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                            >
                                <Type className="w-4 h-4 mr-1" />
                                Add Text
                            </button>
                            <button
                                onClick={() =>
                                    addSectionItem(section.id, "quiz")
                                }
                                className="flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                            >
                                <Brain className="w-4 h-4 mr-1" />
                                Add Quiz
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SectionItemComponent = ({ item, index }) => {
        const getItemIcon = () => {
            switch (item.type) {
                case "video":
                    return <Video className="w-4 h-4 text-red-500" />;
                case "pdf":
                    return <FileText className="w-4 h-4 text-blue-500" />;
                case "text":
                    return <Type className="w-4 h-4 text-green-500" />;
                case "quiz":
                    return <Brain className="w-4 h-4 text-purple-500" />;
                default:
                    return <FileText className="w-4 h-4 text-gray-500" />;
            }
        };

        return (
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-md">
                <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
                {getItemIcon()}
                <span className="ml-2 flex-1">{item.title}</span>
                <span className="text-xs text-gray-500 mr-2">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                <button
                    onClick={() =>
                        (window.location.href = `/admin/courses/items/${item.id}/edit`)
                    }
                    className="text-blue-600 hover:text-blue-800 mr-2"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={() => {
                        if (
                            window.confirm(
                                "Are you sure you want to delete this item?"
                            )
                        ) {
                            // Delete item API call would go here
                        }
                    }}
                    className="text-red-600 hover:text-red-800"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
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
                            {courseId ? "Edit Course" : "Create New Course"}
                        </h1>
                        <p className="text-gray-600">
                            Build your course structure with sections and
                            interactive content
                        </p>
                    </div>
                </div>
                <button
                    onClick={saveCourse}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Course"}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    value={course.Title}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            Title: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Title (Arabic)
                                </label>
                                <input
                                    type="text"
                                    value={course.Title_ar}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            Title_ar: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Description *
                            </label>
                            <RichTextEditor
                                value={course.Description}
                                onChange={(value) =>
                                    setCourse((prev) => ({
                                        ...prev,
                                        Description: value,
                                    }))
                                }
                                placeholder="Enter course description..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Short Description
                                </label>
                                <textarea
                                    value={course.shortDescription}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            shortDescription: e.target.value,
                                        }))
                                    }
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Short Description (Arabic)
                                </label>
                                <textarea
                                    value={course.shortDescription_ar}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            shortDescription_ar: e.target.value,
                                        }))
                                    }
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    value={course.Category}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            Category: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Difficulty Level
                                </label>
                                <select
                                    value={course.difficulty}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            difficulty: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">
                                        Intermediate
                                    </option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price ($)
                                </label>
                                <input
                                    type="number"
                                    value={course.Price}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            Price:
                                                parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">
                            Learning Objectives
                        </h2>

                        {course.objectives.map((objective, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 mb-2"
                            >
                                <input
                                    type="text"
                                    value={objective}
                                    onChange={(e) =>
                                        updateObjective(index, e.target.value)
                                    }
                                    placeholder="What will students learn?"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => removeObjective(index)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={addObjective}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Objective
                        </button>
                    </div>

                    {/* Prerequisites */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">
                            Prerequisites
                        </h2>
                        <RichTextEditor
                            value={course.Prerequisites}
                            onChange={(value) =>
                                setCourse((prev) => ({
                                    ...prev,
                                    Prerequisites: value,
                                }))
                            }
                            placeholder="What knowledge should students have before taking this course?"
                        />
                    </div>

                    {/* Course Structure - Only show if course exists */}
                    {courseId && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">
                                    Course Structure
                                </h2>
                                <button
                                    onClick={addSection}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Section
                                </button>
                            </div>

                            <div className="space-y-4">
                                {sections.map((section) => (
                                    <SectionComponent
                                        key={section.id}
                                        section={section}
                                    />
                                ))}

                                {sections.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <h3 className="text-lg font-medium mb-2">
                                            No sections yet
                                        </h3>
                                        <p>
                                            Add your first section to start
                                            building your course
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Course Settings */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">
                            Course Settings
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={course.status}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="certificate"
                                    checked={course.certificate}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            certificate: e.target.checked,
                                        }))
                                    }
                                    className="mr-2"
                                />
                                <label
                                    htmlFor="certificate"
                                    className="text-sm"
                                >
                                    Offer completion certificate
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={course.isFeatured}
                                    onChange={(e) =>
                                        setCourse((prev) => ({
                                            ...prev,
                                            isFeatured: e.target.checked,
                                        }))
                                    }
                                    className="mr-2"
                                />
                                <label htmlFor="featured" className="text-sm">
                                    Feature this course
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Course Media */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold mb-4">
                            Course Media
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Thumbnail
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload course thumbnail
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload cover Image
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Stats - Only show if course exists */}
                    {courseId && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-lg font-semibold mb-4">
                                Course Statistics
                            </h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Sections:
                                    </span>
                                    <span className="font-medium">
                                        {sections.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Total Items:
                                    </span>
                                    <span className="font-medium">
                                        {sections.reduce(
                                            (total, section) =>
                                                total +
                                                (section.items?.length || 0),
                                            0
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Students:
                                    </span>
                                    <span className="font-medium">
                                        {course.Users_count || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// PropTypes
CourseBuilder.propTypes = {
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default CourseBuilder;
