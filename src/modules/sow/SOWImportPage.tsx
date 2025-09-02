import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SOWUploadWizard } from '@/components/sow/SOWUploadWizard';
import { SOWProjectSelector } from './components/SOWProjectSelector';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import type { Project } from '@/types/project.types';

export function SOWImportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const projectName = searchParams.get('projectName') || 'Current Project';
  const [showWizard, setShowWizard] = useState(false);

  // Delay showing the wizard to avoid immediate database calls
  useEffect(() => {
    if (projectId) {
      const timer = setTimeout(() => setShowWizard(true), 100);
      return () => clearTimeout(timer);
    }
  }, [projectId]);

  const handleComplete = () => {
    if (projectId) {
      navigate(`/app/projects/${projectId}`);
    } else {
      navigate('/app/sow');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProjectSelect = (project: Project) => {
    // Navigate to the same page with the selected project
    navigate(`/app/sow/import?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}`);
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={() => navigate('/app/sow')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to SOW List
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Import SOW Data</h1>
            <p className="text-gray-600 mt-1">Select a project to import scope of work data</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Project</h2>
                <p className="text-gray-600">
                  Choose the project you want to import SOW data for
                </p>
              </div>

              <SOWProjectSelector 
                onProjectSelect={handleProjectSelect}
                className="mx-auto max-w-sm"
              />

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  You can import Excel files containing scope of work details, schedules, and other project data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Import SOW Data</h1>
          <p className="text-gray-600 mt-1">Upload Excel files containing project scope of work data</p>
        </div>
      </div>

      {showWizard && (
        <SOWUploadWizard
          projectId={projectId}
          projectName={projectName}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}