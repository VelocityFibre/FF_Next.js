/**
 * Contractor Form Sections - Modular form sections following FibreFlow patterns
 * Keeping under 250 lines per RYR requirements
 */

import { ContractorFormData } from '@/types/contractor.types';
import { FieldSection } from '@/components/forms/FieldSection';
import { UniversalField } from '@/components/forms/UniversalField';

interface FormSectionProps {
  formData: ContractorFormData;
  handleInputChange: (field: keyof ContractorFormData, value: any) => void;
}

export function BasicInfoSection({ formData, handleInputChange }: FormSectionProps) {
  return (
    <FieldSection title="Company Information" icon="building">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalField
          label="Company Name"
          type="text"
          value={formData.companyName}
          onChange={(value) => handleInputChange('companyName', value)}
          required
          placeholder="Enter company name"
        />
        
        <UniversalField
          label="Registration Number"
          type="text"
          value={formData.registrationNumber}
          onChange={(value) => handleInputChange('registrationNumber', value)}
          required
          placeholder="e.g., 2020/123456/07"
        />
        
        <UniversalField
          label="Business Type"
          type="select"
          value={formData.businessType}
          onChange={(value) => handleInputChange('businessType', value)}
          required
          options={[
            { value: 'pty_ltd', label: 'Pty Ltd' },
            { value: 'cc', label: 'Close Corporation' },
            { value: 'sole_proprietor', label: 'Sole Proprietor' },
            { value: 'partnership', label: 'Partnership' }
          ]}
        />
        
        <UniversalField
          label="Industry Category"
          type="text"
          value={formData.industryCategory}
          onChange={(value) => handleInputChange('industryCategory', value)}
          placeholder="e.g., Telecommunications, Construction"
        />
        
        <UniversalField
          label="Years in Business"
          type="number"
          value={formData.yearsInBusiness}
          onChange={(value) => handleInputChange('yearsInBusiness', value)}
          placeholder="Years operating"
        />
        
        <UniversalField
          label="Employee Count"
          type="number"
          value={formData.employeeCount}
          onChange={(value) => handleInputChange('employeeCount', value)}
          placeholder="Number of employees"
        />
      </div>
    </FieldSection>
  );
}

export function ContactInfoSection({ formData, handleInputChange }: FormSectionProps) {
  return (
    <FieldSection title="Contact Information" icon="user">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalField
          label="Contact Person"
          type="text"
          value={formData.contactPerson}
          onChange={(value) => handleInputChange('contactPerson', value)}
          required
          placeholder="Primary contact name"
        />
        
        <UniversalField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          required
          placeholder="contact@company.com"
        />
        
        <UniversalField
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(value) => handleInputChange('phone', value)}
          placeholder="0821234567"
        />
        
        <UniversalField
          label="Alternative Phone"
          type="tel"
          value={formData.alternatePhone}
          onChange={(value) => handleInputChange('alternatePhone', value)}
          placeholder="Alternative contact number"
        />
      </div>
    </FieldSection>
  );
}

export function AddressSection({ formData, handleInputChange }: FormSectionProps) {
  return (
    <FieldSection title="Address Information" icon="map-pin">
      <div className="space-y-4">
        <UniversalField
          label="Physical Address"
          type="textarea"
          value={formData.physicalAddress}
          onChange={(value) => handleInputChange('physicalAddress', value)}
          placeholder="Street address"
          rows={2}
        />
        
        <UniversalField
          label="Postal Address"
          type="textarea"
          value={formData.postalAddress}
          onChange={(value) => handleInputChange('postalAddress', value)}
          placeholder="Postal address (if different)"
          rows={2}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UniversalField
            label="City"
            type="text"
            value={formData.city}
            onChange={(value) => handleInputChange('city', value)}
            placeholder="City"
          />
          
          <UniversalField
            label="Province"
            type="select"
            value={formData.province}
            onChange={(value) => handleInputChange('province', value)}
            options={[
              { value: 'Gauteng', label: 'Gauteng' },
              { value: 'Western Cape', label: 'Western Cape' },
              { value: 'KwaZulu-Natal', label: 'KwaZulu-Natal' },
              { value: 'Eastern Cape', label: 'Eastern Cape' },
              { value: 'Free State', label: 'Free State' },
              { value: 'Limpopo', label: 'Limpopo' },
              { value: 'Mpumalanga', label: 'Mpumalanga' },
              { value: 'North West', label: 'North West' },
              { value: 'Northern Cape', label: 'Northern Cape' }
            ]}
          />
          
          <UniversalField
            label="Postal Code"
            type="text"
            value={formData.postalCode}
            onChange={(value) => handleInputChange('postalCode', value)}
            placeholder="Postal code"
          />
        </div>
      </div>
    </FieldSection>
  );
}

export function FinancialSection({ formData, handleInputChange }: FormSectionProps) {
  return (
    <FieldSection title="Financial Information" icon="credit-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalField
          label="Annual Turnover"
          type="number"
          value={formData.annualTurnover}
          onChange={(value) => handleInputChange('annualTurnover', value)}
          placeholder="Annual revenue (ZAR)"
          step="10000"
        />
        
        <UniversalField
          label="Credit Rating"
          type="select"
          value={formData.creditRating}
          onChange={(value) => handleInputChange('creditRating', value)}
          options={[
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' },
            { value: 'unrated', label: 'Unrated' }
          ]}
        />
        
        <UniversalField
          label="Payment Terms"
          type="select"
          value={formData.paymentTerms}
          onChange={(value) => handleInputChange('paymentTerms', value)}
          options={[
            { value: 'immediate', label: 'Immediate' },
            { value: 'net_7', label: 'Net 7 days' },
            { value: 'net_15', label: 'Net 15 days' },
            { value: 'net_30', label: 'Net 30 days' },
            { value: 'net_60', label: 'Net 60 days' }
          ]}
        />
        
        <UniversalField
          label="Bank Name"
          type="text"
          value={formData.bankName}
          onChange={(value) => handleInputChange('bankName', value)}
          placeholder="Bank name"
        />
        
        <UniversalField
          label="Account Number"
          type="text"
          value={formData.accountNumber}
          onChange={(value) => handleInputChange('accountNumber', value)}
          placeholder="Bank account number"
        />
        
        <UniversalField
          label="Branch Code"
          type="text"
          value={formData.branchCode}
          onChange={(value) => handleInputChange('branchCode', value)}
          placeholder="Branch code"
        />
      </div>
    </FieldSection>
  );
}

export function StatusSection({ formData, handleInputChange }: FormSectionProps) {
  return (
    <FieldSection title="Status & Compliance" icon="shield-check">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalField
          label="Status"
          type="select"
          value={formData.status}
          onChange={(value) => handleInputChange('status', value)}
          required
          options={[
            { value: 'pending', label: 'Pending Review' },
            { value: 'approved', label: 'Approved' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'blacklisted', label: 'Blacklisted' },
            { value: 'under_review', label: 'Under Review' }
          ]}
        />
        
        <UniversalField
          label="Compliance Status"
          type="select"
          value={formData.complianceStatus}
          onChange={(value) => handleInputChange('complianceStatus', value)}
          required
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'compliant', label: 'Compliant' },
            { value: 'non_compliant', label: 'Non-Compliant' },
            { value: 'under_review', label: 'Under Review' }
          ]}
        />
      </div>
    </FieldSection>
  );
}