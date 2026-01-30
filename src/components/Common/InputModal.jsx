import { X } from "lucide-react";
import { useState } from "react";
import RichTextEditor from "./RichTextEditor/RichTextEditor";

export const InputModal = ({ isOpen, title, fields, onConfirm, onCancel }) => {
    const [formData, setFormData] = useState(
        fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}),
    );
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleRichTextChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleConfirm = () => {
        const newErrors = {};
        fields.forEach((field) => {
            if (field.required && !formData[field.name]?.trim()) {
                newErrors[field.name] = `${field.label} est requis`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onConfirm(formData);
        setFormData(
            fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}),
        );
        setErrors({});
    };

    const handleCancel = () => {
        setFormData(
            fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}),
        );
        setErrors({});
        onCancel();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={handleCancel}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {field.label}
                                {field.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </label>
                            {field.type === "richtext" ? (
                                <div
                                    className={`border rounded-lg overflow-hidden ${
                                        errors[field.name]
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <RichTextEditor
                                        value={formData[field.name]}
                                        onChange={(value) =>
                                            handleRichTextChange(
                                                field.name,
                                                value,
                                            )
                                        }
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ) : field.type === "textarea" ? (
                                <textarea
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                        errors[field.name]
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />
                            ) : (
                                <input
                                    type={field.type || "text"}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors[field.name]
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />
                            )}
                            {errors[field.name] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors[field.name]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-colors"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;
