/**
 * Custom hook for BOQ History logic
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProcurementContext } from '@/hooks/procurement/useProcurementContext';
import toast from 'react-hot-toast';
import {
  BOQVersion,
  VersionComparison,
  FilterState,
  INITIAL_FILTERS
} from './BOQHistoryTypes';

export const useBOQHistory = (
  boqId: string,
  onVersionSelect?: (version: BOQVersion) => void,
  onRestore?: (version: BOQVersion) => void
) => {
  const { context } = useProcurementContext();
  const [versions, setVersions] = useState<BOQVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<[BOQVersion | null, BOQVersion | null]>([null, null]);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const loadVersionHistory = useCallback(async () => {
    if (!context) return;

    try {
      setIsLoading(true);
      // This would call an actual API endpoint
      const mockVersions: BOQVersion[] = [
        {
          id: 'v1',
          boqId,
          version: '1.0.0',
          createdAt: new Date('2024-01-01'),
          createdBy: 'John Doe',
          changeType: 'created',
          description: 'Initial version',
          itemCount: 100,
          mappedItems: 0,
          exceptionsCount: 0
        },
        {
          id: 'v2',
          boqId,
          version: '1.1.0',
          createdAt: new Date('2024-01-15'),
          createdBy: 'Jane Smith',
          changeType: 'mapped',
          description: 'Mapped items to catalog',
          itemCount: 100,
          mappedItems: 85,
          exceptionsCount: 5
        },
        {
          id: 'v3',
          boqId,
          version: '1.2.0',
          createdAt: new Date('2024-02-01'),
          createdBy: 'John Doe',
          changeType: 'updated',
          description: 'Updated quantities and prices',
          itemCount: 105,
          mappedItems: 90,
          exceptionsCount: 3
        }
      ];
      setVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load version history:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  }, [context, boqId]);

  // Load version history
  useEffect(() => {
    loadVersionHistory();
  }, [loadVersionHistory]);

  // Filter versions
  const filteredVersions = useMemo(() => {
    return versions.filter(version => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !version.version.toLowerCase().includes(searchTerm) &&
          !version.description?.toLowerCase().includes(searchTerm) &&
          !version.createdBy.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      // Change type filter
      if (filters.changeType && version.changeType !== filters.changeType) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const versionDate = new Date(version.createdAt);
        const daysDiff = Math.floor((now.getTime() - versionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case '7days':
            if (daysDiff > 7) return false;
            break;
          case '30days':
            if (daysDiff > 30) return false;
            break;
          case '90days':
            if (daysDiff > 90) return false;
            break;
        }
      }

      // User filter
      if (filters.user && !version.createdBy.toLowerCase().includes(filters.user.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [versions, filters]);

  // Toggle version expansion
  const toggleVersionExpansion = (versionId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  // Select versions for comparison
  const selectVersionForComparison = (version: BOQVersion) => {
    setSelectedVersions(prev => {
      if (!prev[0]) {
        return [version, null];
      } else if (!prev[1] && prev[0].id !== version.id) {
        return [prev[0], version];
      } else {
        return [version, null];
      }
    });
  };

  // Compare versions
  const compareVersions = async () => {
    if (!context || !selectedVersions[0] || !selectedVersions[1]) return;

    try {
      setIsComparing(true);
      // This would call an actual API endpoint
      const mockComparison: VersionComparison = {
        fromVersion: selectedVersions[0],
        toVersion: selectedVersions[1],
        changes: {
          added: [],
          removed: [],
          modified: []
        }
      };
      setComparison(mockComparison);
      setShowComparison(true);
    } catch (error) {
      console.error('Failed to compare versions:', error);
      toast.error('Failed to compare versions');
    } finally {
      setIsComparing(false);
    }
  };

  // Restore version
  const restoreVersion = async (version: BOQVersion) => {
    if (!context) return;

    try {
      // This would call an actual API endpoint
      toast.success(`Version ${version.version} restored successfully`);
      onRestore?.(version);
      loadVersionHistory();
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast.error('Failed to restore version');
    }
  };

  // Export version
  const exportVersion = async (version: BOQVersion) => {
    if (!context) return;

    try {
      // This would export the version data
      const blob = new Blob([JSON.stringify(version, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boq_version_${version.version}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Version exported successfully');
    } catch (error) {
      console.error('Failed to export version:', error);
      toast.error('Failed to export version');
    }
  };

  return {
    versions,
    filteredVersions,
    selectedVersions,
    comparison,
    expandedVersions,
    filters,
    setFilters,
    isLoading,
    isComparing,
    showComparison,
    setShowComparison,
    loadVersionHistory,
    toggleVersionExpansion,
    selectVersionForComparison,
    compareVersions,
    restoreVersion,
    exportVersion,
    onVersionSelect
  };
};