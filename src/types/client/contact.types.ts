/**
 * Client Contact History Types
 * Communication tracking and interaction types
 */

import { Timestamp } from 'firebase/firestore';
import { ContactMethod, ContactPurpose, ContactOutcome } from './enums';

export interface ContactHistory {
  id?: string;
  clientId: string;
  contactDate: Timestamp;
  contactMethod: ContactMethod;
  contactedBy: string;
  contactedByName: string;
  purpose: ContactPurpose;
  summary: string;
  outcome: ContactOutcome;
  nextAction?: string;
  nextActionDate?: Timestamp;
  attachments?: string[];
  createdAt: Timestamp;
}