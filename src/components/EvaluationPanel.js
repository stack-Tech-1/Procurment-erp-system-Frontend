"use client";
import React, { useState, useEffect } from 'react';
import { Star, Calculator, Save, TrendingUp, Award, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const EvaluationPanel = ({ vendor, onEvaluationSave, currentReviewer }) => {
  const [evaluation, setEvaluation] = useState({
    documentCompliance: vendor.documentComplianceScore || 0,
    technicalCapability: vendor.technicalCapabilityScore || 0,
    financialStrength: vendor.financialStrengthScore || 0,
    experience: vendor.experienceScore || 0,
    responsiveness: vendor.responsivenessScore || 0,
    notes: vendor.evaluationNotes || '',
    evaluatorId: currentReviewer?.id || null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Evaluation criteria from your specification document
  const criteria = [
    { 
      key: 'documentCompliance', 
      label: 'Document Compliance', 
      weight: 20, 
      description: 'Based on uploaded documents and validity',
      icon: CheckCircle
    },
    { 
      key: 'technicalCapability', 
      label: 'Technical Capability', 
      weight: 25, 
      description: 'Technical expertise and resources',
      icon: TrendingUp
    },
    { 
      key: 'financialStrength', 
      label: 'Financial Strength', 
      weight: 20, 
      description: 'Financial stability and capacity',
      icon: Award
    },
    { 
      key: 'experience', 
      label: 'Experience', 
      weight: 25, 
      description: 'Relevant project experience and track record',
      icon: Star
    },
    { 
      key: 'responsiveness', 
      label: 'Responsiveness', 
      weight: 10, 
      description: 'Communication and response times',
      icon: AlertTriangle
    }
  ];

  // Calculate weighted total score
  const calculateTotalScore = () => {
    return criteria.reduce((total, criterion) => {
      return total + (evaluation[criterion.key] * criterion.weight / 100);
    }, 0);
  };

  // Determine vendor class based on score (from your specs)
  const getVendorClass = (score) => {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    return 'D';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-300';
    if (score >= 60) return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  const getClassColor = (vendorClass) => {
    switch (vendorClass) {
      case 'A': return 'bg-green-100 text-green-800 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'D': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleScoreChange = (key, value) => {
    const numericValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setEvaluation(prev => ({ ...prev, [key]: numericValue }));
  };

  const handleSaveEvaluation = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const totalScore = calculateTotalScore();
      const vendorClass = getVendorClass(totalScore);
      
      const evaluationData = {
        ...evaluation,
        totalScore: parseFloat(totalScore.toFixed(1)),
        vendorClass,
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: currentReviewer?.name || 'Unknown Reviewer'
      };

      await onEvaluationSave(evaluationData);
      setSaveMessage({ type: 'success', text: 'Evaluation saved successfully!' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save evaluation.' });
    } finally {
      setIsSaving(false);
    }
  };

  const totalScore = calculateTotalScore();
  const vendorClass = getVendorClass(totalScore);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Vendor Evaluation & Rating
        </h3>
        <div className={`px-3 py-1 rounded-full font-bold border ${getScoreColor(totalScore)}`}>
          {totalScore.toFixed(1)}/100
        </div>
      </div>

      {/* Current Score & Class Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Current Score</p>
          <p className="text-2xl font-bold text-blue-800">{totalScore.toFixed(1)}/100</p>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalScore}%` }}
            ></div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${getClassColor(vendorClass)}`}>
          <p className="text-sm font-medium">Recommended Class</p>
          <p className="text-2xl font-bold">Class {vendorClass}</p>
          <p className="text-xs opacity-75 mt-1">Based on evaluation criteria</p>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="space-y-4 mb-6">
        {criteria.map((criterion) => {
          const IconComponent = criterion.icon;
          const weightedScore = (evaluation[criterion.key] * criterion.weight / 100);
          
          return (
            <div key={criterion.key} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <IconComponent className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{criterion.label}</h4>
                    <p className="text-sm text-gray-600">{criterion.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Weight: {criterion.weight}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">
                    {weightedScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 block">points</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={evaluation[criterion.key]}
                  onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
                  className="flex-1"
                />
                <div className="w-20">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evaluation[criterion.key]}
                    onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evaluation Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Evaluation Notes & Comments
        </label>
        <textarea
          value={evaluation.notes}
          onChange={(e) => setEvaluation(prev => ({ ...prev, notes: e.target.value }))}
          rows="4"
          placeholder="Add detailed notes about this evaluation, key findings, strengths, weaknesses, and recommendations..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-vertical"
        />
      </div>

      {/* Score Breakdown */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Score Breakdown</h5>
        <div className="space-y-2 text-sm">
          {criteria.map((criterion) => (
            <div key={criterion.key} className="flex justify-between">
              <span className="text-gray-600">{criterion.label}:</span>
              <span className="font-medium">
                {evaluation[criterion.key]}/100 = {(evaluation[criterion.key] * criterion.weight / 100).toFixed(1)} pts
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold border-t pt-2">
            <span>Total Score:</span>
            <span>{totalScore.toFixed(1)}/100</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleSaveEvaluation}
          disabled={isSaving}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-150 flex items-center justify-center font-semibold"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving Evaluation...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Evaluation & Update Profile
            </>
          )}
        </button>
        
        <button 
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
          title="Recalculate Scores"
        >
          <Calculator className="w-4 h-4" />
        </button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          saveMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Evaluation History (Optional) */}
      {vendor.lastEvaluatedAt && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Last Evaluation</h6>
          <p className="text-xs text-gray-600">
            Evaluated by: {vendor.evaluatedBy} on {new Date(vendor.lastEvaluatedAt).toLocaleDateString()}
          </p>
          {vendor.evaluationNotes && (
            <p className="text-xs text-gray-600 mt-1">
              Notes: {vendor.evaluationNotes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EvaluationPanel;