// ============= Purchase Order Service =============

import { 
  PurchaseOrder,
  POItem, 
  POStatus,
  POApprovalStatus,
  PODeliveryStatus,
  POInvoiceStatus,
  POListItem,
  POStats,
  POFilters,
  CreatePORequest,
  PODeliveryNote,
  POInvoice,
  POAmendment,
  POOrderType,
  POItemStatus,
  DeliveryNoteStatus,
  InvoiceMatchingStatus,
  PaymentStatus,
  AmendmentStatus
} from '../../types/procurement/po.types';

// Mock data for development - replace with actual API calls
const MOCK_PO_DATA: PurchaseOrder[] = [
  {
    id: 'po-001',
    projectId: 'proj-001',
    poNumber: 'PO-2024-001',
    rfqId: 'rfq-001',
    quoteId: 'quote-001',
    supplierId: 'supplier-001',
    title: 'Fiber Optic Cables and Accessories',
    description: 'Network infrastructure components for Phase 1',
    orderType: POOrderType.GOODS,
    status: POStatus.ACKNOWLEDGED,
    approvalStatus: POApprovalStatus.APPROVED,
    supplier: {
      id: 'supplier-001',
      name: 'FiberTech Solutions',
      code: 'FTS001',
      contactPerson: 'John Smith',
      email: 'john@fibertech.co.za',
      phone: '+27 11 123 4567',
      address: {
        street: '123 Industrial Road',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2000',
        country: 'South Africa'
      }
    },
    currency: 'ZAR',
    subtotal: 850000,
    taxAmount: 127500,
    totalAmount: 977500,
    paymentTerms: '30 days net',
    deliveryTerms: 'DDP - Delivered Duty Paid',
    validityPeriod: 30,
    deliveryAddress: {
      street: '456 Project Site',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8000',
      country: 'South Africa'
    },
    expectedDeliveryDate: new Date('2024-10-15'),
    partialDeliveryAllowed: true,
    issuedAt: new Date('2024-09-01'),
    sentAt: new Date('2024-09-02'),
    acknowledgedAt: new Date('2024-09-03'),
    lastModifiedAt: new Date('2024-09-03'),
    createdBy: 'user-001',
    issuedBy: 'manager-001',
    approvedBy: ['manager-001', 'director-001'],
    deliveryStatus: PODeliveryStatus.IN_TRANSIT,
    invoiceStatus: POInvoiceStatus.NOT_INVOICED,
    amendmentCount: 0,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-03')
  },
  {
    id: 'po-002',
    projectId: 'proj-001',
    poNumber: 'PO-2024-002',
    supplierId: 'supplier-002',
    title: 'Installation Services',
    orderType: POOrderType.SERVICES,
    status: POStatus.PENDING_APPROVAL,
    approvalStatus: POApprovalStatus.PENDING,
    supplier: {
      id: 'supplier-002',
      name: 'Network Install Pro',
      code: 'NIP001',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@networkinstall.co.za',
      phone: '+27 21 987 6543'
    },
    currency: 'ZAR',
    subtotal: 450000,
    taxAmount: 67500,
    totalAmount: 517500,
    paymentTerms: '30 days net',
    deliveryTerms: 'On-site service delivery',
    deliveryAddress: {
      street: '789 Service Location',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      postalCode: '4000',
      country: 'South Africa'
    },
    expectedDeliveryDate: new Date('2024-11-01'),
    partialDeliveryAllowed: false,
    lastModifiedAt: new Date('2024-09-10'),
    createdBy: 'user-002',
    deliveryStatus: PODeliveryStatus.NOT_STARTED,
    invoiceStatus: POInvoiceStatus.NOT_INVOICED,
    amendmentCount: 0,
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-10')
  }
];

