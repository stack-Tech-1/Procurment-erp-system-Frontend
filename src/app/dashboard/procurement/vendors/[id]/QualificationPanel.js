// src/app/dashboard/procurement/vendors/[id]/QualificationPanel.jsx

import React from 'react';
import { Loader2, Send, CheckCircle, Clock, Users, Award } from 'lucide-react';

// --- MOCK DATA (Replace with a fetch to your /api/users/reviewers endpoint) ---
const MOCK_REVIEWERS = [
    { id: 101, name: 'Ahmad Ali (Proc. Mgr)' },
    { id: 102, name: 'Sara Khan (Proc. Eng.)' },
    { id: 103, name: 'System Admin' },
];

const STATUS_OPTIONS = ['APPROVED', 'REJECTED', 'UNDER_REVIEW', 'BLACKLISTED', 'NEEDS_RENEWAL'];
const CLASS_OPTIONS = ['A', 'B', 'C', 'D'];

const QualificationPanel = ({ 
    form, 
    setForm, 
    onSubmit, 
    isSubmitting, 
    submitMessage, 
    currentReviewerName,
    lastReviewedBy,
    lastReviewNotes
}) => {

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        // Use a unary plus operator (+) to convert 'qualificationScore' to a number
        const newValue = name === 'qualificationScore' ? +value : value;
        
        setForm(prev => ({ ...prev, [name]: newValue }));
    };

    return (
        <form onSubmit={onSubmit} className="bg-blue-800 p-6 rounded-xl shadow-2xl border-b-8 border-blue-600">
            <h3 className="text-2xl font-bold mb-4 text-yellow-800 border-b border-yellow-200 pb-3">
                <CheckCircle className="inline w-6 h-6 mr-2 text-yellow-600" />
                Qualification Review & Update
            </h3>

            {/* Current Reviewer Info (Read-only context) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border-l-4 border-blue-500 bg-white rounded-lg">
                    <p className="text-sm font-medium text-gray-500 flex items-center"><Users className='w-4 h-4 mr-1'/> Assigned</p>
                    <p className="text-lg font-bold mt-1 text-blue-600">{currentReviewerName}</p>
                </div>
                 <div className="p-3 border-l-4 border-gray-500 bg-white rounded-lg">
                    <p className="text-sm font-medium text-gray-500 flex items-center"><CheckCircle className='w-4 h-4 mr-1'/> Last Reviewed By</p>
                    <p className="text-sm font-bold mt-1 text-gray-700">{lastReviewedBy}</p>
                </div>
            </div>

            {/* 1. New Status Select (Updated to include all backend options) */}
            <div>
                <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-1">New Status *</label>
                <select
                    id="newStatus"
                    name="newStatus"
                    value={form.newStatus}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 p-3 rounded-lg shadow-sm bg-white cursor-pointer"
                    required
                >
                    <option value="">-- Select Status --</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
            </div>

            {/* 2. Qualification Score & Class (NEW FIELDS) */}
            <div className="flex space-x-4">
                <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center"><Award className='w-4 h-4 mr-1'/> Score (0-100)</label>
                    <input
                        type="number"
                        name="qualificationScore"
                        value={form.qualificationScore}
                        onChange={handleFormChange}
                        min="0"
                        max="100"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"
                        required
                    />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">Vendor Class</label>
                    <select
                        name="vendorClass"
                        value={form.vendorClass}
                        onChange={handleFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"
                        required
                    >
                        {CLASS_OPTIONS.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                </div>
            </div>

            {/* 3. Assigned Reviewer & Next Review Date (NEW FIELDS) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Assign Next Reviewer</label>
                <select
                    name="assignedReviewerId"
                    value={form.assignedReviewerId || ''}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"
                >
                    <option value={''}>-- Select Reviewer --</option>
                    {MOCK_REVIEWERS.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center"><Clock className='w-4 h-4 mr-1'/> Next Review Date</label>
                <input
                    type="date"
                    name="nextReviewDate"
                    value={form.nextReviewDate || ''}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3"
                />
            </div>

            {/* 4. Review Notes (Critical for Audit Log) */}
            <div>
                <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Review Notes * (Mandatory for Audit)
                </label>
                <textarea
                    id="reviewNotes"
                    rows="5"
                    name="reviewNotes"
                    value={form.reviewNotes}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 p-3 rounded-lg shadow-sm"
                    placeholder="Enter detailed reasons for approval, rejection, or notes for the next reviewer."
                    required
                ></textarea>
            </div>

            {/* Submission Feedback & Button */}
            {submitMessage && (
                <div className={`p-3 rounded-lg text-sm font-medium ${submitMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {submitMessage.text}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition duration-150 shadow-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-500/50'}`}
            >
                {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</>
                ) : (
                    <><Send className="w-5 h-5" /> Update Qualification</>
                )}
            </button>
        </form>
    );
};

export default QualificationPanel;