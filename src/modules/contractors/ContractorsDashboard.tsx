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
  TextField,
  Tab,
  Tabs,
  Alert,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Groups as GroupsIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

interface Contractor {
  id: string;
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'pending_onboarding' | 'onboarding_in_progress' | 'pending_approval' | 'approved' | 'suspended' | 'blacklisted';
  ragScore: {
    overall: 'red' | 'amber' | 'green';
    financial: 'red' | 'amber' | 'green';
    compliance: 'red' | 'amber' | 'green';
    performance: 'red' | 'amber' | 'green';
    safety: 'red' | 'amber' | 'green';
  };
  onboardingProgress: number;
  documentsExpiring: number;
  activeProjects: number;
  complianceIssues: number;
  lastActivity: Date;
}

const ContractorsDashboard: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [openOnboarding, setOpenOnboarding] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = () => {
    const mockData: Contractor[] = [
      {
        id: 'CTR001',
        companyName: 'FiberTech Solutions',
        registrationNumber: '2020/123456/07',
        contactPerson: 'John Smith',
        email: 'john@fibertech.co.za',
        phone: '0821234567',
        status: 'approved',
        ragScore: {
          overall: 'green',
          financial: 'green',
          compliance: 'amber',
          performance: 'green',
          safety: 'green'
        },
        onboardingProgress: 100,
        documentsExpiring: 2,
        activeProjects: 3,
        complianceIssues: 1,
        lastActivity: new Date('2024-02-10')
      },
      {
        id: 'CTR002',
        companyName: 'Network Builders Co',
        registrationNumber: '2019/654321/07',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@networkbuilders.co.za',
        phone: '0834567890',
        status: 'pending_approval',
        ragScore: {
          overall: 'amber',
          financial: 'green',
          compliance: 'amber',
          performance: 'amber',
          safety: 'green'
        },
        onboardingProgress: 75,
        documentsExpiring: 1,
        activeProjects: 1,
        complianceIssues: 3,
        lastActivity: new Date()
      },
      {
        id: 'CTR003',
        companyName: 'QuickConnect Ltd',
        registrationNumber: '2021/789012/07',
        contactPerson: 'Mike Davis',
        email: 'mike@quickconnect.co.za',
        phone: '0845678901',
        status: 'onboarding_in_progress',
        ragScore: {
          overall: 'red',
          financial: 'amber',
          compliance: 'red',
          performance: 'amber',
          safety: 'red'
        },
        onboardingProgress: 40,
        documentsExpiring: 0,
        activeProjects: 0,
        complianceIssues: 5,
        lastActivity: new Date()
      }
    ];
    setContractors(mockData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending_approval': return 'warning';
      case 'onboarding_in_progress': return 'info';
      case 'suspended': return 'error';
      case 'blacklisted': return 'error';
      default: return 'default';
    }
  };

  const getRAGColor = (status: 'red' | 'amber' | 'green') => {
    switch (status) {
      case 'green': return '#4caf50';
      case 'amber': return '#ff9800';
      case 'red': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getRAGIcon = (status: 'red' | 'amber' | 'green') => {
    switch (status) {
      case 'green': return <CheckCircleIcon style={{ color: getRAGColor(status) }} />;
      case 'amber': return <WarningIcon style={{ color: getRAGColor(status) }} />;
      case 'red': return <ErrorIcon style={{ color: getRAGColor(status) }} />;
      default: return null;
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, contractor: Contractor) => {
    setAnchorEl(event.currentTarget);
    setSelectedContractor(contractor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const stats = {
    total: contractors.length,
    approved: contractors.filter(c => c.status === 'approved').length,
    onboarding: contractors.filter(c => c.status === 'onboarding_in_progress').length,
    pendingApproval: contractors.filter(c => c.status === 'pending_approval').length,
    redRAG: contractors.filter(c => c.ragScore.overall === 'red').length,
    expiringDocs: contractors.reduce((sum, c) => sum + c.documentsExpiring, 0)
  };

  const filteredContractors = filterStatus === 'all' 
    ? contractors 
    : contractors.filter(c => c.status === filterStatus);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Contractors Portal
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenOnboarding(true)}
        >
          Add New Contractor
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.total}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Total Contractors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.approved}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.onboarding}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Onboarding
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.pendingApproval}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.redRAG}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Red RAG Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Badge badgeContent={stats.expiringDocs} color="error">
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                </Badge>
                <Typography variant="h6" sx={{ ml: 2 }}>{stats.expiringDocs}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Expiring Documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
            <Tab label="All Contractors" />
            <Tab label="Pending Onboarding" />
            <Tab label="Compliance Issues" />
            <Tab label="Document Expiry" />
          </Tabs>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">RAG Score</TableCell>
                  <TableCell align="center">Onboarding</TableCell>
                  <TableCell align="center">Projects</TableCell>
                  <TableCell align="center">Compliance</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContractors.map((contractor) => (
                  <TableRow key={contractor.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {contractor.companyName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {contractor.registrationNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{contractor.contactPerson}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {contractor.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contractor.status.replace(/_/g, ' ').toUpperCase()}
                        color={getStatusColor(contractor.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title={`Overall: ${contractor.ragScore.overall}`}>
                          {getRAGIcon(contractor.ragScore.overall)}
                        </Tooltip>
                        <Tooltip title={`Financial: ${contractor.ragScore.financial}`}>
                          <AccountBalanceIcon 
                            fontSize="small" 
                            style={{ color: getRAGColor(contractor.ragScore.financial) }}
                          />
                        </Tooltip>
                        <Tooltip title={`Compliance: ${contractor.ragScore.compliance}`}>
                          <VerifiedIcon 
                            fontSize="small" 
                            style={{ color: getRAGColor(contractor.ragScore.compliance) }}
                          />
                        </Tooltip>
                        <Tooltip title={`Performance: ${contractor.ragScore.performance}`}>
                          <TrendingUpIcon 
                            fontSize="small" 
                            style={{ color: getRAGColor(contractor.ragScore.performance) }}
                          />
                        </Tooltip>
                        <Tooltip title={`Safety: ${contractor.ragScore.safety}`}>
                          <SecurityIcon 
                            fontSize="small" 
                            style={{ color: getRAGColor(contractor.ragScore.safety) }}
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ width: 100 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={contractor.onboardingProgress}
                          color={contractor.onboardingProgress === 100 ? 'success' : 'primary'}
                        />
                        <Typography variant="caption">
                          {contractor.onboardingProgress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={contractor.activeProjects} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      {contractor.complianceIssues > 0 ? (
                        <Chip 
                          label={contractor.complianceIssues} 
                          color="error" 
                          size="small"
                        />
                      ) : (
                        <Chip 
                          label="OK" 
                          color="success" 
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {contractor.lastActivity.toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small"
                        onClick={(e) => handleMenuClick(e, contractor)}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Information</MenuItem>
        <MenuItem onClick={handleMenuClose}>View Documents</MenuItem>
        <MenuItem onClick={handleMenuClose}>RAG Assessment</MenuItem>
        <MenuItem onClick={handleMenuClose}>Compliance Report</MenuItem>
        <MenuItem onClick={handleMenuClose}>Suspend Contractor</MenuItem>
      </Menu>

      <Dialog
        open={openOnboarding}
        onClose={() => setOpenOnboarding(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>New Contractor Onboarding</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Start the onboarding process for a new contractor. This will guide them through
            all required documentation, certifications, and compliance requirements.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Company Name"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Registration Number"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Contact Person"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
            />
          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setOpenOnboarding(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => setOpenOnboarding(false)}>
              Start Onboarding
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ContractorsDashboard;