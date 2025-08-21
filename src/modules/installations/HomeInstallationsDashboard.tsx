import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Alert,
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Rating
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
  Engineering as EngineeringIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Router as RouterIcon,
  Speed as SpeedIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  CameraAlt as CameraAltIcon,
  SignalCellularAlt as SignalIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Map as MapIcon
} from '@mui/icons-material';

interface Installation {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  type: 'new_installation' | 'upgrade' | 'relocation' | 'repair';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'postponed';
  scheduledDate: Date;
  timeSlot: string;
  assignedTeam: string;
  technicians: string[];
  package: string;
  connectionType: 'FTTH' | 'FTTB' | 'Wireless';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  qualityScore?: number;
  notes: string;
}

interface TechnicianStatus {
  id: string;
  name: string;
  status: 'available' | 'on_job' | 'break' | 'offline';
  currentJob?: string;
  completedToday: number;
  location?: string;
}

const HomeInstallationsDashboard: React.FC = () => {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianStatus[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadInstallationsData();
  }, [filterDate]);

  const loadInstallationsData = () => {
    const mockInstallations: Installation[] = [
      {
        id: 'INS001',
        customer: {
          name: 'John Doe',
          phone: '0821234567',
          email: 'john.doe@email.com',
          address: '123 Main St, Stellenbosch'
        },
        type: 'new_installation',
        status: 'scheduled',
        scheduledDate: new Date(),
        timeSlot: '09:00 - 11:00',
        assignedTeam: 'Team Alpha',
        technicians: ['Tech 1', 'Tech 2'],
        package: '100/100 Mbps',
        connectionType: 'FTTH',
        priority: 'high',
        progress: 0,
        notes: 'Customer will be home all day'
      },
      {
        id: 'INS002',
        customer: {
          name: 'Jane Smith',
          phone: '0834567890',
          email: 'jane.smith@email.com',
          address: '456 Oak Ave, Paarl'
        },
        type: 'upgrade',
        status: 'in_progress',
        scheduledDate: new Date(),
        timeSlot: '11:00 - 13:00',
        assignedTeam: 'Team Bravo',
        technicians: ['Tech 3'],
        package: '200/200 Mbps',
        connectionType: 'FTTH',
        priority: 'medium',
        progress: 65,
        notes: 'Upgrading from 50Mbps plan'
      },
      {
        id: 'INS003',
        customer: {
          name: 'Bob Wilson',
          phone: '0845678901',
          email: 'bob.wilson@email.com',
          address: '789 Pine Rd, Wellington'
        },
        type: 'repair',
        status: 'completed',
        scheduledDate: new Date(),
        timeSlot: '14:00 - 16:00',
        assignedTeam: 'Team Charlie',
        technicians: ['Tech 4', 'Tech 5'],
        package: '50/50 Mbps',
        connectionType: 'FTTB',
        priority: 'urgent',
        progress: 100,
        qualityScore: 4.5,
        notes: 'Fiber cable damaged, replaced successfully'
      }
    ];

    const mockTechnicians: TechnicianStatus[] = [
      { id: 'T1', name: 'Tech 1', status: 'on_job', currentJob: 'INS001', completedToday: 2, location: 'Stellenbosch' },
      { id: 'T2', name: 'Tech 2', status: 'on_job', currentJob: 'INS001', completedToday: 2, location: 'Stellenbosch' },
      { id: 'T3', name: 'Tech 3', status: 'on_job', currentJob: 'INS002', completedToday: 3, location: 'Paarl' },
      { id: 'T4', name: 'Tech 4', status: 'available', completedToday: 4, location: 'Wellington' },
      { id: 'T5', name: 'Tech 5', status: 'break', completedToday: 3, location: 'Wellington' }
    ];

    setInstallations(mockInstallations);
    setTechnicians(mockTechnicians);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'scheduled': return 'info';
      case 'failed': return 'error';
      case 'postponed': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTechnicianStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4caf50';
      case 'on_job': return '#2196f3';
      case 'break': return '#ff9800';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, installation: Installation) => {
    setAnchorEl(event.currentTarget);
    setSelectedInstallation(installation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const stats = {
    totalToday: installations.length,
    completed: installations.filter(i => i.status === 'completed').length,
    inProgress: installations.filter(i => i.status === 'in_progress').length,
    scheduled: installations.filter(i => i.status === 'scheduled').length,
    failed: installations.filter(i => i.status === 'failed').length,
    avgCompletionTime: '2.5 hrs',
    successRate: '92%',
    technicianUtilization: '85%'
  };

  const filteredInstallations = filterStatus === 'all' 
    ? installations 
    : installations.filter(i => i.status === filterStatus);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Home Installations
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date</InputLabel>
            <Select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              label="Date"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="tomorrow">Tomorrow</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={loadInstallationsData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Map">
            <IconButton>
              <MapIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Schedule Installation
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HomeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.totalToday}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Total Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.completed}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BuildIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.inProgress}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.scheduled}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.successRate}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.technicianUtilization}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Tech Utilization
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
                <Tab label="All Installations" />
                <Tab label="In Progress" />
                <Tab label="Scheduled" />
                <Tab label="Completed" />
              </Tabs>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInstallations.map((installation) => (
                      <TableRow key={installation.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {installation.customer.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {installation.customer.address}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={installation.type.replace(/_/g, ' ')} 
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {installation.scheduledDate.toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {installation.timeSlot}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {installation.assignedTeam}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {installation.technicians.length} techs
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={installation.status.replace(/_/g, ' ')}
                            color={getStatusColor(installation.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={installation.progress}
                              color={installation.progress === 100 ? 'success' : 'primary'}
                            />
                            <Typography variant="caption">
                              {installation.progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={installation.priority}
                            color={getPriorityColor(installation.priority) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small"
                            onClick={(e) => handleMenuClick(e, installation)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Technician Status
              </Typography>
              <List>
                {technicians.map((tech) => (
                  <React.Fragment key={tech.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getTechnicianStatusColor(tech.status), width: 32, height: 32 }}>
                          {tech.name[0]}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={tech.name}
                        secondary={
                          <Box>
                            <Chip 
                              label={tech.status.replace('_', ' ')} 
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            {tech.currentJob && (
                              <Typography variant="caption">
                                Job: {tech.currentJob}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Typography variant="caption" color="textSecondary">
                        {tech.completedToday} done
                      </Typography>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Installation Quality
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Speed Tests Passed</Typography>
                  <Typography variant="body2" color="success.main">95%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={95} color="success" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Signal Quality</Typography>
                  <Typography variant="body2" color="primary">88%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={88} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Customer Satisfaction</Typography>
                  <Typography variant="body2" color="primary">4.5/5</Typography>
                </Box>
                <Rating value={4.5} precision={0.5} readOnly size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); setOpenDetailsDialog(true); }}>
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>Update Status</MenuItem>
        <MenuItem onClick={handleMenuClose}>Assign Team</MenuItem>
        <MenuItem onClick={handleMenuClose}>Add Notes</MenuItem>
        <MenuItem onClick={handleMenuClose}>Upload Photos</MenuItem>
        <MenuItem onClick={handleMenuClose}>Complete Installation</MenuItem>
        <MenuItem onClick={handleMenuClose}>Reschedule</MenuItem>
      </Menu>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule New Installation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Installation Address"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Installation Type</InputLabel>
                <Select label="Installation Type">
                  <MenuItem value="new">New Installation</MenuItem>
                  <MenuItem value="upgrade">Upgrade</MenuItem>
                  <MenuItem value="relocation">Relocation</MenuItem>
                  <MenuItem value="repair">Repair</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Package</InputLabel>
                <Select label="Package">
                  <MenuItem value="50">50/50 Mbps</MenuItem>
                  <MenuItem value="100">100/100 Mbps</MenuItem>
                  <MenuItem value="200">200/200 Mbps</MenuItem>
                  <MenuItem value="500">500/500 Mbps</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scheduled Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Time Slot</InputLabel>
                <Select label="Time Slot">
                  <MenuItem value="09-11">09:00 - 11:00</MenuItem>
                  <MenuItem value="11-13">11:00 - 13:00</MenuItem>
                  <MenuItem value="14-16">14:00 - 16:00</MenuItem>
                  <MenuItem value="16-18">16:00 - 18:00</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requirements / Notes"
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Schedule Installation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Installation Details</DialogTitle>
        <DialogContent>
          {selectedInstallation && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Installation ID: {selectedInstallation.id}
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Customer Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText primary={selectedInstallation.customer.name} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PhoneIcon /></ListItemIcon>
                      <ListItemText primary={selectedInstallation.customer.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EmailIcon /></ListItemIcon>
                      <ListItemText primary={selectedInstallation.customer.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LocationOnIcon /></ListItemIcon>
                      <ListItemText primary={selectedInstallation.customer.address} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Technical Details</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><RouterIcon /></ListItemIcon>
                      <ListItemText primary={`Package: ${selectedInstallation.package}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SignalIcon /></ListItemIcon>
                      <ListItemText primary={`Type: ${selectedInstallation.connectionType}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EngineeringIcon /></ListItemIcon>
                      <ListItemText primary={`Team: ${selectedInstallation.assignedTeam}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                      <ListItemText primary={`Schedule: ${selectedInstallation.timeSlot}`} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomeInstallationsDashboard;