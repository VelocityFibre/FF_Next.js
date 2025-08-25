import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { Meeting, UpcomingMeeting } from './types/meeting.types';
import { mockMeetings, mockUpcoming } from './data/mockData';
import { MeetingStatsCards } from './components/MeetingStatsCards';
import { MeetingsList } from './components/MeetingsList';
import { MeetingsSidebar } from './components/MeetingsSidebar';
import { MeetingDetailModal } from './components/MeetingDetailModal';

export function MeetingsDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [, setShowNewMeetingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = () => {
    setMeetings(mockMeetings);
    setUpcomingMeetings(mockUpcoming);
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 'upcoming') return meeting.status === 'scheduled';
    if (activeTab === 'past') return meeting.status === 'completed';
    if (activeTab === 'cancelled') return meeting.status === 'cancelled';
    return true;
  });

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  };

  const handleScheduleMeeting = () => {
    setShowNewMeetingModal(true);
  };

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Meetings Management"
        subtitle="Schedule, manage and track all meetings"
        actions={[
          {
            label: 'Schedule Meeting',
            icon: Plus as React.ComponentType<{ className?: string; }>,
            onClick: () => setShowNewMeetingModal(true),
            variant: 'primary'
          }
        ]}
      />

      <MeetingStatsCards meetings={meetings} />

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

          <MeetingsList 
            meetings={filteredMeetings} 
            onEditMeeting={handleEditMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        </div>

        <MeetingsSidebar 
          upcomingMeetings={upcomingMeetings}
          meetings={meetings}
          onScheduleMeeting={handleScheduleMeeting}
        />
      </div>

      <MeetingDetailModal 
        meeting={selectedMeeting}
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
      />
    </div>
  );
}