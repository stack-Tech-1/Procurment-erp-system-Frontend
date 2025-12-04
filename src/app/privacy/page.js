"use client";
import { useState, useEffect } from "react";
import AuthLayout from "@/components/AuthLayout";

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const backgroundElement = (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B35] via-[#1A365D] to-[#2D3748]">
      {/* ... same background as signup ... */}
    </div>
  );

  return (
    <AuthLayout background={backgroundElement} showGlobalHeader={true}>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className={`bg-white/5 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8 lg:p-12 transform transition-all duration-1000 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}>
          
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Terms & Conditions
          </h1>
          
          <div className="space-y-8 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using the KUN Real Estate Procurement System ("the System"), 
                you agree to be bound by these Terms and Conditions. If you do not agree to 
                these terms, please do not use the System.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. User Accounts</h2>
              <p className="leading-relaxed mb-4">
                2.1. You must provide accurate and complete information during registration.
              </p>
              <p className="leading-relaxed mb-4">
                2.2. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p className="leading-relaxed">
                2.3. You must notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            {/* Add more sections as needed */}
            
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-6 mt-8">
              <h3 className="text-xl font-semibold text-white mb-3">Effective Date</h3>
              <p className="text-white/80">These terms are effective as of January 1, 2025.</p>
              <p className="text-white/80 mt-2">Last updated: December 4, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}