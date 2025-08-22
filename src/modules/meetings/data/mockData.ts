import type { Meeting, UpcomingMeeting } from '../types/meeting.types';

export const mockMeetings: Meeting[] = [
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
        completed: false,
        meetingId: 'MTG001'
      },
      {
        id: 'AI002',
        task: 'Review design mockups',
        assignee: 'Mike Johnson',
        dueDate: new Date('2024-01-23'),
        completed: false,
        meetingId: 'MTG001'
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

export const mockUpcoming: UpcomingMeeting[] = [
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