const MOCK_PO_ITEMS: Record<string, POItem[]> = {
  'po-001': [
    {
      id: 'item-001',
      poId: 'po-001',
      rfqItemId: 'rfq-item-001',
      lineNumber: 1,
      itemCode: 'FOC-SM-144',
      description: 'Single Mode Fiber Optic Cable - 144 Core',
      category: 'Cables',
      quantity: 5000,
      uom: 'meters',
      unitPrice: 45.50,
      lineTotal: 227500,
      quantityDelivered: 0,
      quantityPending: 5000,
      quantityInvoiced: 0,
      expectedDeliveryDate: new Date('2024-10-10'),
      itemStatus: POItemStatus.CONFIRMED,
      createdAt: new Date('2024-09-01'),
      updatedAt: new Date('2024-09-03')
    },
    {
      id: 'item-002',
      poId: 'po-001',
      lineNumber: 2,
      itemCode: 'SPLICE-TRAY',
      description: 'Fiber Splice Tray - 24 Fiber',
      category: 'Hardware',
      quantity: 200,
      uom: 'pieces',
      unitPrice: 125.00,
      lineTotal: 25000,
      quantityDelivered: 0,
      quantityPending: 200,
      quantityInvoiced: 0,
      expectedDeliveryDate: new Date('2024-10-15'),
      itemStatus: POItemStatus.CONFIRMED,
      createdAt: new Date('2024-09-01'),
      updatedAt: new Date('2024-09-03')
    }
  ]
};

class POService {
  // ============= CRUD Operations =============

  async getAllPOs(filters?: POFilters): Promise<POListItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = [...MOCK_PO_DATA];
    
    if (filters) {
      if (filters.projectId) {
        filteredData = filteredData.filter(po => po.projectId === filters.projectId);
      }
      
      if (filters.status && filters.status.length > 0) {
        filteredData = filteredData.filter(po => filters.status!.includes(po.status));
      }
      
      if (filters.approvalStatus && filters.approvalStatus.length > 0) {
        filteredData = filteredData.filter(po => filters.approvalStatus!.includes(po.approvalStatus));
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(po => 
          po.title.toLowerCase().includes(term) ||
          po.poNumber.toLowerCase().includes(term) ||
          po.supplier.name.toLowerCase().includes(term)
        );
      }
      
      if (filters.amountRange) {
        filteredData = filteredData.filter(po => 
          po.totalAmount >= filters.amountRange!.min &&
          po.totalAmount <= filters.amountRange!.max
        );
      }
      
      if (filters.dateRange) {
        filteredData = filteredData.filter(po => {
          const createdDate = new Date(po.createdAt);
          return createdDate >= filters.dateRange!.start && createdDate <= filters.dateRange!.end;
        });
      }
    }
    
