import { AlertCircle } from 'lucide-react';

export function EmptyTeamView() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Selected</h3>
      <p className="text-gray-600">Select a team from the list to view details and manage members.</p>
    </div>
  );
}