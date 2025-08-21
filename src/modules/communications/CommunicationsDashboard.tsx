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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  Task as TaskIcon,
  Notifications as NotificationsIcon,
  VideoCall as VideoCallIcon,
  Group as GroupIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AttachFile as AttachFileIcon,
  PriorityHigh as PriorityHighIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

interface Meeting {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  type: 'video' | 'in-person' | 'phone';
  organizer: string;
  participants: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  agenda: string;
  actionItems: ActionItem[];
  recordingUrl?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeAvatar?: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  project: string;
  tags: string[];
  comments: number;
  attachments: number;
  completedSubtasks: number;
  totalSubtasks: number;
}

interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  dueDate?: Date;
  completed: boolean;
}

interface Notification {
  id: string;
  type: 'task' | 'meeting' | 'comment' | 'mention';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const CommunicationsDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    loadCommunicationsData();
  }, []);

  const loadCommunicationsData = () => {
    const mockMeetings: Meeting[] = [
      {
        id: 'MTG001',
        title: 'Weekly Project Sync',
        date: new Date('2024-02-12'),
        time: '09:00',
        duration: '1 hour',
        type: 'video',
        organizer: 'John Smith',
        participants: ['Sarah Johnson', 'Mike Davis', 'Emma Wilson'],
        status: 'scheduled',
        agenda: 'Review weekly progress, discuss blockers, plan next sprint',
        actionItems: [
          { id: 'AI001', text: 'Update project timeline', assignee: 'Sarah Johnson', dueDate: new Date('2024-02-14'), completed: false },
          { id: 'AI002', text: 'Review contractor compliance', assignee: 'Mike Davis', completed: false }
        ]
      },
      {
        id: 'MTG002',
        title: 'Contractor Onboarding Review',
        date: new Date('2024-02-13'),
        time: '14:00',
        duration: '30 minutes',
        type: 'in-person',
        organizer: 'Sarah Johnson',
        participants: ['John Smith', 'Emma Wilson'],
        status: 'scheduled',
        agenda: 'Review new contractor applications and approval workflow',
        actionItems: []
      },
      {
        id: 'MTG003',
        title: 'Safety Briefing',
        date: new Date('2024-02-11'),
        time: '08:00',
        duration: '45 minutes',
        type: 'in-person',
        organizer: 'Mike Davis',
        participants: ['Field Team Alpha', 'Field Team Bravo'],
        status: 'completed',
        agenda: 'Monthly safety review and training',
        actionItems: [],
        recordingUrl: 'https://recordings.example.com/safety-briefing'
      }
    ];

    const mockTasks: Task[] = [
      {
        id: 'TSK001',
        title: 'Complete fiber stringing section A1-A5',
        description: 'Install fiber optic cable between poles A1 through A5',
        assignee: 'Field Team Alpha',
        dueDate: new Date('2024-02-13'),
        priority: 'high',
        status: 'in-progress',
        project: 'Stellenbosch Phase 1',
        tags: ['fiber', 'installation', 'priority'],
        comments: 3,
        attachments: 2,
        completedSubtasks: 3,
        totalSubtasks: 5
      },
      {
        id: 'TSK002',
        title: 'Update contractor documentation',
        description: 'Review and update expired contractor certificates',
        assignee: 'Sarah Johnson',
        dueDate: new Date('2024-02-15'),
        priority: 'medium',
        status: 'todo',
        project: 'Compliance',
        tags: ['documentation', 'compliance'],
        comments: 1,
        attachments: 0,
        completedSubtasks: 0,
        totalSubtasks: 4
      },
      {
        id: 'TSK003',
        title: 'Inspect completed pole installations',
        description: 'Quality check for poles P101-P120',
        assignee: 'Mike Davis',
        dueDate: new Date('2024-02-12'),
        priority: 'high',
        status: 'review',
        project: 'Paarl Extension',
        tags: ['inspection', 'quality'],
        comments: 5,
        attachments: 10,
        completedSubtasks: 18,
        totalSubtasks: 20
      },
      {
        id: 'TSK004',
        title: 'Generate monthly progress report',
        description: 'Compile analytics and KPIs for February',
        assignee: 'Emma Wilson',
        dueDate: new Date('2024-02-28'),
        priority: 'low',
        status: 'todo',
        project: 'Reporting',
        tags: ['reporting', 'analytics'],
        comments: 0,
        attachments: 0,
        completedSubtasks: 0,
        totalSubtasks: 3
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: 'NOT001',
        type: 'task',
        title: 'Task Assigned',
        message: 'You have been assigned to "Complete fiber stringing section A1-A5"',
        timestamp: new Date(),
        read: false
      },
      {
        id: 'NOT002',
        type: 'meeting',
        title: 'Meeting Starting Soon',
        message: 'Weekly Project Sync starts in 15 minutes',
        timestamp: new Date(),
        read: false
      },
      {
        id: 'NOT003',
        type: 'comment',
        title: 'New Comment',
        message: 'John Smith commented on "Inspect completed pole installations"',
        timestamp: new Date('2024-02-11'),
        read: true
      }
    ];

    setMeetings(mockMeetings);
    setTasks(mockTasks);
    setNotifications(mockNotifications);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'review': return 'secondary';
      case 'todo': return 'default';
      default: return 'default';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCallIcon />;
      case 'in-person': return <GroupIcon />;
      case 'phone': return <EventIcon />;
      default: return <EventIcon />;
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const upcomingMeetings = meetings.filter(m => 
    m.status === 'scheduled' && m.date >= new Date()
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Communications Portal
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Badge badgeContent={unreadNotifications} color="error">
            <IconButton>
              <NotificationsIcon />
            </IconButton>
          </Badge>
          <Button
            variant="outlined"
            startIcon={<EventIcon />}
            onClick={() => setOpenMeetingDialog(true)}
          >
            Schedule Meeting
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenTaskDialog(true)}
          >
            Create Task
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{upcomingMeetings.length}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Upcoming Meetings
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TaskIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{tasks.filter(t => t.status !== 'completed').length}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Active Tasks
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PriorityHighIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">{tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                High Priority Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Card>
            <CardContent>
              <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
                <Tab label="Tasks" icon={<TaskIcon />} iconPosition="start" />
                <Tab label="Meetings" icon={<EventIcon />} iconPosition="start" />
                <Tab label="Action Items" icon={<AssignmentIcon />} iconPosition="start" />
              </Tabs>

              {selectedTab === 0 && (
                <>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="todo">To Do</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="review">Review</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        label="Priority"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox />
                          </TableCell>
                          <TableCell>Task</TableCell>
                          <TableCell>Assignee</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell padding="checkbox">
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="subtitle2">{task.title}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {task.project}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  {task.tags.map(tag => (
                                    <Chip key={tag} label={tag} size="small" />
                                  ))}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                  {task.assignee[0]}
                                </Avatar>
                                <Typography variant="body2">{task.assignee}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {task.dueDate.toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.priority}
                                color={getPriorityColor(task.priority) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.status.replace('-', ' ')}
                                color={getStatusColor(task.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption">
                                  {task.completedSubtasks}/{task.totalSubtasks}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  {task.comments > 0 && (
                                    <Chip icon={<CommentIcon />} label={task.comments} size="small" />
                                  )}
                                  {task.attachments > 0 && (
                                    <Chip icon={<AttachFileIcon />} label={task.attachments} size="small" />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={handleMenuClick}>
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {selectedTab === 1 && (
                <List>
                  {meetings.map((meeting) => (
                    <React.Fragment key={meeting.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            {getMeetingTypeIcon(meeting.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">{meeting.title}</Typography>
                              <Chip 
                                label={meeting.status} 
                                size="small"
                                color={meeting.status === 'completed' ? 'success' : 'default'}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {meeting.date.toLocaleDateString()} at {meeting.time} • {meeting.duration}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Organizer: {meeting.organizer}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <AvatarGroup max={4}>
                                  {meeting.participants.map((p, i) => (
                                    <Avatar key={i} sx={{ width: 24, height: 24 }}>
                                      {p[0]}
                                    </Avatar>
                                  ))}
                                </AvatarGroup>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => console.log('Meeting details:', meeting)}>
                            <MoreVertIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}

              {selectedTab === 2 && (
                <List>
                  {meetings.flatMap(meeting => 
                    meeting.actionItems.map(item => (
                      <ListItem key={item.id}>
                        <ListItemAvatar>
                          <IconButton onClick={() => {}}>
                            {item.completed ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon />}
                          </IconButton>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.text}
                          secondary={
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                Assigned to: {item.assignee}
                              </Typography>
                              {item.dueDate && (
                                <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                                  Due: {item.dueDate.toLocaleDateString()}
                                </Typography>
                              )}
                              <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                                From: {meeting.title}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
        <MenuItem onClick={handleMenuClose}>Assign</MenuItem>
        <MenuItem onClick={handleMenuClose}>Add Comment</MenuItem>
        <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Assignee</InputLabel>
            <Select label="Assignee">
              <MenuItem value="john">John Smith</MenuItem>
              <MenuItem value="sarah">Sarah Johnson</MenuItem>
              <MenuItem value="mike">Mike Davis</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select label="Priority">
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setOpenTaskDialog(false)}>Create Task</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openMeetingDialog}
        onClose={() => setOpenMeetingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Meeting</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Meeting Title"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Meeting Type</InputLabel>
            <Select label="Meeting Type">
              <MenuItem value="video">Video Call</MenuItem>
              <MenuItem value="in-person">In Person</MenuItem>
              <MenuItem value="phone">Phone Call</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Agenda"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setOpenMeetingDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setOpenMeetingDialog(false)}>Schedule</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CommunicationsDashboard;