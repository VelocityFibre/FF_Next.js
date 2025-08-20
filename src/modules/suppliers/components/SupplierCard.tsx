import { useNavigate } from 'react-router-dom';
import { 
  Building2, Mail, Phone, MapPin, Star, TrendingUp, 
  AlertCircle, CheckCircle, Clock, XCircle, MoreVertical 
} from 'lucide-react';
import { Supplier, SupplierStatus } from '@/types/supplier.types';

interface SupplierCardProps {
  supplier: Supplier;
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/suppliers/${supplier.id}`);
  };

  const getStatusIcon = () => {
    switch (supplier.status) {
      case SupplierStatus.ACTIVE:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case SupplierStatus.INACTIVE:
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case SupplierStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case SupplierStatus.SUSPENDED:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case SupplierStatus.BLACKLISTED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (supplier.status) {
      case SupplierStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SupplierStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case SupplierStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case SupplierStatus.SUSPENDED:
        return 'bg-orange-100 text-orange-800';
      case SupplierStatus.BLACKLISTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRating = () => {
    const rating = supplier.rating.overall;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          ({supplier.rating.totalReviews})
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {supplier.status}
            </span>
            {supplier.isPreferred && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Preferred
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{supplier.companyName}</h3>
          <p className="text-sm text-gray-500">Reg: {supplier.registrationNo}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Show dropdown menu
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
          <span>{supplier.businessType}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2 text-gray-400" />
          <span className="truncate">{supplier.contact.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2 text-gray-400" />
          <span>{supplier.contact.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span>{supplier.contact.address.city}, {supplier.contact.address.province}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {supplier.categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {category.replace(/_/g, ' ')}
            </span>
          ))}
          {supplier.categories.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{supplier.categories.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Performance */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Rating</p>
            {renderRating()}
          </div>
          <div>
            <p className="text-xs text-gray-500">Performance</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-sm font-medium text-gray-900">
                {supplier.performanceScore}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Compliance Status */}
        <div className="mt-3 flex items-center gap-2">
          {supplier.compliance?.taxCompliant && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Tax
            </span>
          )}
          {supplier.compliance?.insuranceValid && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Insurance
            </span>
          )}
          {supplier.compliance?.bbbeeLevel && (
            <span className="text-xs text-blue-600">
              BBBEE L{supplier.compliance.bbbeeLevel}
            </span>
          )}
        </div>
      </div>

      {/* Active Indicators */}
      {(supplier.activeRFQs || supplier.completedOrders) && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
          {supplier.activeRFQs > 0 && (
            <span>{supplier.activeRFQs} active RFQs</span>
          )}
          {supplier.completedOrders > 0 && (
            <span>{supplier.completedOrders} orders completed</span>
          )}
        </div>
      )}
    </div>
  );
}