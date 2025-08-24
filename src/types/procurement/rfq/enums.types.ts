// ============= RFQ Enumerations =============

// RFQ Status enumeration matching database schema
export enum RFQStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  RESPONSES_RECEIVED = 'responses_received',
  EVALUATED = 'evaluated',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled'
}

export type RFQStatusType = 'draft' | 'issued' | 'responses_received' | 'evaluated' | 'awarded' | 'cancelled';

// Quote Status enumeration
export enum QuoteStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export type QuoteStatusType = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired';

// Supplier Invitation Status
export enum SupplierInvitationStatus {
  SENT = 'sent',
  VIEWED = 'viewed',
  RESPONDED = 'responded',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export type SupplierInvitationStatusType = 'sent' | 'viewed' | 'responded' | 'declined' | 'expired';

// Document Types
export type QuoteDocumentType = 'certificate' | 'datasheet' | 'warranty' | 'compliance' | 'other';