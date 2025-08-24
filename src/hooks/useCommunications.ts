import { useState, useEffect } from 'react';
import { 
  Meeting, 
  ActionItem, 
  Notification, 
  CommunicationsStats,
  CommunicationsData
} from '@/types/communications.types';

export function useCommunications() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock data - will be replaced with actual service calls
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

  // Utility functions - accept string to handle dynamic values
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
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

  // Calculate stats
  const stats: CommunicationsStats = {
    upcomingMeetings: meetings.filter(m => m.status === 'scheduled').length,
    pendingActions: actionItems.filter(a => a.status === 'pending').length,
    unreadNotifications: notifications.filter(n => !n.read).length,
    overdueItems: actionItems.filter(a => a.status === 'overdue').length
  };

  const data: CommunicationsData = {
    meetings,
    actionItems,
    notifications
  };

  return {
    data,
    stats,
    getPriorityColor,
    getStatusColor,
    refetch: loadData
  };
}