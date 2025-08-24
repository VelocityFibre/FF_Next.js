/**
 * BOQ Card Component
 */

import { useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Edit3,
  Download,
  Archive,
  Trash2,
  FileText,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { BOQ } from '@/types/procurement/boq.types';
import { BOQ_STATUS_COLORS, MAPPING_STATUS_COLORS } from './BOQListTypes';

interface BOQCardProps {
  boq: BOQ;
  isSelected?: boolean;
  onClick?: () => void;
  onView: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onArchive: () => void;
  onDelete: () => void;
  actionMenuOpen: boolean;
  setActionMenuOpen: (open: boolean) => void;
}

export default function BOQCard({
  boq,
  isSelected = false,
  onClick,
  onView,
  onEdit,
  onDownload,
  onArchive,
  onDelete,
  actionMenuOpen,
  setActionMenuOpen
}: BOQCardProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(false);
      }
    };

    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {}; // Return empty cleanup for all paths
  }, [actionMenuOpen, setActionMenuOpen]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mapped':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'mapping':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'exception':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {boq.title || boq.fileName}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  BOQ_STATUS_COLORS[boq.status]
                }`}>
                  {boq.status.charAt(0).toUpperCase() + boq.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">v{boq.version}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(boq.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {boq.uploadedBy}
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {boq.itemCount || 0} items
            </div>
          </div>

          {boq.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {boq.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                {getStatusIcon(boq.mappingStatus || 'pending')}
                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                  MAPPING_STATUS_COLORS[boq.mappingStatus || 'pending']
                }`}>
                  {boq.mappingStatus || 'Pending'}
                </span>
              </div>
              
              {(boq as any).mappingProgress !== undefined && (
                <div className="text-sm text-gray-500">
                  {Math.round((boq as any).mappingProgress)}% mapped
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {(boq as any).mappingProgress !== undefined && (
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(boq as any).mappingProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative ml-4" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActionMenuOpen(!actionMenuOpen);
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {actionMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-3" />
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-3" />
                  Edit BOQ
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Download className="h-4 w-4 mr-3" />
                  Download
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Archive className="h-4 w-4 mr-3" />
                  Archive
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}