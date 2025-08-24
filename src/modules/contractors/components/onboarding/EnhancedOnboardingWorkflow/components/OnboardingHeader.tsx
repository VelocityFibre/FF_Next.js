import { CheckCircle } from 'lucide-react';

interface OnboardingHeaderProps {
  contractorName: string;
  overallProgress: number;
  isSubmitting: boolean;
  onSubmitForApproval: () => void;
}

export function OnboardingHeader({
  contractorName,
  overallProgress,
  isSubmitting,
  onSubmitForApproval
}: OnboardingHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Contractor Onboarding</h2>
          <p className="text-gray-600">{contractorName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Overall Progress</p>
          <p className="text-2xl font-bold text-blue-600">{overallProgress}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Submit Button */}
      {overallProgress === 100 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">All required documents uploaded</span>
          </div>
          <button
            onClick={onSubmitForApproval}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      )}
    </div>
  );
}