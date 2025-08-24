/**
 * Notes Section
 * Notes, tags, and additional information
 */

import { FileText, Tag } from 'lucide-react';
import { ContractorSectionProps } from './types';

export function NotesSection({ contractor }: ContractorSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Notes & Additional Information</h3>
      </div>
      
      {contractor.tags && contractor.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {contractor.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {contractor.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-900 whitespace-pre-wrap">{contractor.notes}</p>
            </div>
          </div>
        )}
        
        {contractor.specializations && contractor.specializations.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
            <div className="flex flex-wrap gap-2">
              {contractor.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {contractor.certifications && contractor.certifications.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
            <div className="space-y-2">
              {contractor.certifications.map((cert, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-900">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}