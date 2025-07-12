import React from "react";
import { X } from "lucide-react";

const PaymentProofModal = ({ isOpen, onClose, imageUrl, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Payment Proof for {userName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Payment proof for ${userName}`}
              className="max-w-full max-h-[70vh] object-contain rounded"
            />
          ) : (
            <p className="text-gray-600">No payment proof available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProofModal;
