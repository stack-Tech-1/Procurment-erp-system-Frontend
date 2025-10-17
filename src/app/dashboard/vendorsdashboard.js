import React, { useState, useEffect } from 'react';
import { Home, FileText, Send, Loader2, ListOrdered, UserPlus, X, CheckCircle2, AlertTriangle, Briefcase, ChevronRight } from 'lucide-react';

// --- MOCK DATA & UTILITIES (Simulating Auth/Database Context) ---

// Mock User & Vendor Statuses
const VENDOR_STATUSES = {
  NEW: 'New Registration',
  UNDER_REVIEW: 'Profile Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const mockUser = {
  id: 'vendor_001',
  name: 'Global Supply Co.',
  email: 'contact@globalsupply.com',
  vendorStatus: VENDOR_STATUSES.APPROVED, // Change to VENDOR_STATUSES.NEW to test registration flow
  isRegistered: true, // true if registration is complete/submitted
};

const mockProposals = [
  { id: 'P001', rfqRef: 'RFQ-2024-05-012', title: 'Supply of Cement & Aggregates', date: '2024-09-01', status: 'Pending Review', stage: 'Technical Evaluation' },
  { id: 'P002', rfqRef: 'RFQ-2024-04-045', title: 'HVAC System Installation Bid', date: '2024-08-15', status: 'Approved', stage: 'Contract Negotiation' },
  { id: 'P003', rfqRef: 'RFQ-2024-05-022', title: 'Office Furniture Procurement', date: '2024-09-20', status: 'Rejected', stage: 'Final Decision' },
  { id: 'P004', rfqRef: 'RFQ-2024-06-003', title: 'Electrical Cabling Supply', date: '2024-10-01', status: 'Draft', stage: 'Draft' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending Review':
    case 'Technical Evaluation':
      return 'text-amber-700 bg-amber-100';
    case 'Approved':
    case 'Contract Negotiation':
    case 'Complete':
      return 'text-green-700 bg-green-100';
    case 'Rejected':
      return 'text-red-700 bg-red-100';
    case 'Draft':
    default:
      return 'text-gray-700 bg-gray-200';
  }
};

// --- CORE COMPONENTS ---

