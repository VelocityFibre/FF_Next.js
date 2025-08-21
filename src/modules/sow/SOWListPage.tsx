import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  FileText,
  MapPin,
  Home,
  TrendingUp
} from 'lucide-react';
import { SOWDocument, SOWDocumentType, DocumentStatus } from '@/modules/projects/types/project.types';

interface SOWListItem extends SOWDocument {
  projectName: string;
  projectCode: string;
  uploadedByName: string;
  rejectionReason?: string;
}

export function SOWListPage() {
  const navigate = useNavigate();
  const [sowDocuments, setSowDocuments] = useState<SOWListItem[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<SOWListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [, setSelectedDocument] = useState<SOWListItem | null>(null); // For future modal/detail view

  useEffect(() => {
    loadSOWDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [sowDocuments, searchTerm, typeFilter, statusFilter]);

  const loadSOWDocuments = async () => {
    try {
      // Mock data for demonstration
      const mockDocuments: SOWListItem[] = [
        {
          id: 'sow1',
          name: 'Lawrenceburg Phase 1 - Poles.xlsx',
          type: SOWDocumentType.POLES,
          fileUrl: '/files/poles.xlsx',
          uploadDate: '2024-01-15T10:30:00',
          uploadedBy: 'user1',
          uploadedByName: 'John Smith',
          version: 1,
          status: DocumentStatus.APPROVED,
          projectName: 'Lawrenceburg Fiber Expansion',
          projectCode: 'LAW',
          metadata: {
            poleCount: 450,
            estimatedCost: 225000
          }
        },
        {
          id: 'sow2',
          name: 'Lawrenceburg Phase 1 - Drops.xlsx',
          type: SOWDocumentType.DROPS,
          fileUrl: '/files/drops.xlsx',
          uploadDate: '2024-01-15T11:00:00',
          uploadedBy: 'user1',
          uploadedByName: 'John Smith',
          version: 1,
          status: DocumentStatus.APPROVED,
          projectName: 'Lawrenceburg Fiber Expansion',
          projectCode: 'LAW',
          metadata: {
            dropCount: 1200,
            estimatedCost: 180000
          }
        },
        {
          id: 'sow3',
          name: 'Anderson Network - Fiber Routes.xlsx',
          type: SOWDocumentType.CABLE,
          fileUrl: '/files/cable.xlsx',
          uploadDate: '2024-01-16T09:15:00',
          uploadedBy: 'user2',
          uploadedByName: 'Jane Doe',
          version: 2,
          status: DocumentStatus.PENDING,
          projectName: 'Anderson Network Upgrade',
          projectCode: 'AND',
          metadata: {
            cableLength: 45000,
            estimatedCost: 450000
          }
        },
        {
          id: 'sow4',
          name: 'Greendale Equipment List.xlsx',
          type: SOWDocumentType.EQUIPMENT,
          fileUrl: '/files/equipment.xlsx',
          uploadDate: '2024-01-17T14:20:00',
          uploadedBy: 'user3',
          uploadedByName: 'Bob Johnson',
          version: 1,
          status: DocumentStatus.REJECTED,
          projectName: 'Greendale Community Network',
          projectCode: 'GRN',
          metadata: {
            estimatedCost: 75000
          },
          rejectionReason: 'Equipment specifications do not meet requirements'
        }
      ];

      setSowDocuments(mockDocuments);
      setFilteredDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading SOW documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...sowDocuments];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(search) ||
        doc.projectName.toLowerCase().includes(search) ||
        doc.projectCode.toLowerCase().includes(search) ||
        doc.uploadedByName.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  };

  const getTypeIcon = (type: SOWDocumentType) => {
    switch (type) {
      case SOWDocumentType.POLES:
        return MapPin;
      case SOWDocumentType.DROPS:
        return Home;
      case SOWDocumentType.CABLE:
        return TrendingUp;
      case SOWDocumentType.EQUIPMENT:
        return FileText;
      default:
        return FileSpreadsheet;
    }
  };

  const getTypeColor = (type: SOWDocumentType) => {
    switch (type) {
      case SOWDocumentType.POLES:
        return 'text-blue-600 bg-blue-50';
      case SOWDocumentType.DROPS:
        return 'text-green-600 bg-green-50';
      case SOWDocumentType.CABLE:
        return 'text-purple-600 bg-purple-50';
      case SOWDocumentType.EQUIPMENT:
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case DocumentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case DocumentStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDownload = (doc: SOWListItem) => {
    console.log('Downloading:', doc.name);
    // Implement download logic
  };

  const handleView = (doc: SOWListItem) => {
    setSelectedDocument(doc);
    // Navigate to detail view or open modal
  };

  const handleEdit = (doc: SOWListItem) => {
    navigate(`/app/sow/edit/${doc.id}`);
  };

  const handleDelete = async (doc: SOWListItem) => {
    if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
      // Implement delete logic
      console.log('Deleting:', doc.id);
    }
  };

  const getDocumentStats = () => {
    const total = sowDocuments.length;
    const approved = sowDocuments.filter(d => d.status === DocumentStatus.APPROVED).length;
    const pending = sowDocuments.filter(d => d.status === DocumentStatus.PENDING).length;
    const rejected = sowDocuments.filter(d => d.status === DocumentStatus.REJECTED).length;
    
    const totalValue = sowDocuments.reduce((sum, doc) => 
      sum + (doc.metadata?.estimatedCost || 0), 0
    );

    return { total, approved, pending, rejected, totalValue };
  };

  const stats = getDocumentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SOW Documents</h1>
          <p className="text-gray-600 mt-1">Manage all Scope of Work documents</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/sow/import')}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import SOW
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileSpreadsheet className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents, projects, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value={SOWDocumentType.POLES}>Poles</option>
            <option value={SOWDocumentType.DROPS}>Drops</option>
            <option value={SOWDocumentType.CABLE}>Cable/Fiber</option>
            <option value={SOWDocumentType.EQUIPMENT}>Equipment</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value={DocumentStatus.APPROVED}>Approved</option>
            <option value={DocumentStatus.PENDING}>Pending</option>
            <option value={DocumentStatus.REJECTED}>Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => {
                const TypeIcon = getTypeIcon(doc.type);
                
                return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileSpreadsheet className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">Version {doc.version}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.projectName}</p>
                        <p className="text-xs text-gray-500">Code: {doc.projectCode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded ${getTypeColor(doc.type)}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{doc.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {doc.metadata?.poleCount && (
                          <p>Poles: {doc.metadata.poleCount}</p>
                        )}
                        {doc.metadata?.dropCount && (
                          <p>Drops: {doc.metadata.dropCount}</p>
                        )}
                        {doc.metadata?.cableLength && (
                          <p>Cable: {(doc.metadata.cableLength / 1000).toFixed(1)}km</p>
                        )}
                        {doc.metadata?.estimatedCost && (
                          <p className="font-medium">{formatCurrency(doc.metadata.estimatedCost)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{doc.uploadedByName}</p>
                        <p className="text-xs text-gray-500">{formatDate(doc.uploadDate)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No SOW documents found</p>
          </div>
        )}
      </div>

      {/* Rejection Reasons */}
      {filteredDocuments.some(d => d.status === DocumentStatus.REJECTED) && (
        <div className="mt-6 bg-red-50 rounded-lg border border-red-200 p-4">
          <h3 className="text-sm font-semibold text-red-900 mb-2">Rejected Documents</h3>
          <div className="space-y-2">
            {filteredDocuments
              .filter(d => d.status === DocumentStatus.REJECTED)
              .map(doc => (
                <div key={doc.id} className="text-sm">
                  <span className="font-medium text-red-900">{doc.name}:</span>
                  <span className="text-red-700 ml-2">{doc.rejectionReason || 'No reason provided'}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}