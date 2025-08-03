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
                        scholarshipAmount: program.scholarshipAmount || "",
                        currency: program.currency || "EUR",
                        status: program.status || "draft",
                        isActive: program.isActive ?? true,
                        isFeatured: program.isFeatured ?? false,
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
                        eligibilityCriteria: program.eligibilityCriteria || "",
                        applicationProcess: program.applicationProcess || "",
                        applicationLink: program.applicationLink || "",
                        contactEmail: program.contactEmail || "",
                        contactPhone: program.contactPhone || "",
                        location: program.location || "",
                        country: program.country || "",
                        language: program.language || "French",
                        tags: Array.isArray(program.tags)
                            ? program.tags.join(", ")
                            : program.tags || "",
                    });

                    // Set existing Images and videos
                    if (program.Image) {
                        setImagePreview(program.Image);
                    }
                    if (program.videoUrl) {
                        setVideoPreview(program.videoUrl);
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
        if (formData.applicationStartDate && formData.applicationDeadline) {
            if (
                new Date(formData.applicationStartDate) >=
                new Date(formData.applicationDeadline)
            ) {
                errors.push(
                    "La date de début doit être antérieure à la date limite"
                );
            }
        }
        if (formData.programStartDate && formData.programEndDate) {
            if (
                new Date(formData.programStartDate) >=
                new Date(formData.programEndDate)
            ) {
                errors.push(
                    "La date de début du programme doit être antérieure à la date de fin"
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
            if (!file.type.startsWith("video/")) {
                toast.error("Veuillez sélectionner un fichier vidéo valide");
                return;
            }

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

    const removeVideo = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVideoFile(null);
        setVideoPreview(null);
    };

    const removeCurrentVideo = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            // Show confirmation
            const confirmed = window.confirm(
                "Êtes-vous sûr de vouloir supprimer la vidéo actuelle ?"
            );

            if (!confirmed) return;

            setLoading(true);

            // Call API to remove video from database
            const response = await programsAPI.removeVideo(programId);

            if (response.success) {
                setVideoPreview(null);
                setVideoFile(null);
                toast.success("Vidéo supprimée avec succès");
            } else {
                toast.error("Erreur lors de la suppression de la vidéo");
            }
        } catch (error) {
            console.error("Error removing video:", error);
            toast.error("Erreur lors de la suppression de la vidéo");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'Image ne doit pas dépasser 5MB");
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Extra safety: ensure this is a real form submission
        if (e.target.tagName !== "FORM") {
            return;
        }

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

            // Update program
            const response = await programsAPI.updateProgram(
                programId,
                programData
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
                            ? `Programme mis à jour avec ${uploadedItems.join(
                                  " et "
                              )}`
                            : "Programme mis à jour avec succès";

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
                    navigate(`/Programs/${programId}`);
                }, 1000);
            }
        } catch (error) {
            console.error("Error updating program:", error);
            toast.error("Erreur lors de la mise à jour du programme", {
                duration: 4000,
                style: {
                    background: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                    borderRadius: "12px",
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        toast(
            (t) => (
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Annuler les modifications ?
                        </h3>
                        <p className="text-sm text-gray-600">
                            Toutes les modifications seront perdues.
                        </p>
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

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Chargement du programme...
                    </h2>
                    <p className="text-gray-600">
                        Récupération des informations en cours
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Retour</span>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Modifier le programme
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Mettez à jour les informations du programme
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    FR
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Informations principales
                            </h2>
                        </div>

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
                                    placeholder="Nom du programme"
                                    required
                                />
                            </div>

                            <div>
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
                                    <option value="internship">Stage</option>
                                    <option value="fellowship">
                                        Fellowship
                                    </option>
                                    <option value="training">Formation</option>
                                    <option value="competition">
                                        Concours
                                    </option>
                                    <option value="exchange">Échange</option>
                                    <option value="other">Autre</option>
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
                                    placeholder="ex: STEM, Arts, Business..."
                                />
                            </div>

                            <div className="lg:col-span-2">
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
                                    <option value="ongoing">En cours</option>
                                    <option value="completed">Terminé</option>
                                    <option value="cancelled">Annulé</option>
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
                                    <option value="CAD">CAD (C$)</option>
                                    <option value="DZD">DZD (د.ج)</option>
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
                                    placeholder="0"
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

                    {/* Capacity */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Capacité
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre total de places
                                </label>
                                <input
                                    type="number"
                                    name="totalSlots"
                                    value={formData.totalSlots}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="0"
                                    min="0"
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
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Paramètres
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-800">
                                        Programme actif
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Visible sur la plateforme
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-800">
                                        Programme vedette
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Mis en avant sur la page d&apos;accueil
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
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
                                        src={
                                            import.meta.env.VITE_API_URL +
                                                ImagePreview || ImagePreview
                                        }
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
                                        accept="Image/*"
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
                                    {videoFile ? (
                                        // New uploaded video preview
                                        <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            <video
                                                src={videoPreview}
                                                controls
                                                className="w-full h-64 object-cover rounded-lg"
                                                style={{ maxHeight: "400px" }}
                                                onPlay={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onPause={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                Votre navigateur ne supporte pas
                                                la lecture de vidéos.
                                            </video>
                                        </div>
                                    ) : (
                                        // Current database video
                                        <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            <VideoPlayer
                                                src={
                                                    import.meta.env
                                                        .VITE_API_URL +
                                                        videoPreview ||
                                                    videoPreview
                                                }
                                                className="w-full"
                                                height="400px"
                                                title="Vidéo du programme"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Delete button */}
                                    <button
                                        type="button"
                                        onClick={
                                            videoFile
                                                ? removeVideo
                                                : removeCurrentVideo
                                        }
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                                        title={
                                            videoFile
                                                ? "Supprimer la nouvelle vidéo"
                                                : "Supprimer la vidéo actuelle"
                                        }
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
                                    placeholder="Étapes pour postuler..."
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
                                        placeholder="contact@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="+33 1 23 45 67 89"
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Langue
                                    </label>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="French">Français</option>
                                        <option value="English">English</option>
                                        <option value="Arabic">العربية</option>
                                        <option value="Spanish">Español</option>
                                        <option value="German">Deutsch</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mots-clés
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="bourse, étudiant, recherche (séparés par des virgules)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Séparez les mots-clés par des virgules
                                </p>
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
