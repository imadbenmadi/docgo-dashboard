import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    GraduationCap,
    Upload,
    X,
    Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import programsAPI from "../../API/Programs";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";
import VideoPlayer from "../../components/Common/VideoPlayer";

const EditProgram = () => {
    const navigate = useNavigate();
    const { programId } = useParams();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
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
        paymentFrequency: "one-time",
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

    // Load program data
    useEffect(() => {
        const loadProgram = async () => {
            try {
                setInitialLoading(true);
                const response = await programsAPI.getProgramDetails(programId);

                if (response.success && response.program) {
                    const program = response.program;
                    setFormData({
                        title: program.title || "",
                        title_ar: program.title_ar || "",
                        short_description: program.short_description || "",
                        short_description_ar:
                            program.short_description_ar || "",
                        description: program.description || "",
                        description_ar: program.description_ar || "",
                        programType: program.programType || "scholarship",
                        category: program.category || "",
                        category_ar: program.category_ar || "",
                        organization: program.organization || "",
                        organization_ar: program.organization_ar || "",
                        Price: program.Price || "",
                        discountPrice: program.discountPrice || "",
                        scholarshipAmount: program.scholarshipAmount || "",
                        paymentFrequency:
                            program.paymentFrequency || "one-time",
                        currency: program.currency || "EUR",
                        status: program.status || "draft",
                        isActive:
                            program.isActive !== undefined
                                ? program.isActive
                                : true,
                        isFeatured: program.isFeatured || false,
                        applicationStartDate: program.applicationStartDate
                            ? new Date(program.applicationStartDate)
                                  .toISOString()
                                  .split("T")[0]
                            : "",
                        applicationDeadline: program.applicationDeadline
                            ? new Date(program.applicationDeadline)
                                  .toISOString()
                                  .split("T")[0]
                            : "",
                        programStartDate: program.programStartDate
                            ? new Date(program.programStartDate)
                                  .toISOString()
                                  .split("T")[0]
                            : "",
                        programEndDate: program.programEndDate
                            ? new Date(program.programEndDate)
                                  .toISOString()
                                  .split("T")[0]
                            : "",
                        totalSlots: program.totalSlots || "",
                        availableSlots: program.availableSlots || "",
                        contactPhone: program.contactPhone || "",
                        location: program.location || "",
                        country: program.country || "",
                        language: program.language || "French",
                        tags: program.tags || "",
                    });

                    // Handle existing image
                    if (program.Image) {
                        setImagePreview(program.Image);
                    }

                    // Handle existing video
                    if (program.video) {
                        setVideoPreview(program.video);
                    }

                    // Handle tags
                    if (program.tags) {
                        const existingTags = program.tags
                            .split(", ")
                            .filter((tag) => tag.trim());
                        setTags(existingTags);
                    }
                } else {
                    toast.error("Programme non trouvé");
                    navigate("/Programs");
                }
            } catch (error) {
                console.error("Error loading program:", error);
                toast.error("Erreur lors du chargement du programme");
                navigate("/Programs");
            } finally {
                setInitialLoading(false);
            }
        };

        if (programId) {
            loadProgram();
        }
    }, [programId, navigate]);

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
        if (!formData.title.trim()) {
            toast.error("Le titre du programme est requis");
            return false;
        }
        if (!formData.organization.trim()) {
            toast.error("L'organisation est requise");
            return false;
        }
        if (!formData.description.trim()) {
            toast.error("La description est requise");
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
            if (file.size > 100 * 1024 * 1024) {
                toast.error("La vidéo ne doit pas dépasser 100MB");
                return;
            }
            setVideoFile(file);
            const videoUrl = URL.createObjectURL(file);
            setVideoPreview(videoUrl);
        }
    };

    const removeVideo = (e) => {
        e.preventDefault();
        setVideoFile(null);
        setVideoPreview(null);
        document.getElementById("video-upload").value = "";
    };

    const removeCurrentVideo = async (e) => {
        e.preventDefault();
        try {
            await programsAPI.deleteProgramVideo(programId);
            setVideoPreview(null);
            toast.success("Vidéo supprimée avec succès");
        } catch (error) {
            console.error("Error deleting video:", error);
            toast.error("Erreur lors de la suppression de la vidéo");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("L'image ne doit pas dépasser 10MB");
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
        document.getElementById("image-upload").value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateFormWithToast()) {
            return;
        }

        setLoading(true);
        try {
            // Update program data
            const response = await programsAPI.updateProgram(
                programId,
                formData
            );

            if (response.success) {
                let hasImageError = false;
                let hasVideoError = false;

                // Upload Image if provided
                if (ImageFile && programId) {
                    try {
                        const ImageFormData = new FormData();
                        ImageFormData.append("Image", ImageFile);
                        await programsAPI.uploadProgramImage(
                            programId,
                            ImageFormData
                        );
                    } catch (ImageError) {
                        console.error("Error uploading Image:", ImageError);
                        hasImageError = true;
                    }
                }

                // Upload video if provided
                if (videoFile && programId) {
                    try {
                        const videoFormData = new FormData();
                        videoFormData.append("video", videoFile);
                        await programsAPI.uploadProgramVideo(
                            programId,
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
                        `Programme mis à jour (erreur upload ${errorDetails.join(
                            " et "
                        )})`,
                        {
                            duration: 4000,
                        }
                    );
                } else {
                    toast.success("Programme mis à jour avec succès !");
                }

                setTimeout(() => {
                    navigate("/Programs");
                }, 1500);
            } else {
                toast.error(
                    response.message || "Erreur lors de la mise à jour"
                );
            }
        } catch (error) {
            console.error("Error updating program:", error);
            toast.error("Erreur lors de la mise à jour du programme");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/Programs");
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <p className="text-gray-600">Chargement du programme...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Toaster position="top-right" />

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/Programs")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retour aux programmes
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Modifier le programme
                            </h1>
                            <p className="text-gray-600">
                                Mettez à jour les informations de votre
                                programme
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-8">
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Informations principales
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {/* Title Field */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                        />
                                    </svg>
                                    Titre du programme
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
                                    placeholder="Nom du programme"
                                    required
                                />
                            </div>

                            {/* Short Description Field */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-purple-800 mb-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h7"
                                        />
                                    </svg>
                                    Description courte
                                </label>
                                <input
                                    type="text"
                                    name="short_description"
                                    value={formData.short_description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-300"
                                    placeholder="Résumé en une ligne"
                                    maxLength={150}
                                />
                            </div>

                            {/* Organization Field */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-emerald-800 mb-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                    Organisation
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-emerald-300"
                                    placeholder="Nom de l'organisation"
                                    required
                                />
                            </div>

                            {/* Category Field */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        />
                                    </svg>
                                    Catégorie
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 hover:border-amber-300"
                                    placeholder="Sciences, Arts, Technologie..."
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-8">
                            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Description détaillée du programme
                                </label>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200 focus-within:border-gray-500 focus-within:ring-4 focus-within:ring-gray-100 transition-all duration-200">
                                    <RichTextEditor
                                        value={formData.description}
                                        onChange={(content) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: content,
                                            }))
                                        }
                                        placeholder="Décrivez votre programme de bourse en détail..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Program Type Selection */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
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
                                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Type de programme
                                </h2>
                                <p className="text-gray-600">
                                    Sélectionnez le type qui correspond le mieux
                                    à votre programme
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    value: "scholarship",
                                    label: "Bourse d'études",
                                    description:
                                        "Aide financière pour les études",
                                    icon: "🎓",
                                    bgColor: "from-blue-500 to-purple-600",
                                    bgLight: "bg-blue-50",
                                    borderColor: "border-blue-200",
                                    borderActiveColor: "border-blue-500",
                                    textColor: "text-blue-600",
                                },
                                {
                                    value: "internship",
                                    label: "Stage",
                                    description: "Expérience professionnelle",
                                    icon: "💼",
                                    bgColor: "from-green-500 to-emerald-600",
                                    bgLight: "bg-green-50",
                                    borderColor: "border-green-200",
                                    borderActiveColor: "border-green-500",
                                    textColor: "text-green-600",
                                },
                                {
                                    value: "fellowship",
                                    label: "Fellowship",
                                    description: "Programme de recherche",
                                    icon: "🔬",
                                    bgColor: "from-purple-500 to-pink-600",
                                    bgLight: "bg-purple-50",
                                    borderColor: "border-purple-200",
                                    borderActiveColor: "border-purple-500",
                                    textColor: "text-purple-600",
                                },
                            ].map((type) => (
                                <div
                                    key={type.value}
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            programType: type.value,
                                        }))
                                    }
                                    className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 group ${
                                        formData.programType === type.value
                                            ? `${type.borderActiveColor} ${type.bgLight} shadow-lg`
                                            : `${type.borderColor} hover:${type.borderActiveColor} hover:shadow-md`
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-3">
                                            {type.icon}
                                        </div>
                                        <h4
                                            className={`font-semibold transition-colors duration-200 ${
                                                formData.programType ===
                                                type.value
                                                    ? type.textColor
                                                    : "text-gray-700 group-hover:text-gray-900"
                                            }`}
                                        >
                                            {type.label}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {type.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Statut du programme
                                </h2>
                                <p className="text-gray-600">
                                    Définissez l&apos;état actuel de votre
                                    programme
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    value: "draft",
                                    label: "Brouillon",
                                    description: "En préparation",
                                    icon: "📝",
                                    bgColor: "from-gray-400 to-slate-500",
                                    bgLight: "bg-gray-50",
                                    borderColor: "border-gray-200",
                                    borderActiveColor: "border-gray-500",
                                    textColor: "text-gray-600",
                                },
                                {
                                    value: "open",
                                    label: "Ouvert",
                                    description: "Candidatures actives",
                                    icon: "✅",
                                    bgColor: "from-green-500 to-emerald-600",
                                    bgLight: "bg-green-50",
                                    borderColor: "border-green-200",
                                    borderActiveColor: "border-green-500",
                                    textColor: "text-green-600",
                                },
                                {
                                    value: "closed",
                                    label: "Fermé",
                                    description: "Candidatures fermées",
                                    icon: "🔒",
                                    bgColor: "from-red-500 to-pink-600",
                                    bgLight: "bg-red-50",
                                    borderColor: "border-red-200",
                                    borderActiveColor: "border-red-500",
                                    textColor: "text-red-600",
                                },
                            ].map((status) => (
                                <div
                                    key={status.value}
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: status.value,
                                        }))
                                    }
                                    className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 group ${
                                        formData.status === status.value
                                            ? `${status.borderActiveColor} ${status.bgLight} shadow-lg`
                                            : `${status.borderColor} hover:${status.borderActiveColor} hover:shadow-md`
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-3">
                                            {status.icon}
                                        </div>
                                        <h4
                                            className={`font-semibold transition-colors duration-200 ${
                                                formData.status === status.value
                                                    ? status.textColor
                                                    : "text-gray-700 group-hover:text-gray-900"
                                            }`}
                                        >
                                            {status.label}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {status.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Mettre à jour
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProgram;
