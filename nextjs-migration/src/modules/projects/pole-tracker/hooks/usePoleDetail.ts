/**
 * Use Pole Detail Hook
 * Custom hook for pole detail state management and configuration
 */

import { useState, useMemo } from 'react';
import { 
  Activity, 
  Camera, 
  CheckCircle, 
  FileText 
} from 'lucide-react';
import { TabConfig, PoleDetail } from '../types/pole-detail.types';
import { mockPoleDetail } from '../data/pole-mock-data';

export function usePoleDetail(poleId?: string) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Mock data for demonstration - replace with actual data fetching
  const pole: PoleDetail = useMemo(() => {
    // In a real app, fetch pole data based on poleId
    return mockPoleDetail;
  }, [poleId]);

  const tabs: TabConfig[] = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'quality', label: 'Quality Checks', icon: CheckCircle },
    { id: 'history', label: 'History', icon: FileText },
  ], []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return {
    pole,
    tabs,
    activeTab,
    handleTabChange,
  };
}