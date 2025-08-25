import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building2,
  Phone,
  Mail,
  MoreVertical,
  Archive,
  Star,
  Reply
} from 'lucide-react';
import { useSuppliersPortal } from '../../context/SuppliersPortalContext';
import { cn } from '@/lib/utils';

// Message types
interface Message {
  id: string;
  threadId: string;
  subject: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: 'supplier' | 'internal';
    avatar?: string;
  };
  recipient: {
    id: string;
    name: string;
    role: 'supplier' | 'internal';
  };
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'replied';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'rfq' | 'contract' | 'quality' | 'delivery' | 'payment' | 'compliance';
  attachments: number;
  isRead: boolean;
  isStarred: boolean;
  supplierId: string;
  supplierName: string;
}

interface MessageThread {
  id: string;
  subject: string;
  participants: Array<{
    id: string;
    name: string;
    role: 'supplier' | 'internal';
  }>;
  lastMessage: Message;
  messageCount: number;
  unreadCount: number;
  isArchived: boolean;
  supplierId: string;
  supplierName: string;
}

// Status and priority configurations
const statusConfig = {
  sent: { label: 'Sent', icon: Clock, color: 'text-blue-600' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
  read: { label: 'Read', icon: CheckCircle, color: 'text-green-600' },
  replied: { label: 'Replied', icon: Reply, color: 'text-purple-600' }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-400' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-400' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800', dot: 'bg-red-400' }
};

const categoryConfig = {
  general: { label: 'General', color: 'bg-gray-100 text-gray-800' },
  rfq: { label: 'RFQ', color: 'bg-blue-100 text-blue-800' },
  contract: { label: 'Contract', color: 'bg-purple-100 text-purple-800' },
  quality: { label: 'Quality', color: 'bg-green-100 text-green-800' },
  delivery: { label: 'Delivery', color: 'bg-orange-100 text-orange-800' },
  payment: { label: 'Payment', color: 'bg-yellow-100 text-yellow-800' },
  compliance: { label: 'Compliance', color: 'bg-red-100 text-red-800' }
};

// Mock message data
const mockMessages: Message[] = [
  {
    id: 'msg-001',
    threadId: 'thread-001',
    subject: 'RFQ Response - Network Security Equipment',
    content: 'Thank you for the RFQ opportunity. We have reviewed the requirements and are pleased to submit our comprehensive proposal. Our solution includes enterprise-grade firewalls with advanced threat protection capabilities.',
    sender: {
      id: 'contact-001',
      name: 'Sarah Johnson',
      role: 'supplier'
    },
    recipient: {
      id: 'user-001',
      name: 'John Smith',
      role: 'internal'
    },
    timestamp: '2024-01-22T14:30:00Z',
    status: 'read',
    priority: 'high',
    category: 'rfq',
    attachments: 2,
    isRead: true,
    isStarred: true,
    supplierId: 'supplier-001',
    supplierName: 'TechFlow Solutions'
  },
  {
    id: 'msg-002',
    threadId: 'thread-002',
    subject: 'Delivery Schedule Update',
    content: 'We wanted to provide an update on the steel materials delivery. Due to improved production efficiency, we can deliver 2 days ahead of the original schedule.',
    sender: {
      id: 'contact-002',
      name: 'Michael Chen',
      role: 'supplier'
    },
    recipient: {
      id: 'user-002',
      name: 'Project Manager',
      role: 'internal'
    },
    timestamp: '2024-01-22T10:15:00Z',
    status: 'delivered',
    priority: 'medium',
    category: 'delivery',
    attachments: 0,
    isRead: false,
    isStarred: false,
    supplierId: 'supplier-002',
    supplierName: 'Global Materials Inc'
  },
  {
    id: 'msg-003',
    threadId: 'thread-003',
    subject: 'Contract Amendment Request',
    content: 'Following our recent discussion, we would like to propose amendments to the service level agreements to better align with current market conditions.',
    sender: {
      id: 'contact-003',
      name: 'Emma Thompson',
      role: 'supplier'
    },
    recipient: {
      id: 'user-003',
      name: 'Legal Team',
      role: 'internal'
    },
    timestamp: '2024-01-21T16:45:00Z',
    status: 'replied',
    priority: 'high',
    category: 'contract',
    attachments: 1,
    isRead: true,
    isStarred: false,
    supplierId: 'supplier-003',
    supplierName: 'Premium Services Ltd'
  }
];

// Message thread component
interface MessageThreadProps {
  thread: MessageThread;
  isSelected: boolean;
  onClick: () => void;
}

function MessageThreadItem({ thread, isSelected, onClick }: MessageThreadProps) {
  const priority = priorityConfig[thread.lastMessage.priority];
  const category = categoryConfig[thread.lastMessage.category];
  const status = statusConfig[thread.lastMessage.status];
  const StatusIcon = status.icon;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className={cn(
        "p-4 border-b border-gray-200 cursor-pointer transition-all hover:bg-gray-50",
        isSelected ? "bg-blue-50 border-blue-200" : ""
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={cn("font-medium text-sm truncate", !thread.lastMessage.isRead ? "text-gray-900" : "text-gray-700")}>
                  {thread.supplierName}
                </h3>
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", priority.dot)} />
                {thread.lastMessage.isStarred && (
                  <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                )}
              </div>
              
              <p className={cn("text-sm font-medium truncate", !thread.lastMessage.isRead ? "text-gray-900" : "text-gray-600")}>
                {thread.subject}
              </p>
              
              <p className="text-sm text-gray-500 truncate mt-1">
                {thread.lastMessage.content}
              </p>
              
              <div className="flex items-center space-x-2 mt-2">
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", category.color)}>
                  {category.label}
                </span>
                {thread.lastMessage.attachments > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Paperclip className="w-3 h-3 mr-1" />
                    {thread.lastMessage.attachments}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs text-gray-500 mb-1">
                {formatTime(thread.lastMessage.timestamp)}
              </div>
              
              <div className="flex items-center justify-end space-x-1">
                <StatusIcon className={cn("w-3 h-3", status.color)} />
                {thread.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Message detail view component
function MessageDetailView({ thread }: { thread: MessageThread | null }) {
  const [newMessage, setNewMessage] = useState('');
  
  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
          <p className="text-gray-600">Choose a message thread to view and respond to communications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{thread.subject}</h2>
              <p className="text-sm text-gray-600">{thread.supplierName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
              <Star className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm text-gray-900">{thread.lastMessage.sender.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(thread.lastMessage.timestamp).toLocaleString()}
                </span>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", priorityConfig[thread.lastMessage.priority].color)}>
                  {priorityConfig[thread.lastMessage.priority].label}
                </span>
              </div>
              <p className="text-sm text-gray-700">{thread.lastMessage.content}</p>
              
              {thread.lastMessage.attachments > 0 && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{thread.lastMessage.attachments} attachment(s)</span>
                    <button className="text-sm text-blue-600 hover:text-blue-700">Download</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Box */}
      <div className="p-6 border-t border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>
            
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="general">General</option>
              <option value="rfq">RFQ</option>
              <option value="contract">Contract</option>
              <option value="quality">Quality</option>
              <option value="delivery">Delivery</option>
              <option value="payment">Payment</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
          
          <div className="border border-gray-300 rounded-lg">
            <textarea
              className="w-full p-3 border-0 resize-none focus:outline-none focus:ring-0"
              rows={4}
              placeholder="Type your reply..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
                  Save Draft
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center space-x-2"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessagesTab() {
  const { selectedSupplier } = useSuppliersPortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);

  // Convert messages to threads
  const messageThreads: MessageThread[] = useMemo(() => {
    return mockMessages.map(message => ({
      id: message.threadId,
      subject: message.subject,
      participants: [message.sender, message.recipient],
      lastMessage: message,
      messageCount: 1,
      unreadCount: message.isRead ? 0 : 1,
      isArchived: false,
      supplierId: message.supplierId,
      supplierName: message.supplierName
    }));
  }, []);

  // Filter threads based on selected supplier and other filters
  const filteredThreads = useMemo(() => {
    let filtered = messageThreads;

    // Filter by selected supplier
    if (selectedSupplier) {
      filtered = filtered.filter(thread => thread.supplierId === selectedSupplier.id);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(thread => 
        thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(thread => thread.lastMessage.category === categoryFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(thread => thread.lastMessage.priority === priorityFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(thread => thread.lastMessage.status === statusFilter);
    }

    return filtered;
  }, [messageThreads, selectedSupplier, searchTerm, categoryFilter, priorityFilter, statusFilter]);

  if (!selectedSupplier) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Supplier</h3>
        <p className="text-gray-600">
          Choose a supplier from the Company Profile tab to view message history and communicate with them.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[800px] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex h-full">
        {/* Messages List */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                <Send className="w-4 h-4 inline mr-1" />
                New
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <select
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              
              <select
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Message Threads */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <MessageThreadItem
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThread?.id === thread.id}
                  onClick={() => setSelectedThread(thread)}
                />
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <MessageDetailView thread={selectedThread} />
      </div>
    </div>
  );
}

export default MessagesTab;