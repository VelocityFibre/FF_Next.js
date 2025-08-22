import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, Bell, Video, Users, MoreVertical, Clock, AlertCircle, User } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

interface Meeting {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  attendees: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  agenda: string[];
  minutes?: string;
  actionItems?: ActionItem[];
}

interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  meetingId?: string;
}

interface Notification {
  id: string;
  type: 'meeting' | 'action' | 'deadline' | 'update' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const CommunicationsDashboard: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock data
    const mockMeetings: Meeting[] = [
      {
        id: 'MTG001',
        title: 'Weekly Project Review',
        date: new Date('2024-01-22'),
        time: '10:00',
        duration: '1h',
        type: 'virtual',
        attendees: ['John Smith', 'Jane Doe', 'Mike Johnson'],
        status: 'scheduled',
        agenda: ['Project updates', 'Budget review', 'Timeline discussion']
      },
      {
        id: 'MTG002',
        title: 'Contractor Onboarding',
        date: new Date('2024-01-23'),
        time: '14:00',
        duration: '2h',
        type: 'in_person',
        attendees: ['Sarah Williams', 'Tom Davis'],
        status: 'scheduled',
        agenda: ['Documentation review', 'Safety briefing', 'Contract signing']
      }
    ];

    const mockActionItems: ActionItem[] = [
      {
        id: 'ACT001',
        description: 'Review and approve SOW for Phase 2',
        assignee: 'John Smith',
        dueDate: new Date('2024-01-25'),
        status: 'pending',
        priority: 'high',
        meetingId: 'MTG001'
      },
      {
        id: 'ACT002',
        description: 'Update project timeline',
        assignee: 'Jane Doe',
        dueDate: new Date('2024-01-24'),
        status: 'in_progress',
        priority: 'medium',
        meetingId: 'MTG001'
      },
      {
        id: 'ACT003',
        description: 'Schedule equipment delivery',
        assignee: 'Mike Johnson',
        dueDate: new Date('2024-01-23'),
        status: 'completed',
        priority: 'high'
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: 'NOT001',
        type: 'meeting',
        title: 'Meeting Reminder',
        message: 'Weekly Project Review starts in 30 minutes',
        timestamp: new Date(),
        read: false,
        priority: 'high'
      },
      {
        id: 'NOT002',
        type: 'action',
        title: 'Action Item Due',
        message: 'SOW approval is due tomorrow',
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      },
      {
        id: 'NOT003',
        type: 'update',
        title: 'Project Update',
        message: 'Phase 1 has been completed successfully',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
        priority: 'low'
      }
    ];

    setMeetings(mockMeetings);
    setActionItems(mockActionItems);
    setNotifications(mockNotifications);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = ['Overview', 'Meetings', 'Action Items', 'Notifications'];

  // Calculate stats
  const stats = {
    upcomingMeetings: meetings.filter(m => m.status === 'scheduled').length,
    pendingActions: actionItems.filter(a => a.status === 'pending').length,
    unreadNotifications: notifications.filter(n => !n.read).length,
    overdueItems: actionItems.filter(a => a.status === 'overdue').length
  };

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Communications Portal"
        subtitle="Meetings, action items, and team notifications"
        actions={[
          {
            label: 'Schedule Meeting',
            icon: Calendar,
            onClick: () => {},
            variant: 'primary'
          },
          {
            label: 'Add Action Item',
            icon: Plus,
            onClick: () => {},
            variant: 'secondary'
          }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Meetings</p>
                <p className="text-2xl font-bold">{stats.upcomingMeetings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Actions</p>
                <p className="text-2xl font-bold">{stats.pendingActions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdueItems}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ff-card mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(index)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Meetings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
                <div className="space-y-3">
                  {meetings.filter(m => m.status === 'scheduled').slice(0, 3).map(meeting => (
                    <div key={meeting.id} className="ff-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{meeting.title}</h4>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {meeting.date.toLocaleDateString()}
                            <Clock className="w-4 h-4 ml-3 mr-1" />
                            {meeting.time}
                            <Users className="w-4 h-4 ml-3 mr-1" />
                            {meeting.attendees.length}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Action Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Action Items</h3>
                <div className="space-y-3">
                  {actionItems.slice(0, 3).map(item => (
                    <div key={item.id} className="ff-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            {item.assignee}
                            <Calendar className="w-4 h-4 ml-3 mr-1" />
                            {item.dueDate.toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Meetings Tab */}
          {selectedTab === 1 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meeting
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meetings.map((meeting) => (
                    <tr key={meeting.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {meeting.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {meeting.agenda.length} agenda items
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {meeting.date.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {meeting.time} ({meeting.duration})
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {meeting.type === 'virtual' ? (
                            <Video className="w-4 h-4 mr-2 text-blue-500" />
                          ) : (
                            <Users className="w-4 h-4 mr-2 text-green-500" />
                          )}
                          <span className="text-sm text-gray-900">
                            {meeting.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {meeting.attendees.slice(0, 3).map((attendee, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white">
                              {attendee.split(' ').map(n => n[0]).join('')}
                            </div>
                          ))}
                          {meeting.attendees.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                              +{meeting.attendees.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Items Tab */}
          {selectedTab === 2 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {actionItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.description}
                        </div>
                        {item.meetingId && (
                          <div className="text-sm text-gray-500">
                            From: {meetings.find(m => m.id === item.meetingId)?.title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">{item.assignee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.dueDate.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notifications Tab */}
          {selectedTab === 3 && (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div key={notification.id} className={`ff-card p-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationsDashboard;