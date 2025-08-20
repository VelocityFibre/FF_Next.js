import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  ProjectListQuery,
  ProjectStatus 
} from '../types/project.types';

// Query keys
const QUERY_KEYS = {
  all: ['projects'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (query?: ProjectListQuery) => [...QUERY_KEYS.lists(), query] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
  byClient: (clientId: string) => [...QUERY_KEYS.all, 'client', clientId] as const,
  byManager: (managerId: string) => [...QUERY_KEYS.all, 'manager', managerId] as const,
};

// Fetch all projects with filters
export function useProjects(query?: ProjectListQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.list(query),
    queryFn: () => projectService.getProjects(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single project
export function useProject(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(projectId),
    queryFn: () => projectService.getProjectById(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch projects by client
export function useProjectsByClient(clientId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.byClient(clientId),
    queryFn: () => projectService.getProjectsByClient(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch projects by manager
export function useProjectsByManager(managerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.byManager(managerId),
    queryFn: () => projectService.getProjectsByManager(managerId),
    enabled: !!managerId,
    staleTime: 5 * 60 * 1000,
  });
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.createProject(data),
    onSuccess: () => {
      // Invalidate all project queries to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectRequest) => projectService.updateProject(data),
    onSuccess: (_, variables) => {
      // Invalidate specific project and list queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: () => {
      // Invalidate all project queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

// Update project status mutation
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: ProjectStatus }) =>
      projectService.updateProjectStatus(projectId, status),
    onSuccess: (_, variables) => {
      // Invalidate specific project and list queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}

// Update project progress mutation
export function useUpdateProjectProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      projectId, 
      progress 
    }: { 
      projectId: string; 
      progress: Partial<Project['progress']> 
    }) => projectService.updateProjectProgress(projectId, progress),
    onSuccess: (_, variables) => {
      // Invalidate specific project
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.projectId) });
    },
  });
}

// Add team member mutation
export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      projectId, 
      staffId, 
      role, 
      position 
    }: { 
      projectId: string; 
      staffId: string; 
      role: string; 
      position: string;
    }) => projectService.addTeamMember(projectId, staffId, role, position),
    onSuccess: (_, variables) => {
      // Invalidate specific project
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.projectId) });
    },
  });
}

// Remove team member mutation
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      projectId, 
      staffId 
    }: { 
      projectId: string; 
      staffId: string;
    }) => projectService.removeTeamMember(projectId, staffId),
    onSuccess: (_, variables) => {
      // Invalidate specific project
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.projectId) });
    },
  });
}