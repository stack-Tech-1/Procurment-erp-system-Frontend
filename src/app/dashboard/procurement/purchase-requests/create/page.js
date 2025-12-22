"use client";
import { useState, useEffect } from 'react';
import { 
  Save, Send, ArrowLeft, FileText, Building, User,
  Calendar, DollarSign, Plus, Trash2, Package, AlertCircle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { useRouter } from 'next/navigation';

// Mock API function
const mockAPI = {
  createPurchaseRequest: async (data) => {
    console.log('Creating PR:', data);
    return { success: true, data: { ...data, id: Date.now() } };
  },
  getProjects: async () => {
    return [
      { id: 1, name: 'Core DQ Tower' },
      { id: 2, name: 'Obhur Beach Resort' },
      { id: 3, name: 'Tower B Construction' },
      { id: 4, name: 'Commercial Complex' },
      { id: 5, name: 'HQ Office Renovation' }
    ];
  }
};

const CreatePurchaseRequestPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    prNumber: `PR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    title: '',
    projectId: '',
    requesterName: '',
    department: '',
    priority: 'MEDIUM',
    requiredDate: '',
    justification: '',
    status: 'DRAFT',
    items: [
      { description: '', quantity: 1, unit: '', estimatedPrice: 0, total: 0 }
    ]
  });
  const [mobileSection, setMobileSection] = useState('basic');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await mockAPI.getProjects();
      setProjects(response);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'estimatedPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedItems[index].quantity;
      const price = field === 'estimatedPrice' ? parseFloat(value) || 0 : updatedItems[index].estimatedPrice;
      updatedItems[index].total = quantity * price;
    }
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit: '', estimatedPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = [...formData.items];
      updatedItems.splice(index, 1);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSubmit = async (status = 'DRAFT') => {
    setLoading(true);
    try {
      const totalAmount = calculateTotal();
      const payload = {
        ...formData,
        status,
        estimatedAmount: totalAmount,
        createdAt: new Date().toISOString(),
        items: formData.items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity) || 0,
          estimatedPrice: parseFloat(item.estimatedPrice) || 0,
          total: parseFloat(item.total) || 0
        }))
      };

      const response = await mockAPI.createPurchaseRequest(payload);
      
      if (status === 'DRAFT') {
        alert('Purchase request saved as draft successfully!');
      } else {
        alert('Purchase request submitted successfully!');
      }
      
      router.push('/dashboard/procurement/purchase-requests');
    } catch (error) {
      console.error('Failed to create purchase request:', error);
      alert('Failed to create purchase request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mobileSections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'review', label: 'Review', icon: AlertCircle }
  ];

  return (
    <ResponsiveLayout>
      <div className="max-w-4xl mx-auto w-full pb-24">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Purchase Requests
          </button>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create Purchase Request</h1>
              <p className="text-gray-600">Fill in the details below to create a new procurement request</p>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex space-x-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {mobileSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setMobileSection(section.id)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  mobileSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <section.icon className="w-4 h-4 mr-1" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          {(mobileSection === 'basic' || !mobileSection) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PR Number *
                  </label>
                  <input
                    type="text"
                    name="prNumber"
                    value={formData.prNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project *
                  </label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Technical Office">Technical Office</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Date *
                  </label>
                  <input
                    type="date"
                    name="requiredDate"
                    value={formData.requiredDate}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification
                </label>
                <textarea
                  name="justification"
                  value={formData.justification}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Explain why this purchase is needed..."
                />
              </div>
            </div>
          )}

          {/* Items Section */}
          {(mobileSection === 'items' || !mobileSection) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Package className="w-5 h-5 mr-2 text-green-600" />
                  Items List
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Item #{index + 1}</h3>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unit *
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          required
                        >
                          <option value="">Select unit</option>
                          <option value="PCS">Pieces</option>
                          <option value="M">Meters</option>
                          <option value="KG">Kilograms</option>
                          <option value="L">Liters</option>
                          <option value="SET">Set</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Estimated Price (SAR) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.estimatedPrice}
                          onChange={(e) => handleItemChange(index, 'estimatedPrice', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <span className="text-gray-600">Item Total:</span>
                      <span className="font-bold">
                        {item.total.toLocaleString()} SAR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Estimated Amount:</span>
                  <span className="text-2xl font-bold text-green-700">
                    {calculateTotal().toLocaleString()} SAR
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Review Section */}
          {(mobileSection === 'review' || !mobileSection) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                Review & Submit
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">PR Number</p>
                    <p className="font-medium">{formData.prNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Project</p>
                    <p className="font-medium">
                      {projects.find(p => p.id === parseInt(formData.projectId))?.name || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="font-medium">{formData.priority}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Justification</p>
                  <p className="font-medium bg-gray-50 p-3 rounded">{formData.justification || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Items Summary</p>
                  <div className="mt-2 space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{item.description || `Item ${index + 1}`}</span>
                        <span>{item.quantity} {item.unit} × {item.estimatedPrice} SAR = {item.total} SAR</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-700">{calculateTotal().toLocaleString()} SAR</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Action Buttons */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="flex space-x-2">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              onClick={() => handleSubmit('DRAFT')}
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Draft'}
            </button>
            
            <button
              onClick={() => handleSubmit('SUBMITTED')}
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? '...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex justify-end space-x-4 pt-6">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          
          <button
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default CreatePurchaseRequestPage;