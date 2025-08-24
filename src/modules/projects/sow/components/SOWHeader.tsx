import { Upload, FileText } from 'lucide-react';

export function SOWHeader() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">SOW Management</h1>
          <p className="text-neutral-600 mt-1">Manage Statements of Work and project contracts</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import SOW
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            New SOW
          </button>
        </div>
      </div>
    </div>
  );
}