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
                        // For existing images from server, we need to construct the full URL
                        const imageUrl = program.Image.startsWith('http') 
                            ? program.Image 
                            : import.meta.env.VITE_API_URL + program.Image;
                        setImagePreview(imageUrl);
                    }

                    // Handle existing video
                    if (program.video) {
                        // For existing videos from server, we need to construct the full URL
                        const videoUrl = program.video.startsWith('http') 
                            ? program.video 
                            : import.meta.env.VITE_API_URL + program.video;
                        setVideoPreview(videoUrl);
                    }

                    // Handle tags
                    if (program.tags) {
                        let existingTags = [];
                        if (typeof program.tags === "string") {
                            existingTags = program.tags
                                .split(", ")
                                .filter((tag) => tag.trim());
                        } else if (Array.isArray(program.tags)) {
                            existingTags = program.tags.filter(
                                (tag) => tag && tag.trim()
                            );
                        }
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
        document.getElementById("Image-upload").value = "";
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
                        <div className="mt-8 border-t pt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
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
                                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Type de programme
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Sélectionnez le type qui correspond le mieux à votre programme
                                    </p>
                                </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    value: "scholarship",
                                    label: "Bourse d'études",
                                    description:
                                        "Aide financière pour les études",
                                    icon: "🎓",
                                    bgColor: "from-emerald-400 to-green-500",
                                    bgLight: "bg-emerald-50",
                                    borderColor: "border-emerald-200",
                                    borderActiveColor: "border-emerald-500",
                                    textColor: "text-emerald-600",
                                },
                                {
                                    value: "grant",
                                    label: "Subvention",
                                    description: "Financement de projet",
                                    icon: "�",
                                    bgColor: "from-blue-400 to-indigo-500",
                                    bgLight: "bg-blue-50",
                                    borderColor: "border-blue-200",
                                    borderActiveColor: "border-blue-500",
                                    textColor: "text-blue-600",
                                },
                                {
                                    value: "fellowship",
                                    label: "Fellowship",
                                    description: "Programme de recherche",
                                    icon: "🔬",
                                    bgColor: "from-purple-400 to-pink-500",
                                    bgLight: "bg-purple-50",
                                    borderColor: "border-purple-200",
                                    borderActiveColor: "border-purple-500",
                                    textColor: "text-purple-600",
                                },
                                {
                                    value: "internship",
                                    label: "Stage",
                                    description: "Expérience professionnelle",
                                    icon: "💼",
                                    bgColor: "from-orange-400 to-red-500",
                                    bgLight: "bg-orange-50",
                                    borderColor: "border-orange-200",
                                    borderActiveColor: "border-orange-500",
                                    textColor: "text-orange-600",
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
                                    value={formData.title_ar || ""}
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
                                    value={formData.short_description_ar || ""}
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
                                    value={formData.organization_ar || ""}
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
                                    value={formData.category_ar || ""}
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
                                value={formData.description_ar || ""}
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
                                        value={formData.Price || ""}
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
                                        value={formData.discountPrice || ""}
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
                                    value={formData.currency || "EUR"}
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
                                        value={formData.scholarshipAmount || ""}
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

                            {/* Payment Frequency Field */}
                            <div className="mt-6 group">
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
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    Fréquence de paiement
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                        Optionnel
                                    </span>
                                </label>
                                <select
                                    name="paymentFrequency"
                                    value={
                                        formData.paymentFrequency || "one-time"
                                    }
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white group-hover:border-emerald-400"
                                >
                                    <option value="one-time">
                                        🎯 Paiement unique
                                    </option>
                                    <option value="monthly">📅 Mensuel</option>
                                    <option value="quarterly">
                                        📊 Trimestriel
                                    </option>
                                    <option value="annually">🗓️ Annuel</option>
                                </select>
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
                                    Fréquence de versement de la bourse
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
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
                                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6M8 15h8M3 12h18"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Dates importantes
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Début des candidatures
                                </label>
                                <input
                                    type="date"
                                    name="applicationStartDate"
                                    value={formData.applicationStartDate || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date limite de candidature
                                </label>
                                <input
                                    type="date"
                                    name="applicationDeadline"
                                    value={formData.applicationDeadline || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Début du programme
                                </label>
                                <input
                                    type="date"
                                    name="programStartDate"
                                    value={formData.programStartDate || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fin du programme
                                </label>
                                <input
                                    type="date"
                                    name="programEndDate"
                                    value={formData.programEndDate || ""}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Capacity and Settings */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Capacité et paramètres
                                </h2>
                                <p className="text-gray-600">
                                    Définissez les places disponibles et les
                                    options du programme
                                </p>
                            </div>
                        </div>

                        {/* Capacity Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
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
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Places disponibles
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                                />
                                            </svg>
                                        </div>
                                        Total des places
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
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            name="totalSlots"
                                            value={formData.totalSlots || ""}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                                            placeholder="50"
                                            min="1"
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
                                        Nombre maximum de participants
                                    </p>
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
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        Places disponibles
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
                                                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6M8 15h8M3 12h18"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            name="availableSlots"
                                            value={
                                                formData.availableSlots || ""
                                            }
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 group-hover:border-green-300"
                                            placeholder="50"
                                            min="0"
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
                                        Places actuellement ouvertes aux
                                        candidatures
                                    </p>
                                </div>
                            </div>

                            {/* Capacity Visual Indicator */}
                            {formData.totalSlots && formData.availableSlots && (
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            Aperçu de la capacité
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {Math.round(
                                                (formData.availableSlots /
                                                    formData.totalSlots) *
                                                    100
                                            )}
                                            % disponible
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                                                style={{
                                                    width: `${
                                                        (formData.availableSlots /
                                                            formData.totalSlots) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs">
                                            <span className="text-blue-600 font-medium">
                                                {formData.availableSlots}{" "}
                                                disponibles
                                            </span>
                                            <span className="text-gray-600">
                                                {formData.totalSlots -
                                                    formData.availableSlots}{" "}
                                                occupées
                                            </span>
                                            <span className="text-gray-800 font-medium">
                                                {formData.totalSlots} total
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Settings Section */}
                        <div className="border-t pt-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
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
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Paramètres avancés
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Active Status */}
                                <div
                                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                        formData.isActive
                                            ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg transform scale-105"
                                            : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                                    }`}
                                    onClick={() =>
                                        handleInputChange({
                                            target: {
                                                name: "isActive",
                                                type: "checkbox",
                                                checked: !formData.isActive,
                                            },
                                        })
                                    }
                                >
                                    {/* Selection Indicator */}
                                    {formData.isActive && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
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
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="flex items-center gap-4">
                                            {/* Icon */}
                                            <div
                                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                                                    formData.isActive
                                                        ? "from-green-400 to-emerald-500 shadow-lg scale-110"
                                                        : "from-gray-300 to-gray-400 group-hover:from-green-400 group-hover:to-emerald-500"
                                                } flex items-center justify-center transition-all duration-300`}
                                            >
                                                <svg
                                                    className="w-7 h-7 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                                    Programme actif
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Visible et accessible au
                                                    public
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <div
                                                        className={`w-3 h-3 rounded-full ${
                                                            formData.isActive
                                                                ? "bg-green-500"
                                                                : "bg-gray-400"
                                                        }`}
                                                    ></div>
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            formData.isActive
                                                                ? "text-green-700"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {formData.isActive
                                                            ? "Activé"
                                                            : "Désactivé"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Effect Overlay */}
                                    <div
                                        className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                                            formData.isActive
                                                ? "opacity-0"
                                                : "opacity-0 group-hover:opacity-5 bg-green-600"
                                        }`}
                                    ></div>
                                </div>

                                {/* Featured Status */}
                                <div
                                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                        formData.isFeatured
                                            ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg transform scale-105"
                                            : "border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50"
                                    }`}
                                    onClick={() =>
                                        handleInputChange({
                                            target: {
                                                name: "isFeatured",
                                                type: "checkbox",
                                                checked: !formData.isFeatured,
                                            },
                                        })
                                    }
                                >
                                    {/* Selection Indicator */}
                                    {formData.isFeatured && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
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
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="flex items-center gap-4">
                                            {/* Icon */}
                                            <div
                                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                                                    formData.isFeatured
                                                        ? "from-yellow-400 to-orange-500 shadow-lg scale-110"
                                                        : "from-gray-300 to-gray-400 group-hover:from-yellow-400 group-hover:to-orange-500"
                                                } flex items-center justify-center transition-all duration-300`}
                                            >
                                                <svg
                                                    className="w-7 h-7 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.519 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                                    Programme mis en avant
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Affiché dans la section
                                                    featured
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
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
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Image du programme
                            </h2>
                        </div>

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
                                        PNG, JPG, GIF jusqu&apos;à 10MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Upload Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
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
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Vidéo de présentation
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {videoPreview ? (
                                <div className="relative">
                                    <VideoPlayer
                                        src={videoPreview}
                                    />
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
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                                    >
                                        Sélectionner une vidéo
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">
                                        MP4, AVI, MOV jusqu&apos;à 50MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location and Tags */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
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
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Localisation et informations complémentaires
                                </h2>
                                <p className="text-gray-600">
                                    Ajoutez des détails de localisation et des
                                    tags pour améliorer la recherche
                                </p>
                            </div>
                        </div>

                        {/* Location Fields */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
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
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Informations géographiques
                                </h3>
                            </div>

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
                                            value={formData.location || ""}
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
                                            value={formData.country || ""}
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
                                            value={
                                                formData.language || "French"
                                            }
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
                        </div>

                        {/* Tags Section */}
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
                                        Ajoutez des mots-clés pour améliorer la
                                        recherche
                                    </p>
                                </div>
                            </div>

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
                                                addSuggestedTag(suggestedTag)
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
