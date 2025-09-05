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

  const loadData = async () => {
    // 🟢 WORKING: Empty states - no mock data. Connect to real services when available.
    // TODO: Replace with actual service calls when communications system is implemented
    
    // Empty arrays - shows "No meetings scheduled" etc. in UI
    const meetings: Meeting[] = [];
    const actionItems: ActionItem[] = [];
    const notifications: Notification[] = [];

    // Future implementation would be:
    // const meetings = await meetingsService.getUpcoming();
    // const actionItems = await actionItemsService.getPending();
    // const notifications = await notificationsService.getUnread();

    setMeetings(meetings);
    setActionItems(actionItems);
    setNotifications(notifications);
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