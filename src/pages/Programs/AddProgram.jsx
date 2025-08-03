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
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
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
                toast.error("L'image ne doit pas dépasser 5MB", {
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

                // Upload image if provided
                if (imageFile && response.program?.id) {
                    try {
                        const imageFormData = new FormData();
                        imageFormData.append("image", imageFile);
                        await programsAPI.uploadProgramImage(
                            response.program.id,
                            imageFormData
                        );
                    } catch (imageError) {
                        console.error("Error uploading image:", imageError);
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
                    if (hasImageError) errorDetails.push("image");
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
                    if (imageFile) uploadedItems.push("image");
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
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Informations financières
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prix du programme
                                </label>
                                <input
                                    type="number"
                                    name="Price"
                                    value={formData.Price}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Laissez vide pour un programme gratuit
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prix réduit
                                </label>
                                <input
                                    type="number"
                                    name="discountPrice"
                                    value={formData.discountPrice}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Prix avec réduction (optionnel)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Devise
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="EUR">EUR (€)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD ($)</option>
                                    <option value="AUD">AUD ($)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Montant de la bourse
                                </label>
                                <input
                                    type="number"
                                    name="scholarshipAmount"
                                    value={formData.scholarshipAmount}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="10000"
                                    min="0"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
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
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            Programme actif
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={formData.isFeatured}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            Programme vedette
                                        </span>
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
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
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
                                        Glissez une image ici ou cliquez pour
                                        sélectionner
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                                    >
                                        Sélectionner une image
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
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Informations complémentaires
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Critères d&apos;éligibilité
                                </label>
                                <textarea
                                    name="eligibilityCriteria"
                                    value={formData.eligibilityCriteria}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Conditions requises pour candidater..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Processus de candidature
                                </label>
                                <textarea
                                    name="applicationProcess"
                                    value={formData.applicationProcess}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Étapes pour candidater..."
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lien de candidature
                                    </label>
                                    <input
                                        type="url"
                                        name="applicationLink"
                                        value={formData.applicationLink}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email de contact
                                    </label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="contact@organisation.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Localisation
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Paris, France"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pays
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="France"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (séparés par des virgules)
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="sciences, recherche, doctorat"
                                />
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
