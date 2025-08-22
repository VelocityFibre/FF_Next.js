import { lazy } from 'react';

// Core
export const Dashboard = lazy(() => import('@/modules/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
export const VFThemeTest = lazy(() => import('@/pages/test/VFThemeTest'));

// Client Module
export const ClientsPage = lazy(() => import('@/modules/clients/ClientsPage').then(m => ({ default: m.ClientsPage })));
export const ClientCreatePage = lazy(() => import('@/modules/clients/ClientCreatePage').then(m => ({ default: m.ClientCreatePage })));
export const ClientEditPage = lazy(() => import('@/modules/clients/ClientEditPage').then(m => ({ default: m.ClientEditPage })));
export const ClientDetailPage = lazy(() => import('@/modules/clients/ClientDetailPage').then(m => ({ default: m.ClientDetailPage })));

// Staff Module
export const StaffPage = lazy(() => import('@/modules/staff/StaffPage').then(m => ({ default: m.StaffPage })));
export const StaffCreatePage = lazy(() => import('@/modules/staff/StaffCreatePage').then(m => ({ default: m.StaffCreatePage })));
export const StaffEditPage = lazy(() => import('@/modules/staff/StaffEditPage').then(m => ({ default: m.StaffEditPage })));
export const StaffDetailPage = lazy(() => import('@/modules/staff/StaffDetailPage').then(m => ({ default: m.StaffDetailPage })));
export const StaffImport = lazy(() => import('@/modules/staff/StaffImport').then(m => ({ default: m.StaffImport })));
export const StaffSettings = lazy(() => import('@/modules/settings/StaffSettings').then(m => ({ default: m.StaffSettings })));

// Procurement Module
export const ProcurementPage = lazy(() => import('@/modules/procurement/ProcurementPage').then(m => ({ default: m.ProcurementPage })));
export const ProcurementOverview = lazy(() => import('@/modules/procurement/ProcurementOverview').then(m => ({ default: m.ProcurementOverview })));
export const BOQListPage = lazy(() => import('@/modules/procurement/boq/BOQListPage').then(m => ({ default: m.BOQListPage })));
export const RFQListPage = lazy(() => import('@/modules/procurement/rfq/RFQListPage').then(m => ({ default: m.RFQListPage })));
export const SuppliersPage = lazy(() => import('@/modules/suppliers/SuppliersPage').then(m => ({ default: m.SuppliersPage })));

// Communications Module
export const MeetingsDashboard = lazy(() => import('@/modules/meetings/MeetingsDashboard').then(m => ({ default: m.MeetingsDashboard })));
export const ActionItemsDashboard = lazy(() => import('@/modules/action-items/ActionItemsDashboard').then(m => ({ default: m.ActionItemsDashboard })));
export const TasksDashboard = lazy(() => import('@/modules/tasks/TasksDashboard').then(m => ({ default: m.TasksDashboard })));

// SOW Module
export const SOWDashboard = lazy(() => import('@/modules/sow/SOWDashboard').then(m => ({ default: m.SOWDashboard })));
export const SOWListPage = lazy(() => import('@/modules/sow/SOWListPage').then(m => ({ default: m.SOWListPage })));

// Field Operations
export const OneMapDashboard = lazy(() => import('@/modules/onemap/OneMapDashboard').then(m => ({ default: m.OneMapDashboard })));
export const NokiaEquipmentDashboard = lazy(() => import('@/modules/nokia-equipment/NokiaEquipmentDashboard').then(m => ({ default: m.NokiaEquipmentDashboard })));

// Project Tracking
export const PoleTrackerDashboard = lazy(() => import('@/modules/projects/pole-tracker/PoleTrackerDashboard').then(m => ({ default: m.PoleTrackerDashboard })));
export const PoleTrackerList = lazy(() => import('@/modules/projects/pole-tracker/PoleTrackerList').then(m => ({ default: m.PoleTrackerList })));
export const UnifiedTrackerGrid = lazy(() => import('@/modules/projects/tracker/UnifiedTrackerGrid').then(m => ({ default: m.UnifiedTrackerGrid })));
export const HomeInstallsDashboard = lazy(() => import('@/modules/projects/home-installs/HomeInstallsDashboard').then(m => ({ default: m.HomeInstallsDashboard })));
export const HomeInstallsList = lazy(() => import('@/modules/projects/home-installs/HomeInstallsList').then(m => ({ default: m.HomeInstallsList })));

// Analytics Module
export const DailyProgressDashboard = lazy(() => import('@/modules/daily-progress/DailyProgressDashboard').then(m => ({ default: m.DailyProgressDashboard })));
export const EnhancedKPIDashboard = lazy(() => import('@/modules/kpis/EnhancedKPIDashboard').then(m => ({ default: m.EnhancedKPIDashboard })));
export const KPIDashboard = lazy(() => import('@/modules/kpi-dashboard/KPIDashboard').then(m => ({ default: m.KPIDashboard })));
export const ReportsDashboard = lazy(() => import('@/modules/reports/ReportsDashboard').then(m => ({ default: m.ReportsDashboard })));

// New Modules
export const ContractorsDashboard = lazy(() => import('@/modules/contractors/ContractorsDashboard').then(m => ({ default: m.default })));
export const AnalyticsDashboard = lazy(() => import('@/components/analytics/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
export const CommunicationsDashboard = lazy(() => import('@/modules/communications/CommunicationsDashboard').then(m => ({ default: m.default })));
export const HomeInstallationsDashboard = lazy(() => import('@/modules/installations/HomeInstallationsDashboard').then(m => ({ default: m.default })));
export const FieldAppPortal = lazy(() => import('@/modules/field-app/FieldAppPortal').then(m => ({ default: m.default })));
export const FiberStringingDashboard = lazy(() => import('@/modules/projects/fiber-stringing/FiberStringingDashboard').then(m => ({ default: m.FiberStringingDashboard })));
export const DropsManagement = lazy(() => import('@/modules/projects/drops/DropsManagement').then(m => ({ default: m.DropsManagement })));
export const PoleCaptureMobile = lazy(() => import('@/modules/projects/pole-tracker/mobile/PoleCaptureMobile').then(m => ({ default: m.PoleCaptureMobile })));
export const SOWManagement = lazy(() => import('@/modules/projects/sow/SOWManagement').then(m => ({ default: m.SOWManagement })));

// Legacy pages
// export const Projects = lazy(() => import('@/modules/projects/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
// export const ProjectForm = lazy(() => import('@/modules/projects/components/ProjectForm').then(m => ({ default: m.ProjectForm })));
// export const ProjectDetail = lazy(() => import('@/modules/projects/components/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
export const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
export const ProjectCreationWizard = lazy(() => import('@/modules/projects/components/ProjectCreationWizard').then(m => ({ default: m.ProjectCreationWizard })));