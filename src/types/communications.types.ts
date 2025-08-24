/**
 * Communications Module Type Definitions
 * All types for meetings, action items, notifications
 */

export interface Meeting {
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

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  meetingId?: string;
}

export interface Notification {
  id: string;
  type: 'meeting' | 'action' | 'deadline' | 'update' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface CommunicationsStats {
  upcomingMeetings: number;
  pendingActions: number;
  unreadNotifications: number;
  overdueItems: number;
}

export interface CommunicationsData {
  meetings: Meeting[];
  actionItems: ActionItem[];
  notifications: Notification[];
}

export type CommunicationsTab = 0 | 1 | 2 | 3;

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending' | 'overdue';