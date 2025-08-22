/**
 * Contractor Onboarding Service - Handles contractor onboarding workflow
 * Manages document verification, compliance checks, and approval process
 */

import { db } from '@/lib/neon/connection';
import { contractors, contractorDocuments } from '@/lib/neon/schema';
import { eq, and } from 'drizzle-orm';
import { ContractorDocument, DocumentType } from '@/types/contractor.types';

export interface OnboardingStage {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  documents: DocumentType[];
  checklist: OnboardingChecklistItem[];
}

export interface OnboardingChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: 'legal' | 'financial' | 'technical' | 'safety' | 'insurance';
}

export interface OnboardingProgress {
  contractorId: string;
  currentStage: number;
  totalStages: number;
  completionPercentage: number;
  stages: OnboardingStage[];
  overallStatus: 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  lastUpdated: Date;
}

class ContractorOnboardingService {
  /**
   * Initialize onboarding process for a new contractor
   */
  async initializeOnboarding(contractorId: string): Promise<OnboardingProgress> {
    try {
      const stages = this.getOnboardingStages();
      
      const onboardingProgress: OnboardingProgress = {
        contractorId,
        currentStage: 0,
        totalStages: stages.length,
        completionPercentage: 0,
        stages,
        overallStatus: 'not_started',
        lastUpdated: new Date()
      };

      // Store onboarding progress (in production, this would be persisted)
      return onboardingProgress;
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
      throw error;
    }
  }

