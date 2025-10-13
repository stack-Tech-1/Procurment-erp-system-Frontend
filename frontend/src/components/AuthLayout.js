"use client";
import Link from "next/link";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl border border-gray-100 p-10 relative overflow-hidden">
        {/* Brand Logo / Name */}
        <div className="absolute top-0 left-0 w-full bg-indigo-600 text-white text-center py-2 text-lg font-semibold tracking-wide">
          11 Procurement ERP
        </div>

        {/* Title */}
        <div className="mt-10 mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          {subtitle && (
            <p className="text-gray-500 mt-2 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Page Content */}
        <div>{children}</div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-8">
          © {new Date().getFullYear()} <span className="font-medium text-gray-600">11</span>. All rights reserved.
        </p>
      </div>
    </div>
  );
}
