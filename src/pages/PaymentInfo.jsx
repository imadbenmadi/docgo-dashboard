import { useState, useEffect } from "react";
import {
    PencilIcon,
    BanknotesIcon,
    CheckIcon,
    XMarkIcon,
    EyeIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import PaymentConfigAPI from "../API/PaymentConfig";
import RichTextEditor from "../components/Common/RichTextEditor/RichTextEditor";

const PaymentInfo = () => {
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [viewMode, setViewMode] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        // CCP fields
        ccp_account_number: "",
        ccp_account_name: "",
        ccp_rib: "",
        ccp_bank_name: "",
        ccp_instructions: "",
        is_ccp_enabled: false,

        // General settings
        default_currency: "DZD",
        supported_currencies: ["DZD"],
        payment_description_template: "",
        success_redirect_url: "",
        cancel_redirect_url: "",
    });

    const paymentMethods = {
        ccp: {
            label: "CCP (Postal Account)",
            icon: BanknotesIcon,
            color: "bg-green-500",
            description: "Algeria postal account transfer payments",
        },
    };

    useEffect(() => {
        fetchPaymentConfig();
    }, []);

    const fetchPaymentConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await PaymentConfigAPI.getPaymentConfigs();

            if (response.success && response.data.length > 0) {
                // Get the first (and typically only) config
                const config = response.data[0];

                setPaymentConfig(config);

                // Populate form data with the config
                setFormData({
                    // CCP data
                    ccp_account_number: config.ccp_account_number || "",
                    ccp_account_name: config.ccp_account_name || "",
                    ccp_rib: config.ccp_rib || "",
                    ccp_bank_name: config.ccp_bank_name || "",
                    ccp_instructions: config.ccp_instructions || "",
                    is_ccp_enabled: config.is_ccp_enabled || false,

                    // General settings
                    default_currency: "DZD",
                    supported_currencies: ["DZD"],
                    payment_description_template:
                        config.payment_description_template || "",
                    success_redirect_url: config.success_redirect_url || "",
                    cancel_redirect_url: config.cancel_redirect_url || "",
                });
            } else {
                setPaymentConfig(null);
            }
        } catch (error) {
            console.error("Error fetching payment config:", error);
            setError("Failed to fetch payment configuration");
            setPaymentConfig(null);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (method) => {
        setEditingMethod(method);
        setViewMode(false);
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };

    const handleView = (method) => {
        setEditingMethod(method);
        setViewMode(true);
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMethod(null);
        setViewMode(false);
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);

            // Prepare the full config data with all fields
            const configData = {
                // CCP fields
                ccp_account_number: formData.ccp_account_number,
                ccp_account_name: formData.ccp_account_name,
                ccp_rib: formData.ccp_rib,
                ccp_bank_name: formData.ccp_bank_name,
                ccp_instructions: formData.ccp_instructions,
                is_ccp_enabled: formData.is_ccp_enabled,

                // General settings
                default_currency: "DZD",
                supported_currencies: ["DZD"],
                payment_description_template:
                    formData.payment_description_template,
                success_redirect_url: formData.success_redirect_url,
                cancel_redirect_url: formData.cancel_redirect_url,
            };

            let response;
            // Check if we're updating existing config
            if (paymentConfig?.id) {
                response = await PaymentConfigAPI.updatePaymentConfig(
                    paymentConfig.id,
                    configData,
                );
            } else {
                response =
                    await PaymentConfigAPI.createPaymentConfig(configData);
            }

            if (response.success) {
                setSuccess(
                    `${paymentMethods[editingMethod].label} configuration saved successfully!`,
                );
                await fetchPaymentConfig();
                handleCloseModal();
            } else {
                setError(
                    response.message || "Failed to save payment configuration",
                );
            }
        } catch (error) {
            console.error("Error saving payment config:", error);
            setError(
                error.response?.data?.message ||
                    "Error saving payment configuration. Please try again.",
            );
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleRichTextChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const togglePaymentMethod = async (method) => {
        try {
            setError(null);
            const isEnabled = formData.is_ccp_enabled;
            const newStatus = !isEnabled;

            // Update local state
            const fieldName = "is_ccp_enabled";
            setFormData((prev) => ({
                ...prev,
                [fieldName]: newStatus,
            }));

            // Update on server if config exists
            if (paymentConfig?.id) {
                const configData = {
                    ...formData,
                    [fieldName]: newStatus,
                };

                const response = await PaymentConfigAPI.updatePaymentConfig(
                    paymentConfig.id,
                    configData,
                );

                if (response.success) {
                    await fetchPaymentConfig();
                    setSuccess(
                        `${paymentMethods[method].label} ${
                            newStatus ? "enabled" : "disabled"
                        } successfully!`,
                    );
                } else {
                    throw new Error(response.message || "Failed to update");
                }
            }
        } catch (error) {
            console.error("Error toggling payment method:", error);
            setError(`Error updating ${paymentMethods[method].label} status.`);
            // Revert local state
            const fieldName = "is_ccp_enabled";
            const originalStatus = formData.is_ccp_enabled;
            setFormData((prev) => ({
                ...prev,
                [fieldName]: originalStatus,
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Payment Configuration
                </h1>
                <p className="text-gray-600">
                    Gérez vos modes de paiement et leurs paramètres. Configurez
                    les options de paiement CCP pour votre plateforme.
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckIcon className="h-5 w-5" />
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <XMarkIcon className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Payment Methods Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {Object.entries(paymentMethods).map(([method, info]) => {
                    const isEnabled = formData.is_ccp_enabled;

                    // Check if this method is configured
                    const isConfigured = !!(
                        paymentConfig?.ccp_account_number ||
                        paymentConfig?.ccp_account_name
                    );

                    const IconComponent = info.icon;

                    return (
                        <div
                            key={method}
                            className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
                                isEnabled
                                    ? "border-green-200 bg-green-50"
                                    : "border-gray-200"
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-3 rounded-lg ${info.color} text-white`}
                                        >
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {info.label}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {info.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isEnabled}
                                                onChange={() =>
                                                    togglePaymentMethod(method)
                                                }
                                                className="sr-only peer"
                                                disabled={!paymentConfig}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Status:
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                isEnabled
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {isEnabled ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Configuration:
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                isConfigured
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {isConfigured
                                                ? "Configured"
                                                : "Not Configured"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {isConfigured ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleView(method)
                                                }
                                                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleEdit(method)
                                                }
                                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                                Edit
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(method)}
                                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                            Configure
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Payment Info Notice */}

            {/* Configuration Modal */}
            {showModal && editingMethod && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {viewMode ? "View" : "Configure"}{" "}
                                {paymentMethods[editingMethod].label}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Error in modal */}
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Enable/Disable Toggle */}
                                {!viewMode && (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                Enable{" "}
                                                {
                                                    paymentMethods[
                                                        editingMethod
                                                    ].label
                                                }
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Allow users to pay using this
                                                method
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_ccp_enabled"
                                                checked={
                                                    formData.is_ccp_enabled
                                                }
                                                onChange={handleInputChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                )}

                                {/* CCP Configuration */}
                                {editingMethod === "ccp" && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                            CCP Configuration
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Account Number *
                                                </label>
                                                {viewMode ? (
                                                    <div className="p-3 bg-gray-50 rounded-md text-sm font-mono">
                                                        {formData.ccp_account_number ||
                                                            "Not set"}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="ccp_account_number"
                                                        value={
                                                            formData.ccp_account_number
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                                        placeholder="CCP Account Number"
                                                        required
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Account Holder Name *
                                                </label>
                                                {viewMode ? (
                                                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                                                        {formData.ccp_account_name ||
                                                            "Not set"}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="ccp_account_name"
                                                        value={
                                                            formData.ccp_account_name
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Account Holder Full Name"
                                                        required
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    RIB Number *
                                                </label>
                                                {viewMode ? (
                                                    <div className="p-3 bg-gray-50 rounded-md text-sm font-mono">
                                                        {formData.ccp_rib ||
                                                            "Not set"}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="ccp_rib"
                                                        value={formData.ccp_rib}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                                        placeholder="RIB Number"
                                                        required
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Bank Name
                                                </label>
                                                {viewMode ? (
                                                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                                                        {formData.ccp_bank_name ||
                                                            "Not set"}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="ccp_bank_name"
                                                        value={
                                                            formData.ccp_bank_name
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Bank/Post Office Name"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Payment Instructions *
                                            </label>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Detailed instructions for users
                                                on how to make CCP transfers
                                            </p>
                                            {viewMode ? (
                                                <div className="p-3 bg-gray-50 rounded-md text-sm">
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                formData.ccp_instructions ||
                                                                "No instructions set",
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <RichTextEditor
                                                    value={
                                                        formData.ccp_instructions
                                                    }
                                                    onChange={(value) =>
                                                        handleRichTextChange(
                                                            "ccp_instructions",
                                                            value,
                                                        )
                                                    }
                                                    placeholder="Enter detailed instructions for CCP transfers..."
                                                    height="200px"
                                                    required
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {viewMode ? "Close" : "Cancel"}
                                </button>
                                {!viewMode && (
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                        Save Configuration
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentInfo;
