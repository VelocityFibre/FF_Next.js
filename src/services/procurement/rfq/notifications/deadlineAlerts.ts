/**
 * RFQ Deadline Alerts
 * Monitoring and alerting system for RFQ deadlines
 */

import { 
  collection, 
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { RFQ, RFQStatus } from '@/types/procurement.types';

const COLLECTION_NAME = 'rfqs';

export interface DeadlineAlert {
  rfq: RFQ;
  hoursRemaining: number;
  alertLevel: 'info' | 'warning' | 'critical' | 'overdue';
  message: string;
}

export interface AlertThresholds {
  critical: number; // hours
  warning: number;  // hours
  info: number;     // hours
}

/**
 * RFQ Deadline Alerts Manager
 */
export class RFQDeadlineAlerts {
  private static readonly DEFAULT_THRESHOLDS: AlertThresholds = {
    critical: 4,   // 4 hours remaining
    warning: 24,   // 24 hours remaining
    info: 72       // 72 hours remaining
  };

  /**
   * Subscribe to deadline alerts for RFQs
   */
  static subscribeToDeadlineAlerts(
    callback: (expiringSoon: RFQ[], overdue: RFQ[]) => void,
    projectId?: string
  ): () => void {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', [RFQStatus.ISSUED, RFQStatus.RESPONSES_RECEIVED]),
      orderBy('responseDeadline', 'asc')
    );

    if (projectId) {
      q = query(q, where('projectId', '==', projectId));
    }

    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));

      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const expiringSoon = rfqs.filter(rfq => {
        const deadline = rfq.responseDeadline?.toDate();
        return deadline && deadline > now && deadline <= oneDayFromNow;
      });

      const overdue = rfqs.filter(rfq => {
        const deadline = rfq.responseDeadline?.toDate();
        return deadline && deadline <= now;
      });

      callback(expiringSoon, overdue);
    }, (error) => {
      console.error('Error subscribing to deadline alerts:', error);
    });
  }

  /**
   * Get detailed deadline alerts with alert levels
   */
  static getDetailedDeadlineAlerts(
    rfqs: RFQ[], 
    thresholds: AlertThresholds = this.DEFAULT_THRESHOLDS
  ): DeadlineAlert[] {
    const now = new Date();
    const alerts: DeadlineAlert[] = [];

    rfqs.forEach(rfq => {
      const deadline = rfq.responseDeadline?.toDate();
      if (!deadline) return;

      const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      let alertLevel: DeadlineAlert['alertLevel'];
      let message: string;

      if (hoursRemaining < 0) {
        alertLevel = 'overdue';
        const hoursOverdue = Math.abs(hoursRemaining);
        message = `RFQ is overdue by ${Math.ceil(hoursOverdue)} hour(s)`;
      } else if (hoursRemaining <= thresholds.critical) {
        alertLevel = 'critical';
        message = `Critical: Only ${Math.ceil(hoursRemaining)} hour(s) remaining`;
      } else if (hoursRemaining <= thresholds.warning) {
        alertLevel = 'warning';
        message = `Warning: ${Math.ceil(hoursRemaining)} hour(s) remaining`;
      } else if (hoursRemaining <= thresholds.info) {
        alertLevel = 'info';
        message = `Info: ${Math.ceil(hoursRemaining)} hour(s) remaining`;
      } else {
        return; // No alert needed
      }

      alerts.push({
        rfq,
        hoursRemaining: Math.ceil(hoursRemaining),
        alertLevel,
        message
      });
    });

    // Sort by urgency (overdue first, then by hours remaining)
    return alerts.sort((a, b) => {
      if (a.alertLevel === 'overdue' && b.alertLevel !== 'overdue') return -1;
      if (b.alertLevel === 'overdue' && a.alertLevel !== 'overdue') return 1;
      return a.hoursRemaining - b.hoursRemaining;
    });
  }

  /**
   * Subscribe to RFQs with response deadlines approaching
   */
  static subscribeToUpcomingDeadlines(
    callback: (rfqs: RFQ[]) => void,
    hoursAhead: number = 24,
    projectId?: string
  ): () => void {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() + hoursAhead);

    let q = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', [RFQStatus.ISSUED, RFQStatus.RESPONSES_RECEIVED]),
      where('responseDeadline', '<=', cutoffDate),
      orderBy('responseDeadline', 'asc')
    );

    if (projectId) {
      q = query(q, where('projectId', '==', projectId));
    }

    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    }, (error) => {
      console.error('Error subscribing to upcoming deadlines:', error);
    });
  }

  /**
   * Check for overdue RFQs
   */
  static subscribeToOverdueRFQs(
    callback: (overdueRfqs: RFQ[]) => void,
    projectId?: string
  ): () => void {
    const now = new Date();

    let q = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', [RFQStatus.ISSUED, RFQStatus.RESPONSES_RECEIVED]),
      where('responseDeadline', '<', now),
      orderBy('responseDeadline', 'asc')
    );

    if (projectId) {
      q = query(q, where('projectId', '==', projectId));
    }

    return onSnapshot(q, (snapshot) => {
      const overdueRfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(overdueRfqs);
    }, (error) => {
      console.error('Error subscribing to overdue RFQs:', error);
    });
  }

  /**
   * Generate deadline summary for dashboard
   */
  static generateDeadlineSummary(rfqs: RFQ[]): {
    total: number;
    overdue: number;
    dueToday: number;
    dueTomorrow: number;
    dueThisWeek: number;
    alerts: DeadlineAlert[];
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    let overdue = 0;
    let dueToday = 0;
    let dueTomorrow = 0;
    let dueThisWeek = 0;

    rfqs.forEach(rfq => {
      const deadline = rfq.responseDeadline?.toDate();
      if (!deadline) return;

      if (deadline < today) {
        overdue++;
      } else if (deadline < tomorrow) {
        dueToday++;
      } else if (deadline < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
        dueTomorrow++;
      } else if (deadline < nextWeek) {
        dueThisWeek++;
      }
    });

    const alerts = this.getDetailedDeadlineAlerts(rfqs);

    return {
      total: rfqs.length,
      overdue,
      dueToday,
      dueTomorrow,
      dueThisWeek,
      alerts: alerts.slice(0, 10) // Top 10 most urgent
    };
  }

  /**
   * Format deadline for display
   */
  static formatDeadline(deadline: Date): string {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs < 0) {
      const overdue = Math.abs(diffHours);
      if (overdue < 1) {
        return `Overdue by ${Math.ceil(Math.abs(diffMs) / (1000 * 60))} minute(s)`;
      } else if (overdue < 24) {
        return `Overdue by ${Math.ceil(overdue)} hour(s)`;
      } else {
        return `Overdue by ${Math.ceil(Math.abs(diffDays))} day(s)`;
      }
    }

    if (diffHours < 1) {
      return `${Math.ceil(diffMs / (1000 * 60))} minute(s) remaining`;
    } else if (diffHours < 24) {
      return `${Math.ceil(diffHours)} hour(s) remaining`;
    } else if (diffDays < 7) {
      return `${Math.ceil(diffDays)} day(s) remaining`;
    } else {
      return deadline.toLocaleDateString();
    }
  }

  /**
   * Get alert color based on deadline urgency
   */
  static getAlertColor(alertLevel: DeadlineAlert['alertLevel']): string {
    switch (alertLevel) {
      case 'overdue':
        return '#dc3545'; // Red
      case 'critical':
        return '#fd7e14'; // Orange
      case 'warning':
        return '#ffc107'; // Yellow
      case 'info':
        return '#17a2b8'; // Cyan
      default:
        return '#6c757d'; // Gray
    }
  }

  /**
   * Check if RFQ needs deadline extension
   */
  static suggestDeadlineExtension(rfq: RFQ): {
    shouldExtend: boolean;
    suggestedExtension: number; // hours
    reason: string;
  } {
    const now = new Date();
    const deadline = rfq.responseDeadline?.toDate();
    
    if (!deadline) {
      return {
        shouldExtend: false,
        suggestedExtension: 0,
        reason: 'No deadline set'
      };
    }

    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    const responseCount = rfq.responses?.length || 0;
    const invitedCount = rfq.invitedSuppliers?.length || 0;

    // Suggest extension if deadline is approaching and response rate is low
    if (hoursRemaining > 0 && hoursRemaining <= 12 && responseCount < invitedCount * 0.5) {
      return {
        shouldExtend: true,
        suggestedExtension: 48, // 2 days
        reason: `Low response rate (${responseCount}/${invitedCount}) with ${Math.ceil(hoursRemaining)} hours remaining`
      };
    }

    // Suggest extension if overdue with incomplete responses
    if (hoursRemaining < 0 && responseCount < invitedCount) {
      return {
        shouldExtend: true,
        suggestedExtension: 72, // 3 days
        reason: `Overdue with incomplete responses (${responseCount}/${invitedCount})`
      };
    }

    return {
      shouldExtend: false,
      suggestedExtension: 0,
      reason: 'No extension needed'
    };
  }
}