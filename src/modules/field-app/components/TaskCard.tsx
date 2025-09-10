import { 
  Clock, Wrench, CheckCircle, MapPin, 
  AlertTriangle, ChevronRight, Paperclip 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { FieldTask } from '../types/field-app.types';

interface TaskCardProps {
  task: FieldTask;
  onSelect: (task: FieldTask) => void;
}

export function TaskCard({ task, onSelect }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'installation': return <Wrench className="w-4 h-4" />;
      case 'maintenance': return <Clock className="w-4 h-4" />;
      case 'inspection': return <CheckCircle className="w-4 h-4" />;
      case 'repair': return <AlertTriangle className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow",
        task.offline && "border-orange-300 bg-orange-50"
      )}
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getTaskIcon(task.type)}
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", getStatusColor(task.status))}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{task.customer}</p>

      <div className="flex items-center text-xs text-gray-500 mb-2">
        <MapPin className="w-3 h-3 mr-1" />
        {task.address}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          {task.scheduledTime} ({task.estimatedDuration})
        </span>
        <div className="flex items-center space-x-2">
          {task.attachments > 0 && (
            <div className="flex items-center text-gray-500">
              <Paperclip className="w-3 h-3 mr-1" />
              {task.attachments}
            </div>
          )}
          <span className={cn("font-medium", getPriorityColor(task.priority))}>
            {task.priority}
          </span>
        </div>
      </div>

      {task.offline && (
        <div className="mt-2 text-xs text-orange-600 font-medium">
          Offline Mode
        </div>
      )}
    </div>
  );
}