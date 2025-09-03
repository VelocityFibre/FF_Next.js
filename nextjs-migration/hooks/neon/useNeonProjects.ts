import { useState, useEffect } from 'react';
import { projectsService, Project } from '@/services/projectsService';
import { log } from '@/lib/logger';

export function useNeonProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      log.error('Error fetching projects:', { data: err }, 'useNeonProjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects
  };
}