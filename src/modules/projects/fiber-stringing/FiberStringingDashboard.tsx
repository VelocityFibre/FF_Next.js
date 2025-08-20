import { useState, useEffect } from 'react';
import { 
  Cable,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface FiberSection {
  id: string;
  sectionName: string;
  fromPole: string;
  toPole: string;
  distance: number; // meters
  cableType: string;
  status: 'planned' | 'in_progress' | 'completed' | 'issues';
  progress: number;
  team?: string;
  startDate?: string;
  completionDate?: string;
  notes?: string;
}

interface FiberStats {
  totalDistance: number;
  completedDistance: number;
  sectionsTotal: number;
  sectionsCompleted: number;
  sectionsInProgress: number;
  sectionsWithIssues: number;
  averageSpeed: number; // meters per day
  estimatedCompletion: string;
}

export function FiberStringingDashboard() {
  const [sections, setSections] = useState<FiberSection[]>([]);
  const [stats, setStats] = useState<FiberStats>({
    totalDistance: 0,
    completedDistance: 0,
    sectionsTotal: 0,
    sectionsCompleted: 0,
    sectionsInProgress: 0,
    sectionsWithIssues: 0,
    averageSpeed: 0,
    estimatedCompletion: '',
  });
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'issues'>('all');

  useEffect(() => {
    // Load fiber sections - TODO: Replace with actual API call
    const mockSections: FiberSection[] = [
      {
        id: '1',
        sectionName: 'Section A1-A5',
        fromPole: 'P001',
        toPole: 'P005',
        distance: 500,
        cableType: '48-core SM',
        status: 'completed',
        progress: 100,
        team: 'Team Alpha',
        startDate: '2024-01-15',
        completionDate: '2024-01-16',
      },
      {
        id: '2',
        sectionName: 'Section A5-A10',
        fromPole: 'P005',
        toPole: 'P010',
        distance: 650,
        cableType: '48-core SM',
        status: 'in_progress',
        progress: 65,
        team: 'Team Beta',
        startDate: '2024-01-17',
      },
      {
        id: '3',
        sectionName: 'Section A10-A15',
        fromPole: 'P010',
        toPole: 'P015',
        distance: 480,
        cableType: '24-core SM',
        status: 'planned',
        progress: 0,
      },
      {
        id: '4',
        sectionName: 'Section B1-B5',
        fromPole: 'P020',
        toPole: 'P025',
        distance: 520,
        cableType: '48-core SM',
        status: 'issues',
        progress: 45,
        team: 'Team Gamma',
        startDate: '2024-01-16',
        notes: 'Cable damage detected at pole P023',
      },
    ];

    setSections(mockSections);
    calculateStats(mockSections);
  }, []);

  const calculateStats = (sectionData: FiberSection[]) => {
    const total = sectionData.length;
    const completed = sectionData.filter(s => s.status === 'completed').length;
    const inProgress = sectionData.filter(s => s.status === 'in_progress').length;
    const withIssues = sectionData.filter(s => s.status === 'issues').length;
    
    const totalDist = sectionData.reduce((sum, s) => sum + s.distance, 0);
    const completedDist = sectionData
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.distance, 0);
    
    // Calculate average speed based on completed sections
    const completedWithDates = sectionData.filter(
      s => s.status === 'completed' && s.startDate && s.completionDate
    );
    
    let avgSpeed = 0;
    if (completedWithDates.length > 0) {
      const totalDays = completedWithDates.reduce((sum, s) => {
        const start = new Date(s.startDate!);
        const end = new Date(s.completionDate!);
        const days = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgSpeed = completedDist / totalDays;
    }

    // Estimate completion
    const remainingDist = totalDist - completedDist;
    const daysToComplete = avgSpeed > 0 ? Math.ceil(remainingDist / avgSpeed) : 0;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysToComplete);

    setStats({
      totalDistance: totalDist,
      completedDistance: completedDist,
      sectionsTotal: total,
      sectionsCompleted: completed,
      sectionsInProgress: inProgress,
      sectionsWithIssues: withIssues,
      averageSpeed: avgSpeed,
      estimatedCompletion: estimatedDate.toLocaleDateString(),
    });
  };

  const filteredSections = sections.filter(section => {
    if (filter === 'all') return true;
    return section.status === filter;
  });

  const getStatusColor = (status: FiberSection['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'in_progress':
        return 'bg-info-100 text-info-800 border-info-200';
      case 'issues':
        return 'bg-error-100 text-error-800 border-error-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const progressPercentage = (stats.completedDistance / stats.totalDistance) * 100 || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Fiber Stringing Progress</h1>
            <p className="text-neutral-600 mt-1">Track fiber cable installation across sections</p>
          </div>
          <div className="flex items-center gap-2">
            <Cable className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Overall Progress</span>
            <span className="text-sm font-semibold">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-600">
            <span>{stats.completedDistance}m completed</span>
            <span>{stats.totalDistance}m total</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Cable className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-sm text-neutral-600">Total Sections</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{stats.sectionsTotal}</p>
          <p className="text-sm text-neutral-600 mt-1">
            {stats.totalDistance}m total distance
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success-600" />
            </div>
            <span className="text-sm text-neutral-600">Completed</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{stats.sectionsCompleted}</p>
          <p className="text-sm text-success-600 mt-1">
            {stats.completedDistance}m installed
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info-100 rounded-lg">
              <Clock className="h-5 w-5 text-info-600" />
            </div>
            <span className="text-sm text-neutral-600">In Progress</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{stats.sectionsInProgress}</p>
          <p className="text-sm text-info-600 mt-1">Active installations</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-warning-600" />
            </div>
            <span className="text-sm text-neutral-600">Avg Speed</span>
          </div>
          <p className="text-2xl font-semibold text-neutral-900">
            {stats.averageSpeed.toFixed(0)}m/day
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            Est. completion: {stats.estimatedCompletion}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-1">
        <div className="flex space-x-1">
          {(['all', 'in_progress', 'completed', 'issues'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                filter === status
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              {status === 'all' ? 'All Sections' : 
               status === 'in_progress' ? 'In Progress' :
               status === 'completed' ? 'Completed' : 'Issues'}
              {status !== 'all' && (
                <span className="ml-2 text-xs">
                  ({sections.filter(s => s.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Cable Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Team
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredSections.map(section => (
                <tr key={section.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{section.sectionName}</div>
                    {section.notes && (
                      <div className="text-sm text-error-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {section.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-neutral-600">
                      <MapPin className="h-4 w-4" />
                      {section.fromPole} → {section.toPole}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {section.distance}m
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {section.cableType}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[100px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">{section.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full',
                            section.status === 'completed' ? 'bg-success-500' :
                            section.status === 'in_progress' ? 'bg-info-500' :
                            section.status === 'issues' ? 'bg-error-500' :
                            'bg-neutral-400'
                          )}
                          style={{ width: `${section.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full border',
                      getStatusColor(section.status)
                    )}>
                      {section.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {section.team ? (
                      <div className="flex items-center gap-1 text-sm text-neutral-900">
                        <Users className="h-4 w-4 text-neutral-400" />
                        {section.team}
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">Not assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}