import { Search, Grid, List } from 'lucide-react';
import type { PoleFilters, ViewMode } from '../types/poleTracker.types';

interface PoleTrackerFiltersProps {
  filters: PoleFilters;
  viewMode: ViewMode;
  onFiltersChange: (filters: Partial<PoleFilters>) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function PoleTrackerFilters({ 
  filters, 
  viewMode, 
  onFiltersChange, 
  onViewModeChange 
}: PoleTrackerFiltersProps) {
  return (
    <div className="ff-filter-panel">
      <div className="ff-filter-grid">
        <div className="ff-form-group">
          <label className="ff-form-label">Search</label>
          <div className="ff-input-group">
            <Search className="ff-input-icon" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
              placeholder="Pole number, VF ID..."
              className="ff-input ff-input-with-icon"
            />
          </div>
        </div>
        
        <div className="ff-form-group">
          <label className="ff-form-label">Status</label>
          <select
            value={filters.selectedStatus}
            onChange={(e) => onFiltersChange({ selectedStatus: e.target.value })}
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
            value={filters.selectedPhase}
            onChange={(e) => onFiltersChange({ selectedPhase: e.target.value })}
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
              onClick={() => onViewModeChange('list')}
              className={`ff-button ff-button-sm ${viewMode === 'list' ? 'ff-button-primary' : 'ff-button-secondary'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onViewModeChange('grid')}
              className={`ff-button ff-button-sm ${viewMode === 'grid' ? 'ff-button-primary' : 'ff-button-secondary'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}