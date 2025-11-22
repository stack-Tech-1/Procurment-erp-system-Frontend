"use client";
import React, { useState } from 'react';
import SignatureCapture from './SignatureCapture';
import { FileText, User, Calendar, Shield, X } from 'lucide-react'; 

const SignatureApprovalModal = ({ 
  isOpen, 
  onClose, 
  approvalAction, 
  onSignatureComplete 
}) => {
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSignatureSave = async (signatureData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/signatures/requests/${approvalAction.id}/sign`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signatureData })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        onSignatureComplete(result.data);
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Failed to save signature:', error);
      alert('Failed to save signature: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Digital Signature Required</h2>
              <p className="text-gray-600">Sign to approve this request</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Approval Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Document Type</p>
                <p className="font-semibold">{approvalAction.instance.entityType}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Your Role</p>
                <p className="font-semibold">{approvalAction.step.role.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <Shield className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800">Legal Notice</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  By signing this document, you acknowledge that this electronic signature 
                  is legally binding and equivalent to your handwritten signature.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="p-6 border-t border-gray-200">
          {!showSignatureCapture ? (
            <div className="text-center">
              <button
                onClick={() => setShowSignatureCapture(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Start Signing Process
              </button>
              <p className="text-gray-500 text-sm mt-3">
                You'll be guided through the signature process
              </p>
            </div>
          ) : (
            <SignatureCapture
              onSave={handleSignatureSave}
              onCancel={() => setShowSignatureCapture(false)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>IP: Logged</span>
              </div>
            </div>
            <div>
              <span>Secure Digital Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureApprovalModal;