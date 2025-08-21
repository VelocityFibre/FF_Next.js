import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/PigmentGrid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Alert,
  LinearProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Switch,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudOff as OfflineIcon,
  Cloud as OnlineIcon,
  Sync as SyncIcon,
  Map as MapIcon,
  CameraAlt as CameraIcon,
  Assignment as TaskIcon,
  LocationOn as LocationIcon,
  Navigation as NavigationIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Build as ToolsIcon,
  QrCodeScanner as QrScannerIcon,
  AttachFile as AttachIcon,
  Notes as NotesIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  SignalCellularAlt as SignalIcon,
  Battery90 as BatteryIcon,
  ExpandMore as ExpandMoreIcon,
  PhotoCamera as PhotoIcon,
  Videocam as VideoIcon,
  Mic as MicIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Router as RouterIcon,
  Speed as SpeedTestIcon,
  Home as HomeIcon
} from '@mui/icons-material';

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
  const [offlineMode, setOfflineMode] = useState(false);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openCameraDialog, setOpenCameraDialog] = useState(false);

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
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getSignalIcon = (signal: string) => {
    const color = signal === 'excellent' ? '#4caf50' : 
                  signal === 'good' ? '#8bc34a' :
                  signal === 'fair' ? '#ff9800' : '#f44336';
    return <SignalIcon style={{ color }} />;
  };

  const speedDialActions = [
    { icon: <CameraIcon />, name: 'Take Photo', action: () => setOpenCameraDialog(true) },
    { icon: <QrScannerIcon />, name: 'Scan QR Code', action: () => {} },
    { icon: <SpeedTestIcon />, name: 'Speed Test', action: () => {} },
    { icon: <NotesIcon />, name: 'Add Note', action: () => {} },
    { icon: <LocationIcon />, name: 'Update Location', action: () => {} }
  ];

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Field App</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'error'}
            variant={isOnline ? 'filled' : 'outlined'}
          />
          <FormControlLabel
            control={
              <Switch
                checked={offlineMode}
                onChange={(e) => setOfflineMode(e.target.checked)}
              />
            }
            label="Offline Mode"
          />
          <IconButton onClick={syncOfflineData} disabled={!isOnline || syncInProgress}>
            <Badge badgeContent={offlineData?.tasks || 0} color="error">
              <SyncIcon />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {syncInProgress && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Syncing offline data...</Typography>
            <LinearProgress sx={{ flex: 1 }} />
          </Box>
        </Alert>
      )}

      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Changes will be saved locally and synced when connection is restored.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Tasks ({tasks.length})
              </Typography>
              <List>
                {tasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <ListItem 
                      component="button"
                      onClick={() => {
                        setSelectedTask(task);
                        setOpenTaskDialog(true);
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getPriorityColor(task.priority) }}>
                          {task.type === 'installation' && <HomeIcon />}
                          {task.type === 'repair' && <ToolsIcon />}
                          {task.type === 'inspection' && <TaskIcon />}
                          {task.type === 'maintenance' && <ToolsIcon />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{task.title}</Typography>
                            <Chip 
                              label={task.status} 
                              size="small"
                              color={getStatusColor(task.status) as any}
                            />
                            {task.offline && (
                              <Chip 
                                icon={<OfflineIcon />} 
                                label="Offline" 
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {task.customer}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {task.address}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <ScheduleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {task.scheduledTime} • {task.estimatedDuration}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ textAlign: 'right' }}>
                          <IconButton size="small" onClick={() => {}}>
                            <NavigationIcon />
                          </IconButton>
                          {task.attachments > 0 && (
                            <Badge badgeContent={task.attachments} color="primary">
                              <IconButton size="small">
                                <AttachIcon />
                              </IconButton>
                            </Badge>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<MapIcon />}
                    onClick={() => {}}
                  >
                    View Map
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CameraIcon />}
                    onClick={() => setOpenCameraDialog(true)}
                  >
                    Take Photo
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<QrScannerIcon />}
                    onClick={() => {}}
                  >
                    Scan Equipment
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SpeedTestIcon />}
                    onClick={() => {}}
                  >
                    Run Speed Test
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Status
              </Typography>
              {deviceStatus && (
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <BatteryIcon style={{ color: deviceStatus.battery > 20 ? '#4caf50' : '#f44336' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Battery"
                      secondary={`${deviceStatus.battery}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {getSignalIcon(deviceStatus.signal)}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Signal"
                      secondary={deviceStatus.signal}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="GPS Accuracy"
                      secondary={`±${deviceStatus.gpsAccuracy}m`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SaveIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Storage"
                      secondary={`${deviceStatus.storage.used}GB / ${deviceStatus.storage.total}GB`}
                    />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Offline Data
              </Typography>
              {offlineData && (
                <>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Pending Tasks"
                        secondary={offlineData.tasks}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Photos"
                        secondary={offlineData.photos}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Forms"
                        secondary={offlineData.forms}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Notes"
                        secondary={offlineData.notes}
                      />
                    </ListItem>
                  </List>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Total Size: {offlineData.totalSize}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Last Sync: {offlineData.lastSync.toLocaleTimeString()}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tools & Resources
              </Typography>
              <List dense>
                <ListItem component="button">
                  <ListItemIcon>
                    <DownloadIcon />
                  </ListItemIcon>
                  <ListItemText primary="Download Maps" />
                </ListItem>
                <ListItem component="button">
                  <ListItemIcon>
                    <RouterIcon />
                  </ListItemIcon>
                  <ListItemText primary="Equipment Catalog" />
                </ListItem>
                <ListItem component="button">
                  <ListItemIcon>
                    <NotesIcon />
                  </ListItemIcon>
                  <ListItemText primary="Installation Guide" />
                </ListItem>
                <ListItem component="button">
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="Emergency Contacts" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SpeedDial
        ariaLabel="Field Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setOpenSpeedDial(false)}
        onOpen={() => setOpenSpeedDial(true)}
        open={openSpeedDial}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              setOpenSpeedDial(false);
              action.action();
            }}
          />
        ))}
      </SpeedDial>

      <Dialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Alert severity={selectedTask.priority === 'urgent' ? 'error' : 'info'} sx={{ mb: 2 }}>
                Priority: {selectedTask.priority.toUpperCase()}
              </Alert>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Customer Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText primary={selectedTask.customer} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LocationIcon /></ListItemIcon>
                      <ListItemText primary={selectedTask.address} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ScheduleIcon /></ListItemIcon>
                      <ListItemText primary={`${selectedTask.scheduledTime} • ${selectedTask.estimatedDuration}`} />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Notes & Instructions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    {selectedTask.notes}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add notes..."
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Attachments ({selectedTask.attachments})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    <Grid size={4}>
                      <Button fullWidth variant="outlined" size="small" startIcon={<PhotoIcon />}>
                        Photo
                      </Button>
                    </Grid>
                    <Grid size={4}>
                      <Button fullWidth variant="outlined" size="small" startIcon={<VideoIcon />}>
                        Video
                      </Button>
                    </Grid>
                    <Grid size={4}>
                      <Button fullWidth variant="outlined" size="small" startIcon={<MicIcon />}>
                        Audio
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Close</Button>
          <Button variant="outlined" startIcon={<NavigationIcon />}>
            Navigate
          </Button>
          <Button variant="contained" color="success" startIcon={<CheckIcon />}>
            Complete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCameraDialog}
        onClose={() => setOpenCameraDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Capture Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            height: 300, 
            bgcolor: 'black', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 1,
            mb: 2
          }}>
            <CameraIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          <Typography variant="body2" color="textSecondary" align="center">
            Camera interface would appear here on mobile device
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCameraDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<CameraIcon />}>
            Capture
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FieldAppPortal;