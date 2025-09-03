/**
 * Module Status Notice Component
 * Displays development status information for the procurement module
 */

import { CheckCircle } from 'lucide-react';

export function ModuleStatusNotice() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Module Structure Complete
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              The procurement module structure and navigation are now ready. 
              Individual components will be implemented in subsequent phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}