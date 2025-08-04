import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    GraduationCap,
    Upload,
    X,
    PlayCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import programsAPI from "../../API/Programs";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";

const AddProgram = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [ImageFile, setImageFile] = useState(null);
    const [ImagePreview, setImagePreview] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        title_ar: "",
        short_description: "",
        short_description_ar: "",
        description: "",
        description_ar: "",
        programType: "scholarship",
        category: "",
        category_ar: "",
        organization: "",
        organization_ar: "",
        Price: "",
        discountPrice: "",
        scholarshipAmount: "",
        currency: "EUR",
        status: "draft",
        isActive: true,
        isFeatured: false,
        applicationStartDate: "",
        applicationDeadline: "",
        programStartDate: "",
        programEndDate: "",
        totalSlots: "",
        availableSlots: "",
        eligibilityCriteria: "",
        applicationProcess: "",
        applicationLink: "",
        contactEmail: "",
        contactPhone: "",
        location: "",
        country: "",
        language: "French",
        tags: "",
    });

    // Tag management state
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);

    // Suggested tags
    const suggestedTags = [
        "sciences",
        "recherche",
        "doctorat",
        "master",
        "licence",
        "technologie",
        "médecine",
        "ingénierie",
        "arts",
        "littérature",
        "économie",
        "business",
        "international",
        "bourse complète",
        "stage",
        "fellowship",
    ];

    // Tag management functions
    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            const newTags = [...tags, tagInput.trim()];
            setTags(newTags);
            setFormData((prev) => ({
                ...prev,
                tags: newTags.join(", "),
            }));
            setTagInput("");
        }
    };

    const removeTag = (indexToRemove) => {
        const newTags = tags.filter((_, index) => index !== indexToRemove);
        setTags(newTags);
        setFormData((prev) => ({
            ...prev,
            tags: newTags.join(", "),
        }));
    };

    const addSuggestedTag = (suggestedTag) => {
        if (!tags.includes(suggestedTag)) {
            const newTags = [...tags, suggestedTag];
            setTags(newTags);
            setFormData((prev) => ({
                ...prev,
                tags: newTags.join(", "),
            }));
        }
    };

    const validateFormWithToast = () => {
        const errors = [];

        if (!formData.title.trim()) {
            errors.push("Le titre français est requis");
        }
        if (!formData.description.trim()) {
            errors.push("La description française est requise");
        }
        if (!formData.organization.trim()) {
            errors.push("L'organisation est requise");
        }
        if (formData.applicationDeadline && formData.applicationStartDate) {
            if (
                new Date(formData.applicationDeadline) <=
                new Date(formData.applicationStartDate)
            ) {
                errors.push(
                    "La date limite doit être après la date de début des candidatures"
                );
            }
        }
        if (formData.programEndDate && formData.programStartDate) {
            if (
                new Date(formData.programEndDate) <=
                new Date(formData.programStartDate)
            ) {
                errors.push(
                    "La date de fin doit être après la date de début du programme"
                );
            }
        }
        if (formData.totalSlots && formData.availableSlots) {
            if (
                parseInt(formData.availableSlots) >
                parseInt(formData.totalSlots)
            ) {
                errors.push(
                    "Les places disponibles ne peuvent pas dépasser le total des places"
                );
            }
        }
        if (
            formData.scholarshipAmount &&
            parseFloat(formData.scholarshipAmount) < 0
        ) {
            errors.push("Le montant de la bourse ne peut pas être négatif");
        }
        if (formData.Price && parseFloat(formData.Price) < 0) {
            errors.push("Le prix du programme ne peut pas être négatif");
        }
        if (formData.discountPrice && parseFloat(formData.discountPrice) < 0) {
            errors.push("Le prix réduit ne peut pas être négatif");
        }
        if (
            formData.Price &&
            formData.discountPrice &&
            parseFloat(formData.discountPrice) >= parseFloat(formData.Price)
        ) {
            errors.push("Le prix réduit doit être inférieur au prix normal");
        }

        if (errors.length > 0) {
            errors.forEach((error, index) => {
                setTimeout(() => {
                    toast.error(error, {
                        duration: 4000,
                        style: {
                            background: "#FEF2F2",
                            color: "#DC2626",
                            border: "1px solid #FECACA",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "500",
                        },
                        iconTheme: {
                            primary: "#DC2626",
                            secondary: "#FEF2F2",
                        },
                    });
                }, index * 200);
            });
            return false;
        }
        return true;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("video/")) {
                toast.error("Veuillez sélectionner un fichier vidéo valide");
                return;
            }

            // Validate file size (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                toast.error(
                    "La taille du fichier vidéo ne doit pas dépasser 100MB"
                );
                return;
            }

            setVideoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setVideoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeVideo = () => {
        setVideoFile(null);
        setVideoPreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                toast.error("L'Image ne doit pas dépasser 5MB", {
                    duration: 4000,
                    style: {
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                    },
                });
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateFormWithToast()) {
            return;
        }

        setLoading(true);

        try {
            // Prepare form data
            const programData = {
                ...formData,
                Price: formData.Price ? parseFloat(formData.Price) : null,
                discountPrice: formData.discountPrice
                    ? parseFloat(formData.discountPrice)
                    : null,
                scholarshipAmount: formData.scholarshipAmount
                    ? parseFloat(formData.scholarshipAmount)
                    : null,
                totalSlots: formData.totalSlots
                    ? parseInt(formData.totalSlots)
                    : null,
                availableSlots: formData.availableSlots
                    ? parseInt(formData.availableSlots)
                    : formData.totalSlots
                    ? parseInt(formData.totalSlots)
                    : null,
                tags: formData.tags
                    ? formData.tags
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag)
                    : [],
            };

            // Create program
            const response = await programsAPI.createProgram(programData);

            if (response.success) {
                let hasImageError = false;
                let hasVideoError = false;

                // Upload Image if provided
                if (ImageFile && response.program?.id) {
                    try {
                        const ImageFormData = new FormData();
                        ImageFormData.append("Image", ImageFile);
                        await programsAPI.uploadProgramImage(
                            response.program.id,
                            ImageFormData
                        );
                    } catch (ImageError) {
                        console.error("Error uploading Image:", ImageError);
                        hasImageError = true;
                    }
                }

                // Upload video if provided
                if (videoFile && response.program?.id) {
                    try {
                        const videoFormData = new FormData();
                        videoFormData.append("video", videoFile);
                        await programsAPI.uploadProgramVideo(
                            response.program.id,
                            videoFormData
                        );
                    } catch (videoError) {
                        console.error("Error uploading video:", videoError);
                        hasVideoError = true;
                    }
                }

                // Show appropriate success message
                if (hasImageError || hasVideoError) {
                    const errorDetails = [];
                    if (hasImageError) errorDetails.push("Image");
                    if (hasVideoError) errorDetails.push("vidéo");

                    toast.success(
                        `Programme créé (erreur upload ${errorDetails.join(
                            " et "
                        )})`,
                        {
                            duration: 3000,
                            style: {
                                background: "#FEF3C7",
                                color: "#D97706",
                                border: "1px solid #FDE68A",
                                borderRadius: "12px",
                            },
                        }
                    );
                } else {
                    const uploadedItems = [];
                    if (ImageFile) uploadedItems.push("Image");
                    if (videoFile) uploadedItems.push("vidéo");

                    const message =
                        uploadedItems.length > 0
                            ? `Programme créé avec ${uploadedItems.join(
                                  " et "
                              )}`
                            : "Programme créé avec succès";

                    toast.success(message, {
                        duration: 3000,
                        style: {
                            background: "#F0FDF4",
                            color: "#166534",
                            border: "1px solid #BBF7D0",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "500",
                        },
                        iconTheme: {
                            primary: "#166534",
                            secondary: "#F0FDF4",
                        },
                    });
                }

                // Navigate back to programs list
                setTimeout(() => {
                    navigate("/Programs");
                }, 1000);
            }
        } catch (error) {
            console.error("Error creating program:", error);
            toast.error(
                error.response?.data?.message ||
                    "Erreur lors de la création du programme",
                {
                    duration: 4000,
                    style: {
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: "500",
                    },
                }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        toast(
            (t) => (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                Annuler la création ?
                            </h3>
                            <p className="text-sm text-gray-600">
                                Toutes les données saisies seront perdues.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate("/Programs");
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                            Continuer
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                style: {
                    background: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                    maxWidth: "400px",
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={handleCancel}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Nouveau Programme
                        </h1>
                        <p className="text-gray-600">
                            Créez un nouveau programme de bourse
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Informations de base
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Titre du programme *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Nom du programme de bourse"
                                    required
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description courte
                                </label>
                                <input
                                    type="text"
                                    name="short_description"
                                    value={formData.short_description}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Résumé en une ligne"
                                    maxLength={150}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Organisation *
                                </label>
                                <input
                                    type="text"
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Nom de l'organisation"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type de programme
                                </label>
                                <select
                                    name="programType"
                                    value={formData.programType}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="scholarship">
                                        Bourse d&apos;études
                                    </option>
                                    <option value="grant">Subvention</option>
                                    <option value="fellowship">
                                        Fellowship
                                    </option>
                                    <option value="internship">Stage</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catégorie
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Sciences, Arts, Technologie..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Statut
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="draft">Brouillon</option>
                                    <option value="open">Ouvert</option>
                                    <option value="closed">Fermé</option>
                                    <option value="coming_soon">Bientôt</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description complète *
                            </label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(content) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: content,
                                    }))
                                }
                                placeholder="Description détaillée du programme avec formatage..."
                                height="300px"
                                required
                            />
                        </div>
                    </div>

                    {/* Arabic Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    AR
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                المعلومات باللغة العربية
                            </h2>
                            <span className="text-sm text-gray-500">
                                (اختياري)
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    العنوان
                                </label>
                                <input
                                    type="text"
                                    name="title_ar"
                                    value={formData.title_ar}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="عنوان البرنامج"
                                    dir="rtl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف المختصر
                                </label>
                                <input
                                    type="text"
                                    name="short_description_ar"
                                    value={formData.short_description_ar}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="ملخص في سطر واحد"
                                    maxLength={150}
                                    dir="rtl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المنظمة
                                </label>
                                <input
                                    type="text"
                                    name="organization_ar"
                                    value={formData.organization_ar}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="اسم المنظمة"
                                    dir="rtl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفئة
                                </label>
                                <input
                                    type="text"
                                    name="category_ar"
                                    value={formData.category_ar}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="مثال: العلوم والتكنولوجيا، الفنون..."
                                    dir="rtl"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف الكامل
                            </label>
                            <RichTextEditor
                                value={formData.description_ar}
                                onChange={(content) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description_ar: content,
                                    }))
                                }
                                placeholder="وصف مفصل للبرنامج مع التنسيق..."
                                height="300px"
                                direction="rtl"
                            />
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Informations financières
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                            />
                                        </svg>
                                    </div>
                                    Prix du programme
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">
                                            €
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        name="Price"
                                        value={formData.Price}
                                        onChange={handleInputChange}
                                        className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 group-hover:border-emerald-300"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Laissez vide pour un programme gratuit
                                </p>
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 text-orange-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                                            />
                                        </svg>
                                    </div>
                                    Prix réduit
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">
                                            €
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        value={formData.discountPrice}
                                        onChange={handleInputChange}
                                        className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 group-hover:border-emerald-300"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Prix avec réduction (optionnel)
                                </p>
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 text-purple-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                                            />
                                        </svg>
                                    </div>
                                    Devise
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 group-hover:border-emerald-300"
                                >
                                    <option value="EUR">🇪🇺 EUR (€)</option>
                                    <option value="USD">🇺🇸 USD ($)</option>
                                    <option value="DZD">🇩🇿 DZD (د.ج)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 text-emerald-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                            />
                                        </svg>
                                    </div>
                                    Montant de la bourse
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                        Bourse
                                    </span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-emerald-600 text-sm font-medium">
                                            €
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        name="scholarshipAmount"
                                        value={formData.scholarshipAmount}
                                        onChange={handleInputChange}
                                        className="w-full pl-8 pr-3 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white group-hover:border-emerald-400"
                                        placeholder="10000.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Montant de la bourse ou aide financière
                                    (optionnel)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Dates importantes
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Début des candidatures
                                </label>
                                <input
                                    type="date"
                                    name="applicationStartDate"
                                    value={formData.applicationStartDate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date limite de candidature
                                </label>
                                <input
                                    type="date"
                                    name="applicationDeadline"
                                    value={formData.applicationDeadline}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Début du programme
                                </label>
                                <input
                                    type="date"
                                    name="programStartDate"
                                    value={formData.programStartDate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fin du programme
                                </label>
                                <input
                                    type="date"
                                    name="programEndDate"
                                    value={formData.programEndDate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Capacity & Settings */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Capacité et paramètres
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total des places
                                </label>
                                <input
                                    type="number"
                                    name="totalSlots"
                                    value={formData.totalSlots}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="50"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Places disponibles
                                </label>
                                <input
                                    type="number"
                                    name="availableSlots"
                                    value={formData.availableSlots}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="50"
                                    min="0"
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="group relative flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleInputChange}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.isActive
                                                        ? "bg-green-500 border-green-500"
                                                        : "bg-white border-gray-300 group-hover:border-green-400"
                                                }`}
                                            >
                                                {formData.isActive && (
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    formData.isActive
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-800">
                                                    Programme actif
                                                </span>
                                                <p className="text-xs text-gray-500">
                                                    Le programme est visible et
                                                    accessible
                                                </p>
                                            </div>
                                        </div>
                                    </label>

                                    <label className="group relative flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="isFeatured"
                                                checked={formData.isFeatured}
                                                onChange={handleInputChange}
                                                className="sr-only"
                                            />
                                            <div
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                                    formData.isFeatured
                                                        ? "bg-yellow-500 border-yellow-500"
                                                        : "bg-white border-gray-300 group-hover:border-yellow-400"
                                                }`}
                                            >
                                                {formData.isFeatured && (
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    formData.isFeatured
                                                        ? "bg-yellow-100 text-yellow-600"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-800">
                                                    Programme vedette
                                                </span>
                                                <p className="text-xs text-gray-500">
                                                    Mis en avant sur la page
                                                    d&apos;accueil
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Image du programme
                        </h2>

                        <div className="space-y-4">
                            {ImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={ImagePreview}
                                        alt="Aperçu"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        Glissez une Image ici ou cliquez pour
                                        sélectionner
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="Image-upload"
                                    />
                                    <label
                                        htmlFor="Image-upload"
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                                    >
                                        Sélectionner une Image
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PNG, JPG jusqu&apos;à 5MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Upload */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Vidéo du programme
                        </h2>

                        <div className="space-y-4">
                            {videoPreview ? (
                                <div className="relative">
                                    <video
                                        src={videoPreview}
                                        controls
                                        className="w-full h-64 object-cover rounded-lg"
                                        style={{ maxHeight: "400px" }}
                                    >
                                        Votre navigateur ne supporte pas la
                                        lecture de vidéos.
                                    </video>
                                    <button
                                        type="button"
                                        onClick={removeVideo}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        Glissez une vidéo ici ou cliquez pour
                                        sélectionner
                                    </p>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                        id="video-upload"
                                    />
                                    <label
                                        htmlFor="video-upload"
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                                    >
                                        Sélectionner une vidéo
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">
                                        MP4, MOV, AVI jusqu&apos;à 100MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Informations complémentaires
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                        <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-red-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        </div>
                                        Localisation
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 group-hover:border-red-300"
                                            placeholder="Paris, France"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        Pays
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 group-hover:border-green-300"
                                            placeholder="France"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-purple-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                                                />
                                            </svg>
                                        </div>
                                        Langue
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                                                />
                                            </svg>
                                        </div>
                                        <select
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 group-hover:border-purple-300 appearance-none bg-white"
                                        >
                                            <option value="French">
                                                🇫🇷 Français
                                            </option>
                                            <option value="English">
                                                🇬🇧 English
                                            </option>
                                            <option value="Arabic">
                                                🇸🇦 العربية
                                            </option>
                                            <option value="Spanish">
                                                🇪🇸 Español
                                            </option>
                                            <option value="German">
                                                🇩🇪 Deutsch
                                            </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                        <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Tags du programme
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Ajoutez des mots-clés pour améliorer
                                            la recherche
                                        </p>
                                    </div>
                                </div>

                                {/* Enhanced Tag Input */}

                                {/* Tag Input */}
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) =>
                                            setTagInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                        className="w-full p-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Tapez un tag et appuyez sur Entrée..."
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* Tags Display */}
                                <div className="min-h-[80px] p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                    {tags.length === 0 ? (
                                        <div className="flex items-center justify-center h-12 text-gray-400">
                                            <svg
                                                className="w-5 h-5 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                />
                                            </svg>
                                            Aucun tag ajouté
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="group flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 py-2 rounded-full border border-purple-200 hover:shadow-md transition-all duration-200"
                                                >
                                                    <span className="text-sm font-medium">
                                                        {tag}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeTag(index)
                                                        }
                                                        className="w-4 h-4 bg-purple-200 text-purple-600 rounded-full flex items-center justify-center hover:bg-red-200 hover:text-red-600 transition-colors opacity-70 group-hover:opacity-100"
                                                    >
                                                        <svg
                                                            className="w-2.5 h-2.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="3"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Suggested Tags */}
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                            />
                                        </svg>
                                        Tags suggérés :
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedTags.map((suggestedTag) => (
                                            <button
                                                key={suggestedTag}
                                                type="button"
                                                onClick={() =>
                                                    addSuggestedTag(
                                                        suggestedTag
                                                    )
                                                }
                                                className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-600 rounded-full hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={tags.includes(
                                                    suggestedTag
                                                )}
                                            >
                                                + {suggestedTag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Création...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Créer le programme
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProgram;
