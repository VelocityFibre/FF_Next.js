import { MapPin, Camera, Upload, BarChart3, CheckCircle, AlertTriangle, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function PoleTrackerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'desktop', label: 'Desktop View' },
    { id: 'mobile', label: 'Mobile Operations' },
    { id: 'reports', label: 'Reports' },
  ];

  const cards = [
    {
      title: 'Add New Pole',
      description: 'Register a new pole installation',
      icon: Plus,
      color: 'bg-blue-500',
      onClick: () => navigate('/app/pole-tracker/new'),
    },
    {
      title: 'Pole Map',
      description: 'View all poles on map',
      icon: MapPin,
      color: 'bg-green-500',
      onClick: () => navigate('/app/pole-tracker/map'),
    },
    {
      title: 'Photo Capture',
      description: 'Upload pole installation photos',
      icon: Camera,
      color: 'bg-purple-500',
      onClick: () => navigate('/app/pole-tracker/photos'),
    },
    {
      title: 'Quality Checks',
      description: 'Manage quality validations',
      icon: CheckCircle,
      color: 'bg-orange-500',
      onClick: () => navigate('/app/pole-tracker/quality'),
    },
    {
      title: 'Import/Export',
      description: 'Bulk data operations',
      icon: Upload,
      color: 'bg-indigo-500',
      onClick: () => navigate('/app/pole-tracker/import-export'),
    },
    {
      title: 'Analytics',
      description: 'Pole installation metrics',
      icon: BarChart3,
      color: 'bg-pink-500',
      onClick: () => navigate('/app/pole-tracker/analytics'),
    },
  ];

  const stats = [
    { label: 'Total Poles', value: 0, icon: MapPin, color: 'text-blue-600' },
    { label: 'Installed Today', value: 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending QC', value: 0, icon: AlertTriangle, color: 'text-yellow-600' },
    { label: 'Active Teams', value: 0, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pole Tracker</h1>
        <p className="text-gray-600 mt-1">Manage pole installations and track progress</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
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
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notices */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">Data Integrity Rules</h3>
            <ul className="mt-1 text-sm text-yellow-700 space-y-1">
              <li>• Pole numbers must be globally unique</li>
              <li>• Maximum 12 drops per pole</li>
              <li>• 6 photos required for each installation</li>
              <li>• GPS coordinates mandatory for field captures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}