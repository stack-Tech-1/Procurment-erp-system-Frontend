/* ---------- File: src/app/vendor/components/ProposalTrackingTable.client.jsx ---------- */
"use client";
import React from 'react';

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

export default function ProposalTrackingTable({ proposals = [] }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Proposal & Bid Tracking</h2>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{proposal.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}