  /**
   * Get current onboarding progress for a contractor
   */
  async getOnboardingProgress(contractorId: string): Promise<OnboardingProgress> {
    try {
      // In production, this would fetch from database
      // For now, generate based on contractor data
      const stages = this.getOnboardingStages();
      
      // Check document completion status
      const documents = await this.getContractorDocuments(contractorId);
      const updatedStages = await this.updateStageCompletion(stages, documents);
      
      const completedStages = updatedStages.filter(stage => stage.completed).length;
      const currentStage = completedStages < updatedStages.length ? completedStages : updatedStages.length - 1;
      const completionPercentage = Math.round((completedStages / updatedStages.length) * 100);
      
      const overallStatus = this.determineOverallStatus(completionPercentage, updatedStages);

      return {
        contractorId,
        currentStage,
        totalStages: updatedStages.length,
        completionPercentage,
        stages: updatedStages,
        overallStatus,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to get onboarding progress:', error);
      throw error;
    }
  }

  /**
   * Update onboarding stage completion
   */
  async updateStageCompletion(
    contractorId: string,
    stageId: string,
    checklistItemId: string,
    completed: boolean
  ): Promise<OnboardingProgress> {
    try {
      // In production, this would update the database
      const progress = await this.getOnboardingProgress(contractorId);
      
      const stage = progress.stages.find(s => s.id === stageId);
      if (!stage) {
        throw new Error('Stage not found');
      }

      const checklistItem = stage.checklist.find(item => item.id === checklistItemId);
      if (!checklistItem) {
        throw new Error('Checklist item not found');
      }

      checklistItem.completed = completed;
      
      // Update stage completion
      stage.completed = stage.checklist
        .filter(item => item.required)
        .every(item => item.completed);

      // Recalculate overall progress
      const completedStages = progress.stages.filter(s => s.completed).length;
      progress.completionPercentage = Math.round((completedStages / progress.totalStages) * 100);
      progress.currentStage = completedStages < progress.totalStages ? completedStages : progress.totalStages - 1;
      progress.overallStatus = this.determineOverallStatus(progress.completionPercentage, progress.stages);
      progress.lastUpdated = new Date();

      return progress;
    } catch (error) {
      console.error('Failed to update stage completion:', error);
      throw error;
    }
  }

  /**
   * Submit contractor for final approval
   */
  async submitForApproval(contractorId: string): Promise<OnboardingProgress> {
    try {
      const progress = await this.getOnboardingProgress(contractorId);
      
      if (progress.completionPercentage < 100) {
        throw new Error('Cannot submit for approval - onboarding not complete');
      }

      // Check all required documents are uploaded and verified
      const documents = await this.getContractorDocuments(contractorId);
      const requiredDocs = this.getRequiredDocumentTypes();
      
      for (const docType of requiredDocs) {
        const doc = documents.find(d => d.type === docType);
        if (!doc || doc.status !== 'verified') {
          throw new Error(`Required document ${docType} is missing or not verified`);
        }
      }

      progress.overallStatus = 'completed';
      progress.lastUpdated = new Date();

      // In production, trigger approval workflow
      return progress;
    } catch (error) {
      console.error('Failed to submit for approval:', error);
      throw error;
    }
  }

  /**
   * Approve contractor onboarding
   */
  async approveContractor(
    contractorId: string,
    approvedBy: string
  ): Promise<OnboardingProgress> {
    try {
      const progress = await this.getOnboardingProgress(contractorId);
      
      if (progress.overallStatus !== 'completed') {
        throw new Error('Cannot approve - onboarding not completed');
      }

      progress.overallStatus = 'approved';
      progress.approvedBy = approvedBy;
      progress.approvedAt = new Date();
      progress.lastUpdated = new Date();

      // Update contractor status to active
      await db
        .update(contractors)
        .set({ 
          status: 'active',
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(contractors.id, contractorId));

      return progress;
    } catch (error) {
      console.error('Failed to approve contractor:', error);
      throw error;
    }
  }

  /**
   * Reject contractor onboarding
   */
  async rejectContractor(
    contractorId: string,
    rejectionReason: string,
    rejectedBy: string
  ): Promise<OnboardingProgress> {
    try {
      const progress = await this.getOnboardingProgress(contractorId);
      
      progress.overallStatus = 'rejected';
      progress.rejectionReason = rejectionReason;
      progress.lastUpdated = new Date();

      // Update contractor status
      await db
        .update(contractors)
        .set({ 
          status: 'rejected',
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(contractors.id, contractorId));

      return progress;
    } catch (error) {
      console.error('Failed to reject contractor:', error);
      throw error;
    }
  }

  /**
   * Get predefined onboarding stages
   */
  private getOnboardingStages(): OnboardingStage[] {
    return [
      {
        id: 'company_info',
        name: 'Company Information',
        description: 'Complete company registration and contact details',
        required: true,
        completed: false,
        documents: ['company_registration', 'tax_certificate'],
        checklist: [
          {
            id: 'company_reg',
            description: 'Company registration certificate uploaded',
            completed: false,
            required: true,
            category: 'legal'
          },
          {
            id: 'tax_cert',
            description: 'Tax clearance certificate uploaded',
            completed: false,
            required: true,
            category: 'legal'
          },
          {
            id: 'contact_verified',
            description: 'Contact information verified',
            completed: false,
            required: true,
            category: 'legal'
          }
        ]
      },
      {
        id: 'financial_info',
        name: 'Financial Information',
        description: 'Banking details and financial documentation',
        required: true,
        completed: false,
        documents: ['bank_statement', 'financial_statements'],
        checklist: [
          {
            id: 'bank_details',
            description: 'Banking details provided and verified',
            completed: false,
            required: true,
            category: 'financial'
          },
          {
            id: 'financial_docs',
            description: 'Financial statements uploaded',
            completed: false,
            required: true,
            category: 'financial'
          },
          {
            id: 'credit_check',
            description: 'Credit check completed',
            completed: false,
            required: false,
            category: 'financial'
          }
        ]
      },
      {
        id: 'insurance_compliance',
        name: 'Insurance & Compliance',
        description: 'Insurance coverage and compliance documentation',
        required: true,
        completed: false,
        documents: ['insurance_certificate', 'safety_certificate'],
        checklist: [
          {
            id: 'public_liability',
            description: 'Public liability insurance certificate',
            completed: false,
            required: true,
            category: 'insurance'
          },
          {
            id: 'workers_comp',
            description: 'Workers compensation insurance',
            completed: false,
            required: true,
            category: 'insurance'
          },
          {
            id: 'safety_cert',
            description: 'Safety compliance certificate',
            completed: false,
            required: true,
            category: 'safety'
          }
        ]
      },
      {
        id: 'technical_qualification',
        name: 'Technical Qualifications',
        description: 'Technical certifications and team qualifications',
        required: true,
        completed: false,
        documents: ['technical_certificates', 'team_qualifications'],
        checklist: [
          {
            id: 'tech_certs',
            description: 'Technical certifications uploaded',
            completed: false,
            required: true,
            category: 'technical'
          },
          {
            id: 'team_skills',
            description: 'Team member qualifications documented',
            completed: false,
            required: true,
            category: 'technical'
          },
          {
            id: 'equipment_list',
            description: 'Equipment inventory provided',
            completed: false,
            required: false,
            category: 'technical'
          }
        ]
      },
      {
        id: 'final_review',
        name: 'Final Review',
        description: 'Management review and approval',
        required: true,
        completed: false,
        documents: [],
        checklist: [
          {
            id: 'doc_review',
            description: 'All documents reviewed and verified',
            completed: false,
            required: true,
            category: 'legal'
          },
          {
            id: 'ref_check',
            description: 'Reference checks completed',
            completed: false,
            required: false,
            category: 'legal'
          },
          {
            id: 'mgmt_approval',
            description: 'Management approval obtained',
            completed: false,
            required: true,
            category: 'legal'
          }
        ]
      }
    ];
  }

  /**
   * Get contractor documents from database
   */
  private async getContractorDocuments(contractorId: string): Promise<ContractorDocument[]> {
    try {
      return await db
        .select()
        .from(contractorDocuments)
        .where(eq(contractorDocuments.contractorId, contractorId));
    } catch (error) {
      console.error('Failed to get contractor documents:', error);
      return [];
    }
  }

  /**
   * Update stage completion based on documents
   */
  private async updateStageCompletion(
    stages: OnboardingStage[],
    documents: ContractorDocument[]
  ): Promise<OnboardingStage[]> {
    return stages.map(stage => {
      // Check if required documents are uploaded
      const stageDocuments = documents.filter(doc => 
        stage.documents.includes(doc.type as DocumentType)
      );

      // Update checklist based on uploaded documents
      stage.checklist.forEach(item => {
        if (item.id.includes('uploaded') || item.id.includes('cert')) {
          const hasRequiredDoc = stageDocuments.some(doc => 
            doc.status === 'verified' || doc.status === 'pending'
          );
          item.completed = hasRequiredDoc;
        }
      });

      // Mark stage as completed if all required checklist items are done
      stage.completed = stage.checklist
        .filter(item => item.required)
        .every(item => item.completed);

      return stage;
    });
  }

  /**
   * Determine overall onboarding status
   */
  private determineOverallStatus(
    completionPercentage: number,
    stages: OnboardingStage[]
  ): 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected' {
    if (completionPercentage === 0) return 'not_started';
    if (completionPercentage === 100) return 'completed';
    return 'in_progress';
  }

  /**
   * Get required document types for onboarding
   */
  private getRequiredDocumentTypes(): DocumentType[] {
    return [
      'company_registration',
      'tax_certificate',
      'bank_statement',
      'insurance_certificate',
      'safety_certificate'
    ];
  }
}

export const contractorOnboardingService = new ContractorOnboardingService();