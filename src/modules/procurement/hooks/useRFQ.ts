import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rfqService } from '@/services/procurement/rfqService';
import { RFQFormData, RFQStatus, RFQResponse } from '@/types/procurement.types';
import { toast } from 'react-hot-toast';

// Get all RFQs
export function useRFQs(filter?: { projectId?: string; status?: RFQStatus; supplierId?: string }) {
  return useQuery({
    queryKey: ['rfqs', filter],
    queryFn: () => rfqService.getAll(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single RFQ
export function useRFQ(id: string) {
  return useQuery({
    queryKey: ['rfqs', id],
    queryFn: () => rfqService.getById(id),
    enabled: !!id,
  });
}

// Get RFQ responses
export function useRFQResponses(rfqId: string) {
  return useQuery({
    queryKey: ['rfq-responses', rfqId],
    queryFn: () => rfqService.getResponses(rfqId),
    enabled: !!rfqId,
  });
}

// Compare RFQ responses
export function useCompareRFQResponses(rfqId: string) {
  return useQuery({
    queryKey: ['rfq-comparison', rfqId],
    queryFn: () => rfqService.compareResponses(rfqId),
    enabled: !!rfqId,
  });
}

// Create RFQ
export function useCreateRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RFQFormData) => rfqService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create RFQ: ${error.message}`);
    },
  });
}

// Update RFQ
export function useUpdateRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RFQFormData> }) =>
      rfqService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.id] });
      toast.success('RFQ updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update RFQ: ${error.message}`);
    },
  });
}

// Delete RFQ
export function useDeleteRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rfqService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete RFQ: ${error.message}`);
    },
  });
}

// Update RFQ status
export function useUpdateRFQStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RFQStatus }) =>
      rfqService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.id] });
      toast.success('RFQ status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update RFQ status: ${error.message}`);
    },
  });
}

// Send RFQ to suppliers
export function useSendRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rfqService.sendToSuppliers(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', id] });
      toast.success('RFQ sent to suppliers successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send RFQ: ${error.message}`);
    },
  });
}

// Submit RFQ response
export function useSubmitRFQResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfqId, response }: { rfqId: string; response: Omit<RFQResponse, 'id'> }) =>
      rfqService.submitResponse(rfqId, response),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.rfqId] });
      queryClient.invalidateQueries({ queryKey: ['rfq-responses', variables.rfqId] });
      toast.success('Response submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit response: ${error.message}`);
    },
  });
}

// Select RFQ response
export function useSelectRFQResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfqId, responseId, reason }: { rfqId: string; responseId: string; reason?: string }) =>
      rfqService.selectResponse(rfqId, responseId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.rfqId] });
      queryClient.invalidateQueries({ queryKey: ['rfq-responses', variables.rfqId] });
      toast.success('Supplier selected successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to select supplier: ${error.message}`);
    },
  });
}

// Subscribe to RFQ updates
export function useRFQSubscription(rfqId: string, callback: (rfq: any) => void) {
  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['rfq-subscription', rfqId],
    queryFn: () => {
      const unsubscribe = rfqService.subscribeToRFQ(rfqId, (rfq) => {
        queryClient.setQueryData(['rfqs', rfqId], rfq);
        callback(rfq);
      });
      return unsubscribe;
    },
    enabled: !!rfqId,
  });
}

// Subscribe to RFQ responses updates
export function useRFQResponsesSubscription(rfqId: string, callback: (responses: any[]) => void) {
  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['rfq-responses-subscription', rfqId],
    queryFn: () => {
      const unsubscribe = rfqService.subscribeToResponses(rfqId, (responses) => {
        queryClient.setQueryData(['rfq-responses', rfqId], responses);
        callback(responses);
      });
      return unsubscribe;
    },
    enabled: !!rfqId,
  });
}