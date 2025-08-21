import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { Project } from '../../types/project.types';
import { cn } from '@/utils/cn';

interface ProjectProgressProps {
  project: Project;
}

export function ProjectProgress({ project }: ProjectProgressProps) {
  const progressData = [
    { label: 'Planned Progress', value: project.plannedProgress || 0, color: 'bg-neutral-400' },
    { label: 'Actual Progress', value: project.actualProgress || 0, color: 'bg-primary-600' },
  ];

  const kpis = [
    {
      label: 'Schedule Performance',
      value: project.schedulePerformance || 1,
      target: 1,
      format: (v: number) => `${(v * 100).toFixed(0)}%`,
      status: project.schedulePerformance ? (project.schedulePerformance >= 0.95 ? 'good' : project.schedulePerformance >= 0.85 ? 'warning' : 'critical') : 'neutral',
    },
    {
      label: 'Cost Performance',
      value: project.costPerformance || 1,
      target: 1,
      format: (v: number) => `${(v * 100).toFixed(0)}%`,
      status: project.costPerformance ? (project.costPerformance >= 0.95 ? 'good' : project.costPerformance >= 0.85 ? 'warning' : 'critical') : 'neutral',
    },
    {
      label: 'Quality Score',
      value: project.qualityScore || 100,
      target: 90,
      format: (v: number) => `${v.toFixed(0)}%`,
      status: project.qualityScore ? (project.qualityScore >= 90 ? 'good' : project.qualityScore >= 75 ? 'warning' : 'critical') : 'neutral',
    },
  ];

  const statusColors: Record<string, string> = {
    good: 'text-success-600 bg-success-100',
    warning: 'text-warning-600 bg-warning-100',
    critical: 'text-error-600 bg-error-100',
    neutral: 'text-neutral-600 bg-neutral-100',
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Progress Overview</h3>
          <BarChart3 className="h-5 w-5 text-neutral-400" />
        </div>
        
        <div className="space-y-4">
          {progressData.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                <span className="text-sm font-semibold text-neutral-900">{item.value}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div
                  className={cn('h-3 rounded-full transition-all', item.color)}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {project.actualProgress && project.plannedProgress && (
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-2">
              {project.actualProgress >= project.plannedProgress ? (
                <>
                  <TrendingUp className="h-4 w-4 text-success-600" />
                  <span className="text-sm text-success-600 font-medium">On track</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-warning-600" />
                  <span className="text-sm text-warning-600 font-medium">
                    Behind schedule by {project.plannedProgress - project.actualProgress}%
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">{kpi.label}</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  statusColors[kpi.status]
                )}>
                  {kpi.status === 'good' ? 'Good' :
                   kpi.status === 'warning' ? 'Warning' :
                   kpi.status === 'critical' ? 'Critical' : 'N/A'}
                </span>
              </div>
              <p className="text-2xl font-semibold text-neutral-900">
                {kpi.format(kpi.value)}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                Target: {kpi.format(kpi.target)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Updates */}
      {project.updates && project.updates.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Updates</h3>
          <div className="space-y-3">
            {project.updates.slice(0, 5).map((update, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-neutral-100 last:border-0">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-900">{update.message}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {update.author} • {update.date ? new Date(update.date).toLocaleDateString() : 'No date'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}