"use client";

export default function TermsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0A1628] border border-white/20 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Terms &amp; Conditions and Privacy Policy</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 text-white/80 text-sm leading-relaxed space-y-5">
          <section>
            <h3 className="text-white font-semibold text-base mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing or using the KUN Real Estate Procurement Portal (&ldquo;the Portal&rdquo;), you confirm that you have
              read, understood, and agree to be bound by these Terms &amp; Conditions. If you do not agree, you must
              not use the Portal.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">2. Permitted Use</h3>
            <p>
              The Portal is intended solely for authorised suppliers, vendors, and staff of KUN Real Estate and its
              affiliates. Access is granted for legitimate procurement activities only. Any unauthorised use,
              scraping, or automated access is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">3. User Obligations</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate, complete, and current registration information.</li>
              <li>You are responsible for maintaining the confidentiality of your credentials.</li>
              <li>You must notify us immediately of any suspected unauthorised access to your account.</li>
              <li>You must not share your login credentials with any third party.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">4. Supplier Responsibilities</h3>
            <p>
              Suppliers must ensure all submitted documents (Commercial Registration, VAT Certificate, etc.) are
              valid, authentic, and up to date. Submission of false or misleading information may result in
              immediate disqualification and legal action.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">5. Confidentiality</h3>
            <p>
              All information exchanged through the Portal is confidential. Users must not disclose any
              procurement-related data, pricing information, or bid details to unauthorised parties.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">6. Intellectual Property</h3>
            <p>
              All content, trademarks, and materials on the Portal are the property of KUN Real Estate. No part
              of the Portal may be reproduced or distributed without prior written consent.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">7. Privacy Policy</h3>
            <p>
              KUN Real Estate collects personal and business data solely for the purposes of procurement
              management. Your data is stored securely and will not be sold or shared with third parties except
              as required by law or for processing your registration and transactions.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Data collected: name, email, company details, CR/VAT numbers, and transaction history.</li>
              <li>Data retention: records are retained for a minimum of 7 years in accordance with Saudi regulations.</li>
              <li>You have the right to request access to or deletion of your personal data.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">8. Limitation of Liability</h3>
            <p>
              KUN Real Estate shall not be liable for any indirect, incidental, or consequential damages arising
              from the use of or inability to use the Portal. The Portal is provided &ldquo;as is&rdquo; without
              warranties of any kind.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">9. Governing Law</h3>
            <p>
              These Terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes shall be
              subject to the exclusive jurisdiction of the competent courts in Riyadh.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold text-base mb-2">10. Changes to Terms</h3>
            <p>
              KUN Real Estate reserves the right to update these Terms at any time. Continued use of the Portal
              after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#B8960A] hover:bg-[#D4A50C] text-white font-bold rounded-xl transition-colors duration-200"
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
