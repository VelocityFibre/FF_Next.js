import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boqService } from '@/services/procurement/boqService';
import { BOQFormData, BOQStatus } from '@/types/procurement.types';
import { toast } from 'react-hot-toast';

// Get all BOQs
export function useBOQs(filter?: { projectId?: string; clientId?: string; status?: BOQStatus }) {
  return useQuery({
    queryKey: ['boqs', filter],
    queryFn: () => boqService.getAll(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single BOQ
export function useBOQ(id: string) {
  return useQuery({
    queryKey: ['boqs', id],
    queryFn: () => boqService.getById(id),
    enabled: !!id,
  });
}

// Get BOQ templates
export function useBOQTemplates() {
  return useQuery({
    queryKey: ['boq-templates'],
    queryFn: () => boqService.getTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create BOQ
export function useCreateBOQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BOQFormData) => boqService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      toast.success('BOQ created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create BOQ: ${error.message}`);
    },
  });
}

// Update BOQ
export function useUpdateBOQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BOQFormData> }) =>
      boqService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      queryClient.invalidateQueries({ queryKey: ['boqs', variables.id] });
      toast.success('BOQ updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update BOQ: ${error.message}`);
    },
  });
}

// Delete BOQ
export function useDeleteBOQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => boqService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      toast.success('BOQ deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete BOQ: ${error.message}`);
    },
  });
}

// Update BOQ status
export function useUpdateBOQStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, approvedBy }: { id: string; status: BOQStatus; approvedBy?: string }) =>
      boqService.updateStatus(id, status, approvedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      queryClient.invalidateQueries({ queryKey: ['boqs', variables.id] });
      toast.success('BOQ status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update BOQ status: ${error.message}`);
    },
  });
}

// Clone BOQ
export function useCloneBOQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boqId, newTitle }: { boqId: string; newTitle: string }) =>
      boqService.clone(boqId, newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      toast.success('BOQ cloned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to clone BOQ: ${error.message}`);
    },
  });
}

// Create BOQ template
export function useCreateBOQTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boqId, templateName }: { boqId: string; templateName: string }) =>
      boqService.createTemplate(boqId, templateName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boqs'] });
      queryClient.invalidateQueries({ queryKey: ['boq-templates'] });
      toast.success('BOQ template created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create BOQ template: ${error.message}`);
    },
  });
}

// Export BOQ to Excel
export function useExportBOQ() {
  return useMutation({
    mutationFn: async (boq: any) => {
      const blob = await boqService.exportToExcel(boq);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${boq.boqNumber}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast.success('BOQ exported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export BOQ: ${error.message}`);
    },
  });
}