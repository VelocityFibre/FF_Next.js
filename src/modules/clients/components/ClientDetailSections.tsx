import { Client } from '@/types/client.types';
import { Mail, Phone, Globe, MapPin, CreditCard, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface SectionProps {
  client: Client;
}

export function ClientInfoSection({ client }: SectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'former': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
          <p className="text-gray-600">{client.industry}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
            {client.status.toUpperCase()}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(client.priority)}`}>
            {client.priority.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Primary Email</p>
            <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
              {client.email}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Primary Phone</p>
            <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
              {client.phone}
            </a>
          </div>
        </div>

        {client.website && (
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <a 
                href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {client.website}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-gray-900">{client.city}, {client.province}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactDetailsSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Contact Person</p>
          <p className="font-medium">{client.contactPerson}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Primary Email</p>
          <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
            {client.email}
          </a>
        </div>

        {client.alternativeEmail && (
          <div>
            <p className="text-sm text-gray-500">Alternative Email</p>
            <a href={`mailto:${client.alternativeEmail}`} className="text-blue-600 hover:underline">
              {client.alternativeEmail}
            </a>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Primary Phone</p>
          <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
            {client.phone}
          </a>
        </div>

        {client.alternativePhone && (
          <div>
            <p className="text-sm text-gray-500">Alternative Phone</p>
            <a href={`tel:${client.alternativePhone}`} className="text-blue-600 hover:underline">
              {client.alternativePhone}
            </a>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Communication Preferences</p>
          <p className="font-medium">
            {client.preferredContactMethod.replace('_', ' ').toUpperCase()} • {client.communicationLanguage}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CompanyDetailsSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {client.registrationNumber && (
          <div>
            <p className="text-sm text-gray-500">Registration Number</p>
            <p className="font-medium">{client.registrationNumber}</p>
          </div>
        )}

        {client.vatNumber && (
          <div>
            <p className="text-sm text-gray-500">VAT Number</p>
            <p className="font-medium">{client.vatNumber}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-medium">
            {client.category.replace('_', ' ').charAt(0).toUpperCase() + client.category.slice(1)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Industry</p>
          <p className="font-medium">{client.industry}</p>
        </div>
      </div>
    </div>
  );
}

export function AddressDetailsSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
      
      <div className="space-y-2">
        <p className="text-gray-900">{client.address}</p>
        <p className="text-gray-900">
          {client.city}, {client.province} {client.postalCode}
        </p>
        <p className="text-gray-900">{client.country}</p>
      </div>
    </div>
  );
}

export function FinancialDetailsSection({ client }: SectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCreditRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Credit Limit</p>
          <p className="font-medium text-lg">{formatCurrency(client.creditLimit)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="font-medium text-lg">{formatCurrency(client.currentBalance)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Payment Terms</p>
          <p className="font-medium">{client.paymentTerms.replace('_', ' ').toUpperCase()}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Credit Rating</p>
          <p className={`font-medium ${getCreditRatingColor(client.creditRating)}`}>
            {client.creditRating.charAt(0).toUpperCase() + client.creditRating.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProjectMetricsSection({ client }: SectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Metrics</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{client.activeProjects}</p>
          <p className="text-sm text-gray-500">Active Projects</p>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{client.completedProjects}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-gray-600">{client.totalProjects}</p>
          <p className="text-sm text-gray-500">Total Projects</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Project Value</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(client.totalProjectValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Project Value</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(client.averageProjectValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceTypesSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Types</h3>
      
      <div className="flex flex-wrap gap-2">
        {client.serviceTypes.map(service => (
          <span
            key={service}
            className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
          >
            {service.toUpperCase()}
          </span>
        ))}
      </div>

      {client.specialRequirements && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Special Requirements</p>
          <p className="text-gray-900">{client.specialRequirements}</p>
        </div>
      )}
    </div>
  );
}

export function NotesSection({ client }: SectionProps) {
  if (!client.notes && (!client.tags || client.tags.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
      
      {client.tags && client.tags.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {client.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {client.notes && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Notes</p>
          <p className="text-gray-900 whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}
    </div>
  );
}