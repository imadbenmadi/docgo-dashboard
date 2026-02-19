import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
    Phone,
    Mail,
    MapPin,
    Globe,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Twitter,
    MessageCircle,
    Send,
    Upload,
    CheckCircle,
    Building2,
    Palette,
} from "lucide-react";
import apiClient from "../utils/apiClient";
import { useBranding } from "../context/BrandingContext";
import defaultLogo from "../assets/logo.png";

const fieldIcon = {
    phone: Phone,
    email: Mail,
    address: MapPin,
    website: Globe,
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    twitter: Twitter,
    whatsapp: MessageCircle,
    telegram: Send,
};

const Contact_info = () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const { refreshBranding } = useBranding();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const [settings, setSettings] = useState({
        brandName: "",
        logoUrl: null,
        logoUpdatedAt: null,
        contact: {
            phone: "",
            email: "",
            address: "",
            website: "",
            facebook: "",
            instagram: "",
            linkedin: "",
            youtube: "",
            twitter: "",
            whatsapp: "",
            telegram: "",
        },
    });

    const logoPreviewUrl = (() => {
        if (!settings.logoUrl) return defaultLogo;
        const base = `${API_URL}${settings.logoUrl}`;
        if (!settings.logoUpdatedAt) return base;
        const v = new Date(settings.logoUpdatedAt).getTime();
        return `${base}?v=${v}`;
    })();

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/Admin/SiteSettings");
            if (res.data?.settings) setSettings(res.data.settings);
        } catch {
            toast.error("Erreur lors du chargement des paramètres");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const setContactField = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            contact: { ...prev.contact, [key]: value },
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!settings.brandName?.trim()) {
            toast.error("Le nom de la plateforme est requis");
            return;
        }
        try {
            setSaving(true);
            const payload = {
                brandName: settings.brandName,
                ...settings.contact,
            };
            const res = await apiClient.patch("/Admin/SiteSettings", payload);
            if (res.data?.settings) {
                setSettings(res.data.settings);
                await refreshBranding();
                toast.success("Paramètres enregistrés avec succès");
            }
        } catch {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;
        const allowed = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif",
        ];
        if (!allowed.includes(file.type)) {
            toast.error("Format invalide. Utilisez PNG, JPG, WEBP ou GIF");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Le fichier ne doit pas dépasser 5 Mo");
            return;
        }
        try {
            setUploading(true);
            const form = new FormData();
            form.append("logo", file);
            const res = await apiClient.post("/Admin/SiteSettings/logo", form);
            if (res.data?.settings) {
                setSettings(res.data.settings);
                await refreshBranding();
                toast.success("Logo mis à jour avec succès");
            }
        } catch {
            toast.error("Erreur lors du téléchargement du logo");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleLogoUpload(file);
    };

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
                    >
                        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 bg-gray-100 rounded-lg" />
                            <div className="h-10 bg-gray-100 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow">
                        <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Paramètres de la plateforme
                        </h1>
                        <p className="text-sm text-gray-500">
                            Nom, logo et informations de contact
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* ── Branding Section ── */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h2 className="text-base font-semibold text-gray-800">
                            Identité visuelle
                        </h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Brand Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom de la plateforme{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={settings.brandName || ""}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        brandName: e.target.value,
                                    }))
                                }
                                placeholder="Ex: DocGo"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">
                                Affiché dans la barre de navigation et le pied
                                de page.
                            </p>
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logo
                            </label>
                            <div className="flex items-start gap-4">
                                {/* Current logo preview */}
                                <div className="relative shrink-0">
                                    <img
                                        src={logoPreviewUrl}
                                        alt="Logo actuel"
                                        className="w-20 h-20 rounded-xl border-2 border-gray-200 object-cover shadow-sm"
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Drop zone */}
                                <div
                                    className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                                        isDragOver
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                                    }`}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragOver(true);
                                    }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs font-medium text-gray-600">
                                        {uploading
                                            ? "Téléchargement..."
                                            : "Glisser ou cliquer"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        PNG · JPG · WEBP · GIF · max 5 Mo
                                    </p>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleLogoUpload(e.target.files?.[0])
                                    }
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Contact Section ── */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <h2 className="text-base font-semibold text-gray-800">
                            Coordonnées
                        </h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            {
                                key: "phone",
                                label: "Téléphone",
                                placeholder: "+213 xx xx xx xx",
                            },
                            {
                                key: "email",
                                label: "Email",
                                placeholder: "contact@exemple.com",
                            },
                            {
                                key: "website",
                                label: "Site web",
                                placeholder: "https://exemple.com",
                            },
                        ].map(({ key, label, placeholder }) => {
                            const Icon = fieldIcon[key];
                            return (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {label}
                                    </label>
                                    <div className="relative">
                                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            value={settings.contact[key] || ""}
                                            onChange={(e) =>
                                                setContactField(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={placeholder}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <textarea
                                    value={settings.contact.address || ""}
                                    onChange={(e) =>
                                        setContactField(
                                            "address",
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    placeholder="Adresse complète"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Social Links Section ── */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h2 className="text-base font-semibold text-gray-800">
                            Réseaux sociaux
                        </h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            {
                                key: "facebook",
                                label: "Facebook",
                                placeholder: "https://facebook.com/...",
                            },
                            {
                                key: "instagram",
                                label: "Instagram",
                                placeholder: "https://instagram.com/...",
                            },
                            {
                                key: "linkedin",
                                label: "LinkedIn",
                                placeholder: "https://linkedin.com/in/...",
                            },
                            {
                                key: "youtube",
                                label: "YouTube",
                                placeholder: "https://youtube.com/...",
                            },
                            {
                                key: "twitter",
                                label: "Twitter / X",
                                placeholder: "https://twitter.com/...",
                            },
                            {
                                key: "whatsapp",
                                label: "WhatsApp",
                                placeholder: "+213 xx xx xx xx",
                            },
                            {
                                key: "telegram",
                                label: "Telegram",
                                placeholder: "@username ou lien",
                            },
                        ].map(({ key, label, placeholder }) => {
                            const Icon = fieldIcon[key];
                            return (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {label}
                                    </label>
                                    <div className="relative">
                                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            value={settings.contact[key] || ""}
                                            onChange={(e) =>
                                                setContactField(
                                                    key,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={placeholder}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Save Button ── */}
                <div className="flex justify-end pb-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow transition-all active:scale-95"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Enregistrer les modifications
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Contact_info;
