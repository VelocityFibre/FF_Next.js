/**
 * Meeting Form Header Component
 * Header section with title and close button for meeting forms
 */

import { X } from 'lucide-react';

interface MeetingFormHeaderProps {
  isEditing: boolean;
  onClose: () => void;
}

export function MeetingFormHeader({ isEditing, onClose }: MeetingFormHeaderProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">
        {isEditing ? 'Edit Meeting' : 'New Meeting'}
      </h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}