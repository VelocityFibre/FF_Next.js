import { MapPin, Camera, Upload, BarChart3, CheckCircle, AlertTriangle, Users, Plus, UtilityPole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { StatCard } from '../../../components/dashboard/StatCard';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';

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
      color: '#3b82f6',
      onClick: () => navigate('/app/pole-tracker/new'),
    },
    {
      title: 'Pole Map',
      description: 'View all poles on map',
      icon: MapPin,
      color: '#10b981',
      onClick: () => navigate('/app/pole-tracker/map'),
    },
    {
      title: 'Photo Capture',
      description: 'Upload pole installation photos',
      icon: Camera,
      color: '#8b5cf6',
      onClick: () => navigate('/app/pole-tracker/photos'),
    },
    {
      title: 'Quality Checks',
      description: 'Manage quality validations',
      icon: CheckCircle,
      color: '#f59e0b',
      onClick: () => navigate('/app/pole-tracker/quality'),
    },
    {
      title: 'Import/Export',
      description: 'Bulk data operations',
      icon: Upload,
      color: '#6366f1',
      onClick: () => navigate('/app/pole-tracker/import-export'),
    },
    {
      title: 'Analytics',
      description: 'Pole installation metrics',
      icon: BarChart3,
      color: '#ec4899',
      onClick: () => navigate('/app/pole-tracker/analytics'),
    },
  ];

  const stats = [
    { 
      title: 'Total Poles', 
      subtitle: 'All poles in system',
      value: 4, 
      subValue: 'Total Poles',
      icon: UtilityPole, 
      color: '#2563eb',
      route: '/app/pole-tracker/list'
    },
    { 
      title: 'Installed Today', 
      subtitle: 'Completed installations',
      value: 2, 
      subValue: 'Today',
      icon: CheckCircle, 
      color: '#059669',
      route: '/app/pole-tracker/list?filter=today'
    },
    { 
      title: 'Pending QC', 
      subtitle: 'Quality checks needed',
      value: 1, 
      subValue: 'Pending',
      icon: AlertTriangle, 
      color: '#d97706',
      route: '/app/pole-tracker/quality'
    },
    { 
      title: 'Active Teams', 
      subtitle: 'Field teams working',
      value: 3, 
      subValue: 'Teams',
      icon: Users, 
      color: '#7c3aed',
      route: '/app/staff'
    },
  ];

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Pole Tracker"
        subtitle="Manage pole installations and track progress"
        actions={[
          {
            label: 'Add New Pole',
            icon: Plus as React.ComponentType<{ className?: string; }>,
            onClick: () => navigate('/app/pole-tracker/new'),
            variant: 'primary'
          },
          {
            label: 'Import Poles',
            icon: Upload as React.ComponentType<{ className?: string; }>,
            onClick: () => navigate('/app/pole-tracker/import'),
            variant: 'secondary'
          }
        ]}
      />

      {/* Tabs */}
      <div className="ff-tabs-container">
        <nav className="ff-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ff-tab ${activeTab === tab.id ? 'ff-tab-active' : 'ff-tab-inactive'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Stats */}
      <div className="ff-stats-grid">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            subtitle={stat.subtitle}
            value={stat.value}
            subValue={stat.subValue}
            icon={stat.icon}
            color={stat.color}
            route={stat.route}
            onClick={() => stat.route && navigate(stat.route)}
          />
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="ff-dashboard-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className="ff-action-card"
          >
            <div className="ff-action-card-content">
              <div className="ff-action-card-icon" style={{ backgroundColor: card.color }}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ff-action-card-info">
                <h3 className="ff-action-card-title">
                  {card.title}
                </h3>
                <p className="ff-action-card-description">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notices */}
      <div className="ff-alert ff-alert-warning">
        <div className="ff-alert-content">
          <AlertTriangle className="ff-alert-icon" />
          <div>
            <h3 className="ff-alert-title">Data Integrity Rules</h3>
            <ul className="ff-alert-list">
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