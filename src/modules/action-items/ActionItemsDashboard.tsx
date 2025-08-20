import { CheckCircle, Clock, AlertCircle, Calendar, Users, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ActionItemsDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Pending Actions',
      description: 'View all pending action items',
      icon: Clock,
      color: 'bg-yellow-500',
      count: 12,
      onClick: () => navigate('/app/action-items/pending'),
    },
    {
      title: 'Completed Actions',
      description: 'Review completed action items',
      icon: CheckCircle,
      color: 'bg-green-500',
      count: 45,
      onClick: () => navigate('/app/action-items/completed'),
    },
    {
      title: 'Overdue Actions',
      description: 'Urgent overdue action items',
      icon: AlertCircle,
      color: 'bg-red-500',
      count: 3,
      onClick: () => navigate('/app/action-items/overdue'),
    },
    {
      title: 'By Meeting',
      description: 'Actions grouped by meetings',
      icon: Calendar,
      color: 'bg-blue-500',
      onClick: () => navigate('/app/action-items/by-meeting'),
    },
    {
      title: 'By Assignee',
      description: 'Actions grouped by person',
      icon: Users,
      color: 'bg-purple-500',
      onClick: () => navigate('/app/action-items/by-assignee'),
    },
    {
      title: 'Filter & Search',
      description: 'Advanced filtering options',
      icon: Filter,
      color: 'bg-indigo-500',
      onClick: () => navigate('/app/action-items/search'),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Action Items</h1>
        <p className="text-gray-600 mt-1">Track and manage action items from meetings</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Actions</p>
              <p className="text-2xl font-bold text-gray-900">60</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">12</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">45</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
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
                  {card.count !== undefined && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({card.count})
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}