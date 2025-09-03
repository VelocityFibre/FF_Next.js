import { Activity, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { ProjectMetrics } from '../types/analytics.types';

interface ProjectStatusViewProps {
  projectMetrics: ProjectMetrics[];
  getStatusColor: (status: string) => string;
}

export function ProjectStatusView({ projectMetrics, getStatusColor }: ProjectStatusViewProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <ArrowRight className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="ff-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Project Status</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {projectMetrics.map((project, index) => (
            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{project.projectName}</h4>
                <div className="flex items-center gap-2">
                  {getTrendIcon(project.trend)}
                  <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">{project.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        project.completion >= 80 ? 'bg-green-500' :
                        project.completion >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Poles: </span>
                    <span className="font-medium">
                      {project.polesCompleted}/{project.totalPoles}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Drops: </span>
                    <span className="font-medium">
                      {project.dropsCompleted}/{project.totalDrops}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}