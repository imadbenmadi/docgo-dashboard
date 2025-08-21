import { useState, useEffect } from "react";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CreditCardIcon,
    BanknotesIcon,
    CheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../utils/apiClient";

const PaymentInfo = () => {
    const [paymentConfig, setPaymentConfig] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        paymentMethod: "paypal",
        isActive: true,
        config: {},
    });

    const paymentTypes = {
        paypal: {
            label: "PayPal",
            icon: CreditCardIcon,
            color: "bg-blue-100 text-blue-600",
            fields: [
                { key: "clientId", label: "Client ID", type: "text" },
                {
                    key: "clientSecret",
                    label: "Client Secret",
                    type: "password",
                },
                {
                    key: "mode",
                    label: "Mode",
                    type: "select",
                    options: ["sandbox", "live"],
                },
                {
                    key: "merchantEmail",
                    label: "Merchant Email",
                    type: "email",
                },
            ],
        },
        ccp: {
            label: "CCP (Postal Account)",
            icon: BanknotesIcon,
            color: "bg-green-100 text-green-600",
            fields: [
                { key: "accountNumber", label: "Account Number", type: "text" },
                { key: "accountName", label: "Account Name", type: "text" },
                { key: "rib", label: "RIB Number", type: "text" },
                { key: "bankName", label: "Bank Name", type: "text" },
                {
                    key: "instructions",
                    label: "Payment Instructions",
                    type: "textarea",
                },
            ],
        },
    };

    useEffect(() => {
        fetchPaymentConfig();
    }, []);

    const fetchPaymentConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get("/Admin/PaymentConfig");
            setPaymentConfig(response.data.data || []);
        } catch (error) {
            console.error("Error fetching payment config:", error);
            setError("Failed to fetch payment configuration");
            setPaymentConfig([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingItem) {
                await apiClient.put(
                    `/Admin/PaymentConfig/${editingItem.id}`,
                    formData
                );
            } else {
                await apiClient.post("/Admin/PaymentConfig", formData);
            }
            await fetchPaymentConfig();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving payment config:", error);
            setError(
                error.response?.data?.message ||
                    "Error saving payment configuration. Please try again."
            );
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            paymentMethod: item.paymentMethod,
            isActive: item.isActive,
            config: item.config || {},
        });
        setShowModal(true);
        setError(null);
    };

    const handleDelete = async (id) => {
        if (
            window.confirm(
                "Are you sure you want to delete this payment configuration?"
            )
        ) {
            try {
                setError(null);
                await apiClient.delete(`/Admin/PaymentConfig/${id}`);
                await fetchPaymentConfig();
            } catch (error) {
                console.error("Error deleting payment config:", error);
                setError(
                    "Error deleting payment configuration. Please try again."
                );
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setError(null);
        setFormData({
            paymentMethod: "paypal",
            isActive: true,
            config: {},
        });
    };

    const toggleStatus = async (item) => {
        try {
            setError(null);
            await apiClient.put(`/Admin/PaymentConfig/${item.id}`, {
                ...item,
                isActive: !item.isActive,
            });
            await fetchPaymentConfig();
        } catch (error) {
            console.error("Error updating payment config:", error);
            setError("Error updating payment configuration status.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith("config.")) {
            const configKey = name.replace("config.", "");
            setFormData((prev) => ({
                ...prev,
                config: {
                    ...prev.config,
                    [configKey]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    // Group payment config by method
    const groupedPaymentConfig = paymentConfig.reduce((acc, item) => {
        if (!acc[item.paymentMethod]) {
            acc[item.paymentMethod] = [];
        }
        acc[item.paymentMethod].push(item);
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
                    Payment Configuration
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Payment Method
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Payment Methods Groups */}
            <div className="space-y-6">
                {Object.keys(paymentTypes).map((type) => {
                    const typeInfo = paymentTypes[type];
                    const items = groupedPaymentConfig[type] || [];
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
                                        {items.length} configuration
                                        {items.length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {items.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No {typeInfo.label.toLowerCase()}{" "}
                                        configuration added yet.
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
                                                            {typeInfo.label}{" "}
                                                            Config
                                                        </h3>
                                                        {item.isActive && (
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                                Active
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

                                                <div className="space-y-1 text-sm">
                                                    {typeInfo.fields
                                                        .slice(0, 2)
                                                        .map((field) => (
                                                            <div
                                                                key={field.key}
                                                            >
                                                                <span className="text-gray-600">
                                                                    {
                                                                        field.label
                                                                    }
                                                                    :
                                                                </span>
                                                                <span className="ml-2 text-gray-900 font-mono">
                                                                    {field.type ===
                                                                        "password" &&
                                                                    item.config[
                                                                        field
                                                                            .key
                                                                    ]
                                                                        ? "••••••••"
                                                                        : item
                                                                              .config[
                                                                              field
                                                                                  .key
                                                                          ] ||
                                                                          "Not configured"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>

                                                <div className="mt-3 text-xs text-gray-500">
                                                    Last updated:{" "}
                                                    {new Date(
                                                        item.updatedAt
                                                    ).toLocaleDateString()}
                                                </div>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingItem ? "Edit" : "Add"} Payment
                                Configuration
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Error in modal */}
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Payment Method Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={!!editingItem}
                                    >
                                        {Object.entries(paymentTypes).map(
                                            ([key, type]) => (
                                                <option key={key} value={key}>
                                                    {type.label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* Active Status */}
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Enable this payment method
                                        </span>
                                    </label>
                                </div>

                                {/* Configuration Fields */}
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                                        Configuration
                                    </h3>
                                    <div className="space-y-3">
                                        {paymentTypes[
                                            formData.paymentMethod
                                        ]?.fields.map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {field.label}
                                                </label>
                                                {field.type === "select" ? (
                                                    <select
                                                        name={`config.${field.key}`}
                                                        value={
                                                            formData.config[
                                                                field.key
                                                            ] || ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="">
                                                            Select {field.label}
                                                        </option>
                                                        {field.options?.map(
                                                            (option) => (
                                                                <option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                ) : field.type ===
                                                  "textarea" ? (
                                                    <textarea
                                                        name={`config.${field.key}`}
                                                        value={
                                                            formData.config[
                                                                field.key
                                                            ] || ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    />
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        name={`config.${field.key}`}
                                                        value={
                                                            formData.config[
                                                                field.key
                                                            ] || ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingItem ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentInfo;
