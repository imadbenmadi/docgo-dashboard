import { useState } from "react";
import { X, Check, XCircle, Loader2 } from "lucide-react";

const PaymentProofModal = ({
    isOpen,
    onClose,
    Image,
    userName,
    userId,
    onApprove,
    onReject,
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [ImageLoading, setImageLoading] = useState(true);
    const [ImageError, setImageError] = useState(false);

    if (!isOpen) return null;

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove(userId);
            onClose();
        } catch (error) {
            console.error("Error approving payment:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        setIsProcessing(true);
        try {
            await onReject(userId);
            onClose();
        } catch (error) {
            console.error("Error rejecting payment:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Payment Proof for {userName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Image Section */}
                <div className="p-6">
                    <div className="flex justify-center items-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        {Image ? (
                            <div className="relative">
                                {ImageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <p className="text-gray-600 text-sm">
                                                Loading Image...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {ImageError ? (
                                    <div className="flex flex-col items-center gap-3 p-8">
                                        <XCircle className="w-12 h-12 text-red-500" />
                                        <p className="text-red-600 text-center">
                                            Failed to load payment proof Image
                                        </p>
                                    </div>
                                ) : (
                                    <img
                                        src={Image}
                                        alt={`Payment proof for ${userName}`}
                                        className={`max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg transition-opacity duration-300 ${
                                            ImageLoading
                                                ? "opacity-0"
                                                : "opacity-100"
                                        }`}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-500">
                                <XCircle className="w-12 h-12" />
                                <p className="text-lg">
                                    No payment proof available
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Check className="w-5 h-5" />
                            )}
                            Accept Payment
                        </button>

                        <button
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            Reject Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentProofModal;
