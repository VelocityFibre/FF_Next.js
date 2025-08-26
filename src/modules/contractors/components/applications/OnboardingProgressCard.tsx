/**
 * OnboardingProgressCard Component - Visual progress indicators for contractor onboarding
 * Displays completion status, stage progress, and document requirements
 */

// OnboardingProgressCard component imports
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calendar,
  TrendingUp,
  User,
  Building2
} from 'lucide-react';
import { ApplicationProgress, DocumentCompletionStatus } from '@/types/contractor.types';

// 🟢 WORKING: Props interface for OnboardingProgressCard
interface OnboardingProgressCardProps {
  /** Contractor's onboarding progress data */
  progress: ApplicationProgress;
  /** Company name for display */
  companyName: string;
  /** Contact person name */
  contactPerson: string;
  /** Document completion status */
  documents?: DocumentCompletionStatus[];
  /** Estimated completion date */
  estimatedCompletion?: Date;
  /** Show detailed stage breakdown */
  showStages?: boolean;
  /** Compact mode for table display */
  compact?: boolean;
  /** Click handler for navigation */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * OnboardingProgressCard Component
 * Provides visual representation of contractor onboarding progress
 */
export function OnboardingProgressCard({
  progress,
  companyName,
  contactPerson,
  documents = [],
  estimatedCompletion,
  showStages = false,
  compact = false,
  onClick,
  className = ''
}: OnboardingProgressCardProps) {
  
  // 🟢 WORKING: Calculate progress statistics
  const progressStats = {
    overall: Math.round(progress.overallProgress),
    completed: progress.stagesCompleted,
    total: progress.totalStages,
    documentsUploaded: progress.documentsUploaded,
    documentsRequired: progress.documentsRequired,
    documentsComplete: documents.filter(doc => doc.uploaded && doc.approved !== false).length,
    documentsExpiring: documents.filter(doc => doc.isExpiringSoon).length,
    documentsExpired: documents.filter(doc => doc.isExpired).length
  };

  // 🟢 WORKING: Determine progress status and color
  const getProgressStatus = () => {
    if (progressStats.overall === 100) {
      return { status: 'complete', color: 'green', label: 'Complete' };
    } else if (progressStats.overall >= 75) {
      return { status: 'near-complete', color: 'blue', label: 'Nearly Complete' };
    } else if (progressStats.overall >= 50) {
      return { status: 'in-progress', color: 'yellow', label: 'In Progress' };
    } else if (progressStats.overall >= 25) {
      return { status: 'started', color: 'orange', label: 'Started' };
    } else {
      return { status: 'not-started', color: 'gray', label: 'Not Started' };
    }
  };

  const statusInfo = getProgressStatus();

  // 🟢 WORKING: Get status icon based on progress
  const getStatusIcon = () => {
    switch (statusInfo.status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'near-complete':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'started':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  // 🟢 WORKING: Get progress bar color classes
  const getProgressBarClass = () => {
    switch (statusInfo.color) {
      case 'green':
        return 'bg-green-500';
      case 'blue':
        return 'bg-blue-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'orange':
        return 'bg-orange-500';
      default:
        return 'bg-gray-300';
    }
  };

  // 🟢 WORKING: Format days until completion
  const getDaysUntilCompletion = () => {
    if (!estimatedCompletion) return null;
    const now = new Date();
    const diffTime = estimatedCompletion.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), overdue: true };
    } else if (diffDays === 0) {
      return { days: 0, today: true };
    } else {
      return { days: diffDays, overdue: false, today: false };
    }
  };

  const completionDays = getDaysUntilCompletion();

  // 🟢 WORKING: Compact mode for table display
  if (compact) {
    return (
      <div 
        className={`flex items-center space-x-3 p-3 rounded-lg bg-white border hover:bg-gray-50 transition-colors ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
        onClick={onClick}
      >
        {getStatusIcon()}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Building2 className="h-4 w-4 text-gray-400" />
            <p className="font-medium text-gray-900 truncate">{companyName}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="h-3 w-3" />
            <span className="truncate">{contactPerson}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress Circle */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#e5e7eb"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - progressStats.overall / 100)}`}
                className={`transition-all duration-300 ${
                  statusInfo.color === 'green' ? 'text-green-500' :
                  statusInfo.color === 'blue' ? 'text-blue-500' :
                  statusInfo.color === 'yellow' ? 'text-yellow-500' :
                  statusInfo.color === 'orange' ? 'text-orange-500' :
                  'text-gray-300'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-700">
                {progressStats.overall}%
              </span>
            </div>
          </div>

          {/* Document status */}
          <div className="text-center">
            <div className="flex items-center space-x-1 text-sm">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {progressStats.documentsComplete}/{progressStats.documentsRequired}
              </span>
            </div>
            <p className="text-xs text-gray-500">Documents</p>
          </div>

          {/* Completion date */}
          {completionDays && (
            <div className="text-center">
              <div className={`flex items-center space-x-1 text-sm ${
                completionDays.overdue ? 'text-red-600' :
                completionDays.today ? 'text-orange-600' :
                'text-gray-600'
              }`}>
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {completionDays.overdue ? `${completionDays.days}d overdue` :
                   completionDays.today ? 'Due today' :
                   `${completionDays.days}d left`}
                </span>
              </div>
              <p className="text-xs text-gray-500">Estimated</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🟢 WORKING: Full card mode
  return (
    <div 
      className={`ff-card hover:shadow-lg transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-gray-900">{companyName}</h3>
              <p className="text-sm text-gray-500">{contactPerson}</p>
            </div>
          </div>
          <div className={`px-3 py-1 text-xs font-medium rounded-full ${
            statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
            statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {statusInfo.label}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900">
              {progressStats.overall}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarClass()}`}
              style={{ width: `${progressStats.overall}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {progressStats.completed}/{progressStats.total}
            </div>
            <div className="text-xs text-gray-500">Stages Complete</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {progressStats.documentsComplete}/{progressStats.documentsRequired}
            </div>
            <div className="text-xs text-gray-500">Documents</div>
          </div>
        </div>

        {/* Alerts */}
        {(progressStats.documentsExpired > 0 || progressStats.documentsExpiring > 0) && (
          <div className="mb-4 space-y-2">
            {progressStats.documentsExpired > 0 && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span>{progressStats.documentsExpired} expired document(s)</span>
              </div>
            )}
            {progressStats.documentsExpiring > 0 && (
              <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>{progressStats.documentsExpiring} document(s) expiring soon</span>
              </div>
            )}
          </div>
        )}

        {/* Completion Estimate */}
        {completionDays && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimated completion:</span>
            <span className={`font-medium ${
              completionDays.overdue ? 'text-red-600' :
              completionDays.today ? 'text-orange-600' :
              'text-gray-900'
            }`}>
              {completionDays.overdue ? `${completionDays.days} days overdue` :
               completionDays.today ? 'Due today' :
               `${completionDays.days} days remaining`}
            </span>
          </div>
        )}

        {/* Stage Details */}
        {showStages && progress.stages && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Onboarding Stages</h4>
            <div className="space-y-2">
              {progress.stages.slice(0, 3).map((stage) => (
                <div key={stage.id} className="flex items-center space-x-3">
                  {stage.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={`text-sm ${
                    stage.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {stage.name}
                  </span>
                  {stage.required && !stage.completed && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </div>
              ))}
              {progress.stages.length > 3 && (
                <div className="text-xs text-gray-500 ml-7">
                  +{progress.stages.length - 3} more stages
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Activity */}
        {progress.lastActivity && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last activity:</span>
              <span>{new Date(progress.lastActivity).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingProgressCard;