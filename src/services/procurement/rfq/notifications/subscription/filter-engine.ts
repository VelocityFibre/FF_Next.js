/**
 * Filter Engine
 * Advanced filtering and querying for RFQ subscriptions
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
import { log } from '@/lib/logger';

const COLLECTION_NAME = 'rfqs';

export class RFQFilterEngine {
  /**
   * Subscribe to RFQs with response deadlines approaching
   */
  static subscribeToUpcomingDeadlines(
    callback: (rfqs: RFQ[]) => void,
    hoursAhead: number = 24
  ): () => void {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() + hoursAhead);

    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', [RFQStatus.ISSUED, RFQStatus.RESPONSES_RECEIVED]),
      where('responseDeadline', '<=', cutoffDate),
      orderBy('responseDeadline', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    }, (error) => {
      log.error('Error subscribing to upcoming deadlines:', { data: error }, 'filter-engine');
    });
  }

  /**
   * Subscribe to RFQ activity feed (recent changes)
   */
  static subscribeToActivityFeed(
    callback: (activities: Array<{
      rfqId: string;
      rfqTitle: string;
      action: string;
      timestamp: Date;
      userId?: string;
      details?: any;
    }>) => void,
    projectId?: string
  ): () => void {
    let q = query(
      collection(db, 'rfq_activities'),
      orderBy('timestamp', 'desc')
    );

    if (projectId) {
      q = query(q, where('projectId', '==', projectId));
    }

    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      callback(activities);
    }, (error) => {
      log.error('Error subscribing to activity feed:', { data: error }, 'filter-engine');
    });
  }

  /**
   * Subscribe to RFQ metrics and statistics
   */
  static subscribeToRFQMetrics(
    callback: (metrics: {
      totalRFQs: number;
      activeRFQs: number;
      overdueRFQs: number;
      completedThisMonth: number;
    }) => void,
    projectId?: string
  ): () => void {
    const baseQuery = collection(db, COLLECTION_NAME);
    
    if (projectId) {
      const q = query(baseQuery, where('projectId', '==', projectId));
      return onSnapshot(q, (snapshot) => {
        const rfqs = snapshot.docs.map(doc => doc.data() as RFQ);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const metrics = {
          totalRFQs: rfqs.length,
          activeRFQs: rfqs.filter(rfq => 
            [RFQStatus.DRAFT, RFQStatus.ISSUED, RFQStatus.RESPONSES_RECEIVED].includes(rfq.status as RFQStatus)
          ).length,
          overdueRFQs: rfqs.filter(rfq => 
            rfq.responseDeadline && new Date(rfq.responseDeadline) < now
          ).length,
          completedThisMonth: rfqs.filter(rfq => 
            rfq.status === RFQStatus.AWARDED && 
            rfq.updatedAt && new Date(rfq.updatedAt) >= monthStart
          ).length
        };

        callback(metrics);
      });
    }

    return onSnapshot(baseQuery, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => doc.data() as RFQ);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const metrics = {
        totalRFQs: rfqs.length,
        activeRFQs: rfqs.filter(rfq => 
          [RFQStatus.DRAFT, RFQStatus.ISSUED, RFQStatus.RESPONSES_RECEIVED].includes(rfq.status as RFQStatus)
        ).length,
        overdueRFQs: rfqs.filter(rfq => 
          rfq.responseDeadline && new Date(rfq.responseDeadline) < now
        ).length,
        completedThisMonth: rfqs.filter(rfq => 
          rfq.status === RFQStatus.AWARDED && 
          rfq.updatedAt && new Date(rfq.updatedAt) >= monthStart
        ).length
      };

      callback(metrics);
    });
  }
}