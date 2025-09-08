import { 
  Calendar, Clock, MapPin, Video, Users, 
  CheckCircle, Edit, Trash2
} from 'lucide-react';
import { cn } from '@/src/utils/cn';
import type { Meeting } from '../types/meeting.types';

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string) => void;
  onJoin: (meeting: Meeting) => void;
}

export function MeetingCard({ meeting, onEdit, onDelete, onJoin }: MeetingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'team': return <Users className="w-4 h-4" />;
      case 'client': return <Users className="w-4 h-4" />;
      case 'board': return <Users className="w-4 h-4" />;
      case 'standup': return <Users className="w-4 h-4" />;
      case 'review': return <CheckCircle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const isToday = new Date().toDateString() === meeting.date.toDateString();
  const canJoin = meeting.status === 'scheduled' && isToday;
  const isInProgress = meeting.status === 'in_progress';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getTypeIcon(meeting.type)}
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full capitalize",
            getStatusColor(meeting.status)
          )}>
            {meeting.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(meeting)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(meeting.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="font-medium text-gray-900 mb-2">{meeting.title}</h3>
      
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{meeting.date.toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span>{meeting.time} ({meeting.duration})</span>
        </div>
        
        <div className="flex items-center">
          {meeting.isVirtual ? (
            <>
              <Video className="w-4 h-4 mr-2" />
              <span>Virtual Meeting</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              <span>{meeting.location}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          <span>{meeting.participants.length} participants</span>
        </div>
      </div>

      {meeting.agenda.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Agenda:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {meeting.agenda.slice(0, 2).map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                {item}
              </li>
            ))}
            {meeting.agenda.length > 2 && (
              <li className="text-xs text-gray-500">
                +{meeting.agenda.length - 2} more items
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Organized by {meeting.organizer}
        </div>
        
        {(canJoin || isInProgress) && meeting.isVirtual && (
          <button
            onClick={() => onJoin(meeting)}
            className={cn(
              "flex items-center px-3 py-1 rounded-md text-sm font-medium",
              isInProgress 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <Video className="w-4 h-4 mr-1" />
            {isInProgress ? 'Rejoin' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
}