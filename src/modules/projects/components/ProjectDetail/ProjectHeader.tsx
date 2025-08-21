import { 
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectStatus, ProjectPriority, Project } from '../../types/project.types';
import { cn } from '@/utils/cn';
import { Permission } from '@/types/auth.types';

interface ProjectHeaderProps {
  project: Project;
  hasPermission: (permission: Permission) => boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const statusConfig = {
  [ProjectStatus.PLANNING]: {
    label: 'Planning',
    color: 'bg-info-100 text-info-800 border-info-200',
    dot: 'bg-info-500',
  },
  [ProjectStatus.ACTIVE]: {
    label: 'Active',
    color: 'bg-success-100 text-success-800 border-success-200',
    dot: 'bg-success-500',
  },
  [ProjectStatus.ON_HOLD]: {
    label: 'On Hold',
    color: 'bg-warning-100 text-warning-800 border-warning-200',
    dot: 'bg-warning-500',
  },
  [ProjectStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    dot: 'bg-neutral-500',
  },
  [ProjectStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-error-100 text-error-800 border-error-200',
    dot: 'bg-error-500',
  },
};

const priorityIcons = {
  [ProjectPriority.LOW]: null,
  [ProjectPriority.MEDIUM]: null,
  [ProjectPriority.HIGH]: AlertCircle,
  [ProjectPriority.CRITICAL]: AlertCircle,
};

export function ProjectHeader({ project, hasPermission, onEdit, onDelete }: ProjectHeaderProps) {
  const navigate = useNavigate();
  const status = statusConfig[project.status];
  const PriorityIcon = priorityIcons[project.priority];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/app/projects')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {project.name}
            </h1>
            <p className="text-neutral-600 mt-1">{project.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5',
            status.color
          )}>
            <span className={cn('w-2 h-2 rounded-full', status.dot)} />
            {status.label}
          </div>
          
          {PriorityIcon && (
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5',
              project.priority === ProjectPriority.CRITICAL 
                ? 'bg-error-100 text-error-800 border-error-200'
                : 'bg-warning-100 text-warning-800 border-warning-200'
            )}>
              <PriorityIcon className="h-3.5 w-3.5" />
              {project.priority}
            </div>
          )}
          
          {hasPermission(Permission.PROJECTS_UPDATE) && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Edit className="h-5 w-5 text-neutral-600" />
            </button>
          )}
          
          {hasPermission(Permission.PROJECTS_DELETE) && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-error-50 text-neutral-600 hover:text-error-600 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          
          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5 text-neutral-600" />
          </button>
        </div>
      </div>
    </div>
  );
}