"use client";
import React from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';

const WorkflowStepper = ({ 
  steps, 
  currentStep, 
  onStepClick,
  vertical = false 
}) => {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'upcoming':
        return <Circle className="w-5 h-5 text-gray-300" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (vertical) {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div key={step.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <button
                  onClick={() => onStepClick && onStepClick(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    status === 'completed' ? 'bg-green-100' :
                    status === 'current' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}
                >
                  {getStatusIcon(status)}
                </button>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-6">
                <button
                  onClick={() => onStepClick && onStepClick(step.id)}
                  className="text-left"
                >
                  <h3 className={`font-medium ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'current' ? 'text-blue-700' :
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                  {step.status && (
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                      step.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      step.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {step.status}
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal stepper
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <li key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
              <button
                onClick={() => onStepClick && onStepClick(step.id)}
                className="flex items-center"
              >
                <span className="relative flex items-center justify-center">
                  <span className={`absolute w-8 h-8 rounded-full ${
                    status === 'completed' ? 'bg-green-100' :
                    status === 'current' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}></span>
                  <span className="relative">
                    {getStatusIcon(status)}
                  </span>
                </span>
                <span className={`ml-3 text-sm font-medium ${
                  status === 'completed' ? 'text-green-700' :
                  status === 'current' ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-6 bg-gray-200"></div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default WorkflowStepper;