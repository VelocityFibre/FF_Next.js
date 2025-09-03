/**
 * Supplier Status - Validation Logic
 * Handles status transition rules and eligibility checks
 */

import { 
  SupplierStatus, 
  Supplier, 
  StatusTransitionValidation, 
  SupplierEligibility 
} from './types';

export class StatusValidation {
  /**
   * Check if status transition is valid
   */
  static isValidStatusTransition(
    currentStatus: SupplierStatus, 
    newStatus: SupplierStatus
  ): StatusTransitionValidation {
    // Define valid transitions
    const validTransitions: Record<SupplierStatus, SupplierStatus[]> = {
      [SupplierStatus.PENDING]: [SupplierStatus.ACTIVE, SupplierStatus.INACTIVE, SupplierStatus.BLACKLISTED, SupplierStatus.ARCHIVED],
      [SupplierStatus.ACTIVE]: [SupplierStatus.INACTIVE, SupplierStatus.SUSPENDED, SupplierStatus.BLACKLISTED, SupplierStatus.ARCHIVED],
      [SupplierStatus.INACTIVE]: [SupplierStatus.ACTIVE, SupplierStatus.BLACKLISTED, SupplierStatus.ARCHIVED],
      [SupplierStatus.SUSPENDED]: [SupplierStatus.ACTIVE, SupplierStatus.INACTIVE, SupplierStatus.BLACKLISTED, SupplierStatus.ARCHIVED],
      [SupplierStatus.BLACKLISTED]: [SupplierStatus.ACTIVE, SupplierStatus.ARCHIVED], // Can only reactivate from blacklist with approval
      [SupplierStatus.ARCHIVED]: [] // Archived suppliers cannot be changed (permanent)
    };

    return this.validateTransition(currentStatus, newStatus, validTransitions);
  }

  /**
   * Validate the actual transition logic
   */
  private static validateTransition(
    currentStatus: SupplierStatus,
    newStatus: SupplierStatus,
    validTransitions: Record<SupplierStatus, SupplierStatus[]>
  ): StatusTransitionValidation {
    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (currentStatus === newStatus) {
      return { valid: false, reason: 'Status is already set to the target value' };
    }

    if (!allowedTransitions.includes(newStatus)) {
      return { 
        valid: false, 
        reason: `Cannot transition from ${currentStatus} to ${newStatus}` 
      };
    }

    return { valid: true };
  }

  /**
   * Check supplier eligibility for operations
   */
  static checkEligibility(supplier: Supplier): SupplierEligibility {
    const restrictions: string[] = [];
    const operations = this.getBaseOperationsEligibility(supplier.status, restrictions);
    
    // Apply additional business rules
    this.applyActiveStatusRules(supplier, operations, restrictions);
    this.applyComplianceRules(supplier, operations, restrictions);

    return {
      ...operations,
      restrictions
    };
  }

  /**
   * Get base eligibility based on status
   */
  private static getBaseOperationsEligibility(
    status: SupplierStatus,
    restrictions: string[]
  ): Omit<SupplierEligibility, 'restrictions'> {
    let canReceiveRFQ = false;
    let canSubmitQuote = false;
    let canReceiveOrders = false;

    switch (status) {
      case SupplierStatus.ACTIVE:
        canReceiveRFQ = true;
        canSubmitQuote = true;
        canReceiveOrders = true;
        break;

      case SupplierStatus.PENDING:
        restrictions.push('Supplier is pending approval');
        break;

      case SupplierStatus.INACTIVE:
        restrictions.push('Supplier is inactive');
        break;

      case SupplierStatus.BLACKLISTED:
        restrictions.push('Supplier is blacklisted');
        break;
    }

    return { canReceiveRFQ, canSubmitQuote, canReceiveOrders };
  }

  /**
   * Apply active status rules
   */
  private static applyActiveStatusRules(
    supplier: Supplier,
    operations: Omit<SupplierEligibility, 'restrictions'>,
    restrictions: string[]
  ): void {
    if (!supplier.isActive) {
      restrictions.push('Supplier is not active');
      operations.canReceiveRFQ = false;
      operations.canSubmitQuote = false;
      operations.canReceiveOrders = false;
    }
  }

  /**
   * Apply compliance rules
   */
  private static applyComplianceRules(
    supplier: Supplier,
    operations: Omit<SupplierEligibility, 'restrictions'>,
    restrictions: string[]
  ): void {
    if (supplier.complianceStatus && !supplier.complianceStatus.taxCompliant) {
      restrictions.push('Tax compliance required');
      operations.canReceiveOrders = false;
    }
  }

  /**
   * Check if supplier can be activated
   */
  static canActivate(supplier: Supplier): { canActivate: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    // Check current status
    const transitionCheck = this.isValidStatusTransition(supplier.status, SupplierStatus.ACTIVE);
    if (!transitionCheck.valid) {
      reasons.push(transitionCheck.reason || 'Invalid status transition');
    }

    // Additional activation requirements
    if (!supplier.companyName?.trim()) {
      reasons.push('Company name is required');
    }

    if (!supplier.email?.trim()) {
      reasons.push('Contact email is required');
    }

    // Check compliance if required
    if (supplier.complianceStatus) {
      if (!supplier.complianceStatus.documentsVerified) {
        reasons.push('Document verification required');
      }
    }

    return {
      canActivate: reasons.length === 0,
      reasons
    };
  }

  /**
   * Check if supplier requires approval
   */
  static requiresApproval(
    currentStatus: SupplierStatus,
    newStatus: SupplierStatus
  ): boolean {
    // Specific transitions that require approval
    const requiresApprovalTransitions = [
      { from: SupplierStatus.BLACKLISTED, to: SupplierStatus.ACTIVE },
      { from: SupplierStatus.PENDING, to: SupplierStatus.ACTIVE }
    ];

    return requiresApprovalTransitions.some(
      transition => transition.from === currentStatus && transition.to === newStatus
    );
  }

  /**
   * Get required fields for status
   */
  static getRequiredFieldsForStatus(status: SupplierStatus): string[] {
    const commonFields = ['companyName', 'contactEmail'];
    
    switch (status) {
      case SupplierStatus.ACTIVE:
        return [...commonFields, 'address', 'phone'];
      
      case SupplierStatus.BLACKLISTED:
        return [...commonFields, 'blacklistReason'];
      
      case SupplierStatus.INACTIVE:
        return [...commonFields, 'inactiveReason'];
      
      default:
        return commonFields;
    }
  }
}