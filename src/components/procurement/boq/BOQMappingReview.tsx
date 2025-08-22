/**
 * BOQ Mapping Review Component
 * Interface for reviewing and approving catalog mappings after BOQ import
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown,
  ExternalLink,
  Eye,
  Save,
  SkipForward,
  AlertCircle,
  Loader2,
  Check,
  RefreshCw
} from 'lucide-react';
import { BOQException, BOQItem, MappingSuggestion, BOQ, BOQItemMappingStatusType } from '@/types/procurement/boq.types';
import { useProcurementContext } from '@/hooks/procurement/useProcurementContext';
import { procurementApiService } from '@/services/procurement/procurementApiService';
import toast from 'react-hot-toast';

interface BOQMappingReviewProps {
  boqId: string;
  onMappingComplete?: (updatedItems: number) => void;
  onClose?: () => void;
  className?: string;
}

interface ExceptionWithItem extends BOQException {
  boqItem: BOQItem;
  suggestions: MappingSuggestion[];
}

interface FilterState {
  severity: string;
  status: string;
  exceptionType: string;
  search: string;
}

type SortField = 'lineNumber' | 'severity' | 'confidence' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const INITIAL_FILTERS: FilterState = {
  severity: '',
  status: '',
  exceptionType: '',
  search: ''
};

export default function BOQMappingReview({ 
  boqId, 
  onMappingComplete, 
  onClose, 
  className 
}: BOQMappingReviewProps) {
  const { context } = useProcurementContext();
  const [boq, setBOQ] = useState<BOQ | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionWithItem[]>([]);
  const [selectedExceptions, setSelectedExceptions] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedException, setExpandedException] = useState<string | null>(null);

  // Load BOQ and exceptions
  useEffect(() => {
    loadData();
  }, [boqId, context]);

  const loadData = async () => {
    if (!context) return;

    try {
      setIsLoading(true);
      
      // Load BOQ details
      const boqData = await procurementApiService.getBOQ(context, boqId);
      setBOQ(boqData);

      // Load exceptions with related BOQ items
      const exceptionsData = await procurementApiService.getBOQExceptions(context, boqId);
      
      // Enhance exceptions with BOQ item data and suggestions
      const enhancedExceptions: ExceptionWithItem[] = await Promise.all(
        exceptionsData.map(async (exception) => {
          const boqItem = await procurementApiService.getBOQItem(context, exception.boqItemId);
          
          // Generate fresh suggestions if none exist
          let suggestions = exception.systemSuggestions || [];
          if (suggestions.length === 0) {
            suggestions = await generateMappingSuggestions(boqItem);
          }

          return {
            ...exception,
            boqItem,
            suggestions
          };
        })
      );

      setExceptions(enhancedExceptions);
    } catch (error) {
      console.error('Failed to load mapping review data:', error);
      toast.error('Failed to load mapping data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mapping suggestions for an item
  const generateMappingSuggestions = async (boqItem: BOQItem): Promise<MappingSuggestion[]> => {
    try {
      // This would call the catalog matching service
      // For now, return mock suggestions
      return [
        {
          catalogItemId: 'cat-001',
          catalogItemCode: 'FBC-50-SM',
          catalogItemName: 'Fiber Optic Cable, Single Mode, 50 Core',
          confidence: 85,
          matchingCriteria: {
            descriptionMatch: 80,
            codeMatch: 90,
            specificationMatch: 85
          },
          priceEstimate: 25.50,
          leadTimeEstimate: 14
        },
        {
          catalogItemId: 'cat-002',
          catalogItemCode: 'FBC-48-SM',
          catalogItemName: 'Fiber Optic Cable, Single Mode, 48 Core',
          confidence: 75,
          matchingCriteria: {
            descriptionMatch: 85,
            codeMatch: 70,
            specificationMatch: 75
          },
          priceEstimate: 24.00,
          leadTimeEstimate: 10
        }
      ];
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  };

  // Filter and sort exceptions
  const filteredAndSortedExceptions = useMemo(() => {
    let filtered = exceptions.filter(exception => {
      // Apply filters
      if (filters.severity && exception.severity !== filters.severity) return false;
      if (filters.status && exception.status !== filters.status) return false;
      if (filters.exceptionType && exception.exceptionType !== filters.exceptionType) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          exception.boqItem.description.toLowerCase().includes(searchTerm) ||
          (exception.boqItem.itemCode?.toLowerCase().includes(searchTerm)) ||
          exception.issueDescription.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });

    // Sort exceptions
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'lineNumber':
          aVal = a.boqItem.lineNumber;
          bVal = b.boqItem.lineNumber;
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aVal = severityOrder[a.severity];
          bVal = severityOrder[b.severity];
          break;
        case 'confidence':
          aVal = Math.max(...a.suggestions.map(s => s.confidence));
          bVal = Math.max(...b.suggestions.map(s => s.confidence));
          break;
        case 'createdAt':
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [exceptions, filters, sortField, sortDirection]);

  // Handle mapping approval
  const handleApproveMapping = async (exceptionId: string, suggestionIndex: number) => {
    if (!context) return;

    try {
      setIsProcessing(true);
      const exception = exceptions.find(e => e.id === exceptionId);
      if (!exception) return;

      const suggestion = exception.suggestions[suggestionIndex];
      
      // Update BOQ item with selected mapping
      await procurementApiService.updateBOQItem(context, exception.boqItemId, {
        catalogItemId: suggestion.catalogItemId,
        catalogItemCode: suggestion.catalogItemCode,
        catalogItemName: suggestion.catalogItemName,
        mappingConfidence: suggestion.confidence,
        mappingStatus: 'mapped' as BOQItemMappingStatusType
      });

      // Resolve exception
      await procurementApiService.updateBOQException(context, exceptionId, {
        status: 'resolved',
        resolvedBy: context.userId,
        resolvedAt: new Date(),
        resolutionAction: 'manual_mapping',
        resolutionNotes: `Mapped to ${suggestion.catalogItemCode} - ${suggestion.catalogItemName}`
      });

      // Remove from local state
      setExceptions(prev => prev.filter(e => e.id !== exceptionId));
      setSelectedExceptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(exceptionId);
        return newSet;
      });

      toast.success('Mapping approved successfully');
      onMappingComplete?.(1);
    } catch (error) {
      console.error('Failed to approve mapping:', error);
      toast.error('Failed to approve mapping');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle exception dismissal
  const handleDismissException = async (exceptionId: string, reason: string) => {
    if (!context) return;

    try {
      setIsProcessing(true);
      
      await procurementApiService.updateBOQException(context, exceptionId, {
        status: 'ignored',
        resolvedBy: context.userId,
        resolvedAt: new Date(),
        resolutionAction: 'item_ignore',
        resolutionNotes: reason
      });

      setExceptions(prev => prev.filter(e => e.id !== exceptionId));
      setSelectedExceptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(exceptionId);
        return newSet;
      });

      toast.success('Exception dismissed');
    } catch (error) {
      console.error('Failed to dismiss exception:', error);
      toast.error('Failed to dismiss exception');
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch approve selected mappings
  const handleBatchApprove = async () => {
    if (selectedExceptions.size === 0) return;

    try {
      setIsProcessing(true);
      let successCount = 0;

      for (const exceptionId of selectedExceptions) {
        const exception = exceptions.find(e => e.id === exceptionId);
        if (!exception || exception.suggestions.length === 0) continue;

        // Use best suggestion (highest confidence)
        const bestSuggestion = exception.suggestions.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );

        await handleApproveMapping(exceptionId, 0);
        successCount++;
      }

      toast.success(`${successCount} mappings approved`);
      setSelectedExceptions(new Set());
      onMappingComplete?.(successCount);
    } catch (error) {
      console.error('Failed to batch approve:', error);
      toast.error('Failed to approve selected mappings');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading mapping review...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">BOQ Mapping Review</h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve catalog mappings for {boq?.fileName}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="ml-2 text-sm font-medium text-gray-900">Total Exceptions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{exceptions.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="ml-2 text-sm font-medium text-gray-900">High Priority</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {exceptions.filter(e => e.severity === 'high' || e.severity === 'critical').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="ml-2 text-sm font-medium text-gray-900">With Suggestions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {exceptions.filter(e => e.suggestions.length > 0).length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-blue-500" />
            <span className="ml-2 text-sm font-medium text-gray-900">Selected</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{selectedExceptions.size}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Exception Type Filter */}
          <select
            value={filters.exceptionType}
            onChange={(e) => setFilters(prev => ({ ...prev, exceptionType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Types</option>
            <option value="no_match">No Match</option>
            <option value="multiple_matches">Multiple Matches</option>
            <option value="data_issue">Data Issue</option>
            <option value="manual_review">Manual Review</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBatchApprove}
              disabled={selectedExceptions.size === 0 || isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Approve Selected ({selectedExceptions.size})
            </button>
            
            <button
              onClick={() => setSelectedExceptions(new Set())}
              disabled={selectedExceptions.size === 0}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Clear Selection
            </button>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Exceptions List */}
      <div className="space-y-4">
        {filteredAndSortedExceptions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Exceptions Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {exceptions.length === 0 
                ? "All items have been successfully mapped to the catalog."
                : "No exceptions match your current filters."
              }
            </p>
          </div>
        ) : (
          filteredAndSortedExceptions.map((exception) => (
            <div
              key={exception.id}
              className="bg-white rounded-lg border hover:border-gray-300 transition-colors"
            >
              {/* Exception Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedExceptions.has(exception.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedExceptions);
                        if (e.target.checked) {
                          newSet.add(exception.id);
                        } else {
                          newSet.delete(exception.id);
                        }
                        setSelectedExceptions(newSet);
                      }}
                      className="rounded"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(exception.severity)}`}>
                        {exception.severity.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        Line {exception.boqItem.lineNumber}
                      </span>
                      {exception.boqItem.itemCode && (
                        <span className="text-sm text-gray-500">
                          {exception.boqItem.itemCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedException(
                      expandedException === exception.id ? null : exception.id
                    )}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedException === exception.id ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">
                    {exception.boqItem.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {exception.issueDescription}
                  </p>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedException === exception.id && (
                <div className="p-4 space-y-4">
                  {/* BOQ Item Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Item Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <span className="ml-1 font-medium">{exception.boqItem.quantity} {exception.boqItem.uom}</span>
                      </div>
                      {exception.boqItem.category && (
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1 font-medium">{exception.boqItem.category}</span>
                        </div>
                      )}
                      {exception.boqItem.phase && (
                        <div>
                          <span className="text-gray-500">Phase:</span>
                          <span className="ml-1 font-medium">{exception.boqItem.phase}</span>
                        </div>
                      )}
                      {exception.boqItem.task && (
                        <div>
                          <span className="text-gray-500">Task:</span>
                          <span className="ml-1 font-medium">{exception.boqItem.task}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mapping Suggestions */}
                  {exception.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Suggested Mappings</h4>
                      <div className="space-y-2">
                        {exception.suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {suggestion.catalogItemCode}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                                  {suggestion.confidence}% match
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {suggestion.catalogItemName}
                              </p>
                              {suggestion.priceEstimate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Est. Price: R{suggestion.priceEstimate} | 
                                  Lead Time: {suggestion.leadTimeEstimate} days
                                </p>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleApproveMapping(exception.id, index)}
                                disabled={isProcessing}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </button>
                              
                              <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50 flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDismissException(exception.id, "Manual review required")}
                        disabled={isProcessing}
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip for Now
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Created {exception.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredAndSortedExceptions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Mapping Review Tips</h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Review high-confidence suggestions first for quick approvals</li>
                  <li>Use batch approval for multiple similar items</li>
                  <li>Skip items that require detailed technical review</li>
                  <li>Contact procurement team for items with no suitable matches</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}