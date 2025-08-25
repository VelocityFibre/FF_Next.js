import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import { useSuppliersPortal, type Supplier } from '../../context/SuppliersPortalContext';
import { cn } from '@/lib/utils';

// Extended supplier information
interface ExtendedSupplier extends Supplier {
  email: string;
  phone: string;
  website: string;
  address: string;
  contactPerson: string;
  certifications: string[];
  businessSector: string[];
  paymentTerms: string;
  deliveryRegions: string[];
  yearEstablished: number;
  employeeCount: string;
  annualRevenue: string;
  description: string;
}

// Mock extended supplier data
const mockExtendedSuppliers: ExtendedSupplier[] = [
  {
    id: 'supplier-001',
    name: 'TechFlow Solutions',
    code: 'TFS-001',
    status: 'active',
    category: 'Technology',
    rating: 4.8,
    complianceScore: 95,
    location: 'New York, USA',
    email: 'contact@techflow.com',
    phone: '+1 (555) 123-4567',
    website: 'www.techflow.com',
    address: '123 Tech Street, New York, NY 10001',
    contactPerson: 'Sarah Johnson',
    certifications: ['ISO 9001', 'ISO 27001', 'SOC 2 Type II'],
    businessSector: ['Network Security', 'Cloud Services', 'Enterprise Software'],
    paymentTerms: 'Net 30',
    deliveryRegions: ['North America', 'Europe'],
    yearEstablished: 2010,
    employeeCount: '250-500',
    annualRevenue: '$50M - $100M',
    description: 'Leading provider of enterprise technology solutions with focus on cybersecurity and cloud infrastructure.'
  },
  {
    id: 'supplier-002',
    name: 'Global Materials Inc',
    code: 'GMI-002',
    status: 'active',
    category: 'Materials',
    rating: 4.2,
    complianceScore: 88,
    location: 'Houston, TX',
    email: 'sales@globalmaterials.com',
    phone: '+1 (555) 987-6543',
    website: 'www.globalmaterials.com',
    address: '456 Industrial Blvd, Houston, TX 77001',
    contactPerson: 'Michael Chen',
    certifications: ['ASTM', 'ISO 14001', 'OHSAS 18001'],
    businessSector: ['Steel Manufacturing', 'Construction Materials', 'Mining'],
    paymentTerms: 'Net 45',
    deliveryRegions: ['Americas', 'Asia-Pacific'],
    yearEstablished: 1995,
    employeeCount: '1000+',
    annualRevenue: '$500M+',
    description: 'Global leader in steel and construction materials with sustainable manufacturing practices.'
  },
  {
    id: 'supplier-003',
    name: 'Premium Services Ltd',
    code: 'PSL-003',
    status: 'pending',
    category: 'Services',
    rating: 4.5,
    complianceScore: 92,
    location: 'London, UK',
    email: 'info@premiumservices.co.uk',
    phone: '+44 20 7123 4567',
    website: 'www.premiumservices.co.uk',
    address: '789 Business Park, London, UK EC1A 1BB',
    contactPerson: 'Emma Thompson',
    certifications: ['ISO 9001', 'PMP', 'Prince2'],
    businessSector: ['Management Consulting', 'IT Services', 'Training'],
    paymentTerms: 'Net 30',
    deliveryRegions: ['Europe', 'Middle East', 'Africa'],
    yearEstablished: 2005,
    employeeCount: '100-250',
    annualRevenue: '$25M - $50M',
    description: 'Premium consulting firm specializing in digital transformation and strategic business advisory.'
  }
];

// Status configuration
const statusConfig = {
  active: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    label: 'Active' 
  },
  inactive: { 
    icon: XCircle, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    label: 'Inactive' 
  },
  pending: { 
    icon: Clock, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    label: 'Pending' 
  },
  suspended: { 
    icon: AlertCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    label: 'Suspended' 
  }
};

// Supplier card component
interface SupplierCardProps {
  supplier: ExtendedSupplier;
  isSelected: boolean;
  onSelect: () => void;
  viewMode: 'grid' | 'list';
}

