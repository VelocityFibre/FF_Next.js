/**
 * Custom hook for loading SOW data
 */

import { useState, useEffect } from 'react';
import { neonSOWService } from '@/services/neonSOWService';

export function useSOWData(projectId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSOWData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await neonSOWService.getProjectSOWData(projectId);
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load SOW data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSOWData();
  }, [projectId]);

  return {
    data,
    loading,
    error,
    refetch: loadSOWData
  };
}