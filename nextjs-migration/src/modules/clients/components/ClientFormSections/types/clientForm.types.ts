import { 
  ClientFormData, 
  ClientStatus, 
  ClientCategory,
  ClientPriority,
  PaymentTerms,
  CreditRating,
  ContactMethod,
  ServiceType
} from '@/types/client.types';

export interface SectionProps {
  formData: ClientFormData;
  handleInputChange: (field: keyof ClientFormData, value: any) => void;
  toggleServiceType?: (service: ServiceType) => void;
  handleTagsChange?: (value: string) => void;
}

// Type exports (interfaces)
export type {
  ClientFormData
};

// Value exports (enums)
export {
  ClientStatus,
  ClientCategory,
  ClientPriority,
  PaymentTerms,
  CreditRating,
  ContactMethod,
  ServiceType
};