// 1. Sidebar Component
const VendorSidebar = ({ currentView, setView, isRegistered }) => {
  const navItems = [
    { name: 'Dashboard', icon: <Home size={18} />, view: 'dashboard', requiresRegistration: true },
    { name: 'Submit Proposal', icon: <Send size={18} />, view: 'submit', requiresRegistration: true },
    { name: 'Proposal Tracking', icon: <ListOrdered size={18} />, view: 'tracking', requiresRegistration: true },
  ];

  return (
    <aside className="bg-slate-900 text-gray-100 w-64 min-h-screen flex flex-col justify-between shadow-2xl">
      <div>
        <div className="p-6 text-2xl font-semibold border-b border-slate-700">
          <span className="text-teal-400">Vendor</span>Portal
        </div>
        <nav className="mt-6 space-y-1">
          {isRegistered ? (
            navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex items-center gap-3 w-full text-left px-6 py-3 text-sm transition ${
                  currentView === item.view
                    ? 'bg-slate-800 text-teal-400 font-semibold border-r-4 border-teal-400'
                    : 'hover:bg-slate-800 hover:text-teal-400'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))
          ) : (
            <div className="px-6 py-3 text-sm text-amber-400 font-medium flex items-center gap-3">
               <AlertTriangle size={18} /> Complete Registration
            </div>
          )}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-slate-700">
        <button className="flex items-center gap-3 text-sm text-gray-400 hover:text-red-400 transition">
          <X size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

// 2. Proposal Submission Form Component
const ProposalSubmissionForm = () => {
  const [formData, setFormData] = useState({ rfqRef: '', title: '', proposalFile: null, price: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rfqRef || !formData.title || !formData.proposalFile) {
        // In a real app, show a modal/toast error instead of console.log
        console.error("Please fill all required fields.");
        return;
    }

    setIsSubmitting(true);
    setSuccess(false);

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      // Reset form data after successful submission
      setFormData({ rfqRef: '', title: '', proposalFile: null, price: '' });
      // In a real application, you would add the new proposal to the mockProposals state here.
    }, 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Briefcase size={24} className="text-teal-600" /> Submit New Proposal / Bid
      </h2>
      <p className="text-gray-500 mb-6">Respond to an existing Request for Quotation (RFQ) by uploading your technical and financial bid document.</p>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-4 flex items-center gap-3">
          <CheckCircle2 size={20} />
          <p className='font-medium'>Proposal submitted successfully! You can track its status in the **Proposal Tracking** section.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="rfqRef" className="block text-sm font-medium text-gray-700 mb-1">
            RFQ Reference Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="rfqRef"
            name="rfqRef"
            value={formData.rfqRef}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g., RFQ-2024-05-012"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Proposal Title / Scope <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g., Technical Bid for Electrical Works"
            required
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Quoted Price (SAR)
                </label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., 250000"
                />
            </div>
            <div>
                <label htmlFor="proposalFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Proposal Document (PDF/DOC) <span className="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    id="proposalFile"
                    name="proposalFile"
                    onChange={handleChange}
                    className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 p-3 border border-gray-300 rounded-lg"
                    accept=".pdf,.doc,.docx"
                    required
                />
            </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:bg-teal-400"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Submitting...
            </>
          ) : (
            <>
              <Send size={20} />
              Finalize & Submit Proposal
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// 3. Proposal Tracking Component
const ProposalTrackingTable = ({ proposals }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ListOrdered size={24} className="text-teal-600" /> Proposal & Bid Tracking
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ Ref.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stage</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">{proposal.rfqRef}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{proposal.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proposal.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center">
                    {proposal.stage} <ChevronRight size={16} className='ml-2 text-gray-400' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 4. Vendor Registration Form (Used when status is 'NEW')
const VendorRegistrationForm = ({ user, onCompleteRegistration }) => {
    const [formData, setFormData] = useState({ 
        name: user.name, 
        contactName: '', 
        contactEmail: user.email, 
        phone: '', 
        taxId: '', 
        businessType: 'Material Supplier'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call to submit registration details
        setTimeout(() => {
            setIsSubmitting(false);
            // On success, update the parent state to reflect registration completion
            onCompleteRegistration();
        }, 2500);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto border-4 border-amber-400/50">
            <div className="text-center mb-8">
                <UserPlus size={40} className="text-amber-600 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-gray-800">Complete Vendor Registration</h2>
                <p className="text-lg text-gray-600 mt-2">Please fill in your company's required information to proceed with submitting proposals.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name (Read-only for existing users) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            readOnly
                            disabled
                            className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg"
                        />
                    </div>
                    {/* Contact Person Name */}
                    <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Contact Person Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="contactName"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                    {/* Contact Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                        <input
                            type="email"
                            value={formData.contactEmail}
                            readOnly
                            disabled
                            className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg"
                        />
                    </div>
                    {/* Contact Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Contact Phone <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                    {/* Tax ID / Commercial Register No. */}
                    <div>
                        <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">Tax ID / Register No. <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="taxId"
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                    {/* Business Type */}
                    <div>
                        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">Primary Business Type <span className="text-red-500">*</span></label>
                        <select
                            id="businessType"
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white"
                            required
                        >
                            <option value="Material Supplier">Material Supplier</option>
                            <option value="Contractor">Service Contractor</option>
                            <option value="Consultant">Consultant</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition disabled:bg-amber-400"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Submitting for Review...
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Submit Vendor Profile
                            </>
                        )}
                    </button>
                    <p className='text-center text-xs text-gray-500 mt-3'>Your profile will be set to 'Under Review' after submission. You will be notified upon approval.</p>
                </div>
            </form>
        </div>
    );
};

// 5. Vendor Dashboard Main Content Component
const VendorDashboardContent = ({ user, setView }) => {
    const stats = [
        { label: 'Total Proposals', value: mockProposals.length, icon: <FileText size={22} />, color: 'bg-indigo-500' },
        { label: 'Pending Review', value: mockProposals.filter(p => p.status === 'Pending Review').length, icon: <Loader2 size={22} />, color: 'bg-amber-500' },
        { label: 'Approved Bids', value: mockProposals.filter(p => p.status === 'Approved').length, icon: <CheckCircle2 size={22} />, color: 'bg-green-500' },
        { label: 'Rejected Bids', value: mockProposals.filter(p => p.status === 'Rejected').length, icon: <X size={22} />, color: 'bg-red-500' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>

            {/* Vendor Status Card */}
            <div className={`p-5 rounded-xl shadow-lg flex justify-between items-center ${
                user.vendorStatus === VENDOR_STATUSES.APPROVED ? 'bg-green-50 border border-green-200' : 
                user.vendorStatus === VENDOR_STATUSES.UNDER_REVIEW ? 'bg-amber-50 border border-amber-200' :
                'bg-gray-50 border border-gray-200'
            }`}>
                <div className='flex items-center gap-4'>
                    <Briefcase size={30} className={user.vendorStatus === VENDOR_STATUSES.APPROVED ? 'text-green-600' : 'text-amber-600'} />
                    <div>
                        <p className="text-sm font-medium text-gray-500">Your Current Status</p>
                        <p className={`text-xl font-semibold ${user.vendorStatus === VENDOR_STATUSES.APPROVED ? 'text-green-800' : 'text-amber-800'}`}>
                            {user.vendorStatus}
                        </p>
                    </div>
                </div>
                {user.vendorStatus !== VENDOR_STATUSES.APPROVED && (
                    <button 
                        onClick={() => setView('registration')}
                        className='text-sm font-semibold text-teal-600 hover:text-teal-700 p-2 rounded-lg bg-white shadow hover:shadow-md transition'
                    >
                        Review Profile
                    </button>
                )}
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item) => (
                    <div
                        key={item.label}
                        className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex items-center gap-4"
                    >
                        <div className={`${item.color} p-3 rounded-lg text-white`}>{item.icon}</div>
                        <div>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <p className="text-2xl font-semibold text-gray-800">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Access/Call to Action */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4'>
                <div className='bg-indigo-50 p-6 rounded-xl border border-indigo-200 flex flex-col justify-between'>
                    <h3 className='text-xl font-semibold text-indigo-800 mb-2'>Track Your Bids</h3>
                    <p className='text-gray-600 mb-4'>Quickly see the approval progress of your recent proposal submissions.</p>
                    <button 
                        onClick={() => setView('tracking')}
                        className='self-start flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-lg text-sm font-medium transition shadow-md'
                    >
                        Go to Tracking <ChevronRight size={18} />
                    </button>
                </div>
                <div className='bg-teal-50 p-6 rounded-xl border border-teal-200 flex flex-col justify-between'>
                    <h3 className='text-xl font-semibold text-teal-800 mb-2'>Submit New Proposal</h3>
                    <p className='text-gray-600 mb-4'>Ready to submit a new bid for an RFQ? Get started here.</p>
                    <button 
                        onClick={() => setView('submit')}
                        className='self-start flex items-center gap-2 text-white bg-teal-600 hover:bg-teal-700 py-2 px-4 rounded-lg text-sm font-medium transition shadow-md'
                    >
                        Submit Proposal <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};


// 6. Main App/Dashboard Component
export default function VendorDashboard() {
  const [user, setUser] = useState(mockUser);
  const [currentView, setCurrentView] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false); // Used to ensure initial check is done

  // Determine initial view on load
  useEffect(() => {
    if (user.vendorStatus === VENDOR_STATUSES.NEW) {
        setCurrentView('registration');
    } else {
        setCurrentView('dashboard');
    }
    setIsAuthReady(true);
  }, [user.vendorStatus]);

  // Handler to simulate registration completion
  const handleRegistrationComplete = () => {
    // Simulate updating user state to 'Under Review' and moving to dashboard
    setUser(prev => ({ ...prev, vendorStatus: VENDOR_STATUSES.UNDER_REVIEW, isRegistered: true }));
    setCurrentView('dashboard');
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Vendor Dashboard';
      case 'submit':
        return 'Proposal Submission';
      case 'tracking':
        return 'Proposal Tracking';
      case 'registration':
        return 'Vendor Registration';
      default:
        return 'Vendor Portal';
    }
  };

  if (!isAuthReady) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Loader2 className="animate-spin text-teal-500" size={32} />
        </div>
    );
  }

  // If the user is NEW, they MUST complete registration first.
  const requiresRegistration = user.vendorStatus === VENDOR_STATUSES.NEW;

  // Render main content based on view state
  let mainContent;
  if (requiresRegistration) {
    mainContent = <VendorRegistrationForm user={user} onCompleteRegistration={handleRegistrationComplete} />;
  } else {
    switch (currentView) {
      case 'submit':
        mainContent = <ProposalSubmissionForm />;
        break;
      case 'tracking':
        mainContent = <ProposalTrackingTable proposals={mockProposals} />;
        break;
      case 'dashboard':
      case 'registration': // If they're approved or under review, registration links to profile review on the dashboard
      default:
        mainContent = <VendorDashboardContent user={user} setView={setCurrentView} />;
        break;
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VendorSidebar currentView={currentView} setView={setCurrentView} isRegistered={!requiresRegistration} />
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-100">
            <h1 className="text-xl font-semibold text-slate-700">{getPageTitle()}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase size={26} className="text-teal-600" />
                <div>
                    <p className="font-medium">{user.name || "Vendor User"}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                </div>
            </div>
        </header>
        
        {/* Main Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {mainContent}
        </div>
      </main>
    </div>
  );
}
