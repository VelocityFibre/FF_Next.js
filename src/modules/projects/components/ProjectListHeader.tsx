'use client';

import { Plus, Download, Upload } from 'lucide-react';
import { useRouter } from 'next/router';

interface ProjectListHeaderProps {
  onImport?: () => void;
  onExport?: () => void;
  projectCount?: number;
}

export function ProjectListHeader({ onImport, onExport, projectCount = 0 }: ProjectListHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your fibre installation projects
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {onImport && (
            <button
              onClick={onImport}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
          )}
          
          {onExport && projectCount > 0 && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
          
          <button
            onClick={() => router.push('/projects/new')}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>
      </div>
    </div>
  );
}