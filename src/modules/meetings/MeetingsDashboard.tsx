import { Calendar, Users, Clock, FileText, Plus, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MeetingsDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Schedule Meeting',
      description: 'Create and schedule new meetings',
      icon: Plus,
      color: 'bg-blue-500',
      onClick: () => navigate('/app/meetings/new'),
    },
    {
      title: 'Meeting Calendar',
      description: 'View all scheduled meetings',
      icon: Calendar,
      color: 'bg-green-500',
      onClick: () => navigate('/app/meetings/calendar'),
    },
    {
      title: 'Meeting History',
      description: 'Access past meetings and notes',
      icon: Clock,
      color: 'bg-purple-500',
      onClick: () => navigate('/app/meetings/history'),
    },
    {
      title: 'Action Items',
      description: 'Track action items from meetings',
      icon: FileText,
      color: 'bg-orange-500',
      onClick: () => navigate('/app/meetings/actions'),
    },
    {
      title: 'Participants',
      description: 'Manage meeting participants',
      icon: Users,
      color: 'bg-pink-500',
      onClick: () => navigate('/app/meetings/participants'),
    },
    {
      title: 'Recordings',
      description: 'Access meeting recordings',
      icon: Video,
      color: 'bg-indigo-500',
      onClick: () => navigate('/app/meetings/recordings'),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meetings Management</h1>
        <p className="text-gray-600 mt-1">Schedule, manage and track all meetings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Meetings */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Meetings</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <p className="text-gray-500 text-center">No recent meetings</p>
          </div>
        </div>
      </div>
    </div>
  );
}