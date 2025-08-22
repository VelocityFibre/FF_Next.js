import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Meeting } from '../types/meeting.types';

interface MeetingFormProps {
  meeting?: Meeting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Partial<Meeting>) => void;
}

type FormData = Omit<Meeting, 'id' | 'actionItems'> & {
  actionItems: string[];
};

export function MeetingForm({ meeting, isOpen, onClose, onSave }: MeetingFormProps) {
  const [agendaItems, setAgendaItems] = useState<string[]>(meeting?.agenda || ['']);
  const [participants, setParticipants] = useState<string[]>(meeting?.participants || ['']);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: meeting ? {
      ...meeting,
      date: meeting.date,
      actionItems: meeting.actionItems.map(ai => ai.task)
    } : {
      type: 'team',
      isVirtual: false,
      status: 'scheduled'
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: FormData) => {
    const meetingData: Partial<Meeting> = {
      ...data,
      agenda: agendaItems.filter(item => item.trim()),
      participants: participants.filter(p => p.trim()),
      actionItems: meeting?.actionItems || []
    };
    
    onSave(meetingData);
    onClose();
  };

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, '']);
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (index: number, value: string) => {
    const newItems = [...agendaItems];
    newItems[index] = value;
    setAgendaItems(newItems);
  };

  const addParticipant = () => {
    setParticipants([...participants, '']);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const isVirtual = watch('isVirtual');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {meeting ? 'Edit Meeting' : 'New Meeting'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meeting title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="team">Team Meeting</option>
                <option value="client">Client Meeting</option>
                <option value="board">Board Meeting</option>
                <option value="standup">Standup</option>
                <option value="review">Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                {...register('date', { required: 'Date is required' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                {...register('time', { required: 'Time is required' })}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                {...register('duration')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1h 30min"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizer
              </label>
              <input
                {...register('organizer')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Meeting organizer"
              />
            </div>
          </div>

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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Agenda Items
              </label>
              <button
                type="button"
                onClick={addAgendaItem}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>
            <div className="space-y-2">
              {agendaItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    value={item}
                    onChange={(e) => updateAgendaItem(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Agenda item"
                  />
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Participants
              </label>
              <button
                type="button"
                onClick={addParticipant}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Participant
              </button>
            </div>
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    value={participant}
                    onChange={(e) => updateParticipant(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Participant name or email"
                  />
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {meeting ? 'Update Meeting' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}