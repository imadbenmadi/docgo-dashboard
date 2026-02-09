import { useEffect, useMemo, useState } from "react";
import apiClient from "../utils/apiClient";
import defaultLogo from "../assets/logo.png";

const Contact_info = () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

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

    const logoPreviewUrl = useMemo(() => {
        if (!settings.logoUrl) return defaultLogo;
        const base = `${API_URL}${settings.logoUrl}`;
        if (!settings.logoUpdatedAt) return base;
        const v = new Date(settings.logoUpdatedAt).getTime();
        return `${base}?v=${v}`;
    }, [API_URL, settings.logoUrl, settings.logoUpdatedAt]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/Admin/SiteSettings");
            if (res.data?.settings) setSettings(res.data.settings);
        } catch (error) {
            console.error("Error fetching site settings:", error);
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
            contact: {
                ...prev.contact,
                [key]: value,
            },
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                brandName: settings.brandName,
                ...settings.contact,
            };
            const res = await apiClient.patch("/Admin/SiteSettings", payload);
            if (res.data?.settings) setSettings(res.data.settings);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;
        try {
            setUploading(true);
            const form = new FormData();
            form.append("logo", file);
            const res = await apiClient.post("/Admin/SiteSettings/logo", form);
            if (res.data?.settings) setSettings(res.data.settings);
        } catch (error) {
            console.error("Error uploading logo:", error);
            alert("Error uploading logo");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse h-6 w-64 bg-gray-200 rounded" />
                <div className="mt-6 animate-pulse h-48 w-full bg-gray-100 rounded" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Branding & Contact Settings
                </h1>
                <p className="text-gray-600">
                    Update the company brand name, logo, and single contact
                    fields.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Branding
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand Name
                            </label>
                            <input
                                value={settings.brandName || ""}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        brandName: e.target.value,
                                    }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="DocGo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Logo
                            </label>
                            <div className="flex items-center gap-4">
                                <img
                                    src={logoPreviewUrl}
                                    alt="Logo"
                                    className="w-16 h-16 rounded-full border object-cover"
                                />
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleLogoUpload(
                                                e.target.files?.[0],
                                            )
                                        }
                                        disabled={uploading}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {uploading
                                            ? "Uploading..."
                                            : "PNG/JPG/WEBP/GIF up to 5MB"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Contact (single fields)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                value={settings.contact.phone || ""}
                                onChange={(e) =>
                                    setContactField("phone", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                value={settings.contact.email || ""}
                                onChange={(e) =>
                                    setContactField("email", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                value={settings.contact.address || ""}
                                onChange={(e) =>
                                    setContactField("address", e.target.value)
                                }
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website
                            </label>
                            <input
                                value={settings.contact.website || ""}
                                onChange={(e) =>
                                    setContactField("website", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Social Links
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            ["facebook", "Facebook"],
                            ["instagram", "Instagram"],
                            ["linkedin", "LinkedIn"],
                            ["youtube", "YouTube"],
                            ["twitter", "Twitter"],
                            ["whatsapp", "WhatsApp"],
                            ["telegram", "Telegram"],
                        ].map(([key, label]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {label}
                                </label>
                                <input
                                    value={settings.contact[key] || ""}
                                    onChange={(e) =>
                                        setContactField(key, e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Contact_info;
