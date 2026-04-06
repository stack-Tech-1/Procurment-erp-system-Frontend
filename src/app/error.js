"use client";
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unexpected Error</h1>
        <p className="text-gray-500 mb-8">
          {error?.message || 'Something went wrong. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <a href="/dashboard" className="btn btn-secondary">
            <Home size={16} /> Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
