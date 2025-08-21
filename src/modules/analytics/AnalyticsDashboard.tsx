import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/PigmentGrid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  Groups as GroupsIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DailyProgress {
  date: string;
  polesInstalled: number;
  fiberStrung: number;
  dropsCompleted: number;
  homesPassed: number;
  homesConnected: number;
  target: number;
  actual: number;
}

interface TeamPerformance {
  team: string;
  productivity: number;
  quality: number;
  safety: number;
  completedTasks: number;
  pendingTasks: number;
}

interface ProjectKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [kpis, setKPIs] = useState<ProjectKPI[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, selectedProject]);

  const loadAnalyticsData = () => {
    const mockDailyProgress: DailyProgress[] = [
      { date: '2024-02-05', polesInstalled: 12, fiberStrung: 850, dropsCompleted: 8, homesPassed: 45, homesConnected: 32, target: 40, actual: 38 },
      { date: '2024-02-06', polesInstalled: 15, fiberStrung: 920, dropsCompleted: 10, homesPassed: 52, homesConnected: 38, target: 40, actual: 42 },
      { date: '2024-02-07', polesInstalled: 18, fiberStrung: 1100, dropsCompleted: 12, homesPassed: 58, homesConnected: 44, target: 45, actual: 48 },
      { date: '2024-02-08', polesInstalled: 14, fiberStrung: 780, dropsCompleted: 9, homesPassed: 48, homesConnected: 35, target: 45, actual: 41 },
      { date: '2024-02-09', polesInstalled: 20, fiberStrung: 1250, dropsCompleted: 15, homesPassed: 65, homesConnected: 50, target: 50, actual: 52 },
      { date: '2024-02-10', polesInstalled: 22, fiberStrung: 1400, dropsCompleted: 18, homesPassed: 72, homesConnected: 55, target: 50, actual: 58 },
      { date: '2024-02-11', polesInstalled: 16, fiberStrung: 980, dropsCompleted: 11, homesPassed: 55, homesConnected: 42, target: 45, actual: 44 }
    ];

    const mockTeamPerformance: TeamPerformance[] = [
      { team: 'Alpha Team', productivity: 92, quality: 88, safety: 95, completedTasks: 145, pendingTasks: 12 },
      { team: 'Bravo Team', productivity: 85, quality: 90, safety: 92, completedTasks: 132, pendingTasks: 18 },
      { team: 'Charlie Team', productivity: 78, quality: 85, safety: 88, completedTasks: 118, pendingTasks: 25 },
      { team: 'Delta Team', productivity: 88, quality: 92, safety: 90, completedTasks: 138, pendingTasks: 15 }
    ];

    const mockKPIs: ProjectKPI[] = [
      { name: 'Daily Pole Installation', value: 17.4, target: 15, unit: 'poles/day', trend: 'up', changePercent: 12.5 },
      { name: 'Fiber Deployment Rate', value: 1042, target: 1000, unit: 'meters/day', trend: 'up', changePercent: 4.2 },
      { name: 'Drop Completion Rate', value: 85, target: 80, unit: '%', trend: 'up', changePercent: 6.25 },
      { name: 'Homes Passed', value: 385, target: 350, unit: 'homes/week', trend: 'up', changePercent: 10 },
      { name: 'Connection Success Rate', value: 76, target: 85, unit: '%', trend: 'down', changePercent: -10.6 },
      { name: 'Team Utilization', value: 88, target: 90, unit: '%', trend: 'stable', changePercent: -2.2 },
      { name: 'Quality Score', value: 89, target: 85, unit: 'points', trend: 'up', changePercent: 4.7 },
      { name: 'Safety Incidents', value: 0, target: 0, unit: 'incidents', trend: 'stable', changePercent: 0 }
    ];

    setDailyProgress(mockDailyProgress);
    setTeamPerformance(mockTeamPerformance);
    setKPIs(mockKPIs);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="success" />;
      case 'down': return <TrendingDownIcon color="error" />;
      default: return <ShowChartIcon color="action" />;
    }
  };


  const pieData = [
    { name: 'Completed', value: 65, color: '#4caf50' },
    { name: 'In Progress', value: 25, color: '#2196f3' },
    { name: 'Pending', value: 10, color: '#ff9800' }
  ];

  const exportData = () => {
    console.log('Exporting analytics data...');
  };

  const refreshData = () => {
    loadAnalyticsData();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              label="Project"
            >
              <MenuItem value="all">All Projects</MenuItem>
              <MenuItem value="stellenbosch">Stellenbosch</MenuItem>
              <MenuItem value="paarl">Paarl</MenuItem>
              <MenuItem value="wellington">Wellington</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={refreshData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Report">
            <IconButton onClick={exportData}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {kpis.slice(0, 4).map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {kpi.name}
                  </Typography>
                  {getTrendIcon(kpi.trend)}
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {kpi.value}
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {kpi.unit}
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((kpi.value / kpi.target) * 100, 100)}
                    sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    color={kpi.value >= kpi.target ? 'success' : 'warning'}
                  />
                  <Typography variant="caption" color={kpi.changePercent >= 0 ? 'success.main' : 'error.main'}>
                    {kpi.changePercent >= 0 ? '+' : ''}{kpi.changePercent}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Target: {kpi.target} {kpi.unit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Progress Trend
              </Typography>
              <ButtonGroup size="small" sx={{ mb: 2 }}>
                <Button variant={selectedMetric === 'overview' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('overview')}>
                  Overview
                </Button>
                <Button variant={selectedMetric === 'poles' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('poles')}>
                  Poles
                </Button>
                <Button variant={selectedMetric === 'fiber' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('fiber')}>
                  Fiber
                </Button>
                <Button variant={selectedMetric === 'homes' ? 'contained' : 'outlined'} onClick={() => setSelectedMetric('homes')}>
                  Homes
                </Button>
              </ButtonGroup>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  {selectedMetric === 'overview' && (
                    <>
                      <Area type="monotone" dataKey="actual" stroke="#2196f3" fill="#2196f3" fillOpacity={0.6} name="Actual" />
                      <Area type="monotone" dataKey="target" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} name="Target" />
                    </>
                  )}
                  {selectedMetric === 'poles' && (
                    <Area type="monotone" dataKey="polesInstalled" stroke="#ff9800" fill="#ff9800" fillOpacity={0.6} name="Poles Installed" />
                  )}
                  {selectedMetric === 'fiber' && (
                    <Area type="monotone" dataKey="fiberStrung" stroke="#9c27b0" fill="#9c27b0" fillOpacity={0.6} name="Fiber Strung (m)" />
                  )}
                  {selectedMetric === 'homes' && (
                    <>
                      <Area type="monotone" dataKey="homesPassed" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} name="Homes Passed" />
                      <Area type="monotone" dataKey="homesConnected" stroke="#2196f3" fill="#2196f3" fillOpacity={0.6} name="Homes Connected" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Completion Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {pieData.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: item.color, mr: 1, borderRadius: 1 }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>{item.name}</Typography>
                    <Typography variant="body2" fontWeight="bold">{item.value}%</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Performance Metrics
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      <TableCell align="center">Productivity</TableCell>
                      <TableCell align="center">Quality</TableCell>
                      <TableCell align="center">Safety</TableCell>
                      <TableCell align="center">Completed Tasks</TableCell>
                      <TableCell align="center">Pending Tasks</TableCell>
                      <TableCell align="center">Overall Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamPerformance.map((team) => {
                      const overallScore = Math.round((team.productivity + team.quality + team.safety) / 3);
                      return (
                        <TableRow key={team.team}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <GroupsIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="subtitle2">{team.team}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={team.productivity}
                                sx={{ width: 60, mr: 1 }}
                                color={team.productivity >= 90 ? 'success' : team.productivity >= 70 ? 'warning' : 'error'}
                              />
                              <Typography variant="body2">{team.productivity}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={team.quality}
                                sx={{ width: 60, mr: 1 }}
                                color={team.quality >= 90 ? 'success' : team.quality >= 70 ? 'warning' : 'error'}
                              />
                              <Typography variant="body2">{team.quality}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={team.safety}
                                sx={{ width: 60, mr: 1 }}
                                color={team.safety >= 90 ? 'success' : team.safety >= 70 ? 'warning' : 'error'}
                              />
                              <Typography variant="body2">{team.safety}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={team.completedTasks} color="success" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={team.pendingTasks} color="warning" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${overallScore}%`}
                              color={overallScore >= 90 ? 'success' : overallScore >= 70 ? 'warning' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resource Utilization
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="completedTasks" fill="#4caf50" name="Completed" />
                  <Bar dataKey="pendingTasks" fill="#ff9800" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;