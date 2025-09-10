const fs = require('fs');
const path = require('path');

/**
 * Script to fix router mounting issues by converting components to dynamic imports
 */

// List of components that need to be converted to dynamic imports
const componentsToFix = [
  'src/modules/onemap/OneMapDashboard.tsx',
  'src/modules/projects/components/ProjectWizard/ProjectCreationWizard.tsx',
  'src/modules/staff/components/StaffList.tsx',
  'src/modules/reports/ReportsDashboard.tsx',
  'src/modules/kpi-dashboard/KPIDashboard.tsx',
  'src/modules/kpis/EnhancedKPIDashboard.tsx',
  'src/modules/contractors/ContractorsDashboard.tsx',
  'src/modules/suppliers/SuppliersPage.tsx',
  'src/modules/action-items/ActionItemsDashboard.tsx',
  'src/modules/sow/SOWListPage.tsx',
  'src/modules/sow/SOWImportPage.tsx',
  'src/modules/sow/SOWDashboard.tsx',
  'src/modules/projects/tracker/UnifiedTrackerGrid.tsx',
  'src/modules/projects/sow/components/SOWHeader.tsx',
  'src/modules/projects/pole-tracker/PoleTrackerDashboard.tsx',
  'src/modules/projects/pole-tracker/PoleTrackerDetail.tsx',
  'src/modules/projects/pole-tracker/PoleTrackerList.tsx',
  'src/modules/projects/pole-tracker/PoleTrackerList/components/PoleTrackerGrid.tsx',
  'src/modules/projects/pole-tracker/PoleTrackerList/components/PoleTrackerTable.tsx',
  'src/modules/projects/home-installs/HomeInstallsDashboard.tsx',
  'src/modules/projects/home-installs/HomeInstallsList.tsx',
  'src/modules/projects/ProjectCreatePage.tsx',
  'src/modules/projects/components/ProjectListHeader.tsx',
  'src/modules/projects/components/ProjectTable.tsx',
  'src/modules/projects/ProjectEditPage.tsx',
  'src/modules/clients/components/ClientListHeader.tsx',
  'src/modules/clients/components/ClientTableRow.tsx',
  'src/modules/clients/components/ClientForm.tsx',
  'src/modules/clients/components/ClientDetail.tsx',
  'src/modules/staff/components/StaffDetail.tsx',
  'src/modules/staff/components/StaffForm.tsx',
  'src/components/search/GlobalSearch.tsx',
  'src/components/dashboard/EnhancedStatCard.tsx',
  'src/modules/dashboard/components/QuickActions.tsx'
];

function convertToDynamicImport(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Check if it already has 'use client' directive
  if (content.includes("'use client'")) {
    console.log(`Already converted: ${filePath}`);
    return;
  }

  // Add 'use client' directive at the top
  content = "'use client';\n\n" + content;

  fs.writeFileSync(fullPath, content);
  console.log(`Converted: ${filePath}`);
}

console.log('Converting components to client-side only...');

componentsToFix.forEach(convertToDynamicImport);

console.log('\nConversion complete!');
console.log('Now you can use dynamic imports in your pages:');
console.log(`
import dynamic from 'next/dynamic';

const ComponentName = dynamic(() => import('../path/to/component'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
`);