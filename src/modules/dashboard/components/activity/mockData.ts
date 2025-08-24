/**
 * Mock Activity Data
 * Mock data for development and testing
 */

import { ActivityItem } from './types';

export const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'task_completed',
    user: {
      name: 'Sarah Johnson',
      role: 'Field Technician',
    },
    description: 'Completed pole installation at Strand Beach Road',
    project: 'VF Network Expansion - Phase 1',
    timestamp: '2024-08-19T14:30:00Z',
    metadata: {
      location: 'Strand Beach Road',
    },
  },
  {
    id: '2',
    type: 'project_updated',
    user: {
      name: 'Mike Peters',
      role: 'Project Manager',
    },
    description: 'Updated project timeline and resource allocation',
    project: 'Stellenbosch Fibre Rollout',
    timestamp: '2024-08-19T13:15:00Z',
    metadata: {
      progress: 67,
    },
  },
  {
    id: '3',
    type: 'staff_assigned',
    user: {
      name: 'Lisa Chen',
      role: 'Team Lead',
    },
    description: 'Assigned 3 new technicians to installation crew',
    project: 'Paarl Industrial Zone',
    timestamp: '2024-08-19T11:45:00Z',
  },
  {
    id: '4',
    type: 'issue_reported',
    user: {
      name: 'David Wilson',
      role: 'Site Supervisor',
    },
    description: 'Reported underground cable damage during excavation',
    project: 'VF Network Expansion - Phase 1',
    timestamp: '2024-08-19T10:20:00Z',
    metadata: {
      priority: 'high',
      location: 'Main Road Junction',
    },
  },
  {
    id: '5',
    type: 'milestone_reached',
    user: {
      name: 'Team Alpha',
      role: 'Installation Team',
    },
    description: 'Reached 50% completion milestone ahead of schedule',
    project: 'Stellenbosch Fibre Rollout',
    timestamp: '2024-08-19T09:00:00Z',
    metadata: {
      progress: 50,
    },
  },
];