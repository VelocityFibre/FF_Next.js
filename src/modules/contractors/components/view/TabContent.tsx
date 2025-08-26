/**
 * Tab Content Component
 * Renders content based on active tab
 */

import { Contractor } from '@/types/contractor.types';
import { TabType } from './useContractorView';
import { ContractorOverview } from './ContractorOverview';
import { TeamManagement } from '../teams/TeamManagement';
import { AssignmentManagement } from '../assignments/AssignmentManagement';
import { DocumentManagement } from '../documents/DocumentManagement';
import { EnhancedOnboardingWorkflow } from '../onboarding/EnhancedOnboardingWorkflow';
import { ComplianceDashboard } from '../compliance/ComplianceDashboard';
import { RateCardManagement } from '../RateCardManagement';

interface TabContentProps {
  activeTab: TabType;
  contractor: Contractor;
}

export function TabContent({ activeTab, contractor }: TabContentProps) {
  switch (activeTab) {
    case 'overview':
      return <ContractorOverview contractor={contractor} />;
    
    case 'teams':
      return (
        <TeamManagement 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      );
    
    case 'assignments':
      return (
        <AssignmentManagement 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      );
    
    case 'documents':
      return (
        <DocumentManagement 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      );
    
    case 'onboarding':
      return (
        <EnhancedOnboardingWorkflow 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      );
    
    case 'compliance':
      return (
        <ComplianceDashboard 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      );
    
    case 'ratecards':
      return (
        <RateCardManagement 
          contractorId={contractor.id} 
        />
      );
    
    default:
      return null;
  }
}