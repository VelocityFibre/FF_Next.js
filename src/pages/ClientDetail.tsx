import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Phone, Globe, Building, CreditCard, TrendingUp } from 'lucide-react';
import { useClient, useDeleteClient } from '@/hooks/useClients';
import { format } from 'date-fns';

export function ClientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading, error } = useClient(id || '');
  const deleteMutation = useDeleteClient();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await deleteMutation.mutateAsync(id!);
      navigate('/app/clients');
    } catch (error) {
      alert('Failed to delete client');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Client not found</p>
        </div>
      </div>
    );
  }

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

  const getCreditRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/clients')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Client List
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
                <p className="text-sm text-gray-500">{client.contactPerson}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/app/clients/${id}/edit`)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority Badges */}
          <div className="flex gap-2">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(client.status)}`}>
              {client.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(client.priority)}`}>
              {client.priority.toUpperCase()} PRIORITY
            </span>
            <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
              {client.category.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Primary Email</p>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                    {client.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Primary Phone</p>
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-800">
                    {client.phone}
                  </a>
                </div>
              </div>

              {client.alternativeEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Alternative Email</p>
                    <a href={`mailto:${client.alternativeEmail}`} className="text-blue-600 hover:text-blue-800">
                      {client.alternativeEmail}
                    </a>
                  </div>
                </div>
              )}

              {client.alternativePhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Alternative Phone</p>
                    <a href={`tel:${client.alternativePhone}`} className="text-blue-600 hover:text-blue-800">
                      {client.alternativePhone}
                    </a>
                  </div>
                </div>
              )}

              {client.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {client.website}
                    </a>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Preferred Contact Method</p>
                <p className="font-medium">
                  {client.preferredContactMethod.replace('_', ' ').charAt(0).toUpperCase() + client.preferredContactMethod.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-sm text-gray-500">Industry</p>
                <p className="font-medium">{client.industry}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="font-medium">{client.communicationLanguage}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="font-medium">{client.timezone}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <p className="text-sm text-gray-500">Credit Limit</p>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(client.creditLimit)}
                </p>
                <p className={`text-sm mt-1 ${getCreditRatingColor(client.creditRating)}`}>
                  {client.creditRating.charAt(0).toUpperCase() + client.creditRating.slice(1)} Rating
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <p className="text-sm text-gray-500">Current Balance</p>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(client.currentBalance)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {client.paymentTerms.replace('_', ' ').toUpperCase()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Project Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(client.totalProjectValue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Avg: {formatCurrency(client.averageProjectValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Project Statistics */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Project Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-semibold text-blue-900">{client.totalProjects}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-semibold text-green-900">{client.activeProjects}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Completed Projects</p>
                <p className="text-2xl font-semibold text-purple-900">{client.completedProjects}</p>
              </div>
            </div>
          </div>

          {/* Service Types */}
          {client.serviceTypes && client.serviceTypes.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Service Types</h2>
              <div className="flex flex-wrap gap-2">
                {client.serviceTypes.map((service: string) => (
                  <span
                    key={service}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {service.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          {client.address && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{client.address}</p>
                <p>{client.city}, {client.province} {client.postalCode}</p>
                <p>{client.country}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {client.createdAt?.toDate 
                  ? format(client.createdAt.toDate(), 'dd MMM yyyy HH:mm')
                  : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {client.updatedAt?.toDate 
                  ? format(client.updatedAt.toDate(), 'dd MMM yyyy HH:mm')
                  : 'N/A'}
              </div>
              {client.lastContactDate && (
                <div>
                  <span className="font-medium">Last Contact:</span>{' '}
                  {client.lastContactDate.toDate 
                    ? format(client.lastContactDate.toDate(), 'dd MMM yyyy')
                    : 'N/A'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}