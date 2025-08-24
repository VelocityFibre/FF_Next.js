// ============= Evaluation & Comparison Types =============

// Evaluation criteria for RFQ
export interface EvaluationCriteria {
  priceWeight: number; // 0-100
  qualityWeight: number; // 0-100
  deliveryWeight: number; // 0-100
  technicalWeight: number; // 0-100
  serviceWeight: number; // 0-100
  customCriteria?: Array<{
    name: string;
    weight: number;
    description?: string;
  }>;
}

// Quote comparison for evaluation
export interface QuoteComparison {
  rfqId: string;
  rfqNumber: string;
  
  quotes: Array<{
    quoteId: string;
    supplierId: string;
    supplierName: string;
    totalValue: number;
    evaluationScore?: number;
    technicalScore?: number;
    commercialScore?: number;
    ranking?: number;
    isWinner: boolean;
  }>;
  
  itemComparisons: Array<{
    rfqItemId: string;
    itemDescription: string;
    quotes: Array<{
      quoteId: string;
      quoteItemId: string;
      supplierName: string;
      unitPrice: number;
      totalPrice: number;
      leadTime?: number;
      technicalCompliance: boolean;
      alternateOffered: boolean;
    }>;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    recommendedQuoteItemId?: string;
  }>;
  
  // Overall recommendation
  recommendedQuoteId?: string;
  recommendationReason?: string;
  
  // Metadata
  comparedAt: Date;
  comparedBy: string;
}

// RFQ statistics for dashboard
export interface RFQStats {
  totalRFQs: number;
  draftRFQs: number;
  issuedRFQs: number;
  awaitingResponses: number;
  responsesReceived: number;
  evaluated: number;
  awarded: number;
  cancelled: number;
  totalQuotes: number;
  averageQuotesPerRFQ: number;
  averageResponseTime: number; // days
  totalValue: number;
  averageValue: number;
}