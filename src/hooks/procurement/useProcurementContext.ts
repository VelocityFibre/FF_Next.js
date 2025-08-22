/**
 * Procurement Context Hook
 * Provides procurement-specific context and utilities
 */

import { useContext } from 'react';
import { ProcurementContext } from '@/types/procurement/base.types';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/hooks/useProject';

interface ProcurementContextResult {
  context: ProcurementContext | null;
  isLoading: boolean;
  error: string | null;
  hasContext: boolean;
}

export function useProcurementContext(): ProcurementContextResult {
  const { user, isLoading: authLoading } = useAuth();
  const { currentProject, isLoading: projectLoading } = useProject();

  const isLoading = authLoading || projectLoading;
  
  const error = !user ? 'User not authenticated' : 
                !currentProject ? 'No project selected' : null;

  const context: ProcurementContext | null = user && currentProject ? {
    userId: user.uid,
    userEmail: user.email || '',
    projectId: currentProject.id,
    organizationId: currentProject.organizationId || '',
    permissions: user.permissions || [],
    timestamp: new Date()
  } : null;

  return {
    context,
    isLoading,
    error,
    hasContext: !!context
  };
}