import { useState, useEffect } from "react";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    GlobeAltIcon,
    CheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../utils/apiClient";

const Contact_info = () => {
    const [contactInfo, setContactInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        type: "phone",
        label: "",
        value: "",
        description: "",
        isActive: true,
        isPrimary: false,
        displayOrder: 0,
        metadata: {},
    });

    const contactTypes = {
        phone: {
            label: "Phone",
            icon: PhoneIcon,
            color: "bg-blue-100 text-blue-600",
        },
        email: {
            label: "Email",
            icon: EnvelopeIcon,
            color: "bg-green-100 text-green-600",
        },
        address: {
            label: "Address",
            icon: MapPinIcon,
            color: "bg-red-100 text-red-600",
        },
        social: {
            label: "Social Media",
            icon: GlobeAltIcon,
            color: "bg-purple-100 text-purple-600",
        },
        website: {
            label: "Website",
            icon: GlobeAltIcon,
            color: "bg-indigo-100 text-indigo-600",
        },
    };

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/Admin/ContactInfo");
            if (response.data.contactInfo) {
                setContactInfo(response.data.contactInfo);
            }
        } catch (error) {
            console.error("Error fetching contact info:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await apiClient.put(
                    `/Admin/ContactInfo/${editingItem.id}`,
                    formData
                );
            } else {
                await apiClient.post("/Admin/ContactInfo", formData);
            }

            await fetchContactInfo();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving contact info:", error);
            alert("Error saving contact information. Please try again.");
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            type: item.type,
            label: item.label,
            value: item.value,
            description: item.description || "",
            isActive: item.isActive,
            isPrimary: item.isPrimary,
            displayOrder: item.displayOrder,
            metadata: item.metadata || {},
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (
            window.confirm(
                "Are you sure you want to delete this contact information?"
            )
        ) {
            try {
                await apiClient.delete(`/Admin/ContactInfo/${id}`);
                await fetchContactInfo();
            } catch (error) {
                console.error("Error deleting contact info:", error);
                alert("Error deleting contact information. Please try again.");
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            type: "phone",
            label: "",
            value: "",
            description: "",
            isActive: true,
            isPrimary: false,
            displayOrder: 0,
            metadata: {},
        });
    };

    const toggleStatus = async (item) => {
        try {
            await apiClient.put(`/Admin/ContactInfo/${item.id}`, {
                ...item,
                isActive: !item.isActive,
            });
            await fetchContactInfo();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleMetadataChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                [key]: value,
            },
        }));
    };

    // Group contact info by type
    const groupedContactInfo = contactInfo.reduce((acc, item) => {
        if (!acc[item.type]) {
            acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Contact Information
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Contact Info
                </button>
            </div>

            {/* Contact Info Groups */}
            <div className="space-y-6">
                {Object.keys(contactTypes).map((type) => {
                    const typeInfo = contactTypes[type];
                    const items = groupedContactInfo[type] || [];
                    const IconComponent = typeInfo.icon;

                    return (
                        <div
                            key={type}
                            className="bg-white rounded-lg shadow-sm border border-gray-200"
                        >
                            <div
                                className={`px-6 py-4 border-b border-gray-200 ${typeInfo.color} rounded-t-lg`}
                            >
                                <div className="flex items-center gap-3">
                                    <IconComponent className="h-6 w-6" />
                                    <h2 className="text-lg font-semibold">
                                        {typeInfo.label}
                                    </h2>
                                    <span className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm">
                                        {items.length} items
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {items.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No {typeInfo.label.toLowerCase()}{" "}
                                        information added yet.
                                    </p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-gray-900">
                                                            {item.label}
                                                        </h3>
                                                        {item.isPrimary && (
                                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    item
                                                                )
                                                            }
                                                            className={`p-1 rounded ${
                                                                item.isActive
                                                                    ? "text-green-600 hover:bg-green-50"
                                                                    : "text-red-600 hover:bg-red-50"
                                                            }`}
                                                            title={
                                                                item.isActive
                                                                    ? "Active"
                                                                    : "Inactive"
                                                            }
                                                        >
                                                            {item.isActive ? (
                                                                <CheckIcon className="h-4 w-4" />
                                                            ) : (
                                                                <XMarkIcon className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(item)
                                                            }
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.id
                                                                )
                                                            }
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-gray-700 font-mono text-sm break-all">
                                                    {item.value}
                                                </p>

                                                {item.description && (
                                                    <p className="text-gray-500 text-sm mt-2">
                                                        {item.description}
                                                    </p>
                                                )}

                                                {item.metadata &&
                                                    Object.keys(item.metadata)
                                                        .length > 0 && (
                                                        <div className="mt-2 text-xs text-gray-400">
                                                            {Object.entries(
                                                                item.metadata
                                                            ).map(
                                                                ([
                                                                    key,
                                                                    value,
                                                                ]) => (
                                                                    <span
                                                                        key={
                                                                            key
                                                                        }
                                                                        className="inline-block mr-2"
                                                                    >
                                                                        {key}:{" "}
                                                                        {value}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">
                                {editingItem
                                    ? "Edit Contact Information"
                                    : "Add Contact Information"}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {Object.entries(contactTypes).map(
                                        ([key, type]) => (
                                            <option key={key} value={key}>
                                                {type.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Label
                                </label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            label: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Main Office, Support Email, Facebook"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Value
                                </label>
                                <input
                                    type="text"
                                    value={formData.value}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            value: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Phone number, email, address, URL, etc."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                    placeholder="Additional notes or description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            displayOrder:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isActive: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Active
                                    </span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPrimary}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isPrimary: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Primary
                                    </span>
                                </label>
                            </div>

                            {/* Simple Metadata Section */}
                            {formData.type === "social" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Platform
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.metadata.platform || ""}
                                        onChange={(e) =>
                                            handleMetadataChange(
                                                "platform",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Facebook, Instagram, Twitter"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    {editingItem ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact_info;
