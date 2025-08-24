import { useState, useEffect } from 'react';
import { FiberSection, FiberStats, FilterStatus } from '../types/fiberStringing.types';
import { calculateStats } from '../utils/fiberUtils';

export function useFiberStringingDashboard() {
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
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    loadFiberSections();
  }, []);

  useEffect(() => {
    const calculatedStats = calculateStats(sections);
    setStats(calculatedStats);
  }, [sections]);

  const loadFiberSections = async () => {
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
  };

  const filteredSections = sections.filter(section => {
    if (filter === 'all') return true;
    return section.status === filter;
  });

  return {
    sections,
    stats,
    filter,
    filteredSections,
    setFilter
  };
}