import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Layers,
  Activity,
  FileText
} from 'lucide-react';
import { InstallationPhase, PoleType } from './types/pole-tracker.types';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { StatCard } from '../../../components/dashboard/StatCard';

export function PoleTrackerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const pole = {
    id: '1',
    vfPoleId: 'LAW.P.A001',
    poleNumber: 'P001',
    projectName: 'Lawley Extension',
    projectCode: 'LAW001',
    contractorName: 'ABC Contractors',
    status: 'Pole Permission: Approved',
    installationPhase: InstallationPhase.INSTALLATION,
    location: 'Lawley Ext 3, Johannesburg',
    dropCount: 8,
    maxCapacity: 12,
    dateInstalled: new Date('2025-08-15'),
    hasPhotos: true,
    qualityStatus: 'pass',
    poleType: PoleType.CONCRETE,
    poleHeight: 12,
    installationDepth: 2.5,
    gpsCoordinates: {
      latitude: -26.2041,
      longitude: 28.0473,
      accuracy: 3
    },
    workingTeam: 'Team Alpha',
    ratePaid: 2500,
    estimatedCompletionDate: new Date('2025-08-20'),
    actualCompletionDate: new Date('2025-08-18'),
    createdAt: new Date('2025-08-10'),
    updatedAt: new Date('2025-08-18'),
    createdByName: 'John Smith',
    updatedByName: 'Jane Doe',
    photos: [
      { id: '1', type: 'before', url: '/placeholder.jpg', description: 'Site before installation' },
      { id: '2', type: 'front', url: '/placeholder.jpg', description: 'Front view of pole' },
      { id: '3', type: 'depth', url: '/placeholder.jpg', description: 'Installation depth measurement' },
      { id: '4', type: 'concrete', url: '/placeholder.jpg', description: 'Base foundation' },
      { id: '5', type: 'completed', url: '/placeholder.jpg', description: 'Final installation' },
      { id: '6', type: 'compaction', url: '/placeholder.jpg', description: 'Ground compaction' },
    ],
    qualityChecks: [
      { id: '1', checkType: 'depth_compliance', status: 'pass', checkedBy: 'John Smith', checkedAt: new Date('2025-08-18') },
      { id: '2', checkType: 'concrete_quality', status: 'pass', checkedBy: 'John Smith', checkedAt: new Date('2025-08-18') },
      { id: '3', checkType: 'alignment', status: 'pass', checkedBy: 'John Smith', checkedAt: new Date('2025-08-18') },
      { id: '4', checkType: 'grounding', status: 'pending', checkedBy: '', checkedAt: null },
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'quality', label: 'Quality Checks', icon: CheckCircle },
    { id: 'history', label: 'History', icon: FileText },
  ];

  const stats = [
    {
      title: 'Capacity Used',
      subtitle: 'Drops connected',
      value: `${pole.dropCount}/${pole.maxCapacity}`,
      subValue: `${Math.round((pole.dropCount / pole.maxCapacity) * 100)}%`,
      icon: Layers,
      color: '#3b82f6'
    },
    {
      title: 'Quality Status',
      subtitle: 'Checks completed',
      value: pole.qualityStatus === 'pass' ? 'PASS' : 'PENDING',
      subValue: `${pole.qualityChecks.filter(q => q.status === 'pass').length}/${pole.qualityChecks.length} checks`,
      icon: CheckCircle,
      color: pole.qualityStatus === 'pass' ? '#059669' : '#d97706'
    },
    {
      title: 'Photos',
      subtitle: 'Documentation',
      value: pole.photos.length,
      subValue: 'Photos uploaded',
      icon: Camera,
      color: '#7c3aed'
    },
    {
      title: 'Days Active',
      subtitle: 'Since installation',
      value: Math.ceil((new Date().getTime() - pole.dateInstalled.getTime()) / (1000 * 60 * 60 * 24)),
      subValue: 'Days',
      icon: Calendar,
      color: '#059669'
    }
  ];

  const renderOverview = () => (
    <div className="ff-section-grid">
      <div className="ff-info-panel">
        <h3 className="ff-panel-title">Pole Information</h3>
        <div className="ff-info-grid">
          <div className="ff-info-item">
            <span className="ff-info-label">VF Pole ID:</span>
            <span className="ff-info-value">{pole.vfPoleId}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Pole Number:</span>
            <span className="ff-info-value">{pole.poleNumber}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Type:</span>
            <span className="ff-info-value">{pole.poleType}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Height:</span>
            <span className="ff-info-value">{pole.poleHeight}m</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Installation Depth:</span>
            <span className="ff-info-value">{pole.installationDepth}m</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Working Team:</span>
            <span className="ff-info-value">{pole.workingTeam}</span>
          </div>
        </div>
      </div>

      <div className="ff-info-panel">
        <h3 className="ff-panel-title">Project Details</h3>
        <div className="ff-info-grid">
          <div className="ff-info-item">
            <span className="ff-info-label">Project:</span>
            <span className="ff-info-value">{pole.projectName}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Project Code:</span>
            <span className="ff-info-value">{pole.projectCode}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Contractor:</span>
            <span className="ff-info-value">{pole.contractorName}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Rate Paid:</span>
            <span className="ff-info-value">R{pole.ratePaid?.toLocaleString()}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Status:</span>
            <span className="ff-badge ff-badge-success">{pole.status}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Phase:</span>
            <span className="ff-badge ff-badge-info">{pole.installationPhase}</span>
          </div>
        </div>
      </div>

      <div className="ff-info-panel">
        <h3 className="ff-panel-title">Location</h3>
        <div className="ff-info-grid">
          <div className="ff-info-item ff-info-item-full">
            <span className="ff-info-label">Address:</span>
            <span className="ff-info-value">{pole.location}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Latitude:</span>
            <span className="ff-info-value">{pole.gpsCoordinates.latitude}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Longitude:</span>
            <span className="ff-info-value">{pole.gpsCoordinates.longitude}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">GPS Accuracy:</span>
            <span className="ff-info-value">{pole.gpsCoordinates.accuracy}m</span>
          </div>
        </div>
      </div>

      <div className="ff-info-panel">
        <h3 className="ff-panel-title">Timeline</h3>
        <div className="ff-info-grid">
          <div className="ff-info-item">
            <span className="ff-info-label">Created:</span>
            <span className="ff-info-value">{pole.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Created By:</span>
            <span className="ff-info-value">{pole.createdByName}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Installed:</span>
            <span className="ff-info-value">{pole.dateInstalled.toLocaleDateString()}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Completed:</span>
            <span className="ff-info-value">{pole.actualCompletionDate?.toLocaleDateString()}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Last Updated:</span>
            <span className="ff-info-value">{pole.updatedAt.toLocaleDateString()}</span>
          </div>
          <div className="ff-info-item">
            <span className="ff-info-label">Updated By:</span>
            <span className="ff-info-value">{pole.updatedByName}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhotos = () => (
    <div className="ff-photo-gallery">
      {pole.photos.map((photo) => (
        <div key={photo.id} className="ff-photo-card">
          <div className="ff-photo-placeholder">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
          <div className="ff-photo-info">
            <h4 className="ff-photo-title">{photo.type.toUpperCase()}</h4>
            <p className="ff-photo-description">{photo.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderQuality = () => (
    <div className="ff-quality-panel">
      {pole.qualityChecks.map((check) => (
        <div key={check.id} className="ff-quality-item">
          <div className="ff-quality-status">
            {check.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {check.status === 'pending' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          </div>
          <div className="ff-quality-content">
            <h4 className="ff-quality-title">{check.checkType.replace('_', ' ').toUpperCase()}</h4>
            <p className="ff-quality-meta">
              {check.checkedBy ? `Checked by ${check.checkedBy}` : 'Not checked yet'}
              {check.checkedAt && ` on ${check.checkedAt.toLocaleDateString()}`}
            </p>
          </div>
          <div className="ff-quality-badge">
            <span className={`ff-badge ${check.status === 'pass' ? 'ff-badge-success' : 'ff-badge-warning'}`}>
              {check.status.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title={`Pole ${pole.vfPoleId}`}
        subtitle={`${pole.projectName} - ${pole.location}`}
        actions={[
          {
            label: 'Back to List',
            icon: ArrowLeft,
            onClick: () => navigate('/app/pole-tracker'),
            variant: 'secondary'
          },
          {
            label: 'Edit Pole',
            icon: Edit,
            onClick: () => navigate(`/app/pole-tracker/${id}/edit`),
            variant: 'primary'
          }
        ]}
      />

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
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="ff-tabs-container">
        <nav className="ff-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ff-tab ${activeTab === tab.id ? 'ff-tab-active' : 'ff-tab-inactive'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="ff-tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'photos' && renderPhotos()}
        {activeTab === 'quality' && renderQuality()}
        {activeTab === 'history' && (
          <div className="ff-placeholder">
            <FileText className="w-12 h-12 text-gray-400" />
            <p className="text-gray-600">History tracking coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}