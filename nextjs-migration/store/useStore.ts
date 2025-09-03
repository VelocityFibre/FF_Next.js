import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Project, Contractor, Client } from '@/lib/db';

// Store state interface
interface AppState {
  // Projects
  selectedProject: Project | null;
  projectFilters: {
    status?: string;
    search?: string;
  };
  
  // Contractors
  contractors: Contractor[];
  selectedContractor: Contractor | null;
  
  // Clients
  clients: Client[];
  selectedClient: Client | null;
  
  // UI State
  sidebarOpen: boolean;
  isLoading: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
  
  // Actions
  setSelectedProject: (project: Project | null) => void;
  setProjectFilters: (filters: Partial<AppState['projectFilters']>) => void;
  setContractors: (contractors: Contractor[]) => void;
  setSelectedContractor: (contractor: Contractor | null) => void;
  setClients: (clients: Client[]) => void;
  setSelectedClient: (client: Client | null) => void;
  toggleSidebar: () => void;
  setIsLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Create Zustand store with middleware
export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedProject: null,
        projectFilters: {},
        contractors: [],
        selectedContractor: null,
        clients: [],
        selectedClient: null,
        sidebarOpen: true,
        isLoading: false,
        notifications: [],
        
        // Actions
        setSelectedProject: (project) => 
          set((state) => ({ selectedProject: project }), false, 'setSelectedProject'),
        
        setProjectFilters: (filters) =>
          set((state) => ({ 
            projectFilters: { ...state.projectFilters, ...filters } 
          }), false, 'setProjectFilters'),
        
        setContractors: (contractors) =>
          set(() => ({ contractors }), false, 'setContractors'),
        
        setSelectedContractor: (contractor) =>
          set(() => ({ selectedContractor: contractor }), false, 'setSelectedContractor'),
        
        setClients: (clients) =>
          set(() => ({ clients }), false, 'setClients'),
        
        setSelectedClient: (client) =>
          set(() => ({ selectedClient: client }), false, 'setSelectedClient'),
        
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
        
        setIsLoading: (loading) =>
          set(() => ({ isLoading: loading }), false, 'setIsLoading'),
        
        addNotification: (notification) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
              },
            ].slice(-5), // Keep only last 5 notifications
          }), false, 'addNotification'),
        
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }), false, 'removeNotification'),
        
        clearNotifications: () =>
          set(() => ({ notifications: [] }), false, 'clearNotifications'),
      }),
      {
        name: 'fibreflow-storage', // Local storage key
        partialize: (state) => ({
          // Only persist these fields
          sidebarOpen: state.sidebarOpen,
          projectFilters: state.projectFilters,
        }),
      }
    )
  )
);

// Selector hooks for better performance
export const useSelectedProject = () => useStore((state) => state.selectedProject);
export const useProjectFilters = () => useStore((state) => state.projectFilters);
export const useSidebarOpen = () => useStore((state) => state.sidebarOpen);
export const useNotifications = () => useStore((state) => state.notifications);