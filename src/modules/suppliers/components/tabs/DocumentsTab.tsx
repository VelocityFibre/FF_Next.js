import { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Award,
  Search,
  FolderOpen
} from 'lucide-react';
import { useSuppliersPortal } from '../../context/SuppliersPortalContext';
import { cn } from '@/lib/utils';
import { log } from '@/lib/logger';

// Document types
interface SupplierDocument {
  id: string;
  name: string;
  type: 'contract' | 'certificate' | 'compliance' | 'insurance' | 'financial' | 'quality' | 'safety';
  supplierId: string;
  supplierName: string;
  status: 'current' | 'expiring_soon' | 'expired' | 'pending_review' | 'rejected';
  uploadDate: string;
  expiryDate?: string;
  fileSize: number;
  fileType: string;
  version: number;
  description: string;
  isRequired: boolean;
  reviewedBy?: string;
  reviewDate?: string;
  tags: string[];
}

// Document status configuration
const statusConfig = {
  current: {
    label: 'Current',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  },
  expiring_soon: {
    label: 'Expiring Soon',
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600'
  },
  expired: {
    label: 'Expired',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
  pending_review: {
    label: 'Pending Review',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  }
};

// Document type configuration
const typeConfig = {
  contract: { label: 'Contract', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  certificate: { label: 'Certificate', icon: Award, color: 'bg-green-100 text-green-800' },
  compliance: { label: 'Compliance', icon: Shield, color: 'bg-purple-100 text-purple-800' },
  insurance: { label: 'Insurance', icon: Shield, color: 'bg-indigo-100 text-indigo-800' },
  financial: { label: 'Financial', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
  quality: { label: 'Quality', icon: Award, color: 'bg-green-100 text-green-800' },
  safety: { label: 'Safety', icon: Shield, color: 'bg-red-100 text-red-800' }
};

// Mock documents data
const mockDocuments: SupplierDocument[] = [
  {
    id: 'doc-001',
    name: 'Master Service Agreement',
    type: 'contract',
    supplierId: 'supplier-001',
    supplierName: 'TechFlow Solutions',
    status: 'current',
    uploadDate: '2023-01-15',
    expiryDate: '2024-12-31',
    fileSize: 2048576,
    fileType: 'PDF',
    version: 2,
    description: 'Primary service agreement covering all technology services',
    isRequired: true,
    reviewedBy: 'John Smith',
    reviewDate: '2023-01-20',
    tags: ['primary', 'technology', 'services']
  },
  {
    id: 'doc-002',
    name: 'ISO 27001 Certificate',
    type: 'certificate',
    supplierId: 'supplier-001',
    supplierName: 'TechFlow Solutions',
    status: 'expiring_soon',
    uploadDate: '2023-06-01',
    expiryDate: '2024-06-01',
    fileSize: 1024768,
    fileType: 'PDF',
    version: 1,
    description: 'Information Security Management System certification',
    isRequired: true,
    reviewedBy: 'Sarah Johnson',
    reviewDate: '2023-06-05',
    tags: ['security', 'iso', 'certification']
  },
  {
    id: 'doc-003',
    name: 'General Liability Insurance',
    type: 'insurance',
    supplierId: 'supplier-002',
    supplierName: 'Global Materials Inc',
    status: 'current',
    uploadDate: '2023-03-10',
    expiryDate: '2025-03-10',
    fileSize: 1536000,
    fileType: 'PDF',
    version: 1,
    description: 'General liability insurance coverage certificate',
    isRequired: true,
    reviewedBy: 'Mike Johnson',
    reviewDate: '2023-03-15',
    tags: ['insurance', 'liability', 'coverage']
  },
  {
    id: 'doc-004',
    name: 'ASTM Compliance Report',
    type: 'compliance',
    supplierId: 'supplier-002',
    supplierName: 'Global Materials Inc',
    status: 'pending_review',
    uploadDate: '2024-01-20',
    fileSize: 3072000,
    fileType: 'PDF',
    version: 1,
    description: 'Annual ASTM standards compliance assessment',
    isRequired: true,
    tags: ['astm', 'compliance', 'materials']
  },
  {
    id: 'doc-005',
    name: 'Financial Statements 2023',
    type: 'financial',
    supplierId: 'supplier-003',
    supplierName: 'Premium Services Ltd',
    status: 'current',
    uploadDate: '2024-01-05',
    fileSize: 2560000,
    fileType: 'PDF',
    version: 1,
    description: 'Audited financial statements for fiscal year 2023',
    isRequired: false,
    reviewedBy: 'Finance Team',
    reviewDate: '2024-01-10',
    tags: ['financial', 'statements', '2023']
  }
];

// Document card component
interface DocumentCardProps {
  document: SupplierDocument;
  onView: (doc: SupplierDocument) => void;
  onDownload: (doc: SupplierDocument) => void;
}

function DocumentCard({ document, onView, onDownload }: DocumentCardProps) {
  const status = statusConfig[document.status];
  const type = typeConfig[document.type];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = () => {
    if (!document.expiryDate) return null;
    const today = new Date();
    const expiry = new Date(document.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{document.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
            
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", type.color)}>
                {type.label}
              </span>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", status.color)}>
                <StatusIcon className={cn("w-3 h-3 inline mr-1", status.iconColor)} />
                {status.label}
              </span>
              {document.isRequired && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Required
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <p className="font-medium">Uploaded</p>
          <p>{formatDate(document.uploadDate)}</p>
        </div>
        {document.expiryDate && (
          <div>
            <p className="font-medium">Expires</p>
            <p className={cn(
              daysUntilExpiry !== null && daysUntilExpiry < 30 ? 'text-red-600 font-medium' : '',
              daysUntilExpiry !== null && daysUntilExpiry < 90 && daysUntilExpiry >= 30 ? 'text-yellow-600 font-medium' : ''
            )}>
              {formatDate(document.expiryDate)}
              {daysUntilExpiry !== null && (
                <span className="block text-xs">
                  ({daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : `${Math.abs(daysUntilExpiry)} days overdue`})
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>v{document.version}</span>
          <span>{formatFileSize(document.fileSize)}</span>
          <span>{document.fileType}</span>
          {document.reviewedBy && (
            <span>Reviewed by {document.reviewedBy}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(document)}
            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm border border-blue-200 transition-colors"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            View
          </button>
          <button
            onClick={() => onDownload(document)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 inline mr-1" />
            Download
          </button>
        </div>
      </div>

      {document.tags.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Document categories summary
function DocumentSummary({ documents }: { documents: SupplierDocument[] }) {
  const stats = {
    total: documents.length,
    current: documents.filter(d => d.status === 'current').length,
    expiringSoon: documents.filter(d => d.status === 'expiring_soon').length,
    expired: documents.filter(d => d.status === 'expired').length,
    pendingReview: documents.filter(d => d.status === 'pending_review').length,
    required: documents.filter(d => d.isRequired).length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
        <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
        <div className="text-sm text-blue-700">Total Documents</div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-green-900">{stats.current}</div>
        <div className="text-sm text-green-700">Current</div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
        <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-yellow-900">{stats.expiringSoon}</div>
        <div className="text-sm text-yellow-700">Expiring Soon</div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
        <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-red-900">{stats.expired}</div>
        <div className="text-sm text-red-700">Expired</div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
        <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-purple-900">{stats.pendingReview}</div>
        <div className="text-sm text-purple-700">Pending Review</div>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-200">
        <Shield className="w-6 h-6 text-orange-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-orange-900">{stats.required}</div>
        <div className="text-sm text-orange-700">Required</div>
      </div>
    </div>
  );
}

export function DocumentsTab() {
  const { selectedSupplier } = useSuppliersPortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requirementFilter, setRequirementFilter] = useState<string>('all');

  // Filter documents based on selected supplier and filters
  const filteredDocuments = useMemo(() => {
    let filtered = mockDocuments;

    // Filter by selected supplier
    if (selectedSupplier) {
      filtered = filtered.filter(doc => doc.supplierId === selectedSupplier.id);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Filter by requirement
    if (requirementFilter === 'required') {
      filtered = filtered.filter(doc => doc.isRequired);
    } else if (requirementFilter === 'optional') {
      filtered = filtered.filter(doc => !doc.isRequired);
    }

    return filtered;
  }, [selectedSupplier, searchTerm, typeFilter, statusFilter, requirementFilter]);

  const handleViewDocument = (document: SupplierDocument) => {
    log.info('View document:', { data: document.id }, 'DocumentsTab');
    // Implementation for viewing document
  };

  const handleDownloadDocument = (document: SupplierDocument) => {
    log.info('Download document:', { data: document.id }, 'DocumentsTab');
    // Implementation for downloading document
  };

  if (!selectedSupplier) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Supplier</h3>
        <p className="text-gray-600">
          Choose a supplier from the Company Profile tab to view their documents, certifications, and compliance records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Documents - {selectedSupplier.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Manage contracts, certifications, compliance documents, and other supplier records
          </p>
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Document Summary */}
      <DocumentSummary documents={filteredDocuments} />

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.entries(typeConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={requirementFilter}
            onChange={(e) => setRequirementFilter(e.target.value)}
          >
            <option value="all">All Documents</option>
            <option value="required">Required Only</option>
            <option value="optional">Optional Only</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-600">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || requirementFilter !== 'all' 
              ? 'No documents match your current filters.'
              : 'No documents have been uploaded for this supplier yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleViewDocument}
              onDownload={handleDownloadDocument}
            />
          ))}
        </div>
      )}

      {/* Compliance Alert */}
      {selectedSupplier && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-900">Document Compliance Status</h3>
              <p className="text-sm text-amber-700 mt-1">
                {filteredDocuments.filter(d => d.status === 'expired').length} expired documents and{' '}
                {filteredDocuments.filter(d => d.status === 'expiring_soon').length} documents expiring soon require attention.
              </p>
              <div className="mt-3">
                <button className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1 rounded-md transition-colors">
                  Review Compliance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsTab;