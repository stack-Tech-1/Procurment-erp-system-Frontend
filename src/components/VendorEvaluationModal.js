// src/components/VendorEvaluationModal.jsx (Updated for your schema)
"use client";
import React, { useState } from 'react';
import { X, Star, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';

const VendorEvaluationModal = ({ submission, isOpen, onClose, onEvaluate }) => {
  const [evaluation, setEvaluation] = useState({
    technicalScore: 0,
    financialScore: 0,
    experienceScore: 0,
    responsiveness: 0,
    otherScore: 0,
    totalScore: 0,
    comments: ''
  });

  if (!isOpen) return null;

  const calculateTotalScore = () => {
    const weights = {
      technicalScore: 0.3,
      financialScore: 0.3,
      experienceScore: 0.2,
      responsiveness: 0.1,
      otherScore: 0.1
    };
    
    return Object.keys(weights).reduce((total, key) => {
      return total + (evaluation[key] * weights[key] * 20); // Convert to 0-100 scale
    }, 0);
  };

  const handleScoreChange = (category, value) => {
    const newEvaluation = {
      ...evaluation,
      [category]: value
    };
    
    // Auto-calculate total score
    newEvaluation.totalScore = calculateTotalScore();
    setEvaluation(newEvaluation);
  };

  const handleSubmit = () => {
    onEvaluate(submission.id, evaluation);
    onClose();
  };

  const ScoreInput = ({ label, value, onChange, weight, maxScore = 5 }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500 ml-2">({weight * 100}%)</span>
      </div>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`p-1 ${
              value >= star ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium w-8">{value}/5</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Evaluate Vendor Submission</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Vendor Info */}
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg mb-2">{submission.vendor?.companyLegalName}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-green-500 mr-2" />
              <span>Proposed: ${submission.totalValue?.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-blue-500 mr-2" />
              <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="p-6 space-y-4">
          <ScoreInput
            label="Technical Score"
            value={evaluation.technicalScore}
            onChange={(value) => handleScoreChange('technicalScore', value)}
            weight={0.3}
          />
          
          <ScoreInput
            label="Financial Score"
            value={evaluation.financialScore}
            onChange={(value) => handleScoreChange('financialScore', value)}
            weight={0.3}
          />
          
          <ScoreInput
            label="Experience Score"
            value={evaluation.experienceScore}
            onChange={(value) => handleScoreChange('experienceScore', value)}
            weight={0.2}
          />
          
          <ScoreInput
            label="Responsiveness"
            value={evaluation.responsiveness}
            onChange={(value) => handleScoreChange('responsiveness', value)}
            weight={0.1}
          />
          
          <ScoreInput
            label="Other Factors"
            value={evaluation.otherScore}
            onChange={(value) => handleScoreChange('otherScore', value)}
            weight={0.1}
          />

          {/* Total Score */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-800">Total Score</span>
              <span className="text-2xl font-bold text-blue-600">
                {evaluation.totalScore.toFixed(1)}/100
              </span>
            </div>
            <div className="mt-2 text-sm text-blue-700">
              {evaluation.totalScore >= 80 && "✅ Recommended for Award"}
              {evaluation.totalScore >= 60 && evaluation.totalScore < 80 && "⚠️ Needs Review"}
              {evaluation.totalScore < 60 && "❌ Not Recommended"}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evaluation Comments
            </label>
            <textarea
              value={evaluation.comments}
              onChange={(e) => setEvaluation(prev => ({ ...prev, comments: e.target.value }))}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add detailed evaluation comments, strengths, weaknesses, and recommendations..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Submit Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorEvaluationModal;