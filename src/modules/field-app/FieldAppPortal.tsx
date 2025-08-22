import React, { useState, useEffect } from 'react';
import { 
  Map, Camera, Navigation, CheckCircle, Clock, Wrench, QrCode, 
  Paperclip, FileText, User, Phone, Signal, Battery, Download,
  Router, Gauge, Home, Cloud, CloudOff, RefreshCw,
  ChevronDown, ChevronRight, Plus, Video, Mic, MapPin
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

interface FieldTask {
  id: string;
  type: 'installation' | 'maintenance' | 'inspection' | 'repair';
  title: string;
  customer: string;
  address: string;
  coordinates: { lat: number; lng: number };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  scheduledTime: string;
  estimatedDuration: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  offline: boolean;
  attachments: number;
  notes: string;
}

interface OfflineData {
  tasks: number;
  photos: number;
  forms: number;
  notes: number;
  totalSize: string;
  lastSync: Date;
}

interface DeviceStatus {
  battery: number;
  signal: 'excellent' | 'good' | 'fair' | 'poor';
  gpsAccuracy: number;
  storage: { used: number; total: number };
}

const FieldAppPortal: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<FieldTask | null>(null);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  // const [offlineMode] = useState(false); // Reserved for offline toggle
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('customer');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showSpeedDial, setShowSpeedDial] = useState(false);

  useEffect(() => {
    loadFieldData();
    setupOfflineListeners();
    checkDeviceStatus();
  }, []);

  const setupOfflineListeners = () => {
    window.addEventListener('online', () => {
      setIsOnline(true);
      syncOfflineData();
    });
    window.addEventListener('offline', () => {
      setIsOnline(false);
    });
  };

  const loadFieldData = () => {
    const mockTasks: FieldTask[] = [
      {
        id: 'FT001',
        type: 'installation',
        title: 'New Fiber Installation',
        customer: 'John Doe',
        address: '123 Main St, Stellenbosch',
        coordinates: { lat: -33.9321, lng: 18.8602 },
        priority: 'high',
        status: 'pending',
        scheduledTime: '09:00',
        estimatedDuration: '2 hours',
        syncStatus: 'synced',
        offline: false,
        attachments: 0,
        notes: 'Customer will be home. Gate code: 1234'
      },
      {
        id: 'FT002',
        type: 'repair',
        title: 'Fix Connection Issue',
        customer: 'Jane Smith',
        address: '456 Oak Ave, Paarl',
        coordinates: { lat: -33.7272, lng: 18.9694 },
        priority: 'urgent',
        status: 'in_progress',
        scheduledTime: '11:00',
        estimatedDuration: '1 hour',
        syncStatus: 'pending',
        offline: true,
        attachments: 2,
        notes: 'Signal loss reported. Check splitter.'
      },
      {
        id: 'FT003',
        type: 'inspection',
        title: 'Routine Pole Inspection',
        customer: 'Municipality',
        address: 'Pine Road, Wellington',
        coordinates: { lat: -33.6397, lng: 19.0062 },
        priority: 'medium',
        status: 'pending',
        scheduledTime: '14:00',
        estimatedDuration: '30 min',
        syncStatus: 'synced',
        offline: false,
        attachments: 0,
        notes: 'Check poles P101-P110'
      }
    ];

    const mockOfflineData: OfflineData = {
      tasks: 2,
      photos: 8,
      forms: 3,
      notes: 5,
      totalSize: '12.5 MB',
      lastSync: new Date(Date.now() - 3600000)
    };

    const mockDeviceStatus: DeviceStatus = {
      battery: 75,
      signal: 'good',
      gpsAccuracy: 5,
      storage: { used: 2.5, total: 16 }
    };

    setTasks(mockTasks);
    setOfflineData(mockOfflineData);
    setDeviceStatus(mockDeviceStatus);
  };

  const checkDeviceStatus = () => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setDeviceStatus(prev => ({
          ...prev!,
          battery: Math.round(battery.level * 100)
        }));
      });
    }
  };

  const syncOfflineData = async () => {
    setSyncInProgress(true);
    
    setTimeout(() => {
      setOfflineData(prev => ({
        ...prev!,
        tasks: 0,
        photos: 0,
        forms: 0,
        notes: 0,
        lastSync: new Date()
      }));
      setSyncInProgress(false);
      
      setTasks(prev => prev.map(task => ({
        ...task,
        syncStatus: 'synced',
        offline: false
      })));
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSignalStrength = (signal: string) => {
    switch (signal) {
      case 'excellent': return { bars: 4, color: 'text-green-500' };
      case 'good': return { bars: 3, color: 'text-green-400' };
      case 'fair': return { bars: 2, color: 'text-yellow-500' };
      case 'poor': return { bars: 1, color: 'text-red-500' };
      default: return { bars: 0, color: 'text-gray-400' };
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'installation': return <Home className="w-5 h-5" />;
      case 'repair': return <Wrench className="w-5 h-5" />;
      case 'inspection': return <CheckCircle className="w-5 h-5" />;
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Field App Portal"
        subtitle="Mobile tools for field technicians"
        actions={[
          {
            label: isOnline ? 'Online' : 'Offline',
            icon: isOnline ? Cloud : CloudOff,
            onClick: () => {},
            variant: isOnline ? 'success' : 'danger'
          },
          {
            label: `Sync (${offlineData?.tasks || 0})`,
            icon: RefreshCw,
            onClick: syncOfflineData,
            variant: 'secondary',
            disabled: !isOnline || syncInProgress
          }
        ]}
      />

      {/* Sync Progress Alert */}
      {syncInProgress && (
        <div className="ff-alert ff-alert-info mb-6">
          <div className="flex items-center justify-between">
            <span>Syncing offline data...</span>
            <div className="w-32 bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <div className="ff-alert ff-alert-warning mb-6">
          <CloudOff className="w-5 h-5 mr-2" />
          You are currently offline. Changes will be saved locally and synced when connection is restored.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div className="ff-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Tasks ({tasks.length})</h3>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskDialog(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getPriorityColor(task.priority)}`}>
                        {getTaskIcon(task.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{task.title}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          {task.offline && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                              <CloudOff className="w-3 h-3" />
                              Offline
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {task.customer}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {task.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {task.scheduledTime} • {task.estimatedDuration}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Navigation className="w-4 h-4" />
                        </button>
                        {task.attachments > 0 && (
                          <div className="relative">
                            <button className="p-2 hover:bg-gray-100 rounded">
                              <Paperclip className="w-4 h-4" />
                            </button>
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {task.attachments}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ff-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="ff-button ff-button-secondary">
                  <Map className="w-4 h-4 mr-2" />
                  View Map
                </button>
                <button 
                  className="ff-button ff-button-secondary"
                  onClick={() => setShowCameraDialog(true)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </button>
                <button className="ff-button ff-button-secondary">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan Equipment
                </button>
                <button className="ff-button ff-button-secondary">
                  <Gauge className="w-4 h-4 mr-2" />
                  Run Speed Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Device Status */}
          <div className="ff-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Device Status</h3>
              {deviceStatus && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-5 h-5 ${deviceStatus.battery > 20 ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-sm">Battery</span>
                    </div>
                    <span className="text-sm font-medium">{deviceStatus.battery}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Signal className={`w-5 h-5 ${getSignalStrength(deviceStatus.signal).color}`} />
                      <span className="text-sm">Signal</span>
                    </div>
                    <span className="text-sm font-medium capitalize">{deviceStatus.signal}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">GPS Accuracy</span>
                    </div>
                    <span className="text-sm font-medium">±{deviceStatus.gpsAccuracy}m</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">Storage</span>
                    </div>
                    <span className="text-sm font-medium">
                      {deviceStatus.storage.used}GB / {deviceStatus.storage.total}GB
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Offline Data */}
          <div className="ff-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Offline Data</h3>
              {offlineData && (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Pending Tasks</span>
                      <span className="font-medium">{offlineData.tasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Photos</span>
                      <span className="font-medium">{offlineData.photos}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Forms</span>
                      <span className="font-medium">{offlineData.forms}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Notes</span>
                      <span className="font-medium">{offlineData.notes}</span>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Size</span>
                      <span>{offlineData.totalSize}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last Sync: {offlineData.lastSync.toLocaleTimeString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tools & Resources */}
          <div className="ff-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tools & Resources</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Download Maps</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center gap-3">
                  <Router className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Equipment Catalog</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Installation Guide</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Emergency Contacts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <button
            onClick={() => setShowSpeedDial(!showSpeedDial)}
            className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
          >
            <Plus className={`w-6 h-6 transition-transform ${showSpeedDial ? 'rotate-45' : ''}`} />
          </button>
          
          {showSpeedDial && (
            <div className="absolute bottom-16 right-0 space-y-2">
              <button className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2 hover:bg-gray-50">
                <Camera className="w-5 h-5" />
                <span className="text-sm">Photo</span>
              </button>
              <button className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2 hover:bg-gray-50">
                <QrCode className="w-5 h-5" />
                <span className="text-sm">Scan</span>
              </button>
              <button className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2 hover:bg-gray-50">
                <Gauge className="w-5 h-5" />
                <span className="text-sm">Speed Test</span>
              </button>
              <button className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2 hover:bg-gray-50">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Note</span>
              </button>
              <button className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2 hover:bg-gray-50">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Location</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {showTaskDialog && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
              <div className={`inline-block mt-2 px-3 py-1 rounded text-sm font-medium ${
                selectedTask.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
                selectedTask.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                Priority: {selectedTask.priority.toUpperCase()}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Customer Details Accordion */}
              <div className="border rounded-lg">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                  onClick={() => setExpandedAccordion(expandedAccordion === 'customer' ? null : 'customer')}
                >
                  <span className="font-medium">Customer Details</span>
                  {expandedAccordion === 'customer' ? 
                    <ChevronDown className="w-5 h-5" /> : 
                    <ChevronRight className="w-5 h-5" />
                  }
                </button>
                {expandedAccordion === 'customer' && (
                  <div className="p-4 border-t space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{selectedTask.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{selectedTask.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{selectedTask.scheduledTime} • {selectedTask.estimatedDuration}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes & Instructions Accordion */}
              <div className="border rounded-lg">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                  onClick={() => setExpandedAccordion(expandedAccordion === 'notes' ? null : 'notes')}
                >
                  <span className="font-medium">Notes & Instructions</span>
                  {expandedAccordion === 'notes' ? 
                    <ChevronDown className="w-5 h-5" /> : 
                    <ChevronRight className="w-5 h-5" />
                  }
                </button>
                {expandedAccordion === 'notes' && (
                  <div className="p-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">{selectedTask.notes}</p>
                    <textarea
                      className="w-full p-3 border rounded-lg text-sm"
                      rows={3}
                      placeholder="Add notes..."
                    />
                  </div>
                )}
              </div>

              {/* Attachments Accordion */}
              <div className="border rounded-lg">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                  onClick={() => setExpandedAccordion(expandedAccordion === 'attachments' ? null : 'attachments')}
                >
                  <span className="font-medium">Attachments ({selectedTask.attachments})</span>
                  {expandedAccordion === 'attachments' ? 
                    <ChevronDown className="w-5 h-5" /> : 
                    <ChevronRight className="w-5 h-5" />
                  }
                </button>
                {expandedAccordion === 'attachments' && (
                  <div className="p-4 border-t">
                    <div className="grid grid-cols-3 gap-2">
                      <button className="ff-button ff-button-secondary text-sm">
                        <Camera className="w-4 h-4 mr-1" />
                        Photo
                      </button>
                      <button className="ff-button ff-button-secondary text-sm">
                        <Video className="w-4 h-4 mr-1" />
                        Video
                      </button>
                      <button className="ff-button ff-button-secondary text-sm">
                        <Mic className="w-4 h-4 mr-1" />
                        Audio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t flex gap-3 justify-end">
              <button 
                className="ff-button ff-button-secondary"
                onClick={() => setShowTaskDialog(false)}
              >
                Close
              </button>
              <button className="ff-button ff-button-secondary">
                <Navigation className="w-4 h-4 mr-2" />
                Navigate
              </button>
              <button className="ff-button ff-button-success">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Dialog */}
      {showCameraDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Capture Photo</h2>
            </div>
            <div className="p-6">
              <div className="bg-black rounded-lg h-64 flex items-center justify-center mb-4">
                <Camera className="w-16 h-16 text-white" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Camera interface would appear here on mobile device
              </p>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button 
                className="ff-button ff-button-secondary"
                onClick={() => setShowCameraDialog(false)}
              >
                Cancel
              </button>
              <button className="ff-button ff-button-primary">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldAppPortal;