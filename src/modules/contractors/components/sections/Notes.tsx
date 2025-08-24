/**
 * Notes Section
 * Displays tags and notes for the contractor
 */

import { FileText } from 'lucide-react';
import { Contractor } from '@/types/contractor.types';

interface NotesProps {
  contractor: Contractor;
}

export function Notes({ contractor }: NotesProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Notes & Tags</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {contractor.tags && contractor.tags.length > 0 ? (
              contractor.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No tags</span>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <p className="text-gray-900 whitespace-pre-wrap">
            {contractor.notes || 'No notes available'}
          </p>
        </div>
      </div>
    </div>
  );
}