/**
 * Meeting Location Fields Component
 * Virtual meeting checkbox and conditional location/link fields
 */

import { UseFormRegister } from 'react-hook-form';

interface MeetingLocationFieldsProps {
  register: UseFormRegister<any>;
  isVirtual: boolean;
}

export function MeetingLocationFields({ register, isVirtual }: MeetingLocationFieldsProps) {
  return (
    <>
      <div>
        <div className="flex items-center mb-2">
          <input
            {...register('isVirtual')}
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm font-medium text-gray-700">
            Virtual Meeting
          </label>
        </div>
      </div>

      {isVirtual ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Link
          </label>
          <input
            {...register('meetingLink')}
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://meet.example.com/room"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            {...register('location')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Meeting location"
          />
        </div>
      )}
    </>
  );
}