import type { Meeting, UpcomingMeeting } from '../types/meeting.types';

// 🟢 WORKING: Empty states - no mock data. Connect to real meetings service when available.
// TODO: Replace with actual service calls when meetings system is implemented

// Empty arrays - shows "No meetings scheduled" etc. in UI
export const mockMeetings: Meeting[] = [];

export const mockUpcoming: UpcomingMeeting[] = [];

// Future implementation would load data from:
// - meetingsService.getScheduledMeetings()
// - meetingsService.getUpcomingMeetings()
// - Sync with calendar systems (Google Calendar, Outlook, etc.)