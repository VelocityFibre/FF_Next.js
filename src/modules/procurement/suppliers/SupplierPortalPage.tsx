import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, FileText, TrendingUp, User, Award, AlertTriangle, CheckCircle, Clock, Upload } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { VelocityButton } from '@/components/ui/VelocityButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SupplierCrudService } from '@/services/suppliers';
import type { Supplier, SupplierDocument } from '@/types/supplier/base.types';
import { DocumentType } from '@/types/supplier/base.types';
import QuoteSubmissionModal from './components/QuoteSubmissionModal';

interface SupplierPortalProps {}

interface SupplierSession {
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  authenticated: boolean;
}

interface RFQInvitation {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'awarded' | 'rejected';
  projectName: string;
  estimatedValue: number;
  urgency: 'low' | 'medium' | 'high';
}

interface SupplierStats {
  activeRFQs: number;
  completedQuotes: number;
  averageScore: number;
  complianceStatus: 'compliant' | 'pending' | 'non-compliant';
  documentsExpiring: number;
  winRate: number;
}

const SupplierPortalPage: React.FC<SupplierPortalProps> = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rfqs' | 'profile' | 'performance' | 'documents' | 'messages'>('dashboard');
  const [supplierSession, setSupplierSession] = useState<SupplierSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [rfqInvitations, setRFQInvitations] = useState<RFQInvitation[]>([]);
  const [authEmail, setAuthEmail] = useState('');
  const [authStep, setAuthStep] = useState<'email' | 'verification'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQInvitation | null>(null);

  // Mock supplier session for demo - in production this would come from authentication
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check for existing session or demo mode
        const mockSession: SupplierSession = {
          supplierId: 'supplier-001',
          supplierName: 'TechCorp Solutions',
          supplierEmail: 'contact@techcorp.com',
          authenticated: true
        };
        
        setSupplierSession(mockSession);
        
        // Load supplier data
        const supplierData = await SupplierCrudService.getById(mockSession.supplierId).catch(() => {
          // Return mock data if service call fails
          return {
            id: mockSession.supplierId,
            name: mockSession.supplierName,
            phone: '+27-11-555-0124',
            email: mockSession.supplierEmail,
            code: 'TECH001',
            status: 'active' as const,
            businessType: 'manufacturer' as const,
            categories: ['electronics', 'components'],
            rating: { overall: 4.2, totalReviews: 15 },
            primaryContact: {
              name: 'John Smith',
              email: mockSession.supplierEmail,
              phone: '+27-11-555-0123'
            },
            contact: {
              name: 'John Smith',
              email: mockSession.supplierEmail,
              phone: '+27-11-555-0123'
            },
            addresses: {
              physical: {
                street1: '123 Business Park',
                city: 'Johannesburg',
                state: 'Gauteng',
                postalCode: '2001',
                country: 'South Africa'
              }
            },
            createdBy: 'system',
            createdAt: '2024-01-01',
            isActive: true,
            isPreferred: true
          } as Supplier;
        });
        
        setSupplier(supplierData);
        
        // Load dashboard stats
        setStats({
          activeRFQs: 5,
          completedQuotes: 23,
          averageScore: 4.2,
          complianceStatus: 'compliant',
          documentsExpiring: 2,
          winRate: 68
        });
        
        // Load RFQ invitations
        setRFQInvitations([
          {
            id: 'rfq-001',
            rfqNumber: 'RFQ-2024-001',
            title: 'Fiber Optic Cables - Q1 2024',
            description: 'Supply of single-mode fiber optic cables for network expansion project',
            dueDate: '2024-09-15',
            status: 'pending',
            projectName: 'Network Expansion Phase 2',
            estimatedValue: 150000,
            urgency: 'high'
          },
          {
            id: 'rfq-002',
            rfqNumber: 'RFQ-2024-002',
            title: 'Network Equipment Maintenance',
            description: 'Annual maintenance contract for network infrastructure',
            dueDate: '2024-09-20',
            status: 'pending',
            projectName: 'Infrastructure Maintenance',
            estimatedValue: 85000,
            urgency: 'medium'
          }
        ]);
        
      } catch (error) {
        console.error('Failed to initialize supplier session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const handleAuthentication = async (_email: string) => {
    setLoading(true);
    try {
      // In production, this would send a magic link to the supplier's email
      // For demo, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuthStep('verification');
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (_code: string) => {
    setLoading(true);
    try {
      // In production, this would verify the code and create a session
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSupplierSession({
        supplierId: 'verified-supplier',
        supplierName: 'Verified Supplier',
        supplierEmail: authEmail,
        authenticated: true
      });
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteModal = (rfq: RFQInvitation) => {
    setSelectedRFQ(rfq);
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = async (quoteData: any) => {
    try {
      // In production, this would submit the quote via the API

      // Update the RFQ status to submitted
      setRFQInvitations(prev => 
        prev.map(rfq => 
          rfq.id === quoteData.rfqId 
            ? { ...rfq, status: 'submitted' as const }
            : rfq
        )
      );
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        activeRFQs: prev.activeRFQs - 1,
        completedQuotes: prev.completedQuotes + 1
      } : null);
      
    } catch (error) {
      console.error('Failed to submit quote:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!supplierSession?.authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Supplier Portal</h1>
            <p className="text-gray-600">Access your supplier dashboard</p>
          </div>
          
          {authStep === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your registered email"
                />
              </div>
              <VelocityButton
                onClick={() => handleAuthentication(authEmail)}
                disabled={!authEmail || loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </VelocityButton>
              <p className="text-sm text-gray-500 text-center">
                We'll send you a secure login link via email
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <VelocityButton
                onClick={() => handleVerification(verificationCode)}
                disabled={!verificationCode || loading}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </VelocityButton>
              <button
                onClick={() => setAuthStep('email')}
                className="w-full text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to email
              </button>
            </div>
          )}
          
          {/* Demo Access Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <VelocityButton
              onClick={() => setSupplierSession({
                supplierId: 'demo-supplier',
                supplierName: 'Demo Supplier',
                supplierEmail: 'demo@supplier.com',
                authenticated: true
              })}
              variant="outline"
              className="w-full"
            >
              Continue as Demo Supplier
            </VelocityButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Portal</h1>
              <p className="text-gray-600">Welcome, {supplierSession.supplierName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
                {stats?.activeRFQs && stats.activeRFQs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {stats.activeRFQs}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{supplierSession.supplierEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { key: 'rfqs', label: 'RFQ Invitations', icon: FileText },
              { key: 'profile', label: 'Company Profile', icon: User },
              { key: 'performance', label: 'Performance', icon: Award },
              { key: 'documents', label: 'Documents', icon: Upload },
              { key: 'messages', label: 'Messages', icon: MessageSquare }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {key === 'rfqs' && stats?.activeRFQs && stats.activeRFQs > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                    {stats.activeRFQs}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab stats={stats} rfqInvitations={rfqInvitations} onOpenQuoteModal={handleOpenQuoteModal} />
        )}
        {activeTab === 'rfqs' && (
          <RFQsTab rfqInvitations={rfqInvitations} onOpenQuoteModal={handleOpenQuoteModal} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab supplier={supplier} />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab supplier={supplier} stats={stats} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab />
        )}
        {activeTab === 'messages' && (
          <MessagesTab />
        )}
      </div>

      {/* Quote Submission Modal */}
      <QuoteSubmissionModal
        rfq={selectedRFQ}
        isOpen={showQuoteModal}
        onClose={() => {
          setShowQuoteModal(false);
          setSelectedRFQ(null);
        }}
        onSubmit={handleSubmitQuote}
      />
    </div>
  );
};

// Dashboard Tab Component
interface DashboardTabProps {
  stats: SupplierStats | null;
  rfqInvitations: RFQInvitation[];
  onOpenQuoteModal: (rfq: RFQInvitation) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ stats, rfqInvitations, onOpenQuoteModal }) => {
  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'awarded': return <Award className="h-4 w-4 text-blue-500" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeRFQs || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Quotes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedQuotes || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.averageScore || 0}/5</p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.winRate || 0}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-500" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent RFQs */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent RFQ Invitations</h3>
            <span className="text-sm text-gray-500">{rfqInvitations.length} active</span>
          </div>
          <div className="space-y-3">
            {rfqInvitations.slice(0, 3).map((rfq) => (
              <div key={rfq.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rfq.title}</h4>
                  <p className="text-sm text-gray-600">{rfq.projectName}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(rfq.urgency)}`}>
                      {rfq.urgency}
                    </span>
                    <span className="text-xs text-gray-500">Due: {new Date(rfq.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(rfq.status)}
                  <VelocityButton size="sm">View</VelocityButton>
                  {rfq.status === 'pending' && (
                    <VelocityButton size="sm" onClick={() => onOpenQuoteModal(rfq)}>
                      Quote
                    </VelocityButton>
                  )}
                </div>
              </div>
            ))}
          </div>
          {rfqInvitations.length > 3 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all RFQs →
              </button>
            </div>
          )}
        </GlassCard>

        {/* Compliance Status */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Overall Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats ? getComplianceColor(stats.complianceStatus) : 'text-gray-500 bg-gray-50'
              }`}>
                {stats?.complianceStatus || 'Unknown'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tax Compliance</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">BEE Certificate</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Insurance</span>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
            
            {stats?.documentsExpiring && stats.documentsExpiring > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {stats.documentsExpiring} document(s) expiring soon
                  </span>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// RFQs Tab Component
interface RFQsTabProps {
  rfqInvitations: RFQInvitation[];
  onOpenQuoteModal: (rfq: RFQInvitation) => void;
}

const RFQsTab: React.FC<RFQsTabProps> = ({ rfqInvitations, onOpenQuoteModal }) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'awarded': return <Award className="h-4 w-4 text-blue-500" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">RFQ Invitations</h2>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>All Status</option>
            <option>Pending</option>
            <option>Submitted</option>
            <option>Awarded</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {rfqInvitations.map((rfq) => (
          <GlassCard key={rfq.id}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{rfq.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(rfq.urgency)}`}>
                    {rfq.urgency}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{rfq.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">RFQ Number:</span>
                    <p className="font-medium">{rfq.rfqNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <p className="font-medium">{rfq.projectName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <p className="font-medium">{new Date(rfq.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Est. Value:</span>
                    <p className="font-medium">R{rfq.estimatedValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                {getStatusIcon(rfq.status)}
                <span className="text-sm font-medium text-gray-700 capitalize">{rfq.status}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <VelocityButton size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </VelocityButton>
                {rfq.status === 'pending' && (
                  <VelocityButton size="sm" onClick={() => onOpenQuoteModal(rfq)}>
                    Submit Quote
                  </VelocityButton>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {rfq.status === 'pending' 
                  ? `${Math.ceil((new Date(rfq.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`
                  : 'Completed'
                }
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// Profile Tab Component
interface ProfileTabProps {
  supplier: Supplier | null;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ supplier }) => {
  const [editing, setEditing] = useState(false);
  const [profileData] = useState(supplier);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
        <VelocityButton
          onClick={() => setEditing(!editing)}
          variant={editing ? 'outline' : 'solid'}
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </VelocityButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={profileData?.name || ''}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg ${
                  editing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input
                type="text"
                value={profileData?.code || ''}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg ${
                  editing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Type</label>
              <select
                value={profileData?.businessType || ''}
                disabled={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg ${
                  editing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <option value="manufacturer">Manufacturer</option>
                <option value="distributor">Distributor</option>
                <option value="service_provider">Service Provider</option>
                <option value="contractor">Contractor</option>
              </select>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Contact</label>
              <input
                type="text"
                value={profileData?.primaryContact?.name || ''}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg ${
                  editing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={profileData?.primaryContact?.email || ''}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg ${
                  editing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={profileData?.primaryContact?.phone || ''}
                readOnly={!editing}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg ${
                  editing ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {editing && (
        <div className="flex justify-end space-x-3">
          <VelocityButton variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </VelocityButton>
          <VelocityButton onClick={() => setEditing(false)}>
            Save Changes
          </VelocityButton>
        </div>
      )}
    </div>
  );
};

// Performance Tab Component
interface PerformanceTabProps {
  supplier: Supplier | null;
  stats: SupplierStats | null;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ supplier, stats }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{stats?.averageScore || 0}/5</div>
            <div className="text-sm text-gray-600">Based on {supplier?.rating && typeof supplier.rating === 'object' ? supplier.rating.totalReviews : 0} reviews</div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span>4.5/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quality</span>
                <span>4.2/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Communication</span>
                <span>4.0/5</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Win Rate</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{stats?.winRate || 0}%</div>
            <div className="text-sm text-gray-600">Last 12 months</div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Bids</span>
                <span>34</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Won</span>
                <span>23</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Value</span>
                <span>R125k</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="text-sm">
                <div className="font-medium">Quote Submitted</div>
                <div className="text-gray-500">RFQ-2024-003 • 2 days ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="h-4 w-4 text-blue-500" />
              <div className="text-sm">
                <div className="font-medium">Contract Awarded</div>
                <div className="text-gray-500">RFQ-2024-001 • 1 week ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Upload className="h-4 w-4 text-gray-500" />
              <div className="text-sm">
                <div className="font-medium">Document Updated</div>
                <div className="text-gray-500">Tax Certificate • 2 weeks ago</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// Documents Tab Component
interface DocumentsTabProps {}

const DocumentsTab: React.FC<DocumentsTabProps> = () => {
  const [documents] = useState<SupplierDocument[]>([
    {
      id: '1',
      type: DocumentType.TAX_CLEARANCE,
      name: 'Tax Clearance Certificate',
      url: '#',
      expiryDate: '2024-12-31',
      uploadedDate: '2024-01-15',
      uploadedBy: 'system',
      status: 'approved'
    },
    {
      id: '2',
      type: DocumentType.BEE_CERTIFICATE,
      name: 'BEE Certificate Level 4',
      url: '#',
      expiryDate: '2025-03-15',
      uploadedDate: '2024-03-01',
      uploadedBy: 'system',
      status: 'approved'
    },
    {
      id: '3',
      type: DocumentType.INSURANCE,
      name: 'Public Liability Insurance',
      url: '#',
      expiryDate: '2024-09-30',
      uploadedDate: '2023-09-15',
      uploadedBy: 'system',
      status: 'pending'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'expired': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDocumentIcon = (_type: string) => {
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Document Management</h2>
        <VelocityButton>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </VelocityButton>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <GlassCard key={doc.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getDocumentIcon(doc.type)}
                <div>
                  <h3 className="font-medium text-gray-900">{doc.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}</span>
                    {doc.expiryDate && (
                      <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status || 'pending')}`}>
                  {doc.status}
                </span>
                <VelocityButton size="sm" variant="outline">
                  View
                </VelocityButton>
                <VelocityButton size="sm">
                  Replace
                </VelocityButton>
              </div>
            </div>
            {doc.expiryDate && new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                This document expires soon. Please upload a renewed version.
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// Messages Tab Component
const MessagesTab: React.FC = () => {
  const [messages] = useState([
    {
      id: '1',
      from: 'Procurement Team',
      subject: 'RFQ-2024-001 Clarification Required',
      content: 'We need clarification on the delivery timeline for fiber optic cables...',
      date: '2024-08-20',
      read: false
    },
    {
      id: '2',
      from: 'Project Manager',
      subject: 'Payment Terms Update',
      content: 'Please review the updated payment terms for your recent submission...',
      date: '2024-08-18',
      read: true
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
        <VelocityButton>
          <MessageSquare className="h-4 w-4 mr-2" />
          New Message
        </VelocityButton>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <GlassCard key={message.id} className={!message.read ? 'ring-2 ring-blue-100' : ''}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className={`font-medium ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {message.subject}
                  </h3>
                  {!message.read && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">From: {message.from}</p>
                <p className="text-gray-700">{message.content}</p>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(message.date).toLocaleDateString()}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default SupplierPortalPage;