/**
 * Client Form Types
 * Form data structures and validation interfaces
 */

import { 
  ClientStatus,
  ClientCategory,
  ClientPriority,
  PaymentTerms,
  CreditRating,
  ContactMethod,
  ServiceType
} from './enums';
import { AddressFormData } from './core.types';

export interface ClientFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: AddressFormData;
  
  // Individual address fields for backward compatibility
  street?: string;
  city?: string;
  state?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  billingAddress?: AddressFormData;
  
  registrationNumber?: string;
  vatNumber?: string;
  industry: string;
  website?: string;
  alternativeEmail?: string;
  alternativePhone?: string;
  creditLimit: number;
  paymentTerms: PaymentTerms;
  creditRating: CreditRating;
  status: ClientStatus;
  category: ClientCategory;
  priority: ClientPriority;
  accountManagerId?: string;
  salesRepresentativeId?: string;
  preferredContactMethod: ContactMethod;
  communicationLanguage: string;
  timezone: string;
  notes?: string;
  tags: string[];
  serviceTypes: ServiceType[];
  specialRequirements?: string;
  taxExempt?: boolean;
  requiresPO?: boolean;
  autoApproveOrders?: boolean;
  allowBackorders?: boolean;
}

export interface ClientFilter {
  status?: ClientStatus[];
  category?: ClientCategory[];
  priority?: ClientPriority[];
  serviceTypes?: ServiceType[];
  accountManagerId?: string;
  salesRepresentativeId?: string;
  city?: string;
  province?: string;
  industry?: string;
  creditRating?: CreditRating[];
  searchTerm?: string;
}