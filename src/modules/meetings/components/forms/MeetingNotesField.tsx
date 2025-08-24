/**
 * Meeting Notes Field Component
 * Notes textarea field for additional meeting information
 */

import { UseFormRegister } from 'react-hook-form';

interface MeetingNotesFieldProps {
  register: UseFormRegister<any>;
}

export function MeetingNotesField({ register }: MeetingNotesFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Notes
      </label>
      <textarea
        {...register('notes')}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Additional meeting notes"
      />
    </div>
  );
}