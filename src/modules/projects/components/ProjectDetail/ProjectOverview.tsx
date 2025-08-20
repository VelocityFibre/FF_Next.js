import { 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Project } from '../../types/project.types';
import { cn } from '@/utils/cn';

interface ProjectOverviewProps {
  project: Project;
  daysRemaining: number;
}

export function ProjectOverview({ project, daysRemaining }: ProjectOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const progressPercentage = project.actualProgress || 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info-100 rounded-lg">
              <Calendar className="h-5 w-5 text-info-600" />
            </div>
            <span className="text-sm text-neutral-600">Duration</span>
          </div>
          <p className="text-xl font-semibold text-neutral-900">
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Completed'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-success-600" />
            </div>
            <span className="text-sm text-neutral-600">Budget</span>
          </div>
          <p className="text-xl font-semibold text-neutral-900">
            {project.budget ? formatCurrency(project.budget) : 'Not set'}
          </p>
          {project.actualCost && (
            <p className="text-sm text-neutral-600 mt-1">
              Spent: {formatCurrency(project.actualCost)}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="h-5 w-5 text-warning-600" />
            </div>
            <span className="text-sm text-neutral-600">Progress</span>
          </div>
          <p className="text-xl font-semibold text-neutral-900">
            {progressPercentage}%
          </p>
          <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all',
                progressPercentage < 30 ? 'bg-error-500' :
                progressPercentage < 70 ? 'bg-warning-500' : 'bg-success-500'
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-sm text-neutral-600">Team Size</span>
          </div>
          <p className="text-xl font-semibold text-neutral-900">
            {project.teamMembers?.length || 0} members
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            {project.projectManager ? `PM: ${project.projectManager}` : 'No PM assigned'}
          </p>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-600">Client</label>
                <p className="text-neutral-900 font-medium">{project.clientName || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm text-neutral-600">Location</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <p className="text-neutral-900">{project.location || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-600">Phase</label>
                <p className="text-neutral-900">{project.phase || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-neutral-600">Milestones</label>
              <div className="space-y-2 mt-2">
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className={cn(
                        'h-4 w-4',
                        milestone.completed ? 'text-success-600' : 'text-neutral-400'
                      )} />
                      <span className={cn(
                        'text-sm',
                        milestone.completed ? 'text-neutral-900' : 'text-neutral-600'
                      )}>
                        {milestone.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-600">No milestones defined</p>
                )}
              </div>
            </div>
            
            {project.risks && project.risks.length > 0 && (
              <div>
                <label className="text-sm text-neutral-600">Risks</label>
                <div className="space-y-1 mt-2">
                  {project.risks.map((risk, index) => (
                    <div key={index} className="text-sm text-neutral-900">
                      • {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}