/**
 * BOQ API Extensions - Mock Data
 * Sample data for development and testing
 */

import { BOQ, BOQItem, BOQException } from './types';

export const mockBOQs: BOQ[] = [
  {
    id: 'boq-1',
    projectId: 'project-1',
    name: 'Main Building Infrastructure',
    version: 'v1.3',
    title: 'Main Building Infrastructure',
    description: 'Complete BOQ for main building electrical and fiber infrastructure',
    status: 'approved',
    mappingStatus: 'completed',
    mappingConfidence: 95,
    uploadedBy: 'john.doe@example.com',
    uploadedAt: new Date('2024-01-20'),
    approvedBy: 'admin@example.com',
    approvedAt: new Date('2024-01-22'),
    fileName: 'Main_Building_BOQ_v1.3.xlsx',
    fileSize: 2048000,
    itemCount: 150,
    mappedItems: 150,
    unmappedItems: 0,
    exceptionsCount: 0,
    totalEstimatedValue: 2500000,
    currency: 'ZAR',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'boq-2',
    projectId: 'project-1',
    name: 'Outdoor Infrastructure',
    version: 'v2.1',
    title: 'Outdoor Infrastructure',
    description: 'BOQ for outdoor cabling and equipment installation',
    status: 'mapping_review',
    mappingStatus: 'in_progress',
    mappingConfidence: 78,
    uploadedBy: 'jane.smith@example.com',
    uploadedAt: new Date('2024-01-25'),
    fileName: 'Outdoor_Infrastructure_v2.1.xlsx',
    fileSize: 1536000,
    itemCount: 89,
    mappedItems: 67,
    unmappedItems: 22,
    exceptionsCount: 12,
    totalEstimatedValue: 1800000,
    currency: 'ZAR',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];

export const mockBOQItems: BOQItem[] = [
  {
    id: 'item-1',
    boqId: 'boq-1',
    projectId: 'project-1',
    lineNumber: 1,
    itemCode: 'FBC-50-SM',
    description: 'Fiber Optic Cable, Single Mode, 50 Core',
    category: 'Cables',
    subcategory: 'Fiber Optic',
    quantity: 500,
    uom: 'meter',
    unitPrice: 25.50,
    totalPrice: 12750,
    phase: 'Phase 1',
    task: 'Cable Installation',
    site: 'Main Building',
    catalogItemId: 'cat-001',
    catalogItemCode: 'FBC-50-SM',
    catalogItemName: 'Fiber Optic Cable, Single Mode, 50 Core',
    mappingConfidence: 95,
    mappingStatus: 'mapped',
    procurementStatus: 'pending',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'item-2',
    boqId: 'boq-1',
    projectId: 'project-1',
    lineNumber: 2,
    itemCode: 'ECC-4C-16',
    description: 'Electrical Control Cable, 4 Core, 16mm²',
    category: 'Cables',
    subcategory: 'Electrical',
    quantity: 200,
    uom: 'meter',
    unitPrice: 18.75,
    totalPrice: 3750,
    phase: 'Phase 1',
    task: 'Control Wiring',
    site: 'Main Building',
    catalogItemId: 'cat-002',
    catalogItemCode: 'ECC-4C-16',
    catalogItemName: 'Electrical Control Cable, 4 Core, 16mm²',
    mappingConfidence: 92,
    mappingStatus: 'mapped',
    procurementStatus: 'pending',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

export const mockExceptions: BOQException[] = [
  {
    id: 'exc-1',
    boqId: 'boq-2',
    boqItemId: 'item-3',
    projectId: 'project-1',
    exceptionType: 'no_match',
    severity: 'high',
    issueDescription: 'No matching catalog item found for "Custom Weather Station Module"',
    suggestedAction: 'Review item description or create new catalog entry',
    systemSuggestions: [
      {
        catalogItemId: 'cat-101',
        catalogItemCode: 'WSM-001',
        catalogItemName: 'Weather Monitoring Station, Basic',
        confidence: 65,
        matchingCriteria: {
          descriptionMatch: 70,
          codeMatch: 0,
          specificationMatch: 60
        }
      }
    ],
    status: 'open',
    priority: 'high',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];