    // Convert to list items
    return filteredData.map(po => {
      const items = MOCK_PO_ITEMS[po.id] || [];
      return {
        id: po.id,
        poNumber: po.poNumber,
        title: po.title,
        supplier: {
          id: po.supplier.id,
          name: po.supplier.name
        },
        status: po.status,
        approvalStatus: po.approvalStatus,
        deliveryStatus: po.deliveryStatus,
        invoiceStatus: po.invoiceStatus,
        totalAmount: po.totalAmount,
        currency: po.currency,
        ...(po.expectedDeliveryDate && { expectedDeliveryDate: po.expectedDeliveryDate }),
        ...(po.issuedAt && { issuedAt: po.issuedAt }),
        createdAt: po.createdAt,
        itemCount: items.length,
        deliveredItemCount: items.filter(item => item.quantityDelivered > 0).length,
        invoicedItemCount: items.filter(item => item.quantityInvoiced > 0).length
      };
    });
  }

  async getPOById(id: string): Promise<PurchaseOrder | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PO_DATA.find(po => po.id === id) || null;
  }

  async getPOItems(poId: string): Promise<POItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_PO_ITEMS[poId] || [];
  }

  async createPO(data: CreatePORequest): Promise<PurchaseOrder> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate PO creation
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      projectId: data.projectId,
      poNumber: `PO-${new Date().getFullYear()}-${String(MOCK_PO_DATA.length + 1).padStart(3, '0')}`,
      ...(data.rfqId && { rfqId: data.rfqId }),
      ...(data.quoteId && { quoteId: data.quoteId }),
      supplierId: data.supplierId,
      title: data.title,
      ...(data.description && { description: data.description }),
      orderType: data.orderType,
      status: POStatus.DRAFT,
      approvalStatus: POApprovalStatus.PENDING,
      supplier: {
        id: data.supplierId,
        name: 'Supplier Name', // Would be fetched from supplier service
        code: 'SUP001'
      },
      currency: 'ZAR',
      subtotal: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      taxAmount: 0, // Calculate based on tax rules
      totalAmount: 0, // Calculate with tax
      paymentTerms: data.paymentTerms,
      deliveryTerms: data.deliveryTerms,
      deliveryAddress: data.deliveryAddress,
      ...(data.expectedDeliveryDate && { expectedDeliveryDate: data.expectedDeliveryDate }),
      partialDeliveryAllowed: true,
      lastModifiedAt: new Date(),
      createdBy: 'current-user', // Would be from auth context
      deliveryStatus: PODeliveryStatus.NOT_STARTED,
      invoiceStatus: POInvoiceStatus.NOT_INVOICED,
      ...(data.notes && { notes: data.notes }),
      ...(data.internalNotes && { internalNotes: data.internalNotes }),
      amendmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Calculate tax and total
    newPO.taxAmount = newPO.subtotal * 0.15; // 15% VAT
    newPO.totalAmount = newPO.subtotal + newPO.taxAmount;
    
    MOCK_PO_DATA.push(newPO);
    return newPO;
  }

  async updatePO(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = MOCK_PO_DATA.findIndex(po => po.id === id);
    if (index === -1) {
      throw new Error('Purchase Order not found');
    }
    
    MOCK_PO_DATA[index] = {
      ...MOCK_PO_DATA[index],
      ...updates,
      updatedAt: new Date()
    };
    
    return MOCK_PO_DATA[index];
  }

  async deletePO(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = MOCK_PO_DATA.findIndex(po => po.id === id);
    if (index === -1) {
      throw new Error('Purchase Order not found');
    }
    
    MOCK_PO_DATA.splice(index, 1);
  }

  // ============= Status Management =============

  async updatePOStatus(id: string, status: POStatus, notes?: string): Promise<PurchaseOrder> {
    const po = await this.getPOById(id);
    if (!po) {
      throw new Error('Purchase Order not found');
    }
    
    const updates: Partial<PurchaseOrder> = {
      status,
      lastModifiedAt: new Date()
    };
    
    // Update related timestamps based on status
    switch (status) {
      case POStatus.SENT:
        updates.sentAt = new Date();
        break;
      case POStatus.ACKNOWLEDGED:
        updates.acknowledgedAt = new Date();
        break;
      case POStatus.DELIVERED:
        updates.actualDeliveryDate = new Date();
        updates.deliveryStatus = PODeliveryStatus.FULLY_DELIVERED;
        break;
    }
    
    if (notes) {
      updates.notes = notes;
    }
    
    return this.updatePO(id, updates);
  }

  // ============= Approval Workflow =============

  async submitForApproval(id: string): Promise<PurchaseOrder> {
    return this.updatePO(id, {
      status: POStatus.PENDING_APPROVAL,
      approvalStatus: POApprovalStatus.PENDING
    });
  }

  async approvePO(id: string, approverId: string): Promise<PurchaseOrder> {
    const po = await this.getPOById(id);
    if (!po) {
      throw new Error('Purchase Order not found');
    }
    
    // In a real implementation, this would check approval levels and workflows
    return this.updatePO(id, {
      status: POStatus.APPROVED,
      approvalStatus: POApprovalStatus.APPROVED,
      approvedBy: [...(po.approvedBy || []), approverId]
    });
  }

  async rejectPO(id: string, _approverId: string, reason: string): Promise<PurchaseOrder> {
    return this.updatePO(id, {
      status: POStatus.DRAFT,
      approvalStatus: POApprovalStatus.REJECTED,
      notes: reason
    });
  }

  // ============= Delivery Management =============

  async createDeliveryNote(poId: string, deliveryData: any): Promise<PODeliveryNote> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock delivery note creation
    const deliveryNote: PODeliveryNote = {
      id: `dn-${Date.now()}`,
      poId,
      deliveryNoteNumber: `DN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      deliveredBy: deliveryData.deliveredBy,
      receivedBy: deliveryData.receivedBy,
      deliveryDate: new Date(),
      items: deliveryData.items,
      status: DeliveryNoteStatus.PENDING,
      deliveryNotes: deliveryData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return deliveryNote;
  }

  async updateDeliveryStatus(poId: string, status: PODeliveryStatus): Promise<PurchaseOrder> {
    return this.updatePO(poId, {
      deliveryStatus: status
    });
  }

  // ============= Invoice Management =============

  async createInvoice(poId: string, invoiceData: any): Promise<POInvoice> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const invoice: POInvoice = {
      id: `inv-${Date.now()}`,
      poId,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceAmount: invoiceData.invoiceAmount,
      taxAmount: invoiceData.taxAmount,
      totalAmount: invoiceData.totalAmount,
      matchingStatus: InvoiceMatchingStatus.NOT_MATCHED,
      items: invoiceData.items,
      invoiceDate: new Date(invoiceData.invoiceDate),
      dueDate: new Date(invoiceData.dueDate),
      receivedDate: new Date(),
      paymentStatus: PaymentStatus.NOT_DUE,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return invoice;
  }

  async updateInvoiceStatus(poId: string, status: POInvoiceStatus): Promise<PurchaseOrder> {
    return this.updatePO(poId, {
      invoiceStatus: status
    });
  }

  // ============= Amendment Management =============

  async createAmendment(poId: string, amendmentData: any): Promise<POAmendment> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const po = await this.getPOById(poId);
    if (!po) {
      throw new Error('Purchase Order not found');
    }
    
    const amendment: POAmendment = {
      id: `amend-${Date.now()}`,
      originalPOId: poId,
      amendmentNumber: po.amendmentCount + 1,
      reason: amendmentData.reason,
      description: amendmentData.description,
      changeType: amendmentData.changeType,
      changes: amendmentData.changes,
      previousTotal: po.totalAmount,
      newTotal: amendmentData.newTotal,
      changeAmount: amendmentData.newTotal - po.totalAmount,
      approvalStatus: POApprovalStatus.PENDING,
      status: AmendmentStatus.DRAFT,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return amendment;
  }

  // ============= Statistics and Analytics =============

  async getPOStats(projectId?: string): Promise<POStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let data = MOCK_PO_DATA;
    if (projectId) {
      data = data.filter(po => po.projectId === projectId);
    }
    
    const stats: POStats = {
      total: data.length,
      byStatus: {} as Record<POStatus, number>,
      byApprovalStatus: {} as Record<POApprovalStatus, number>,
      totalValue: data.reduce((sum, po) => sum + po.totalAmount, 0),
      averageValue: data.length > 0 ? data.reduce((sum, po) => sum + po.totalAmount, 0) / data.length : 0,
      onTimeDeliveries: data.filter(po => 
        po.actualDeliveryDate && po.expectedDeliveryDate && 
        po.actualDeliveryDate <= po.expectedDeliveryDate
      ).length,
      lateDeliveries: data.filter(po => 
        po.actualDeliveryDate && po.expectedDeliveryDate && 
        po.actualDeliveryDate > po.expectedDeliveryDate
      ).length,
      averageDeliveryDays: 15, // Mock calculation
      averageApprovalDays: 3, // Mock calculation
      averageProcessingDays: 7, // Mock calculation
      monthlyStats: [] // Mock monthly data
    };
    
    // Calculate status distributions
    Object.values(POStatus).forEach(status => {
      stats.byStatus[status] = data.filter(po => po.status === status).length;
    });
    
    Object.values(POApprovalStatus).forEach(status => {
      stats.byApprovalStatus[status] = data.filter(po => po.approvalStatus === status).length;
    });
    
    return stats;
  }

  // ============= Reporting =============

  async generatePOReport(filters: POFilters, reportType: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pos = await this.getAllPOs(filters);
    
    return {
      reportType,
      generatedAt: new Date(),
      filters,
      data: pos,
      summary: {
        totalPOs: pos.length,
        totalValue: pos.reduce((sum, po) => sum + po.totalAmount, 0),
        avgValue: pos.length > 0 ? pos.reduce((sum, po) => sum + po.totalAmount, 0) / pos.length : 0
      }
    };
  }

  // ============= Integration Methods =============

  async createPOFromQuote(quoteId: string, projectId: string): Promise<PurchaseOrder> {
    // This would integrate with the RFQ/Quote system
    // For now, return a mock PO
    const mockRequest: CreatePORequest = {
      projectId,
      quoteId,
      supplierId: 'supplier-001',
      title: 'PO Created from Quote',
      orderType: POOrderType.GOODS,
      paymentTerms: '30 days net',
      deliveryTerms: 'DDP',
      deliveryAddress: {
        street: '123 Delivery St',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8000',
        country: 'South Africa'
      },
      items: []
    };
    
    return this.createPO(mockRequest);
  }

  async getPOsRequiringAction(_userId: string): Promise<POListItem[]> {
    // Return POs that need user action (approvals, acknowledgments, etc.)
    const allPOs = await this.getAllPOs();
    return allPOs.filter(po => 
      po.approvalStatus === POApprovalStatus.PENDING ||
      po.status === POStatus.PENDING_APPROVAL ||
      po.deliveryStatus === PODeliveryStatus.DELIVERY_ISSUES
    );
  }
}

export const poService = new POService();
export default poService;