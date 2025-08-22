import { X, Calendar, Clock, Video, MapPin, User } from 'lucide-react';
import type { Meeting } from '../types/meeting.types';

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingDetailModal({ meeting, isOpen, onClose }: MeetingDetailModalProps) {
  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{meeting.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Meeting Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-3">Meeting Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{meeting.date.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{meeting.time} ({meeting.duration})</span>
                </div>
                <div className="flex items-center gap-2">
                  {meeting.isVirtual ? (
                    <>
                      <Video className="w-4 h-4 text-gray-400" />
                      <a href={meeting.meetingLink} className="text-blue-500 hover:underline">
                        Join Meeting
                      </a>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{meeting.location}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Organized by {meeting.organizer}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Participants ({meeting.participants.length})</h3>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((participant, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {participant}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Agenda</h3>
            <ol className="space-y-2">
              {meeting.agenda.map((item, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="font-medium">{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Items */}
          {meeting.actionItems.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Action Items</h3>
              <div className="space-y-2">
                {meeting.actionItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={item.completed} readOnly />
                      <div>
                        <p className="text-sm font-medium">{item.task}</p>
                        <p className="text-xs text-gray-600">
                          Assigned to {item.assignee} • Due {item.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.completed ? 'completed' : 'pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {meeting.notes && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Meeting Notes</h3>
              <p className="text-sm text-gray-600">{meeting.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3 justify-end">
          <button 
            className="ff-button ff-button-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button className="ff-button ff-button-primary">
            Edit Meeting
          </button>
        </div>
      </div>
    </div>
  );
}