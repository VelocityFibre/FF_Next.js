import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, MapPin, Camera, CheckCircle, AlertTriangle, Grid, List } from 'lucide-react';
// import { InstallationPhase } from './types/pole-tracker.types'; // Not used
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { usePoleTrackers } from './hooks/usePoleTracker';
// Using Neon for massive scale data
import { NeonPole } from './services/poleTrackerNeonService';

export function PoleTrackerList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Real data from Firebase
  const { data: poles = [], isLoading, error } = usePoleTrackers();

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'ff-badge ff-badge-success';
    if (status === 'in_progress') return 'ff-badge ff-badge-warning';
    if (status === 'pending') return 'ff-badge ff-badge-info';
    if (status === 'issue') return 'ff-badge ff-badge-error';
    return 'ff-badge ff-badge-neutral';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'completion': return 'text-green-600';
      case 'testing': return 'text-blue-600';
      case 'installation': return 'text-purple-600';
      case 'excavation': return 'text-orange-600';
      case 'permission': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'issue': return 'Issue';
      default: return status;
    }
  };

  // Filter poles based on search and filters - using Neon field names
  const filteredPoles = poles.filter((pole: NeonPole) => {
    const matchesSearch = !searchTerm || 
      pole.pole_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pole.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pole.project_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || pole.status === selectedStatus;
    const matchesPhase = selectedPhase === 'all' || pole.phase === selectedPhase;
    
    return matchesSearch && matchesStatus && matchesPhase;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="ff-page-container">
        <DashboardHeader 
          title="Pole Tracker"
          subtitle="Manage and track pole installations"
        />
        <div className="ff-data-panel">
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading poles...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="ff-page-container">
        <DashboardHeader 
          title="Pole Tracker"
          subtitle="Manage and track pole installations"
        />
        <div className="ff-data-panel">
          <div className="flex justify-center items-center py-12">
            <div className="text-red-500">Error loading poles: {error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Pole Tracker"
        subtitle="Manage and track pole installations"
        actions={[
          {
            label: 'Add Pole',
            icon: Plus,
            onClick: () => navigate('/app/pole-tracker/new'),
            variant: 'primary'
          },
          {
            label: 'Import',
            icon: Download,
            onClick: () => navigate('/app/pole-tracker/import'),
            variant: 'secondary'
          }
        ]}
      />

      {/* Filters */}
      <div className="ff-filter-panel">
        <div className="ff-filter-grid">
          <div className="ff-form-group">
            <label className="ff-form-label">Search</label>
            <div className="ff-input-group">
              <Search className="ff-input-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pole number, VF ID..."
                className="ff-input ff-input-with-icon"
              />
            </div>
          </div>
          
          <div className="ff-form-group">
            <label className="ff-form-label">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="ff-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="issue">Issue</option>
            </select>
          </div>
          
          <div className="ff-form-group">
            <label className="ff-form-label">Phase</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="ff-select"
            >
              <option value="all">All Phases</option>
              <option value="permission">Permission</option>
              <option value="excavation">Excavation</option>
              <option value="installation">Installation</option>
              <option value="testing">Testing</option>
              <option value="completion">Completion</option>
            </select>
          </div>
          
          <div className="ff-form-group">
            <label className="ff-form-label">View</label>
            <div className="ff-button-group">
              <button 
                onClick={() => setViewMode('list')}
                className={`ff-button ff-button-sm ${viewMode === 'list' ? 'ff-button-primary' : 'ff-button-secondary'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`ff-button ff-button-sm ${viewMode === 'grid' ? 'ff-button-primary' : 'ff-button-secondary'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pole List */}
      <div className="ff-data-panel">
        {viewMode === 'list' ? (
          <div className="ff-table-container">
            <table className="ff-table">
              <thead className="ff-table-header">
                <tr>
                  <th className="ff-table-th">Pole ID</th>
                  <th className="ff-table-th">Project</th>
                  <th className="ff-table-th">Location</th>
                  <th className="ff-table-th">Status</th>
                  <th className="ff-table-th">Phase</th>
                  <th className="ff-table-th">Drops</th>
                  <th className="ff-table-th">Quality</th>
                  <th className="ff-table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="ff-table-body">
                {filteredPoles.map((pole) => (
                  <tr key={pole.id} className="ff-table-row">
                    <td className="ff-table-td">
                      <div>
                        <div className="ff-table-primary">{pole.pole_number}</div>
                        <div className="ff-table-secondary">{pole.project_code || pole.project_id}</div>
                      </div>
                    </td>
                    <td className="ff-table-td">
                      <div>
                        <div className="ff-table-primary">{pole.project_id}</div>
                        <div className="ff-table-secondary">Phase {pole.phase}</div>
                      </div>
                    </td>
                    <td className="ff-table-td">
                      <div className="ff-table-location">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="ff-table-primary">{pole.location}</span>
                      </div>
                    </td>
                    <td className="ff-table-td">
                      <span className={getStatusColor(pole.status || 'pending')}>
                        {getStatusDisplayText(pole.status || 'pending')}
                      </span>
                    </td>
                    <td className="ff-table-td">
                      <span className={`ff-table-primary ${getPhaseColor(pole.phase || 'permission')}`}>
                        {pole.phase ? pole.phase.charAt(0).toUpperCase() + pole.phase.slice(1) : 'Permission'}
                      </span>
                    </td>
                    <td className="ff-table-td">
                      <div className="ff-progress-indicator">
                        <div className="ff-progress-text">
                          {pole.drop_count || 0}/{pole.max_drops || 12}
                        </div>
                        <div className="ff-progress-bar">
                          <div 
                            className="ff-progress-fill"
                            style={{ width: `${((pole.drop_count || 0) / (pole.max_drops || 12)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="ff-table-td">
                      <div className="ff-table-icons">
                        {pole.quality_pole_condition && pole.quality_cable_routing && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {(!pole.quality_pole_condition || !pole.quality_cable_routing) && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        {(pole.photo_before || pole.photo_after) && (
                          <Camera className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </td>
                    <td className="ff-table-td">
                      <button
                        onClick={() => navigate(`/app/pole-tracker/${pole.id}`)}
                        className="ff-link"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ff-grid-container">
            {filteredPoles.map((pole) => (
              <div key={pole.id} className="ff-card">
                <div className="ff-card-header">
                  <div>
                    <h3 className="ff-card-title">{pole.pole_number}</h3>
                    <p className="ff-card-subtitle">{pole.project_code || pole.project_id}</p>
                  </div>
                  <div className="ff-table-icons">
                    {pole.quality_pole_condition && pole.quality_cable_routing && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {(!pole.quality_pole_condition || !pole.quality_cable_routing) && (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    {(pole.photo_before || pole.photo_after) && (
                      <Camera className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
                
                <div className="ff-card-content">
                  <div className="ff-card-field">
                    <span className="ff-card-label">Project:</span>
                    <span className="ff-card-value">{pole.project_id}</span>
                  </div>
                  <div className="ff-card-field">
                    <span className="ff-card-label">Location:</span>
                    <span className="ff-card-value">{pole.location}</span>
                  </div>
                  <div className="ff-card-field">
                    <span className="ff-card-label">Status:</span>
                    <span className={getStatusColor(pole.status || 'pending')}>{getStatusDisplayText(pole.status || 'pending')}</span>
                  </div>
                  <div className="ff-card-field">
                    <span className="ff-card-label">Phase:</span>
                    <span className={`ff-card-value ${getPhaseColor(pole.phase || 'permission')}`}>
                      {pole.phase ? pole.phase.charAt(0).toUpperCase() + pole.phase.slice(1) : 'Permission'}
                    </span>
                  </div>
                  <div className="ff-card-field">
                    <span className="ff-card-label">Drops:</span>
                    <div className="ff-progress-indicator">
                      <span className="ff-progress-text">{pole.drop_count || 0}/{pole.max_drops || 12}</span>
                      <div className="ff-progress-bar">
                        <div 
                          className="ff-progress-fill"
                          style={{ width: `${((pole.drop_count || 0) / (pole.max_drops || 12)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ff-card-actions">
                  <button
                    onClick={() => navigate(`/app/pole-tracker/${pole.id}`)}
                    className="ff-button ff-button-primary ff-button-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="ff-pagination">
          <div className="ff-pagination-info">
            Showing {filteredPoles.length} of {poles.length} poles
          </div>
          <div className="ff-pagination-controls">
            <button className="ff-button ff-button-sm ff-button-secondary" disabled>
              Previous
            </button>
            <button className="ff-button ff-button-sm ff-button-primary">
              1
            </button>
            <button className="ff-button ff-button-sm ff-button-secondary" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}