function SupplierCard({ supplier, isSelected, onSelect, viewMode }: SupplierCardProps) {
  const status = statusConfig[supplier.status];
  const StatusIcon = status.icon;

  if (viewMode === 'list') {
    return (
      <div 
        className={cn(
          "bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
          isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
              <p className="text-sm text-gray-600">{supplier.code} • {supplier.category}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {supplier.location}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Mail className="w-3 h-3 mr-1" />
                  {supplier.contactPerson}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">{supplier.rating}</span>
              </div>
              <p className="text-xs text-gray-500">{supplier.complianceScore}% compliance</p>
            </div>
            <div className={cn("px-2 py-1 rounded-full flex items-center space-x-1", status.bgColor)}>
              <StatusIcon className={cn("w-3 h-3", status.color)} />
              <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "bg-white border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-7 h-7 text-blue-600" />
        </div>
        <div className={cn("px-2 py-1 rounded-full flex items-center space-x-1", status.bgColor)}>
          <StatusIcon className={cn("w-3 h-3", status.color)} />
          <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-1">{supplier.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{supplier.code}</p>
        <p className="text-xs text-gray-500 line-clamp-2">{supplier.description}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-3 h-3 mr-2 text-gray-400" />
          {supplier.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-3 h-3 mr-2 text-gray-400" />
          {supplier.contactPerson}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Globe className="w-3 h-3 mr-2 text-gray-400" />
          {supplier.category}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="font-medium text-sm">{supplier.rating}</span>
          <span className="text-xs text-gray-500">({supplier.complianceScore}% compliance)</span>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Supplier detail panel component
function SupplierDetailPanel({ supplier }: { supplier: ExtendedSupplier | null }) {
  if (!supplier) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Supplier</h3>
          <p className="text-gray-600">Choose a supplier from the list to view detailed information.</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[supplier.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{supplier.name}</h2>
            <p className="text-blue-100 mt-1">{supplier.code} • {supplier.category}</p>
            <p className="text-blue-100 text-sm mt-2">{supplier.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="flex items-center space-x-1 justify-end">
                <Star className="w-5 h-5 text-yellow-300 fill-current" />
                <span className="font-semibold text-lg">{supplier.rating}</span>
              </div>
              <p className="text-blue-100 text-sm">{supplier.complianceScore}% compliance</p>
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center space-x-2">
              <StatusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{supplier.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{supplier.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Website</p>
                <a href={`https://${supplier.website}`} className="font-medium text-blue-600 hover:text-blue-700">
                  {supplier.website}
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{supplier.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Contact Person</p>
              <p className="font-medium">{supplier.contactPerson}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Year Established</p>
              <p className="font-medium">{supplier.yearEstablished}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employee Count</p>
              <p className="font-medium">{supplier.employeeCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Annual Revenue</p>
              <p className="font-medium">{supplier.annualRevenue}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Terms</p>
              <p className="font-medium">{supplier.paymentTerms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivery Regions</p>
              <p className="font-medium">{supplier.deliveryRegions.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Business Sectors */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Sectors</h3>
          <div className="flex flex-wrap gap-2">
            {supplier.businessSector.map((sector, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {supplier.certifications.map((cert, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <CheckCircle className="w-3 h-3 inline mr-1" />
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 flex space-x-3">
        <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Select Supplier
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Edit Profile
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Send Message
        </button>
      </div>
    </div>
  );
}

export function CompanyProfileTab() {
  const { selectedSupplier, setSupplier } = useSuppliersPortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detailSupplier, setDetailSupplier] = useState<ExtendedSupplier | null>(null);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = mockExtendedSuppliers;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    return filtered;
  }, [searchTerm, statusFilter, categoryFilter]);

  const categories = [...new Set(mockExtendedSuppliers.map(s => s.category))];

  const handleSupplierSelect = (supplier: ExtendedSupplier) => {
    setSupplier(supplier);
    setDetailSupplier(supplier);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Profile Directory</h2>
          <p className="text-gray-600 mt-1">
            Browse and manage supplier profiles. Select a supplier to filter other tabs.
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Filters and View Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              {filteredSuppliers.length} suppliers
            </div>
            <div className="flex border border-gray-300 rounded-md">
              <button
                className={cn("px-3 py-2 text-sm", viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-700')}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                className={cn("px-3 py-2 text-sm", viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700')}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: Suppliers List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suppliers List */}
        <div className="space-y-4">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Suppliers Found</h3>
              <p className="text-gray-600">No suppliers match your current filters.</p>
            </div>
          ) : (
            <div className={cn("space-y-4", viewMode === 'grid' && "grid grid-cols-1 gap-4")}>
              {filteredSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  isSelected={selectedSupplier?.id === supplier.id}
                  onSelect={() => handleSupplierSelect(supplier)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:sticky lg:top-6">
          <SupplierDetailPanel supplier={detailSupplier} />
        </div>
      </div>
    </div>
  );
}

export default CompanyProfileTab;