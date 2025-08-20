import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  Contractor, 
  ContractorDocument, 
  OnboardingStep, 
  ApprovalWorkflow,
  RAGScore,
  ComplianceIssue 
} from '../models/contractor.model';

@Injectable({
  providedIn: 'root'
})
export class ContractorService {
  private contractorsSubject = new BehaviorSubject<Contractor[]>([]);
  public contractors$ = this.contractorsSubject.asObservable();

  private onboardingStepsSubject = new BehaviorSubject<OnboardingStep[]>([]);
  public onboardingSteps$ = this.onboardingStepsSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    const mockContractors: Contractor[] = [
      {
        id: 'CTR001',
        companyName: 'FiberTech Solutions',
        registrationNumber: '2020/123456/07',
        vatNumber: 'VAT123456',
        contactPerson: 'John Smith',
        email: 'john@fibertech.co.za',
        phone: '0821234567',
        address: {
          street: '123 Main Road',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
          country: 'South Africa'
        },
        status: 'approved',
        ragScore: {
          overall: 'green',
          financial: 'green',
          compliance: 'amber',
          performance: 'green',
          safety: 'green',
          lastUpdated: new Date(),
          details: [
            {
              category: 'Financial Health',
              score: 85,
              maxScore: 100,
              status: 'green',
              issues: []
            },
            {
              category: 'Compliance',
              score: 65,
              maxScore: 100,
              status: 'amber',
              issues: ['Tax clearance expiring soon']
            }
          ]
        },
        onboardingStatus: {
          currentStep: 5,
          totalSteps: 5,
          completedSteps: ['company_info', 'documents', 'certifications', 'bank_details', 'approval'],
          pendingSteps: [],
          startDate: new Date('2024-01-15'),
          lastActivityDate: new Date('2024-01-20')
        },
        documents: [],
        certifications: [],
        insurances: [],
        subcontractors: [],
        projects: ['PRJ001', 'PRJ002'],
        complianceStatus: {
          isCompliant: true,
          lastAuditDate: new Date('2024-01-01'),
          nextAuditDate: new Date('2024-07-01'),
          outstandingIssues: [],
          completedRequirements: ['safety_training', 'quality_certification'],
          pendingRequirements: []
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'CTR002',
        companyName: 'Network Builders Co',
        registrationNumber: '2019/654321/07',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@networkbuilders.co.za',
        phone: '0834567890',
        address: {
          street: '456 Oak Avenue',
          city: 'Johannesburg',
          province: 'Gauteng',
          postalCode: '2001',
          country: 'South Africa'
        },
        status: 'pending_approval',
        ragScore: {
          overall: 'amber',
          financial: 'green',
          compliance: 'amber',
          performance: 'amber',
          safety: 'green',
          lastUpdated: new Date(),
          details: []
        },
        onboardingStatus: {
          currentStep: 3,
          totalSteps: 5,
          completedSteps: ['company_info', 'documents', 'certifications'],
          pendingSteps: ['bank_details', 'approval'],
          startDate: new Date(),
          lastActivityDate: new Date()
        },
        documents: [],
        certifications: [],
        insurances: [],
        subcontractors: [],
        projects: [],
        complianceStatus: {
          isCompliant: false,
          outstandingIssues: [
            {
              id: 'ISS001',
              category: 'Documentation',
              description: 'Insurance policy expired',
              severity: 'high',
              dueDate: new Date('2024-02-15'),
              status: 'open'
            }
          ],
          completedRequirements: [],
          pendingRequirements: ['insurance_renewal']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockOnboardingSteps: OnboardingStep[] = [
      {
        id: 'step1',
        name: 'Company Information',
        description: 'Basic company details and contact information',
        order: 1,
        required: true,
        completed: false,
        fields: [
          {
            name: 'companyName',
            label: 'Company Name',
            type: 'text',
            required: true,
            validation: { type: 'required', message: 'Company name is required' }
          },
          {
            name: 'registrationNumber',
            label: 'Registration Number',
            type: 'text',
            required: true,
            validation: { type: 'required', message: 'Registration number is required' }
          },
          {
            name: 'vatNumber',
            label: 'VAT Number',
            type: 'text',
            required: false
          }
        ],
        documents: [],
        validations: []
      },
      {
        id: 'step2',
        name: 'Documentation',
        description: 'Upload required company documents',
        order: 2,
        required: true,
        completed: false,
        fields: [],
        documents: ['company_registration', 'vat_certificate', 'tax_clearance'],
        validations: []
      },
      {
        id: 'step3',
        name: 'Certifications & Insurance',
        description: 'Professional certifications and insurance policies',
        order: 3,
        required: true,
        completed: false,
        fields: [],
        documents: ['insurance_policy', 'safety_file', 'quality_certification'],
        validations: []
      },
      {
        id: 'step4',
        name: 'Banking Details',
        description: 'Bank account information for payments',
        order: 4,
        required: true,
        completed: false,
        fields: [
          {
            name: 'bankName',
            label: 'Bank Name',
            type: 'text',
            required: true,
            validation: { type: 'required', message: 'Bank name is required' }
          },
          {
            name: 'accountNumber',
            label: 'Account Number',
            type: 'text',
            required: true,
            validation: { type: 'required', message: 'Account number is required' }
          }
        ],
        documents: ['bank_confirmation'],
        validations: []
      },
      {
        id: 'step5',
        name: 'Review & Submit',
        description: 'Review information and submit for approval',
        order: 5,
        required: true,
        completed: false,
        fields: [],
        documents: [],
        validations: []
      }
    ];

    this.contractorsSubject.next(mockContractors);
    this.onboardingStepsSubject.next(mockOnboardingSteps);
  }

  getContractors(): Observable<Contractor[]> {
    return this.contractors$;
  }

  getContractorById(id: string): Observable<Contractor | undefined> {
    return this.contractors$.pipe(
      map(contractors => contractors.find(c => c.id === id))
    );
  }

  getContractorsByStatus(status: string): Observable<Contractor[]> {
    return this.contractors$.pipe(
      map(contractors => contractors.filter(c => c.status === status))
    );
  }

  getContractorsByRAGStatus(ragStatus: 'red' | 'amber' | 'green'): Observable<Contractor[]> {
    return this.contractors$.pipe(
      map(contractors => contractors.filter(c => c.ragScore.overall === ragStatus))
    );
  }

  updateContractor(id: string, updates: Partial<Contractor>): Observable<Contractor> {
    const contractors = this.contractorsSubject.value;
    const index = contractors.findIndex(c => c.id === id);
    
    if (index !== -1) {
      contractors[index] = { ...contractors[index], ...updates, updatedAt: new Date() };
      this.contractorsSubject.next(contractors);
      return of(contractors[index]).pipe(delay(500));
    }
    
    throw new Error('Contractor not found');
  }

  uploadDocument(contractorId: string, document: ContractorDocument): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        const contractors = this.contractorsSubject.value;
        const contractor = contractors.find(c => c.id === contractorId);
        
        if (contractor) {
          contractor.documents.push(document);
          this.contractorsSubject.next(contractors);
          observer.next();
          observer.complete();
        } else {
          observer.error('Contractor not found');
        }
      }, 1000);
    });
  }

  getOnboardingSteps(): Observable<OnboardingStep[]> {
    return this.onboardingSteps$;
  }

  completeOnboardingStep(stepId: string): Observable<void> {
    return new Observable(observer => {
      const steps = this.onboardingStepsSubject.value;
      const step = steps.find(s => s.id === stepId);
      
      if (step) {
        step.completed = true;
        step.completedAt = new Date();
        this.onboardingStepsSubject.next(steps);
        observer.next();
        observer.complete();
      } else {
        observer.error('Step not found');
      }
    });
  }

  calculateRAGScore(contractorId: string): Observable<RAGScore> {
    return new Observable(observer => {
      setTimeout(() => {
        const score: RAGScore = {
          overall: 'green',
          financial: 'green',
          compliance: 'amber',
          performance: 'green',
          safety: 'green',
          lastUpdated: new Date(),
          details: [
            {
              category: 'Financial Health',
              score: 85,
              maxScore: 100,
              status: 'green',
              issues: []
            },
            {
              category: 'Compliance',
              score: 65,
              maxScore: 100,
              status: 'amber',
              issues: ['Some documents expiring soon']
            },
            {
              category: 'Performance',
              score: 90,
              maxScore: 100,
              status: 'green',
              issues: []
            },
            {
              category: 'Safety',
              score: 95,
              maxScore: 100,
              status: 'green',
              issues: []
            }
          ]
        };
        
        observer.next(score);
        observer.complete();
      }, 1000);
    });
  }

  getComplianceIssues(contractorId: string): Observable<ComplianceIssue[]> {
    return of([
      {
        id: 'ISS001',
        category: 'Documentation',
        description: 'Tax clearance certificate expiring in 30 days',
        severity: 'medium',
        dueDate: new Date('2024-03-01'),
        status: 'open'
      },
      {
        id: 'ISS002',
        category: 'Training',
        description: 'Safety training certification required for new team members',
        severity: 'low',
        dueDate: new Date('2024-03-15'),
        status: 'open'
      }
    ]).pipe(delay(500));
  }

  submitForApproval(contractorId: string): Observable<ApprovalWorkflow> {
    return new Observable(observer => {
      setTimeout(() => {
        const workflow: ApprovalWorkflow = {
          id: 'WF' + Date.now(),
          contractorId,
          type: 'onboarding',
          status: 'pending',
          currentLevel: 1,
          totalLevels: 3,
          approvals: [
            {
              level: 1,
              role: 'Procurement Manager',
              status: 'pending'
            },
            {
              level: 2,
              role: 'Finance Manager',
              status: 'pending'
            },
            {
              level: 3,
              role: 'Operations Director',
              status: 'pending'
            }
          ],
          createdAt: new Date()
        };
        
        observer.next(workflow);
        observer.complete();
      }, 1000);
    });
  }

  approveWorkflow(workflowId: string, level: number, comments?: string): Observable<void> {
    return of(void 0).pipe(delay(500));
  }

  rejectWorkflow(workflowId: string, level: number, reason: string): Observable<void> {
    return of(void 0).pipe(delay(500));
  }

  getExpiringDocuments(days: number = 30): Observable<ContractorDocument[]> {
    return new Observable(observer => {
      const expiringDocs: ContractorDocument[] = [
        {
          id: 'DOC001',
          type: 'tax_clearance',
          name: 'Tax Clearance Certificate',
          url: '/documents/tax_clearance.pdf',
          uploadedAt: new Date('2024-01-01'),
          expiryDate: new Date('2024-02-28'),
          status: 'expiring_soon'
        },
        {
          id: 'DOC002',
          type: 'insurance_policy',
          name: 'Public Liability Insurance',
          url: '/documents/insurance.pdf',
          uploadedAt: new Date('2023-12-01'),
          expiryDate: new Date('2024-03-15'),
          status: 'expiring_soon'
        }
      ];
      
      setTimeout(() => {
        observer.next(expiringDocs);
        observer.complete();
      }, 500);
    });
  }
}