"use client";
import React, { useRef, useState, useCallback } from 'react';
import { Save, X, RotateCcw, Type, PenTool } from 'lucide-react';

const SignatureCapture = ({ onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState('draw'); // 'draw' or 'type'
  const [typedName, setTypedName] = useState('');
  const [signatureData, setSignatureData] = useState(null);

  // Drawing functions
  const startDrawing = useCallback((e) => {
    if (signatureType !== 'draw') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    
    setIsDrawing(true);
  }, [signatureType]);

  const draw = useCallback((e) => {
    if (!isDrawing || signatureType !== 'draw') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    ctx.stroke();
  }, [isDrawing, signatureType]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTypedName('');
    setSignatureData(null);
  }, []);

  const saveSignature = useCallback(() => {
    let signature = null;

    if (signatureType === 'draw') {
      const canvas = canvasRef.current;
      signature = {
        type: 'image',
        data: canvas.toDataURL(),
        timestamp: new Date().toISOString()
      };
    } else {
      signature = {
        type: 'text',
        data: typedName,
        timestamp: new Date().toISOString()
      };
    }

    setSignatureData(signature);
    onSave(signature);
  }, [signatureType, typedName, onSave]);

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add Your Signature</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Signature Type Selector */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setSignatureType('draw')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 ${
            signatureType === 'draw' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Draw Signature</span>
        </button>
        <button
          onClick={() => setSignatureType('type')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 ${
            signatureType === 'type' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Type Name</span>
        </button>
      </div>

      {/* Drawing Canvas */}
      {signatureType === 'draw' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg mb-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full h-48 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              startDrawing(e.touches[0]);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              draw(e.touches[0]);
            }}
            onTouchEnd={stopDrawing}
          />
        </div>
      )}

      {/* Typed Signature */}
      {signatureType === 'type' && (
        <div className="mb-4">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your full name here"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-signature focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'cursive, sans-serif' }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={clearSignature}
          className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>
        <button
          onClick={saveSignature}
          disabled={(signatureType === 'draw' && !signatureData) || (signatureType === 'type' && !typedName)}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Signature</span>
        </button>
      </div>

      {/* Signature Preview */}
      {signatureData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Signature Preview:</p>
          {signatureData.type === 'image' ? (
            <img 
              src={signatureData.data} 
              alt="Signature preview" 
              className="max-h-20 border border-gray-300"
            />
          ) : (
            <p className="text-xl font-signature text-center" style={{ fontFamily: 'cursive, sans-serif' }}>
              {signatureData.data}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SignatureCapture;