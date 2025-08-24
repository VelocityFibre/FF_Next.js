/**
 * SOW Upload Wizard Navigation Footer
 */

import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { SOWUploadStep } from './SOWWizardTypes';

interface SOWWizardNavigationProps {
  steps: SOWUploadStep[];
  currentStep: number;
  onSkipAll: () => void;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function SOWWizardNavigation({ 
  steps, 
  currentStep, 
  onSkipAll, 
  onBack, 
  onNext, 
  onComplete 
}: SOWWizardNavigationProps) {
  const isCurrentStepComplete = steps[currentStep]?.completed;
  const allStepsComplete = steps.every(step => step.completed);
  const isLastStep = currentStep >= steps.length - 1;

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      <button
        onClick={onSkipAll}
        className="text-gray-600 hover:text-gray-800"
      >
        Skip All & Continue
      </button>

      <div className="flex items-center gap-4">
        {currentStep > 0 && (
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        )}

        {!isLastStep ? (
          <button
            onClick={onNext}
            disabled={!isCurrentStepComplete}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={!allStepsComplete}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Project Setup
          </button>
        )}
      </div>
    </div>
  );
}