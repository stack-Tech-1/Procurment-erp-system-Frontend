"use client";
import { useState } from "react";
// Lucide Icons for visual interest
import { Building2, FileText, CheckCircle, Briefcase, Send } from "lucide-react";

export default function CompleteVendorQualificationForm() {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would handle data validation and API submission here
    alert("✅ Proposal submitted successfully (Complete Form Data): " + JSON.stringify(formData, null, 2));
  };

  // --- Reusable Input/Label Component (with design styles) ---
  const FormInput = ({ label, name, type = "text", placeholder, colSpan = 1, required = false, children }) => (
    <div className={`flex flex-col space-y-1 md:col-span-${colSpan}`}>
      <label htmlFor={name} className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          className="w-full border border-gray-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm appearance-none bg-white cursor-pointer"
          onChange={handleChange}
          required={required}
          // Set value to handle controlled component state
          value={formData[name] || ""}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          className="w-full border border-gray-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
          onChange={handleChange}
          required={required}
          value={formData[name] || ""}
        />
      )}
    </div>
  );

  // --- Section Header Component (with blue accent) ---
  const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center space-x-3 pb-2 border-b-2 border-blue-100 mb-6">
      {Icon && <Icon className="w-6 h-6 text-blue-600" />}
      <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
        {title}
      </h2>
    </div>
  );

  // --- MAIN COMPONENT RENDER (Full Qualification Form) ---
  return (
    <div className="p-4 sm:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl p-6 sm:p-10 border border-gray-200">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black text-gray-800 mb-2 tracking-wide">
            Vendor Qualification Submission
          </h1>
          <p className="text-gray-500">
            Please provide complete and accurate information across all sections.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* 1. Company Information */}
          <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200/50">
            <SectionHeader title="Company Information" icon={Building2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormInput label="Company Legal Name" name="companyLegalName" placeholder="Enter full legal name" required />
              
              <FormInput label="Vendor Type" name="vendorType" type="select" required>
                <option value="">-- Select Vendor Type --</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Service Provider">Service Provider</option>
              </FormInput>

              <FormInput label="Main Category" name="mainCategory" placeholder="e.g., Construction, IT Services, Logistics" />
              <FormInput label="Products / Services" name="productsServices" placeholder="List key offerings" />
              <FormInput label="License Number" name="licenseNumber" placeholder="Enter registration or license number" />
              <FormInput label="Years in Business" name="yearsInBusiness" type="number" placeholder="Enter number of years" />
            </div>
          </section>

          {/* 2. Contact Details */}
          <section className="p-6">
            <SectionHeader title="Contact Details" icon={FileText} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormInput label="First Name" name="firstName" placeholder="Contact person first name" required />
              <FormInput label="Last Name" name="lastName" placeholder="Contact person last name" required />
              <FormInput label="Phone Number" name="phone" type="tel" placeholder="+966 5x xxx xxxx" />
              <FormInput label="Email Address" name="email" type="email" placeholder="contact@company.com" required />
              
              <FormInput label="Address Line 1" name="addressLine1" placeholder="Street Address, City, Country" colSpan={2} />
              
              <FormInput label="Company Website" name="website" type="url" placeholder="https://www.company.com" />
              
              {/* Custom File Input for Company Profile */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="companyProfile" className="text-sm font-semibold text-gray-700">
                  Upload Company Profile
                </label>
                <input
                  id="companyProfile"
                  type="file"
                  name="companyProfile"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-150"
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* 3. Document Checklist */}
          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <SectionHeader title="Document Checklist" icon={CheckCircle} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Warranty Certificate",
                "Organization Chart",
                "SASO or SABER Certificate",
                "HSE plan",
                "Quality Plan",
                "ISO Certificate",
                "Commercial Registration (CR)",
                "Zakat certificate",
                "Previous Work Documentation",
                "Technical file",
                "Financial file",
              ].map((item) => (
                <FormInput 
                  key={item} 
                  label={`${item} (Attached?)`} 
                  name={item.replace(/[\s\(\)/]/g, "") + "Status"} // Cleans name and adds 'Status' suffix
                  type="select"
                >
                  <option value="">Select Status</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Other">Other</option>
                </FormInput>
              ))}
            </div>
          </section>

          {/* 4. Company Overview & Experience */}
          <section className="p-6">
            <SectionHeader title="Company Overview & Experience" icon={Briefcase} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormInput label="Value of latest projects (SAR)" name="projectValueSAR" placeholder="e.g., 500,000,000" />
              <FormInput label="No. of employees under GOSI" name="numEmployeesGOSI" type="number" placeholder="Enter number of employees" />
              <FormInput label="Projects completed" name="projectsCompleted" type="number" placeholder="Enter total number" />
              <FormInput label="Year company was founded" name="foundedYear" placeholder="e.g., 2005" />
              <FormInput label="Bank IBAN" name="bankIBAN" placeholder="Enter the company's IBAN" />
              
              <FormInput label="Status with KRE" name="statusKRE" type="select">
                <option value="">Select Status</option>
                <option value="NewApplicant">New Applicant</option>
                <option value="ExistingQualified">Existing / Previously Qualified</option>
                <option value="Other">Other</option>
              </FormInput>
            </div>
          </section>

          {/* Submission / Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="reset"
              className="px-6 py-3 rounded-full text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition duration-150 shadow-md"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-full flex items-center gap-2 font-bold text-white bg-blue-600 hover:bg-blue-700 transition duration-150 shadow-lg shadow-blue-500/50"
            >
              <Send className="w-5 h-5" />
              Add Vendor & Submit Qualification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}