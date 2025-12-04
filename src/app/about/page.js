"use client";
import { useState, useEffect } from "react";
import AuthLayout from "@/components/AuthLayout";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const backgroundElement = (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B35] via-[#1A365D] to-[#2D3748]">
      <div className="absolute inset-0 opacity-5 bg-repeat" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
      }}></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-500/5 to-yellow-300/10 rounded-full blur-3xl animate-float-medium"></div>
    </div>
  );

  return (
    <AuthLayout background={backgroundElement} showGlobalHeader={true}>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className={`bg-white/5 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8 lg:p-12 transform transition-all duration-1000 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}>
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 mr-6">
                <span className="text-white font-bold text-2xl">KUN</span>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  KUN Real Estate
                </h1>
                <p className="text-white/70 text-lg lg:text-xl">
                  Building Excellence Since 2010
                </p>
              </div>
            </div>
          </div>

          {/* About Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
                Our Story
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Founded in 2010, KUN Real Estate has established itself as a premier developer and investment group in Saudi Arabia. With a portfolio spanning across hospitality, residential, and mixed-use developments, we are committed to transforming skylines and communities.
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                Our Procurement & Contracts Department is the backbone of our operations, ensuring that every project is built with the highest quality materials and through partnerships with trusted suppliers and contractors.
              </p>
              
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-l-4 border-yellow-400 p-6 rounded-r-2xl">
                <h3 className="text-xl font-semibold text-white mb-3">Our Mission</h3>
                <p className="text-white/80">
                  To deliver exceptional real estate solutions through innovative design, sustainable practices, and strategic partnerships that exceed client expectations and contribute to Saudi Arabia's vision.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
                Key Achievements
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-300 text-2xl font-bold">50+</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Major Projects</h4>
                    <p className="text-white/70">Completed across Saudi Arabia</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-300 text-2xl font-bold">200+</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Trusted Partners</h4>
                    <p className="text-white/70">Suppliers and contractors in our network</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-300 text-2xl font-bold">15+</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Years of Excellence</h4>
                    <p className="text-white/70">In real estate development</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-l-4 border-blue-400 p-6 rounded-r-2xl">
                <h3 className="text-xl font-semibold text-white mb-3">Our Vision</h3>
                <p className="text-white/80">
                  To be the most trusted real estate partner in the region, known for innovation, quality, and sustainable development practices.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Partner With Us?</h3>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Join our network of trusted suppliers and contractors. Register today to participate in our RFQ processes and grow your business with KUN Real Estate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-8 py-4 rounded-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-500 font-bold text-lg shadow-2xl hover:shadow-yellow-500/25 transform hover:-translate-y-1 inline-flex items-center justify-center gap-2"
              >
                Register as Supplier
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/contact"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl transition-all duration-500 font-bold text-lg border border-white/20 hover:border-white/40 inline-flex items-center justify-center gap-2"
              >
                Contact Procurement Team
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}