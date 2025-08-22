import { useState, useEffect } from 'react';
import { 
  Calendar, Users, Clock, FileText, Plus, Video, MapPin, 
  ChevronRight, User, Link, CheckCircle, X, Edit, Trash2
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

interface Meeting {
  id: string;
  title: string;
  type: 'team' | 'client' | 'board' | 'standup' | 'review';
  date: Date;
  time: string;
  duration: string;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  organizer: string;
  participants: string[];
  agenda: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  actionItems: ActionItem[];
}

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  type: string;
  participants: number;
}

export function MeetingsDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [, setShowNewMeetingModal] = useState(false); // showNewMeetingModal reserved for modal implementation
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = () => {
    // Mock data
    const mockMeetings: Meeting[] = [
      {
        id: 'MTG001',
        title: 'Weekly Sprint Planning',
        type: 'team',
        date: new Date('2024-01-22'),
        time: '09:00',
        duration: '1 hour',
        location: 'Conference Room A',
        isVirtual: false,
        organizer: 'John Smith',
        participants: ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams'],
        agenda: ['Sprint Review', 'Task Allocation', 'Blockers Discussion', 'Next Steps'],
        status: 'scheduled',
        actionItems: [
          {
            id: 'AI001',
            task: 'Update project timeline',
            assignee: 'Jane Doe',
            dueDate: new Date('2024-01-24'),
            status: 'pending'
          },
          {
            id: 'AI002',
            task: 'Review design mockups',
            assignee: 'Mike Johnson',
            dueDate: new Date('2024-01-23'),
            status: 'in_progress'
          }
        ]
      },
      {
        id: 'MTG002',
        title: 'Client Review - Stellenbosch Project',
        type: 'client',
        date: new Date('2024-01-22'),
        time: '14:00',
        duration: '2 hours',
        location: 'Virtual',
        isVirtual: true,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        organizer: 'Sarah Williams',
        participants: ['Sarah Williams', 'Client Rep 1', 'Client Rep 2', 'John Smith'],
        agenda: ['Project Status', 'Budget Review', 'Timeline Discussion', 'Q&A'],
        status: 'scheduled',
        actionItems: []
      },
      {
        id: 'MTG003',
        title: 'Daily Standup',
        type: 'standup',
        date: new Date('2024-01-22'),
        time: '08:30',
        duration: '15 min',
        location: 'Virtual',
        isVirtual: true,
        meetingLink: 'https://teams.microsoft.com/meet/123',
        organizer: 'Team Lead',
        participants: ['All Team Members'],
        agenda: ['Yesterday\'s progress', 'Today\'s plan', 'Blockers'],
        status: 'completed',
        notes: 'Team on track. No major blockers.',
        actionItems: []
      }
    ];

    const mockUpcoming: UpcomingMeeting[] = [
      {
        id: 'UP001',
        title: 'Sprint Planning',
        time: '09:00',
        type: 'team',
        participants: 4
      },
      {
        id: 'UP002',
        title: 'Client Review',
        time: '14:00',
        type: 'client',
        participants: 6
      },
      {
        id: 'UP003',
        title: 'Technical Discussion',
        time: '16:00',
        type: 'team',
        participants: 3
      }
    ];

    setMeetings(mockMeetings);
    setUpcomingMeetings(mockUpcoming);
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      case 'board': return 'bg-purple-100 text-purple-800';
      case 'standup': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 'upcoming') return meeting.status === 'scheduled';
    if (activeTab === 'past') return meeting.status === 'completed';
    if (activeTab === 'cancelled') return meeting.status === 'cancelled';
    return true;
  });

  const stats = {
    todayMeetings: meetings.filter(m => m.status === 'scheduled').length,
    weekMeetings: meetings.filter(m => m.status === 'scheduled').length * 3, // Mock
    actionItems: meetings.reduce((sum, m) => sum + m.actionItems.filter(a => a.status !== 'completed').length, 0),
    totalHours: meetings.reduce((sum, m) => {
      const hours = parseInt(m.duration) || 0;
      return sum + hours;
    }, 0)
  };

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Meetings Management"
        subtitle="Schedule, manage and track all meetings"
        actions={[
          {
            label: 'Schedule Meeting',
            icon: Plus,
            onClick: () => setShowNewMeetingModal(true),
            variant: 'primary'
          }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Meetings</p>
                <p className="text-2xl font-bold">{stats.todayMeetings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{stats.weekMeetings}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Action Items</p>
                <p className="text-2xl font-bold">{stats.actionItems}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="ff-card mb-6">
            <div className="border-b">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {['upcoming', 'past', 'cancelled', 'all'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Meetings List */}
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="ff-card hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{meeting.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getMeetingTypeColor(meeting.type)}`}>
                          {meeting.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{meeting.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{meeting.time} ({meeting.duration})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {meeting.isVirtual ? (
                            <>
                              <Video className="w-4 h-4" />
                              <span>Virtual Meeting</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>{meeting.location}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{meeting.participants.length} participants</span>
                        </div>
                      </div>

                      {/* Agenda Preview */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Agenda:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {meeting.agenda.slice(0, 2).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                          {meeting.agenda.length > 2 && (
                            <li className="text-gray-500 italic">+{meeting.agenda.length - 2} more items</li>
                          )}
                        </ul>
                      </div>

                      {/* Action Items */}
                      {meeting.actionItems.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">
                            {meeting.actionItems.filter(a => a.status === 'completed').length}/{meeting.actionItems.length} action items completed
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {meeting.isVirtual && meeting.meetingLink && (
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Link className="w-4 h-4 text-blue-500" />
                        </button>
                      )}
                      <button 
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowMeetingModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="ff-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Today's Schedule
              </h3>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{meeting.title}</p>
                      <p className="text-xs text-gray-600">{meeting.time} • {meeting.participants} participants</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getMeetingTypeColor(meeting.type)}`}>
                      {meeting.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ff-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center gap-3">
                  <Plus className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Schedule Meeting</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center gap-3">
                  <Video className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Start Instant Meeting</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">View Calendar</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Meeting Templates</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Action Items */}
          <div className="ff-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Action Items</h3>
              <div className="space-y-3">
                {meetings.flatMap(m => m.actionItems).slice(0, 3).map((item) => (
                  <div key={item.id} className="border-l-2 border-blue-500 pl-3">
                    <p className="text-sm font-medium">{item.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{item.assignee}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">Due {item.dueDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Detail Modal */}
      {showMeetingModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedMeeting.title}</h2>
              <button 
                onClick={() => setShowMeetingModal(false)}
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
                      <span>{selectedMeeting.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{selectedMeeting.time} ({selectedMeeting.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedMeeting.isVirtual ? (
                        <>
                          <Video className="w-4 h-4 text-gray-400" />
                          <a href={selectedMeeting.meetingLink} className="text-blue-500 hover:underline">
                            Join Meeting
                          </a>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{selectedMeeting.location}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Organized by {selectedMeeting.organizer}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Participants ({selectedMeeting.participants.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.participants.map((participant, index) => (
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
                  {selectedMeeting.agenda.map((item, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="font-medium">{index + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action Items */}
              {selectedMeeting.actionItems.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Action Items</h3>
                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={item.status === 'completed'} readOnly />
                          <div>
                            <p className="text-sm font-medium">{item.task}</p>
                            <p className="text-xs text-gray-600">
                              Assigned to {item.assignee} • Due {item.dueDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedMeeting.notes && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Meeting Notes</h3>
                  <p className="text-sm text-gray-600">{selectedMeeting.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3 justify-end">
              <button 
                className="ff-button ff-button-secondary"
                onClick={() => setShowMeetingModal(false)}
              >
                Close
              </button>
              <button className="ff-button ff-button-primary">
                Edit Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}