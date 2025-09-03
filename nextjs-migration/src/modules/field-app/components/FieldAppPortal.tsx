import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TaskCard } from './TaskCard';
import { OfflineStatus } from './OfflineStatus';
import { DeviceStatus } from './DeviceStatus';
import { TaskDialog } from './TaskDialog';
import { TechnicianCard } from './TechnicianCard';
import { 
  mockTasks, 
  mockTechnicians, 
  mockOfflineData, 
  mockDeviceStatus 
} from '../data/mockData';
import type { FieldTask, FieldTechnician } from '../types/field-app.types';

export function FieldAppPortal() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tasks, setTasks] = useState<FieldTask[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<FieldTask | null>(null);
  const [technicians] = useState<FieldTechnician[]>(mockTechnicians);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'technicians' | 'overview'>('tasks');

  useEffect(() => {
    setupOfflineListeners();
  }, []);

  const setupOfflineListeners = () => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const syncOfflineData = async () => {
    setSyncInProgress(true);
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncInProgress(false);
  };

  const handleTaskStatusUpdate = (taskId: string, status: FieldTask['status']) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status, syncStatus: 'pending', offline: !isOnline }
          : task
      )
    );
  };

  const handleTaskSelect = (task: FieldTask) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const handleTechnicianSelect = (_technician: FieldTechnician) => {
  };

  const handleRefresh = () => {
    syncOfflineData();
  };

  const handleExport = () => {
  };

  const getTodayStats = () => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    return { completed, inProgress, pending };
  };

  const stats = getTodayStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Field App Portal"
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <OfflineStatus
            isOffline={!isOnline}
            offlineData={mockOfflineData}
            onSync={syncOfflineData}
            isSyncing={syncInProgress}
          />
          
          <DeviceStatus {...mockDeviceStatus} />
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Today's Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-semibold text-green-600">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-semibold text-blue-600">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-gray-600">{stats.pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'tasks', label: 'Field Tasks', count: tasks.length },
                { key: 'technicians', label: 'Technicians', count: technicians.length },
                { key: 'overview', label: 'Overview', count: undefined }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSelect={handleTaskSelect}
                />
              ))}
            </div>
          )}

          {activeTab === 'technicians' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicians.map((technician) => (
                <TechnicianCard
                  key={technician.id}
                  technician={technician}
                  onSelect={handleTechnicianSelect}
                />
              ))}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Distribution</h3>
                <div className="space-y-4">
                  {['installation', 'maintenance', 'inspection', 'repair'].map((type) => {
                    const count = tasks.filter(t => t.type === type).length;
                    const percentage = tasks.length ? (count / tasks.length) * 100 : 0;
                    
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {type}
                          </span>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Breakdown</h3>
                <div className="space-y-4">
                  {['urgent', 'high', 'medium', 'low'].map((priority) => {
                    const count = tasks.filter(t => t.priority === priority).length;
                    const color = {
                      urgent: 'bg-red-600',
                      high: 'bg-orange-600',
                      medium: 'bg-yellow-600',
                      low: 'bg-green-600'
                    }[priority];
                    
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${color} mr-3`} />
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {priority}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <TaskDialog
        task={selectedTask}
        isOpen={showTaskDialog}
        onClose={() => {
          setShowTaskDialog(false);
          setSelectedTask(null);
        }}
        onStatusUpdate={handleTaskStatusUpdate}
      />
    </div>
  );
}