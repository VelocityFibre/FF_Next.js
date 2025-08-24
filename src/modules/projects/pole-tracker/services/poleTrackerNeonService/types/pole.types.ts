export interface NeonPole {
  id?: number;
  pole_number: string;
  project_id: string;
  project_code?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  phase?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'issue';
  drop_count?: number;
  max_drops?: number;
  installation_date?: Date | null;
  
  // Photo URLs stored in Firebase Storage
  photo_before?: string | null;
  photo_during?: string | null;
  photo_after?: string | null;
  photo_label?: string | null;
  photo_cable?: string | null;
  photo_quality?: string | null;
  
  // Quality checks
  quality_pole_condition?: boolean | null;
  quality_cable_routing?: boolean | null;
  quality_connector?: boolean | null;
  quality_labeling?: boolean | null;
  quality_grounding?: boolean | null;
  quality_height?: boolean | null;
  quality_tension?: boolean | null;
  quality_documentation?: boolean | null;
  
  // Metadata
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  sync_status?: 'synced' | 'pending' | 'error';
  last_sync?: Date;
}

export interface PoleFilters {
  projectId?: string;
  status?: string;
  phase?: string;
  search?: string;
}

export type PhotoType = 'before' | 'during' | 'after' | 'label' | 'cable' | 'quality';

export interface ProjectStatistics {
  total_poles: number;
  completed_poles: number;
  in_progress_poles: number;
  pending_poles: number;
  issue_poles: number;
  average_quality_score: number;
}