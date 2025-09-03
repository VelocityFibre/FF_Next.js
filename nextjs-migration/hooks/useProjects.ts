import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import type { Project, NewProject } from '@/lib/db';

// API client functions
const fetchProjects = async (filters?: { status?: string; search?: string }): Promise<Project[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  
  const response = await fetch(`/api/projects?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
};

const fetchProject = async (id: number): Promise<Project> => {
  const response = await fetch(`/api/projects?id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }
  return response.json();
};

const createProject = async (project: NewProject): Promise<Project> => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  return response.json();
};

const updateProject = async ({ id, ...data }: Partial<Project> & { id: number }): Promise<Project> => {
  const response = await fetch(`/api/projects?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update project');
  }
  return response.json();
};

const deleteProject = async (id: number): Promise<void> => {
  const response = await fetch(`/api/projects?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
};

// React Query hooks
export const useProjects = () => {
  const filters = useStore((state) => state.projectFilters);
  
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

export const useProject = (id: number | null) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const addNotification = useStore((state) => state.addNotification);
  
  return useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      addNotification({
        type: 'success',
        message: `Project "${data.name}" created successfully`,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create project',
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const addNotification = useStore((state) => state.addNotification);
  
  return useMutation({
    mutationFn: updateProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      addNotification({
        type: 'success',
        message: `Project "${data.name}" updated successfully`,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update project',
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const addNotification = useStore((state) => state.addNotification);
  
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      addNotification({
        type: 'success',
        message: 'Project deleted successfully',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete project',
      });
    },
  });
};